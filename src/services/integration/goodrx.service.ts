import type { SupplierQuote } from '../../types/supplier';

export class GoodRxService {
    // private static readonly API_URL = 'https://api.goodrx.com/v2';
    private static readonly API_KEY = import.meta.env.VITE_GOODRX_API_KEY;

    /**
     * Get retail price comparison from GoodRx
     */
    static async getQuote(ndc: string, _quantity: number): Promise<SupplierQuote | null> {
        if (!this.API_KEY) {
            return null;
        }

        try {
            // Real API wrapper would go here
            await new Promise(resolve => setTimeout(resolve, 400));

            return {
                supplierId: 'goodrx',
                ndc,
                price: 125.50, // Usually higher/different than distributor
                priceTrend: 'down',
                availableQuantity: 9999, // Retail usually has stock
                deliveryDate: new Date().toISOString(), // Immediate pickup
                moq: 1,
                manufacturer: 'Retail Pharmacy Network',
                isRealTime: true,
                // @ts-ignore
                type: 'Retail'
            };

        } catch (error) {
            console.error("GoodRx API Failed:", error);
            return null;
        }
    }
}
