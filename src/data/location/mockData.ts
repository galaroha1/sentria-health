import type { Site, SiteInventory, NetworkRequest, SupplyLevel } from '../../types/location';

// Hospital sites across the network (using real coordinates in US - Los Angeles area)
export const sites: Site[] = [
    // Central LA
    {
        id: 'site-1',
        name: 'Memorial Regional Hospital',
        type: 'hospital',
        coordinates: { lat: 34.0522, lng: -118.2437 }, // Downtown LA
        address: '1234 Medical Center Dr, Los Angeles, CA 90017',
        phone: '(213) 555-0100',
        manager: 'Dr. Lisa Rodriguez',
        status: 'operational',
        capacity: 10000,
        currentUtilization: 75,
    },
    {
        id: 'site-2',
        name: 'Downtown Community Clinic',
        type: 'clinic',
        coordinates: { lat: 34.0489, lng: -118.2573 }, // Downtown West
        address: '567 Hope St, Los Angeles, CA 90013',
        phone: '(213) 555-0200',
        manager: 'Sarah Chen',
        status: 'operational',
        capacity: 2000,
        currentUtilization: 85,
    },
    {
        id: 'site-3',
        name: 'Central Pharmacy Warehouse',
        type: 'warehouse',
        coordinates: { lat: 34.0307, lng: -118.2368 }, // Industrial District
        address: '890 Commerce Way, Los Angeles, CA 90021',
        phone: '(213) 555-0300',
        manager: 'Mike Thompson',
        status: 'operational',
        capacity: 50000,
        currentUtilization: 60,
    },

    // Westside
    {
        id: 'site-4',
        name: 'Westside Medical Center',
        type: 'hospital',
        coordinates: { lat: 34.0622, lng: -118.4487 }, // UCLA area
        address: '1111 Ocean Ave, Santa Monica, CA 90401',
        phone: '(310) 555-0400',
        manager: 'Dr. James Park',
        status: 'operational',
        capacity: 8000,
        currentUtilization: 90,
    },
    {
        id: 'site-5',
        name: 'Santa Monica Urgent Care',
        type: 'clinic',
        coordinates: { lat: 34.0195, lng: -118.4912 }, // Santa Monica
        address: '2400 Wilshire Blvd, Santa Monica, CA 90403',
        phone: '(310) 555-0450',
        manager: 'Dr. Robert Kim',
        status: 'operational',
        capacity: 1500,
        currentUtilization: 40,
    },
    {
        id: 'site-6',
        name: 'Beverly Hills Specialist Center',
        type: 'clinic',
        coordinates: { lat: 34.0736, lng: -118.4004 }, // Beverly Hills
        address: '9000 Wilshire Blvd, Beverly Hills, CA 90211',
        phone: '(310) 555-0900',
        manager: 'Dr. Amanda White',
        status: 'operational',
        capacity: 1200,
        currentUtilization: 65,
    },

    // Valley
    {
        id: 'site-7',
        name: 'East Valley Clinic',
        type: 'clinic',
        coordinates: { lat: 34.1808, lng: -118.3090 }, // Burbank
        address: '2222 Burbank Blvd, Burbank, CA 91505',
        phone: '(818) 555-0500',
        manager: 'Dr. Emily Martinez',
        status: 'operational',
        capacity: 1500,
        currentUtilization: 45,
    },
    {
        id: 'site-8',
        name: 'Valley General Hospital',
        type: 'hospital',
        coordinates: { lat: 34.2012, lng: -118.4484 }, // Van Nuys
        address: '1500 Van Nuys Blvd, Van Nuys, CA 91401',
        phone: '(818) 555-0800',
        manager: 'Dr. David Chen',
        status: 'operational',
        capacity: 6000,
        currentUtilization: 80,
    },
    {
        id: 'site-9',
        name: 'Northridge Pharmacy Hub',
        type: 'pharmacy',
        coordinates: { lat: 34.2381, lng: -118.5301 }, // Northridge
        address: '9500 Reseda Blvd, Northridge, CA 91324',
        phone: '(818) 555-0950',
        manager: 'Jennifer Wu',
        status: 'operational',
        capacity: 2500,
        currentUtilization: 55,
    },

    // South Bay
    {
        id: 'site-10',
        name: 'South Bay Pharmacy',
        type: 'pharmacy',
        coordinates: { lat: 33.8358, lng: -118.3406 }, // Torrance
        address: '3333 Hawthorne Blvd, Torrance, CA 90503',
        phone: '(310) 555-0600',
        manager: 'Rachel Kim',
        status: 'operational',
        capacity: 3000,
        currentUtilization: 70,
    },
    {
        id: 'site-11',
        name: 'Long Beach Memorial',
        type: 'hospital',
        coordinates: { lat: 33.8121, lng: -118.1883 }, // Long Beach
        address: '2801 Atlantic Ave, Long Beach, CA 90806',
        phone: '(562) 555-1100',
        manager: 'Dr. Thomas Anderson',
        status: 'operational',
        capacity: 9000,
        currentUtilization: 88,
    },

    // East LA / SGV
    {
        id: 'site-12',
        name: 'Pasadena Care Center',
        type: 'clinic',
        coordinates: { lat: 34.1478, lng: -118.1445 }, // Pasadena
        address: '100 W California Blvd, Pasadena, CA 91105',
        phone: '(626) 555-1200',
        manager: 'Dr. Maria Garcia',
        status: 'operational',
        capacity: 1800,
        currentUtilization: 50,
    },
    {
        id: 'site-13',
        name: 'Eastside Distribution Center',
        type: 'warehouse',
        coordinates: { lat: 34.0687, lng: -118.0276 }, // El Monte
        address: '4500 Rosemead Blvd, El Monte, CA 91731',
        phone: '(626) 555-1300',
        manager: 'Kevin Zhang',
        status: 'operational',
        capacity: 40000,
        currentUtilization: 35,
    },
    {
        id: 'site-14',
        name: 'Alhambra Community Pharmacy',
        type: 'pharmacy',
        coordinates: { lat: 34.0953, lng: -118.1270 }, // Alhambra
        address: '1200 S Garfield Ave, Alhambra, CA 91801',
        phone: '(626) 555-1400',
        manager: 'Linda Nguyen',
        status: 'operational',
        capacity: 2000,
        currentUtilization: 60,
    },
    {
        id: 'site-15',
        name: 'Glendale Medical Plaza',
        type: 'clinic',
        coordinates: { lat: 34.1425, lng: -118.2551 }, // Glendale
        address: '1500 Verdugo Rd, Glendale, CA 91208',
        phone: '(818) 555-1500',
        manager: 'Dr. Steven Lee',
        status: 'operational',
        capacity: 2200,
        currentUtilization: 72,
    },
];

// Helper to generate random inventory for sites
const generateInventory = (siteId: string): SiteInventory => {
    const drugs = [
        { name: 'Keytruda (Pembrolizumab)', ndc: '0006-3026-02', min: 20, max: 80 },
        { name: 'Remicade (Infliximab)', ndc: '57894-030-01', min: 15, max: 50 },
        { name: 'Humira (Adalimumab)', ndc: '0074-3799-02', min: 50, max: 150 },
        { name: 'Opdivo (Nivolumab)', ndc: '0003-3772-11', min: 10, max: 40 },
        { name: 'Herceptin (Trastuzumab)', ndc: '63020-052-01', min: 5, max: 25 },
    ];

    // Randomly select 2-4 drugs for this site
    const numDrugs = Math.floor(Math.random() * 3) + 2;
    const selectedDrugs = drugs.sort(() => 0.5 - Math.random()).slice(0, numDrugs);

    return {
        siteId,
        lastUpdated: new Date().toISOString(),
        drugs: selectedDrugs.map(d => {
            // Randomize quantity to create different statuses
            const rand = Math.random();
            let quantity;
            let status: 'well_stocked' | 'low' | 'critical' | 'overstocked';

            if (rand < 0.1) { // 10% chance of critical
                quantity = Math.floor(Math.random() * (d.min / 2));
                status = 'critical';
            } else if (rand < 0.25) { // 15% chance of low
                quantity = Math.floor(d.min + Math.random() * (d.min * 0.5));
                status = 'low';
            } else if (rand > 0.9) { // 10% chance of overstocked
                quantity = Math.floor(d.max * 1.2);
                status = 'overstocked';
            } else { // 65% chance of well stocked
                quantity = Math.floor(d.min + Math.random() * (d.max - d.min));
                status = 'well_stocked';
            }

            return {
                drugName: d.name,
                ndc: d.ndc,
                quantity,
                minLevel: d.min,
                maxLevel: d.max,
                status,
                expirationWarnings: Math.random() < 0.1 ? Math.floor(Math.random() * 3) + 1 : 0,
            };
        }),
    };
};

// Generate inventories for all sites
export const siteInventories: SiteInventory[] = sites.map(site => generateInventory(site.id));

// Network transfer requests
export const networkRequests: NetworkRequest[] = [
    {
        id: 'NR-001',
        requestedBy: 'Sarah Chen',
        requestedBySite: sites[1], // Downtown Community Clinic
        targetSite: sites[0], // Memorial Regional Hospital
        drug: {
            name: 'Keytruda (Pembrolizumab)',
            ndc: '0006-3026-02',
            quantity: 10,
        },
        reason: 'Critical patient need - current stock at 3 units',
        urgency: 'urgent',
        status: 'pending',
        requestedAt: '2025-11-19T12:30:00Z',
    },
    {
        id: 'NR-002',
        requestedBy: 'Dr. James Park',
        requestedBySite: sites[3], // Westside Medical Center
        targetSite: sites[2], // Central Pharmacy Warehouse
        drug: {
            name: 'Remicade (Infliximab)',
            ndc: '57894-030-01',
            quantity: 20,
        },
        reason: 'Scheduled treatment protocols next week',
        urgency: 'routine',
        status: 'approved',
        requestedAt: '2025-11-18T10:00:00Z',
        approvedBy: 'Mike Thompson',
        approvedAt: '2025-11-18T11:15:00Z',
        estimatedDelivery: '2025-11-20',
    },
    {
        id: 'NR-003',
        requestedBy: 'Dr. Emily Martinez',
        requestedBySite: sites[6], // East Valley Clinic
        targetSite: sites[2], // Central Pharmacy Warehouse
        drug: {
            name: 'Humira (Adalimumab)',
            ndc: '0074-3799-02',
            quantity: 15,
        },
        reason: 'Emergency replenishment - only 2 units remaining',
        urgency: 'emergency',
        status: 'in_transit',
        requestedAt: '2025-11-19T08:00:00Z',
        approvedBy: 'Mike Thompson',
        approvedAt: '2025-11-19T08:10:00Z',
        estimatedDelivery: '2025-11-19',
    },
    {
        id: 'NR-004',
        requestedBy: 'Dr. Robert Kim',
        requestedBySite: sites[4], // Santa Monica Urgent Care
        targetSite: sites[3], // Westside Medical Center
        drug: {
            name: 'Opdivo (Nivolumab)',
            ndc: '0003-3772-11',
            quantity: 5,
        },
        reason: 'Unexpected demand spike',
        urgency: 'urgent',
        status: 'pending',
        requestedAt: '2025-11-19T14:15:00Z',
    },
    {
        id: 'NR-005',
        requestedBy: 'Rachel Kim',
        requestedBySite: sites[9], // South Bay Pharmacy
        targetSite: sites[10], // Long Beach Memorial
        drug: {
            name: 'Herceptin (Trastuzumab)',
            ndc: '63020-052-01',
            quantity: 8,
        },
        reason: 'Stock balancing',
        urgency: 'routine',
        status: 'completed',
        requestedAt: '2025-11-15T09:00:00Z',
        approvedBy: 'Dr. Thomas Anderson',
        approvedAt: '2025-11-15T10:30:00Z',
        completedAt: '2025-11-16T14:00:00Z',
    }
];

// Supply level overview across network (calculated dynamically from generated inventories)
export const supplyLevels: SupplyLevel[] = [
    {
        drugName: 'Keytruda (Pembrolizumab)',
        ndc: '0006-3026-02',
        distribution: sites.map(site => {
            const inv = siteInventories.find(i => i.siteId === site.id);
            const drug = inv?.drugs.find(d => d.ndc === '0006-3026-02');
            return drug ? { site, quantity: drug.quantity, status: drug.status } : null;
        }).filter((item): item is { site: Site; quantity: number; status: "well_stocked" | "low" | "critical" | "overstocked" } => item !== null),
        totalNetwork: 0, // Calculated on frontend usually, but mock data here
        networkDemand: 500,
        status: 'balanced',
    },
    {
        drugName: 'Remicade (Infliximab)',
        ndc: '57894-030-01',
        distribution: sites.map(site => {
            const inv = siteInventories.find(i => i.siteId === site.id);
            const drug = inv?.drugs.find(d => d.ndc === '57894-030-01');
            return drug ? { site, quantity: drug.quantity, status: drug.status } : null;
        }).filter((item): item is { site: Site; quantity: number; status: "well_stocked" | "low" | "critical" | "overstocked" } => item !== null),
        totalNetwork: 0,
        networkDemand: 300,
        status: 'shortage',
    },
];
