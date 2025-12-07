import type { Site, SiteInventory } from '../types/location';
import { RegulatoryService } from './regulatory.service';
import type { ProcurementProposal, DrugChannel } from '../types/procurement';

export interface OptimizationProposal {
    id: string;
    type: 'transfer' | 'procurement';
    targetSiteId: string;
    targetSiteName: string;
    sourceSiteId?: string; // For transfers
    sourceSiteName?: string; // For transfers
    vendorName?: string; // For procurement
    drugName: string;
    ndc: string;
    quantity: number;
    costAnalysis: {
        distanceKm: number;
        transportCost: number;
        itemCost: number;
        totalCost: number;
        savings?: number; // Compared to alternative
    };
    reason: string;
    score: number; // 0-100 suitability score
}

export class OptimizationService {
    // Constants for the "Equation"
    private static readonly TRANSPORT_RATE_PER_KM = 1.50;
    private static readonly URGENCY_MULTIPLIER = 1.2;
    private static readonly BASE_PROCESSING_FEE = 50.00;

    /**
     * Calculate Haversine distance between two sites in km
     */
    private static calculateDistance(siteA: Site, siteB: Site): number {
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

    private static deg2rad(deg: number): number {
        return deg * (Math.PI / 180);
    }

    /**
     * The "Equation": Calculate Total Landed Cost
     */
    /**
     * The "Equation": Calculate Total Landed Cost
     */
    private static calculateTotalCost(
        distanceKm: number,
        quantity: number,
        unitPrice: number,
        urgency: 'routine' | 'urgent' | 'emergency'
    ): { total: number; transport: number; item: number } {
        let multiplier = 1.0;
        if (urgency === 'urgent') multiplier = this.URGENCY_MULTIPLIER; // 1.2
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

    /**
     * Validate if a transfer is regulatory compliant
     */
    static validateTransfer(source: Site, target: Site): { valid: boolean; reason?: string } {
        // 1. DSCSA Compliance
        if (!target.regulatoryProfile.dscsaCompliant || !source.regulatoryProfile.dscsaCompliant) {
            return { valid: false, reason: 'DSCSA Violation: One or both sites are not compliant.' };
        }

        // 2. 340B Compliance
        if (target.regulatoryProfile.is340B !== source.regulatoryProfile.is340B) {
            return { valid: false, reason: `340B Mismatch: Cannot transfer between ${source.regulatoryProfile.is340B ? '340B' : 'Standard'} and ${target.regulatoryProfile.is340B ? '340B' : 'Standard'} sites.` };
        }

        return { valid: true };
    }

    /**
     * Analyze patient population at a site to predict future demand
     */
    static analyzePopulationDemand(_siteId: string, patients: any[]): { [condition: string]: number } {
        const sitePatients = patients.filter(_p =>
            // Mock logic: Assign patients to sites based on location name matching
            true
        );

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

    /**
     * Run the optimization algorithm
     */
    static generateProposals(
        sites: Site[],
        inventories: SiteInventory[],
        simulationResults: any[] = [], // Patient Data
        activeRequests: any[] = [] // Added active requests
    ): ProcurementProposal[] {
        const proposals: ProcurementProposal[] = [];
        const demandMap = new Map<string, { siteId: string, drugName: string, ndc: string, quantity: number, reason: string, priority?: string }>();

        // Helper to get incoming stock for a site/drug
        const getIncomingStock = (siteId: string, ndc: string) => {
            return activeRequests
                .filter(r => r.requestedBySite.id === siteId && r.drug.ndc === ndc && (r.status === 'pending' || r.status === 'approved' || r.status === 'in_transit'))
                .reduce((sum, r) => sum + r.drug.quantity, 0);
        };

        // 0. Pre-Analysis: Population Health Trends
        const sitePrevalenceMap = new Map<string, { [condition: string]: number }>();
        sites.forEach(s => {
            // Filter patients by site location name (mock linkage)
            const sitePatients = simulationResults.filter(p => p.location === s.name);
            const prevalence = this.analyzePopulationDemand(s.id, sitePatients);
            sitePrevalenceMap.set(s.id, prevalence);
        });

        // 1. Identify Demand from Inventory (Low/Critical Stock + Strategic Buys)
        inventories.forEach(inv => {
            const prevalence = sitePrevalenceMap.get(inv.siteId) || {};

            // Check for High Prevalence Categories (Mock: Oncology -> Chemotherapy)
            const isOncologyCenter = (prevalence['Lung Cancer'] || 0) > 0.3; // >30% Oncology

            inv.drugs.forEach(d => {
                const incoming = getIncomingStock(inv.siteId, d.ndc);

                // Strategic Adjustment: Increase Safety Stock for Key Conditions
                let effectiveMinLevel = d.minLevel;
                let strategicReason = '';

                // Mock Drug Classification Check
                if (isOncologyCenter && (d.drugName.includes('Cisplatin') || d.drugName.includes('Keytruda'))) {
                    effectiveMinLevel = d.minLevel * 1.5; // 50% Buffer
                    strategicReason = ` (Strategic: High Oncology Volume ${(prevalence['Lung Cancer'] * 100).toFixed(0)}%)`;
                }

                if (d.status === 'low' || d.status === 'critical' || d.quantity < effectiveMinLevel) {
                    const deficit = (d.maxLevel - d.quantity) - incoming;

                    if (deficit > 0) {
                        const key = `${inv.siteId}-${d.ndc}`;
                        // If strategic, mark as such
                        const reason = strategicReason
                            ? `Strategic Stocking: Buffer for Patient Demand${strategicReason}`
                            : `Low stock alert: ${d.quantity} remaining. Incoming: ${incoming}`;

                        demandMap.set(key, {
                            siteId: inv.siteId,
                            drugName: d.drugName,
                            ndc: d.ndc,
                            quantity: deficit,
                            reason: reason,
                            priority: strategicReason ? 'strategic' : 'routine'
                        });
                    }
                }
            });
        });

        // 2. Identify Demand from Patients (Simulation) - Unchanged/Simulated
        simulationResults.forEach(patient => {
            if (patient.status === 'Scheduled' || patient.status === 'Transport Needed') {
                const site = sites.find(s => s.name === patient.location) || sites[0];
                if (site) {
                    const inventory = inventories.find(inv => inv.siteId === site.id);
                    const drug = inventory?.drugs.find(d => d.drugName === patient.drug);

                    if (drug && drug.quantity < 100) {
                        const key = `${site.id}-${drug.ndc}`;
                        const existing = demandMap.get(key);
                        if (existing) {
                            existing.quantity += 1;
                            // existing.reason = `${existing.reason} + Patient Demand`; // Keep concise
                        } else {
                            demandMap.set(key, {
                                siteId: site.id,
                                drugName: drug.drugName,
                                ndc: drug.ndc,
                                quantity: 1,
                                reason: `Patient Demand: ${patient.patientName}`
                            });
                        }
                    }
                }
            }
        });

        // 3. Evaluate Options (AMIOP LOGIC)
        demandMap.forEach((demand) => {
            const targetSite = sites.find(s => s.id === demand.siteId);
            if (!targetSite) return;

            const neededQty = demand.quantity;
            const mockBasePrice = 100;
            const benchmarkCosts = this.calculateTotalCost(500, neededQty, mockBasePrice, 'routine');
            const benchmarkTotal = benchmarkCosts.total;

            const isOrphan = false;

            // ----------------------------------------------------
            // A. EVALUATE PROCUREMENT CHANNELS (WAC / GPO / 340B)
            // ----------------------------------------------------
            const channels: DrugChannel[] = ['WAC', 'GPO', '340B'];
            const channelOptions: ProcurementProposal[] = [];

            channels.forEach(channel => {
                const check = RegulatoryService.checkChannelEligibility(
                    targetSite,
                    channel,
                    isOrphan,
                    'outpatient'
                );

                if (check.allowed) {
                    let unitPrice = mockBasePrice;
                    if (channel === 'GPO') unitPrice = mockBasePrice * 0.75;
                    if (channel === '340B') unitPrice = mockBasePrice * 0.50;

                    const distance = 500;
                    const costs = this.calculateTotalCost(distance, neededQty, unitPrice, 'routine');

                    channelOptions.push({
                        id: `proc-${channel}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                        type: 'procurement',
                        channel: channel,
                        targetSiteId: targetSite.id,
                        targetSiteName: targetSite.name,
                        vendorName: 'McKesson',
                        drugName: demand.drugName,
                        ndc: demand.ndc,
                        quantity: neededQty,
                        costAnalysis: {
                            distanceKm: distance,
                            transportCost: costs.transport,
                            itemCost: costs.item,
                            totalCost: costs.total,
                            savings: benchmarkTotal - costs.total
                        },
                        fulfillmentNode: 'CentralPharmacy',
                        regulatoryJustification: {
                            passed: true,
                            details: [`Channel ${channel} eligible for ${targetSite.regulatoryAvatar}`],
                            riskScore: 0
                        },
                        reason: `${demand.reason}. Best configured ${channel} option.`,
                        score: 0
                    });
                }
            });

            // ----------------------------------------------------
            // B. EVALUATE NETWORK TRANSFERS (Own Use)
            // ----------------------------------------------------
            let bestTransfer: ProcurementProposal | null = null;

            for (const sourceInv of inventories) {
                if (sourceInv.siteId === demand.siteId) continue;
                const sourceItem = sourceInv.drugs.find(d => d.ndc === demand.ndc);

                if (sourceItem && (sourceItem.status === 'well_stocked' || sourceItem.status === 'overstocked') && sourceItem.quantity > neededQty) {
                    const sourceSite = sites.find(s => s.id === sourceInv.siteId);
                    if (sourceSite) {
                        const assumedChannel: DrugChannel = sourceSite.regulatoryProfile.is340B ? '340B' : 'WAC';

                        const compliance = RegulatoryService.checkTransferCompliance(
                            sourceSite,
                            targetSite,
                            assumedChannel,
                            demand.reason
                        );

                        if (!compliance.valid) continue;

                        const distance = this.calculateDistance(sourceSite, targetSite);
                        const costs = this.calculateTotalCost(distance, neededQty, 0, 'routine');

                        const proposal: ProcurementProposal = {
                            id: `trans-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                            type: 'transfer',
                            channel: assumedChannel,
                            targetSiteId: targetSite.id,
                            targetSiteName: targetSite.name,
                            sourceSiteId: sourceSite.id,
                            sourceSiteName: sourceSite.name,
                            drugName: demand.drugName,
                            ndc: demand.ndc,
                            quantity: neededQty,
                            costAnalysis: {
                                distanceKm: Math.round(distance),
                                transportCost: costs.transport,
                                itemCost: 0,
                                totalCost: costs.total,
                                savings: benchmarkTotal - costs.total
                            },
                            fulfillmentNode: 'DirectDrop',
                            regulatoryJustification: {
                                passed: true,
                                details: [
                                    `Wholesale Gate: ${compliance.gates?.wholesale}`,
                                    `DSCSA Gate: ${compliance.gates?.dscsa}`,
                                    `Diversion Gate: ${compliance.gates?.diversion}`
                                ],
                                riskScore: compliance.riskScore
                            },
                            reason: `Transfer from ${sourceSite.name} (${compliance.notes?.join(', ')})`,
                            score: 95
                        };

                        if (!bestTransfer || costs.total < bestTransfer.costAnalysis.totalCost) {
                            bestTransfer = proposal;
                        }
                    }
                }
            }

            // ----------------------------------------------------
            // C. RANKING & SELECTION
            // ----------------------------------------------------
            const allOptions = [...channelOptions];
            if (bestTransfer) {
                allOptions.push(bestTransfer);
            }

            allOptions.forEach(opt => {
                const ratio = opt.costAnalysis.totalCost / benchmarkTotal;
                let calculatedScore = Math.round(100 - (ratio * 50));

                if (opt.type === 'transfer') {
                    calculatedScore = 95 - (opt.costAnalysis.distanceKm / 100);
                } else {
                    if (opt.channel === '340B') calculatedScore = 90;
                    else if (opt.channel === 'GPO') calculatedScore = 80;
                    else calculatedScore = 60;
                }

                // Boost for Strategic Priorities
                if (demand.priority === 'strategic') {
                    calculatedScore += 5; // Slight nudge to ensure it's surfaced
                }

                opt.score = Math.min(Math.max(Math.round(calculatedScore), 0), 100);
            });

            allOptions.sort((a, b) => b.score - a.score);

            if (allOptions.length > 0) {
                proposals.push(allOptions[0]);
            }
        });

        return proposals.sort((a, b) => b.score - a.score);
    }
}
