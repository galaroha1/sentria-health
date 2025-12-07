
import type { Site } from '../types/location';
import type { DrugChannel } from '../types/procurement';

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
     * GATE 1: Wholesale Distribution Gate (Act 145)
     * Checks if the source site is exceeding the 5% transfer rule.
     */
    static checkWholesaleGate(source: Site): { passed: boolean; reason?: string } {
        // If they have a wholesaler license, they are immune.
        if (source.regulatoryProfile.licenseType === 'wholesaler') {
            return { passed: true };
        }

        // Check 5% Rule
        const stats = source.regulatoryProfile.totalDispensingStats;
        if (stats) {
            const ratio = stats.transfersYTD / stats.totalDispensing;
            if (ratio > 0.05) {
                return {
                    passed: false,
                    reason: `Act 145 Violation: Transfer volume (${(ratio * 100).toFixed(1)}%) exceeds 5% limit. Wholesaler license required.`
                };
            }
        }
        return { passed: true };
    }

    /**
     * GATE 2: DSCSA Track & Trace Gate
     * Determines if a Transaction History (T3) is required or if the transfer is exempt.
     */
    static checkDSCSAGate(source: Site, target: Site, reason: string): { passed: boolean; requiresPedigree: boolean; reason: string } {
        // Exemption 1: Common Control (Same Parent Entity)
        if (source.parentEntity === target.parentEntity) {
            return { passed: true, requiresPedigree: false, reason: 'Exempt: Affiliate Transfer (Common Control)' };
        }

        // Exemption 2: Emergency Medical Reason (Patient Specific Need)
        // We'll treat 'urgent' or 'critical' reasons as patient specific for this demo logic
        if (reason.toLowerCase().includes('patient') || reason.toLowerCase().includes('emergency') || reason.toLowerCase().includes('critical')) {
            return { passed: true, requiresPedigree: false, reason: 'Exempt: Emergency Medical Reason (Specific Patient Need)' };
        }

        // If no exemption, it's allowed but REQUIRES full T3 Data
        return {
            passed: true,
            requiresPedigree: true,
            reason: 'DSCSA Requirement: Transfer requires full Transaction History (T3) generation.'
        };
    }

    /**
     * GATE 3: 340B Prohibition Gate (Diversion)
     * Hard blocks transfers of 340B stock between different 340B Covered Entities.
     */
    static check340BGate(source: Site, target: Site, channel: DrugChannel): { passed: boolean; reason?: string } {
        if (channel !== '340B') {
            return { passed: true }; // WAC/GPO are always fine to move
        }

        // If it IS 340B stock:
        // Source and Target MUST share the exact same 340B ID (or be Child Sites of same parent ID)
        const sourceID = source.regulatoryProfile.is340B_ID;
        const targetID = target.regulatoryProfile.is340B_ID;

        if (!sourceID || !targetID) {
            // If either isn't 340B, you definitely can't move 340B stock to/from them (unless contract pharmacy logic, ignored for now)
            return { passed: false, reason: '340B Diversion Risk: One or more sites not 340B eligible.' };
        }

        if (sourceID !== targetID) {
            return {
                passed: false,
                reason: `340B Hard Block: Cannot transfer 340B inventory between different entities (${sourceID} -> ${targetID}). Use WAC stock.`
            };
        }

        return { passed: true };
    }

    /**
     * MASTER COMPLIANCE CHECK
     * Runs all 3 gates in sequence.
     */
    static checkTransferCompliance(source: Site, target: Site, channel: DrugChannel, transferReason: string) {
        // 1. Wholesale Gate
        const g1 = this.checkWholesaleGate(source);
        if (!g1.passed) return { valid: false, reason: g1.reason, riskScore: 100 };

        // 2. 340B Gate (Critical Hard Block)
        const g3 = this.check340BGate(source, target, channel);
        if (!g3.passed) return { valid: false, reason: g3.reason, riskScore: 100 };

        // 3. DSCSA Gate (Soft Gate - adds requirements but doesn't usually block unless system can't generate T3)
        const g2 = this.checkDSCSAGate(source, target, transferReason);

        // Return Success with Logic Trace
        return {
            valid: true,
            riskScore: g2.requiresPedigree ? 10 : 0, // Small risk increase if T3 required (admin burden)
            gates: {
                wholesale: 'PASSED',
                dscsa: g2.reason,
                diversion: 'PASSED'
            },
            notes: [`${g2.reason}`]
        };
    }
}
