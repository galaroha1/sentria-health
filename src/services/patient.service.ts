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

    public static generateSchedule(diagnosis: string): Treatment[] {
        const schedule: Treatment[] = [];
        const today = new Date();

        // ALIGNED CATALOG: Must match 'real-drug-catalog.json' & 'mockData.ts' exactly
        // Format: { name: "DrugName Form", ndc: "Real-NDC" }
        // ALIGNED CATALOG: Matched to top 100 items in 'real-drug-catalog.json' associated with 'mockData.ts'
        // Format: { name: "Name Form", ndc: "NDC" }
        // We use NDCs from the JSON file viewed in debug steps.
        const catalog = {
            leukemia: [
                { name: 'Ticagrelor TABLET', ndc: '77771-522' }, // Real Item 1
                { name: 'Solifenacin succinate TABLET, FILM COATED', ndc: '0591-3795' } // Real Item 2
            ],
            cancer: [
                { name: 'Keytruda (Pembrolizumab)', ndc: '0006-3026-02' },
                { name: 'Opdivo (Nivolumab)', ndc: '0003-3772-11' },
                { name: 'OXYCODONE AND ACETAMINOPHEN TABLET', ndc: '76420-323' },
                { name: 'Fluconazole TABLET', ndc: '82804-030' }
            ],
            crohn: [
                { name: 'Hydrocortisone Continuous AEROSOL, SPRAY', ndc: '79481-0618' },
                { name: 'PANTOPRAZOLE SODIUM TABLET, DELAYED RELEASE', ndc: '76420-669' }
            ],
            diabetes: [
                { name: 'CINACALCET TABLET', ndc: '76282-676' },
                { name: 'Metoprolol Tartrate TABLET', ndc: '82804-978' }
            ]
        };

        let selectedDrugs = catalog.diabetes; // default
        if (diagnosis.includes('Leukemia')) selectedDrugs = catalog.leukemia;
        else if (diagnosis.includes('Cancer')) selectedDrugs = catalog.cancer;
        else if (diagnosis.includes('Crohn')) selectedDrugs = catalog.crohn;

        // Generate appointments for next 3 months, strictly in the future
        // SPREAD: 10-15 appointments over 90 days to ensure volume
        for (let i = 1; i <= 90; i += Math.floor(Math.random() * 7) + 3) { // tighter frequency
            const date = new Date(today);
            date.setDate(today.getDate() + i);

            // Double check to be absolutely sure it's future (redundant but safe)
            if (date <= today) {
                date.setDate(today.getDate() + 1);
            }

            // SET RANDOM TIME (8 AM - 4 PM)
            const hour = Math.floor(Math.random() * 9) + 8; // 8 to 16 inclusive
            const minute = Math.floor(Math.random() * 60);
            date.setHours(hour, minute, 0, 0);

            const drug = selectedDrugs[Math.floor(Math.random() * selectedDrugs.length)];

            schedule.push({
                id: `tx-${Date.now()}-${i}`,
                date: date.toISOString(),
                drugName: drug.name, // Now matches inventory exactly
                ndc: drug.ndc,      // Now matches inventory exactly
                status: 'scheduled',
                dose: '30 units', // Increased to simulate checking out a monthly supply -> High Demand Impact
                notes: `Follow-up @ ${hour}:${minute < 10 ? '0' + minute : minute}`
            });
        }
        return schedule;
    }
}
