import type { Supplier, SupplierQuote, MarketSignal } from '../types/supplier';
import { McKessonService } from './integration/mckesson.service';
import { CardinalService } from './integration/cardinal.service';
import { GoodRxService } from './integration/goodrx.service';
import { ExpressScriptsService } from './integration/express-scripts.service';
import { FdaService } from './integration/fda.service';

const SUPPLIERS: Supplier[] = [
    { id: 'mckesson', name: 'McKesson', logo: 'MK', reliabilityScore: 98, averageDeliveryTimeHours: 24 },
    { id: 'cardinal', name: 'Cardinal Health', logo: 'CH', reliabilityScore: 96, averageDeliveryTimeHours: 18 },
    { id: 'amerisource', name: 'AmerisourceBergen', logo: 'AB', reliabilityScore: 94, averageDeliveryTimeHours: 36 }
];

export class SupplierService {

    /**
     * Get real-time quotes for a specific drug from all connected suppliers
     */
    static async getQuotes(ndc: string, quantity: number): Promise<SupplierQuote[]> {
        // 1. Fetch FDA Metadata (Parallel)
        const fdaPromise = FdaService.getDrugDetails(ndc);

        // 2. Fetch Real Quotes (Parallel)
        const realQuotesPromises = [
            McKessonService.getQuote(ndc, quantity),
            CardinalService.getQuote(ndc, quantity),
            GoodRxService.getQuote(ndc, quantity),
            ExpressScriptsService.getQuote(ndc, quantity)
        ];

        const [fdaData, ...quotesResults] = await Promise.all([fdaPromise, ...realQuotesPromises]);
        const realQuotes = quotesResults.filter((q): q is SupplierQuote => q !== null);

        // 3. If we have real distributor quotes, use them. 
        // If we are missing specific distributors (e.g. Amerisource doesn't have an API adapter yet), mocking is fine alongside real.
        // For this implementation: Mix Real + Mock.

        let allQuotes = [...realQuotes];

        // 4. Generate Mocks for any missing Distributors (McKesson/Cardinal if API failed, Amerisource always)
        // We only mock "Distributor" types. GoodRx/ExpressScripts are additive.
        const coveredSuppliers = new Set(realQuotes.map(q => q.supplierId));

        for (const supplier of SUPPLIERS) {
            if (!coveredSuppliers.has(supplier.id)) {
                // Generate Mock
                const basePrice = this.getBasePrice(ndc);
                const variance = (Math.random() * 0.1) - 0.05; // +/- 5%
                const price = basePrice * (1 + variance);

                allQuotes.push({
                    supplierId: supplier.id,
                    ndc,
                    price: parseFloat(price.toFixed(2)),
                    priceTrend: Math.random() > 0.5 ? 'stable' : 'down',
                    availableQuantity: Math.floor(Math.random() * 5000),
                    deliveryDate: new Date(Date.now() + supplier.averageDeliveryTimeHours * 3600000).toISOString(),
                    moq: 1,
                    isRealTime: false,
                    quoteType: 'Distributor'
                });
            }
        }

        // 5. Enrich with FDA Data (Manufacturer)
        if (fdaData) {
            allQuotes = allQuotes.map(q => ({
                ...q,
                manufacturer: fdaData.labeler_name || q.manufacturer
            }));
        }

        return allQuotes;
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
