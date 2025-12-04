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
    /**
     * Run the optimization algorithm
     */
    static generateProposals(
        sites: Site[],
        inventories: SiteInventory[],
        simulationResults: any[] = [],
        activeRequests: any[] = [] // Added active requests
    ): OptimizationProposal[] {
        const proposals: OptimizationProposal[] = [];
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
        // Aggregate demand by site and drug
        simulationResults.forEach(patient => {
            // Only consider active patients who need drugs
            if (patient.status === 'Scheduled' || patient.status === 'Transport Needed') {
                // Find the site (assuming patient.location matches site.name for simplicity, or map it)
                // In a real app, patient.locationId would be better.
                // For this demo, we'll try to match by name or default to the first site if not found (to ensure flow works)
                const site = sites.find(s => s.name === patient.location) || sites[0];

                if (site) {
                    // Check if site already has enough stock?
                    // For now, let's assume every patient creates a "demand signal" that we check against inventory
                    const inventory = inventories.find(inv => inv.siteId === site.id);
                    const drug = inventory?.drugs.find(d => d.drugName === patient.drug);

                    // If drug exists and we have enough, we might not need a proposal.
                    // But if we are "just in time", maybe we do.
                    // DEMO: Trigger if stock is less than 100 (High threshold for demo visibility)
                    if (drug && drug.quantity < 100) {
                        const key = `${site.id}-${drug.ndc}`;

                        const existing = demandMap.get(key);
                        if (existing) {
                            existing.quantity += 1;
                            existing.reason = `${existing.reason} + Patient Demand (${patient.patientName})`;
                        } else {
                            // But incoming might be for the low stock alert. 
                            // Let's add it to demandMap and let the logic handle it?
                            // Actually, let's just add it. The "deficit" logic above handles the inventory part.
                            // Here we are adding *extra* demand.

                            demandMap.set(key, {
                                siteId: site.id,
                                drugName: drug.drugName,
                                ndc: drug.ndc,
                                quantity: 1, // One unit per patient
                                reason: `Patient Demand: ${patient.patientName} needs ${patient.drug}`
                            });
                        }
                    }
                }
            }
        });

        // 3. Evaluate Options for each demand
        demandMap.forEach((demand) => {
            const targetSite = sites.find(s => s.id === demand.siteId);
            if (!targetSite) return;

            const neededQty = demand.quantity;
            const mockUnitPrice = 100; // Placeholder price

            // Option A: Procurement (Vendor)
            const vendorDistance = 500;
            const procurementCost = this.calculateTotalCost(vendorDistance, neededQty, mockUnitPrice, 'routine');

            // Option B: Network Transfer (Find best source)
            let bestTransferOption: { source: Site, cost: number, distance: number } | null = null;

            for (const sourceInv of inventories) {
                if (sourceInv.siteId === demand.siteId) continue; // Skip self

                const sourceItem = sourceInv.drugs.find(d => d.ndc === demand.ndc);
                // Only transfer if source has surplus
                if (sourceItem && (sourceItem.status === 'well_stocked' || sourceItem.status === 'overstocked') && sourceItem.quantity > neededQty) {
                    const sourceSite = sites.find(s => s.id === sourceInv.siteId);
                    if (sourceSite) {
                        // REGULATORY CHECK
                        if (!targetSite.regulatoryProfile.dscsaCompliant || !sourceSite.regulatoryProfile.dscsaCompliant) continue;
                        if (targetSite.regulatoryProfile.is340B !== sourceSite.regulatoryProfile.is340B) continue;

                        const distance = this.calculateDistance(sourceSite, targetSite);
                        const transferCost = this.calculateTotalCost(distance, neededQty, 0, 'routine');

                        if (!bestTransferOption || transferCost < bestTransferOption.cost) {
                            bestTransferOption = { source: sourceSite, cost: transferCost, distance };
                        }
                    }
                }
            }

            // 4. Decision Logic
            if (bestTransferOption && bestTransferOption.cost < procurementCost) {
                proposals.push({
                    id: `prop-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    type: 'transfer',
                    targetSiteId: targetSite.id,
                    targetSiteName: targetSite.name,
                    sourceSiteId: bestTransferOption.source.id,
                    sourceSiteName: bestTransferOption.source.name,
                    drugName: demand.drugName,
                    ndc: demand.ndc,
                    quantity: neededQty,
                    costAnalysis: {
                        distanceKm: Math.round(bestTransferOption.distance),
                        transportCost: Math.round(bestTransferOption.cost),
                        itemCost: 0,
                        totalCost: Math.round(bestTransferOption.cost),
                        savings: Math.round(procurementCost - bestTransferOption.cost)
                    },
                    reason: `${demand.reason}. Transfer from ${bestTransferOption.source.name} is cheaper.`,
                    score: 95
                });
            } else {
                proposals.push({
                    id: `prop-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    type: 'procurement',
                    targetSiteId: targetSite.id,
                    targetSiteName: targetSite.name,
                    vendorName: 'McKesson (Primary)',
                    drugName: demand.drugName,
                    ndc: demand.ndc,
                    quantity: neededQty,
                    costAnalysis: {
                        distanceKm: vendorDistance,
                        transportCost: Math.round(vendorDistance * this.TRANSPORT_RATE_PER_KM),
                        itemCost: Math.round(neededQty * mockUnitPrice),
                        totalCost: Math.round(procurementCost),
                        savings: 0
                    },
                    reason: `${demand.reason}. Procurement required.`,
                    score: 80
                });
            }
        });

        return proposals.sort((a, b) => b.score - a.score);
    }
}
