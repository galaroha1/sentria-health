import type { SupplierQuote } from '../../types/supplier';
import { SystemSettingsService } from '../system-settings.service';

export class McKessonService {
    private static readonly API_URL = 'https://mms.mckesson.com/api/v1';

    /**
     * Fetch live price from McKesson Connect
     * Requires VITE_MCKESSON_API_KEY in .env
     */
    static async getQuote(ndc: string, quantity: number, apiKeyOverride?: string): Promise<SupplierQuote | null> {
        let apiKey = apiKeyOverride;
        if (!apiKey) {
            apiKey = await SystemSettingsService.getSecret('VITE_MCKESSON_API_KEY');
        }

        const accountId = await SystemSettingsService.getSecret('VITE_MCKESSON_ACCOUNT_ID');

        if (!apiKey || !accountId) {
            console.warn("McKesson API Keys missing. Cannot fetch real quote.");
            return null;
        }

        try {
            // REAL API CALL
            // Using production endpoint structure
            const response = await fetch(`${this.API_URL}/product/price`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'Account-Id': accountId
                },
                body: JSON.stringify({ items: [{ ndc, quantity }] })
            });

            if (!response.ok) {
                console.error(`McKesson API Error: ${response.status} ${response.statusText}`);
                return null;
            }

            const data = await response.json();

            // Map real response to our structure
            // Note: Actual response shape depends on specific McKesson API version
            return {
                supplierId: 'mckesson',
                ndc,
                price: typeof data.price === 'number' ? data.price : 0,
                priceTrend: data.trend || 'stable',
                availableQuantity: data.stock || 0,
                deliveryDate: data.estimated_delivery || new Date(Date.now() + 24 * 3600000).toISOString(),
                moq: data.moq || 1,
                isRealTime: true,
                quoteType: 'Distributor'
            };

        } catch (error) {
            console.error("McKesson API Connection Failed:", error);
            return null;
        }
    }
}
