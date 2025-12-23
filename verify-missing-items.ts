
import { OptimizationService } from './src/services/optimization.service';
import { PatientService } from './src/services/patient.service';
import { Site, SiteInventory } from './src/types/location';
import { Patient } from './src/types/patient';

// 1. Setup Data: Site with NO Inventory
const site: Site = {
    id: 'site-test', name: 'Test Site', type: 'hospital',
    coordinates: { lat: 0, lng: 0 }, address: '123 Test',
    status: 'operational', capacity: 100, currentUtilization: 50,
    departments: [{ id: 'dept-1', name: 'Oncology', type: 'medical', capacity: 20, occupancy: 5 }],
    regulatoryProfile: { is340B: true, deaLicense: [], dscsaCompliant: true, stateLicense: 'PA-123', licenseType: 'hospital' },
    classOfTrade: 'acute'
};

const inventory: SiteInventory = {
    siteId: 'site-test',
    lastUpdated: new Date().toISOString(),
    drugs: [] // EMPTY INVENTORY
};

// 2. Generate Patient needing "Keytruda"
const patient: Patient = {
    id: 'pat-1', mrn: '123', name: 'John Doe',
    dateOfBirth: '1980-01-01', gender: 'male', diagnosis: 'Lung Cancer', type: 'adult',
    attendingPhysician: 'Dr. House',
    assignedSiteId: 'site-test',
    assignedDepartmentId: 'dept-1',
    biometrics: { weight: 70, height: 180, bsa: 1.9 },
    treatmentSchedule: [{
        id: 'tx-1', date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        drugName: 'Keytruda', ndc: '0006-3026-02', status: 'scheduled', dose: '100mg'
    }]
};

// 3. Run Optimization
async function test() {
    console.log("[TEST] Running Optimization with 1 Patient (Demand: Keytruda) vs Empty Inventory...");
    const plan = await OptimizationService.selectOrderPlan([site], [inventory], [patient]);

    console.log(`[TEST] Generated Items: ${plan.items.length}`);
    if (plan.items.length === 0) {
        console.log("FAIL: Patient demand was IGNORED because drug is not in inventory.");
    } else {
        console.log("SUCCESS: Patient demand triggered procurement for new item.");
    }
}

test();
