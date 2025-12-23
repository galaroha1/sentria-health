
import { OptimizationService } from './src/services/optimization.service';
import { Site, SiteInventory } from './src/types/location';
import { Patient } from './src/types/patient';

// Setup: Simple Demand Scenario
const sourceSite: Site = {
    id: 'site-source', name: 'Source', type: 'hospital',
    coordinates: { lat: 0, lng: 0 }, address: 'A', status: 'operational',
    departments: [], regulatoryProfile: {} as any, classOfTrade: 'acute'
};
const sourceInv: SiteInventory = {
    siteId: 'site-source', lastUpdated: new Date().toISOString(),
    drugs: [{ ndc: '123', drugName: 'TestDrug', quantity: 0, minLevel: 0, maxLevel: 50, status: 'critical' }]
};

// Patient demanding > 0
const patient: Patient = {
    id: 'p1', mrn: '1', name: 'Test', dateOfBirth: '2000-01-01', gender: 'male', diagnosis: 'test', type: 'adult',
    assignedSiteId: 'site-source',
    treatmentSchedule: [{
        id: 't1', date: new Date(Date.now() + 86400000).toISOString(),
        drugName: 'TestDrug', ndc: '123', status: 'scheduled', dose: '100 units'
    }]
} as any;

async function verify() {
    console.log("--- RUNNING TRIGGER VERIFICATION ---");
    const proposals = await OptimizationService.generateProposals(
        [sourceSite],
        [sourceInv],
        [patient]
    );

    const prop = proposals[0];
    if (!prop) {
        console.log("❌ FAIL: No proposal generated.");
        return;
    }

    console.log(`Proposal Trigger Field: ${prop.trigger}`);

    if (prop.trigger === 'patient_demand') {
        console.log("✅ PASS: Trigger field is present and correct.");
    } else {
        console.log(`❌ FAIL: Expected 'patient_demand', got '${prop.trigger}'.`);
    }
}

verify();
