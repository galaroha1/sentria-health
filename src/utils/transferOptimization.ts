import type { SiteInventory, Site } from '../types/location';

export interface TransferCandidate {
    siteId: string;
    siteName: string;
    availableQuantity: number;
    distance: string; // Mocked for now
    status: 'well_stocked' | 'overstocked';
}

/**
 * Finds sites that have sufficient stock of a specific drug.
 * Prioritizes 'overstocked' sites, then 'well_stocked'.
 */
export function findTransferCandidates(
    inventories: SiteInventory[],
    sites: Site[],
    drugName: string,
    excludeSiteId?: string
): TransferCandidate[] {
    const candidates: TransferCandidate[] = [];

    inventories.forEach(inv => {
        // Skip the requesting site
        if (inv.siteId === excludeSiteId) return;

        const drug = inv.drugs.find(d => d.drugName === drugName);

        // Only consider sites with healthy stock levels
        if (drug && (drug.status === 'well_stocked' || drug.status === 'overstocked')) {
            const site = sites.find(s => s.id === inv.siteId);
            if (site) {
                candidates.push({
                    siteId: site.id,
                    siteName: site.name,
                    availableQuantity: drug.quantity,
                    distance: `${Math.floor(Math.random() * 15) + 1} miles`, // Mock distance
                    status: drug.status
                });
            }
        }
    });

    // Sort by status (overstocked first) then by quantity (descending)
    return candidates.sort((a, b) => {
        if (a.status === 'overstocked' && b.status !== 'overstocked') return -1;
        if (a.status !== 'overstocked' && b.status === 'overstocked') return 1;
        return b.availableQuantity - a.availableQuantity;
    });
}
