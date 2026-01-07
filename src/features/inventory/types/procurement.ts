// --- LEGACY TYPES (Keep for Compatibility) ---
export type DrugChannel = 'WAC' | 'GPO' | '340B' | 'PrimeVendor' | 'WhiteBag';
export type RegulatoryAvatar = 'hospital_340b' | 'clinic_rural' | 'pharmacy_retail' | 'DSH' | 'Clinic' | 'Pharmacy' | 'RRC' | 'FreeStandingCancer' | 'CAH';
export type ClassOfTrade = 'acute' | 'retail' | 'specialty' | 'non_acute';

export interface ProcurementProposal {
    id: string;
    type: 'procurement' | 'transfer';
    targetSiteId: string;
    targetSiteName: string;
    sourceSiteId?: string;
    sourceSiteName?: string;
    vendorName?: string;
    drugName: string;
    ndc: string;
    quantity: number;
    channel?: DrugChannel;
    transferSubType?: 'inter_dept' | 'network_transfer' | 'purchase'; // New Field for Distinction
    trigger?: 'patient_demand' | 'stock_refill'; // Marker for origin
    affectedPatientCount?: number; // New metric for impact
    costAnalysis: {
        distanceKm: number;
        transportCost: number;
        itemCost: number;
        totalCost: number;
        savings?: number;
    };
    fulfillmentNode: string;
    regulatoryJustification: {
        passed: boolean;
        details: string[];
        riskScore?: number;
    };
    reason: string;
    score: number;
    alternativeQuotes?: any[]; // Legacy support
}

// --- NEW ENGINE TYPES ---

export type DemandDistribution = 'normal' | 'poisson' | 'negative_binomial';

export interface DemandForecast {
    drugName: string;
    ndc: string;
    locationId: string;
    period: string; // '2025-01'
    mean: number; // µ
    variance: number; // σ²
    distribution: DemandDistribution;
    confidenceInterval: [number, number]; // [Low, High] 95%
}

export interface SupplierCostFunction {
    minQty: number;
    maxQty: number; // Infinity for top tier
    unitPrice: number;
}

export interface SupplierProfile {
    id: string;
    name: string;
    reliability: number; // 0.0 - 1.0 (Probability of on-time fulfillment)
    leadTimeDays: number;
    leadTimeVariance: number; // σ_LT²
    qualityScore: number; // 0-100
    riskScore: number; // 0-100 (Higher is riskier)
    contractTerms: {
        minOrderQty: number;
        costFunctions: SupplierCostFunction[];
        rebateThresholds?: { qty: number; rebatePercent: number }[];
    };
}

export interface OptimizationParams {
    serviceLevelTarget: number; // e.g., 0.95 (95%)
    holdingCostRate: number; // % of unit price per year
    stockoutCostPerUnit: number; // $ penalty
    riskAversionLambda: number; // Risk weight
    planningHorizonDays: number;
}

export interface OptimizationResult {
    planId: string;
    timestamp: string;
    items: OrderPlanItem[];
    summary: {
        totalCost: number;
        riskAdjustedCost: number;
        serviceLevelPredicted: number;
    };
}

export interface OrderPlanItem {
    sku: string;
    drugName: string;
    supplierId: string;
    supplierName: string;
    targetSiteId: string;
    quantity: number;
    type: 'contract' | 'spot' | 'consignment' | 'transfer';

    // Justification / Analysis
    analysis: {
        forecastMean: number;
        safetyStock: number;
        projectedStockoutRisk: number;
        costBreakdown: {
            purchase: number;
            holding: number;
            stockoutPenalty: number;
            logistics: number;
            riskPenalty: number;
        };
        supplierScore: number;
        alternativeSavings: number; // Savings vs next best option
    };
    metrics?: {
        distanceKm: number;
        durationMinutes: number;
        trafficLevel: 'low' | 'moderate' | 'heavy';
        source: 'google' | 'fallback';
    };
    cause?: 'safety_stock' | 'demand'; // Reason for order
}
