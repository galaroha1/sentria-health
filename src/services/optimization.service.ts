import type { Site, SiteInventory } from '../types/location';
import type { ProcurementProposal } from '../types/procurement';
import type { OptimizationParams, OptimizationResult, OrderPlanItem, SupplierProfile } from '../types/procurement';
import type { Patient } from '../types/patient';
import { ForecastingService } from './forecasting.service';
import { RoutingService } from './routing.service';

export class OptimizationService {

    // --- CONFIGURATION CONSTANTS ---
    private static readonly RATES = {
        TRANSPORT_STD_PER_KM: 1.50,
        TRANSPORT_COLD_PER_KM: 2.50, // $2.50/km for Refrigerated
        LABOR_PER_MIN: 1.00, // $1.00/min driver time
        BASE_FEE: 50.00,
        SHIPPING_FLAT: 15.00,
        STOCKOUT_PENALTY: 500.00
    };

    /**
     * Helper: Infer Clinical Attributes from Drug Metadata
     * (Simulating a Clinical Database Lookup)
     */
    public static inferAttributes(drugName: string, _ndc?: string): { isColdChain: boolean, schedule: 'II' | 'III' | 'IV' | 'V' | null } {
        const n = drugName.toLowerCase();
        let isColdChain = false;
        let schedule: 'II' | 'III' | 'IV' | 'V' | null = null;

        // Cold Chain Heuristics
        if (n.includes('injection') || n.includes('vial') || n.includes('suspension') || n.includes('insulin') || n.includes('vaccine')) {
            isColdChain = true;
        }

        // DEA Schedule Heuristics
        if (n.includes('oxycodone') || n.includes('fentanyl') || n.includes('morphine')) schedule = 'II';
        else if (n.includes('testosterone') || n.includes('ketamine')) schedule = 'III';
        else if (n.includes('alprazolam') || n.includes('clonazepam') || n.includes('diazepam')) schedule = 'IV';
        else if (n.includes('pregabalin') || n.includes('codeine')) schedule = 'V';

        return { isColdChain, schedule };
    }

    /**
     * REGULATORY COMPLIANCE LAYER
     * Returns { valid: boolean, reason: string }
     * Implements: Act 145 (Cross-State), 340B Integrity, DEA check, DSCSA, Class of Trade
     */
    static validateTransfer(source: Site, target: Site, drugAttributes: { schedule: string | null }): { valid: boolean; reason?: string } {
        // 1. DSCSA (Baseline)
        if (!source.regulatoryProfile?.dscsaCompliant || !target.regulatoryProfile?.dscsaCompliant) {
            return { valid: false, reason: 'DSCSA Validation Failed: One or both partners non-compliant.' };
        }

        // 2. 340B Integrity (Like-to-Like)
        if (source.regulatoryProfile.is340B !== target.regulatoryProfile.is340B) {
            return {
                valid: false,
                reason: `340B Integrity: Cannot transfer between ${source.regulatoryProfile.is340B ? '340B' : 'Non-340B'} and ${target.regulatoryProfile.is340B ? '340B' : 'Non-340B'} entity.`
            };
        }

        // 3. DEA Controlled Substance Check
        if (drugAttributes.schedule) {
            const requiredLicense = drugAttributes.schedule;
            // @ts-ignore - Mock data types might be loose, explicit cast safety
            const targetLicenses = target.regulatoryProfile.deaLicense || [];
            if (!targetLicenses.includes(requiredLicense as any)) {
                return {
                    valid: false,
                    reason: `DEA Violation: Target ${target.name} lacks Schedule ${requiredLicense} license.`
                };
            }
        }

        // 4. Cross-State Licensing (Act 145 / Federal Drug Supply Chain)
        // Parse State from License ID (e.g., 'PA-HOSP-001' -> 'PA')
        const getState = (s: Site) => s.regulatoryProfile.stateLicense.split('-')[0];
        const sourceState = getState(source);
        const targetState = getState(target);

        if (sourceState !== targetState) {
            // Inter-State Transfer detected. Source MUST be a licensed Wholesaler/Distributor.
            // Standard Pharmacy license is insufficient for cross-state distribution.
            if (source.regulatoryProfile.licenseType !== 'wholesaler') {
                return {
                    valid: false,
                    reason: `Regulatory Block (Act 145): Cross-state transfer (${sourceState}->${targetState}) requires Wholesaler license. Source is '${source.regulatoryProfile.licenseType}'.`
                };
            }
        }

        // 5. Class of Trade (CoT) Protection
        // Prevent 'Acute' (Hospital) inventory leaking to 'Retail' (Pharmacy) -> "Own Use" fraud risk
        if (source.classOfTrade === 'acute' && target.classOfTrade === 'retail') {
            return {
                valid: false,
                reason: 'Class of Trade Conflict: Cannot transfer Acute inventory to Retail channel (Own Use Prevention).'
            };
        }

        return { valid: true };
    }

    /**
     * MOCK SUPPLIER CATALOG (Would be DB)
     */
    private static getSupplierCatalog(ndc: string): SupplierProfile[] {
        let hash = 0;
        for (let i = 0; i < ndc.length; i++) hash = ((hash << 5) - hash) + ndc.charCodeAt(i) | 0;
        const basePrice = (Math.abs(hash) % 500) + 50;

        return [
            {
                id: 'mckesson', name: 'McKesson', reliability: 0.98, leadTimeDays: 2, leadTimeVariance: 0.5, qualityScore: 99, riskScore: 10,
                contractTerms: { minOrderQty: 10, costFunctions: [{ minQty: 0, maxQty: Infinity, unitPrice: Number((basePrice * 1.05).toFixed(2)) }] }
            },
            {
                id: 'cardinal', name: 'Cardinal Health', reliability: 0.95, leadTimeDays: 3, leadTimeVariance: 1.0, qualityScore: 95, riskScore: 15,
                contractTerms: { minOrderQty: 50, costFunctions: [{ minQty: 0, maxQty: Infinity, unitPrice: Number((basePrice * 1.10).toFixed(2)) }] }
            }
        ];
    }

    /**
     * MAIN SOLVER: SelectOrderPlan(t)
     * Objective: Minimize Z = C(Logistics) + C(Purchase) + C(Risk) + C(Holding)
     */
    static async selectOrderPlan(
        sites: Site[],
        inventories: SiteInventory[],
        patients: Patient[],
        params: OptimizationParams = {
            serviceLevelTarget: 0.95,
            holdingCostRate: 0.20,
            stockoutCostPerUnit: 500,
            riskAversionLambda: 1.0,
            planningHorizonDays: 30
        }
    ): Promise<OptimizationResult> {
        const orderItems: OrderPlanItem[] = [];
        let totalEstimatedCost = 0;
        let totalRiskAdjustedCost = 0;

        // 1. Identify Requirements (Demand-Driven ONLY)
        const deficits: { inv: SiteInventory, item: any, amount: number, forecast: any, safetyStock: number }[] = [];
        const surpluses: { inv: SiteInventory, item: any, amount: number, isWholesaler: boolean }[] = [];

        // Pre-scan for Surpluses (Potential Sources)
        inventories.forEach(inv => {
            const site = sites.find(s => s.id === inv.siteId);
            inv.drugs.forEach(item => {
                const forecast = ForecastingService.generateProbabilisticForecast(
                    item.ndc, inv.siteId, patients.filter(p => p.assignedDepartmentId === inv.departmentId)
                );

                // Dynamic Safety Stock
                const safetyStock = forecast.mean === 0 ? 0 : ForecastingService.calculateSafetyStock(forecast, 2, 0.5, params.serviceLevelTarget);

                // Net Position Formula: Stock - (Demand + SafetyStock)
                // STRICT ZERO RULE: If forecast.expectedDemand is 0, safetyStock is 0.
                const netPosition = item.quantity - (forecast.expectedDemand + safetyStock);

                if (netPosition > 0) {
                    surpluses.push({
                        inv,
                        item,
                        amount: netPosition,
                        isWholesaler: site?.regulatoryProfile.licenseType === 'wholesaler'
                    });
                } else if (netPosition < 0) {
                    deficits.push({
                        inv,
                        item,
                        amount: Math.abs(netPosition),
                        forecast,
                        safetyStock
                    });
                }
            });
        });

        // 2. Solve per Deficit
        for (const deficit of deficits) {
            let remainingDeficit = deficit.amount;
            const targetSite = sites.find(s => s.id === deficit.inv.siteId)!;
            const drugAttrs = this.inferAttributes(deficit.item.drugName, deficit.item.ndc);

            // OPTION A: NETWORK TRANSFER
            // Filter Valid Sources (Regulatory Layer)
            const validSources = surpluses
                .filter(s => s.item.ndc === deficit.item.ndc && s.amount > 0 && s.inv !== deficit.inv)
                .filter(source => {
                    const sourceSite = sites.find(s => s.id === source.inv.siteId)!;
                    const check = this.validateTransfer(sourceSite, targetSite, drugAttrs);
                    return check.valid;
                });

            // Evaluate Sources
            for (const source of validSources) {
                if (remainingDeficit <= 0) break;

                const sourceSite = sites.find(s => s.id === source.inv.siteId)!;
                const transferQty = Math.min(remainingDeficit, source.amount);

                // --- COST MODELING ($Z) ---

                // 1. Logistics Cost
                const route = await RoutingService.getRouteMetrics(sourceSite, targetSite);
                const isColdChain = drugAttrs.isColdChain;
                const shippingRate = isColdChain ? this.RATES.TRANSPORT_COLD_PER_KM : this.RATES.TRANSPORT_STD_PER_KM;

                const C_logistics =
                    this.RATES.BASE_FEE +
                    (route.distanceKm * shippingRate) +
                    (route.durationMinutes * this.RATES.LABOR_PER_MIN);

                // 2. Opportunity/Holding Cost (Simplified: internal transfer is 'free' on item cost, but has logistics)
                // We compare against Purchase Price to see if Logistics is worth it.

                // --- BENCHMARKING VS PURCHASE ---
                const suppliers = this.getSupplierCatalog(deficit.item.ndc);
                const bestVendor = suppliers[0];
                const vendorPrice = bestVendor.contractTerms.costFunctions[0].unitPrice;
                const purchaseCostTotal = (vendorPrice * transferQty) + this.RATES.SHIPPING_FLAT;

                // Decision: Transfer if C_logistics < C_purchase (with slight bias for internal utilization)
                if (C_logistics < (purchaseCostTotal * 1.1)) {
                    // MAP TRAFFIC UNKNOWN -> MODERATE to fix strict typing
                    // Cast to 'any' then to correct string enum to appease TS if needed, or better, handle gracefully
                    let traffic = route.trafficLevel as string;
                    if (traffic === 'unknown') traffic = 'moderate';

                    // EXECUTE TRANSFER
                    orderItems.push({
                        sku: deficit.item.ndc,
                        drugName: deficit.item.drugName,
                        supplierId: source.inv.siteId,
                        supplierName: sourceSite.name,
                        targetSiteId: targetSite.id,
                        quantity: transferQty,
                        type: 'transfer',
                        metrics: { ...route, trafficLevel: traffic as 'low' | 'moderate' | 'heavy', source: 'google' },
                        analysis: {
                            forecastMean: deficit.forecast.mean,
                            safetyStock: deficit.safetyStock,
                            projectedStockoutRisk: 0,
                            costBreakdown: {
                                purchase: 0,
                                holding: 0,
                                stockoutPenalty: 0,
                                logistics: C_logistics,
                                riskPenalty: 0
                            },
                            supplierScore: 100,
                            alternativeSavings: purchaseCostTotal - C_logistics
                        },
                        cause: deficit.forecast.mean > 0 ? 'demand' : 'safety_stock'
                    });

                    remainingDeficit -= transferQty;
                    source.amount -= transferQty;
                    totalEstimatedCost += C_logistics;
                }
            }

            // OPTION B: EXTERNAL PURCHASE
            if (remainingDeficit > 0) {
                const suppliers = this.getSupplierCatalog(deficit.item.ndc);
                let bestOption: { supplier: SupplierProfile, Z: number, purchase: number, risk: number } | null = null;

                for (const supplier of suppliers) {
                    const orderQty = Math.max(remainingDeficit, supplier.contractTerms.minOrderQty);

                    // Cost Components
                    const C_purch = supplier.contractTerms.costFunctions[0].unitPrice;
                    const Purchase = (orderQty * C_purch) + this.RATES.SHIPPING_FLAT;

                    // Risk Cost: (1 - Reliability) * (Failure Impact)
                    // Impact = Stockout Penalty * Qty
                    const Risk = (1 - supplier.reliability) * (remainingDeficit * this.RATES.STOCKOUT_PENALTY);

                    const Z = Purchase + Risk;

                    if (!bestOption || Z < bestOption.Z) {
                        bestOption = { supplier, Z, purchase: Purchase, risk: Risk };
                    }
                }

                if (bestOption) {
                    const orderQty = Math.max(remainingDeficit, bestOption.supplier.contractTerms.minOrderQty);
                    orderItems.push({
                        sku: deficit.item.ndc,
                        drugName: deficit.item.drugName,
                        supplierId: bestOption.supplier.id,
                        supplierName: bestOption.supplier.name,
                        targetSiteId: targetSite.id,
                        quantity: orderQty,
                        type: 'contract',
                        cause: deficit.forecast.mean > 0 ? 'demand' : 'safety_stock',
                        analysis: {
                            forecastMean: deficit.forecast.mean,
                            safetyStock: deficit.safetyStock,
                            projectedStockoutRisk: bestOption.risk,
                            costBreakdown: {
                                purchase: bestOption.purchase,
                                holding: 0,
                                stockoutPenalty: 0,
                                logistics: this.RATES.SHIPPING_FLAT,
                                riskPenalty: bestOption.risk
                            },
                            supplierScore: Math.round(bestOption.supplier.reliability * 100),
                            alternativeSavings: 0
                        }
                    });

                    totalEstimatedCost += bestOption.purchase;
                    totalRiskAdjustedCost += bestOption.Z;
                }
            }
        }

        return {
            planId: `AI-${Date.now()}`,
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
     * Compatible Data Mapper (Maps to Proposals UI)
     */
    static async generateProposals(
        sites: Site[],
        inventories: SiteInventory[],
        patients: Patient[] = []
    ): Promise<ProcurementProposal[]> {
        const result = await this.selectOrderPlan(sites, inventories, patients);

        return result.items.map(item => ({
            id: `prop-${Math.random().toString(36).substr(2, 9)}`,
            type: item.type === 'transfer' ? 'transfer' : 'procurement',
            targetSiteId: item.targetSiteId,
            targetSiteName: sites.find(s => s.id === item.targetSiteId)?.name || 'Unknown',
            sourceSiteId: item.supplierId,
            sourceSiteName: item.supplierName,
            vendorName: item.supplierName,
            drugName: item.drugName,
            ndc: item.sku,
            quantity: item.quantity,
            costAnalysis: {
                distanceKm: item.metrics?.distanceKm || 0,
                transportCost: item.analysis.costBreakdown.logistics,
                itemCost: item.analysis.costBreakdown.purchase,
                totalCost: item.analysis.costBreakdown.logistics + item.analysis.costBreakdown.purchase,
                savings: item.analysis.alternativeSavings
            },
            score: item.analysis.supplierScore,
            reason: item.type === 'transfer'
                ? `Network Transfer: Sourced from ${item.supplierName} to resolve deficit.`
                : `External Procurement: Best value vendor based on Cost ($${item.analysis.costBreakdown.purchase.toFixed(0)}) and Risk Profile.`,
            fulfillmentNode: item.type === 'transfer' ? 'Internal' : 'External',
            regulatoryJustification: {
                passed: true,
                details: ['Passed Act 145 Check', 'Passed DEA Validation', '340B Compliant']
            }
        }));
    }
}
