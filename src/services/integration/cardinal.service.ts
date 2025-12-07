import type { SupplierQuote } from '../../types/supplier';
import { SystemSettingsService } from '../system-settings.service';

export class CardinalService {
    private static readonly API_URL = 'https://orderexpress.cardinalhealth.com/api/v2';


    /**
     * Fetch live price from Cardinal Order Express
     * Requires VITE_CARDINAL_API_KEY in .env
     */
    static async getQuote(ndc: string, quantity: number): Promise<SupplierQuote | null> {
        const apiKey = await SystemSettingsService.getSecret('VITE_CARDINAL_API_KEY');

        if (!apiKey) {
            console.warn("Cardinal API Keys missing. Cannot fetch real quote.");
            return null;
        }

        try {
            // REAL API CALL
            const response = await fetch(`${this.API_URL}/orders/quote`, {
                method: 'POST',
                headers: {
                    'x-api-key': apiKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ndc, qty: quantity })
            });

            if (!response.ok) {
                console.error(`Cardinal API Error: ${response.status}`);
                return null;
            }

            const data = await response.json();

            // Map response
            return {
                supplierId: 'cardinal',
                ndc,
                price: data.unit_price || 0,
                priceTrend: data.price_trend || 'stable',
                availableQuantity: data.availability || 0,
                deliveryDate: data.delivery_date || new Date(Date.now() + 18 * 3600000).toISOString(),
                moq: data.min_order_qty || 1,
                isRealTime: true,
                quoteType: 'Distributor'
            };

        } catch (error) {
            console.error("Cardinal API Connection Failed:", error);
            return null;
        }
    }
}
