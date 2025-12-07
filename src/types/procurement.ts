import type { OptimizationProposal } from '../services/optimization.service';
import type { SupplierQuote } from './supplier';

export type DrugChannel = 'WAC' | 'GPO' | '340B' | 'WhiteBag' | 'BrownBag' | 'ClearBag';

export type RegulatoryAvatar =
    | 'DSH'    // Disproportionate Share Hospital
    | 'CAH'    // Critical Access Hospital
    | 'RRC'    // Rural Referral Center
    | 'SCH'    // Sole Community Hospital
    | 'FreeStandingCancer'
    | 'Clinic' // Standard Clinic
    | 'Pharmacy';

export type ClassOfTrade = 'acute' | 'non_acute' | 'retail';

export interface ProcurementProposal extends OptimizationProposal {
    channel: DrugChannel;
    regulatoryJustification: {
        passed: boolean;
        details: string[]; // List of rules passed/failed
        riskScore: number; // 0-100 (100 = High Risk)
    };
    fulfillmentNode: 'CentralPharmacy' | 'DirectDrop';
    alternativeQuotes?: SupplierQuote[];
}
