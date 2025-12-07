
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Fetch polyfill if needed (Node 18+ has it native)
// const fetch = ... 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_PATH = path.join(__dirname, '../src/data/real-drug-catalog.json');
const FDA_API_URL = 'https://api.fda.gov/drug/ndc.json?limit=500';

async function fetchDrugs() {
    console.log('Fetching data from openFDA...');
    try {
        const response = await fetch(FDA_API_URL);
        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }
        const data = await response.json();
        const results = data.results || [];

        console.log(`Received ${results.length} records. Processing...`);

        const catalog = results.map((item, index) => {
            // Extract primary fields, fallback to "Unknown" if missing
            const brand = item.brand_name || item.generic_name || 'Unknown Drug';
            const generic = item.generic_name || '';
            const manufacturer = item.labeler_name || 'Unknown Manufacturer';
            const ndc = item.product_ndc || item.packaging?.[0]?.package_ndc || '00000-0000';
            const form = item.dosage_form || 'Unspecified';

            // Infer categories / temperature mostly for UI flavor, 
            // since FDA doesn't strictly provide "Oncology" category in this endpoint easily (needs join).
            // We will map based on simple keywords or default.
            let category = 'General Medicine';
            let temp = 'Ambient';

            const lowerBrand = brand.toLowerCase();
            const lowerGeneric = generic.toLowerCase();
            const lowerForm = form.toLowerCase();

            if (lowerBrand.includes('vaccine') || lowerGeneric.includes('vaccine')) {
                category = 'Infectious Disease';
                temp = 'Refrigerated';
            } else if (lowerBrand.includes('insulin') || lowerGeneric.includes('insulin')) {
                category = 'Endocrinology';
                temp = 'Refrigerated';
            } else if (lowerForm.includes('injection') || lowerForm.includes('solution')) {
                // Broad guess
                temp = 'Refrigerated';
            }

            if (lowerBrand.includes('mab') || lowerGeneric.includes('mab') || lowerGeneric.endsWith('mab')) {
                category = 'Oncology'; // Most Mabs are oncology/immuno
                temp = 'Refrigerated';
            }

            // Generate a numeric price somewhat tied to string length/random hash for stability (so it doesn't change every run if we re-ran)
            const priceSeed = brand.length + manufacturer.length;
            const price = 50 + (priceSeed * 12.5) % 9000;

            return {
                id: `real-drug-${index}`,
                name: brand,
                genericName: generic,
                ndc: ndc,
                manufacturer: manufacturer,
                form: form,
                price: parseFloat(price.toFixed(2)),
                category: category,
                temperature: temp
            };
        });

        // Filter out items without Names
        const cleanCatalog = catalog.filter(c => c.name !== 'Unknown Drug');

        fs.writeFileSync(OUTPUT_PATH, JSON.stringify(cleanCatalog, null, 2));
        console.log(`Success! Wrote ${cleanCatalog.length} records to ${OUTPUT_PATH}`);

    } catch (error) {
        console.error('Failed to fetch drugs:', error);
        process.exit(1);
    }
}

fetchDrugs();
