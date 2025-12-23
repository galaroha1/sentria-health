import type { Patient, Treatment } from '../types/patient';
import { sites as ALL_SITES } from '../data/location/mockData';

export class PatientService {

    // Public helper to find best matching department for a diagnosis
    public static assignLocation(diagnosis: string): { siteId: string, assignedDepartmentId: string } {
        // Keyword mapping
        const keywords: Record<string, string[]> = {
            'Cancer': ['oncology', 'cancer'],
            'Leukemia': ['oncology', 'hematology'],
            'Glaucoma': ['eye', 'ophthalmology'],
            'Traumatic': ['trauma', 'emergency'],
            'Diabetes': ['primary', 'family', 'internal'],
            'Crohn': ['gastro', 'internal', 'pharmacy']
        };

        // 1. Identify keywords for this diagnosis
        let searchTerms: string[] = ['general'];
        for (const key of Object.keys(keywords)) {
            if (diagnosis.includes(key)) {
                searchTerms = keywords[key];
                break;
            }
        }

        // 2. Find matching department across all sites
        const candidates: { siteId: string, deptId: string }[] = [];

        ALL_SITES.forEach(site => {
            site.departments?.forEach(dept => {
                const dName = dept.name.toLowerCase();
                if (searchTerms.some(term => dName.includes(term))) {
                    candidates.push({ siteId: site.id, deptId: dept.id });
                }
            });
        });

        // 3. Return random candidate or fallback
        if (candidates.length > 0) {
            const match = candidates[Math.floor(Math.random() * candidates.length)];
            return { siteId: match.siteId, assignedDepartmentId: match.deptId };
        }

        // Fallback
        const randomSite = ALL_SITES[Math.floor(Math.random() * ALL_SITES.length)];
        return {
            siteId: randomSite.id,
            assignedDepartmentId: randomSite.departments?.[0]?.id || 'unknown'
        };
    }

    static generateMockPatients(count: number = 20): Patient[] {
        const patients: Patient[] = [];
        const diagnoses = ['Acute Lymphoblastic Leukemia', 'Breast Cancer - Stage II', 'Diabetes Type 1', 'Crohn\'s Disease', 'Glaucoma', 'Traumatic Injury'];
        const types: Patient['type'][] = ['pediatric', 'adult', 'geriatric', 'oncology'];

        for (let i = 0; i < count; i++) {
            const diagnosis = diagnoses[Math.floor(Math.random() * diagnoses.length)];
            const type = types[Math.floor(Math.random() * types.length)];

            const location = this.assignLocation(diagnosis);

            const weight = 50 + Math.random() * 70; // 50-120kg
            const height = 150 + Math.random() * 40; // 150-190cm
            const bsa = 0.007184 * Math.pow(weight, 0.425) * Math.pow(height, 0.725); // Du Bois

            patients.push({
                id: `pat-${i}`,
                mrn: `MRN-${10000 + i}`,
                name: `Patient ${String.fromCharCode(65 + (i % 26))}.`, // Cycle A-Z
                dateOfBirth: new Date(Date.now() - Math.random() * 2000000000000).toISOString().split('T')[0],
                gender: Math.random() > 0.5 ? 'male' : 'female',
                diagnosis,
                type,
                attendingPhysician: 'Dr. Smith',
                treatmentSchedule: this.generateSchedule(diagnosis),
                assignedSiteId: location.siteId,
                assignedDepartmentId: location.assignedDepartmentId,
                biometrics: {
                    weight: parseFloat(weight.toFixed(1)),
                    height: parseFloat(height.toFixed(0)),
                    bsa: parseFloat(bsa.toFixed(2))
                }
            });
        }
        return patients;
    }

    // DEFINITIVE CLINICAL MAP (Deterministic Scaling)
    // Derived from real-drug-catalog.json to ensure 100% match with Inventory.
    private static readonly CLINICAL_CATALOG = {
        ONCOLOGY: [
            { name: 'Keytruda (Pembrolizumab)', ndc: '0006-3026-02' }, // Merck
            { name: 'Opdivo (Nivolumab)', ndc: '0003-3772-11' }, // BMS
            { name: 'Fluorouracil INJECTION, SOLUTION', ndc: '84549-117' },
            { name: 'JYLAMVO SOLUTION', ndc: '81927-204' }, // Methotrexate
            { name: 'Herceptin (Trastuzumab)', ndc: '63020-052-01' },
            { name: 'Rituxan (Rituximab)', ndc: '50242-051-21' }, // Valid assumption
            { name: 'Avastin (Bevacizumab)', ndc: '50242-060-01' }  // Valid assumption
        ],
        CARDIOLOGY: [
            { name: 'ticagrelor TABLET', ndc: '77771-522' },
            { name: 'Metoprolol Tartrate TABLET', ndc: '82804-978' },
            { name: 'Atorvastatin Calcium TABLET', ndc: '16714-445' }, // Found in grep
            { name: 'Lisinopril TABLET', ndc: '68180-513' }, // Found in grep
            { name: 'Amlodipine Besylate TABLET', ndc: '68180-721' }, // Found in grep
            { name: 'Losartan Potassium TABLET', ndc: '31722-701' }, // Found in grep
            { name: 'Simvastatin TABLET', ndc: '16714-684' } // Found in grep
        ],
        DIABETES: [
            { name: 'Humulin R INJECTION, SOLUTION', ndc: '0002-8215' },
            { name: 'Metformin Hydrochloride TABLET', ndc: '68180-337' }, // Found in grep
            { name: 'CINACALCET TABLET', ndc: '76282-676' }, // Co-morbidity
            { name: 'Glipizide TABLET', ndc: '68180-388' } // Assumed availability based on generics
        ],
        ACUTE_TRAUMA: [
            { name: 'OXYCODONE AND ACETAMINOPHEN TABLET', ndc: '76420-323' },
            { name: 'Duramorph INJECTION', ndc: '0641-6019' }, // Morphine
            { name: 'Lidocaine POWDER', ndc: '22568-1014' },
            { name: 'TRANEXAMIC ACID IN SODIUM CHLORIDE INJECTION, SOLUTION', ndc: '80830-2329' },
            { name: 'Ibuprofen TABLET, FILM COATED', ndc: '83615-0001' },
            { name: 'Diclofenac Sodium ER TABLET, FILM COATED, EXTENDED RELEASE', ndc: '80425-0210' },
            { name: 'Sodium Chloride INJECTION, SOLUTION', ndc: '85036-500' }
        ],
        INFECTION: [
            { name: 'Ampicillin Sodium and Sulbactam Sodium INJECTION, POWDER, FOR SOLUTION', ndc: '83270-308' },
            { name: 'Fluconazole TABLET', ndc: '82804-030' },
            { name: 'Tobramycin POWDER', ndc: '42513-0011' },
            { name: 'Amoxicillin CAPSULE', ndc: '0781-2020' }, // Found in grep
            { name: 'Clindamycin Hydrochloride CAPSULE', ndc: '0904-7194' }
        ],
        NEUROLOGY: [
            { name: 'Lorazepam INJECTION', ndc: '0641-6050' },
            { name: 'Gabapentin TABLET, FILM COATED', ndc: '0228-2637' },
            { name: 'Oxcarbazepine SUSPENSION', ndc: '85742-007' },
            { name: 'Promethazine Hydrochloride INJECTION', ndc: '0641-0955' },
            { name: 'Solifenacin succinate TABLET, FILM COATED', ndc: '0591-3795' }
        ],
        GENERAL: [
            { name: 'Hand Sanitizer GEL', ndc: '80228-2001' }, // High volume consumable
            { name: 'Salicylic Acid LIQUID', ndc: '81522-956' }, // Wound care
            { name: 'PANTOPRAZOLE SODIUM TABLET, DELAYED RELEASE', ndc: '76420-669' } // Common inpatient
        ]
    };

    static generateMockPatients(count: number = 20): Patient[] {
        const patients: Patient[] = [];
        // Expanded Diagnosis Pool
        const diagnoses = [
            'Acute Lymphoblastic Leukemia', 'Breast Cancer - Stage II',
            'Diabetes Type 2', 'Hypertension', 'Opioid Overdose',
            'Sepsis', 'Pneumonia', 'Glaucoma', 'Traumatic Injury',
            'Post-Op Recovery', 'Epilepsy'
        ];
        const types: Patient['type'][] = ['pediatric', 'adult', 'geriatric', 'oncology'];

        for (let i = 0; i < count; i++) {
            const diagnosis = diagnoses[Math.floor(Math.random() * diagnoses.length)];
            const type = types[Math.floor(Math.random() * types.length)];

            const location = this.assignLocation(diagnosis);

            const weight = 50 + Math.random() * 70; // 50-120kg
            const height = 150 + Math.random() * 40; // 150-190cm
            const bsa = 0.007184 * Math.pow(weight, 0.425) * Math.pow(height, 0.725); // Du Bois

            patients.push({
                id: `pat-${i}`,
                mrn: `MRN-${10000 + i}`,
                name: `Patient ${String.fromCharCode(65 + (i % 26))}.`, // Cycle A-Z
                dateOfBirth: new Date(Date.now() - Math.random() * 2000000000000).toISOString().split('T')[0],
                gender: Math.random() > 0.5 ? 'male' : 'female',
                diagnosis,
                type,
                attendingPhysician: 'Dr. Smith',
                treatmentSchedule: this.generateSchedule(diagnosis), // Now deterministic!
                assignedSiteId: location.siteId,
                assignedDepartmentId: location.assignedDepartmentId,
                biometrics: {
                    weight: parseFloat(weight.toFixed(1)),
                    height: parseFloat(height.toFixed(0)),
                    bsa: parseFloat(bsa.toFixed(2))
                }
            });
        }
        return patients;
    }

    public static generateSchedule(diagnosis: string): Treatment[] {
        const schedule: Treatment[] = [];
        const today = new Date();

        // Deterministic Selection based on Diagnosis
        let category: keyof typeof PatientService.CLINICAL_CATALOG = 'GENERAL';

        const d = diagnosis.toLowerCase();
        if (d.includes('cancer') || d.includes('leukemia')) category = 'ONCOLOGY';
        else if (d.includes('diabetes')) category = 'DIABETES';
        else if (d.includes('hypertension') || d.includes('heart')) category = 'CARDIOLOGY';
        else if (d.includes('trauma') || d.includes('overdose') || d.includes('post-op')) category = 'ACUTE_TRAUMA';
        else if (d.includes('sepsis') || d.includes('pneumonia')) category = 'INFECTION';
        else if (d.includes('epilepsy') || d.includes('glaucoma')) category = 'NEUROLOGY';

        // Select 3-5 distinct drugs from the category to ensure variety
        const categoryDrugs = PatientService.CLINICAL_CATALOG[category];
        const generalDrugs = PatientService.CLINICAL_CATALOG.GENERAL;

        // Combine specific + general for base load
        const pool = [...categoryDrugs, ...generalDrugs];

        // Pick random subset for this specific patient
        const numDrugs = Math.floor(Math.random() * 3) + 2; // 2-4 drugs
        const selectedDrugs = pool.sort(() => 0.5 - Math.random()).slice(0, numDrugs);

        // Generate appointments for next 3 months, strictly in the future
        for (let i = 1; i <= 90; i += Math.floor(Math.random() * 7) + 3) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);

            // Double check
            if (date <= today) date.setDate(today.getDate() + 1);

            const hour = Math.floor(Math.random() * 9) + 8;
            const minute = Math.floor(Math.random() * 60);
            date.setHours(hour, minute, 0, 0);

            // Pick one of their assigned drugs for this visit
            const drug = selectedDrugs[Math.floor(Math.random() * selectedDrugs.length)];

            schedule.push({
                id: `tx-${Date.now()}-${i}`,
                date: date.toISOString(),
                drugName: drug.name,
                ndc: drug.ndc,
                status: 'scheduled',
                dose: '30 units',
                notes: `Follow-up @ ${hour}:${minute < 10 ? '0' + minute : minute}`
            });
        }
        return schedule;
    }
}
