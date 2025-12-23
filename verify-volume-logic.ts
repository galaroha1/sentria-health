
import { OptimizationService } from './src/services/optimization.service';
import { PatientService } from './src/services/patient.service';
import { definitions } from './src/types/location'; // Verify imports
import { Site, SiteInventory } from './src/types/location';
import { Patient } from './src/types/patient';

// 1. Setup: Two Sites
// Site A (Source): Has Surplus of 20 units
// Site B (Target): Has Demand (Variable)
const siteA: Site = {
    id: 'site-src', name: 'Source Hosp', type: 'hospital',
    coordinates: { lat: 0, lng: 0 }, address: 'A', status: 'operational', capacity: 100, currentUtilization: 50,
    departments: [{ id: 'dept-a', name: 'Pharmacy', type: 'pharmacy', capacity: 100, occupancy: 50 }],
    regulatoryProfile: { is340B: true, deaLicense: [], dscsaCompliant: true, stateLicense: 'PA-1', licenseType: 'hospital' },
    classOfTrade: 'acute'
};
const invA: SiteInventory = {
    siteId: 'site-src', lastUpdated: new Date().toISOString(),
    drugs: [{
        ndc: '0006-3026-02', drugName: 'Keytruda', quantity: 30, // 20 Surplus (assuming min 10)
        minLevel: 10, maxLevel: 50, status: 'overstocked'
    }]
};

const siteB: Site = {
    id: 'site-dst', name: 'Dest Hosp', type: 'hospital',
    coordinates: { lat: 0.1, lng: 0.1 }, address: 'B', status: 'operational', capacity: 100, currentUtilization: 50,
    departments: [{ id: 'dept-b', name: 'Oncology', type: 'medical', capacity: 100, occupancy: 50 }],
    regulatoryProfile: { is340B: true, deaLicense: [], dscsaCompliant: true, stateLicense: 'PA-2', licenseType: 'hospital' },
    classOfTrade: 'acute'
};
const invB: SiteInventory = {
    siteId: 'site-dst', lastUpdated: new Date().toISOString(),
    drugs: [{
        ndc: '0006-3026-02', drugName: 'Keytruda', quantity: 5, // Low stock
        minLevel: 10, maxLevel: 50, status: 'low'
    }]
};

// Helper: Generate Patients to create N units of demand
function generatePatients(count: number): Patient[] {
    const pats: Patient[] = [];
    for (let i = 0; i < count; i++) {
        pats.push({
            id: `p-${i}`, mrn: `MRN-${i}`, name: `Pat ${i}`,
            dateOfBirth: '1980-01-01', gender: 'male', diagnosis: 'Cancer', type: 'adult', attendingPhysician: 'Dr. X',
            assignedSiteId: 'site-dst', assignedDepartmentId: 'dept-b',
            treatmentSchedule: [{
                id: `tx-${i}`, date: new Date(Date.now() + 86400000).toISOString(),
                drugName: 'Keytruda', ndc: '0006-3026-02', status: 'scheduled', dose: '1 unit',
            }]
        });
    }
    return pats;
}

async function runScenario(scenarioName: string, patientCount: number) {
    console.log(`\n--- Scenario: ${scenarioName} (${patientCount} Units Demand) ---`);
    console.log(`Context: Site A has 20 units surplus. Site B needs ${patientCount}.`);

    // We expect:
    // If Demand <= 20: Should perform TRANSFER only (Cheaper).
    // If Demand > 20: Should exhaust TRANSFER (20) then PURCHASE remainder.

    const patients = generatePatients(patientCount); // 1 patient = 1 unit demand approx (simplified)

    const plan = await OptimizationService.generateProposals([siteA, siteB], [invA, invB], patients);

    // Analyze Result
    const transfers = plan.filter(p => p.type === 'transfer');
    const purchases = plan.filter(p => p.type === 'procurement');

    if (transfers.length > 0) {
        console.log(`> Transferred: ${transfers.reduce((s, t) => s + t.quantity, 0)} units from ${transfers[0].sourceSiteName}`);
    }
    if (purchases.length > 0) {
        console.log(`> Purchased: ${purchases.reduce((s, p) => s + p.quantity, 0)} units from ${purchases[0].vendorName}`);
    }

    if (transfers.length > 0 && purchases.length > 0) {
        console.log("RESULT: HYBRID STRATEGY (Smart Balancing)");
    } else if (transfers.length > 0) {
        console.log("RESULT: INTERNAL OPTIMIZATION (Cost Saving)");
    } else {
        console.log("RESULT: DIRECT PROCUREMENT");
    }
}

async function main() {
    // 1. Low Demand (Should fit in surplus)
    await runScenario("Low Demand", 10);

    // 2. High Demand (Should exceed surplus)
    await runScenario("High Demand", 100);
}

main();
