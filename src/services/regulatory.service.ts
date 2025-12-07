
import type { Site } from '../types/location';
import type { DrugChannel, RegulatoryAvatar, ClassOfTrade } from '../types/procurement';

export class RegulatoryService {

    /**
     * Check if a specific procurement channel is allowed for a site and drug type.
     */
    static checkChannelEligibility(
        site: Site,
        channel: DrugChannel,
        isOrphanDrug: boolean,
        patientType: 'inpatient' | 'outpatient'
    ): { allowed: boolean; reason?: string } {

        // 1. GPO PROHIBITION (DSH, Cancer Hospitals)
        // DSH and Cancer Hospitals cannot use GPO for OUTPATIENT drugs.
        if (channel === 'GPO' && patientType === 'outpatient') {
            if (['DSH', 'FreeStandingCancer'].includes(site.regulatoryAvatar)) {
                return {
                    allowed: false,
                    reason: `GPO Prohibition: ${site.regulatoryAvatar} sites cannot use GPO for outpatient use.`
                };
            }
        }

        // 2. ORPHAN DRUG EXCLUSION (CAH, RRC, SCH, Cancer Hospitals)
        // These sites cannot use 340B pricing for Orphan-designated drugs.
        if (channel === '340B' && isOrphanDrug) {
            if (['CAH', 'RRC', 'SCH', 'FreeStandingCancer'].includes(site.regulatoryAvatar)) {
                return {
                    allowed: false,
                    reason: `Orphan Exclusion: ${site.regulatoryAvatar} sites cannot use 340B for orphan drugs.`
                };
            }
        }

        // 3. WAC is always allowed (safety valve)
        if (channel === 'WAC') {
            return { allowed: true };
        }

        // 4. White Bagging Check (Requires Payer Policy - assumed passed if channel requested)
        if (channel === 'WhiteBag') {
            // In reality, check payer policy here.
            return { allowed: true };
        }

        // Default allow if no prohibition found (e.g. 340B for DSH non-orphan)
        return { allowed: true };
    }

    /**
     * Check if "Own Use" transfer is valid between two sites
     * NPIA (Non-Profit Institutions Act) constraint.
     */
    static checkOwnUseTransfer(source: Site, target: Site): { valid: boolean; reason?: string } {
        // Must be same corporate entity (assumed true for this internal network)

        // CLASS OF TRADE Check
        // Cannot transfer from Acute (Low Cost) to Non-Acute (Higher Cost) if it violates contract?
        // Actually, usually it's about not selling "Own Use" stock to non-eligible entities.

        // Simple Rule for Demo: 
        // 1. Cannot transfer from Hospital (Acute) to Retail Pharmacy.
        // 2. Cannot transfer to a site that doesn't share the same 340B status if using 340B stock (already in optimization service)

        if (source.classOfTrade === 'acute' && target.classOfTrade === 'retail') {
            return { valid: false, reason: 'Own Use Violation: Cannot transfer acute stock to retail.' };
        }

        return { valid: true };
    }
}
