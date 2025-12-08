import type { Site, SiteInventory } from '../types/location';
import type { ProcurementProposal } from '../types/procurement';
import type { OptimizationParams, OptimizationResult, OrderPlanItem, SupplierProfile } from '../types/procurement';
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
        if (!target.regulatoryProfile.dscsaCompliant || !source.regulatoryProfile.dscsaCompliant) {
            return { valid: false, reason: 'DSCSA Violation: One or both sites are not compliant.' };
        }
        if (target.regulatoryProfile.is340B !== source.regulatoryProfile.is340B) {
            return { valid: false, reason: `340B Mismatch: Cannot transfer between ${source.regulatoryProfile.is340B ? '340B' : 'Standard'} and ${target.regulatoryProfile.is340B ? '340B' : 'Standard'} sites.` };
        }
        return { valid: true };
    }

    static analyzePopulationDemand(_siteId: string, patients: any[]): { [condition: string]: number } {
        const sitePatients = patients.filter(_p => true); // Mock linkage
        const conditionCounts: { [key: string]: number } = {};
        sitePatients.forEach(p => {
            const condition = p.condition || 'General';
            conditionCounts[condition] = (conditionCounts[condition] || 0) + 1;
        });
        const total = sitePatients.length || 1;
        const prevalence: { [key: string]: number } = {};
        Object.keys(conditionCounts).forEach(cond => {
            prevalence[cond] = conditionCounts[cond] / total;
        });
        return prevalence;
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

    /**
     * supplierScore = w_p*P + w_r*R + w_l*L + w_risk*Risk
     * All normalized to 0-100 scale (Higher is better)
     */
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
     * Heuristic approximation of MILP objective.
     */
    static selectOrderPlan(
        _sites: Site[],
        inventories: SiteInventory[],
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

        // 1. Iterate through all Inventory Points (SKU x Location)
        for (const inv of inventories) {
            for (const item of inv.drugs) {

                // A. Generate Forecast
                const forecast = ForecastingService.generateForecast(
                    item.ndc, item.drugName, inv.siteId, '2025-CURRENT'
                );

                // B. Calculate Dynamic Safety Stock based on variability
                // Use AVERAGE supplier param for initial estimation (assume McKesson baseline)
                const mockAvgSupplierLeadVar = 0.5;
                const mockAvgSupplierLeadTime = 2;

                const safetyStock = ForecastingService.calculateSafetyStock(
                    forecast,
                    mockAvgSupplierLeadTime,
                    mockAvgSupplierLeadVar,
                    params.serviceLevelTarget
                );

                // C. Determine Net Requirement
                // Net = (ForecastMean + SS) - OnHand - OnOrder
                const onOrder = 0;
                const demandForHorizon = (forecast.mean / 30) * params.planningHorizonDays;

                const netRequirement = Math.ceil((demandForHorizon + safetyStock) - item.quantity - onOrder);

                if (netRequirement > 0) {
                    // D. SOURCING OPTIMIZATION
                    // Evaluate all suppliers
                    const suppliers = this.getSupplierCatalog(item.ndc);

                    // Explicit Type for bestOption
                    let bestOption: {
                        supplier: SupplierProfile;
                        cost: number;
                        score: number;
                        analysis: {
                            purchase: number;
                            holding: number;
                            riskPenalty: number;
                            unitPrice: number;
                        }
                    } | null = null;
                    let bestSubOptimalSavings = 0;

                    for (const supplier of suppliers) {
                        // 1. Check Capacity/Constraints (Min Order)
                        let orderQty = Math.max(netRequirement, supplier.contractTerms.minOrderQty);

                        // 2. Calculate Costs
                        const tier = supplier.contractTerms.costFunctions.find(t => orderQty >= t.minQty && orderQty <= t.maxQty);
                        const unitPrice = tier ? tier.unitPrice : 100;

                        const purchaseCost = orderQty * unitPrice;
                        const holdingCost = (orderQty * unitPrice * params.holdingCostRate) / 12; // Monthly portion

                        // Risk Penalty: E[Risk] = Prob * Impact
                        const riskPenalty = (1 - supplier.reliability) * params.stockoutCostPerUnit * (orderQty * 0.1) * params.riskAversionLambda;

                        const totalCost = purchaseCost + holdingCost + riskPenalty;

                        const score = this.scoreSupplier(supplier, {
                            unitPrice,
                            urgency: ((item as any).criticality || 5) > 8 ? 'emergency' : 'routine'
                        });

                        if (!bestOption || totalCost < bestOption.cost) { // Minimizing Cost Objective
                            if (bestOption) bestSubOptimalSavings = bestOption.cost - totalCost;
                            bestOption = {
                                supplier,
                                cost: totalCost,
                                score,
                                analysis: {
                                    purchase: purchaseCost,
                                    holding: holdingCost,
                                    riskPenalty,
                                    unitPrice
                                }
                            };
                        }
                    }

                    if (bestOption) {
                        // TS should know bestOption is not null here due to linear flow in for-loop not affecting it?
                        // If not, we assert
                        const opt = bestOption as NonNullable<typeof bestOption>;

                        orderItems.push({
                            sku: item.ndc,
                            drugName: item.drugName,
                            supplierId: opt.supplier.id,
                            supplierName: opt.supplier.name,
                            targetSiteId: inv.siteId,
                            quantity: Math.max(netRequirement, opt.supplier.contractTerms.minOrderQty),
                            type: 'contract',
                            analysis: {
                                forecastMean: Math.round(demandForHorizon),
                                safetyStock,
                                projectedStockoutRisk: (1 - params.serviceLevelTarget) * 100,
                                costBreakdown: {
                                    purchase: opt.analysis.purchase,
                                    holding: opt.analysis.holding,
                                    stockoutPenalty: 0,
                                    logistics: 50, // Flat fee mock
                                    riskPenalty: opt.analysis.riskPenalty
                                },
                                supplierScore: Math.round(opt.score),
                                alternativeSavings: Math.round(bestSubOptimalSavings)
                            }
                        });

                        totalEstimatedCost += opt.analysis.purchase + opt.analysis.holding;
                        totalRiskAdjustedCost += opt.cost;
                    }
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
     * Legacy Method Support (Wrapper or Deprecated)
     * We keep this to avoid breaking existing UI calls until full migration.
     */
    static generateProposals(
        sites: Site[],
        inventories: SiteInventory[],
        _simulationResults: any[] = [],
        _activeRequests: any[] = []
    ): ProcurementProposal[] {
        // Run the new Engine
        const optimizationResult = this.selectOrderPlan(sites, inventories);

        // Map 'OrderPlanItem' back to 'ProcurementProposal' for UI compatibility
        return optimizationResult.items.map(item => ({
            id: `opt-${Math.random()}`,
            type: 'procurement',
            targetSiteId: item.targetSiteId,
            targetSiteName: sites.find(s => s.id === item.targetSiteId)?.name || 'Unknown',
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
            reason: `AI Optimization: SS=${item.analysis.safetyStock}, RiskPenalty=$${item.analysis.costBreakdown.riskPenalty.toFixed(0)}`,
            score: item.analysis.supplierScore,
            fulfillmentNode: 'External',
            regulatoryJustification: { passed: true, details: ['AI Optimized Plan'] }
        }));
    }
}
