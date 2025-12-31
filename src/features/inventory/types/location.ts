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
    parentEntity: string;
    regulatoryProfile: {
        is340B: boolean;
        is340B_ID?: string;
        deaLicense: ('II' | 'III' | 'IV' | 'V')[];
        dscsaCompliant: boolean;
        stateLicense: string;
        licenseType?: 'pharmacy' | 'wholesaler';
        orphanDrugExclusion: boolean;
        gpoProhibition: boolean;
        totalDispensingStats?: {
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
    capacity: number;
    currentUtilization: number;
}

export interface DrugInventoryItem {
    drugName: string;
    ndc: string;
    quantity: number;
    minLevel: number;
    maxLevel: number;
    status: 'well_stocked' | 'low' | 'critical' | 'overstocked';
    expirationWarnings: number;
}

export interface SiteInventory {
    siteId: string;
    departmentId?: string;
    drugs: DrugInventoryItem[];
    lastUpdated: string;
}

export interface SiteDistribution {
    site: Site;
    quantity: number;
    status: 'well_stocked' | 'low' | 'critical' | 'overstocked';
}

export interface SupplyLevel {
    drugName: string;
    ndc: string;
    distribution: SiteDistribution[];
    totalNetwork: number;
    networkDemand: number;
    status: 'balanced' | 'surplus' | 'shortage';
}

export type MapFilter = {
    stockLevel?: 'all' | 'well_stocked' | 'low' | 'critical' | 'overstocked';
    siteType?: 'all' | 'hospital' | 'clinic' | 'warehouse' | 'pharmacy';
    drug?: string;
};
