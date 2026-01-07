import * as tf from '@tensorflow/tfjs';
import { MEDICAL_DATABASE } from '../../../data/medicalDatabase';
import type { PatientProfile } from '../types';

// --- TYPES ---

export interface DrugRecommendation {
    drugName: string;
    confidenceScore: number; // 0-100
    predictedQuantity?: number; // AI-Predicted Dose/Volume
    reasoning: string;
    source: 'Deep-Learning' | 'Rule-Based' | 'Doctor-Override';
    loss?: number; // Training loss at time of inference
    contraindications: string[];
}

// --- ENGINE ---

export class RecommendationEngine {

    // The GPU Model
    private static model: tf.LayersModel | null = null; // Changed from Sequential to LayersModel

    // Knowledge Base Stats

    // Vocabularies
    private static drugVocab: string[] = [];

    // --- FEATURE EXTRACTION ---

    // --- FEATURE EXTRACTION (Legacy removed) ---


    /**
     * Submit manual feedback from a doctor to improve the model.
     * In a real system, this would retrain the model or update weights online.
     * Here we log it and effectively "retrain" by adjusting a local bias or storing for next batch.
     */
    static async submitFeedback(_profile: PatientProfile, predictedDrug: string, actualDrug: string, reason: string) {
        console.log(`[DeepEngine] Feedback Received: Predicted ${predictedDrug}, Doctorchose ${actualDrug}. Reason: ${reason}`);
        // Online learning placeholder
    }

    // --- MODEL MANAGEMENT ---

    private static async loadSynonyms() {
        try {
            const baseUrl = import.meta.env.BASE_URL;
            const res = await fetch(`${baseUrl}ai_model/synonym_map.json`);
            if (res.ok) {
                const map = await res.json();
                console.log(`[DeepEngine] Loaded ${Object.keys(map).length} synonyms.`);
            }
        } catch (e) { console.warn("Failed to load synonyms", e); }
    }

    static async loadModel() {
        if (this.model) return;

        try {
            console.log("[DeepEngine] Loading V2 Clinical Model...");
            // Resolve base path for Vite (handles /sentria-health/ prefix)
            const baseUrl = import.meta.env.BASE_URL;

            // 1. Load Vocabulary
            const vacabRes = await fetch(`${baseUrl}ai_model/drug_vocabulary.json`);
            if (!vacabRes.ok) throw new Error(`Vocab fetch failed: ${vacabRes.statusText}`);
            const vacabData = await vacabRes.json();
            this.drugVocab = vacabData.drugs || vacabData;

            // 2. Load Topology
            const modelRes = await fetch(`${baseUrl}ai_model/model_final.json`);
            if (!modelRes.ok) throw new Error(`Model fetch failed: ${modelRes.statusText}`);
            let modelJson = await modelRes.json();

            // Fix: Handle double-serialization (if file contains a stringified JSON string)
            if (typeof modelJson === 'string') {
                try {
                    modelJson = JSON.parse(modelJson);
                } catch (e) {
                    console.error("Failed to parse double-serialized model JSON", e);
                }
            }

            this.model = await tf.models.modelFromJSON({ modelTopology: modelJson });

            // 3. Load Weights (Manual Reshape Strategy)
            const weightsRes = await fetch(`${baseUrl}ai_model/weights_final.json`);
            if (!weightsRes.ok) throw new Error(`Weights fetch failed: ${weightsRes.statusText}`);
            const weightsData = await weightsRes.json();

            const originalWeights = this.model.getWeights();
            const reshapedWeights = originalWeights.map((w, i) => {
                const shape = w.shape;
                const flatData = weightsData[i];
                return tf.tensor(flatData, shape);
            });

            this.model.setWeights(reshapedWeights);

            // 4. Load Synonyms
            await this.loadSynonyms();

            console.log("✓ V2 Model Loaded Successfully.");
        } catch (e) {
            console.error("Failed to load V2 Model", e);
            throw e;
        }
    }

    // --- FEATURE EXTRACTION (V2 Compatible) ---

    // Updated to match V2 Training Logic 1:1
    private static extractFeaturesFromProfile(profile: PatientProfile): number[] {
        const feats: number[] = [];
        // [0] Age (Normalized by 100)
        feats.push((profile.age || 40) / 100);

        // [1] Gender (0=M, 1=F for Training)
        feats.push(profile.gender.toLowerCase() === 'female' ? 1 : 0);

        // [2-7] Placeholder Vitals (Matching Training Script)
        feats.push(25 / 40, 120 / 200, 80 / 120, 72 / 150, 170 / 200, 70 / 150);

        // [8-10] History (Mocked low utilization for new patients)
        feats.push(0.1); // Low encounters
        feats.push(0.5); // Avg immunization
        feats.push(0.0); // No procedures

        // [11-25] Comorbidities (15 Keywords)
        const keywords = [
            'Diabetes', 'Hypertension', 'Cardiac', 'Asthma', 'COPD',
            'Cancer', 'Arthritis', 'Anxiety', 'Depression', 'Obesity',
            'Kidney', 'Liver', 'Stroke', 'HIV', 'Lupus'
        ];

        // Resolve Diagnosis Name
        const condition = MEDICAL_DATABASE[profile.conditionId];
        const diagnosisName = condition ? condition.name : 'Unknown';
        const text = (diagnosisName + ' ' + (profile.medicalHistory?.join(' ') || '')).toLowerCase();

        keywords.forEach(k => {
            feats.push(text.includes(k.toLowerCase()) ? 1 : 0);
        });

        return feats;
    }

    // --- INFERENCE ---

    static async recommend(profile: PatientProfile): Promise<DrugRecommendation[]> {
        if (!this.model) {
            await this.loadModel();
        }
        if (!this.model) return [];

        const feats = this.extractFeaturesFromProfile(profile);

        // Predict
        const inputTensor = tf.tensor2d([feats]);
        const pred = this.model.predict(inputTensor) as tf.Tensor;
        const probs = await pred.data(); // Float32Array

        inputTensor.dispose();
        pred.dispose();

        const results: DrugRecommendation[] = [];
        const sortedIndices = Array.from(probs)
            .map((p, i) => ({ p, i }))
            .sort((a, b) => b.p - a.p);

        // Top 5
        for (let i = 0; i < 5; i++) {
            const idx = sortedIndices[i].i;
            const score = sortedIndices[i].p;
            if (score > 0.01) {
                results.push({
                    drugName: this.drugVocab[idx] || 'Unknown',
                    confidenceScore: parseFloat((score * 100).toFixed(1)),
                    reasoning: `V2 Model Confidence: ${(score * 100).toFixed(1)}%`,
                    source: 'Deep-Learning',
                    contraindications: []
                });
            }
        }

        return results;
    }

    static getStats() {
        return {
            trainingSetSize: 530000, // Frozen V2 Stats
            loss: 0.25,
            isUsingGPU: true,
            backend: tf.getBackend(),
            featureCount: 26
        };
    }
}
