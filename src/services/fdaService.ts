
const BASE_URL = 'https://api.fda.gov';

export interface FdaDeviceResult {
    gudid: {
        device_identifier: string;
        brand_name: string;
        version_model_number: string;
        company_name: string;
    };
}

export interface FdaDrugResult {
    openfda: {
        brand_name: string[];
        generic_name: string[];
        manufacturer_name: string[];
        product_ndc: string[];
    };
}

export interface FdaRecallResult {
    recall_number: string;
    reason_for_recall: string;
    status: string;
    distribution_pattern: string;
    product_description: string;
    recall_initiation_date: string;
}

export const fdaService = {
    /**
     * Verify a medical device using its UDI (Device Identifier).
     * @param udi The Device Identifier portion of the UDI.
     */
    async verifyDeviceByUDI(udi: string): Promise<FdaDeviceResult | null> {
        try {
            const response = await fetch(`${BASE_URL}/device/udi.json?search=device_identifier:"${udi}"&limit=1`);
            if (!response.ok) {
                if (response.status === 404) return null;
                throw new Error(`FDA API Error: ${response.statusText}`);
            }
            const data = await response.json();
            return data.results && data.results.length > 0 ? data.results[0] : null;
        } catch (error) {
            console.error('Failed to verify device:', error);
            return null;
        }
    },

    /**
     * Search for drug labeling information by brand name.
     * @param brandName The brand name of the drug.
     */
    async searchDrugLabel(brandName: string): Promise<FdaDrugResult | null> {
        try {
            const response = await fetch(`${BASE_URL}/drug/label.json?search=openfda.brand_name:"${brandName}"&limit=1`);
            if (!response.ok) {
                if (response.status === 404) return null;
                throw new Error(`FDA API Error: ${response.statusText}`);
            }
            const data = await response.json();
            return data.results && data.results.length > 0 ? data.results[0] : null;
        } catch (error) {
            console.error('Failed to search drug label:', error);
            return null;
        }
    },

    /**
     * Check for active recalls for a specific device or drug.
     * @param term Search term (e.g., brand name, product description).
     * @param type 'device' or 'drug'
     */
    async checkRecalls(term: string, type: 'device' | 'drug'): Promise<FdaRecallResult[]> {
        try {
            const endpoint = type === 'device' ? '/device/recall.json' : '/drug/enforcement.json';
            // Search in product description or reason for recall
            const query = `(product_description:"${term}"+OR+reason_for_recall:"${term}")+AND+status:"Ongoing"`;

            const response = await fetch(`${BASE_URL}${endpoint}?search=${query}&limit=5&sort=recall_initiation_date:desc`);

            if (!response.ok) {
                if (response.status === 404) return [];
                throw new Error(`FDA API Error: ${response.statusText}`);
            }

            const data = await response.json();
            return data.results || [];
        } catch (error) {
            console.error('Failed to check recalls:', error);
            return [];
        }
    }
};
