
export interface FdaDrugLabel {
    product_ndc: string;
    generic_name: string;
    brand_name: string;
    labeler_name: string;
    pharm_class?: string[];
    active_ingredient?: string[];
    packaging: { package_ndc: string; description: string }[];
}

export class FdaService {
    private static readonly BASE_URL = 'https://api.fda.gov/drug/ndc.json';

    /**
     * Fetch real drug metadata from openFDA
     * @param ndc 10 or 11 digit NDC
     */
    static async getDrugDetails(ndc: string): Promise<FdaDrugLabel | null> {
        try {
            // OpenFDA uses 5-4 (product_ndc). Input might be 5-4-2 (package_ndc) or raw 10/11 digit.
            // For this implementation, we assume input is formatted or we try to substring it.
            // Simplified logic: Search by brand name if NDC fails, or just try product_ndc.

            // Mocking the "Clean NDC" logic:
            // If 00006-3026-02 -> 00006-3026
            const productNdc = ndc.split('-').slice(0, 2).join('-');

            const response = await fetch(`${this.BASE_URL}?search=product_ndc:"${productNdc}"&limit=1`);

            if (!response.ok) {
                console.warn(`FDA API Non-OK: ${response.status}`);
                return null;
            }

            const data = await response.json();
            if (data.results && data.results.length > 0) {
                return data.results[0];
            }
            return null;

        } catch (error) {
            console.error("Failed to fetch from FDA API:", error);
            return null;
        }
    }
}
