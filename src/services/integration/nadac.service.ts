export interface NadacPrice {
    ndc: string;
    ndc_description: string;
    nadac_per_unit: number;
    effective_date: string;
    classification_for_rate_setting: string;
}

export class NadacService {
    private static readonly BASE_URL = 'https://data.medicaid.gov/resource/tau9-ry5h.json';

    static async getPriceBenchmark(ndc: string): Promise<NadacPrice | null> {
        try {
            // NADAC typically uses 11-digit NDC without dashes, or specific formats.
            // We'll strip non-digits to be safe.
            const cleanNdc = ndc.replace(/[^0-9]/g, '');

            // Query for the specific NDC
            // This is a Socrata SODA API endpoint
            const response = await fetch(`${this.BASE_URL}?ndc=${cleanNdc}&$order=effective_date DESC&$limit=1`);

            if (!response.ok) {
                console.warn(`NADAC API Error: ${response.statusText}`);
                return null;
            }

            const data = await response.json();

            if (Array.isArray(data) && data.length > 0) {
                const item = data[0];
                return {
                    ndc: item.ndc,
                    ndc_description: item.ndc_description,
                    nadac_per_unit: parseFloat(item.nadac_per_unit),
                    effective_date: item.effective_date,
                    classification_for_rate_setting: item.classification_for_rate_setting
                };
            }

            return null;
        } catch (error) {
            console.error('Error fetching NADAC price:', error);
            return null;
        }
    }
}
