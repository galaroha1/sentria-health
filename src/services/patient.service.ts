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

    private static generateSchedule(diagnosis: string): Treatment[] {
        const schedule: Treatment[] = [];
        const today = new Date();
        const drugs = diagnosis.includes('Leukemia') ? ['Methotrexate', 'Vincristine'] :
            diagnosis.includes('Cancer') ? ['Keytruda', 'Paclitaxel'] :
                diagnosis.includes('Crohn') ? ['Remicade'] : ['Insulin'];

        // Generate appointments for next 3 months, strictly in the future
        for (let i = 1; i <= 90; i += 14) { // Start from 1 (tomorrow) to ensure future dates
            const date = new Date(today);
            date.setDate(today.getDate() + i + (Math.random() * 3)); // Add future offset + variance

            // Ensure no past/today dates leak through if variance is weird (though +1 covers it)
            if (date <= today) date.setDate(today.getDate() + 1);

            schedule.push({
                id: `tx-${Date.now()}-${i}`,
                date: date.toISOString(),
                drugName: drugs[Math.floor(Math.random() * drugs.length)],
                ndc: '00006-3026-02', // Mock
                status: 'scheduled',
                dose: '100mg',
                notes: 'Standard protocol'
            });
        }
        return schedule;
    }
}
