import type { Site } from '../../inventory/types/location';

export type TransportMethod = 'drone' | 'courier_bike' | 'courier_car' | 'van_refrigerated' | 'freight';

export interface NetworkRequest {
    id: string;
    requestedBy: string;
    requestedBySite: Site;
    sourceDepartmentId?: string;
    targetSite: Site;
    targetDepartmentId?: string;
    drug: {
        name: string;
        ndc: string;
        quantity: number;
        lotNumber?: string;
    };
    reason: string;
    urgency: 'routine' | 'urgent' | 'emergency';
    type?: 'transfer' | 'procurement'; // Added to track request nature
    savings?: number; // Added to track realized savings
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

export interface TransferSuggestion {
    id: string;
    targetSiteId: string;
    sourceSiteId?: string;
    externalSourceId?: string;
    action: 'transfer' | 'buy';
    drugName: string;
    ndc: string;
    quantity: number;
    urgency: 'routine' | 'urgent' | 'emergency';
    priorityScore: number;
    reason: string[];
    transportMethod: TransportMethod | 'shipping_standard' | 'shipping_express';

    // Cost Analysis
    estimatedCost: number;
    costSavings?: number;

    // Time Analysis
    estimatedTimeMinutes: number;
    timeSavedMinutes?: number;

    // UI Display Helpers
    sourceDepartmentName?: string;
}
