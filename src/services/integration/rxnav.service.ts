export class RxNavService {
    private static readonly BASE_URL = 'https://rxnav.nlm.nih.gov/REST';

    /**
     * Get Interaction/Clinical data using RxNorm APIs
     */
    static async getClinicalData(ndc: string) {
        try {
            // 1. Find RxNorm CUI (Concept Unique Identifier) from NDC
            // Endpoint: /ndcstatus.json?ndc=...
            const cuiResponse = await fetch(`${this.BASE_URL}/ndcstatus.json?ndc=${ndc}`);
            if (!cuiResponse.ok) return null;

            const cuiData = await cuiResponse.json();
            const rxcui = cuiData.ndcStatus?.rxcui;

            if (!rxcui) return null;

            // 2. Get All Related Properties (Interactions, etc would go here in a full app)
            // For now, let's get the standard RxNorm name and dose form
            const propResponse = await fetch(`${this.BASE_URL}/rxcui/${rxcui}/allProperties.json?prop=all`);
            if (!propResponse.ok) return null;

            const propData = await propResponse.json();

            // Helper to find property value
            const getProp = (name: string) => {
                const pair = propData.propConceptGroup?.propConcept?.find((p: any) => p.propName === name);
                return pair ? pair.propValue : undefined;
            };

            return {
                rxcui,
                name: getProp('RxNorm Name') || cuiData.ndcStatus.conceptName,
                doseForm: getProp('RXN_DOSE_FORM'),
                attributes: propData.propConceptGroup?.propConcept?.map((p: any) => ({ name: p.propName, value: p.propValue })) || []
            };

        } catch (error) {
            console.error('Error fetching RxNav data:', error);
            return null;
        }
    }
}
