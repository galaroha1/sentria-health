import React, { createContext, useContext, useState, ReactNode } from 'react';
import { addDays, addMonths, subMonths, addWeeks, subWeeks } from 'date-fns';

export interface SimulationResult {
    id: string;
    date: Date;
    timeStr: string;
    patientName: string;
    condition: string;
    visitType: string;
    location: string;
    drug: string;
    acquisitionMethod: 'White Bag' | 'Brown Bag' | 'Clear Bag';
    status: 'Scheduled' | 'Transport Needed' | 'In Stock';
    price: number;
}

interface SimulationContextType {
    simulationResults: SimulationResult[];
    isSimulating: boolean;
    runSimulation: () => void;
    addSimulationResult: (result: SimulationResult) => void;
    predictDrug: (condition: string, visitType: string) => { drug: string; price: number; acquisitionMethod: 'White Bag' | 'Brown Bag' | 'Clear Bag' };
    scanningPatient: string | null;
    selectedPatient: SimulationResult | null;
    setSelectedPatient: (patient: SimulationResult | null) => void;
    viewPatientDetails: (patient: SimulationResult) => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

const MOCK_PATIENTS = [
    "Sarah Connor - Oncology",
    "James Howlett - Rheumatology",
    "Wade Wilson - Immunology",
    "Jean Grey - Neurology",
    "Tony Stark - Cardiology",
    "Bruce Banner - Psychiatry",
    "Steve Rogers - Geriatrics",
    "Natasha Romanoff - Orthopedics",
    "Peter Parker - Pediatrics",
    "Stephen Strange - Surgery"
];

export function SimulationProvider({ children }: { children: ReactNode }) {
    const [simulationResults, setSimulationResults] = useState<SimulationResult[]>([]);
    const [isSimulating, setIsSimulating] = useState(false);
    const [scanningPatient, setScanningPatient] = useState<string | null>(null);
    const [selectedPatient, setSelectedPatient] = useState<SimulationResult | null>(null);

    const runSimulation = () => {
        setIsSimulating(true);
        setSimulationResults([]); // Clear previous results

        let patientIndex = 0;
        const interval = setInterval(() => {
            setScanningPatient(MOCK_PATIENTS[patientIndex]);
            patientIndex = (patientIndex + 1) % MOCK_PATIENTS.length;
        }, 300);

        // Simulate processing time
        setTimeout(() => {
            clearInterval(interval);
            setScanningPatient(null);

            const today = new Date();
            const results: SimulationResult[] = [
                {
                    id: 'sim-1',
                    date: addDays(today, 1),
                    timeStr: '09:00 AM',
                    patientName: 'Sarah Connor',
                    condition: 'Oncology - Cycle 3',
                    visitType: 'Infusion Therapy',
                    location: 'Infusion Center A',
                    drug: 'Keytruda (Pembrolizumab)',
                    acquisitionMethod: 'White Bag',
                    status: 'Transport Needed',
                    price: 4500
                },
                {
                    id: 'sim-2',
                    date: addDays(today, 1),
                    timeStr: '10:30 AM',
                    patientName: 'James Howlett',
                    condition: 'Rheumatoid Arthritis',
                    visitType: 'Follow-up Injection',
                    location: 'Clinic North',
                    drug: 'Remicade (Infliximab)',
                    acquisitionMethod: 'Clear Bag',
                    status: 'In Stock',
                    price: 1200
                },
                {
                    id: 'sim-3',
                    date: addDays(today, 2),
                    timeStr: '02:00 PM',
                    patientName: 'Wade Wilson',
                    condition: 'Immunotherapy',
                    visitType: 'New Patient Consult',
                    location: 'Main Hospital - Oncology',
                    drug: 'Opdivo (Nivolumab)',
                    acquisitionMethod: 'Brown Bag',
                    status: 'Scheduled',
                    price: 3800
                },
                {
                    id: 'sim-4',
                    date: addDays(today, 3),
                    timeStr: '08:45 AM',
                    patientName: 'Jean Grey',
                    condition: 'Multiple Sclerosis',
                    visitType: 'Routine Infusion',
                    location: 'Neurology Wing',
                    drug: 'Ocrevus (Ocrelizumab)',
                    acquisitionMethod: 'White Bag',
                    status: 'Transport Needed',
                    price: 15000
                },
                {
                    id: 'sim-5',
                    date: addDays(today, 5),
                    timeStr: '11:00 AM',
                    patientName: 'Tony Stark',
                    condition: 'Cardiac Support',
                    visitType: 'Check-up',
                    location: 'Cardiology Dept',
                    drug: 'Entresto',
                    acquisitionMethod: 'Clear Bag',
                    status: 'In Stock',
                    price: 450
                },
                {
                    id: 'sim-6',
                    date: addDays(today, 12),
                    timeStr: '01:30 PM',
                    patientName: 'Bruce Banner',
                    condition: 'Stress Management',
                    visitType: 'Therapy Session',
                    location: 'Psychiatry Wing',
                    drug: 'Lexapro',
                    acquisitionMethod: 'Brown Bag',
                    status: 'Scheduled',
                    price: 50
                }
            ];
            setSimulationResults(results);
            setIsSimulating(false);
        }, 3000);
    };

    const addSimulationResult = (result: SimulationResult) => {
        setSimulationResults(prev => [...prev, result]);
    };

    const predictDrug = (condition: string, visitType: string) => {
        // Simple mock logic for prediction
        const lowerCondition = condition.toLowerCase();

        if (lowerCondition.includes('oncology') || lowerCondition.includes('cancer')) {
            return { drug: 'Keytruda (Pembrolizumab)', price: 4500, acquisitionMethod: 'White Bag' as const };
        } else if (lowerCondition.includes('arthritis') || lowerCondition.includes('rheumatology')) {
            return { drug: 'Remicade (Infliximab)', price: 1200, acquisitionMethod: 'Clear Bag' as const };
        } else if (lowerCondition.includes('sclerosis') || lowerCondition.includes('neurology')) {
            return { drug: 'Ocrevus (Ocrelizumab)', price: 15000, acquisitionMethod: 'White Bag' as const };
        } else if (lowerCondition.includes('cardio') || lowerCondition.includes('heart')) {
            return { drug: 'Entresto', price: 450, acquisitionMethod: 'Clear Bag' as const };
        } else {
            // Default random fallback
            const drugs = [
                { drug: 'Opdivo (Nivolumab)', price: 3800, acquisitionMethod: 'Brown Bag' as const },
                { drug: 'Humira (Adalimumab)', price: 2500, acquisitionMethod: 'Clear Bag' as const },
                { drug: 'Stelara (Ustekinumab)', price: 11000, acquisitionMethod: 'White Bag' as const }
            ];
            return drugs[Math.floor(Math.random() * drugs.length)];
        }
    };

    const viewPatientDetails = (patient: SimulationResult) => {
        setSelectedPatient(patient);
    };

    return (
        <SimulationContext.Provider value={{
            simulationResults,
            isSimulating,
            runSimulation,
            addSimulationResult,
            predictDrug,
            scanningPatient,
            selectedPatient,
            setSelectedPatient,
            viewPatientDetails
        }}>
            {children}
        </SimulationContext.Provider>
    );
}

export function useSimulation() {
    const context = useContext(SimulationContext);
    if (context === undefined) {
        throw new Error('useSimulation must be used within a SimulationProvider');
    }
    return context;
}
