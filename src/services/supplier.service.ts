import type { Supplier, SupplierQuote, MarketSignal } from '../types/supplier';

const SUPPLIERS: Supplier[] = [
    { id: 'mckesson', name: 'McKesson', logo: 'MK', reliabilityScore: 98, averageDeliveryTimeHours: 24 },
    { id: 'cardinal', name: 'Cardinal Health', logo: 'CH', reliabilityScore: 96, averageDeliveryTimeHours: 18 },
    { id: 'amerisource', name: 'AmerisourceBergen', logo: 'AB', reliabilityScore: 94, averageDeliveryTimeHours: 36 }
];

export class SupplierService {

    /**
     * Get real-time quotes for a specific drug from all connected suppliers
     */
    static async getQuotes(ndc: string, _quantity: number): Promise<SupplierQuote[]> {
        // Simulate API latency
        await new Promise(resolve => setTimeout(resolve, 800));

        const basePrice = this.getBasePrice(ndc);

        return SUPPLIERS.map(supplier => {
            // Price variation +/- 5%
            const variance = (Math.random() * 0.1) - 0.05;
            const price = basePrice * (1 + variance);

            // Delivery simulation
            const deliveryDate = new Date();
            deliveryDate.setHours(deliveryDate.getHours() + supplier.averageDeliveryTimeHours + (Math.random() * 4));

            return {
                supplierId: supplier.id,
                ndc,
                price: parseFloat(price.toFixed(2)),
                priceTrend: Math.random() > 0.7 ? 'down' : Math.random() > 0.7 ? 'up' : 'stable',
                availableQuantity: Math.floor(Math.random() * 5000) + 100,
                deliveryDate: deliveryDate.toISOString(),
                moq: 10
            };
        });
    }

    /**
     * Get live market intelligence signals (e.g., price drops, shortages)
     */
    static getMarketSignals(): MarketSignal[] {
        // In a real app, this would come from a websocket or polling
        const signals: MarketSignal[] = [];

        // Generate a few random signals
        if (Math.random() > 0.5) {
            signals.push({
                id: `sig-${Date.now()}-1`,
                drugName: 'Keytruda',
                ndc: '00006-3026-02',
                type: 'price_drop',
                severity: 'opportunity',
                message: 'Price dropped 5% at McKesson. Valid for 24h.',
                timestamp: new Date().toISOString(),
                source: 'mckesson'
            });
        }

        if (Math.random() > 0.7) {
            signals.push({
                id: `sig-${Date.now()}-2`,
                drugName: 'Amoxicillin',
                ndc: '00378-0245-05',
                type: 'shortage_risk',
                severity: 'warning',
                message: 'Cardinal reporting low stock due to supply chain disruption.',
                timestamp: new Date().toISOString(),
                source: 'cardinal'
            });
        }

        return signals;
    }

    private static getBasePrice(ndc: string): number {
        // Mock lookup. In reality, query central DB.
        // Hash the NDC to get a consistent pseudo-random price
        let hash = 0;
        for (let i = 0; i < ndc.length; i++) {
            hash = ((hash << 5) - hash) + ndc.charCodeAt(i);
            hash |= 0;
        }
        return (Math.abs(hash) % 500) + 50; // Price between $50 and $550
    }
}

export const SUPPLIER_LIST = SUPPLIERS;
