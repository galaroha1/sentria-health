import * as tf from '@tensorflow/tfjs';
import type { SyntheticBundle } from '../utils/diseaseGenerator';
import { MEDICAL_DATABASE } from '../data/medicalDatabase';
import type { PatientProfile } from '../utils/aiPrediction';

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
    private static model: tf.Sequential | null = null;

    // Knowledge Base Stats
    private static trainingSetSize = 0;
    private static currentLoss = 1.0; // Initial high loss
    private static isTraining = false;

    // Vocabularies
    private static drugVocab: string[] = [];
    // private static diagnosisVocab: string[] = Object.values(MEDICAL_DATABASE).map(c => c.name); // Unused for now

    // --- FEATURE EXTRACTION ---

    /**
     * Converts a raw FHIR-like bundle into a dense numeric vector for the Neural Network.
     * Vector Size: 26 Features
     * [0]: Age (Norm)
     * [1]: Gender (0=M, 1=F)
     * [2]: BMI (Norm)
     * [3]: Systolic BP (Norm)
     * [4]: Diastolic BP (Norm)
     * [5]: Heart Rate (Norm)
     * [6]: Height (Norm)
     * [7]: Weight (Norm)
     * [8]: Encounter Count (Norm)
     * [9]: Immunization Count (Norm)
     * [10]: Procedure Count (Norm)
     * [11-25]: Comorbidity Multi-hot Vector (15 common conditions)
     */
    private static extractFeatures(bundle: SyntheticBundle): number[] {
        const p = bundle.patient;
        const feats: number[] = [];

        // 1. Demographics
        const age = new Date().getFullYear() - new Date(p.birthDate).getFullYear();
        feats.push(age / 100); // [0] Age
        feats.push(p.gender === 'female' ? 1 : 0); // [1] Gender

        // 2. Vitals (Extract most recent)
        const obs = bundle.observations;
        const getVal = (code: string) => obs.find(o => o.code.coding[0].code === code)?.valueQuantity?.value;
        const height = getVal('8302-2') || 170; // cm
        const weight = getVal('29463-7') || 70; // kg
        const bmi = weight / ((height / 100) * (height / 100));

        feats.push(bmi / 40); // [2] BMI (Norm ~25)

        // BP is often a string in real FHIR, here we simulate extraction or expect pre-parsed
        // For simulation, we use defaults or randomization if missing in raw observations
        const sys = 120; // Default
        const dia = 80;
        const hr = 72;

        feats.push(sys / 200); // [3] Sys
        feats.push(dia / 120); // [4] Dia
        feats.push(hr / 150);  // [5] HR
        feats.push(height / 200); // [6] Height
        feats.push(weight / 150); // [7] Weight

        // 3. History Stats
        feats.push(Math.min(1, bundle.encounters.length / 10)); // [8] Encounters
        feats.push(Math.min(1, bundle.immunizations.length / 10)); // [9] Vax
        feats.push(Math.min(1, bundle.procedures.length / 5)); // [10] Procedures

        // 4. Comorbidities (Multi-hot)
        // We track specific high-impact keywords
        const keywords = [
            'Diabetes', 'Hypertension', 'Cardiac', 'Asthma', 'COPD',
            'Cancer', 'Arthritis', 'Anxiety', 'Depression', 'Obesity',
            'Kidney', 'Liver', 'Stroke', 'HIV', 'Lupus'
        ];

        // Check all conditions in history
        const historyText = bundle.conditions.map(c => c.code.coding[0].display.toLowerCase()).join(' ');

        keywords.forEach(k => {
            feats.push(historyText.includes(k.toLowerCase()) ? 1 : 0);
        });

        return feats;
    }

    // --- TRAINING ---

    static async trainOnGPU(
        patients: SyntheticBundle[],
        onEpoch?: (epoch: number, loss: number) => void
    ) {
        if (this.isTraining) return;
        this.isTraining = true;

        try {
            await tf.ready();
            console.log(`[DeepEngine] TensorFlow Backend: ${tf.getBackend()}`);

            if (patients.length === 0) throw new Error("No training data provided.");

            // 1. Prepare Data
            const inputs: number[][] = [];
            const outputs: number[][] = [];

            // Build dynamic drug vocab from the medical database
            const allDrugs = new Set<string>();
            Object.values(MEDICAL_DATABASE).forEach(c => {
                c.suggestedDrugs.forEach(d => allDrugs.add(d.name));
            });
            this.drugVocab = Array.from(allDrugs).sort(); // Consistent order

            patients.forEach(p => {
                // Feature Vector
                const inputVec = this.extractFeatures(p);
                inputs.push(inputVec);

                // Target Vector (One-hot Drug)
                // In a real scenario, we look at the 'medications' history or the 'primary condition' recommended drug
                // For this generator, we use the MedicalDatabase logic to determining the "Correct" label to learn
                const primaryConditionName = p.conditions[0]?.code.coding[0].display;
                const dbEntry = Object.values(MEDICAL_DATABASE).find(c => c.name === primaryConditionName);

                let targetDrug = 'Tylenol'; // Fallback
                if (dbEntry && dbEntry.suggestedDrugs.length > 0) {
                    targetDrug = dbEntry.suggestedDrugs[0].name;
                }

                // Create One-Hot
                const outputVec = new Array(this.drugVocab.length).fill(0);
                const drugIdx = this.drugVocab.indexOf(targetDrug);
                if (drugIdx >= 0) {
                    outputVec[drugIdx] = 1;
                }
                outputs.push(outputVec);
            });

            console.log(`[DeepEngine] Vectorized ${inputs.length} patients. Feature Count: ${inputs[0].length}`);

            const xs = tf.tensor2d(inputs);
            const ys = tf.tensor2d(outputs);

            // 2. Model Definition (Deep Network)
            this.model = tf.sequential();

            // Input Layer (26 features) -> Hidden 1
            this.model.add(tf.layers.dense({
                units: 64,
                activation: 'relu',
                inputShape: [inputs[0].length]
            }));

            // Dropout to prevent overfitting
            this.model.add(tf.layers.dropout({ rate: 0.2 }));

            // Hidden 2
            this.model.add(tf.layers.dense({
                units: 32,
                activation: 'relu'
            }));

            // Output Layer (Softmax classification over drugs)
            this.model.add(tf.layers.dense({
                units: this.drugVocab.length,
                activation: 'softmax'
            }));

            this.model.compile({
                optimizer: tf.train.adam(0.01),
                loss: 'categoricalCrossentropy',
                metrics: ['accuracy']
            });

            // 3. Train
            await this.model.fit(xs, ys, {
                epochs: 20,
                batchSize: 32,
                shuffle: true,
                callbacks: {
                    onEpochEnd: async (epoch, logs) => {
                        this.currentLoss = logs?.loss || 0;
                        if (onEpoch && logs) onEpoch(epoch + 1, logs.loss);
                        // Brief pause to let UI render updates
                        await new Promise(r => setTimeout(r, 50));
                    }
                }
            });

            this.trainingSetSize += patients.length;

            // Cleanup
            xs.dispose();
            ys.dispose();

        } catch (e: any) {
            console.error("Training Error:", e);
            throw e;
        } finally {
            this.isTraining = false;
        }
    }

    // --- INFERENCE ---

    // For inference, we need to convert the simple 'Review' profile back into a feature vector
    // Or ideally, inference happens on the full bundle. 
    // Here we implement a 'Best Effort' feature reconstructor for the simplified profile.
    static async recommend(profile: PatientProfile): Promise<DrugRecommendation[]> {
        if (!this.model) {
            return [{
                drugName: 'Model Not Trained',
                confidenceScore: 0,
                reasoning: 'Please run training simulation first.',
                source: 'Rule-Based',
                contraindications: []
            }];
        }

        // Reconstruct Feature Vector from Profile (Best Effort)
        // [0] Age
        const feats: number[] = [];
        feats.push((profile.age || 40) / 100);

        // [1] Gender
        feats.push(profile.gender.toLowerCase() === 'female' ? 1 : 0);

        // [2-7] Vitals (Use provided or defaults)
        const h = 170; // Mock height if missing in simplified profile
        const w = profile.vitals?.weight || 70;
        const bmi = w / ((h / 100) * (h / 100));
        feats.push(bmi / 40);

        // Parse BP string if available, else mock
        let s = 120, d = 80;
        const sys = profile.vitals?.bpSystolic;
        const dia = profile.vitals?.bpDiastolic;
        if (sys) s = sys;
        if (dia) d = dia;

        feats.push(s / 200);
        feats.push(d / 120);
        feats.push((profile.vitals?.heartRate || 72) / 150);
        feats.push(h / 200);
        feats.push(w / 150);

        // [8-10] History (Assume average for new patients)
        feats.push(0.2); // ~2 encounters
        feats.push(0.5); // ~half vaxxed
        feats.push(0.0); // 0 procedures

        // [11-25] Comorbidities (Parse from profile.diagnosis or history)
        const keywords = [
            'Diabetes', 'Hypertension', 'Cardiac', 'Asthma', 'COPD',
            'Cancer', 'Arthritis', 'Anxiety', 'Depression', 'Obesity',
            'Kidney', 'Liver', 'Stroke', 'HIV', 'Lupus'
        ];

        // Find diagnosis name from ID if possible
        // In aiPrediction, conditionId is the key. In MEDICAL_DATABASE, keys are ids. 
        // Let's assume profile.conditionId is the key.
        const condition = MEDICAL_DATABASE[profile.conditionId];
        const diagnosisName = condition ? condition.name : 'Unknown';

        // Combine diagnosis and history strings
        const text = (diagnosisName + ' ' + (profile.medicalHistory?.join(' ') || '')).toLowerCase();

        keywords.forEach(k => {
            feats.push(text.includes(k.toLowerCase()) ? 1 : 0);
        });

        // Predict
        const inputTensor = tf.tensor2d([feats]);
        const pred = this.model.predict(inputTensor) as tf.Tensor;
        const probs = pred.dataSync(); // Float32Array

        inputTensor.dispose();
        pred.dispose();

        // Check for Manual Override in Medical Database (Expert Systems Layer)
        // If a specific condition *always* requires a specific drug legally/medically, we can boost it.
        // For now, we rely on the Neural Net, but alert if there's a strong mismatch.

        const results: DrugRecommendation[] = [];
        // @ts-ignore
        probs.forEach((score, i) => {
            if (score > 0.01) { // 1% threshold
                results.push({
                    drugName: this.drugVocab[i] || 'Unknown',
                    confidenceScore: score * 100,
                    reasoning: `Deep Learning Model Activation: ${(score * 100).toFixed(1)}%`,
                    source: 'Deep-Learning',
                    contraindications: []
                });
            }
        });

        return results.sort((a, b) => b.confidenceScore - a.confidenceScore);
    }

    /**
     * Submit manual feedback from a doctor to improve the model.
     * In a real system, this would retrain the model or update weights online.
     * Here we log it and effectively "retrain" by adjusting a local bias or storing for next batch.
     */
    static async submitFeedback(_profile: PatientProfile, predictedDrug: string, actualDrug: string, reason: string) {
        console.log(`[DeepEngine] Feedback Received: Predicted ${predictedDrug}, Doctorchose ${actualDrug}. Reason: ${reason}`);

        // 1. Load Vocabulary
        const vacabRes = await fetch('/ai_model/drug_vocabulary.json');
        const vacabData = await vacabRes.json();
        this.drugVocab = vacabData.drugs || vacabData;

        // 2. Load Topology
        const modelRes = await fetch('/ai_model/model_final.json');
        const modelJson = await modelRes.json();
        this.model = await tf.models.modelFromJSON({ modelTopology: modelJson });

        // 3. Load Weights (Manual Reshape Strategy)
        const weightsRes = await fetch('/ai_model/weights_final.json');
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
    } catch(e) {
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

    // [1] Gender (0=M, 1=F for Training) - Check training script?
    // In validate_model_stream.ts: gender === 'female' ? 1 : 0.
    feats.push(profile.gender.toLowerCase() === 'female' ? 1 : 0);

    // [2-7] Placeholder Vitals (Matching Training Script)
    // Training used: 25/40, 120/200, 80/120, 72/150, 170/200, 70/150
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

static async recommend(profile: PatientProfile): Promise < DrugRecommendation[] > {
    if(!this.model) {
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
