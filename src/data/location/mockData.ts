import type { Site, SiteInventory, NetworkRequest, SupplyLevel } from '../../types/location';

// UPenn Health System sites (Philadelphia & Surrounding Area)
const sites: Site[] = [
    // City Hospitals
    {
        id: 'site-1',
        name: 'Hospital of the Univ. of Pennsylvania',
        type: 'hospital',
        regulatoryAvatar: 'DSH', // Disproportionate Share Hospital
        classOfTrade: 'acute',
        parentEntity: 'Penn Medicine System',
        regulatoryProfile: {
            is340B: true,
            is340B_ID: 'DSH340B-HUP-001', // Unique ID
            deaLicense: ['II', 'III', 'IV', 'V'],
            dscsaCompliant: true,
            stateLicense: 'PA-HOSP-001',
            licenseType: 'pharmacy',
            orphanDrugExclusion: false,
            gpoProhibition: true,
            totalDispensingStats: {
                transfersYTD: 45000,
                totalDispensing: 2000000 // 2.25% - Safe
            }
        },
        departments: [
            { id: 'dept-1-0', name: 'Main Pharmacy', type: 'pharmacy' },
            { id: 'dept-1-1', name: 'Abramson Cancer Center', type: 'clinical' },
            { id: 'dept-1-2', name: 'Division of Hematology and Oncology', type: 'clinical' },
            { id: 'dept-1-3', name: 'Main Emergency Department', type: 'clinical' },
            { id: 'dept-1-4', name: 'HUP - Cedar Avenue Emergency Department', type: 'clinical' },
            { id: 'dept-1-5', name: 'Radiation Oncology', type: 'clinical' },
            { id: 'dept-1-6', name: 'Neuroscience Center', type: 'clinical' }
        ],
        coordinates: { lat: 39.9500, lng: -75.1936 }, // University City
        address: '3400 Spruce St, Philadelphia, PA 19104',
        phone: '(215) 662-4000',
        manager: 'Dr. Lisa Rodriguez',
        status: 'operational',
        capacity: 12000,
        currentUtilization: 85,
    },
    {
        id: 'site-2',
        name: 'Penn Presbyterian Medical Center',
        type: 'hospital',
        regulatoryAvatar: 'DSH',
        classOfTrade: 'acute',
        parentEntity: 'Penn Medicine System',
        regulatoryProfile: {
            is340B: true,
            is340B_ID: 'DSH340B-PMC-002', // Different ID from HUP!
            deaLicense: ['II', 'III', 'IV', 'V'],
            dscsaCompliant: true,
            stateLicense: 'PA-HOSP-002',
            licenseType: 'pharmacy',
            orphanDrugExclusion: false,
            gpoProhibition: true,
            totalDispensingStats: {
                transfersYTD: 12000,
                totalDispensing: 1500000 // 0.8% - Safe
            }
        },
        departments: [
            { id: 'dept-2-0', name: 'Pharmacy Services', type: 'pharmacy' },
            { id: 'dept-2-1', name: 'Emergency Department (Trauma Level I)', type: 'clinical' },
            { id: 'dept-2-2', name: 'Scheie Eye Institute', type: 'clinical' },
            { id: 'dept-2-3', name: 'Penn Orthopaedics', type: 'clinical' },
            { id: 'dept-2-4', name: 'Philadelphia Heart Institute', type: 'clinical' }
        ],
        coordinates: { lat: 39.9550, lng: -75.1928 }, // University City
        address: '51 N 39th St, Philadelphia, PA 19104',
        phone: '(215) 662-8000',
        manager: 'Sarah Chen',
        status: 'operational',
        capacity: 8000,
        currentUtilization: 78,
    },
    {
        id: 'site-3',
        name: 'Pennsylvania Hospital',
        type: 'hospital',
        regulatoryAvatar: 'DSH',
        classOfTrade: 'acute',
        parentEntity: 'Penn Medicine System',
        regulatoryProfile: {
            is340B: false,
            deaLicense: ['II', 'III', 'IV', 'V'],
            dscsaCompliant: true,
            stateLicense: 'PA-HOSP-003',
            licenseType: 'pharmacy',
            orphanDrugExclusion: false,
            gpoProhibition: true
        },
        departments: [
            { id: 'dept-3-0', name: 'Pharmacy Services', type: 'pharmacy' },
            { id: 'dept-3-1', name: 'Emergency Medicine', type: 'clinical' },
            { id: 'dept-3-2', name: 'Joan Karnell Cancer Center', type: 'clinical' },
            { id: 'dept-3-3', name: 'Center for Bloodless Medicine', type: 'clinical' },
            { id: 'dept-3-4', name: 'Penn Neurological Institute', type: 'clinical' }
        ],
        coordinates: { lat: 39.9448, lng: -75.1563 }, // Center City
        address: '800 Spruce St, Philadelphia, PA 19107',
        phone: '(215) 829-3000',
        manager: 'Mike Thompson',
        status: 'operational',
        capacity: 6000,
        currentUtilization: 72,
    },

    // Regional Hospitals
    {
        id: 'site-4',
        name: 'Chester County Hospital',
        type: 'hospital',
        regulatoryAvatar: 'RRC', // Rural Referral Center
        classOfTrade: 'acute',
        parentEntity: 'Penn Medicine System',
        regulatoryProfile: {
            is340B: false,
            deaLicense: ['II', 'III', 'IV', 'V'],
            dscsaCompliant: true,
            stateLicense: 'PA-HOSP-004',
            licenseType: 'pharmacy',
            orphanDrugExclusion: true,
            gpoProhibition: false,
            totalDispensingStats: {
                transfersYTD: 49000,
                totalDispensing: 1000000 // 4.9% - DANGER ZONE
            }
        },
        departments: [
            { id: 'dept-4-1', name: 'Pharmacy', type: 'pharmacy' },
            { id: 'dept-4-2', name: 'Emergency', type: 'clinical' }
        ],
        coordinates: { lat: 39.9714, lng: -75.6022 }, // West Chester
        address: '701 E Marshall St, West Chester, PA 19380',
        phone: '(610) 431-5000',
        manager: 'Dr. James Park',
        status: 'operational',
        capacity: 5000,
        currentUtilization: 65,
    },
    {
        id: 'site-5',
        name: 'Lancaster General Hospital',
        type: 'hospital',
        regulatoryAvatar: 'FreeStandingCancer', // For demo variety
        classOfTrade: 'acute',
        parentEntity: 'Penn Medicine System',
        regulatoryProfile: {
            is340B: true,
            is340B_ID: 'CAN340B-LGH-005',
            deaLicense: ['II', 'III', 'IV', 'V'],
            dscsaCompliant: true,
            stateLicense: 'PA-HOSP-005',
            licenseType: 'pharmacy',
            orphanDrugExclusion: true,
            gpoProhibition: true
        },
        departments: [
            { id: 'dept-5-1', name: 'Pharmacy', type: 'pharmacy' },
            { id: 'dept-5-2', name: 'Trauma', type: 'clinical' }
        ],
        coordinates: { lat: 40.0470, lng: -76.3040 }, // Lancaster
        address: '555 N Duke St, Lancaster, PA 17602',
        phone: '(717) 544-5511',
        manager: 'Dr. Robert Kim',
        status: 'operational',
        capacity: 7000,
        currentUtilization: 82,
    },
    {
        id: 'site-6',
        name: 'Princeton Medical Center',
        type: 'hospital',
        regulatoryAvatar: 'CAH', // Critical Access Hospital (Mock)
        classOfTrade: 'acute',
        parentEntity: 'Penn Medicine System', // Fully integrated
        regulatoryProfile: {
            is340B: false,
            deaLicense: ['II', 'III', 'IV', 'V'],
            dscsaCompliant: true,
            stateLicense: 'NJ-HOSP-001',
            licenseType: 'pharmacy',
            orphanDrugExclusion: true,
            gpoProhibition: false
        },
        departments: [
            { id: 'dept-6-1', name: 'Pharmacy', type: 'pharmacy' },
            { id: 'dept-6-2', name: 'General Care', type: 'clinical' }
        ],
        coordinates: { lat: 40.3391, lng: -74.6237 }, // Plainsboro, NJ
        address: '1 Plainsboro Rd, Plainsboro Township, NJ 08536',
        phone: '(609) 853-7000',
        manager: 'Dr. Amanda White',
        status: 'operational',
        capacity: 5500,
        currentUtilization: 70,
    },

    // Clinics & Outpatient
    {
        id: 'site-7',
        name: 'Penn Medicine Radnor',
        type: 'clinic',
        regulatoryAvatar: 'Clinic',
        classOfTrade: 'non_acute',
        parentEntity: 'Penn Medicine System',
        regulatoryProfile: {
            is340B: false,
            deaLicense: ['III', 'IV', 'V'],
            dscsaCompliant: true,
            stateLicense: 'PA-CLINIC-001',
            licenseType: 'pharmacy',
            orphanDrugExclusion: false,
            gpoProhibition: false
        },
        departments: [
            { id: 'dept-7-1', name: 'Dispensary', type: 'pharmacy' },
            { id: 'dept-7-2', name: 'Family Medicine', type: 'clinical' }
        ],
        coordinates: { lat: 40.0460, lng: -75.3600 }, // Radnor
        address: '250 King of Prussia Rd, Radnor, PA 19087',
        phone: '(610) 902-2000',
        manager: 'Dr. Emily Martinez',
        status: 'operational',
        capacity: 2000,
        currentUtilization: 45,
    },
    {
        id: 'site-8',
        name: 'Penn Medicine Valley Forge',
        type: 'clinic',
        regulatoryAvatar: 'Clinic',
        classOfTrade: 'non_acute',
        parentEntity: 'Penn Medicine System',
        regulatoryProfile: {
            is340B: false,
            deaLicense: ['III', 'IV', 'V'],
            dscsaCompliant: true,
            stateLicense: 'PA-CLINIC-002',
            licenseType: 'pharmacy',
            orphanDrugExclusion: false,
            gpoProhibition: false
        },
        departments: [
            { id: 'dept-8-1', name: 'Dispensary', type: 'pharmacy' },
            { id: 'dept-8-2', name: 'Urgent Care', type: 'clinical' }
        ],
        coordinates: { lat: 40.0700, lng: -75.4500 }, // Berwyn
        address: '1001 Chesterbrook Blvd, Berwyn, PA 19312',
        phone: '(610) 576-7500',
        manager: 'Dr. David Chen',
        status: 'operational',
        capacity: 1500,
        currentUtilization: 50,
    },
    {
        id: 'site-9',
        name: 'Penn Medicine University City',
        type: 'clinic',
        regulatoryAvatar: 'Clinic',
        classOfTrade: 'non_acute',
        parentEntity: 'Penn Medicine System',
        regulatoryProfile: {
            is340B: true,
            is340B_ID: 'CLIN340B-UC-003',
            deaLicense: ['II', 'III', 'IV', 'V'],
            dscsaCompliant: true,
            stateLicense: 'PA-CLINIC-003',
            licenseType: 'pharmacy',
            orphanDrugExclusion: false,
            gpoProhibition: false
        },
        departments: [
            { id: 'dept-9-1', name: 'Dispensary', type: 'pharmacy' },
            { id: 'dept-9-2', name: 'Specialty Care', type: 'clinical' }
        ],
        coordinates: { lat: 39.9570, lng: -75.1950 }, // University City
        address: '3737 Market St, Philadelphia, PA 19104',
        phone: '(215) 662-3000',
        manager: 'Jennifer Wu',
        status: 'operational',
        capacity: 2500,
        currentUtilization: 60,
    },
    {
        id: 'site-10',
        name: 'Penn Medicine Cherry Hill',
        type: 'clinic',
        regulatoryAvatar: 'Clinic',
        classOfTrade: 'non_acute',
        parentEntity: 'Penn Medicine System',
        regulatoryProfile: {
            is340B: false,
            deaLicense: ['III', 'IV', 'V'],
            dscsaCompliant: true,
            stateLicense: 'NJ-CLINIC-001',
            licenseType: 'pharmacy',
            orphanDrugExclusion: false,
            gpoProhibition: false
        },
        departments: [
            { id: 'dept-10-1', name: 'Dispensary', type: 'pharmacy' },
            { id: 'dept-10-2', name: 'Primary Care', type: 'clinical' }
        ],
        coordinates: { lat: 39.9050, lng: -74.9900 }, // Cherry Hill, NJ
        address: '1865 Route 70 East, Cherry Hill, NJ 08003',
        phone: '(800) 789-7366',
        manager: 'Rachel Kim',
        status: 'operational',
        capacity: 1800,
        currentUtilization: 55,
    },
    {
        id: 'site-11',
        name: 'Penn Medicine Rittenhouse',
        type: 'clinic',
        regulatoryAvatar: 'Clinic',
        classOfTrade: 'non_acute',
        parentEntity: 'Penn Medicine System',
        regulatoryProfile: {
            is340B: true,
            is340B_ID: 'CLIN340B-RIT-004',
            deaLicense: ['II', 'III', 'IV', 'V'],
            dscsaCompliant: true,
            stateLicense: 'PA-CLINIC-004',
            licenseType: 'pharmacy',
            orphanDrugExclusion: false,
            gpoProhibition: false
        },
        departments: [
            { id: 'dept-11-1', name: 'Dispensary', type: 'pharmacy' },
            { id: 'dept-11-2', name: 'Rehabilitation', type: 'clinical' }
        ],
        coordinates: { lat: 39.9450, lng: -75.1700 }, // Rittenhouse
        address: '1800 Lombard St, Philadelphia, PA 19146',
        phone: '(215) 893-2000',
        manager: 'Dr. Thomas Anderson',
        status: 'operational',
        capacity: 1200,
        currentUtilization: 40,
    },

    // Warehouses / Support
    {
        id: 'site-12',
        name: 'Penn Medicine Distribution Center',
        type: 'warehouse',
        regulatoryAvatar: 'Pharmacy', // Or Distributor
        classOfTrade: 'retail', // Or wholesale
        parentEntity: 'Penn Medicine System',
        regulatoryProfile: {
            is340B: false,
            deaLicense: ['II', 'III', 'IV', 'V'],
            dscsaCompliant: true,
            stateLicense: 'PA-DIST-001',
            licenseType: 'wholesaler', // IT HAS THE LICENSE!
            orphanDrugExclusion: false,
            gpoProhibition: false
        },
        departments: [
            { id: 'dept-12-1', name: 'Main Inventory', type: 'logistics' },
            { id: 'dept-12-2', name: 'Cold Chain', type: 'logistics' },
            { id: 'dept-12-3', name: 'Shipping/Receiving', type: 'logistics' }
        ],
        coordinates: { lat: 39.9000, lng: -75.2200 }, // Southwest Philly (Approx)
        address: '7000 Lindbergh Blvd, Philadelphia, PA 19153',
        phone: '(215) 555-0199',
        manager: 'Kevin Zhang',
        status: 'operational',
        capacity: 60000,
        currentUtilization: 65,
    },
];


// Export only the Penn sites
const allSites: Site[] = [...sites];

export { allSites as sites };

import realDrugCatalog from '../../data/real-drug-catalog.json';

// Generate a master catalog for the simulation to ensure consistency across sites
// We use the same JSON source
// We use the same JSON source
const MASTER_CATALOG = realDrugCatalog
    .filter(d => {
        const n = d.name.toUpperCase();
        return !n.includes('FOUNDATION') &&
            !n.includes('SPF ') &&
            !n.includes('SUNSCREEN') &&
            !n.includes('LIP ') &&
            !n.includes('SHAMPOO') &&
            !n.includes('LOTION') &&
            !n.includes('DEODORANT') &&
            !n.includes('ANTIPERSPIRANT');
    })
    .slice(0, 100)
    .map(d => ({
        name: `${d.name} ${d.form}`,
        ndc: d.ndc,
        // Add other fields if useful for simulation logic, but name/ndc are core
    }));

// Helper to generate random inventory for a specific department
const generateInventory = (siteId: string, departmentId?: string): SiteInventory => {
    // Find department name for heuristics
    let deptName = '';
    if (departmentId) {
        for (const s of sites) {
            const d = s.departments?.find(dept => dept.id === departmentId);
            if (d) {
                deptName = d.name.toLowerCase();
                break;
            }
        }
    }

    // Filter Catalog based on Department Function
    let candidateDrugs = MASTER_CATALOG;

    if (deptName.includes('oncology') || deptName.includes('cancer')) {
        candidateDrugs = MASTER_CATALOG.filter(d =>
            d.name.includes('INJECTION') || d.name.includes('TABLET') || d.name.includes('VIAL')
        );
    } else if (deptName.includes('emergency') || deptName.includes('trauma') || deptName.includes('icu')) {
        candidateDrugs = MASTER_CATALOG.filter(d =>
            d.name.includes('INJECTION') || d.name.includes('SOLUTION') || d.name.includes('SODIUM')
        );
    } else if (deptName.includes('eye') || deptName.includes('ophthalm')) {
        candidateDrugs = MASTER_CATALOG.filter(d =>
            d.name.includes('OPHTHALMIC') || d.name.includes('SOLUTION') || d.name.includes('SUSPENSION')
        );
    }

    // Pick 12-20 random drugs
    const numDrugs = Math.floor(Math.random() * 8) + 12;
    const selectedDrugs = [...candidateDrugs].sort(() => 0.5 - Math.random()).slice(0, numDrugs);

    // FORCE: Ensure Keytruda & Ticagrelor exist for AI Demo alignment
    const demoDrugs = [
        { name: 'Ticagrelor TABLET', ndc: '77771-522' },
        { name: 'Keytruda 100mg Vial', ndc: '0006-3026-02' }
    ];

    // Only add if not already present (checking by NDC)
    demoDrugs.forEach(demoDrug => {
        if (!selectedDrugs.find(d => d.ndc === demoDrug.ndc)) {
            selectedDrugs.push(demoDrug);
        }
    });

    return {
        siteId,
        departmentId,
        lastUpdated: new Date().toISOString(),
        drugs: selectedDrugs.map(d => {
            const isDemoDrug = demoDrugs.some(demo => demo.ndc === d.ndc);
            let quantity;
            let status: 'well_stocked' | 'low' | 'critical' | 'overstocked';

            // FORCE IMBALANCE FOR AI DEMO:
            // Site 1 (HUP) = Shortage
            // Site 12 (Warehouse) = Surplus
            if (isDemoDrug) {
                if (siteId === 'site-1' || siteId === 'site-2') {
                    // DEMAND SIDE: Critical Shortage
                    quantity = Math.floor(Math.random() * 3); // 0-2 units
                    status = 'critical';
                } else if (siteId === 'site-12') {
                    // SUPPLY SIDE: Massive Surplus
                    quantity = 500;
                    status = 'overstocked';
                } else {
                    // Random for others
                    quantity = Math.floor(Math.random() * 20);
                    status = 'well_stocked';
                }
            } else {
                // Formatting original random logic
                const rand = Math.random();
                if (rand < 0.3) {
                    quantity = Math.floor(Math.random() * 5);
                    status = 'critical';
                } else if (rand < 0.6) {
                    quantity = Math.floor(5 + Math.random() * 5);
                    status = 'low';
                } else if (rand > 0.8 || siteId === 'site-12') {
                    quantity = 150 + Math.floor(Math.random() * 200);
                    status = 'overstocked';
                } else {
                    quantity = Math.floor(10 + Math.random() * 10);
                    status = 'well_stocked';
                }
            }

            return {
                drugName: d.name,
                ndc: d.ndc,
                quantity,
                minLevel: 10,
                maxLevel: 100, // Fixed max for clarity
                status,
                expirationWarnings: Math.random() < 0.1 ? Math.floor(Math.random() * 3) + 1 : 0,
            };
        }),
    };
};

// Generate inventories for all sites AND their departments
export const siteInventories: SiteInventory[] = allSites.flatMap(site => {
    // If site has departments, generate inventory for each
    if (site.departments && site.departments.length > 0) {
        return site.departments.map(dept => generateInventory(site.id, dept.id));
    }
    // Fallback for sites without departments (though all our mocks have them)
    return [generateInventory(site.id)];
});

// Network transfer requests
export const networkRequests: NetworkRequest[] = [
    {
        id: 'NR-001',
        requestedBy: 'Sarah Chen',
        requestedBySite: sites[1], // Penn Presbyterian
        targetSite: sites[0], // HUP
        drug: {
            name: 'Keytruda 100mg Vial',
            ndc: MASTER_CATALOG[0]?.ndc || '0006-3026-02',
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
        requestedBySite: sites[3], // Chester County
        targetSite: sites[11], // Distribution Center (approximated index)
        drug: {
            name: 'Remicade 100mg Vial',
            ndc: MASTER_CATALOG[1]?.ndc || '57894-030-01',
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
        requestedBySite: sites[6], // Radnor
        targetSite: sites[11], // Distribution Center
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
        requestedBySite: sites[4], // Lancaster General
        targetSite: sites[0], // HUP
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
        requestedBySite: sites[9], // Cherry Hill
        targetSite: sites[2], // Pennsylvania Hospital
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
        distribution: allSites.map(site => {
            // Aggregate all department inventories for this site
            const siteInvs = siteInventories.filter(i => i.siteId === site.id);
            const totalQuantity = siteInvs.reduce((sum, inv) => {
                const drug = inv.drugs.find(d => d.ndc === '0006-3026-02');
                return sum + (drug ? drug.quantity : 0);
            }, 0);

            // Determine aggregate status
            let status: 'well_stocked' | 'low' | 'critical' | 'overstocked' = 'well_stocked';
            if (totalQuantity === 0) status = 'critical';
            else if (totalQuantity < 20) status = 'low';
            else if (totalQuantity > 100) status = 'overstocked';

            return { site, quantity: totalQuantity, status };
        }),
        totalNetwork: 0, // Calculated on frontend usually, but mock data here
        networkDemand: 500,
        status: 'balanced',
    },
    {
        drugName: 'Remicade (Infliximab)',
        ndc: '57894-030-01',
        distribution: allSites.map(site => {
            const siteInvs = siteInventories.filter(i => i.siteId === site.id);
            const totalQuantity = siteInvs.reduce((sum, inv) => {
                const drug = inv.drugs.find(d => d.ndc === '57894-030-01');
                return sum + (drug ? drug.quantity : 0);
            }, 0);

            // Determine aggregate status
            let status: 'well_stocked' | 'low' | 'critical' | 'overstocked' = 'well_stocked';
            if (totalQuantity === 0) status = 'critical';
            else if (totalQuantity < 20) status = 'low';
            else if (totalQuantity > 100) status = 'overstocked';

            return { site, quantity: totalQuantity, status };
        }),
        totalNetwork: 0,
        networkDemand: 300,
        status: 'shortage',
    },
];
