export interface MedicalCondition {
    id: string;
    name: string;
    category: string;
    icd10: string;
    severity: 'Low' | 'Moderate' | 'High' | 'Critical';
    contraindications: string[]; // List of conditions or allergies that contraindicate specific treatments
    suggestedDrugs: {
        name: string;
        genericName: string;
        dosage: string;
        frequency: string;
        acquisitionMethod: 'White Bag' | 'Brown Bag' | 'Clear Bag';
        price: number;
        efficacy: number; // 0-1 score
        sideEffects: string[];
    }[];
    ageRiskFactors: {
        minAge?: number;
        maxAge?: number;
        riskMultiplier: number;
    }[];
}

// A representative database of medical conditions. 
// In a real production app, this would be fetched from an external API or a much larger database.
export const MEDICAL_DATABASE: Record<string, MedicalCondition> = {
    // ONCOLOGY
    'oncology_lung_nsclc': {
        id: 'oncology_lung_nsclc',
        name: 'Non-Small Cell Lung Cancer (NSCLC)',
        category: 'Oncology',
        icd10: 'C34.9',
        severity: 'Critical',
        contraindications: ['Autoimmune Disease', 'Severe Liver Impairment'],
        suggestedDrugs: [
            {
                name: 'Keytruda',
                genericName: 'Pembrolizumab',
                dosage: '200mg IV',
                frequency: 'Every 3 weeks',
                acquisitionMethod: 'White Bag',
                price: 10500,
                efficacy: 0.85,
                sideEffects: ['Fatigue', 'Nausea', 'Immune-mediated adverse reactions']
            },
            {
                name: 'Opdivo',
                genericName: 'Nivolumab',
                dosage: '240mg IV',
                frequency: 'Every 2 weeks',
                acquisitionMethod: 'White Bag',
                price: 11200,
                efficacy: 0.82,
                sideEffects: ['Rash', 'Musculoskeletal pain', 'Cough']
            }
        ],
        ageRiskFactors: [{ minAge: 65, riskMultiplier: 1.5 }]
    },
    'oncology_breast_her2': {
        id: 'oncology_breast_her2',
        name: 'Breast Cancer (HER2+)',
        category: 'Oncology',
        icd10: 'C50.9',
        severity: 'High',
        contraindications: ['Cardiac Failure', 'Pregnancy'],
        suggestedDrugs: [
            {
                name: 'Herceptin',
                genericName: 'Trastuzumab',
                dosage: '8mg/kg IV loading',
                frequency: 'Every 3 weeks',
                acquisitionMethod: 'Clear Bag',
                price: 4500,
                efficacy: 0.9,
                sideEffects: ['Cardiomyopathy', 'Infusion reactions']
            },
            {
                name: 'Perjeta',
                genericName: 'Pertuzumab',
                dosage: '840mg IV loading',
                frequency: 'Every 3 weeks',
                acquisitionMethod: 'White Bag',
                price: 6200,
                efficacy: 0.88,
                sideEffects: ['Diarrhea', 'Alopecia', 'Neutropenia']
            }
        ],
        ageRiskFactors: [{ minAge: 50, riskMultiplier: 1.2 }]
    },
    'oncology_colorectal': {
        id: 'oncology_colorectal',
        name: 'Colorectal Cancer (Metastatic)',
        category: 'Oncology',
        icd10: 'C18.9',
        severity: 'High',
        contraindications: ['Bowel Obstruction', 'Recent Surgery'],
        suggestedDrugs: [
            {
                name: 'Avastin',
                genericName: 'Bevacizumab',
                dosage: '5mg/kg IV',
                frequency: 'Every 2 weeks',
                acquisitionMethod: 'White Bag',
                price: 7800,
                efficacy: 0.75,
                sideEffects: ['Hypertension', 'Bleeding', 'Proteinuria']
            }
        ],
        ageRiskFactors: [{ minAge: 70, riskMultiplier: 1.4 }]
    },

    // IMMUNOLOGY / RHEUMATOLOGY
    'rheum_ra': {
        id: 'rheum_ra',
        name: 'Rheumatoid Arthritis',
        category: 'Rheumatology',
        icd10: 'M06.9',
        severity: 'Moderate',
        contraindications: ['Active Infection', 'Tuberculosis'],
        suggestedDrugs: [
            {
                name: 'Remicade',
                genericName: 'Infliximab',
                dosage: '3mg/kg IV',
                frequency: 'Every 8 weeks',
                acquisitionMethod: 'Clear Bag',
                price: 1200,
                efficacy: 0.8,
                sideEffects: ['Infusion reactions', 'Increased risk of infection']
            },
            {
                name: 'Humira',
                genericName: 'Adalimumab',
                dosage: '40mg SC',
                frequency: 'Every 2 weeks',
                acquisitionMethod: 'Brown Bag',
                price: 2800,
                efficacy: 0.85,
                sideEffects: ['Injection site reaction', 'Headache']
            }
        ],
        ageRiskFactors: []
    },
    'rheum_psoriasis': {
        id: 'rheum_psoriasis',
        name: 'Psoriatic Arthritis',
        category: 'Rheumatology',
        icd10: 'L40.5',
        severity: 'Moderate',
        contraindications: ['Active Infection'],
        suggestedDrugs: [
            {
                name: 'Stelara',
                genericName: 'Ustekinumab',
                dosage: '45mg SC',
                frequency: 'Every 12 weeks',
                acquisitionMethod: 'White Bag',
                price: 11000,
                efficacy: 0.88,
                sideEffects: ['Nasopharyngitis', 'Upper respiratory infection']
            }
        ],
        ageRiskFactors: []
    },
    'rheum_lupus': {
        id: 'rheum_lupus',
        name: 'Systemic Lupus Erythematosus (SLE)',
        category: 'Rheumatology',
        icd10: 'M32.9',
        severity: 'High',
        contraindications: ['Live Vaccines'],
        suggestedDrugs: [
            {
                name: 'Benlysta',
                genericName: 'Belimumab',
                dosage: '10mg/kg IV',
                frequency: 'Every 4 weeks',
                acquisitionMethod: 'White Bag',
                price: 3500,
                efficacy: 0.7,
                sideEffects: ['Nausea', 'Diarrhea', 'Fever']
            }
        ],
        ageRiskFactors: []
    },

    // NEUROLOGY
    'neuro_ms': {
        id: 'neuro_ms',
        name: 'Multiple Sclerosis (RRMS)',
        category: 'Neurology',
        icd10: 'G35',
        severity: 'High',
        contraindications: ['Hepatitis B', 'Active Infection'],
        suggestedDrugs: [
            {
                name: 'Ocrevus',
                genericName: 'Ocrelizumab',
                dosage: '600mg IV',
                frequency: 'Every 6 months',
                acquisitionMethod: 'White Bag',
                price: 16500,
                efficacy: 0.92,
                sideEffects: ['Infusion reactions', 'Infection']
            },
            {
                name: 'Tysabri',
                genericName: 'Natalizumab',
                dosage: '300mg IV',
                frequency: 'Every 4 weeks',
                acquisitionMethod: 'Clear Bag',
                price: 7200,
                efficacy: 0.85,
                sideEffects: ['Headache', 'Fatigue', 'PML risk']
            }
        ],
        ageRiskFactors: [{ minAge: 18, maxAge: 50, riskMultiplier: 1.0 }]
    },
    'neuro_migraine': {
        id: 'neuro_migraine',
        name: 'Chronic Migraine',
        category: 'Neurology',
        icd10: 'G43.9',
        severity: 'Moderate',
        contraindications: ['Cardiovascular Disease'],
        suggestedDrugs: [
            {
                name: 'Botox',
                genericName: 'OnabotulinumtoxinA',
                dosage: '155 Units IM',
                frequency: 'Every 12 weeks',
                acquisitionMethod: 'Clear Bag',
                price: 1200,
                efficacy: 0.75,
                sideEffects: ['Neck pain', 'Headache']
            },
            {
                name: 'Aimovig',
                genericName: 'Erenumab',
                dosage: '70mg SC',
                frequency: 'Monthly',
                acquisitionMethod: 'Brown Bag',
                price: 600,
                efficacy: 0.7,
                sideEffects: ['Constipation', 'Injection site reactions']
            }
        ],
        ageRiskFactors: []
    },

    // CARDIOLOGY
    'cardio_hf': {
        id: 'cardio_hf',
        name: 'Heart Failure (HFrEF)',
        category: 'Cardiology',
        icd10: 'I50.9',
        severity: 'High',
        contraindications: ['Hypotension', 'Severe Renal Impairment', 'Angioedema'],
        suggestedDrugs: [
            {
                name: 'Entresto',
                genericName: 'Sacubitril/Valsartan',
                dosage: '49/51mg PO',
                frequency: 'BID',
                acquisitionMethod: 'Brown Bag',
                price: 450,
                efficacy: 0.88,
                sideEffects: ['Hypotension', 'Hyperkalemia', 'Cough']
            }
        ],
        ageRiskFactors: [{ minAge: 75, riskMultiplier: 1.3 }]
    },
    'cardio_afib': {
        id: 'cardio_afib',
        name: 'Atrial Fibrillation',
        category: 'Cardiology',
        icd10: 'I48.91',
        severity: 'Moderate',
        contraindications: ['Active Bleeding'],
        suggestedDrugs: [
            {
                name: 'Eliquis',
                genericName: 'Apixaban',
                dosage: '5mg PO',
                frequency: 'BID',
                acquisitionMethod: 'Brown Bag',
                price: 550,
                efficacy: 0.9,
                sideEffects: ['Bleeding', 'Bruising']
            }
        ],
        ageRiskFactors: [{ minAge: 80, riskMultiplier: 1.5 }]
    },

    // HEMATOLOGY
    'hem_anemia': {
        id: 'hem_anemia',
        name: 'Iron Deficiency Anemia',
        category: 'Hematology',
        icd10: 'D50.9',
        severity: 'Low',
        contraindications: ['Iron Overload'],
        suggestedDrugs: [
            {
                name: 'Venofer',
                genericName: 'Iron Sucrose',
                dosage: '200mg IV',
                frequency: 'Weekly x5',
                acquisitionMethod: 'Clear Bag',
                price: 300,
                efficacy: 0.95,
                sideEffects: ['Hypotension', 'Cramps']
            }
        ],
        ageRiskFactors: []
    },
    'hem_hemophilia': {
        id: 'hem_hemophilia',
        name: 'Hemophilia A',
        category: 'Hematology',
        icd10: 'D66',
        severity: 'Critical',
        contraindications: [],
        suggestedDrugs: [
            {
                name: 'Advate',
                genericName: 'Antihemophilic Factor',
                dosage: 'Variable',
                frequency: 'Prophylaxis',
                acquisitionMethod: 'White Bag',
                price: 12000,
                efficacy: 0.98,
                sideEffects: ['Inhibitor development']
            }
        ],
        ageRiskFactors: []
    },

    // GASTROENTEROLOGY
    'gi_crohns': {
        id: 'gi_crohns',
        name: 'Crohn\'s Disease',
        category: 'Gastroenterology',
        icd10: 'K50.9',
        severity: 'High',
        contraindications: ['Active Infection', 'Abscess'],
        suggestedDrugs: [
            {
                name: 'Entyvio',
                genericName: 'Vedolizumab',
                dosage: '300mg IV',
                frequency: 'Every 8 weeks',
                acquisitionMethod: 'White Bag',
                price: 6500,
                efficacy: 0.82,
                sideEffects: ['Nasopharyngitis', 'Headache']
            },
            {
                name: 'Stelara',
                genericName: 'Ustekinumab',
                dosage: '390mg IV loading',
                frequency: 'One time',
                acquisitionMethod: 'White Bag',
                price: 11000,
                efficacy: 0.85,
                sideEffects: ['Infection', 'Fatigue']
            }
        ],
        ageRiskFactors: []
    },

    // DERMATOLOGY
    'derm_eczema': {
        id: 'derm_eczema',
        name: 'Atopic Dermatitis (Severe)',
        category: 'Dermatology',
        icd10: 'L20.9',
        severity: 'Moderate',
        contraindications: ['Parasitic Infection'],
        suggestedDrugs: [
            {
                name: 'Dupixent',
                genericName: 'Dupilumab',
                dosage: '300mg SC',
                frequency: 'Every 2 weeks',
                acquisitionMethod: 'White Bag',
                price: 3200,
                efficacy: 0.9,
                sideEffects: ['Injection site reactions', 'Conjunctivitis']
            }
        ],
        ageRiskFactors: []
    },

    // INFECTIOUS DISEASE
    'id_hiv': {
        id: 'id_hiv',
        name: 'HIV-1 Infection',
        category: 'Infectious Disease',
        icd10: 'B20',
        severity: 'High',
        contraindications: ['Hypersensitivity'],
        suggestedDrugs: [
            {
                name: 'Biktarvy',
                genericName: 'Bictegravir/Emtricitabine/Tenofovir',
                dosage: '1 tablet PO',
                frequency: 'Daily',
                acquisitionMethod: 'Brown Bag',
                price: 3100,
                efficacy: 0.99,
                sideEffects: ['Headache', 'Diarrhea']
            }
        ],
        ageRiskFactors: []
    },

    // OPHTHALMOLOGY
    'ophth_amd': {
        id: 'ophth_amd',
        name: 'Wet Age-related Macular Degeneration',
        category: 'Ophthalmology',
        icd10: 'H35.32',
        severity: 'Moderate',
        contraindications: ['Ocular Infection'],
        suggestedDrugs: [
            {
                name: 'Eylea',
                genericName: 'Aflibercept',
                dosage: '2mg Intravitreal',
                frequency: 'Every 8 weeks',
                acquisitionMethod: 'Clear Bag',
                price: 1850,
                efficacy: 0.92,
                sideEffects: ['Eye pain', 'Cataracts']
            }
        ],
        ageRiskFactors: [{ minAge: 60, riskMultiplier: 2.0 }]
    }
};

export const ALLERGIES_LIST = [
    'Penicillin',
    'Sulfa Drugs',
    'Peanuts',
    'Latex',
    'Aspirin',
    'Shellfish',
    'Iodine',
    'Eggs',
    'Milk',
    'Soy'
];

export const COMORBIDITIES_LIST = [
    'Hypertension',
    'Diabetes Type 2',
    'Hyperlipidemia',
    'Obesity',
    'Smoking History',
    'Asthma',
    'COPD',
    'CKD (Chronic Kidney Disease)',
    'Depression',
    'Anxiety'
];
