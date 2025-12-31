import * as tf from '@tensorflow/tfjs';
import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';
import { execSync } from 'child_process';

// Configuration
const MAIN_DIR = '/Users/rohangala/Downloads/synthea_1m_fhir_3_0_May_24';
const TEMP_DIR = '/Users/rohangala/Downloads/temp_test';
const VOCAB_FILE = './data/drug_vocabulary.json';
const SYNONYM_FILE = './data/synonym_map.json'; // [V2] Added Synonym Support
const MODEL_JSON_PATH = './ai_model_trained/model_final.json';
const WEIGHTS_PATH = './ai_model_trained/weights_final.json';

// Load Resources
const drugVocab = JSON.parse(fs.readFileSync(VOCAB_FILE, 'utf-8'));
const drugLookup = new Map<string, string>();
// drugVocab is array of strings in V1, object in V2? let me check check run_training.
// In run_training: vocabData.drugs (array).
const drugVocabList = drugVocab.drugs || drugVocab; // Handle both formats just in case
if (Array.isArray(drugVocabList)) {
    drugVocabList.forEach((drug: string) => {
        drugLookup.set(drug.toLowerCase().trim(), drug);
    });
}

// Load Synonyms
const synonymMap = new Map<string, string>();
if (fs.existsSync(SYNONYM_FILE)) {
    const synData = JSON.parse(fs.readFileSync(SYNONYM_FILE, 'utf-8'));
    Object.entries(synData).forEach(([k, v]) => synonymMap.set(k, v as string));
    console.log(`[INIT] Loaded ${synonymMap.size} synonyms.`);
}

async function main() {
    console.log("=== V2 MODEL VALIDATION (Archive 11 - Hold Out) ===");

    // 1. Load Model Manually (Reconstruct Architecture)
    console.log(`[1/4] Reconstructing V2 Model Architecture...`);
    let model;
    try {
        // Re-create the exact architecture from training
        // Input: 26 features. Output: drugVocab.length (9505)
        model = tf.sequential();
        model.add(tf.layers.dense({ inputShape: [26], units: 256, activation: 'relu' }));
        model.add(tf.layers.dropout({ rate: 0.3 }));
        model.add(tf.layers.dense({ units: 128, activation: 'relu' }));
        model.add(tf.layers.dropout({ rate: 0.2 }));
        model.add(tf.layers.dense({ units: drugVocabList.length, activation: 'softmax' })); // 9505 units

        // Load Weights
        console.log(`[1.5/4] Loading weights from ${WEIGHTS_PATH}...`);
        const weightsData = JSON.parse(fs.readFileSync(WEIGHTS_PATH, 'utf-8'));

        // RESHAPE WEIGHTS
        // Saved weights are flat arrays. We must reshape them to match the model layers.
        const originalWeights = model.getWeights();
        if (originalWeights.length !== weightsData.length) {
            throw new Error(`Weight count mismatch! Model has ${originalWeights.length}, file has ${weightsData.length}`);
        }

        const reshapedWeights = originalWeights.map((w, i) => {
            const shape = w.shape;
            const flatData = weightsData[i];
            return tf.tensor(flatData, shape);
        });

        model.setWeights(reshapedWeights);

        console.log("✓ Model reconstructed & weights set successfully");
    } catch (e) {
        console.error("❌ Failed to load model.", e);
        process.exit(1);
    }

    // 2. Select Test Archive (Archive 11)
    // We trained on 10 archives. We need one that was NOT touched.
    // glob returns alphabetical order? run_training used glob.sync().sort().
    // training used slice(0, 10).
    const archives = glob.sync(`${MAIN_DIR}/output_*.tar.gz`).sort();

    // Pick the 11th archive (Index 10)
    if (archives.length < 11) {
        console.error("Not enough archives to validate on #11");
        process.exit(1);
    }
    const testArchive = archives[10]; // VALIDATION SET
    console.log(`[2/4] Using Hold-Out Archive: ${path.basename(testArchive)}`);

    // 3. Extract Validation Data
    if (fs.existsSync(TEMP_DIR)) fs.rmSync(TEMP_DIR, { recursive: true, force: true });
    fs.mkdirSync(TEMP_DIR);

    console.log("Extracting test data...");
    execSync(`tar -xzf "${testArchive}" -C "${TEMP_DIR}"`, { stdio: 'ignore' });

    // 4. Run Inference
    console.log("[3/4] Running Inference...");
    const files = glob.sync(`${TEMP_DIR}/**/fhir/*.json`);
    console.log(`Found ${files.length} patients in test set.`);

    let correctTop1 = 0;
    let correctTop5 = 0;
    let totalPredictions = 0;

    // Reporting interval
    const reportInterval = 500;

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
            const content = fs.readFileSync(file, 'utf-8');
            const bundle = JSON.parse(content);
            const meds = extractMedications(bundle);
            if (meds.length === 0) continue;

            const features = extractFeatures(bundle);
            if (!features) continue;

            // Predict
            const inputTensor = tf.tensor2d([features]);
            const prediction = model.predict(inputTensor) as tf.Tensor;
            const probs = await prediction.data();

            // Map actual meds to vocab indices
            const uniqueMeds = new Set(meds);
            let patientHasMatch = false;

            uniqueMeds.forEach(actualMed => {
                const mappedDrug = matchDrug(actualMed);
                if (mappedDrug) {
                    const targetIdx = drugVocabList.indexOf(mappedDrug);
                    if (targetIdx !== -1) {
                        // Check Rank
                        const sortedIndices: { p: number; idx: number }[] = Array.from(probs)
                            .map((p, idx) => ({ p, idx }))
                            .sort((a, b) => b.p - a.p); // Descending

                        const top1 = sortedIndices[0].idx;
                        const top5 = sortedIndices.slice(0, 5).map(x => x.idx);

                        if (top1 === targetIdx) correctTop1++;
                        if (top5.includes(targetIdx)) correctTop5++;
                        totalPredictions++;
                        patientHasMatch = true;
                    }
                }
            });

            inputTensor.dispose();
            prediction.dispose();

            if (totalPredictions % reportInterval === 0 && totalPredictions > 0 && patientHasMatch) {
                process.stdout.write(`\r[${i}/${files.length}] Predictions: ${totalPredictions} | Top-1: ${((correctTop1 / totalPredictions) * 100).toFixed(1)}% | Top-5: ${((correctTop5 / totalPredictions) * 100).toFixed(1)}%`);
            }

        } catch (e) {
            // ignore bad files
        }
    }

    console.log("\n\n=== FINAL RESULTS (Archive 11) ===");
    console.log(`Total Predictions: ${totalPredictions}`);
    console.log(`Top-1 Accuracy: ${((correctTop1 / totalPredictions) * 100).toFixed(2)}%`);
    console.log(`Top-5 Accuracy: ${((correctTop5 / totalPredictions) * 100).toFixed(2)}%`);

    // Cleanup
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
}

// Reuse helper functions from training script
function extractFeatures(bundle: any): number[] | null {
    try {
        const patient = bundle.entry?.find((e: any) => e.resource?.resourceType === 'Patient')?.resource;
        if (!patient) return null;

        const feats: number[] = [];
        // Demographics
        const age = 2024 - parseInt(patient.birthDate?.split('-')[0] || '1980');
        feats.push(age / 100); // Normalized Age

        feats.push(patient.gender === 'female' ? 1 : 0);
        feats.push(patient.gender === 'male' ? 1 : 0);

        // Vitals & Conditions
        const observations = bundle.entry?.filter((e: any) => e.resource?.resourceType === 'Observation') || [];
        const conditions = bundle.entry?.filter((e: any) => e.resource?.resourceType === 'Condition') || [];
        const procedures = bundle.entry?.filter((e: any) => e.resource?.resourceType === 'Procedure') || [];
        const immunizations = bundle.entry?.filter((e: any) => e.resource?.resourceType === 'Immunization') || [];
        const encounters = bundle.entry?.filter((e: any) => e.resource?.resourceType === 'Encounter') || [];

        // Vitals logic
        let sys = 0, dia = 0, bmi = 0;
        observations.forEach((o: any) => {
            const val = o.resource?.valueQuantity?.value;
            const code = o.resource?.code?.coding?.[0]?.code;
            if (code === '8480-6') sys = val;
            if (code === '8462-4') dia = val;
            if (code === '39156-5') bmi = val;
        });

        feats.push(sys > 0 ? sys / 200 : 0.6);
        feats.push(dia > 0 ? dia / 120 : 0.6);
        feats.push(bmi > 0 ? bmi / 50 : 0.5);

        // History
        feats.push(Math.min(1, encounters.length / 10));
        feats.push(Math.min(1, immunizations.length / 10));
        feats.push(Math.min(1, procedures.length / 5));

        // Comorbidities text match
        const keywords = ['Diabetes', 'Hypertension', 'Cardiac', 'Asthma', 'COPD', 'Cancer', 'Arthritis', 'Anxiety', 'Depression', 'Obesity', 'Kidney', 'Liver', 'Stroke', 'HIV', 'Lupus'];
        const conditionText = conditions.map((c: any) => c.resource?.code?.coding?.[0]?.display || '').join(' ').toLowerCase();
        keywords.forEach(k => feats.push(conditionText.includes(k.toLowerCase()) ? 1 : 0));

        return feats;
    } catch { return null; }
}


function extractMedications(bundle: any): string[] {
    const meds: string[] = [];

    // Support Synthea 3.0 Medication resources (referenced)
    const medicationResources = bundle.entry?.filter((e: any) =>
        e.resource?.resourceType === 'Medication') || [];

    medicationResources.forEach((entry: any) => {
        const med = entry.resource;
        if (med.code?.text) {
            meds.push(med.code.text);
        } else if (med.code?.coding?.[0]?.display) {
            meds.push(med.code.coding[0].display);
        }
    });

    // Support standard MedicationRequest (inline)
    const medRequests = bundle.entry?.filter((e: any) =>
        e.resource?.resourceType === 'MedicationRequest' ||
        e.resource?.resourceType === 'MedicationStatement') || [];

    medRequests.forEach((entry: any) => {
        const resource = entry.resource;
        if (resource.medicationCodeableConcept?.text) {
            meds.push(resource.medicationCodeableConcept.text);
        } else if (resource.medicationCodeableConcept?.coding?.[0]?.display) {
            meds.push(resource.medicationCodeableConcept.coding[0].display);
        }
    });

    return meds;
}

// CACHE: Remember failed lookups to avoid expensive O(N) loops on recurring unknowns
const failedLookups = new Set<string>();

function matchDrug(medName: string): string | null {
    const normalized = medName.toLowerCase().trim();

    // 0. CHECK CACHE (Fast O(1))
    if (failedLookups.has(normalized)) return null;

    // 1. Direct match (Fast O(1))
    if (drugLookup.has(normalized)) {
        return drugLookup.get(normalized)!;
    }

    // 2. Synonym match (Fast O(1))
    if (synonymMap.has(normalized)) {
        const mappedName = synonymMap.get(normalized)!;
        if (drugLookup.has(mappedName.toLowerCase())) {
            return drugLookup.get(mappedName.toLowerCase())!;
        }
    }

    // 3. Fuzzy match (Expensive O(N) - 9505 iterations)
    // Only runs ONCE per unknown term due to cache.
    for (const [key, value] of drugLookup.entries()) {
        if (normalized.includes(key) || key.includes(normalized)) {
            return value;
        }
    }

    // 4. ADD TO CACHE
    failedLookups.add(normalized);
    return null;
}

main().catch(console.error);
