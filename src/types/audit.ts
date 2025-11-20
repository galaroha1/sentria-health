export interface AuditLogEntry {
    id: string;
    action: 'add' | 'remove' | 'transfer' | 'adjustment' | 'update';
    drugName: string;
    ndc: string;
    quantityChange: number;
    newQuantity: number;
    siteId: string;
    siteName: string;
    userId: string;
    userName: string;
    timestamp: string;
    reason?: string;
}
