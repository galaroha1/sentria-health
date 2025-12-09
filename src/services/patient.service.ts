import type { Patient, Treatment } from '../types/patient';

export class PatientService {
    static generateMockPatients(count: number = 20): Patient[] {
        const patients: Patient[] = [];
        const diagnoses = ['Acute Lymphoblastic Leukemia', 'Breast Cancer - Stage II', 'Diabetes Type 1', 'Crohn\'s Disease'];
        const types: Patient['type'][] = ['pediatric', 'adult', 'geriatric', 'oncology'];

        for (let i = 0; i < count; i++) {
            const diagnosis = diagnoses[Math.floor(Math.random() * diagnoses.length)];
            const type = types[Math.floor(Math.random() * types.length)];

            patients.push({
                id: `pat-${i}`,
                mrn: `MRN-${10000 + i}`,
                name: `Patient ${String.fromCharCode(65 + i)}.`, // Anonymized
                dateOfBirth: new Date(Date.now() - Math.random() * 2000000000000).toISOString().split('T')[0],
                gender: Math.random() > 0.5 ? 'male' : 'female',
                diagnosis,
                type,
                attendingPhysician: 'Dr. Smith',
                treatmentSchedule: this.generateSchedule(diagnosis)
            });
        }
        return patients;
    }

    public static generateSchedule(diagnosis: string): Treatment[] {
        const schedule: Treatment[] = [];
        const today = new Date();

        // ALIGNED CATALOG: Must match 'real-drug-catalog.json' & 'mockData.ts' exactly
        // Format: { name: "DrugName Form", ndc: "Real-NDC" }
        const catalog = {
            leukemia: [
                { name: 'Methotrexate 2.5mg Tablet', ndc: '51672-4110-02' },
                { name: 'Vincristine Sulfate 1mg/mL Vial', ndc: '61703-309-06' }
            ],
            cancer: [
                { name: 'Keytruda 100mg Vial', ndc: '0006-3026-02' },
                { name: 'Opdivo 100mg/10mL Vial', ndc: '0003-3772-11' }
            ],
            crohn: [
                { name: 'Remicade 100mg Vial', ndc: '57894-030-01' },
                { name: 'Humira 40mg/0.8mL Pen', ndc: '0074-3799-02' }
            ],
            diabetes: [
                { name: 'Lantus 100 Units/mL Vial', ndc: '0088-2220-33' },
                { name: 'Humalog 100 Units/mL Vial', ndc: '0002-7510-01' }
            ]
        };

        let selectedDrugs = catalog.diabetes; // default
        if (diagnosis.includes('Leukemia')) selectedDrugs = catalog.leukemia;
        else if (diagnosis.includes('Cancer')) selectedDrugs = catalog.cancer;
        else if (diagnosis.includes('Crohn')) selectedDrugs = catalog.crohn;

        // Generate appointments for next 3 months, strictly in the future
        // SPREAD: 10-15 appointments over 90 days to ensure volume
        for (let i = 1; i <= 90; i += Math.floor(Math.random() * 7) + 3) { // tighter frequency
            const date = new Date(today);
            date.setDate(today.getDate() + i);

            // Double check to be absolutely sure it's future (redundant but safe)
            if (date <= today) {
                date.setDate(today.getDate() + 1);
            }

            const drug = selectedDrugs[Math.floor(Math.random() * selectedDrugs.length)];

            schedule.push({
                id: `tx-${Date.now()}-${i}`,
                date: date.toISOString(),
                drugName: drug.name, // Now matches inventory exactly
                ndc: drug.ndc,      // Now matches inventory exactly
                status: 'scheduled',
                dose: '1 unit', // Parsed as 1 by forecaster
                notes: 'Standard protocol'
            });
        }
        return schedule;
    }
}
