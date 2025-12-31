import * as tf from '@tensorflow/tfjs';
import fs from 'fs';
import { glob } from 'glob';
import { execSync } from 'child_process';

const MAIN_DIR = '/Users/rohangala/Downloads/synthea_1m_fhir_3_0_May_24';
const TEMP_DIR = '/Users/rohangala/Downloads/temp_train';
const SAVE_PATH = './ai_model_trained';
const VOCAB_FILE = './data/drug_vocabulary.json';
const SYNONYM_FILE = './data/synonym_map.json';
const BATCH_SIZE = 100;
const MAX_ARCHIVES = 10; // RUNNING FULL 1-10 (Leave 11-12 for validation)

console.log("=== PRODUCTION AI TRAINING (9,505 Drugs) - FULL RUN (1-10) ===\n");

// Load drug vocabulary
console.log("[INIT] Loading drug vocabulary...");
const vocabData = JSON.parse(fs.readFileSync(VOCAB_FILE, 'utf8'));
const drugVocab: string[] = vocabData.drugs;
console.log(`✓ Loaded ${drugVocab.length} drugs\n`);

// Load synonym map
console.log("[INIT] Loading synonyms...");
const synonymMap = new Map<string, string>();
if (fs.existsSync(SYNONYM_FILE)) {
    const synData = JSON.parse(fs.readFileSync(SYNONYM_FILE, 'utf8'));
    Object.entries(synData).forEach(([key, val]) => synonymMap.set(key, val as string));
    console.log(`✓ Loaded ${synonymMap.size} synonyms\n`);
}

// Create drug lookup for fast matching
const drugLookup = new Map<string, string>();
drugVocab.forEach(drug => {
    const normalized = drug.toLowerCase().trim();
    drugLookup.set(normalized, drug);
    // Also add single-word matches
    const firstWord = normalized.split(' ')[0];
    if (firstWord.length > 3) {
        drugLookup.set(firstWord, drug);
    }
});

function extractFeatures(bundle: any): number[] | null {
    try {
        const feats: number[] = [];
        const patientEntry = bundle.entry?.find((e: any) => e.resource?.resourceType === 'Patient');
        if (!patientEntry) return null;

        const patient = patientEntry.resource;
        const birthDate = new Date(patient.birthDate || '1980-01-01');
        const age = new Date().getFullYear() - birthDate.getFullYear();
        feats.push(age / 100, patient.gender === 'female' ? 1 : 0);

        // Vital mocked features (would parse from Observations in production)
        feats.push(25 / 40, 120 / 200, 80 / 120, 72 / 150, 170 / 200, 70 / 150);

        const conditions = bundle.entry?.filter((e: any) => e.resource?.resourceType === 'Condition') || [];
        const encounters = bundle.entry?.filter((e: any) => e.resource?.resourceType === 'Encounter') || [];
        const immunizations = bundle.entry?.filter((e: any) => e.resource?.resourceType === 'Immunization') || [];
        const procedures = bundle.entry?.filter((e: any) => e.resource?.resourceType === 'Procedure') || [];

        feats.push(Math.min(1, encounters.length / 10), Math.min(1, immunizations.length / 10), Math.min(1, procedures.length / 5));

        const keywords = ['Diabetes', 'Hypertension', 'Cardiac', 'Asthma', 'COPD', 'Cancer', 'Arthritis', 'Anxiety', 'Depression', 'Obesity', 'Kidney', 'Liver', 'Stroke', 'HIV', 'Lupus'];
        const conditionText = conditions.map((c: any) => c.resource?.code?.coding?.[0]?.display || '').join(' ').toLowerCase();
        keywords.forEach(k => feats.push(conditionText.includes(k.toLowerCase()) ? 1 : 0));

        return feats;
    } catch { return null; }
}

// Extract medications from FHIR Bundle
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

// Match medication name to vocabulary
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

// DEBUG: Log first few unmatched meds to understand format
let debugLogCount = 0;

async function main() {
    console.log("[1/3] Finding archives...");
    const archives = glob.sync(`${MAIN_DIR}/output_*.tar.gz`);
    console.log(`Found ${archives.length} archives\n`);

    console.log("[2/3] Building model...");
    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 256, activation: 'relu', inputShape: [26] }));
    model.add(tf.layers.dropout({ rate: 0.3 }));
    model.add(tf.layers.dense({ units: 128, activation: 'relu' }));
    model.add(tf.layers.dropout({ rate: 0.2 }));
    model.add(tf.layers.dense({ units: drugVocab.length, activation: 'softmax' }));

    model.compile({
        optimizer: tf.train.adam(0.0005),
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy']
    });
    console.log(`Model: ${drugVocab.length}-class softmax output\n`);

    console.log("[3/3] Training...\n");
    let totalTrained = 0;
    let totalSkipped = 0;

    // Cap at MAX_ARCHIVES for this test run
    // Sorting ensures consistent order (Archive 1, 2, 3...)
    const targetArchives = archives.sort().slice(0, MAX_ARCHIVES);
    console.log(`\nLIMIT: Running V2 Test on first ${targetArchives.length} archives only.\n`);

    for (let i = 0; i < targetArchives.length; i++) {
        const archive = targetArchives[i];
        console.log(`▶ Archive ${i + 1}/${targetArchives.length}: ${archive.split('/').pop()}`);

        if (fs.existsSync(TEMP_DIR)) execSync(`rm -rf "${TEMP_DIR}"`, { stdio: 'pipe' });
        fs.mkdirSync(TEMP_DIR, { recursive: true });

        console.log(`  Extracting...`);
        execSync(`tar -xzf "${archive}" -C "${TEMP_DIR}"`, { stdio: 'pipe' });

        const files = glob.sync(`${TEMP_DIR}/**/fhir/*.json`);
        console.log(`  Found ${files.length} patients`);

        let archiveTrained = 0;
        for (let batchStart = 0; batchStart < files.length; batchStart += BATCH_SIZE) {
            const batchFiles = files.slice(batchStart, batchStart + BATCH_SIZE);
            const inputs: number[][] = [];
            const outputs: number[][] = [];

            for (const file of batchFiles) {
                try {
                    const content = fs.readFileSync(file, 'utf8');
                    const bundle = JSON.parse(content);
                    const features = extractFeatures(bundle);

                    if (features && features.length === 26) {
                        // Extract actual medications from patient record
                        const meds = extractMedications(bundle);
                        const matchedDrug = meds.map(m => matchDrug(m)).find(d => d !== null);

                        if (matchedDrug) {
                            inputs.push(features);
                            const drugIndex = drugVocab.indexOf(matchedDrug);
                            const targetVec = Array(drugVocab.length).fill(0);
                            targetVec[drugIndex] = 1;
                            outputs.push(targetVec);
                            archiveTrained++;
                        } else {
                            if (debugLogCount < 20 && meds.length > 0) {
                                console.log(`[DEBUG] Unmatched meds: ${JSON.stringify(meds)}`);
                                debugLogCount++;
                            }
                            totalSkipped++;
                        }
                    }
                } catch { }
            }

            if (inputs.length > 0) {
                const xs = tf.tensor2d(inputs);
                const ys = tf.tensor2d(outputs);
                await model.fit(xs, ys, { epochs: 2, batchSize: 16, verbose: 0 });
                xs.dispose();
                ys.dispose();
                totalTrained += inputs.length;
            }
        }

        console.log(`  ✓ Trained: ${archiveTrained} | Skipped: ${files.length - archiveTrained} (no matching drugs)`);

        // SAVE CHECKPOINT UNCONDITIONALLY after every archive
        const checkpoint = await model.toJSON();
        const weights = model.getWeights().map(w => Array.from(w.dataSync()));
        fs.mkdirSync(SAVE_PATH, { recursive: true });

        // Save as "latest" and "archive_X" for safety
        fs.writeFileSync(`${SAVE_PATH}/checkpoint_archive_${i + 1}.json`,
            JSON.stringify({ model: checkpoint, weights }, null, 2));
        fs.writeFileSync(`${SAVE_PATH}/model_final.json`, JSON.stringify(checkpoint, null, 2));
        fs.writeFileSync(`${SAVE_PATH}/weights_final.json`, JSON.stringify(weights, null, 2));

        console.log(`  ✓ Checkpoint Saved (Archive ${i + 1} Complete)\n`);

        execSync(`rm -rf "${TEMP_DIR}"`, { stdio: 'pipe' });
        console.log(`  ✓ Deleted`);
    }

    console.log(`\n=== TRAINING COMPLETE ===`);
    console.log(`Patients trained: ${totalTrained}`);
    console.log(`Patients skipped: ${totalSkipped} (no medication match)`);

    const modelJSON = await model.toJSON();
    const weightsData = model.getWeights().map(w => Array.from(w.dataSync()));

    fs.mkdirSync(SAVE_PATH, { recursive: true });
    fs.writeFileSync(`${SAVE_PATH}/model_final.json`, JSON.stringify(modelJSON, null, 2));
    fs.writeFileSync(`${SAVE_PATH}/weights_final.json`, JSON.stringify(weightsData, null, 2));

    console.log(`\n✅ Model saved to ${SAVE_PATH}/`);
    console.log(`✅ Drug vocabulary: ${drugVocab.length} medications\n`);
}

main();
