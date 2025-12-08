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

    public static generateSchedule(diagnosis: string, drugOverride?: string): Treatment[] {
        const schedule: Treatment[] = [];
        const today = new Date();
        const drugs = diagnosis.includes('Leukemia') ? ['Methotrexate', 'Vincristine'] :
            diagnosis.includes('Cancer') ? ['Keytruda', 'Paclitaxel'] :
                diagnosis.includes('Crohn') ? ['Remicade'] : ['Insulin'];

        // Generate appointments for next 3 months, strictly in the future
        for (let i = 1; i <= 90; i += 14) { // Start from 1 (tomorrow) to ensure future dates
            const date = new Date(today);
            // Ensure strictly future: today + i days (where i >= 1) + random variance
            // We use setDate to safely handle month rollovers
            date.setDate(today.getDate() + i + Math.floor(Math.random() * 3));

            // Double check to be absolutely sure it's future (redundant but safe)
            if (date <= today) {
                date.setDate(today.getDate() + 1);
            }

            schedule.push({
                id: `tx-${Date.now()}-${i}`,
                date: date.toISOString(),
                drugName: drugOverride || drugs[Math.floor(Math.random() * drugs.length)],
                ndc: '00006-3026-02', // Mock
                status: 'scheduled',
                dose: '100mg',
                notes: 'Standard protocol'
            });
        }
        return schedule;
    }
}
