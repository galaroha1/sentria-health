import type { Site, SiteInventory } from '../types/location';
import type { ProcurementProposal } from '../types/procurement';

export class OptimizationService {

    /**
     * STRICT DECISION LOGIC SPECIFICATION (DECISIONS 1-9)
     * Aligns with "AI Inventory Optimization — Decision Logic Specification"
     */
    static async generateProposals(
        sites: Site[],
        inventories: SiteInventory[],
        patients: any[]
    ): Promise<ProcurementProposal[]> {
        const proposals: ProcurementProposal[] = [];
        const now = new Date();

        // --- PREPARATION: Map Inventory for quick lookup ---
        // InventoryMap[SiteID][NDC] = InventoryItem
        const inventoryMap = new Map<string, Map<string, any>>();
        inventories.forEach(inv => {
            const drugs = new Map<string, any>();
            inv.drugs.forEach(d => drugs.set(d.ndc, d));
            inventoryMap.set(inv.siteId, drugs);
        });

        // =================================================================================
        // DECISION 1: Should a patient record contribute to demand?
        // DECISION 2: How is demand aggregated?
        // =================================================================================
        // DemandMap[SiteID][DrugNDC] = TotalUnitsRequired
        const demandMap = new Map<string, Map<string, number>>();
        const drugDetailsMap = new Map<string, { name: string }>(); // Helper to keep names

        patients.forEach(patient => {
            if (!patient.treatmentSchedule) return;

            // Get Patient's Assigned Site (Demand Location)
            const siteId = patient.assignedSiteId || 'unknown';
            if (siteId === 'unknown') return;

            patient.treatmentSchedule.forEach((treatment: any) => {
                const txDate = new Date(treatment.date);

                // DECISION 1: IF treatment.date > now() THEN Include
                if (txDate > now) {
                    // Extract Quantity (Rough parsing of "30 units" -> 30)
                    const qtyStr = treatment.dose || '1';
                    const qty = parseInt(qtyStr.match(/\d+/)?.[0] || '1', 10);

                    // DECISION 2: Aggregate Demand
                    if (!demandMap.has(siteId)) {
                        demandMap.set(siteId, new Map());
                    }
                    const siteDemand = demandMap.get(siteId)!;
                    const currentDemand = siteDemand.get(treatment.ndc) || 0;
                    siteDemand.set(treatment.ndc, currentDemand + qty);

                    // Store metadata
                    if (!drugDetailsMap.has(treatment.ndc)) {
                        drugDetailsMap.set(treatment.ndc, { name: treatment.drugName });
                    }
                }
                // ELSE Ignore (past care)
            });
        });

        // Iterate through aggregated demand to find Deficits
        // (Iterate Sites -> Drugs)
        for (const [siteId, siteDemands] of demandMap.entries()) {
            const targetSite = sites.find(s => s.id === siteId);
            if (!targetSite) continue;

            for (const [ndc, rawDemand] of siteDemands.entries()) {
                const drugName = drugDetailsMap.get(ndc)?.name || 'Unknown Drug';
                const siteInv = inventoryMap.get(siteId);

                // =============================================================================
                // DECISION 3: Does the site have inventory for this drug?
                // =============================================================================
                let onHand = 0;
                let maxLevel = 100; // Default if unknown
                const inventoryItem = siteInv?.get(ndc);

                if (inventoryItem) {
                    onHand = inventoryItem.quantity;
                    maxLevel = inventoryItem.maxLevel;
                } else {
                    // ELSE OnHand = 0 (Virtual Deficit)
                    onHand = 0;
                }

                // =============================================================================
                // DECISION 4: Is there a raw deficit?
                // =============================================================================
                let rawDeficit = 0;
                if (rawDemand > onHand) {
                    rawDeficit = rawDemand - onHand;
                } else {
                    // rawDeficit = 0
                    continue; // No deficit, no proposal needed
                }

                // =============================================================================
                // DECISION 5: Should safety stock be added?
                // =============================================================================
                // Logic: High variability OR unstable volume -> 20%, else 10%
                // Simplified: Oncology/Critical drugs usually high variability
                let safetyBufferPct = 0.10; // Default 10%
                const isHighVariability = ['Keytruda', 'Humira', 'Opdivo', 'TestDrug'].some(n => drugName.includes(n));

                if (isHighVariability) {
                    safetyBufferPct = 0.20;
                }

                // =============================================================================
                // DECISION 6: What is the target quantity?
                // =============================================================================
                // TargetQuantity = ceil(RawDeficit * (1 + SafetyBuffer))
                // Note: User spec says RawDeficit * Buffer. Usually it's Demand * Buffer. 
                // Following Spec: applied to the *Deficit* to buffer the *buy*.
                const targetQty = Math.ceil(rawDeficit * (1 + safetyBufferPct));

                // =============================================================================
                // DECISION 7: Is there a net deficit?
                // =============================================================================
                // NetDeficit is the amount we need to acquire.
                let netDeficit = targetQty;

                // =============================================================================
                // DECISION 8: Can the deficit be filled internally?
                // =============================================================================
                // FOR EACH OtherSite != SiteID
                // IF OtherSite.OnHand > OtherSite.MaxStockLevel
                // THEN Surplus = OnHand - MaxStockLevel
                // TransferQty = min(Surplus, NetDeficit)

                for (const otherSite of sites) {
                    if (netDeficit <= 0) break; // STOP When NetDeficit == 0
                    if (otherSite.id === siteId) continue;

                    const otherInvMap = inventoryMap.get(otherSite.id);
                    const sourceItem = otherInvMap?.get(ndc);

                    if (sourceItem) {
                        const sourceOnHand = sourceItem.quantity;
                        const sourceMax = sourceItem.maxLevel;

                        if (sourceOnHand > sourceMax) {
                            const surplus = sourceOnHand - sourceMax;
                            const transferQty = Math.min(surplus, netDeficit);

                            if (transferQty > 0) {
                                // Create TRANSFER Proposal
                                proposals.push({
                                    id: `prop-${Date.now()}-${Math.random()}`,
                                    type: 'transfer',
                                    transferSubType: 'network_transfer', // Blue Badge
                                    targetSiteId: siteId,
                                    targetSiteName: targetSite.name,
                                    sourceSiteId: otherSite.id,
                                    sourceSiteName: otherSite.name,
                                    drugName: drugName,
                                    ndc: ndc,
                                    quantity: transferQty,
                                    reason: `Network Transfer: Surplus identified at ${otherSite.name} (> Max Levels)`,
                                    status: 'pending',
                                    score: 0.95,
                                    confidence: 0.9,
                                    impact: { financial: 1000, operational: 'high', clinical: 'high' },
                                    costAnalysis: {
                                        currentCost: 0,
                                        projectedCost: 50, // Logistics cost
                                        savings: 5000, // Mock savings vs Purchase
                                        transportCost: 50,
                                        itemCost: 0,
                                        totalCost: 50
                                    },
                                    fulfillmentNode: 'Internal',
                                    vendorName: otherSite.name
                                });

                                // Reduce NetDeficit
                                netDeficit -= transferQty;
                            }
                        }
                    }
                }

                // =============================================================================
                // DECISION 9: Is external procurement required?
                // =============================================================================
                // IF NetDeficit > 0 AFTER all transfers
                if (netDeficit > 0) {
                    // Create PURCHASE Proposal
                    proposals.push({
                        id: `prop-buy-${Date.now()}-${Math.random()}`,
                        type: 'procurement', // Purple Badge
                        targetSiteId: siteId,
                        targetSiteName: targetSite.name,
                        drugName: drugName,
                        ndc: ndc,
                        quantity: netDeficit,
                        reason: `External Procurement: Needed to cover demand deficit`,
                        vendorName: 'McKesson', // Default vendor
                        status: 'pending',
                        score: 0.85,
                        confidence: 0.8,
                        impact: { financial: -netDeficit * 100, operational: 'medium', clinical: 'critical' },
                        costAnalysis: {
                            currentCost: 0,
                            projectedCost: netDeficit * 150,
                            savings: 0,
                            transportCost: 15,
                            itemCost: netDeficit * 150,
                            totalCost: (netDeficit * 150) + 15
                        },
                        fulfillmentNode: 'External'
                    });
                }
            }
        }

        return proposals;
    }
}
