export interface Site {
    id: string;
    name: string;
    type: 'hospital' | 'clinic' | 'warehouse' | 'pharmacy';
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
    targetSite: Site;
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
