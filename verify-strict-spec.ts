
import { OptimizationService } from './src/services/optimization.service';
import { Site, SiteInventory } from './src/types/location';
import { Patient } from './src/types/patient';

// Setup: Source has 60, Max 50 -> Surplus 10
const sourceSite: Site = {
    id: 'site-source', name: 'Source', type: 'hospital',
    coordinates: { lat: 0, lng: 0 }, address: 'A', status: 'operational',
    departments: [], regulatoryProfile: {} as any, classOfTrade: 'acute'
};
const sourceInv: SiteInventory = {
    siteId: 'site-source', lastUpdated: new Date().toISOString(),
    drugs: [{
        ndc: '123', drugName: 'TestDrug', quantity: 60,
        minLevel: 10, maxLevel: 50, status: 'overstocked'
    }]
};

// Setup: Target needs 100 (0 stock)
const targetSite: Site = {
    id: 'site-target', name: 'Target', type: 'hospital',
    coordinates: { lat: 0, lng: 0 }, address: 'B', status: 'operational',
    departments: [], regulatoryProfile: {} as any, classOfTrade: 'acute'
};
const targetInv: SiteInventory = {
    siteId: 'site-target', lastUpdated: new Date().toISOString(),
    drugs: [] // Empty
};

// Patient demanding 100 units
const patient: Patient = {
    id: 'p1', mrn: '1', name: 'Test', dateOfBirth: '2000-01-01', gender: 'male', diagnosis: 'test', type: 'adult',
    assignedSiteId: 'site-target',
    treatmentSchedule: [{
        id: 't1', date: new Date(Date.now() + 86400000).toISOString(), // Future
        drugName: 'TestDrug', ndc: '123', status: 'scheduled', dose: '100 units'
    }]
} as any;

async function verify() {
    console.log("--- RUNNING STRICT SPEC VERIFICATION ---");
    console.log("Scenario: Source(Qty=60, Max=50) -> Surplus=10. Demand=100.");

    const proposals = await OptimizationService.generateProposals(
        [sourceSite, targetSite],
        [sourceInv, targetInv],
        [patient]
    );

    const transfer = proposals.find(p => p.type === 'transfer');
    const purchase = proposals.find(p => p.type === 'procurement');

    console.log(`\nTransfer Proposal Qty: ${transfer?.quantity || 0}`);
    console.log(`Purchase Proposal Qty: ${purchase?.quantity || 0}`);

    if (transfer?.quantity === 10) {
        console.log("✅ PASS: Strict Surplus Logic verified (Transferred exactly 10).");
    } else {
        console.log(`❌ FAIL: Expected Transfer 10, got ${transfer?.quantity}.`);
        console.log(`Debug Info: Source Qty: ${sourceInv.drugs[0].quantity}, Max: ${sourceInv.drugs[0].maxLevel}`);
    }

    if (purchase?.quantity >= 90) { // Approx 90+ depending on safety stock
        console.log(`✅ PASS: Gap filled by purchase (${purchase.quantity}).`);
    } else {
        console.log(`❌ FAIL: Expected Purchase ~90+, got ${purchase?.quantity}.`);
    }
}

verify();
