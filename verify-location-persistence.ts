
import { PatientService } from './src/features/clinical/services/patient.service';

// Mock Patient Data from Firestore (Simulated)
const mockSimResult = {
    id: 'sim-123',
    patientName: 'John Doe',
    condition: 'Acute Lymphoblastic Leukemia',
    // PERSISTED LOCATION (The fix)
    assignedSiteId: 'site-1',
    assignedDepartmentId: 'dept-1-2',
    biometrics: { weight: 80, height: 180, bsa: 2.0 }
};

// Simulation of AppContext logic
function testAppContextMapping(sim: any) {
    console.log(`[TEST] Persisted Data: Site=${sim.assignedSiteId}, Dept=${sim.assignedDepartmentId}`);

    const fallbackLoc = !sim.assignedSiteId ? PatientService.assignLocation(sim.condition) : null;
    const assignedLocation = {
        assignedSiteId: sim.assignedSiteId || fallbackLoc?.siteId,
        assignedDepartmentId: sim.assignedDepartmentId || fallbackLoc?.assignedDepartmentId
    };

    console.log(`[RESULT] Mapped Location: Site=${assignedLocation.assignedSiteId}, Dept=${assignedLocation.assignedDepartmentId}`);

    if (assignedLocation.assignedSiteId === 'site-1' && assignedLocation.assignedDepartmentId === 'dept-1-2') {
        console.log("SUCCESS: Persisted location was respected.");
    } else {
        console.error("FAIL: Logic overrode persisted location with random assignment!");
        console.log("Expected: site-1 / dept-1-2");
    }
}

testAppContextMapping(mockSimResult);

// Test fallback
console.log("\n--- Testing Fallback (Legacy Data) ---");
testAppContextMapping({ ...mockSimResult, assignedSiteId: null });
