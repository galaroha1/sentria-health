
import { OptimizationService } from './src/services/optimization.service';
import { PatientService } from './src/features/clinical/services/patient.service';
import { SimulationResult } from './src/features/clinical/context/SimulationContext';
import { sites, siteInventories } from './src/data/location/mockData';
import { Patient } from './src/types/patient';

// Helper to simulate "AppContext" patient mapping
function mapToPatient(simResult: any): Patient {
    const loc = PatientService.assignLocation(simResult.condition);
    return {
        id: simResult.id,
        mrn: 'MRN-' + simResult.id,
        name: simResult.patientName,
        dateOfBirth: '1980-01-01',
        gender: 'male',
        diagnosis: simResult.condition,
        type: 'adult',
        attendingPhysician: 'Dr. Test',
        assignedSiteId: loc.siteId,
        assignedDepartmentId: loc.assignedDepartmentId,
        treatmentSchedule: PatientService.generateSchedule(simResult.condition),
        biometrics: { weight: 70, height: 170, bsa: 1.8 }
    };
}

// Generate N random patients (simulating SimulationContext + AppContext sync)
function generatePatients(count: number): Patient[] {
    const patients: Patient[] = [];
    // Conditions from medicalDatabase (implied)
    const conditions = ['Hypertension', 'Diabetes', 'Lung Cancer', 'Breast Cancer', 'Pneumonia', 'Sepsis'];

    for (let i = 0; i < count; i++) {
        const cond = conditions[Math.floor(Math.random() * conditions.length)];
        const sim = {
            id: `p-${i}`,
            patientName: `Patient ${i}`,
            condition: cond
        };
        patients.push(mapToPatient(sim));
    }
    return patients;
}

async function runTest(patientCount: number, iterations: number = 3) {
    console.log(`\n--- Testing with ${patientCount} Patients ---`);
    for (let i = 1; i <= iterations; i++) {
        const patients = generatePatients(patientCount);

        // Reset inventory for each run to ensure clean slate (mimic "Gap Analysis" on empty/low stock)
        // We use the mock inventories but clear quantities to force full gap analysis
        const emptyInventories = siteInventories.map(inv => ({
            ...inv,
            drugs: inv.drugs.map(d => ({ ...d, quantity: 0 }))
        }));

        const proposals = await OptimizationService.generateProposals(sites, emptyInventories, patients);
        console.log(`Run ${i}: ${proposals.length} Proposals generated.`);
    }
}

async function main() {
    await runTest(50);
    await runTest(100);
    await runTest(150);
}

main();
