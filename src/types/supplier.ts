export type SupplierId = 'mckesson' | 'cardinal' | 'amerisource' | 'goodrx' | 'express_scripts';

export interface Supplier {
    id: SupplierId;
    name: string;
    logo: string; // URL or icon name
    reliabilityScore: number; // 0-100
    averageDeliveryTimeHours: number;
}

export interface SupplierQuote {
    supplierId: SupplierId;
    ndc: string;
    price: number;
    priceTrend: 'up' | 'down' | 'stable'; // vs yesterday
    availableQuantity: number;
    deliveryDate: string; // ISO string
    moq: number; // Minimum Order Quantity
    manufacturer?: string; // From FDA
    isRealTime: boolean; // True if from API, False if simulated
    quoteType?: 'Distributor' | 'Retail' | 'PBM';
    fdaDetails?: {
        brand_name: string;
        generic_name: string;
        pharm_class?: string[];
        labeler_name?: string;
    };
    // Advanced Simulation Fields
    storageRequirement?: 'ambient' | 'refrigerated' | 'frozen' | 'hazardous';
    administrationRoute?: 'IV' | 'Oral' | 'Subcutaneous' | 'IM';
    billing?: {
        jCode?: string;
        billingUnit?: string;
        wholesaleAcquisitionCost?: number;
    };
}

export interface MarketSignal {
    id: string;
    drugName: string;
    ndc: string;
    type: 'price_drop' | 'shortage_risk' | 'new_generic';
    severity: 'info' | 'warning' | 'opportunity';
    message: string;
    timestamp: string;
    source: SupplierId;
}
