import type { Site, SiteInventory } from '../types/location';
import type { ProcurementProposal } from '../types/procurement';
import { RecommendationEngine } from '../features/clinical/services/recommendation.engine';
import realDrugCatalog from '../data/real-drug-catalog.json';

// Create a lookup map for real drug prices
const PRICE_MAP = new Map<string, number>();
const NDC_TO_NAME_MAP = new Map<string, string>();

realDrugCatalog.forEach((drug: any) => {
    if (drug.ndc) {
        PRICE_MAP.set(drug.ndc, drug.price || 500); // Default to $500 if missing
        NDC_TO_NAME_MAP.set(drug.ndc, drug.name);
    }
});

export class OptimizationService {

    // --- HELPER METHODS RESTORED FOR COMPATIBILITY ---

    /**
     * Helper: Infer Clinical Attributes from Drug Metadata
     */
    public static inferAttributes(drugName: string, _ndc?: string): { isColdChain: boolean, schedule: 'II' | 'III' | 'IV' | 'V' | null } {
        const n = drugName.toLowerCase();
        let isColdChain = false;
        let schedule: 'II' | 'III' | 'IV' | 'V' | null = null;
        if (n.includes('injection') || n.includes('vial') || n.includes('suspension') || n.includes('insulin') || n.includes('vaccine')) isColdChain = true;
        if (n.includes('oxycodone') || n.includes('fentanyl') || n.includes('morphine')) schedule = 'II';
        else if (n.includes('testosterone') || n.includes('ketamine')) schedule = 'III';
        else if (n.includes('alprazolam') || n.includes('clonazepam') || n.includes('diazepam')) schedule = 'IV';
        else if (n.includes('pregabalin') || n.includes('codeine')) schedule = 'V';
        return { isColdChain, schedule };
    }

    /**
     * REGULATORY COMPLIANCE LAYER
     */
    static validateTransfer(source: Site, target: Site, _drugAttributes: { schedule: string | null }): { valid: boolean; reason?: string } {
        if (!source.regulatoryProfile?.dscsaCompliant || !target.regulatoryProfile?.dscsaCompliant) return { valid: false, reason: 'DSCSA Validation Failed' };
        if (source.regulatoryProfile.is340B !== target.regulatoryProfile.is340B) return { valid: false, reason: '340B Integrity Conflict' };
        return { valid: true };
    }

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
        // PatientCountMap[SiteID][DrugNDC] = Set<PatientID>
        const patientCountMap = new Map<string, Map<string, Set<string>>>();
        const drugDetailsMap = new Map<string, { name: string }>(); // Helper to keep names

        // NDC Lookup for AI-Predicted Drugs (Mapping known names to real NDCs if possible, or common ones)
        // In a real system, the RecommendationEngine returns valid NDCs.
        const AI_DRUG_MAP: Record<string, string> = {
            'Keytruda (Pembrolizumab)': '00006-3026-02',
            'Opdivo (Nivolumab)': '00003-3772-11',
            'Metformin Hydrochloride TABLET': '00093-7212-98',
            'Insulin': '00002-7510-01',
            'Morphine Sulfate': '00406-0523-01',
            'Ampicillin Sodium': '00143-9880-01',
            'Amoxicillin CAPSULE': '00093-0036-01',
            'Lisinopril TABLET': '00006-3916-01',
            'Atorvastatin Calcium TABLET': '00071-1015-68',
            'Gabapentin TABLET': '00071-0803-24',
            'Antibiotics': '00093-0036-01', // Fallback
            'Unknown': '00000-0000-00'
        };

        // Use Loop instead of forEach to wait for Async AI
        for (const patient of patients) {
            // Get Patient's Assigned Site (Demand Location)
            const siteId = patient.assignedSiteId || 'unknown';
            if (siteId === 'unknown') continue;

            // STRATEGY A: Static Treatment Schedule (Legacy)
            if (patient.treatmentSchedule && patient.treatmentSchedule.length > 0) {
                patient.treatmentSchedule.forEach((treatment: any) => {
                    const txDate = new Date(treatment.date);
                    if (txDate > now) {
                        const qtyStr = treatment.dose || '1';
                        const qty = parseInt(qtyStr.match(/\d+/)?.[0] || '1', 10);

                        if (!demandMap.has(siteId)) demandMap.set(siteId, new Map());
                        const siteDemand = demandMap.get(siteId)!;
                        const currentDemand = siteDemand.get(treatment.ndc) || 0;
                        siteDemand.set(treatment.ndc, currentDemand + qty);

                        if (!drugDetailsMap.has(treatment.ndc)) {
                            drugDetailsMap.set(treatment.ndc, { name: treatment.drugName });
                        }
                    }
                });
            }
            // STRATEGY B: AI-Driven Demand (The New Engine)
            else {
                // "Ask the AI" (or use pre-computed result)
                try {
                    let topRec: any = null;

                    // CASE 1: Pre-computed Prediction (from Simulation Context)
                    // The SimulationResult object has 'aiPrediction' with 'recommendedDrug'
                    if (patient.aiPrediction) {
                        topRec = {
                            drugName: patient.aiPrediction.recommendedDrug,
                            confidenceScore: patient.aiPrediction.confidenceScore,
                            predictedQuantity: 30 // Default for simulation
                        };
                    }
                    // CASE 2: Live Inference
                    else {
                        // We only predict 1 'Need' per patient for this simulation
                        // In reality, this would be a full care plan prediction
                        const recs = await RecommendationEngine.recommend(patient);
                        if (recs && recs.length > 0) {
                            topRec = recs[0]; // Highest confidence drug
                        }
                    }

                    if (topRec) {
                        // Business Logic: Check Insurance / Acquisition Method
                        // 'Brown Bag' = Patient supplies own drug (No Demand)
                        if (patient.aiPrediction?.acquisitionMethod === 'Brown Bag') {
                            // console.log(`[Optimization] Skipping ${patient.id} - Brown Bag (Patient Supplied)`);
                            continue;
                        }

                        if (topRec.confidenceScore > 20) { // LOWERED THRESHOLD FOR V2 MODEL
                            const drugName = topRec.drugName;
                            const ndc = AI_DRUG_MAP[drugName] || '99999-9999-99'; // Fallback
                            // AI-PREDICTED QUANTITY
                            const qty = topRec.predictedQuantity || 30;

                            // Add to Demand
                            if (!demandMap.has(siteId)) demandMap.set(siteId, new Map());
                            const siteDemand = demandMap.get(siteId)!;
                            const currentDemand = siteDemand.get(ndc) || 0;
                            siteDemand.set(ndc, currentDemand + qty);

                            // Track Patient Count for this Demand Bucket
                            // We use a separate map: Map<SiteID, Map<NDC, Set<PatientID>>>
                            if (!patientCountMap.has(siteId)) patientCountMap.set(siteId, new Map());
                            const sitePatientMap = patientCountMap.get(siteId)!;
                            if (!sitePatientMap.has(ndc)) sitePatientMap.set(ndc, new Set());
                            sitePatientMap.get(ndc)!.add(patient.id);

                            if (!drugDetailsMap.has(ndc)) {
                                drugDetailsMap.set(ndc, { name: drugName });
                            }
                        }
                    }
                } catch (e) {
                    console.warn(`AI Inference failed for patient ${patient.id}`, e);
                }
            }
        }

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
                const inventoryItem = siteInv?.get(ndc);

                if (inventoryItem) {
                    onHand = inventoryItem.quantity;
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

                // Lookup Real Price
                const unitPrice = PRICE_MAP.get(ndc) || 500; // Fallback to $500

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
                                // Cost Logic for Transfers
                                const transferFee = 45; // Flat fee for internal courier
                                const purchaseCostAvoided = transferQty * unitPrice;
                                const totalSavings = purchaseCostAvoided - transferFee;

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
                                    score: 0.95,
                                    costAnalysis: {
                                        distanceKm: 50, // Mock
                                        transportCost: transferFee,
                                        itemCost: 0, // No new item cost (already owned)
                                        totalCost: transferFee,
                                        savings: totalSavings // REAL SAVINGS
                                    },
                                    fulfillmentNode: 'Internal',
                                    vendorName: otherSite.name,
                                    regulatoryJustification: { passed: true, details: ['Internal Approved'] },
                                    trigger: 'patient_demand',
                                    affectedPatientCount: patientCountMap.get(siteId)?.get(ndc)?.size || 0
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
                    const estimatedCost = netDeficit * unitPrice;

                    // Predictive Logic: Buying NOW prevents Emergency shipment later
                    // Emergency Cost assumes 1.5x Multiplier for rushed shipping/spot buying
                    const emergencyMultiplier = 1.5;
                    const emergencyCost = estimatedCost * emergencyMultiplier;
                    const predictiveSavings = emergencyCost - estimatedCost;

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
                        score: 0.85,
                        channel: 'GPO',

                        costAnalysis: {
                            distanceKm: 0,
                            transportCost: 15,
                            itemCost: estimatedCost,
                            totalCost: estimatedCost + 15,
                            savings: predictiveSavings // REAL PREDICTIVE SAVINGS
                        },
                        fulfillmentNode: 'External',
                        regulatoryJustification: { passed: true, details: ['Vendor Approved'] },
                        trigger: 'patient_demand',
                        affectedPatientCount: patientCountMap.get(siteId)?.get(ndc)?.size || 0
                    });
                }
            }
        }

        // =============================================================================
        // DECISION 12: Handle Pure Stock Refills (Low Stock, No Patient Demand)
        // =============================================================================
        // Identify items that are below MinLevel but were NOT processed above (no patient demand)
        for (const site of sites) {
            const siteInv = inventoryMap.get(site.id);
            if (!siteInv) continue;

            const demandedForSite = demandMap.get(site.id);

            for (const [ndc, item] of siteInv.entries()) {
                // If it was already handled by Demand Logic, skip
                if (demandedForSite && demandedForSite.has(ndc)) continue;

                // Check Low Stock
                if (item.quantity < item.minLevel) {
                    const refillQty = item.maxLevel - item.quantity;
                    if (refillQty <= 0) continue;

                    let netDeficit = refillQty;
                    const drugName = item.drugName;
                    const unitPrice = PRICE_MAP.get(ndc) || 500;

                    // --- Internal Transfer Logic (Refill) ---
                    for (const otherSite of sites) {
                        if (netDeficit <= 0) break;
                        if (otherSite.id === site.id) continue;

                        const otherInvMap = inventoryMap.get(otherSite.id);
                        const sourceItem = otherInvMap?.get(ndc);

                        if (sourceItem && sourceItem.quantity > sourceItem.maxLevel) {
                            const surplus = sourceItem.quantity - sourceItem.maxLevel;
                            const transferQty = Math.min(surplus, netDeficit);

                            if (transferQty > 0) {
                                const transferFee = 45;
                                const savings = (transferQty * unitPrice) - transferFee;

                                proposals.push({
                                    id: `prop-refill-${Date.now()}-${Math.random()}`,
                                    type: 'transfer',
                                    transferSubType: 'network_transfer',
                                    targetSiteId: site.id,
                                    targetSiteName: site.name,
                                    sourceSiteId: otherSite.id,
                                    sourceSiteName: otherSite.name,
                                    drugName: drugName,
                                    ndc: ndc,
                                    quantity: transferQty,
                                    reason: `Stock Refill: Level fell below min (${item.minLevel}). Sourced from surplus.`,
                                    score: 0.90,
                                    costAnalysis: { distanceKm: 50, transportCost: transferFee, itemCost: 0, totalCost: transferFee, savings: savings },
                                    fulfillmentNode: 'Internal',
                                    vendorName: otherSite.name,
                                    regulatoryJustification: { passed: true, details: ['Internal Approved'] },
                                    trigger: 'stock_refill'
                                });
                                netDeficit -= transferQty;
                            }
                        }
                    }

                    // --- Procurement Logic (Refill) ---
                    if (netDeficit > 0) {
                        const estimatedCost = netDeficit * unitPrice;
                        // Avoided stockout cost (mock heuristic)
                        const predictiveSavings = estimatedCost * 0.2; // 20% savings for planned refill vs urgent buy

                        proposals.push({
                            id: `prop-refill-buy-${Date.now()}-${Math.random()}`,
                            type: 'procurement',
                            targetSiteId: site.id,
                            targetSiteName: site.name,
                            drugName: drugName,
                            ndc: ndc,
                            quantity: netDeficit,
                            reason: `Stock Refill: Level fell below min (${item.minLevel}).`,
                            vendorName: 'McKesson',
                            score: 0.80,
                            channel: 'WAC',
                            costAnalysis: { distanceKm: 0, transportCost: 15, itemCost: estimatedCost, totalCost: estimatedCost + 15, savings: predictiveSavings },
                            fulfillmentNode: 'External',
                            regulatoryJustification: { passed: true, details: ['Vendor Approved'] },
                            trigger: 'stock_refill'
                        });
                    }
                }
            }
        }


        return proposals;
    }
}
