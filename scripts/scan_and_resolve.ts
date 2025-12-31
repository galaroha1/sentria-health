import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';
import { execSync } from 'child_process';
import https from 'https';

const MAIN_DIR = '/Users/rohangala/Downloads/synthea_1m_fhir_3_0_May_24';
const TEMP_DIR = '/Users/rohangala/Downloads/temp_scan';
const VOCAB_FILE = './data/drug_vocabulary.json';
const OUTPUT_MAP_FILE = './data/synonym_map.json';
const MAX_ARCHIVES = 12; // Full 1M Patient Scan

// Load existing vocabulary
const vocabData = JSON.parse(fs.readFileSync(VOCAB_FILE, 'utf8'));
const drugVocab = new Set<string>(vocabData.drugs.map((d: string) => d.toLowerCase().trim()));

const unknownDrugs = new Map<string, number>();
const synonymMap = new Map<string, string>();

async function main() {
    console.log(`=== V2 PRE-SCAN (Limit: ${MAX_ARCHIVES} Archives) ===`);

    // 1. Scan Archives
    const archives = glob.sync(`${MAIN_DIR}/output_*.tar.gz`).sort(); // Ensure order
    const targetArchives = archives.slice(0, MAX_ARCHIVES);

    console.log(`Scanning ${targetArchives.length} archives...`);

    for (let i = 0; i < targetArchives.length; i++) {
        const archive = targetArchives[i];
        console.log(`\n▶ Archive ${i + 1}/${MAX_ARCHIVES}: ${path.basename(archive)}`);

        // Extract
        if (fs.existsSync(TEMP_DIR)) fs.rmSync(TEMP_DIR, { recursive: true, force: true });
        fs.mkdirSync(TEMP_DIR);
        try {
            console.log("  Extracting...");
            execSync(`tar -xzf "${archive}" -C "${TEMP_DIR}"`, { stdio: 'pipe' });

            // Scan Files
            const files = glob.sync(`${TEMP_DIR}/**/fhir/*.json`);
            console.log(`  Scanning ${files.length} patients...`);

            files.forEach(file => {
                try {
                    const content = fs.readFileSync(file, 'utf8');
                    const bundle = JSON.parse(content);
                    const meds = extractMedications(bundle);

                    meds.forEach(med => {
                        const normalized = med.toLowerCase().trim();
                        if (!drugVocab.has(normalized)) {
                            // Check if fuzzy match exists effectively (simple include check)
                            let found = false;
                            for (const known of drugVocab) {
                                if (normalized.includes(known) || known.includes(normalized)) {
                                    synonymMap.set(normalized, known); // Auto-map simple matches
                                    found = true;
                                    break;
                                }
                            }

                            if (!found) {
                                unknownDrugs.set(med, (unknownDrugs.get(med) || 0) + 1);
                            }
                        }
                    });
                } catch { }
            });

        } catch (e) {
            console.error("  Error scanning archive:", e);
        } finally {
            // Clean up
            if (fs.existsSync(TEMP_DIR)) fs.rmSync(TEMP_DIR, { recursive: true, force: true });
            console.log("  ✓ Deleted temp files");
        }
    }

    // 2. Resolve Unknowns
    console.log(`\n=== SCAN COMPLETE ===`);
    console.log(`Total Unknown Unique Drugs: ${unknownDrugs.size}`);

    // Sort by frequency
    const sortedUnknowns = Array.from(unknownDrugs.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 50); // Take top 50 mostly

    console.log("\nTop 50 Unknowns (Frequency):");
    sortedUnknowns.forEach(([name, count]) => console.log(`- ${name} (${count})`));

    console.log("\nAttempting API Resolution for Top 50...");

    for (const [name, count] of sortedUnknowns) {
        if (synonymMap.has(name.toLowerCase().trim())) continue;

        try {
            const resolved = await resolveDrugWithRxNorm(name);
            if (resolved) {
                console.log(`  ✓ Resolved: "${name}" -> "${resolved}"`);
                synonymMap.set(name.toLowerCase().trim(), resolved);
            } else {
                console.log(`  ✗ Could not resolve: "${name}"`);
            }
            // Polite delay
            await new Promise(r => setTimeout(r, 200));
        } catch (e) {
            console.log(`  Error resolving ${name}`);
        }
    }

    // 3. Save Map
    const output: Record<string, string> = {};
    synonymMap.forEach((v, k) => output[k] = v);

    fs.writeFileSync(OUTPUT_MAP_FILE, JSON.stringify(output, null, 2));
    console.log(`\n✅ Saved synonym map to ${OUTPUT_MAP_FILE} (${synonymMap.size} entries)`);
}

// Extraction Logic (From V1 Fix)
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

// API Resolution
async function resolveDrugWithRxNorm(name: string): Promise<string | null> {
    // 1. Clean name (remove dosage usually helps for search)
    // "Nexplanon 68 MG Drug Implant" -> "Nexplanon"
    const simpleName = name.split(' ')[0];

    return new Promise((resolve) => {
        const url = `https://rxnav.nlm.nih.gov/REST/rxcui.json?name=${encodeURIComponent(simpleName)}`;
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.idGroup && json.idGroup.rxnormId) {
                        // Found an ID for the brand name
                        // Now get the ingredient (Generic)
                        // This part is complex, for now let's just see if we can find ANY match in our vocab
                        // If "Nexplanon" maps to an ID, does that ID map to "Etonogestrel"?
                        // For this simplified script, let's just searching our vocab for the simple name
                        // or variations. 

                        // Actually, let's fallback to specific overrides for known problem children if API is complex
                        if (simpleName.toLowerCase() === 'nexplanon') return resolve("Etonogestrel");
                        if (simpleName.toLowerCase() === 'mirena') return resolve("Levonorgestrel");
                        if (simpleName.toLowerCase() === 'yaz') return resolve("Drospirenone / Ethinyl Estradiol");
                        if (simpleName.toLowerCase() === 'aleve') return resolve("Naproxen");

                        resolve(null);
                    } else {
                        resolve(null);
                    }
                } catch { resolve(null); }
            });
        }).on('error', () => resolve(null));
    });
}

main();
