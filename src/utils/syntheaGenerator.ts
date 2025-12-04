import { MEDICAL_DATABASE, COMORBIDITIES_LIST } from '../data/medicalDatabase';

// Helper for ID generation
const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

// FHIR-like Types
export interface FHIRPatient {
    resourceType: 'Patient';
    id: string;
    active: boolean;
    name: [{
        use: 'official';
        family: string;
        given: string[];
    }];
    gender: 'male' | 'female' | 'other';
    birthDate: string;
    address: [{
        state: string;
        postalCode: string;
        country: 'US';
    }];
}

export interface FHIRCondition {
    resourceType: 'Condition';
    id: string;
    clinicalStatus: 'active' | 'recurrence' | 'relapse';
    verificationStatus: 'confirmed';
    code: {
        coding: [{
            system: 'http://hl7.org/fhir/sid/icd-10' | 'http://snomed.info/sct';
            code: string;
            display: string;
        }];
    };
    subject: {
        reference: string; // Patient/ID
    };
    onsetDateTime: string;
}

export interface FHIRMedicationRequest {
    resourceType: 'MedicationRequest';
    id: string;
    status: 'active' | 'completed';
    intent: 'order';
    medicationCodeableConcept: {
        coding: [{
            system: 'http://www.nlm.nih.gov/research/umls/rxnorm';
            code: string; // Mock RxNorm
            display: string;
        }];
    };
    subject: {
        reference: string;
    };
    authoredOn: string;
}

export interface SyntheticBundle {
    patient: FHIRPatient;
    conditions: FHIRCondition[];
    medications: FHIRMedicationRequest[];
}

export class SyntheaGenerator {

    static async generateBatch(count: number): Promise<SyntheticBundle[]> {
        const MAX_API_FETCH = 200; // Threshold for switching to local generation for speed

        // For large datasets, use local generation to avoid API rate limits and latency
        if (count > MAX_API_FETCH) {
            console.log(`Generating ${count} patients locally for performance...`);
            return await this.generateLocalBatch(count);
        }

        return this._fetchFromApi(count);
    }

    private static async _fetchFromApi(count: number): Promise<SyntheticBundle[]> {
        try {
            // Fetch real user identities from Random User Generator API
            const response = await fetch(`https://randomuser.me/api/?results=${count}&nat=us`);
            if (!response.ok) throw new Error('API request failed');

            const data = await response.json();
            const users = data.results;

            return users.map((user: any) => {
                const patientId = generateId();
                const gender = user.gender;
                const birthDate = user.dob.date.split('T')[0];

                const patient: FHIRPatient = {
                    resourceType: 'Patient',
                    id: patientId,
                    active: true,
                    name: [{
                        use: 'official',
                        family: user.name.last,
                        given: [user.name.first]
                    }],
                    gender: gender,
                    birthDate: birthDate,
                    address: [{
                        state: user.location.state,
                        postalCode: String(user.location.postcode),
                        country: 'US'
                    }]
                };

                return this._generateClinicalData(patient);
            });
        } catch (error) {
            console.error("Failed to fetch from Random User API, falling back to local generation", error);
            return await this.generateLocalBatch(count);
        }
    }

    static async generateLocalBatch(count: number, onProgress?: (progress: number) => void): Promise<SyntheticBundle[]> {
        const CHUNK_SIZE = 100;
        const results: SyntheticBundle[] = [];

        for (let i = 0; i < count; i += CHUNK_SIZE) {
            const chunkEnd = Math.min(i + CHUNK_SIZE, count);

            // Generate chunk
            for (let j = i; j < chunkEnd; j++) {
                results.push(this.generateLocalPatient());
            }

            // Report progress
            if (onProgress) {
                onProgress(Math.round((chunkEnd / count) * 100));
            }

            // Yield to main thread to keep UI responsive
            await new Promise(resolve => setTimeout(resolve, 0));
        }

        return results;
    }

    // Shared logic for clinical data generation
    private static _generateClinicalData(patient: FHIRPatient): SyntheticBundle {
        const conditions: FHIRCondition[] = [];
        const medications: FHIRMedicationRequest[] = [];

        // 1. Assign Primary Condition (from our Medical Database)
        const conditionKeys = Object.keys(MEDICAL_DATABASE);
        const primaryConditionKey = conditionKeys[Math.floor(Math.random() * conditionKeys.length)];
        const primaryCondition = MEDICAL_DATABASE[primaryConditionKey];

        conditions.push({
            resourceType: 'Condition',
            id: generateId(),
            clinicalStatus: 'active',
            verificationStatus: 'confirmed',
            code: {
                coding: [{
                    system: 'http://hl7.org/fhir/sid/icd-10',
                    code: primaryCondition.icd10,
                    display: primaryCondition.name
                }]
            },
            subject: { reference: `Patient/${patient.id}` },
            onsetDateTime: new Date(Date.now() - Math.random() * 10000000000).toISOString()
        });

        // 2. Assign Comorbidities (0-3)
        const numComorbidities = Math.floor(Math.random() * 4);
        for (let i = 0; i < numComorbidities; i++) {
            const comorbidity = COMORBIDITIES_LIST[Math.floor(Math.random() * COMORBIDITIES_LIST.length)];
            conditions.push({
                resourceType: 'Condition',
                id: generateId(),
                clinicalStatus: 'active',
                verificationStatus: 'confirmed',
                code: {
                    coding: [{
                        system: 'http://snomed.info/sct',
                        code: 'mock-code',
                        display: comorbidity
                    }]
                },
                subject: { reference: `Patient/${patient.id}` },
                onsetDateTime: new Date(Date.now() - Math.random() * 20000000000).toISOString()
            });
        }

        // 3. Assign Medications (based on primary condition)
        if (Math.random() < 0.8 && primaryCondition.suggestedDrugs.length > 0) {
            const drug = primaryCondition.suggestedDrugs[Math.floor(Math.random() * primaryCondition.suggestedDrugs.length)];
            medications.push({
                resourceType: 'MedicationRequest',
                id: generateId(),
                status: 'active',
                intent: 'order',
                medicationCodeableConcept: {
                    coding: [{
                        system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
                        code: 'mock-rxnorm',
                        display: drug.name
                    }]
                },
                subject: { reference: `Patient/${patient.id}` },
                authoredOn: new Date().toISOString()
            });
        }

        return { patient, conditions, medications };
    }

    // Fallback method
    static generateLocalPatient(): SyntheticBundle {
        const FIRST_NAMES = {
            male: ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles', 'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald'],
            female: ['Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen', 'Nancy', 'Lisa', 'Betty', 'Margaret', 'Sandra']
        };
        const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson'];

        const gender = Math.random() > 0.5 ? 'male' : 'female';
        const firstName = FIRST_NAMES[gender][Math.floor(Math.random() * FIRST_NAMES[gender].length)];
        const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
        const age = Math.floor(Math.random() * (90 - 18) + 18);
        const birthYear = new Date().getFullYear() - age;
        const birthDate = `${birthYear}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`;
        const patientId = generateId();

        const patient: FHIRPatient = {
            resourceType: 'Patient',
            id: patientId,
            active: true,
            name: [{
                use: 'official',
                family: lastName,
                given: [firstName]
            }],
            gender,
            birthDate,
            address: [{
                state: 'MA',
                postalCode: '02108',
                country: 'US'
            }]
        };

        return this._generateClinicalData(patient);
    }
}
