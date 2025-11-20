export interface Department {
    id: string;
    name: string;
    type: 'pharmacy' | 'clinical' | 'surgical';
}

export interface InventoryItem {
    id: string;
    drugName: string;
    ndc: string;
    lotNumber: string;
    quantity: number;
    expirationDate: string;
    storageRequirements: string;
    payerRestrictions?: string[];
    departmentId: string;
}

export type TransferStatus = 'pending' | 'approved' | 'denied' | 'in_transit' | 'completed' | 'cancelled';

export interface PolicyCheck {
    id: string;
    name: string;
    passed: boolean;
    message: string;
}

export interface TransferRequest {
    id: string;
    requestedBy: string;
    requestedAt: string;
    sourceDepartment: Department;
    destinationDepartment: Department;
    drug: {
        name: string;
        ndc: string;
        lotNumber: string;
    };
    quantity: number;
    reason: string;
    status: TransferStatus;
    policyChecks: PolicyCheck[];
    approvedBy?: string;
    approvedAt?: string;
    deniedReason?: string;
    completedAt?: string;
    inTransitAt?: string;
}

export interface AuditLogEntry {
    id: string;
    timestamp: string;
    userId: string;
    userName: string;
    action: 'request_created' | 'approved' | 'denied' | 'in_transit' | 'completed' | 'cancelled';
    transferId: string;
    department: string;
    drug: string;
    quantity: number;
    details: string;
}

export interface SuggestedTransfer {
    id: string;
    priority: 'high' | 'medium' | 'low';
    sourceDepartment: Department;
    destinationDepartment: Department;
    drug: {
        name: string;
        ndc: string;
    };
    sourceQuantity: number;
    suggestedQuantity: number;
    destinationNeed: number;
    reason: string;
    potentialSavings?: number;
}
