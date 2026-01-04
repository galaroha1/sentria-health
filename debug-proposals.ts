
import { OptimizationService } from './src/services/optimization.service';
import { PatientService } from './src/features/clinical/services/patient.service';
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

function generatePatients(count: number): Patient[] {
    const patients: Patient[] = [];
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

async function debug() {
    console.log("--- DEBUGGING OPTIMIZATION OUTPUT ---");
    const PATIENT_COUNT = 1000;
    console.log(`Generating ${PATIENT_COUNT} patients...`);
    const patients = generatePatients(PATIENT_COUNT);

    console.log(`Running Optimization...`);
    const proposals = await OptimizationService.generateProposals(sites, siteInventories, patients);

    console.log(`\nTotal Proposals: ${proposals.length}`);

    // Group by Site and Drug to see distribution
    const frequency: Record<string, number> = {};
    const drugs: Record<string, number> = {};
    const sitesMap: Record<string, number> = {};

    proposals.forEach(p => {
        const key = `${p.targetSiteName} - ${p.drugName}`;
        frequency[key] = (frequency[key] || 0) + 1;
        drugs[p.drugName] = (drugs[p.drugName] || 0) + 1;
        sitesMap[p.targetSiteName] = (sitesMap[p.targetSiteName] || 0) + 1;
    });

    console.log("\n--- Breakdown by Proposal (Site - Drug) ---");
    Object.entries(frequency).forEach(([key, count]) => console.log(`[${count}] ${key}`));

    console.log("\n--- Breakdown by Drug ---");
    Object.entries(drugs).forEach(([key, count]) => console.log(`[${count}] ${key}`));

    console.log("\n--- Breakdown by Site ---");
    Object.entries(sitesMap).forEach(([key, count]) => console.log(`[${count}] ${key}`));
}

debug();
