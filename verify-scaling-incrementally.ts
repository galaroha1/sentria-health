
import { OptimizationService } from './src/services/optimization.service';
import { PatientService } from './src/features/clinical/services/patient.service';
import { sites, siteInventories } from './src/data/location/mockData';
import { Patient } from './src/types/patient';

async function verifyIncrementalScaling() {
    console.log("--- INCREMENTAL SCALING TEST ---");

    let currentPatients: Patient[] = [];

    // Baseline
    const baselineProposals = await OptimizationService.generateProposals(sites, siteInventories, currentPatients);
    console.log(`[0 Patients] Proposals: ${baselineProposals.length} | Units: ${baselineProposals.reduce((s, p) => s + p.quantity, 0)}`);

    // Add 50
    console.log("\n... Adding 50 Patients ...");
    const batch1 = PatientService.generateMockPatients(50);
    currentPatients = [...currentPatients, ...batch1];

    const prop50 = await OptimizationService.generateProposals(sites, siteInventories, currentPatients);
    const units50 = prop50.reduce((s, p) => s + p.quantity, 0);
    console.log(`[50 Patients] Proposals: ${prop50.length} | Units: ${units50}`);

    // Add 50 More (Total 100)
    console.log("\n... Adding 50 MORE Patients (Total 100) ...");
    const batch2 = PatientService.generateMockPatients(50);
    currentPatients = [...currentPatients, ...batch2];

    const prop100 = await OptimizationService.generateProposals(sites, siteInventories, currentPatients);
    const units100 = prop100.reduce((s, p) => s + p.quantity, 0);
    console.log(`[100 Patients] Proposals: ${prop100.length} | Units: ${units100}`);

    // ANALYSIS
    const delta1 = units50;
    const delta2 = units100 - units50;

    console.log("\n--- ANALYSIS ---");
    console.log(`Delta (0->50): +${delta1} units`);
    console.log(`Delta (50->100): +${delta2} units`);

    if (delta2 < delta1 * 0.5) {
        console.error("FAIL: Diminishing returns detected! Valid demand should scale linearly.");
        console.error("Possible Cause: EOQ capping or Inventory Saturation.");
    } else if (units100 === units50) {
        console.error("FAIL: ZERO change detected! New patients ignored.");
    } else {
        console.log("SUCCESS: Demand scaling looks healthy.");
    }
}

verifyIncrementalScaling();
