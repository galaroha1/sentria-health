export interface Treatment {
    id: string;
    date: string; // ISO Date String
    drugName: string;
    ndc: string;
    status: 'scheduled' | 'completed' | 'cancelled';
    dose: string;
    notes?: string;
}

export interface Patient {
    id: string;
    mrn: string; // Medical Record Number
    name: string;
    dateOfBirth: string;
    gender: 'male' | 'female' | 'other';
    diagnosis: string;
    type: 'pediatric' | 'adult' | 'geriatric' | 'oncology';
    attendingPhysician: string;
    treatmentSchedule: Treatment[];
}
