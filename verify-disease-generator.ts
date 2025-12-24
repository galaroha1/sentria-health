
import { DiseaseGenerator } from './src/utils/diseaseGenerator';

async function verify() {
    console.log("Testing DiseaseGenerator API connection...");
    try {
        const start = Date.now();
        // Generate a small batch to test the API
        const results = await DiseaseGenerator.generateBatch(5);
        const duration = Date.now() - start;

        console.log(`Successfully generated ${results.length} patients in ${duration}ms`);

        // Basic validation
        if (results.length === 5) {
            console.log("✅ API Success: Returned correct count");
            console.log(`Sample Patient: ${results[0].patient.name[0].given[0]} ${results[0].patient.name[0].family}`);
        } else {
            console.error(`❌ API Error: Expected 5 patients, got ${results.length}`);
        }
    } catch (error) {
        console.error("❌ API Failed:", error);
    }
}

verify();
