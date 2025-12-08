export interface Department {
    id: string;
    name: string;
    type: 'clinical' | 'administrative' | 'pharmacy' | 'logistics';
}

import type { RegulatoryAvatar, ClassOfTrade } from './procurement';

export interface Site {
    id: string;
    name: string;
    type: 'hospital' | 'clinic' | 'warehouse' | 'pharmacy';
    regulatoryAvatar: RegulatoryAvatar;
    classOfTrade: ClassOfTrade;
    parentEntity: string; // e.g. "Penn Medicine System"
    regulatoryProfile: {
        is340B: boolean;
        is340B_ID?: string; // Specific ID for Diversion Check
        deaLicense: ('II' | 'III' | 'IV' | 'V')[]; // Controlled substance schedules allowed
        dscsaCompliant: boolean; // Drug Supply Chain Security Act
        stateLicense: string;
        licenseType?: 'pharmacy' | 'wholesaler'; // For Act 145
        orphanDrugExclusion: boolean; // Cannot use 340B for orphan drugs
        gpoProhibition: boolean; // Cannot use GPO for outpatient drugs
        totalDispensingStats?: { // For Act 145 5% Rule
            transfersYTD: number;
            totalDispensing: number;
        };
    };
    departments: Department[];
    coordinates: {
        lat: number;
        lng: number;
    };
    address: string;
    phone: string;
    manager: string;
    status: 'operational' | 'limited' | 'offline';
    capacity: number; // Total storage capacity
    currentUtilization: number; // Percentage
}

export interface SiteInventory {
    siteId: string;
    drugs: DrugInventoryItem[];
    lastUpdated: string;
}

export interface DrugInventoryItem {
    drugName: string;
    ndc: string;
    quantity: number;
    minLevel: number;
    maxLevel: number;
    status: 'well_stocked' | 'low' | 'critical' | 'overstocked';
    expirationWarnings: number; // Count of items expiring soon
}

export interface NetworkRequest {
    id: string;
    requestedBy: string;
    requestedBySite: Site;
    sourceDepartmentId?: string; // Optional for backward compatibility
    targetSite: Site;
    targetDepartmentId?: string; // Optional for backward compatibility
    drug: {
        name: string;
        ndc: string;
        quantity: number;
        lotNumber?: string;
    };
    reason: string;
    urgency: 'routine' | 'urgent' | 'emergency';
    status: 'pending' | 'approved' | 'denied' | 'in_transit' | 'completed';
    requestedAt: string;
    approvedBy?: string;
    approvedAt?: string;
    inTransitAt?: string;
    estimatedDelivery?: string;
    completedAt?: string;
    policyChecks?: {
        id: string;
        name: string;
        passed: boolean;
        message: string;
    }[];
}

export interface SupplyLevel {
    drugName: string;
    ndc: string;
    distribution: SiteDistribution[];
    totalNetwork: number;
    networkDemand: number;
    status: 'balanced' | 'surplus' | 'shortage';
}

export interface SiteDistribution {
    site: Site;
    quantity: number;
    status: 'well_stocked' | 'low' | 'critical' | 'overstocked';
}

export type MapFilter = {
    stockLevel?: 'all' | 'well_stocked' | 'low' | 'critical' | 'overstocked';
    siteType?: 'all' | 'hospital' | 'clinic' | 'warehouse' | 'pharmacy';
    drug?: string;
};
export type TransportMethod = 'drone' | 'courier_bike' | 'courier_car' | 'van_refrigerated' | 'freight';

export interface TransferSuggestion {
    id: string;
    targetSiteId: string;
    sourceSiteId?: string; // Optional because "Buy" has no internal source
    externalSourceId?: string; // For "Buy" option
    action: 'transfer' | 'buy'; // NEW: Explicit action type
    drugName: string;
    ndc: string;
    quantity: number;
    urgency: 'routine' | 'urgent' | 'emergency';
    priorityScore: number; // 0-100, higher is better
    reason: string[];
    transportMethod: TransportMethod | 'shipping_standard' | 'shipping_express';

    // Cost Analysis
    estimatedCost: number;
    costSavings?: number; // If buying is cheaper than transfer (or vice versa, though rare)

    // Time Analysis
    estimatedTimeMinutes: number;
    timeSavedMinutes?: number;
}

