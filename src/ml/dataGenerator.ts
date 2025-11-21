import type { PatientEHR } from './clinicalRules';

// Generate realistic synthetic patient EHR data for testing
export function generatePatientData(): PatientEHR[] {
    return [
        {
            id: 'P001',
            demographics: {
                age: 55,
                gender: 'M',
                bmi: 32.5
            },
            conditions: ['Type 2 Diabetes', 'Hypertension', 'Hyperlipidemia'],
            vitals: {
                systolic: 145,
                diastolic: 92,
                heartRate: 78
            },
            labs: {
                glucose: 180,
                a1c: 8.2,
                ldl: 145,
                hdl: 38,
                triglycerides: 210,
                creatinine: 1.1
            },
            currentMedications: [],
            allergies: []
        },
        {
            id: 'P002',
            demographics: {
                age: 68,
                gender: 'F',
                bmi: 28.3
            },
            conditions: ['Post-MI', 'Hypertension', 'Hyperlipidemia'],
            vitals: {
                systolic: 138,
                diastolic: 86,
                heartRate: 72
            },
            labs: {
                glucose: 105,
                a1c: 5.8,
                ldl: 152,
                hdl: 45,
                triglycerides: 185,
                creatinine: 0.9
            },
            currentMedications: ['Aspirin'],
            allergies: []
        },
        {
            id: 'P003',
            demographics: {
                age: 42,
                gender: 'F',
                bmi: 24.1
            },
            conditions: ['Hypothyroidism', 'GERD'],
            vitals: {
                systolic: 118,
                diastolic: 76,
                heartRate: 68
            },
            labs: {
                glucose: 92,
                a1c: 5.3,
                ldl: 110,
                hdl: 58,
                triglycerides: 120,
                creatinine: 0.8,
                tsh: 6.5
            },
            currentMedications: [],
            allergies: []
        },
        {
            id: 'P004',
            demographics: {
                age: 72,
                gender: 'M',
                bmi: 26.8
            },
            conditions: ['Atrial Fibrillation', 'Heart Failure', 'Hypertension'],
            vitals: {
                systolic: 132,
                diastolic: 82,
                heartRate: 88
            },
            labs: {
                glucose: 98,
                a1c: 5.6,
                ldl: 125,
                hdl: 42,
                triglycerides: 165,
                creatinine: 1.3
            },
            currentMedications: [],
            allergies: []
        },
        {
            id: 'P005',
            demographics: {
                age: 28,
                gender: 'F',
                bmi: 22.5
            },
            conditions: ['Asthma'],
            vitals: {
                systolic: 115,
                diastolic: 72,
                heartRate: 75
            },
            labs: {
                glucose: 88,
                a1c: 5.1,
                ldl: 95,
                hdl: 62,
                triglycerides: 95,
                creatinine: 0.7
            },
            currentMedications: [],
            allergies: []
        },
        {
            id: 'P006',
            demographics: {
                age: 61,
                gender: 'M',
                bmi: 35.2
            },
            conditions: ['Type 2 Diabetes', 'Hypertension', 'Cardiovascular Disease', 'Hyperlipidemia'],
            vitals: {
                systolic: 155,
                diastolic: 98,
                heartRate: 82
            },
            labs: {
                glucose: 220,
                a1c: 9.8,
                ldl: 168,
                hdl: 32,
                triglycerides: 285,
                creatinine: 1.4
            },
            currentMedications: [],
            allergies: []
        },
        {
            id: 'P007',
            demographics: {
                age: 45,
                gender: 'F',
                bmi: 29.6
            },
            conditions: ['Type 2 Diabetes', 'GERD'],
            vitals: {
                systolic: 128,
                diastolic: 82,
                heartRate: 76
            },
            labs: {
                glucose: 165,
                a1c: 7.2,
                ldl: 135,
                hdl: 48,
                triglycerides: 175,
                creatinine: 0.9
            },
            currentMedications: [],
            allergies: []
        },
        {
            id: 'P008',
            demographics: {
                age: 58,
                gender: 'M',
                bmi: 27.4
            },
            conditions: ['Hypertension', 'Hyperlipidemia'],
            vitals: {
                systolic: 148,
                diastolic: 94,
                heartRate: 70
            },
            labs: {
                glucose: 102,
                a1c: 5.7,
                ldl: 158,
                hdl: 44,
                triglycerides: 195,
                creatinine: 1.0
            },
            currentMedications: [],
            allergies: ['Penicillin Allergy']
        },
        {
            id: 'P009',
            demographics: {
                age: 35,
                gender: 'M',
                bmi: 23.8
            },
            conditions: ['Respiratory Infection'],
            vitals: {
                systolic: 122,
                diastolic: 78,
                heartRate: 88
            },
            labs: {
                glucose: 90,
                a1c: 5.2,
                ldl: 105,
                hdl: 55,
                triglycerides: 110,
                creatinine: 0.8
            },
            currentMedications: [],
            allergies: []
        },
        {
            id: 'P010',
            demographics: {
                age: 78,
                gender: 'F',
                bmi: 25.1
            },
            conditions: ['Hypertension', 'Heart Failure', 'Hyperlipidemia'],
            vitals: {
                systolic: 142,
                diastolic: 88,
                heartRate: 76
            },
            labs: {
                glucose: 96,
                a1c: 5.5,
                ldl: 140,
                hdl: 48,
                triglycerides: 170,
                creatinine: 1.2
            },
            currentMedications: ['Lisinopril', 'Atorvastatin'],
            allergies: []
        }
    ];
}

// Helper to get patient by ID
export function getPatientById(id: string): PatientEHR | undefined {
    const patients = generatePatientData();
    return patients.find(p => p.id === id);
}

// Helper to get patient display name
export function getPatientDisplayName(patient: PatientEHR): string {
    return `Patient ${patient.id} - ${patient.demographics.age}yo ${patient.demographics.gender === 'M' ? 'Male' : 'Female'}`;
}

// Helper to get patient display name by ID
export function getPatientDisplayNameById(id: string): string {
    const patient = getPatientById(id);
    if (!patient) return 'Unknown Patient';
    return getPatientDisplayName(patient);
}
