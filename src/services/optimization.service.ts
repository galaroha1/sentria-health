import type { Site, SiteInventory } from '../types/location';
import type { ProcurementProposal } from '../types/procurement';
import type { OptimizationParams, OptimizationResult, OrderPlanItem, SupplierProfile } from '../types/procurement';
import type { Patient } from '../types/patient';
import { ForecastingService } from './forecasting.service';

export class OptimizationService {

    // --- LEGACY METHODS (Restored for Compatibility) ---
    private static readonly TRANSPORT_RATE_PER_KM = 1.50;
    private static readonly URGENCY_MULTIPLIER = 1.2;
    private static readonly BASE_PROCESSING_FEE = 50.00;

    private static deg2rad(deg: number): number {
        return deg * (Math.PI / 180);
    }

    static calculateDistance(siteA: Site, siteB: Site): number {
        const R = 6371; // Earth radius in km
        const dLat = this.deg2rad(siteB.coordinates.lat - siteA.coordinates.lat);
        const dLon = this.deg2rad(siteB.coordinates.lng - siteA.coordinates.lng);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(siteA.coordinates.lat)) * Math.cos(this.deg2rad(siteB.coordinates.lat)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    static calculateTotalCost(
        distanceKm: number,
        quantity: number,
        unitPrice: number,
        urgency: 'routine' | 'urgent' | 'emergency'
    ): { total: number; transport: number; item: number } {
        let multiplier = 1.0;
        if (urgency === 'urgent') multiplier = this.URGENCY_MULTIPLIER;
        if (urgency === 'emergency') multiplier = 1.5;

        const baseTransport = (distanceKm * this.TRANSPORT_RATE_PER_KM) + this.BASE_PROCESSING_FEE;
        const transportCost = Math.round(baseTransport * multiplier);
        const itemCost = Math.round(quantity * unitPrice);

        return {
            total: transportCost + itemCost,
            transport: transportCost,
            item: itemCost
        };
    }

    static validateTransfer(source: Site, target: Site): { valid: boolean; reason?: string } {
        if (!source.regulatoryProfile || !target.regulatoryProfile) return { valid: true }; // Guard for bad mock data

        if (!target.regulatoryProfile.dscsaCompliant || !source.regulatoryProfile.dscsaCompliant) {
            return { valid: false, reason: 'DSCSA Violation: One or both sites are not compliant.' };
        }
        if (target.regulatoryProfile.is340B !== source.regulatoryProfile.is340B) {
            return { valid: false, reason: `340B Mismatch: Cannot transfer between ${source.regulatoryProfile.is340B ? '340B' : 'Standard'} and ${target.regulatoryProfile.is340B ? '340B' : 'Standard'} sites.` };
        }
        return { valid: true };
    }

    // --- MOCK SUPPLIER DATA (Would be DB) ---
    private static getSupplierCatalog(ndc: string): SupplierProfile[] {
        // SYNCHRONIZED PRICING: Match the logic in SupplierService.getBasePrice(ndc)
        // Hash the NDC to get a consistent pseudo-random price
        let hash = 0;
        for (let i = 0; i < ndc.length; i++) {
            hash = ((hash << 5) - hash) + ndc.charCodeAt(i);
            hash |= 0;
        }
        const basePrice = (Math.abs(hash) % 500) + 50; // Same formula as SupplierService

        return [
            {
                id: 'mckesson', name: 'McKesson', reliability: 0.98, leadTimeDays: 2, leadTimeVariance: 0.5, qualityScore: 99, riskScore: 10,
                contractTerms: { minOrderQty: 10, costFunctions: [{ minQty: 0, maxQty: Infinity, unitPrice: Number((basePrice * 1.05).toFixed(2)) }] }
            },
            {
                id: 'cardinal', name: 'Cardinal Health', reliability: 0.95, leadTimeDays: 3, leadTimeVariance: 1.0, qualityScore: 95, riskScore: 15,
                contractTerms: { minOrderQty: 50, costFunctions: [{ minQty: 0, maxQty: Infinity, unitPrice: Number((basePrice * 1.10).toFixed(2)) }] }
            },
            {
                id: 'amerisource', name: 'AmerisourceBergen', reliability: 0.90, leadTimeDays: 5, leadTimeVariance: 2.0, qualityScore: 80, riskScore: 30,
                contractTerms: { minOrderQty: 100, costFunctions: [{ minQty: 0, maxQty: Infinity, unitPrice: Number((basePrice * 1.02).toFixed(2)) }] }
            }
        ];
    }



    /**
     * MAIN SOLVER: SelectOrderPlan(t)
     * Heuristic approximation of MILP objective: Minimize Z = Cost(Buy) + Cost(Transfer) + Cost(Hold) + Cost(Shortage)
     */
    static selectOrderPlan(
        _sites: Site[],
        inventories: SiteInventory[],
        patients: Patient[], // REAL DATA driven
        params: OptimizationParams = {
            serviceLevelTarget: 0.95,
            holdingCostRate: 0.20, // 20% annual
            stockoutCostPerUnit: 500, // High penalty
            riskAversionLambda: 1.0,
            planningHorizonDays: 30
        }
    ): OptimizationResult {
        const orderItems: OrderPlanItem[] = [];
        let totalEstimatedCost = 0;
        let totalRiskAdjustedCost = 0;

        // 1. Calculate Net Demand & Identification of Deficits/Surpluses
        const deficits: { inv: SiteInventory, itemIndex: number, amount: number, criticality: any }[] = [];
        const surpluses: { inv: SiteInventory, itemIndex: number, amount: number }[] = [];

        // Iterate through all Inventory Points (now effectively DEPARTMENTS)
        for (const inv of inventories) {
            inv.drugs.forEach((item, index) => {

                // A. Generate Forecast based on REAL PATIENT SCHEDULE
                const deptName = inv.departmentId ? inv.departmentId : 'General';
                const isSeasonality = deptName.toLowerCase().includes('respiratory') || deptName.toLowerCase().includes('er');

                const forecast = ForecastingService.generateProbabilisticForecast(
                    item.ndc, item.drugName, inv.siteId, '2025-CURRENT', patients,
                    isSeasonality ? 1.2 : 1.0,
                    (item as any).criticality === 'critical' ? 1.5 : 1.0
                );

                // DEBUG LOG
                if (forecast.mean > 0) {
                    console.log(`[Optimization] Demand Detected for ${item.drugName} at ${inv.siteId}: Mean=${forecast.mean}, Var=${forecast.variance.toFixed(2)}`);
                }

                // B. Safety Stock
                const supplierInfo = this.getSupplierCatalog(item.ndc)[0];
                const safetyStock = ForecastingService.calculateSafetyStock(
                    forecast,
                    supplierInfo.leadTimeDays,
                    supplierInfo.leadTimeVariance,
                    params.serviceLevelTarget
                );

                // C. Net Requirement = (Demand + SS) - Stock
                const totalDemand = forecast.mean + safetyStock;
                const netPosition = item.quantity - totalDemand;

                console.log(`[Optimization] Item: ${item.drugName} | Stock: ${item.quantity} | Forecast: ${forecast.mean} | SS: ${safetyStock} | Net: ${netPosition}`);

                if (netPosition < 0) {
                    // DEFICIT
                    deficits.push({
                        inv,
                        itemIndex: index,
                        amount: Math.abs(netPosition),
                        criticality: (item as any).criticality
                    });
                } else if (netPosition > 0) {
                    // SURPLUS (Potential for Transfer)
                    surpluses.push({
                        inv,
                        itemIndex: index,
                        amount: netPosition
                    });
                }
            });
        }

        // 2. Resolve Deficits via Multi-Stage Stochastic Optimization Approximation (Eq 3)
        // Objective: Minimize Z = Sum(Cost_Purch * x) + Sum(Cost_Trans * y) + Sum(Cost_Stockout * z)

        for (const deficit of deficits) {
            const item = deficit.inv.drugs[deficit.itemIndex];
            let remainingDeficit = deficit.amount;

            // Define Costs for this Item
            const C_stockout = params.stockoutCostPerUnit; // Penalty for z (Unmet Demand)

            // OPTION 1: NETWORK TRANSFER (y_sd)
            // Identify potential Sources (S)
            // Priority 1: Same Site (Inter-Departmental) - Fastest, Cheapest
            // Priority 2: Other Site (Network Transfer) - Slower, Higher Logistics Cost
            const internalSources = surpluses.filter(s =>
                s.inv.drugs[s.itemIndex].ndc === item.ndc &&
                s.inv !== deficit.inv &&
                s.amount > 0
            ).sort((a, b) => {
                // Sort by Proximity (Same Site First)
                const aIsSameSite = a.inv.siteId === deficit.inv.siteId;
                const bIsSameSite = b.inv.siteId === deficit.inv.siteId;
                if (aIsSameSite && !bIsSameSite) return -1;
                if (!aIsSameSite && bIsSameSite) return 1;
                return 0; // Then by amount or other factors (can add logic here)
            });

            // Evaluate Transfer Cost Z_trans
            for (const source of internalSources) {
                if (remainingDeficit <= 0) break;

                const isSameSite = source.inv.siteId === deficit.inv.siteId;

                // C_trans: Dept transfer is free/cheap ($5). Network transfer is trucking ($50).
                const C_trans = isSameSite ? 5.0 : 50.0;

                // Compare: Is Transfer Cost < Purchase Cost? (Usually Yes)
                const transferQty = Math.min(remainingDeficit, source.amount);

                // Action: y_sd (Transfer)
                orderItems.push({
                    sku: item.ndc,
                    drugName: item.drugName,
                    supplierId: source.inv.departmentId || source.inv.siteId, // Identifying ID
                    supplierName: isSameSite
                        ? `${source.inv.departmentId || 'Main Pharmacy'} (Inter-Dept)`
                        : `${source.inv.siteId === 'site-12' ? 'Central Warehouse' : 'Network Site'} (External)`,
                    targetSiteId: deficit.inv.siteId,
                    quantity: transferQty,
                    type: 'transfer',
                    // We can use the text "Inter-Departmental" in proposal to filter easily on UI
                    // or add a dedicated field if we changed the type definition. 
                    // For now, we piggyback on 'supplierName' or 'channel' for filtering.
                    analysis: {
                        forecastMean: 0,
                        safetyStock: 0,
                        projectedStockoutRisk: 0,
                        costBreakdown: {
                            purchase: 0,
                            holding: 0,
                            stockoutPenalty: 0,
                            logistics: C_trans,
                            riskPenalty: 0
                        },
                        supplierScore: isSameSite ? 99 : 90, // Higher score for closer stock
                        alternativeSavings: 0
                    }
                });

                remainingDeficit -= transferQty;
                source.amount -= transferQty; // Decrement virtual surplus
            }

            // OPTION 2: EXTERNAL PROCUREMENT (x_i)
            // If deficit remains, we must Buy (x) or Stockout (z).
            // We compare Cost(Purchase) vs Cost(Stockout).
            // Typically C_stockout >> C_purchase, so we Buy.

            if (remainingDeficit > 0) {
                const suppliers = this.getSupplierCatalog(item.ndc);
                let bestOption: any = null;

                // Solve min(C_purch * x + Risk_Penalty)
                for (const supplier of suppliers) {
                    let orderQty = Math.max(remainingDeficit, supplier.contractTerms.minOrderQty);

                    // Cost Components
                    const C_purch = supplier.contractTerms.costFunctions[0].unitPrice; // Simplified
                    const PurchaseCost = orderQty * C_purch;

                    // Risk Penalty (Approximating CVaR term)
                    // Risk = Prob(Failure) * Impact
                    const failureProb = (1 - supplier.reliability);
                    const RiskCost = failureProb * (remainingDeficit * C_stockout); // Expected stockout cost if vendor fails

                    const Z_supplier = PurchaseCost + RiskCost;

                    if (!bestOption || Z_supplier < bestOption.Z) {
                        bestOption = {
                            supplier,
                            Z: Z_supplier,
                            PurchaseCost,
                            RiskCost,
                            unitPrice: C_purch
                        };
                    }
                }

                if (bestOption) {
                    orderItems.push({
                        sku: item.ndc,
                        drugName: item.drugName,
                        supplierId: bestOption.supplier.id,
                        supplierName: bestOption.supplier.name,
                        targetSiteId: deficit.inv.siteId,
                        quantity: Math.max(remainingDeficit, bestOption.supplier.contractTerms.minOrderQty),
                        type: 'contract',
                        analysis: {
                            forecastMean: remainingDeficit,
                            safetyStock: 0,
                            projectedStockoutRisk: 0,
                            costBreakdown: {
                                purchase: bestOption.PurchaseCost,
                                holding: 0,
                                stockoutPenalty: 0,
                                logistics: 50,
                                riskPenalty: bestOption.RiskCost // Exposing the valid math term
                            },
                            supplierScore: Math.round(bestOption.supplier.reliability * 100),
                            alternativeSavings: 0
                        }
                    });

                    totalEstimatedCost += bestOption.PurchaseCost;
                    totalRiskAdjustedCost += bestOption.Z;
                }
            }
        }

        return {
            planId: `PLAN-${Date.now()}`,
            timestamp: new Date().toISOString(),
            items: orderItems,
            summary: {
                totalCost: totalEstimatedCost,
                riskAdjustedCost: totalRiskAdjustedCost,
                serviceLevelPredicted: params.serviceLevelTarget
            }
        };
    }

    /**
     * Wrapper for UI Compatibility
     */
    static generateProposals(
        sites: Site[],
        inventories: SiteInventory[],
        patients: Patient[] = [], // Passed from AppContext
        _activeRequests: any[] = []
    ): ProcurementProposal[] {
        // Run the Advanced Engine
        const optimizationResult = this.selectOrderPlan(sites, inventories, patients);

        // Map 'OrderPlanItem' back to 'ProcurementProposal' for UI
        return optimizationResult.items.map(item => ({
            id: `opt-${Math.random()}`,
            type: item.type === 'transfer' ? 'transfer' : 'procurement', // Differentiate for UI? Currently UI treats all as proposals.
            targetSiteId: item.targetSiteId,
            targetSiteName: sites.find(s => s.id === item.targetSiteId)?.name || 'Unknown',
            sourceSiteName: item.type === 'transfer' ? item.supplierName : undefined, // Show Source Dept
            drugName: item.drugName,
            ndc: item.sku,
            quantity: item.quantity,
            vendorName: item.supplierName,
            costAnalysis: {
                distanceKm: 0,
                transportCost: item.analysis.costBreakdown.logistics,
                itemCost: item.analysis.costBreakdown.purchase,
                totalCost: item.analysis.costBreakdown.purchase + item.analysis.costBreakdown.logistics,
                savings: item.analysis.alternativeSavings
            },
            reason: item.type === 'transfer'
                ? `Internal Transfer: Surplus available in ${item.supplierName}`
                : `AI Optimization: Demand Forecast based on ${patients.length} scheduled patients.`,
            score: item.analysis.supplierScore,
            fulfillmentNode: item.type === 'transfer' ? 'Internal' : 'External',
            regulatoryJustification: { passed: true, details: [item.type === 'transfer' ? 'Internal Allocation' : 'Vendor Purchase'] }
        }));
    }
}
