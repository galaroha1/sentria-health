import type { Site, SiteInventory } from '../types/location';

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
    private static calculateTotalCost(
        distanceKm: number,
        quantity: number,
        unitPrice: number,
        urgency: 'routine' | 'urgent' | 'emergency'
    ): number {
        const transportCost = (distanceKm * this.TRANSPORT_RATE_PER_KM) + this.BASE_PROCESSING_FEE;
        const itemCost = quantity * unitPrice;

        let multiplier = 1.0;
        if (urgency === 'urgent') multiplier = this.URGENCY_MULTIPLIER; // 1.2
        if (urgency === 'emergency') multiplier = 1.5;

        return (transportCost * multiplier) + itemCost;
    }

    /**
     * Run the optimization algorithm
     */
    static generateProposals(
        sites: Site[],
        inventories: SiteInventory[]
    ): OptimizationProposal[] {
        const proposals: OptimizationProposal[] = [];

        // 1. Identify Demand (Sites with 'low' or 'critical' stock)
        const demandSites = inventories.flatMap(inv =>
            inv.drugs
                .filter(d => d.status === 'low' || d.status === 'critical')
                .map(d => ({ siteId: inv.siteId, drug: d }))
        );

        // 2. Evaluate Options for each demand
        demandSites.forEach(({ siteId, drug }) => {
            const targetSite = sites.find(s => s.id === siteId);
            if (!targetSite) return;

            const neededQty = drug.maxLevel - drug.quantity;
            const mockUnitPrice = 100; // Placeholder price

            // Option A: Procurement (Vendor)
            // Assume vendor is "far" (e.g., 500km) but has infinite stock
            const vendorDistance = 500;
            const procurementCost = this.calculateTotalCost(vendorDistance, neededQty, mockUnitPrice, 'routine');

            // Option B: Network Transfer (Find best source)
            let bestTransferOption: { source: Site, cost: number, distance: number } | null = null;

            for (const sourceInv of inventories) {
                if (sourceInv.siteId === siteId) continue; // Skip self

                const sourceItem = sourceInv.drugs.find(d => d.ndc === drug.ndc);
                // Only transfer if source has surplus (well_stocked or overstocked) AND enough qty
                if (sourceItem && (sourceItem.status === 'well_stocked' || sourceItem.status === 'overstocked') && sourceItem.quantity > neededQty) {
                    const sourceSite = sites.find(s => s.id === sourceInv.siteId);
                    if (sourceSite) {
                        // REGULATORY CHECK: 340B Compliance & DSCSA
                        // 1. DSCSA Compliance: Both sites must be compliant
                        if (!targetSite.regulatoryProfile.dscsaCompliant || !sourceSite.regulatoryProfile.dscsaCompliant) {
                            continue; // Block: Security risk
                        }

                        // 2. 340B Compliance: Strict separation
                        if (targetSite.regulatoryProfile.is340B !== sourceSite.regulatoryProfile.is340B) {
                            continue; // Block: Regulatory mismatch
                        }

                        const distance = this.calculateDistance(sourceSite, targetSite);
                        const transferCost = this.calculateTotalCost(distance, neededQty, 0, 'routine');

                        if (!bestTransferOption || transferCost < bestTransferOption.cost) {
                            bestTransferOption = { source: sourceSite, cost: transferCost, distance };
                        }
                    }
                }
            }

            // 3. Decision Logic
            if (bestTransferOption && bestTransferOption.cost < procurementCost) {
                // Propose Transfer
                proposals.push({
                    id: `prop-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    type: 'transfer',
                    targetSiteId: targetSite.id,
                    targetSiteName: targetSite.name,
                    sourceSiteId: bestTransferOption.source.id,
                    sourceSiteName: bestTransferOption.source.name,
                    drugName: drug.drugName,
                    ndc: drug.ndc,
                    quantity: neededQty,
                    costAnalysis: {
                        distanceKm: Math.round(bestTransferOption.distance),
                        transportCost: Math.round(bestTransferOption.cost), // Since item cost is 0
                        itemCost: 0,
                        totalCost: Math.round(bestTransferOption.cost),
                        savings: Math.round(procurementCost - bestTransferOption.cost)
                    },
                    reason: `Transfer from ${bestTransferOption.source.name} is $${Math.round(procurementCost - bestTransferOption.cost)} cheaper than procurement. (Regulatory Check: PASSED)`,
                    score: 95
                });
            } else {
                // Propose Procurement (if critical or no transfer option)
                // Only propose if critical to avoid spamming routine orders? 
                // For this demo, let's propose it.
                proposals.push({
                    id: `prop-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    type: 'procurement',
                    targetSiteId: targetSite.id,
                    targetSiteName: targetSite.name,
                    vendorName: 'McKesson (Primary)',
                    drugName: drug.drugName,
                    ndc: drug.ndc,
                    quantity: neededQty,
                    costAnalysis: {
                        distanceKm: vendorDistance,
                        transportCost: Math.round(vendorDistance * this.TRANSPORT_RATE_PER_KM),
                        itemCost: Math.round(neededQty * mockUnitPrice),
                        totalCost: Math.round(procurementCost),
                        savings: 0
                    },
                    reason: 'No internal surplus available or regulatory restrictions apply. Procurement required.',
                    score: 80
                });
            }
        });

        return proposals.sort((a, b) => b.score - a.score);
    }
}
