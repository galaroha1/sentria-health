
import { PatientService } from './src/features/clinical/services/patient.service';
import { ForecastingService } from './src/services/forecasting.service';
import { Patient } from './src/types/patient';

// 1. Generate a Patient using the EXACT logic from SimulationContext (My Fix)
const condition = "Lung Cancer";
const profile = { name: "Test Patient", age: 55, gender: "male" };
const simLocation = PatientService.assignLocation(condition);

const patient: Patient = {
    id: "test-pat-1",
    mrn: "TEST-MRN",
    name: "Test Patient",
    dateOfBirth: "1970-01-01",
    gender: "male",
    diagnosis: condition,
    type: "adult",
    attendingPhysician: "Dr. Auto",
    treatmentSchedule: PatientService.generateSchedule(condition), // Key check
    assignedSiteId: simLocation.siteId,
    assignedDepartmentId: simLocation.assignedDepartmentId,
    biometrics: {
        weight: 75,
        height: 180,
        bsa: 1.95
    }
};

console.log(`[TEST] Patient Generated. Schedule Length: ${patient.treatmentSchedule.length}`);
if (patient.treatmentSchedule.length > 0) {
    console.log(`[TEST] First Treatment Date: ${patient.treatmentSchedule[0].date}`);
    console.log(`[TEST] First Treatment Drug: ${patient.treatmentSchedule[0].drugName}`);
}

// 2. Run Forecast
const drugName = patient.treatmentSchedule[0]?.drugName || "Keytruda";
const ndc = patient.treatmentSchedule[0]?.ndc || "0006-3026-02";

console.log(`\n[TEST] Running Forecast for ${drugName}...`);
const forecast = ForecastingService.generateProbabilisticForecast(
    ndc,
    patient.assignedSiteId || 'site-1',
    [patient],
    drugName,
    'CURRENT'
);

console.log(`[RESULT] Mean Demand: ${forecast.mean}`);
console.log(`[RESULT] Deterministic Component: ${forecast.modelComponents.mu_deterministic}`);

if (forecast.mean > 0) {
    console.log("SUCCESS: Demand is being generated.");
} else {
    console.error("FAIL: Demand is 0. Check Date Window or Dosage Logic.");
    // Debug Dates
    const today = new Date();
    const horizon = new Date();
    horizon.setDate(today.getDate() + 90);
    console.log(`Window: ${today.toISOString()} to ${horizon.toISOString()}`);
    patient.treatmentSchedule.forEach(t => {
        console.log(`Tx Date: ${t.date} | In Window? ${new Date(t.date) >= today && new Date(t.date) <= horizon}`);
    });
}
