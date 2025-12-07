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
     * Run the optimization algorithm
     */
    static generateProposals(
        sites: Site[],
        inventories: SiteInventory[],
        simulationResults: any[] = [],
        activeRequests: any[] = [] // Added active requests
    ): ProcurementProposal[] {
        const proposals: ProcurementProposal[] = [];
        const demandMap = new Map<string, { siteId: string, drugName: string, ndc: string, quantity: number, reason: string }>();

        // Helper to get incoming stock for a site/drug
        const getIncomingStock = (siteId: string, ndc: string) => {
            return activeRequests
                .filter(r => r.requestedBySite.id === siteId && r.drug.ndc === ndc && (r.status === 'pending' || r.status === 'approved' || r.status === 'in_transit'))
                .reduce((sum, r) => sum + r.drug.quantity, 0);
        };

        // 1. Identify Demand from Inventory (Low/Critical Stock)
        inventories.forEach(inv => {
            inv.drugs.forEach(d => {
                if (d.status === 'low' || d.status === 'critical') {
                    const incoming = getIncomingStock(inv.siteId, d.ndc);
                    const deficit = (d.maxLevel - d.quantity) - incoming;

                    if (deficit > 0) {
                        const key = `${inv.siteId}-${d.ndc}`;
                        demandMap.set(key, {
                            siteId: inv.siteId,
                            drugName: d.drugName,
                            ndc: d.ndc,
                            quantity: deficit,
                            reason: `Low stock alert: ${d.quantity} remaining (Min: ${d.minLevel}). Incoming: ${incoming}`
                        });
                    }
                }
            });
        });

        // 2. Identify Demand from Patients (Simulation)
        simulationResults.forEach(patient => {
            if (patient.status === 'Scheduled' || patient.status === 'Transport Needed') {
                const site = sites.find(s => s.name === patient.location) || sites[0];
                if (site) {
                    const inventory = inventories.find(inv => inv.siteId === site.id);
                    const drug = inventory?.drugs.find(d => d.drugName === patient.drug);

                    // Simplistic demand aggregation
                    if (drug && drug.quantity < 100) {
                        const key = `${site.id}-${drug.ndc}`;
                        // ... (same accumulation logic)
                        const existing = demandMap.get(key);
                        if (existing) {
                            existing.quantity += 1;
                            existing.reason = `${existing.reason} + Patient Demand`;
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
            // BENCHMARK: Baseline WAC Purchase Landed Cost
            // Assumed Vendor Distance = 500km
            const benchmarkCosts = this.calculateTotalCost(500, neededQty, mockBasePrice, 'routine');
            const benchmarkTotal = benchmarkCosts.total;

            const isOrphan = false; // Mock; real app checks master data

            // ----------------------------------------------------
            // A. EVALUATE PROCUREMENT CHANNELS (WAC / GPO / 340B)
            // ----------------------------------------------------
            const channels: DrugChannel[] = ['WAC', 'GPO', '340B'];
            const channelOptions: ProcurementProposal[] = [];

            channels.forEach(channel => {
                // Regulatory Filter
                const check = RegulatoryService.checkChannelEligibility(
                    targetSite,
                    channel,
                    isOrphan,
                    'outpatient' // Assuming outpatient mostly for this demo
                );

                if (check.allowed) {
                    // Pricing Logic
                    let unitPrice = mockBasePrice;
                    if (channel === 'GPO') unitPrice = mockBasePrice * 0.75; // 25% off
                    if (channel === '340B') unitPrice = mockBasePrice * 0.50; // 50% off

                    const distance = 500; // Vendor
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
                        score: 0 // Calculated below
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

                // Only consider if stock sufficient
                if (sourceItem && (sourceItem.status === 'well_stocked' || sourceItem.status === 'overstocked') && sourceItem.quantity > neededQty) {
                    const sourceSite = sites.find(s => s.id === sourceInv.siteId);
                    if (sourceSite) {
                        // LOGIC GATES (3-Layer Check)
                        // Assume source stock might be 340B if source is 340B (Strict Case for Demo)
                        const assumedChannel: DrugChannel = sourceSite.regulatoryProfile.is340B ? '340B' : 'WAC';

                        const compliance = RegulatoryService.checkTransferCompliance(
                            sourceSite,
                            targetSite,
                            assumedChannel, // Testing the Hardest Path
                            demand.reason
                        );

                        // If HARD BLOCK (Wholesale or Diversion), skip.
                        if (!compliance.valid) continue;

                        const distance = this.calculateDistance(sourceSite, targetSite);
                        const costs = this.calculateTotalCost(distance, neededQty, 0, 'routine'); // 0 item cost internal

                        // Compare logic...
                        const proposal: ProcurementProposal = {
                            id: `trans-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                            type: 'transfer',
                            channel: assumedChannel, // Internal movement 
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
                                savings: benchmarkTotal - costs.total // This will be HUGE savings
                            },
                            fulfillmentNode: 'DirectDrop',
                            regulatoryJustification: {
                                passed: true,
                                // Show the Gate Trace!
                                details: [
                                    `Wholesale Gate: ${compliance.gates?.wholesale}`,
                                    `DSCSA Gate: ${compliance.gates?.dscsa}`,
                                    `Diversion Gate: ${compliance.gates?.diversion}`
                                ],
                                riskScore: compliance.riskScore // Metric for T3 complexity
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
                // Generally transfer is cheapest if closer
                allOptions.push(bestTransfer);
            }

            // Assign Scores based on COST EFFICIENCY mostly
            allOptions.forEach(opt => {
                // Linear Scoring: 100 * (1 - TotalCost / Benchmark)
                // If TotalCost > Benchmark (e.g. emergency shipping), score drops.
                // If TotalCost = 0 (impossible), score = 100.

                // Base score on savings percentage
                const ratio = opt.costAnalysis.totalCost / benchmarkTotal;
                let calculatedScore = Math.round(100 - (ratio * 50)); // Baseline 50 points if cost = benchmark. 
                // Using simple heuristic for now:

                if (opt.type === 'transfer') {
                    // Prioritize transfers strongly if cost effective
                    calculatedScore = 95 - (opt.costAnalysis.distanceKm / 100);
                } else {
                    // Procurement ranking
                    if (opt.channel === '340B') calculatedScore = 90;
                    else if (opt.channel === 'GPO') calculatedScore = 80;
                    else calculatedScore = 60;
                }
                opt.score = Math.min(Math.max(Math.round(calculatedScore), 0), 100);
            });

            // Sort by score
            allOptions.sort((a, b) => b.score - a.score);

            // Pick TOP choice
            if (allOptions.length > 0) {
                proposals.push(allOptions[0]);
            }
        });

        return proposals.sort((a, b) => b.score - a.score);
    }
}
