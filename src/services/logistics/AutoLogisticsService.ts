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

    private getHandlingTime(method: TransportMethod): number { // minutes
        switch (method) {
            case 'drone': return 5; // Launch check + landing
            case 'courier_bike': return 10; // Handoff + lock up
            case 'courier_car': return 15; // Parking + reception
            case 'van_refrigerated': return 20; // Loading + temp check
            case 'freight': return 45; // Docking + pallet jack
        }
    }

    private getTrafficMultiplier(method: TransportMethod): number {
        // Base traffic multiplier
        const randomFactor = 1 + (Math.random() * 0.4); // 1.0 - 1.4

        // Drones ignore traffic
        if (method === 'drone') return 1.0;

        // Bikes filter through traffic better
        if (method === 'courier_bike') return Math.min(randomFactor, 1.2);

        return randomFactor;
    }

    private getSpeed(method: TransportMethod): number { // mph
        switch (method) {
            case 'drone': return 60; // Upgraded from 45
            case 'courier_bike': return 12;
            case 'courier_car': return 25;
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

        // 1. Find potential sources (sites with ANY surplus)
        // Relaxed Rule: Old was +10, New is simply > minLevel (we can refine "Surplus" later)
        const potentialSources = allInventories.filter(inv => {
            const hasItem = inv.drugs.find(d => d.ndc === shortageItem.ndc);
            // Must be different site, have item, and have at least 1 unit above minLevel
            return inv.siteId !== targetSite.id && hasItem && hasItem.quantity > hasItem.minLevel;
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

            // NEW LOGISTICS EQUATION
            // Time = ((Distance / Speed) * Traffic) + Handling + Weather
            const speed = this.getSpeed(transportMethod);
            const traffic = this.getTrafficMultiplier(transportMethod);
            const handling = this.getHandlingTime(transportMethod);
            const weatherDelay = Math.random() > 0.8 ? 10 : 0; // 20% chance of weather delay

            const travelTime = (distance / speed) * 60 * traffic;
            const totalTime = travelTime + handling + weatherDelay;

            // NEW RULE: Patient Compliance / Specific Population Logic
            const isPediatricSite = targetSite.type === 'clinic' && targetSite.name.toLowerCase().includes('pediatric');
            let complianceScore = 0;
            if (isPediatricSite) {
                if (shortageItem.drugName.toLowerCase().includes('suspension') || shortageItem.drugName.toLowerCase().includes('liquid')) {
                    complianceScore = 20; // Bonus
                }
            }

            // NEW RULE: Predictive Stocking & Load Balancing
            // If source has massive overstock (> maxLevel), we should aggressively move it to balance the network
            let balancingBonus = 0;
            const sourceSurplus = sourceItem.quantity - sourceItem.minLevel;
            if (sourceItem.quantity > sourceItem.maxLevel) {
                balancingBonus = 30; // High priority to clear overstock
            } else if (sourceSurplus > 20) {
                balancingBonus = 10; // Moderate priority
            }

            // Scoring Logic
            let score = 100;
            score -= (distance * 1.5); // lower penalty for distance to encourage implementation
            score -= (cost * 0.2); // lower penalty for cost
            score -= (totalTime * 0.1); // Time penalty

            if (urgency === 'emergency' && totalTime < 60) score += 50;
            if (urgency === 'urgent') score += 20;

            score += complianceScore;
            score += balancingBonus;

            // Generate "Smart" Reasoning
            const reasons: string[] = [];
            if (balancingBonus > 20) reasons.push(`Network Balancing: Clearing excess stock from ${sourceSite.name}`);
            else if (sourceSurplus > 50) reasons.push(`Source has high surplus (${sourceItem.quantity} units)`);

            reasons.push(`${transportMethod.replace('_', ' ')} (${Math.round(totalTime)} min)`);
            if (weatherDelay > 0) reasons.push('Includes weather delay adjustment');

            if (distance < 5) reasons.push(`Hyper-local transfer (${distance.toFixed(1)} miles)`);
            else reasons.push(`Optimal Route: ${distance.toFixed(1)} miles`);

            if (complianceScore > 0) reasons.push('Patient Compliance: Formulation match for pediatric site');
            if (urgency === 'emergency') reasons.push('Critical: Immediate stock restoration required');

            // Calculate optimal quantity to transfer
            const maxAcceptable = shortageItem.maxLevel - shortageItem.quantity;
            const maxAvailable = sourceItem.quantity - sourceItem.minLevel;
            const transferQty = Math.min(maxAcceptable, maxAvailable);

            if (transferQty <= 0) continue;

            suggestions.push({
                id: `sugg-${Date.now()}-${sourceSite.id}`,
                targetSiteId: targetSite.id,
                sourceSiteId: sourceSite.id,
                drugName: shortageItem.drugName,
                ndc: shortageItem.ndc,
                quantity: transferQty,
                urgency,
                priorityScore: Math.round(score),
                reason: reasons.slice(0, 3), // Top 3 reasons
                transportMethod,
                estimatedCost: Math.round(cost),
                estimatedTimeMinutes: Math.round(totalTime)
            });
        }

        // Return top suggestions
        return suggestions.sort((a, b) => b.priorityScore - a.priorityScore).slice(0, 3);
    }
}

export const autoLogisticsService = new AutoLogisticsService();
