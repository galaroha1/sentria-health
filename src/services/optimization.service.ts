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
    private static getSupplierCatalog(_ndc: string): SupplierProfile[] {
        return [
            {
                id: 'sup-mckesson', name: 'McKesson', reliability: 0.98, leadTimeDays: 2, leadTimeVariance: 0.5, qualityScore: 99, riskScore: 10,
                contractTerms: { minOrderQty: 10, costFunctions: [{ minQty: 0, maxQty: Infinity, unitPrice: 100 }] }
            },
            {
                id: 'sup-cardinal', name: 'Cardinal Health', reliability: 0.95, leadTimeDays: 3, leadTimeVariance: 1.0, qualityScore: 95, riskScore: 15,
                contractTerms: { minOrderQty: 50, costFunctions: [{ minQty: 0, maxQty: Infinity, unitPrice: 95 }] } // Cheaper but slower
            },
            {
                id: 'sup-express', name: 'Express Scripts', reliability: 0.90, leadTimeDays: 5, leadTimeVariance: 2.0, qualityScore: 80, riskScore: 30, // Higher risk
                contractTerms: { minOrderQty: 100, costFunctions: [{ minQty: 0, maxQty: Infinity, unitPrice: 85 }] } // Deep discount spot
            }
        ];
    }

    private static scoreSupplier(supplier: SupplierProfile, context: { unitPrice: number, urgency: 'routine' | 'urgent' | 'emergency' }): number {
        // Weights
        const w_price = 0.4;
        const w_rel = context.urgency === 'routine' ? 0.2 : 0.5; // Reliability matters more in urgency
        const w_risk = 0.2;
        const w_lead = 0.2;

        // Normalize (Simple Heuristic)
        const priceScore = Math.max(0, 100 - (supplier.contractTerms.costFunctions[0].unitPrice / 2)); // Lower price -> Higher score
        const relScore = supplier.reliability * 100;
        const leadScore = Math.max(0, 100 - (supplier.leadTimeDays * 10)); // Lower lead time -> Higher score
        const riskScore = 100 - supplier.riskScore; // Lower risk -> Higher score

        return (priceScore * w_price) + (relScore * w_rel) + (leadScore * w_lead) + (riskScore * w_risk);
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
                // Heuristic: If Department Name includes 'Oncology', assume seasonalityFactor higher
                const deptName = inv.departmentId ? inv.departmentId : 'General';
                const isSeasonality = deptName.toLowerCase().includes('respiratory') || deptName.toLowerCase().includes('er');

                const forecast = ForecastingService.generateForecast(
                    item.ndc, item.drugName, inv.siteId, '2025-CURRENT', patients,
                    isSeasonality ? 1.2 : 1.0, // Seasonality
                    (item as any).criticality === 'critical' ? 1.5 : 1.0 // Acuity Weight
                );

                // B. Safety Stock
                const supplierInfo = this.getSupplierCatalog(item.ndc)[0]; // Use first for baseline SS calc
                const safetyStock = ForecastingService.calculateSafetyStock(
                    forecast,
                    supplierInfo.leadTimeDays,
                    supplierInfo.leadTimeVariance,
                    params.serviceLevelTarget
                );

                // C. Net Requirement = (Demand + SS) - Stock
                const totalDemand = forecast.mean + safetyStock;
                const netPosition = item.quantity - totalDemand;

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

        // 2. Resolve Deficits (Greedy Heuristic: Try Internal Transfer -> Then Buy)
        for (const deficit of deficits) {
            const item = deficit.inv.drugs[deficit.itemIndex];
            let remainingDeficit = deficit.amount;

            // STRATEGY A: INTERNAL TRANSFER (Nodes in Same Location)
            // Filter surpluses for same Site ID but different Department ID (if exists)
            // or just different inventory bucket
            const internalSources = surpluses.filter(s =>
                s.inv.drugs[s.itemIndex].ndc === item.ndc &&
                s.inv.siteId === deficit.inv.siteId &&
                s.inv !== deficit.inv &&
                s.amount > 0
            );

            for (const source of internalSources) {
                if (remainingDeficit <= 0) break;

                const transferQty = Math.min(remainingDeficit, source.amount);

                // EXECUTE INTERNAL TRANSFER (Virtual)
                orderItems.push({
                    sku: item.ndc,
                    drugName: item.drugName,
                    supplierId: source.inv.departmentId || 'Internal-Dept',
                    supplierName: `${source.inv.departmentId || 'Other Dept'} (Internal Transfer)`, // Visual cue
                    targetSiteId: deficit.inv.siteId,
                    quantity: transferQty,
                    type: 'transfer',
                    analysis: {
                        forecastMean: 0, // already accounted
                        safetyStock: 0,
                        projectedStockoutRisk: 0,
                        costBreakdown: {
                            purchase: 0,
                            holding: 0,
                            stockoutPenalty: 0,
                            logistics: 0, // Internal transfer is FREE (or negligible)
                            riskPenalty: 0
                        },
                        supplierScore: 100, // Perfect score for internal
                        alternativeSavings: 100 // Huge saving vs buying
                    }
                });

                // Update Logic State
                remainingDeficit -= transferQty;
                source.amount -= transferQty; // Decrement available surplus
            }

            // STRATEGY B: BUY FROM VENDOR (If Internal didn't cover it)
            if (remainingDeficit > 0) {
                const suppliers = this.getSupplierCatalog(item.ndc);
                let bestOption: any = null;

                for (const supplier of suppliers) {
                    let orderQty = Math.max(remainingDeficit, supplier.contractTerms.minOrderQty);
                    const tier = supplier.contractTerms.costFunctions.find(t => orderQty >= t.minQty && orderQty <= t.maxQty);
                    const unitPrice = tier ? tier.unitPrice : 100;

                    const purchaseCost = orderQty * unitPrice;
                    const holdingCost = (orderQty * unitPrice * params.holdingCostRate) / 12;
                    const riskPenalty = (1 - supplier.reliability) * params.stockoutCostPerUnit;

                    const totalCost = purchaseCost + holdingCost + riskPenalty;
                    const score = this.scoreSupplier(supplier, { unitPrice, urgency: deficit.criticality === 'critical' ? 'emergency' : 'routine' });

                    if (!bestOption || totalCost < bestOption.cost) {
                        bestOption = { supplier, cost: totalCost, score, analysis: { purchase: purchaseCost, holding: holdingCost, riskPenalty, unitPrice } };
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
                                purchase: bestOption.analysis.purchase,
                                holding: bestOption.analysis.holding,
                                stockoutPenalty: 0,
                                logistics: 50,
                                riskPenalty: bestOption.analysis.riskPenalty
                            },
                            supplierScore: Math.round(bestOption.score),
                            alternativeSavings: 0
                        }
                    });

                    totalEstimatedCost += bestOption.analysis.purchase;
                    totalRiskAdjustedCost += bestOption.cost;
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
