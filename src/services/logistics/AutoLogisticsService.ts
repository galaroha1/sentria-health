import type { Site, SiteInventory, DrugInventoryItem, TransferSuggestion, TransportMethod } from '../../types/location';
import { marketplaceService } from '../marketplaceService';


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

    public async generateSuggestions(
        targetSite: Site,
        shortageItem: DrugInventoryItem,
        allSites: Site[],
        allInventories: SiteInventory[],
        patientContext?: { condition: 'critical' | 'stable', visitDate?: Date, weight?: number }
    ): Promise<TransferSuggestion[]> {
        const suggestions: TransferSuggestion[] = [];

        // --- OPTION A: INTERNAL & NETWORK TRANSFERS ---
        const potentialSources = allInventories.filter(inv => {
            const hasItem = inv.drugs.find(d => d.ndc === shortageItem.ndc);
            // Allow if:
            // 1. Different Site
            // 2. SAME Site but Different Department (Internal Transfer) 
            // Simplified: If siteIds match, we need to ensure we aren't transferring from the EXACT same inventory source.
            // Since `generateSuggestions` is usually called for a site (and implicitly a department context isn't passed yet), 
            // valid transfers are any OTHER inventory pool that has the item.
            // Assumption: The `shortageItem` comes from a specific inventory pool (targetSite + targetDept). 
            // But currently the signature is `targetSite`. We'll assume any OTHER inventory ID is valid.

            // Better Logic:
            // We don't have the "Target Inventory ID" passed in, just Target Site.
            // But we know the shortage exists at 'targetSite'. 
            // We should ideally filter out the inventory that represents the shortage? 
            // Actually, `allInventories` contains ALL. 
            // If we are looking for sources, ANY inventory that has > minLevel is a source. 
            // We just need to handle the "Self" case if we knew exactly which dept was requesting.

            // For now, allow ALL valid sources. We will score 0 distance for same-site.
            return hasItem && hasItem.quantity > hasItem.minLevel;
        });

        for (const sourceInv of potentialSources) {
            const sourceSite = allSites.find(s => s.id === sourceInv.siteId);
            if (!sourceSite) continue;

            const sourceItem = sourceInv.drugs.find(d => d.ndc === shortageItem.ndc)!;

            // Calculate Distance
            let distance = 0;
            let isInternal = false;

            if (sourceSite.id === targetSite.id) {
                // INTERNAL TRANSFER
                isInternal = true;
                distance = 0.5; // negligible distance (e.g. across campus)
                // If same site, we must assume different department purely by the fact we are looking for a SOURCE
                // and the "Target" implies the one having the shortage.
            } else {
                distance = this.calculateDistance(targetSite, sourceSite);
            }

            // Urgency Logic
            let urgency: 'routine' | 'urgent' | 'emergency' = 'routine';
            if (shortageItem.quantity === 0) urgency = 'emergency';
            else if (shortageItem.quantity < shortageItem.minLevel / 2) urgency = 'urgent';

            // Patient Override
            if (patientContext?.condition === 'critical') urgency = 'emergency';

            // Transport Method
            let transportMethod = this.determineTransportMethod(distance, shortageItem.drugName, shortageItem.maxLevel - shortageItem.quantity, urgency);

            // Override for Internal
            if (isInternal) transportMethod = 'courier_bike'; // Or 'technician_runner'

            const cost = this.getPricing(transportMethod, distance);

            const speed = this.getSpeed(transportMethod);
            const traffic = this.getTrafficMultiplier(transportMethod);
            // Internal transfers are faster/easier
            const handling = isInternal ? 15 : this.getHandlingTime(transportMethod);
            const weatherDelay = isInternal ? 0 : (Math.random() > 0.8 ? 10 : 0);

            // ----------------------------------------------------------------
            // AUTO LOGISTICS EQUATION
            // Total Time (min) = (Travel Time * Traffic) + Handling + Weather
            // ----------------------------------------------------------------
            // 1. Travel Time = (Distance / Speed in mph) * 60
            // 2. Traffic Multiplier = 1.0 (Drone) to 1.4 (Car in bad traffic)
            // 3. Handling Time = Fixed cost per method (e.g., 5 min drone, 45 min freight)
            // 4. Weather Delay = 20% chance of +10 mins
            // ----------------------------------------------------------------
            const travelTime = (distance / speed) * 60 * traffic;
            const totalTime = travelTime + handling + weatherDelay;

            // Scoring
            let score = 100;
            score -= (distance * 1.5);
            score -= (cost * 0.2);
            score -= (totalTime * 0.1);
            if (urgency === 'emergency' && totalTime < 60) score += 50;

            // Internal Transfer Bonus (Huge preference)
            if (isInternal) {
                score += 40;
            }

            const maxAcceptable = shortageItem.maxLevel - shortageItem.quantity;
            const maxAvailable = sourceItem.quantity - sourceItem.minLevel;
            const transferQty = Math.min(maxAcceptable, maxAvailable);

            if (transferQty <= 0) continue;

            // Identify Source Department
            let sourceLabel = sourceSite.name;
            if (sourceInv.departmentId) {
                const dept = sourceSite.departments.find(d => d.id === sourceInv.departmentId);
                if (dept) sourceLabel = `${dept.name} @ ${sourceSite.name}`;
            }

            const reasons: string[] = [`${transportMethod.replace('_', ' ')} (${Math.round(totalTime)} min)`];
            if (isInternal) reasons.push('Internal Transfer (Fastest)');

            if (sourceItem.quantity > sourceItem.maxLevel) {
                score += 20;
                reasons.push('Clearing excess stock');
            }

            suggestions.push({
                id: `transfer-${Date.now()}-${sourceInv.siteId}-${sourceInv.departmentId || 'main'}`,
                targetSiteId: targetSite.id,
                sourceSiteId: sourceSite.id,
                action: 'transfer',
                drugName: shortageItem.drugName,
                ndc: shortageItem.ndc,
                quantity: transferQty,
                urgency,
                priorityScore: Math.min(100, Math.max(0, Math.round(score))),
                reason: reasons,
                transportMethod,
                estimatedCost: Math.round(cost),
                estimatedTimeMinutes: Math.round(totalTime),
                sourceDepartmentName: sourceLabel
            });
        }

        // --- OPTION B: MARKETPLACE BUY ---
        // Only check if we have a shortage
        if (shortageItem.quantity < shortageItem.minLevel) {

            const marketItem = await marketplaceService.checkMarketplace(shortageItem.ndc);

            if (marketItem && marketItem.inStock) {
                const qtyNeeded = shortageItem.maxLevel - shortageItem.quantity;
                const totalMarketCost = (marketItem.price * qtyNeeded) + 15; // +$15 shipping
                const marketTimeMinutes = marketItem.leadTimeDays * 24 * 60;

                // Decision Logic: Compare against best Transfer option
                const bestTransfer = suggestions.sort((a, b) => b.priorityScore - a.priorityScore)[0];

                let buyScore = 60; // Base score
                const reasons: string[] = [`Market: $${marketItem.price.toFixed(2)}/unit from ${marketItem.supplier}`];

                // 1. Cost Comparison
                if (bestTransfer) {
                    if (totalMarketCost < bestTransfer.estimatedCost) {
                        buyScore += 30;
                        reasons.push(`Save $${(bestTransfer.estimatedCost - totalMarketCost).toFixed(0)} vs Transfer`);
                    } else {
                        buyScore -= 10;
                    }
                }

                // 2. Time/Deadline Check
                if (patientContext?.visitDate) {
                    const minutesToVisit = (patientContext.visitDate.getTime() - Date.now()) / 60000;
                    if (marketTimeMinutes > minutesToVisit) {
                        buyScore -= 50; // Too slow!
                        reasons.push('Arrives after patient visit');
                    } else {
                        buyScore += 10;
                    }
                }

                suggestions.push({
                    id: `buy-${Date.now()}`,
                    targetSiteId: targetSite.id,
                    externalSourceId: marketItem.supplier,
                    action: 'buy',
                    drugName: shortageItem.drugName,
                    ndc: shortageItem.ndc,
                    quantity: qtyNeeded,
                    urgency: 'routine', // Buying is usually routine unless expedited (not impl here)
                    priorityScore: Math.min(100, Math.max(0, Math.round(buyScore))),
                    reason: reasons,
                    transportMethod: 'shipping_standard',
                    estimatedCost: Math.round(totalMarketCost),
                    estimatedTimeMinutes: marketTimeMinutes
                });
            }
        }

        return suggestions.sort((a, b) => b.priorityScore - a.priorityScore).slice(0, 3);
    }
}

export const autoLogisticsService = new AutoLogisticsService();
