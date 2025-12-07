import type { Site, SiteInventory, DrugInventoryItem, TransferSuggestion, TransportMethod } from '../../types/location';

export class AutoLogisticsService {
    // Haversine formula to calculate distance between two points in miles
    private calculateDistance(siteA: Site, siteB: Site): number {
        const R = 3958.8; // Earth's radius in miles
        const lat1 = siteA.coordinates.lat * (Math.PI / 180);
        const lat2 = siteB.coordinates.lat * (Math.PI / 180);
        const dLat = (siteB.coordinates.lat - siteA.coordinates.lat) * (Math.PI / 180);
        const dLon = (siteB.coordinates.lng - siteA.coordinates.lng) * (Math.PI / 180);

        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }

    private getPricing(method: TransportMethod, distanceMiles: number): number {
        const baseRates = {
            'drone': 15, // Base launch cost
            'courier_bike': 10,
            'courier_car': 25,
            'van_refrigerated': 50,
            'freight': 100
        };
        const ratesPerMile = {
            'drone': 0.5,
            'courier_bike': 1.5,
            'courier_car': 2.0,
            'van_refrigerated': 3.5,
            'freight': 1.0
        };
        return baseRates[method] + (ratesPerMile[method] * distanceMiles);
    }

    private getSpeed(method: TransportMethod): number { // mph
        switch (method) {
            case 'drone': return 45; // As the crow flies
            case 'courier_bike': return 12; // Urban traffic
            case 'courier_car': return 25; // Urban traffic
            case 'van_refrigerated': return 35;
            case 'freight': return 50;
        }
    }

    /**
     * Determines the optimal transport method based on specific rules:
     * 1. Cold Chain: IF drug needs refrigeration -> Refrigerated Van (unless emergency drone is certified, but let's stick to Van for now)
     * 2. Distance/Weight:
     *    - < 5 miles & small qty: Drone
     *    - < 5 miles & large qty: Bike Courier
     *    - > 5 miles: Car/Van
     * 3. Urgency: 'Emergency' upgrades speed (Drone/Direct Car)
     */
    private determineTransportMethod(
        distanceMiles: number,
        drugName: string,
        quantity: number,
        urgency: 'routine' | 'urgent' | 'emergency'
    ): TransportMethod {
        const isColdChain = ['Insulin', 'Vaccine', 'Biologic'].some(term => drugName.includes(term));
        const isHeavy = quantity > 50; // Mock weight threshold

        // Rule 1: Cold Chain
        if (isColdChain) {
            return 'van_refrigerated';
        }

        // Rule 2: Short Range High Speed (Drone check)
        if (distanceMiles < 5 && !isHeavy && urgency !== 'routine') {
            return 'drone';
        }

        // Rule 3: Short Range Urban
        if (distanceMiles < 3 && !isHeavy) {
            return 'courier_bike';
        }

        // Default to Car/Freight based on distance
        if (distanceMiles > 50 && urgency === 'routine') {
            return 'freight';
        }

        return 'courier_car';
    }

    public generateSuggestions(
        targetSite: Site,
        shortageItem: DrugInventoryItem,
        allSites: Site[],
        allInventories: SiteInventory[]
    ): TransferSuggestion[] {
        const suggestions: TransferSuggestion[] = [];

        // 1. Find potential sources (sites with surplus)
        const potentialSources = allInventories.filter(inv => {
            const hasItem = inv.drugs.find(d => d.ndc === shortageItem.ndc);
            return inv.siteId !== targetSite.id && hasItem && hasItem.quantity > hasItem.minLevel + 10; // Must have buffer
        });

        for (const sourceInv of potentialSources) {
            const sourceSite = allSites.find(s => s.id === sourceInv.siteId);
            if (!sourceSite) continue;

            const sourceItem = sourceInv.drugs.find(d => d.ndc === shortageItem.ndc)!;
            const distance = this.calculateDistance(targetSite, sourceSite);

            // Urgency Logic
            let urgency: 'routine' | 'urgent' | 'emergency' = 'routine';
            if (shortageItem.quantity === 0) urgency = 'emergency';
            else if (shortageItem.quantity < shortageItem.minLevel / 2) urgency = 'urgent';

            const transportMethod = this.determineTransportMethod(distance, shortageItem.drugName, shortageItem.maxLevel - shortageItem.quantity, urgency);
            const cost = this.getPricing(transportMethod, distance);
            const time = (distance / this.getSpeed(transportMethod)) * 60; // Minutes

            // NEW RULE: Patient Compliance / Specific Population Logic
            // If target site is Pediatric, prioritize Liquid/Chewable or specific concentrations (Mocked by checking name/FDA data)
            // Ideally we'd have this data in DrugInventoryItem, but we'll simulate "Specific Matching".
            const isPediatricSite = targetSite.type === 'clinic' && targetSite.name.toLowerCase().includes('pediatric');
            let complianceScore = 0;
            if (isPediatricSite) {
                // Mock: Prefer "Oral" or "Suspension" for Peds
                if (shortageItem.drugName.toLowerCase().includes('suspension') || shortageItem.drugName.toLowerCase().includes('liquid')) {
                    complianceScore = 20; // Bonus
                }
            }

            // NEW RULE: Predictive Stocking
            // If we are already sending a truck, can we fit other items that *will* be needed soon?
            // (Simplified: Boost score if source has HUGE surplus, implying we can batch more)
            const predictiveBonus = sourceItem.quantity > sourceItem.maxLevel * 1.5 ? 10 : 0;

            // Scoring Logic
            // Higher score = better candidate
            // Factors: Distance (lower is better), Stock Health (higher is better), Cost (lower is better)
            let score = 100;
            score -= (distance * 2); // -2 points per mile
            score -= (cost * 0.5); // -0.5 points per dollar
            if (urgency === 'emergency' && time < 60) score += 50; // Big bonus for speed in emergency

            score += complianceScore;
            score += predictiveBonus;

            suggestions.push({
                id: `sugg-${Date.now()}-${sourceSite.id}`,
                targetSiteId: targetSite.id,
                sourceSiteId: sourceSite.id,
                drugName: shortageItem.drugName,
                ndc: shortageItem.ndc,
                quantity: shortageItem.maxLevel - shortageItem.quantity, // Suggest filling to max
                urgency,
                priorityScore: Math.round(score),
                reason: [
                    `Distance: ${distance.toFixed(1)} miles`,
                    `Source Stock: ${sourceItem.quantity} units (Surplus)`,
                    `Transport: ${transportMethod.replace('_', ' ')}`,
                    ...(complianceScore > 0 ? ['Patient Match: Pediatric/Formulation Preferred'] : []),
                    ...(predictiveBonus > 0 ? ['Predictive: Optimization Opportunity (Batching)'] : [])
                ],
                transportMethod,
                estimatedCost: Math.round(cost),
                estimatedTimeMinutes: Math.round(time)
            });
        }

        // Return top 3 suggestions sorted by score
        return suggestions.sort((a, b) => b.priorityScore - a.priorityScore).slice(0, 3);
    }
}

export const autoLogisticsService = new AutoLogisticsService();
