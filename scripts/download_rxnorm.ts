import https from 'https';
import http from 'http';
import fs from 'fs';

const OUTPUT_FILE = './data/drug_vocabulary.json';

console.log("=== Building 10K+ Drug Vocabulary from Free APIs ===\n");

interface DrugRecord {
    name: string;
    source: string;
}

// Fetch from OpenFDA NDC Directory
async function fetchOpenFDA(): Promise<string[]> {
    console.log("[1/3] Fetching from OpenFDA NDC Directory...");
    const drugs = new Set<string>();

    // OpenFDA allows pagination, fetch multiple pages to get 10K+
    const limit = 1000; // Max per request
    const totalRequests = 15; // 15K drugs total

    for (let skip = 0; skip < totalRequests * limit; skip += limit) {
        try {
            const url = `https://api.fda.gov/drug/ndc.json?limit=${limit}&skip=${skip}`;
            const data = await fetchJSON(url);

            if (data.results) {
                data.results.forEach((record: any) => {
                    // Extract brand name and generic name
                    if (record.brand_name) drugs.add(cleanDrugName(record.brand_name));
                    if (record.generic_name) drugs.add(cleanDrugName(record.generic_name));
                    if (record.nonproprietary_name) drugs.add(cleanDrugName(record.nonproprietary_name));
                });
            }

            console.log(`  Progress: ${drugs.size} unique drugs (page ${Math.floor(skip / limit) + 1}/${totalRequests})`);

            // Rate limiting: 240 req/min = ~4 req/sec
            await sleep(300);

        } catch (err: any) {
            if (err.message.includes('404') || err.message.includes('No matches')) {
                console.log(`  Reached end of dataset at ${drugs.size} drugs`);
                break;
            }
            console.warn(`  Warning: ${err.message.substring(0, 100)}`);
        }
    }

    console.log(`✓ OpenFDA: ${drugs.size} drugs\n`);
    return Array.from(drugs);
}

// Fetch from RxNorm Prescribable API
async function fetchRxNorm(existingDrugs: Set<string>): Promise<string[]> {
    console.log("[2/3] Fetching from RxNorm Prescribable Content...");

    // RxNorm API for commonly prescribed drugs
    const commonIngredients = [
        'metformin', 'lisinopril', 'atorvastatin', 'amlodipine', 'metoprolol',
        'omeprazole', 'simvastatin', 'losartan', 'albuterol', 'gabapentin',
        'sertraline', 'ibuprofen', 'furosemide', 'tramadol', 'prednisone',
        'amoxicillin', 'levothyroxine', 'hydrochlorothiazide'
    ];

    const rxnormDrugs = new Set<string>();

    for (const ingredient of commonIngredients) {
        try {
            const url = `https://rxnav.nlm.nih.gov/REST/drugs.json?name=${encodeURIComponent(ingredient)}`;
            const data = await fetchJSON(url);

            if (data.drugGroup?.conceptGroup) {
                data.drugGroup.conceptGroup.forEach((group: any) => {
                    if (group.conceptProperties) {
                        group.conceptProperties.forEach((prop: any) => {
                            if (prop.name) {
                                const drugName = cleanDrugName(prop.name);
                                if (!existingDrugs.has(drugName)) {
                                    rxnormDrugs.add(drugName);
                                }
                            }
                        });
                    }
                });
            }

            await sleep(100); // Rate limiting
        } catch (err: any) {
            console.warn(`  Warning for ${ingredient}: ${err.message.substring(0, 50)}`);
        }
    }

    console.log(`✓ RxNorm: ${rxnormDrugs.size} additional drugs\n`);
    return Array.from(rxnormDrugs);
}

// Helper: Clean drug names
function cleanDrugName(name: string): string {
    return name
        .trim()
        .split(/[\[\(]/)[0] // Remove dosage info in brackets/parentheses
        .trim()
        .replace(/\s+/g, ' ')
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Helper: Fetch JSON from URL
function fetchJSON(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        protocol.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(new Error(`JSON parse error: ${e}`));
                }
            });
        }).on('error', reject);
    });
}

// Helper: Sleep
function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Save vocabulary
function saveVocabulary(drugs: string[]) {
    console.log("[3/3] Saving vocabulary...");

    const vocabData = {
        version: '1.0.0',
        sources: ['OpenFDA NDC', 'RxNorm Prescribable'],
        generatedAt: new Date().toISOString(),
        count: drugs.length,
        drugs: drugs.sort()
    };

    fs.mkdirSync('./data', { recursive: true });
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(vocabData, null, 2));
    console.log(`✓ Saved ${drugs.length} drugs to ${OUTPUT_FILE}\n`);
}

async function main() {
    try {
        // Fetch from OpenFDA
        const fdaDrugs = await fetchOpenFDA();
        const fdaSet = new Set(fdaDrugs);

        // Fetch additional from RxNorm
        const rxnormDrugs = await fetchRxNorm(fdaSet);

        // Combine
        const allDrugs = [...fdaDrugs, ...rxnormDrugs];

        saveVocabulary(allDrugs);

        console.log("=== Summary ===");
        console.log(`Total drugs: ${allDrugs.length}`);
        console.log(`Output: ${OUTPUT_FILE}`);
        console.log("\n✅ Drug vocabulary ready for training!");

    } catch (err: any) {
        console.error("❌ Fatal error:", err.message);
        process.exit(1);
    }
}

main();
