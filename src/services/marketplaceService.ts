
// Mock data for marketplace integration
// In a real app, this would query an external API (McKesson, Cardinal, etc.)

export interface MarketItem {
    id: string;
    ndc: string;
    name: string;
    price: number;
    supplier: string;
    inStock: boolean;
    leadTimeDays: number; // Shipping time
}

const MOCK_MARKET_DB: MarketItem[] = [
    { id: 'mkt-1', ndc: '00001-0001-01', name: 'Acetaminophen', price: 12.50, supplier: 'McKesson', inStock: true, leadTimeDays: 2 },
    { id: 'mkt-2', ndc: '00002-0002-02', name: 'Ibuprofen', price: 15.00, supplier: 'Cardinal', inStock: true, leadTimeDays: 1 },
    { id: 'mkt-3', ndc: '00003-0003-03', name: 'Lisinopril', price: 8.00, supplier: 'Amerisource', inStock: true, leadTimeDays: 3 },
    { id: 'mkt-4', ndc: '00004-0004-04', name: 'Amoxicillin', price: 22.00, supplier: 'McKesson', inStock: false, leadTimeDays: 5 },
    { id: 'mkt-5', ndc: '00005-0005-05', name: 'Atorvastatin', price: 45.00, supplier: 'Cardinal', inStock: true, leadTimeDays: 2 },
    { id: 'mkt-6', ndc: '50242-053-06', name: 'Rituximab', price: 4500.00, supplier: 'Genentech Direct', inStock: true, leadTimeDays: 4 }, // High value
];

export const marketplaceService = {
    // Determine the "Best Buy" price and lead time for a given NDC
    checkMarketplace: async (ndc: string): Promise<MarketItem | null> => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 200));

        const hit = MOCK_MARKET_DB.find(i => i.ndc === ndc);
        if (!hit) {
            // Fallback generator for unknown NDCs
            return {
                id: `mock-${Date.now()}`,
                ndc,
                name: 'Generic Drug',
                price: Math.random() * 100 + 10,
                supplier: 'Open Market',
                inStock: true,
                leadTimeDays: Math.floor(Math.random() * 4) + 1
            };
        }
        return hit;
    }
};
