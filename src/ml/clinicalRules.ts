import type { Drug } from './drugDatabase';
import { DRUG_DATABASE } from './drugDatabase';

export interface PatientEHR {
    id: string;
    demographics: {
        age: number;
        gender: 'M' | 'F';
        bmi: number;
    };
    conditions: string[];
    vitals: {
        systolic: number;
        diastolic: number;
        heartRate: number;
    };
    labs: {
        glucose: number; // mg/dL
        a1c: number; // %
        ldl: number; // mg/dL
        hdl: number; // mg/dL
        triglycerides: number; // mg/dL
        creatinine: number; // mg/dL
        tsh?: number; // mIU/L
    };
    currentMedications: string[];
    allergies: string[];
}

export type VisitType =
    | 'Primary Care'
    | 'Cardiology'
    | 'Endocrinology'
    | 'Oncology'
    | 'Emergency'
    | 'Pulmonology'
    | 'Nephrology';

export interface PredictionInput {
    patient: PatientEHR;
    visitType: VisitType;
}

export interface DrugRecommendation {
    drug: Drug;
    confidence: number; // 0-1
    reasons: string[];
    warnings: string[];
    priority: 'high' | 'medium' | 'low';
}

interface ClinicalRule {
    conditions: {
        diagnoses?: string[];
        labThresholds?: {
            [key: string]: { min?: number; max?: number };
        };
        ageRange?: { min?: number; max?: number };
        visitTypes?: VisitType[];
    };
    recommendDrug: string; // Drug name
    confidence: number;
    reason: string;
    priority: 'high' | 'medium' | 'low';
}

// Clinical guideline-based rules
const CLINICAL_RULES: ClinicalRule[] = [
    // Diabetes Management
    {
        conditions: {
            diagnoses: ['Type 2 Diabetes'],
            labThresholds: { a1c: { min: 6.5 } }
        },
        recommendDrug: 'Metformin',
        confidence: 0.95,
        reason: 'First-line therapy for Type 2 Diabetes with A1C ≥ 6.5%',
        priority: 'high'
    },
    {
        conditions: {
            diagnoses: ['Type 1 Diabetes']
        },
        recommendDrug: 'Insulin Glargine (Lantus)',
        confidence: 0.98,
        reason: 'Essential for Type 1 Diabetes management',
        priority: 'high'
    },
    {
        conditions: {
            diagnoses: ['Type 2 Diabetes'],
            labThresholds: { a1c: { min: 9.0 } }
        },
        recommendDrug: 'Insulin Glargine (Lantus)',
        confidence: 0.85,
        reason: 'Poorly controlled Type 2 Diabetes (A1C ≥ 9%) may require insulin',
        priority: 'high'
    },

    // Hypertension Management
    {
        conditions: {
            diagnoses: ['Hypertension'],
            labThresholds: { 'vitals.systolic': { min: 140 } }
        },
        recommendDrug: 'Lisinopril',
        confidence: 0.90,
        reason: 'First-line ACE inhibitor for hypertension (BP ≥ 140/90)',
        priority: 'high'
    },
    {
        conditions: {
            diagnoses: ['Hypertension'],
            labThresholds: { 'vitals.systolic': { min: 140 } }
        },
        recommendDrug: 'Amlodipine',
        confidence: 0.85,
        reason: 'Calcium channel blocker for hypertension management',
        priority: 'medium'
    },
    {
        conditions: {
            diagnoses: ['Hypertension', 'Type 2 Diabetes']
        },
        recommendDrug: 'Losartan',
        confidence: 0.88,
        reason: 'ARB preferred for diabetic patients with hypertension (renal protection)',
        priority: 'high'
    },

    // Lipid Management
    {
        conditions: {
            diagnoses: ['Hyperlipidemia'],
            labThresholds: { ldl: { min: 130 } }
        },
        recommendDrug: 'Atorvastatin',
        confidence: 0.92,
        reason: 'Statin therapy for LDL ≥ 130 mg/dL',
        priority: 'high'
    },
    {
        conditions: {
            diagnoses: ['Cardiovascular Disease']
        },
        recommendDrug: 'Atorvastatin',
        confidence: 0.95,
        reason: 'High-intensity statin for secondary prevention of CVD',
        priority: 'high'
    },
    {
        conditions: {
            diagnoses: ['Type 2 Diabetes'],
            ageRange: { min: 40 }
        },
        recommendDrug: 'Atorvastatin',
        confidence: 0.80,
        reason: 'Statin recommended for diabetes patients age 40+ (ASCVD risk reduction)',
        priority: 'medium'
    },

    // Cardiovascular Disease
    {
        conditions: {
            diagnoses: ['Post-MI', 'Cardiovascular Disease']
        },
        recommendDrug: 'Aspirin',
        confidence: 0.98,
        reason: 'Antiplatelet therapy essential for post-MI and CVD',
        priority: 'high'
    },
    {
        conditions: {
            diagnoses: ['Post-MI', 'Heart Failure']
        },
        recommendDrug: 'Metoprolol',
        confidence: 0.93,
        reason: 'Beta-blocker for post-MI and heart failure management',
        priority: 'high'
    },
    {
        conditions: {
            diagnoses: ['Heart Failure']
        },
        recommendDrug: 'Carvedilol',
        confidence: 0.90,
        reason: 'Beta-blocker proven to reduce mortality in heart failure',
        priority: 'high'
    },
    {
        conditions: {
            diagnoses: ['Atrial Fibrillation']
        },
        recommendDrug: 'Apixaban (Eliquis)',
        confidence: 0.88,
        reason: 'Anticoagulation for stroke prevention in atrial fibrillation',
        priority: 'high'
    },

    // Thyroid
    {
        conditions: {
            diagnoses: ['Hypothyroidism']
        },
        recommendDrug: 'Levothyroxine',
        confidence: 0.97,
        reason: 'Thyroid hormone replacement for hypothyroidism',
        priority: 'high'
    },

    // Emergency/Infections
    {
        conditions: {
            visitTypes: ['Emergency'],
            diagnoses: ['Bacterial Infection', 'Respiratory Infection']
        },
        recommendDrug: 'Amoxicillin',
        confidence: 0.75,
        reason: 'First-line antibiotic for common bacterial infections',
        priority: 'medium'
    },
    {
        conditions: {
            diagnoses: ['Respiratory Infection']
        },
        recommendDrug: 'Azithromycin',
        confidence: 0.70,
        reason: 'Alternative antibiotic for respiratory infections',
        priority: 'medium'
    },

    // GI
    {
        conditions: {
            diagnoses: ['GERD', 'Peptic Ulcer']
        },
        recommendDrug: 'Omeprazole',
        confidence: 0.90,
        reason: 'PPI for acid suppression in GERD/ulcer disease',
        priority: 'medium'
    },

    // Pulmonary
    {
        conditions: {
            diagnoses: ['Asthma', 'COPD']
        },
        recommendDrug: 'Albuterol',
        confidence: 0.92,
        reason: 'Rescue bronchodilator for asthma/COPD',
        priority: 'high'
    }
];

export function evaluateClinicalRules(input: PredictionInput): DrugRecommendation[] {
    const recommendations: DrugRecommendation[] = [];
    const { patient, visitType } = input;

    for (const rule of CLINICAL_RULES) {
        let matches = true;

        // Check diagnoses
        if (rule.conditions.diagnoses) {
            const hasRequiredDiagnosis = rule.conditions.diagnoses.some(diagnosis =>
                patient.conditions.some(condition =>
                    condition.toLowerCase().includes(diagnosis.toLowerCase())
                )
            );
            if (!hasRequiredDiagnosis) matches = false;
        }

        // Check lab thresholds
        if (rule.conditions.labThresholds && matches) {
            for (const [labKey, threshold] of Object.entries(rule.conditions.labThresholds)) {
                let labValue: number | undefined;

                // Handle nested vitals
                if (labKey.startsWith('vitals.')) {
                    const vitalKey = labKey.split('.')[1] as keyof typeof patient.vitals;
                    labValue = patient.vitals[vitalKey];
                } else {
                    labValue = patient.labs[labKey as keyof typeof patient.labs];
                }

                if (labValue !== undefined) {
                    if (threshold.min !== undefined && labValue < threshold.min) matches = false;
                    if (threshold.max !== undefined && labValue > threshold.max) matches = false;
                }
            }
        }

        // Check age range
        if (rule.conditions.ageRange && matches) {
            const age = patient.demographics.age;
            if (rule.conditions.ageRange.min !== undefined && age < rule.conditions.ageRange.min) matches = false;
            if (rule.conditions.ageRange.max !== undefined && age > rule.conditions.ageRange.max) matches = false;
        }

        // Check visit types
        if (rule.conditions.visitTypes && matches) {
            if (!rule.conditions.visitTypes.includes(visitType)) matches = false;
        }

        // If all conditions match, add recommendation
        if (matches) {
            const drug = DRUG_DATABASE.find(d => d.name === rule.recommendDrug);
            if (!drug) continue;

            // Check for contraindications
            const warnings: string[] = [];

            // Check patient allergies
            if (drug.commonAllergies.some(allergy =>
                patient.allergies.some(patientAllergy =>
                    patientAllergy.toLowerCase().includes(allergy.toLowerCase())
                )
            )) {
                warnings.push(`⚠️ Patient has documented ${drug.commonAllergies.join(', ')} - USE WITH CAUTION`);
            }

            // Check contraindications against patient conditions
            const hasContraindication = drug.contraindications.some(contra =>
                patient.conditions.some(condition =>
                    condition.toLowerCase().includes(contra.toLowerCase())
                )
            );

            if (hasContraindication) {
                warnings.push(`⚠️ Contraindicated: ${drug.contraindications.join(', ')}`);
                continue; // Skip this drug if contraindicated
            }

            // Check if already on this medication
            if (patient.currentMedications.some(med =>
                med.toLowerCase().includes(drug.name.toLowerCase())
            )) {
                warnings.push('Patient already taking this medication');
                continue; // Skip if already prescribed
            }

            // Check for renal impairment (Metformin specific)
            if (drug.name === 'Metformin' && patient.labs.creatinine > 1.5) {
                warnings.push('⚠️ Elevated creatinine - check renal function before initiating');
            }

            recommendations.push({
                drug,
                confidence: rule.confidence,
                reasons: [rule.reason],
                warnings,
                priority: rule.priority
            });
        }
    }

    // Sort by priority (high first) then confidence
    return recommendations.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return b.confidence - a.confidence;
    });
}
