
export interface PreferenceCardItem {
    itemId: string;
    name: string;
    quantity: number;
    openStatus: 'hold' | 'open';
}

export interface PreferenceCard {
    id: string;
    procedureName: string;
    surgeonName: string;
    items: PreferenceCardItem[];
}

export interface UsageReport {
    procedureId: string;
    itemsUsed: { itemId: string; quantity: number }[];
}

export interface OptimizationRecommendation {
    itemId: string;
    itemName: string;
    currentQty: number;
    avgUsed: number;
    recommendation: 'reduce_qty' | 'change_to_hold' | 'remove';
    potentialSavings: number;
}

export const clinicalService = {
    /**
     * Analyze usage data to optimize preference cards.
     * Identifies items that are consistently opened but not used (waste).
     */
    analyzePreferenceCard(
        card: PreferenceCard,
        history: UsageReport[]
    ): OptimizationRecommendation[] {
        const recommendations: OptimizationRecommendation[] = [];

        card.items.forEach(item => {
            // Calculate average usage across all historical cases
            const totalUsed = history.reduce((sum, report) => {
                const usedItem = report.itemsUsed.find(i => i.itemId === item.itemId);
                return sum + (usedItem ? usedItem.quantity : 0);
            }, 0);

            const avgUsed = totalUsed / history.length;
            const variance = item.quantity - avgUsed;

            // Logic: If we are opening more than we use consistently
            if (item.openStatus === 'open' && variance > 0.5) {
                recommendations.push({
                    itemId: item.itemId,
                    itemName: item.name,
                    currentQty: item.quantity,
                    avgUsed: Number(avgUsed.toFixed(1)),
                    recommendation: avgUsed === 0 ? 'change_to_hold' : 'reduce_qty',
                    potentialSavings: variance * 15 // Mock cost per item
                });
            }
        });

        return recommendations;
    },

    /**
     * Submit a new product for Value Analysis Committee (VAC) review.
     */
    submitValueAnalysisRequest(productName: string, justification: string, costImpact: number) {
        return {
            id: Math.random().toString(36).substr(2, 9),
            status: 'pending_review',
            submittedAt: new Date().toISOString(),
            productName,
            justification,
            costImpact
        };
    }
};
