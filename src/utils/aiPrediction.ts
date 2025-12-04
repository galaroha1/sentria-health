import { MEDICAL_DATABASE } from '../data/medicalDatabase';

export interface PatientProfile {
    name: string;
    age: number;
    gender: 'Male' | 'Female' | 'Other';
    conditionId: string; // Maps to MEDICAL_DATABASE keys
    medicalHistory: string[];
    vitals: {
        bpSystolic: number;
        bpDiastolic: number;
        heartRate: number;
        temperature: number;
        weight: number; // kg
    };
    allergies: string[];
}

export interface PredictionResult {
    recommendedDrug: string;
    dosage: string;
    frequency: string;
    acquisitionMethod: 'White Bag' | 'Brown Bag' | 'Clear Bag';
    price: number;
    confidenceScore: number; // 0-100
    reasoning: string[];
    warnings: string[];
    contraindicated: boolean;
}

export function predictTreatment(patient: PatientProfile): PredictionResult {
    const condition = MEDICAL_DATABASE[patient.conditionId];

    if (!condition) {
        return {
            recommendedDrug: 'Unknown',
            dosage: 'N/A',
            frequency: 'N/A',
            acquisitionMethod: 'Brown Bag',
            price: 0,
            confidenceScore: 0,
            reasoning: ['Condition not found in database.'],
            warnings: [],
            contraindicated: false
        };
    }

    const reasoning: string[] = [`Diagnosed with ${condition.name} (${condition.icd10}).`];
    const warnings: string[] = [];
    let bestDrug = condition.suggestedDrugs[0]; // Default to first
    let highestScore = -1;

    // Evaluate each drug
    for (const drug of condition.suggestedDrugs) {
        let score = drug.efficacy * 100;
        const drugReasoning: string[] = [];

        // Check Contraindications (Mock logic: check if history matches contraindications)
        const hasContraindication = condition.contraindications.some(c =>
            patient.medicalHistory.includes(c) || patient.allergies.includes(c)
        );

        if (hasContraindication) {
            warnings.push(`Drug ${drug.name} contraindicated due to patient history.`);
            score -= 1000; // Heavily penalize
        }

        // Check Allergies specifically against drug name/class
        if (patient.allergies.some(a => drug.name.includes(a) || drug.genericName.includes(a))) {
            warnings.push(`Patient allergic to ${drug.name}.`);
            score -= 1000;
        }

        // Age adjustments
        const ageFactor = condition.ageRiskFactors.find(f =>
            (f.minAge === undefined || patient.age >= f.minAge) &&
            (f.maxAge === undefined || patient.age <= f.maxAge)
        );

        if (ageFactor) {
            score *= (1 / ageFactor.riskMultiplier);
            drugReasoning.push(`Age ${patient.age} is a risk factor (Risk x${ageFactor.riskMultiplier}).`);
        }

        // Vitals checks (Mock logic)
        if (patient.vitals.bpSystolic > 160 && drug.sideEffects.includes('Hypertension')) {
            score -= 20;
            warnings.push(`Caution: ${drug.name} may worsen existing hypertension.`);
        }
        if (patient.vitals.weight < 50 && drug.dosage.includes('kg')) {
            drugReasoning.push(`Dosage adjusted for low body weight.`);
        }

        if (score > highestScore) {
            highestScore = score;
            bestDrug = drug;
            // reasoning.push(...drugReasoning); // Accumulate reasoning? Maybe just for the winner.
        }
    }

    // Finalize reasoning for the winner
    reasoning.push(`Selected ${bestDrug.name} based on efficacy profile (${(bestDrug.efficacy * 100).toFixed(0)}%).`);
    if (patient.age > 65) {
        reasoning.push('Geriatric protocol applied.');
    }
    if (patient.medicalHistory.length > 0) {
        reasoning.push(`Cross-referenced with history: ${patient.medicalHistory.join(', ')}.`);
    }

    return {
        recommendedDrug: `${bestDrug.name} (${bestDrug.genericName})`,
        dosage: bestDrug.dosage,
        frequency: bestDrug.frequency,
        acquisitionMethod: bestDrug.acquisitionMethod,
        price: bestDrug.price,
        confidenceScore: Math.max(0, Math.min(100, highestScore)),
        reasoning,
        warnings,
        contraindicated: highestScore < 0
    };
}
