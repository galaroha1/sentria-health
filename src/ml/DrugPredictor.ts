import { evaluateClinicalRules, type PredictionInput, type DrugRecommendation } from './clinicalRules';

/**
 * Drug Predictor - Recommends specific drugs based on patient EHR and visit type
 * Uses a hybrid approach: clinical guidelines + pattern recognition
 */
export class DrugPredictor {
    /**
     * Predict top drug recommendations for a patient
     * @param input Patient EHR and visit type
     * @param topN Number of top recommendations to return (default: 5)
     * @returns Array of drug recommendations sorted by priority and confidence
     */
    predict(input: PredictionInput, topN: number = 5): DrugRecommendation[] {
        // Use clinical rules engine
        const recommendations = evaluateClinicalRules(input);

        // Return top N recommendations
        return recommendations.slice(0, topN);
    }

    /**
     * Get explanation for why drugs were recommended
     * @param recommendations Drug recommendations
     * @returns Human-readable explanation
     */
    explainRecommendations(recommendations: DrugRecommendation[]): string {
        if (recommendations.length === 0) {
            return 'No drug recommendations based on current patient profile and visit type.';
        }

        const explanations = recommendations.map((rec, idx) => {
            const warningText = rec.warnings.length > 0
                ? `\n   Warnings: ${rec.warnings.join('; ')}`
                : '';

            return `${idx + 1}. ${rec.drug.name} (${(rec.confidence * 100).toFixed(0)}% confidence)
   ${rec.reasons.join('; ')}${warningText}`;
        });

        return explanations.join('\n\n');
    }

    /**
     * Validate prediction input
     * @param input Prediction input to validate
     * @returns Validation errors, empty array if valid
     */
    validateInput(input: PredictionInput): string[] {
        const errors: string[] = [];

        if (!input.patient) {
            errors.push('Patient data is required');
            return errors;
        }

        if (!input.visitType) {
            errors.push('Visit type is required');
        }

        if (!input.patient.demographics) {
            errors.push('Patient demographics are required');
        } else {
            if (!input.patient.demographics.age || input.patient.demographics.age < 0 || input.patient.demographics.age > 120) {
                errors.push('Invalid patient age');
            }
        }

        if (!input.patient.conditions || input.patient.conditions.length === 0) {
            errors.push('At least one condition/diagnosis is required');
        }

        return errors;
    }
}

// Export singleton instance
export const drugPredictor = new DrugPredictor();
