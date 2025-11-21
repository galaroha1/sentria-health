import type { PatientEHR } from './clinicalRules';

// Generate realistic synthetic patient EHR data for specialty infusion clinic
export function generatePatientData(): PatientEHR[] {
    return [
        // ===== ONCOLOGY PATIENTS =====
        {
            id: 'P001',
            demographics: {
                age: 58,
                gender: 'F',
                bmi: 26.2
            },
            conditions: ['Breast Cancer', 'Hypertension'],
            vitals: {
                systolic: 128,
                diastolic: 82,
                heartRate: 74,
                temperature: 98.6
            },
            labs: {
                wbc: 5.2,
                hemoglobin: 12.1,
                platelets: 185,
                creatinine: 0.9,
                alt: 32
            },
            currentMedications: [],
            allergies: [],
            cancerDiagnosis: {
                type: 'Breast Cancer',
                stage: 'IIB',
                her2Status: 'Positive'
            }
        },
        {
            id: 'P002',
            demographics: {
                age: 67,
                gender: 'M',
                bmi: 28.9
            },
            conditions: ['Non-Small Cell Lung Cancer'],
            vitals: {
                systolic: 135,
                diastolic: 88,
                heartRate: 82,
                temperature: 98.4
            },
            labs: {
                wbc: 4.8,
                hemoglobin: 11.5,
                platelets: 210,
                creatinine: 1.1,
                alt: 45
            },
            currentMedications: [],
            allergies: [],
            cancerDiagnosis: {
                type: 'Non-Small Cell Lung Cancer',
                stage: 'IIIA',
                pdl1Expression: 65
            }
        },
        {
            id: 'P003',
            demographics: {
                age: 72,
                gender: 'F',
                bmi: 24.5
            },
            conditions: ['Ovarian Cancer'],
            vitals: {
                systolic: 118,
                diastolic: 76,
                heartRate: 68,
                temperature: 98.2
            },
            labs: {
                wbc: 3.5,
                hemoglobin: 10.2,
                platelets: 155,
                creatinine: 1.0,
                alt: 28
            },
            currentMedications: [],
            allergies: ['Taxane Allergy'],
            cancerDiagnosis: {
                type: 'Ovarian Cancer',
                stage: 'IIIC'
            }
        },
        {
            id: 'P004',
            demographics: {
                age: 61,
                gender: 'M',
                bmi: 32.1
            },
            conditions: ['Non-Hodgkin Lymphoma'],
            vitals: {
                systolic: 142,
                diastolic: 90,
                heartRate: 78,
                temperature: 98.8
            },
            labs: {
                wbc: 6.8,
                hemoglobin: 12.8,
                platelets: 195,
                creatinine: 0.8,
                alt: 38
            },
            currentMedications: [],
            allergies: [],
            cancerDiagnosis: {
                type: 'Non-Hodgkin Lymphoma',
                stage: 'II'
            }
        },

        // ===== RHEUMATOLOGY PATIENTS =====
        {
            id: 'P005',
            demographics: {
                age: 52,
                gender: 'F',
                bmi: 27.8
            },
            conditions: ['Rheumatoid Arthritis', 'Hypertension'],
            vitals: {
                systolic: 138,
                diastolic: 86,
                heartRate: 72,
                temperature: 98.6
            },
            labs: {
                wbc: 7.2,
                hemoglobin: 13.5,
                platelets: 245,
                creatinine: 0.9,
                alt: 25
            },
            currentMedications: ['Methotrexate'],
            allergies: []
        },
        {
            id: 'P006',
            demographics: {
                age: 68,
                gender: 'F',
                bmi: 25.3
            },
            conditions: ['Giant Cell Arteritis', 'Hypertension'],
            vitals: {
                systolic: 145,
                diastolic: 92,
                heartRate: 76,
                temperature: 98.4
            },
            labs: {
                wbc: 8.5,
                hemoglobin: 12.2,
                platelets: 285,
                creatinine: 1.0,
                alt: 30
            },
            currentMedications: ['Prednisone'],
            allergies: []
        },

        // ===== GASTROENTEROLOGY (IBD) PATIENTS =====
        {
            id: 'P007',
            demographics: {
                age: 34,
                gender: 'M',
                bmi: 22.1
            },
            conditions: ['Crohn\'s Disease'],
            vitals: {
                systolic: 118,
                diastolic: 74,
                heartRate: 70,
                temperature: 98.5
            },
            labs: {
                wbc: 9.2,
                hemoglobin: 11.8,
                platelets: 315,
                creatinine: 0.8,
                alt: 22
            },
            currentMedications: ['Mesalamine'],
            allergies: []
        },
        {
            id: 'P008',
            demographics: {
                age: 41,
                gender: 'F',
                bmi: 23.7
            },
            conditions: ['Ulcerative Colitis'],
            vitals: {
                systolic: 122,
                diastolic: 78,
                heartRate: 74,
                temperature: 98.6
            },
            labs: {
                wbc: 8.8,
                hemoglobin: 12.5,
                platelets: 298,
                creatinine: 0.7,
                alt: 24
            },
            currentMedications: [],
            allergies: []
        },

        // ===== NEUROLOGY PATIENTS =====
        {
            id: 'P009',
            demographics: {
                age: 38,
                gender: 'F',
                bmi: 24.9
            },
            conditions: ['Multiple Sclerosis'],
            vitals: {
                systolic: 115,
                diastolic: 72,
                heartRate: 68,
                temperature: 98.4
            },
            labs: {
                wbc: 6.5,
                hemoglobin: 13.8,
                platelets: 225,
                creatinine: 0.8,
                alt: 20
            },
            currentMedications: [],
            allergies: []
        },
        {
            id: 'P010',
            demographics: {
                age: 62,
                gender: 'M',
                bmi: 26.4
            },
            conditions: ['CIDP', 'Hypertension'],
            vitals: {
                systolic: 132,
                diastolic: 84,
                heartRate: 72,
                temperature: 98.6
            },
            labs: {
                wbc: 7.1,
                hemoglobin: 14.2,
                platelets: 240,
                creatinine: 1.0,
                alt: 28
            },
            currentMedications: [],
            allergies: ['IgA Allergy']
        },

        // ===== HEMATOLOGY PATIENTS =====
        {
            id: 'P011',
            demographics: {
                age: 55,
                gender: 'F',
                bmi: 28.5
            },
            conditions: ['Iron Deficiency Anemia', 'CKD Stage 3'],
            vitals: {
                systolic: 128,
                diastolic: 80,
                heartRate: 78,
                temperature: 98.5
            },
            labs: {
                wbc: 6.2,
                hemoglobin: 8.5,
                platelets: 205,
                creatinine: 1.8,
                alt: 25,
                ferritin: 45
            },
            currentMedications: [],
            allergies: []
        },
        {
            id: 'P012',
            demographics: {
                age: 64,
                gender: 'M',
                bmi: 31.2
            },
            conditions: ['CKD Anemia', 'Diabetes'],
            vitals: {
                systolic: 142,
                diastolic: 88,
                heartRate: 76,
                temperature: 98.6
            },
            labs: {
                wbc: 5.8,
                hemoglobin: 9.2,
                platelets: 190,
                creatinine: 2.5,
                alt: 32
            },
            currentMedications: [],
            allergies: []
        },

        // ===== INFECTIOUS DISEASE PATIENTS =====
        {
            id: 'P013',
            demographics: {
                age: 48,
                gender: 'M',
                bmi: 27.1
            },
            conditions: ['MRSA Infection', 'Endocarditis'],
            vitals: {
                systolic: 118,
                diastolic: 76,
                heartRate: 92,
                temperature: 101.2
            },
            labs: {
                wbc: 14.5,
                hemoglobin: 11.2,
                platelets: 165,
                creatinine: 1.3,
                alt: 45
            },
            currentMedications: [],
            allergies: []
        },
        {
            id: 'P014',
            demographics: {
                age: 71,
                gender: 'F',
                bmi: 24.8
            },
            conditions: ['Pneumonia', 'COPD'],
            vitals: {
                systolic: 125,
                diastolic: 78,
                heartRate: 88,
                temperature: 100.8
            },
            labs: {
                wbc: 16.2,
                hemoglobin: 12.8,
                platelets: 198,
                creatinine: 0.9,
                alt: 28
            },
            currentMedications: [],
            allergies: ['Penicillin Allergy']
        },

        // ===== CARDIOLOGY PATIENTS =====
        {
            id: 'P015',
            demographics: {
                age: 66,
                gender: 'M',
                bmi: 30.5
            },
            conditions: ['Deep Vein Thrombosis', 'Atrial Fibrillation'],
            vitals: {
                systolic: 138,
                diastolic: 86,
                heartRate: 94,
                temperature: 98.6
            },
            labs: {
                wbc: 7.5,
                hemoglobin: 13.5,
                platelets: 210,
                creatinine: 1.1,
                alt: 35,
                inr: 1.2
            },
            currentMedications: [],
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
    const primaryCondition = patient.cancerDiagnosis
        ? patient.cancerDiagnosis.type
        : patient.conditions[0];
    return `${patient.id} - ${patient.demographics.age}yo ${patient.demographics.gender === 'M' ? 'M' : 'F'} - ${primaryCondition}`;
}

// Helper to get patient display name by ID
export function getPatientDisplayNameById(id: string): string {
    const patient = getPatientById(id);
    if (!patient) return 'Unknown Patient';
    return getPatientDisplayName(patient);
}
