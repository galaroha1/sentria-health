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

const FIRST_NAMES = {
    male: ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles'],
    female: ['Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen']
};

const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];

export class SyntheaGenerator {

    static generatePatient(): SyntheticBundle {
        const gender = Math.random() > 0.5 ? 'male' : 'female';
        const firstName = FIRST_NAMES[gender][Math.floor(Math.random() * FIRST_NAMES[gender].length)];
        const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
        const age = Math.floor(Math.random() * (90 - 18) + 18); // 18 to 90
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
                state: 'MA', // Synthea default is often MA
                postalCode: '02108',
                country: 'US'
            }]
        };

        const conditions: FHIRCondition[] = [];
        const medications: FHIRMedicationRequest[] = [];

        // 1. Assign Primary Condition (from our Medical Database)
        // Weighted random selection could be better, but simple random for now
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
            subject: { reference: `Patient/${patientId}` },
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
                subject: { reference: `Patient/${patientId}` },
                onsetDateTime: new Date(Date.now() - Math.random() * 20000000000).toISOString()
            });
        }

        // 3. Assign Medications (based on primary condition)
        // 80% chance to be on one of the suggested drugs
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
                subject: { reference: `Patient/${patientId}` },
                authoredOn: new Date().toISOString()
            });
        }

        return { patient, conditions, medications };
    }

    static generateBatch(count: number): SyntheticBundle[] {
        return Array.from({ length: count }, () => this.generatePatient());
    }
}
