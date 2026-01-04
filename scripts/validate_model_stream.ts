import * as tf from '@tensorflow/tfjs';
import * as fs from 'fs';
import * as path from 'path';
import * as zlib from 'zlib'; // Built-in
// @ts-ignore
import tar from 'tar-stream'; // "tar-stream": "^3.1.7"
import * as glob from 'glob';

// Configuration
const MAIN_DIR = '/Users/rohangala/Downloads/synthea_1m_fhir_3_0_May_24';
const VOCAB_FILE = './data/drug_vocabulary.json';
const SYNONYM_FILE = './data/synonym_map.json';
const MODEL_JSON_PATH = './ai_model_trained/model_final.json';
const WEIGHTS_PATH = './ai_model_trained/weights_final.json';

// === Load Resources ===
console.log("[INIT] Loading resources...");
const drugVocab = JSON.parse(fs.readFileSync(VOCAB_FILE, 'utf-8'));
const drugVocabList = drugVocab.drugs || drugVocab;
const drugLookup = new Map<string, string>();
if (Array.isArray(drugVocabList)) {
    drugVocabList.forEach((drug: string) => {
        drugLookup.set(drug.toLowerCase().trim(), drug);
    });
}

const synonymMap = new Map<string, string>();
if (fs.existsSync(SYNONYM_FILE)) {
    const synData = JSON.parse(fs.readFileSync(SYNONYM_FILE, 'utf-8'));
    Object.entries(synData).forEach(([k, v]) => synonymMap.set(k, v as string));
    console.log(`[INIT] Loaded ${synonymMap.size} synonyms.`);
}

// === Cache ===
const failedLookups = new Set<string>();

async function main() {
    console.log("=== V2 MODEL VALIDATION (STREAMING - No Disk Usage) ===");

    // 1. Model Setup
    console.log(`[1/4] Reconstructing V2 Model Architecture...`);
    let model;
    try {
        model = tf.sequential();
        model.add(tf.layers.dense({ inputShape: [26], units: 256, activation: 'relu' }));
        model.add(tf.layers.dropout({ rate: 0.3 }));
        model.add(tf.layers.dense({ units: 128, activation: 'relu' }));
        model.add(tf.layers.dropout({ rate: 0.2 }));
        model.add(tf.layers.dense({ units: drugVocabList.length, activation: 'softmax' })); // 9505 units

        console.log(`[1.5/4] Loading weights...`);
        const weightsData = JSON.parse(fs.readFileSync(WEIGHTS_PATH, 'utf-8'));

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
        console.log("✓ Model loaded.");
    } catch (e) {
        console.error("❌ Failed to load model.", e);
        process.exit(1);
    }

    // 2. Select Archive
    const archives = glob.sync(`${MAIN_DIR}/output_*.tar.gz`).sort();
    if (archives.length < 11) {
        console.error("Not enough archives to validate on #11");
        process.exit(1);
    }
    const testArchive = archives[10]; // VALIDATION SET (Archive 11)
    console.log(`[2/4] Streaming Hold-Out Archive: ${path.basename(testArchive)}`);

    // 3. Streaming Inference
    console.log("[3/4] Running Inference Loop...");

    let correctTop1 = 0;
    let correctTop5 = 0;
    let totalPredictions = 0;
    let processedFiles = 0;
    const reportInterval = 200;

    const extract = tar.extract();

    // @ts-ignore
    extract.on('entry', async (header: any, stream: any, next: any) => {
        processedFiles++;
        if (processedFiles <= 10) console.log(`[DEBUG] Entry: ${header.name} | Type: ${header.type}`);

        // Only process JSON files in fhir/ directory
        if (header.type === 'file' && header.name.endsWith('.json')) {
            const chunks: any[] = [];
            stream.on('data', (chunk: any) => chunks.push(chunk));
            stream.on('end', async () => {
                try {
                    const content = Buffer.concat(chunks).toString('utf-8');
                    const bundle = JSON.parse(content);

                    const meds = extractMedications(bundle);
                    if (processedFiles <= 10) console.log(`[DEBUG] Meds found: ${meds.length}`);

                    if (meds.length > 0) {
                        const features = extractFeatures(bundle);
                        if (processedFiles <= 10) console.log(`[DEBUG] Features: ${features ? 'OK' : 'NULL'}`);

                        if (features) {
                            // Predict
                            const inputTensor = tf.tensor2d([features]);
                            const prediction = model.predict(inputTensor) as tf.Tensor;
                            const probs = await prediction.data();

                            // Analyze
                            const uniqueMeds = new Set(meds);
                            let patientHasMatch = false;

                            uniqueMeds.forEach(actualMed => {
                                const mappedDrug = matchDrug(actualMed);
                                if (processedFiles <= 10 && !mappedDrug) console.log(`[DEBUG] Unmatched drug: ${actualMed}`);

                                if (mappedDrug) {
                                    const targetIdx = drugVocabList.indexOf(mappedDrug);
                                    if (targetIdx !== -1) {
                                        // Rank
                                        const sortedIndices: { p: number; idx: number }[] = Array.from(probs)
                                            .map((p, idx) => ({ p, idx }))
                                            .sort((a, b) => b.p - a.p);

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
                                process.stdout.write(`\rPredictions: ${totalPredictions} | Top-1: ${((correctTop1 / totalPredictions) * 100).toFixed(1)}% | Top-5: ${((correctTop5 / totalPredictions) * 100).toFixed(1)}%`);
                            }
                        }
                    }
                } catch (e: any) {
                    console.log(`[ERROR] Processing file: ${e.message}`);
                }
                next();
            });
            stream.resume();
        } else {
            stream.on('end', () => next());
            stream.resume();
        }
    });

    extract.on('finish', () => {
        console.log("\n\n=== FINAL RESULTS (Archive 11) ===");
        console.log(`Total Predictions: ${totalPredictions}`);
        if (totalPredictions > 0) {
            console.log(`Top-1 Accuracy: ${((correctTop1 / totalPredictions) * 100).toFixed(2)}%`);
            console.log(`Top-5 Accuracy: ${((correctTop5 / totalPredictions) * 100).toFixed(2)}%`);
        } else {
            console.log("No valid predictions made.");
        }
    });

    // START STREAM
    fs.createReadStream(testArchive)
        .pipe(zlib.createGunzip())
        .pipe(extract);
}

// === Helpers ===

function matchDrug(medName: string): string | null {
    const normalized = medName.toLowerCase().trim();
    if (failedLookups.has(normalized)) return null;

    if (drugLookup.has(normalized)) return drugLookup.get(normalized)!;

    if (synonymMap.has(normalized)) {
        const mappedName = synonymMap.get(normalized)!;
        if (drugLookup.has(mappedName.toLowerCase())) return drugLookup.get(mappedName.toLowerCase())!;
    }

    for (const [key, value] of drugLookup.entries()) {
        if (normalized.includes(key) || key.includes(normalized)) return value;
    }

    failedLookups.add(normalized);
    return null;
}

function extractFeatures(bundle: any): number[] | null {
    try {
        const patient = bundle.entry?.find((e: any) => e.resource?.resourceType === 'Patient')?.resource;
        if (!patient) return null;

        const feats: number[] = [];
        const age = 2024 - parseInt(patient.birthDate?.split('-')[0] || '1980');
        feats.push(age / 100);
        feats.push(patient.gender === 'female' ? 1 : 0);
        // Training script does not have 'male' feature
        // feats.push(patient.gender === 'male' ? 1 : 0);

        // Match Training Script Placeholders (6 features) instead of real vitals (3 features)
        // feats.push(sys > 0 ? sys / 200 : 0.6);
        // feats.push(dia > 0 ? dia / 120 : 0.6);
        // feats.push(bmi > 0 ? bmi / 50 : 0.5);
        feats.push(25 / 40, 120 / 200, 80 / 120, 72 / 150, 170 / 200, 70 / 150);

        // Extract required resources
        const conditions = bundle.entry?.filter((e: any) => e.resource?.resourceType === 'Condition') || [];
        const procedures = bundle.entry?.filter((e: any) => e.resource?.resourceType === 'Procedure') || [];
        const immunizations = bundle.entry?.filter((e: any) => e.resource?.resourceType === 'Immunization') || [];
        const encounters = bundle.entry?.filter((e: any) => e.resource?.resourceType === 'Encounter') || [];

        feats.push(Math.min(1, encounters.length / 10));
        feats.push(Math.min(1, immunizations.length / 10));
        feats.push(Math.min(1, procedures.length / 5));

        const keywords = ['Diabetes', 'Hypertension', 'Cardiac', 'Asthma', 'COPD', 'Cancer', 'Arthritis', 'Anxiety', 'Depression', 'Obesity', 'Kidney', 'Liver', 'Stroke', 'HIV', 'Lupus'];
        const conditionText = conditions.map((c: any) => c.resource?.code?.coding?.[0]?.display || '').join(' ').toLowerCase();
        keywords.forEach(k => feats.push(conditionText.includes(k.toLowerCase()) ? 1 : 0));

        return feats;
    } catch { return null; }
}


function extractMedications(bundle: any): string[] {
    const meds: string[] = [];
    const medicationResources = bundle.entry?.filter((e: any) =>
        e.resource?.resourceType === 'Medication') || [];
    medicationResources.forEach((entry: any) => {
        const med = entry.resource;
        if (med.code?.text) meds.push(med.code.text);
        else if (med.code?.coding?.[0]?.display) meds.push(med.code.coding[0].display);
    });
    const medRequests = bundle.entry?.filter((e: any) =>
        e.resource?.resourceType === 'MedicationRequest' ||
        e.resource?.resourceType === 'MedicationStatement') || [];
    medRequests.forEach((entry: any) => {
        const resource = entry.resource;
        if (resource.medicationCodeableConcept?.text) meds.push(resource.medicationCodeableConcept.text);
        else if (resource.medicationCodeableConcept?.coding?.[0]?.display) meds.push(resource.medicationCodeableConcept.coding[0].display);
    });
    return meds;
}

main().catch(console.error);
