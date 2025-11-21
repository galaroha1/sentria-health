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
        temperature?: number;
    };
    labs: {
        wbc: number; // White Blood Cell count (K/µL)
        hemoglobin: number; // g/dL
        platelets: number; // K/µL
        creatinine: number; // mg/dL
        alt: number; // ALT (U/L)
        inr?: number; // International Normalized Ratio
        ferritin?: number; // ng/mL
    };
    currentMedications: string[];
    allergies: string[];
    cancerDiagnosis?: {
        type: string;
        stage: string;
        her2Status?: 'Positive' | 'Negative';
        pdl1Expression?: number; // %
    };
}

export type VisitType =
    | 'Oncology'
    | 'Rheumatology'
    | 'Gastroenterology'
    | 'Neurology'
    | 'Hematology'
    | 'Infectious Disease'
    | 'Cardiology'
    | 'Pain Management';

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
        cancerType?: string[];
        labThresholds?: {
            [key: string]: { min?: number; max?: number };
        };
        ageRange?: { min?: number; max?: number };
        visitTypes?: VisitType[];
        her2Status?: 'Positive' | 'Negative';
        pdl1Expression?: { min?: number };
    };
    recommendDrug: string; // Drug name
    confidence: number;
    reason: string;
    priority: 'high' | 'medium' | 'low';
}

// Clinical guideline-based rules for specialty medications
const CLINICAL_RULES: ClinicalRule[] = [
    // ========== ONCOLOGY ==========
    // Breast Cancer
    {
        conditions: {
            cancerType: ['Breast Cancer'],
            her2Status: 'Positive',
            visitTypes: ['Oncology']
        },
        recommendDrug: 'Trastuzumab',
        confidence: 0.95,
        reason: 'HER2+ breast cancer requires targeted anti-HER2 therapy',
        priority: 'high'
    },
    {
        conditions: {
            cancerType: ['Breast Cancer', 'Ovarian Cancer'],
            visitTypes: ['Oncology']
        },
        recommendDrug: 'Paclitaxel',
        confidence: 0.90,
        reason: 'Standard chemotherapy for breast/ovarian cancer',
        priority: 'high'
    },
    {
        conditions: {
            cancerType: ['Ovarian Cancer', 'Lung Cancer'],
            visitTypes: ['Oncology']
        },
        recommendDrug: 'Carboplatin',
        confidence: 0.92,
        reason: 'Platinum-based chemotherapy for ovarian/lung cancer',
        priority: 'high'
    },

    // Lung Cancer & Immunotherapy
    {
        conditions: {
            cancerType: ['Non-Small Cell Lung Cancer', 'Melanoma'],
            pdl1Expression: { min: 50 },
            visitTypes: ['Oncology']
        },
        recommendDrug: 'Pembrolizumab',
        confidence: 0.93,
        reason: 'PD-L1 ≥50% indicates high response to pembrolizumab immunotherapy',
        priority: 'high'
    },
    {
        conditions: {
            cancerType: ['Melanoma', 'Renal Cell Carcinoma'],
            visitTypes: ['Oncology']
        },
        recommendDrug: 'Nivolumab',
        confidence: 0.88,
        reason: 'Checkpoint inhibitor for melanoma and RCC',
        priority: 'high'
    },

    // Lymphoma
    {
        conditions: {
            cancerType: ['Non-Hodgkin Lymphoma', 'Chronic Lymphocytic Leukemia'],
            visitTypes: ['Oncology']
        },
        recommendDrug: 'Rituximab',
        confidence: 0.96,
        reason: 'Anti-CD20 therapy is standard for NHL and CLL',
        priority: 'high'
    },

    // Angiogenesis Inhibitor
    {
        conditions: {
            cancerType: ['Colorectal Cancer', 'Glioblastoma'],
            visitTypes: ['Oncology']
        },
        recommendDrug: 'Bevacizumab',
        confidence: 0.85,
        reason: 'VEGF inhibitor for colorectal cancer and glioblastoma',
        priority: 'medium'
    },

    // ========== RHEUMATOLOGY ==========
    {
        conditions: {
            diagnoses: ['Rheumatoid Arthritis', 'Ankylosing Spondylitis', 'Psoriatic Arthritis'],
            visitTypes: ['Rheumatology']
        },
        recommendDrug: 'Infliximab',
        confidence: 0.90,
        reason: 'TNF-alpha inhibitor for inflammatory arthritis',
        priority: 'high'
    },
    {
        conditions: {
            diagnoses: ['Rheumatoid Arthritis', 'Giant Cell Arteritis'],
            visitTypes: ['Rheumatology']
        },
        recommendDrug: 'Tocilizumab',
        confidence: 0.88,
        reason: 'IL-6 inhibitor for RA and GCA',
        priority: 'high'
    },
    {
        conditions: {
            diagnoses: ['Rheumatoid Arthritis', 'Psoriatic Arthritis'],
            visitTypes: ['Rheumatology']
        },
        recommendDrug: 'Abatacept',
        confidence: 0.82,
        reason: 'T-cell co-stimulation inhibitor for inflammatory arthritis',
        priority: 'medium'
    },

    // ========== GASTROENTEROLOGY (IBD) ==========
    {
        conditions: {
            diagnoses: ['Ulcerative Colitis', 'Crohn\'s Disease'],
            visitTypes: ['Gastroenterology']
        },
        recommendDrug: 'Vedolizumab',
        confidence: 0.90,
        reason: 'Gut-selective integrin antagonist for IBD',
        priority: 'high'
    },
    {
        conditions: {
            diagnoses: ['Crohn\'s Disease', 'Ulcerative Colitis'],
            visitTypes: ['Gastroenterology']
        },
        recommendDrug: 'Ustekinumab',
        confidence: 0.85,
        reason: 'IL-12/23 inhibitor effective for moderate-to-severe IBD',
        priority: 'high'
    },

    // ========== NEUROLOGY ==========
    {
        conditions: {
            diagnoses: ['Multiple Sclerosis'],
            visitTypes: ['Neurology']
        },
        recommendDrug: 'Ocrelizumab',
        confidence: 0.92,
        reason: 'Anti-CD20 therapy for relapsing and primary progressive MS',
        priority: 'high'
    },
    {
        conditions: {
            diagnoses: ['Multiple Sclerosis'],
            visitTypes: ['Neurology']
        },
        recommendDrug: 'Natalizumab',
        confidence: 0.88,
        reason: 'Highly effective for relapsing MS (requires PML monitoring)',
        priority: 'high'
    },
    {
        conditions: {
            diagnoses: ['CIDP', 'Guillain-Barré Syndrome', 'Myasthenia Gravis'],
            visitTypes: ['Neurology']
        },
        recommendDrug: 'IVIG',
        confidence: 0.94,
        reason: 'Immunoglobulin therapy for inflammatory neuropathies and autoimmune conditions',
        priority: 'high'
    },

    // ========== HEMATOLOGY ==========
    {
        conditions: {
            diagnoses: ['Iron Deficiency Anemia', 'CKD Anemia'],
            labThresholds: { hemoglobin: { max: 10 }, ferritin: { max: 100 } },
            visitTypes: ['Hematology']
        },
        recommendDrug: 'Ferric Carboxymaltose',
        confidence: 0.93,
        reason: 'Iron infusion for severe iron deficiency anemia',
        priority: 'high'
    },
    {
        conditions: {
            diagnoses: ['CKD Anemia', 'Chemotherapy-Induced Anemia'],
            labThresholds: { hemoglobin: { max: 10 } },
            visitTypes: ['Hematology']
        },
        recommendDrug: 'Epoetin alfa',
        confidence: 0.88,
        reason: 'ESA for anemia of chronic disease',
        priority: 'high'
    },
    {
        conditions: {
            diagnoses: ['Iron Deficiency Anemia'],
            labThresholds: { ferritin: { max: 100 } },
            visitTypes: ['Hematology']
        },
        recommendDrug: 'Iron Sucrose',
        confidence: 0.85,
        reason: 'IV iron replacement for dialysis patients',
        priority: 'medium'
    },

    // ========== INFECTIOUS DISEASE ==========
    {
        conditions: {
            diagnoses: ['MRSA Infection', 'Sepsis', 'Endocarditis'],
            visitTypes: ['Infectious Disease']
        },
        recommendDrug: 'Vancomycin',
        confidence: 0.95,
        reason: 'First-line for serious MRSA infections',
        priority: 'high'
    },
    {
        conditions: {
            diagnoses: ['Bacteremia', 'Endocarditis'],
            visitTypes: ['Infectious Disease']
        },
        recommendDrug: 'Daptomycin',
        confidence: 0.90,
        reason: 'Lipopeptide antibiotic for complicated gram-positive infections',
        priority: 'high'
    },
    {
        conditions: {
            diagnoses: ['Pneumonia', 'Meningitis'],
            visitTypes: ['Infectious Disease']
        },
        recommendDrug: 'Ceftriaxone',
        confidence: 0.92,
        reason: 'Broad-spectrum cephalosporin for serious bacterial infections',
        priority: 'high'
    },
    {
        conditions: {
            diagnoses: ['Candidemia', 'Invasive Candidiasis'],
            visitTypes: ['Infectious Disease']
        },
        recommendDrug: 'Micafungin',
        confidence: 0.88, reason: 'Echinocandin for invasive fungal infections',
        priority: 'high'
    },

    // ========== CARDIOLOGY ==========
    {
        conditions: {
            diagnoses: ['Deep Vein Thrombosis', 'Pulmonary Embolism', 'Acute Coronary Syndrome'],
            visitTypes: ['Cardiology']
        },
        recommendDrug: 'Heparin',
        confidence: 0.93,
        reason: 'Anticoagulation for acute thrombotic events',
        priority: 'high'
    },

    // ========== PAIN MANAGEMENT ==========
    {
        conditions: {
            diagnoses: ['Severe Pain', 'Post-Operative Pain', 'Cancer Pain'],
            visitTypes: ['Pain Management']
        },
        recommendDrug: 'Morphine Sulfate',
        confidence: 0.90,
        reason: 'Opioid analgesia for severe acute pain',
        priority: 'high'
    },
    {
        conditions: {
            diagnoses: ['Chronic Pain', 'Complex Regional Pain Syndrome'],
            visitTypes: ['Pain Management']
        },
        recommendDrug: 'Ketamine',
        confidence: 0.82,
        reason: 'NMDA antagonist for refractory chronic pain',
        priority: 'medium'
    },

    // ========== IMMUNOLOGY ==========
    {
        conditions: {
            diagnoses: ['Moderate-to-Severe Asthma', 'Chronic Urticaria'],
            visitTypes: ['Hematology']
        },
        recommendDrug: 'Omalizumab',
        confidence: 0.88,
        reason: 'Anti-IgE therapy for allergic asthma',
        priority: 'high'
    }
];

export function evaluateClinicalRules(input: PredictionInput): DrugRecommendation[] {
    const recommendations: DrugRecommendation[] = [];
    const { patient, visitType } = input;

    for (const rule of CLINICAL_RULES) {
        let matches = true;

        // Check visit types
        if (rule.conditions.visitTypes && matches) {
            if (!rule.conditions.visitTypes.includes(visitType)) matches = false;
        }

        // Check diagnoses
        if (rule.conditions.diagnoses && matches) {
            const hasRequiredDiagnosis = rule.conditions.diagnoses.some(diagnosis =>
                patient.conditions.some(condition =>
                    condition.toLowerCase().includes(diagnosis.toLowerCase())
                )
            );
            if (!hasRequiredDiagnosis) matches = false;
        }

        // Check cancer type
        if (rule.conditions.cancerType && matches) {
            if (!patient.cancerDiagnosis) {
                matches = false;
            } else {
                const hasCancerType = rule.conditions.cancerType.some(cancer =>
                    patient.cancerDiagnosis!.type.toLowerCase().includes(cancer.toLowerCase())
                );
                if (!hasCancerType) matches = false;
            }
        }

        // Check HER2 status
        if (rule.conditions.her2Status && matches) {
            if (!patient.cancerDiagnosis || patient.cancerDiagnosis.her2Status !== rule.conditions.her2Status) {
                matches = false;
            }
        }

        // Check PD-L1 expression
        if (rule.conditions.pdl1Expression && matches) {
            if (!patient.cancerDiagnosis || !patient.cancerDiagnosis.pdl1Expression) {
                matches = false;
            } else {
                const pdl1 = patient.cancerDiagnosis.pdl1Expression;
                if (rule.conditions.pdl1Expression.min !== undefined && pdl1 < rule.conditions.pdl1Expression.min) {
                    matches = false;
                }
            }
        }

        // Check lab thresholds
        if (rule.conditions.labThresholds && matches) {
            for (const [labKey, threshold] of Object.entries(rule.conditions.labThresholds)) {
                const labValue = patient.labs[labKey as keyof typeof patient.labs];
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

        // If all conditions match, add recommendation
        if (matches) {
            const drug = DRUG_DATABASE.find(d => d.name.toLowerCase().includes(rule.recommendDrug.toLowerCase()));
            if (!drug) continue;

            // Check for contraindications and warnings
            const warnings: string[] = [];

            // Check patient allergies
            if (drug.commonAllergies.some(allergy =>
                patient.allergies.some(patientAllergy =>
                    patientAllergy.toLowerCase().includes(allergy.toLowerCase())
                )
            )) {
                warnings.push(`⚠️ ALLERGY ALERT: Patient has documented ${drug.commonAllergies.join(', ')}`);
            }

            // Check contraindications
            const hasContraindication = drug.contraindications.some(contra =>
                patient.conditions.some(condition =>
                    condition.toLowerCase().includes(contra.toLowerCase())
                )
            );

            if (hasContraindication) {
                warnings.push(`⚠️ CONTRAINDICATED: ${drug.contraindications.join(', ')}`);
                continue; // Skip this drug
            }

            // Check if already on this medication
            if (patient.currentMedications.some(med =>
                med.toLowerCase().includes(drug.name.toLowerCase()) ||
                drug.name.toLowerCase().includes(med.toLowerCase())
            )) {
                warnings.push('Patient already receiving this medication');
                continue;
            }

            // Specific safety checks
            if (drug.name.includes('Vancomycin') && patient.labs.creatinine > 1.5) {
                warnings.push('⚠️ Elevated creatinine - dose adjust and monitor levels');
            }

            if (drug.name.includes('Heparin') && patient.labs.platelets && patient.labs.platelets < 100) {
                warnings.push('⚠️ Thrombocytopenia - monitor platelet count for HIT');
            }

            if (drug.category === 'Oncology' && patient.labs.wbc < 3.0) {
                warnings.push('⚠️ Leukopenia - assess infection risk before chemotherapy');
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

    // Sort by priority then confidence
    return recommendations.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return b.confidence - a.confidence;
    });
}
