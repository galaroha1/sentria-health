
import { SyntheaGenerator } from './src/utils/syntheaGenerator.ts';

async function testGenerator() {
    console.log("Testing SyntheaGenerator...");
    const count = 50;
    try {
        const data = await SyntheaGenerator.generateBatch(count);
        console.log(`Requested: ${count}`);
        console.log(`Received: ${data.length}`);

        if (data.length === count) {
            console.log("SUCCESS: Count matches.");
        } else {
            console.error("FAILURE: Count mismatch.");
        }

        if (data.length > 0) {
            console.log("Sample Patient:", data[0].patient.name[0].family);
        }
    } catch (error) {
        console.error("ERROR:", error);
    }
}

testGenerator();
