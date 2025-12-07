
export interface GeoLocation {
    lat: number;
    lng: number;
}

export interface Organization {
    id: string;
    name: string;
    type: 'Academic' | 'Community' | 'Urgent Care' | 'Pharmacy';
    location: GeoLocation;
    address: string;
    distanceMiles: number; // Relative to current user
    status: 'Active' | 'Pending' | 'Disconnected';
    trustLevel: 'Tier 1' | 'Tier 2' | 'Tier 3';
}

export interface SharedInventoryItem {
    id: string;
    orgId: string;
    orgName: string;
    name: string;
    ndc: string;
    quantity: number;
    expiryDate: string;
    type: 'Surplus' | 'Shortage'; // Offering or Asking
    postedAt: string;
}

// Mock Data: Philadelphia Region Health Systems
const MOCK_ORGS: Organization[] = [
    {
        id: 'org_penn',
        name: 'Penn Medicine (HUP)',
        type: 'Academic',
        location: { lat: 39.9496, lng: -75.1932 },
        address: '3400 Spruce St, Philadelphia, PA',
        distanceMiles: 1.2,
        status: 'Active',
        trustLevel: 'Tier 1'
    },
    {
        id: 'org_jeff',
        name: 'Jefferson Health',
        type: 'Academic',
        location: { lat: 39.9493, lng: -75.1580 },
        address: '111 S 11th St, Philadelphia, PA',
        distanceMiles: 3.5,
        status: 'Active',
        trustLevel: 'Tier 1'
    },
    {
        id: 'org_chop',
        name: 'CHOP (Children\'s)',
        type: 'Academic',
        location: { lat: 39.9475, lng: -75.1952 },
        address: '3401 Civic Center Blvd, Philadelphia, PA',
        distanceMiles: 1.4,
        status: 'Active',
        trustLevel: 'Tier 1'
    },
    {
        id: 'org_mainline',
        name: 'Main Line Health (Lankenau)',
        type: 'Community',
        location: { lat: 39.9880, lng: -75.2630 },
        address: '100 E Lancaster Ave, Wynnewood, PA',
        distanceMiles: 6.8,
        status: 'Pending',
        trustLevel: 'Tier 2'
    },
    {
        id: 'org_temple',
        name: 'Temple University Hospital',
        type: 'Academic',
        location: { lat: 40.0045, lng: -75.1570 },
        address: '3401 N Broad St, Philadelphia, PA',
        distanceMiles: 5.2,
        status: 'Disconnected',
        trustLevel: 'Tier 3'
    }
];

const MOCK_SHARED_ITEMS: SharedInventoryItem[] = [
    {
        id: 'item_1',
        orgId: 'org_jeff',
        orgName: 'Jefferson Health',
        name: 'Propofol 10mg/mL',
        ndc: '00338-0553-02',
        quantity: 450,
        expiryDate: '2025-02-15',
        type: 'Surplus',
        postedAt: '2024-03-20T10:00:00Z'
    },
    {
        id: 'item_2',
        orgId: 'org_chop',
        orgName: 'CHOP',
        name: 'Albuterol Inhaler',
        ndc: '00093-3174-31',
        quantity: 100,
        expiryDate: '2025-06-01',
        type: 'Shortage', // They need this
        postedAt: '2024-03-21T09:30:00Z'
    },
    {
        id: 'item_3',
        orgId: 'org_penn',
        orgName: 'Penn Medicine',
        name: 'Saline IV Bags 1000mL',
        ndc: '00338-0049-04',
        quantity: 2000,
        expiryDate: '2026-01-01',
        type: 'Surplus',
        postedAt: '2024-03-21T14:15:00Z'
    }
];

export const networkService = {
    getNearbyOrganizations(): Promise<Organization[]> {
        return Promise.resolve(MOCK_ORGS);
    },

    getNetworkActivity(): Promise<SharedInventoryItem[]> {
        return Promise.resolve(MOCK_SHARED_ITEMS);
    },

    /**
     * Search the network for a specific item by NDC or Name.
     * Uses the "Universal Translator" concept (matching NDCs).
     */
    async findInNetwork(query: string): Promise<SharedInventoryItem[]> {
        const lowerQuery = query.toLowerCase();
        // Simulate network latency
        await new Promise(resolve => setTimeout(resolve, 600));

        return MOCK_SHARED_ITEMS.filter(item =>
            item.type === 'Surplus' && (
                item.name.toLowerCase().includes(lowerQuery) ||
                item.ndc.includes(query)
            )
        );
    },

    /**
     * Request a mutual aid transfer.
     */
    requestTransfer(_itemId: string, _quantity: number) {
        return {
            success: true,
            requestId: Math.random().toString(36).substr(2, 9),
            message: 'Request sent to partner. Awaiting approval.'
        };
    }
};
