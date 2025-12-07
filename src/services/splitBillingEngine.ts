


export interface PatientEncounter {
    id: string;
    patientId: string;
    type: 'inpatient' | 'outpatient' | 'emergency';
    date: string;
    locationId: string;
    providerId: string;
}

export interface Location {
    id: string;
    name: string;
    is340BRegistered: boolean;
}

export interface Provider {
    id: string;
    name: string;
    isEligible: boolean; // Employed or contracted
}

export const splitBillingEngine = {
    /**
     * Determine the eligibility of a dispensation for 340B pricing.
     * Rules:
     * 1. Patient must have an established relationship (Encounter check).
     * 2. Provider must be eligible (Employed/Contracted).
     * 3. Service must be in an eligible location (Outpatient/Mixed-Use).
     * 4. Drug must be eligible (Outpatient use).
     */
    determineEligibility(
        encounter: PatientEncounter,
        provider: Provider,
        location: Location
    ): { status: '340B' | 'GPO' | 'WAC'; reason: string } {

        // 1. Location Check
        if (!location.is340BRegistered) {
            return { status: 'WAC', reason: 'Location not 340B registered' };
        }

        // 2. Patient Status Check (Inpatient vs Outpatient)
        // Inpatient drugs are generally covered by DRG (GPO), not 340B
        if (encounter.type === 'inpatient') {
            return { status: 'GPO', reason: 'Inpatient exclusion' };
        }

        // 3. Provider Eligibility Check
        if (!provider.isEligible) {
            return { status: 'WAC', reason: 'Provider not eligible' };
        }

        // 4. Date Check (Simple validation)
        const encounterDate = new Date(encounter.date);
        const today = new Date();
        if (encounterDate > today) {
            return { status: 'WAC', reason: 'Future encounter date invalid' };
        }

        // If all checks pass
        return { status: '340B', reason: 'All eligibility criteria met' };
    },

    /**
     * Calculate potential savings for a transaction.
     */
    calculateSavings(
        wacPrice: number,
        pricing340b: number,
        quantity: number
    ): number {
        return (wacPrice - pricing340b) * quantity;
    }
};
