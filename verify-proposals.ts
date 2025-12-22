
// Shim for Node.js execution
// @ts-ignore
if (typeof import.meta === 'undefined') (global as any).import = { meta: { env: { VITE_GOOGLE_MAPS_API_KEY: 'mock-key' } } };
// @ts-ignore
if (!import.meta.env) (import.meta as any).env = { VITE_GOOGLE_MAPS_API_KEY: 'mock-key' };

import { OptimizationService } from './src/services/optimization.service';
import { PatientService } from './src/services/patient.service';
import { sites, siteInventories } from './src/data/location/mockData';

async function verifyProposals() {
    console.log("--- VERIFYING PROPOSAL PIPELINE ---");

    // 1. Generate 100 Patients (Dose = 30 units)
    console.log("Generating 100 mock patients...");
    const patients = PatientService.generateMockPatients(100);

    // 2. Run Optimization Service
    console.log("Running OptimizationService.generateProposals...");
    const proposals = await OptimizationService.generateProposals(sites, siteInventories, patients, []);

    // 3. Analyze Results
    console.log("\n--- RESULTS ---");
    console.log(`Patients Generated: ${patients.length}`);
    console.log(`Proposals Generated: ${proposals.length}`);

    // Group by Reason
    const breakdown = proposals.reduce((acc, p) => {
        const type = p.transferSubType || p.type;
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    console.log("Breakdown by Type:", breakdown);

    if (proposals.length < 50) {
        console.log("\nFAIL: Expected > 50 proposals (1 per patient approx), got " + proposals.length);
        process.exit(1);
    } else {
        console.log("\nSUCCESS: Pipeline is generating proposals.");
        process.exit(0);
    }
}

verifyProposals();
