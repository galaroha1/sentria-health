
export interface PatientProfile {
    name: string;
    age: number;
    gender: 'Male' | 'Female' | 'Other';
    conditionId: string; // Maps to MEDICAL_DATABASE keys
    medicalHistory: string[];
    vitals: {
        bpSystolic: number;
        bpDiastolic: number;
        heartRate: number;
        temperature: number;
        weight: number; // kg
    };
    allergies: string[];
}

export interface PredictionResult {
    recommendedDrug: string;
    dosage: string;
    frequency: string;
    acquisitionMethod: 'White Bag' | 'Brown Bag' | 'Clear Bag';
    price: number;
    confidenceScore: number; // 0-100
    reasoning: string[];
    warnings: string[];
    contraindicated: boolean;
}
