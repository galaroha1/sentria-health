import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { addDays } from 'date-fns';
import { predictTreatment, type PatientProfile, type PredictionResult } from '../utils/aiPrediction';
import { MEDICAL_DATABASE } from '../data/medicalDatabase';
import { useAuth } from './AuthContext';
import { FirestoreService } from '../services/firebase.service';

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
    profile?: PatientProfile; // Detailed profile
    aiPrediction?: PredictionResult; // AI analysis
}

interface SimulationContextType {
    simulationResults: SimulationResult[];
    isSimulating: boolean;
    runSimulation: () => void;
    addSimulationResult: (result: SimulationResult) => void;
    predictTreatment: (profile: PatientProfile) => PredictionResult;
    scanningPatient: string | null;
    selectedPatient: SimulationResult | null;
    setSelectedPatient: (patient: SimulationResult | null) => void;
    viewPatientDetails: (patient: SimulationResult) => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

const MOCK_NAMES = [
    "Sarah Connor", "James Howlett", "Wade Wilson", "Jean Grey", "Tony Stark",
    "Bruce Banner", "Steve Rogers", "Natasha Romanoff", "Peter Parker", "Stephen Strange"
];

export function SimulationProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [simulationResults, setSimulationResults] = useState<SimulationResult[]>([]);
    const [isSimulating, setIsSimulating] = useState(false);
    const [scanningPatient, setScanningPatient] = useState<string | null>(null);
    const [selectedPatient, setSelectedPatient] = useState<SimulationResult | null>(null);

    // Subscribe to Firestore simulation results
    useEffect(() => {
        if (!user) {
            setSimulationResults([]);
            return;
        }

        const unsubscribe = FirestoreService.subscribe<any>(`users/${user.id}/simulations`, (data) => {
            // Convert Firestore timestamps/strings back to Date objects
            const parsedResults = data.map(item => ({
                ...item,
                date: item.date?.toDate ? item.date.toDate() : new Date(item.date)
            })) as SimulationResult[];

            // Sort by date desc
            parsedResults.sort((a, b) => b.date.getTime() - a.date.getTime());

            setSimulationResults(parsedResults);
        });
        return () => unsubscribe();
    }, [user]);

    const generateRandomProfile = (name: string): PatientProfile => {
        const conditions = Object.keys(MEDICAL_DATABASE);
        const randomConditionId = conditions[Math.floor(Math.random() * conditions.length)];

        return {
            name,
            age: 20 + Math.floor(Math.random() * 60),
            gender: Math.random() > 0.5 ? 'Male' : 'Female',
            conditionId: randomConditionId,
            medicalHistory: Math.random() > 0.7 ? ['Hypertension'] : [],
            vitals: {
                bpSystolic: 110 + Math.floor(Math.random() * 40),
                bpDiastolic: 70 + Math.floor(Math.random() * 20),
                heartRate: 60 + Math.floor(Math.random() * 40),
                temperature: 97 + Math.random() * 2,
                weight: 50 + Math.floor(Math.random() * 50)
            },
            allergies: Math.random() > 0.8 ? ['Penicillin'] : []
        };
    };

    const runSimulation = () => {
        if (!user) return; // Require auth

        setIsSimulating(true);
        // We don't clear results immediately anymore, we append or replace?
        // The prompt says "saves all of the previous changes". So maybe we append?
        // But the previous logic cleared it: `setSimulationResults([])`.
        // I'll keep the logic of generating a batch, but I'll ADD them to Firestore.
        // If the user wants to "reset", they can maybe delete? 
        // For now, I'll just add new ones.

        let patientIndex = 0;
        const interval = setInterval(() => {
            setScanningPatient(MOCK_NAMES[patientIndex]);
            patientIndex = (patientIndex + 1) % MOCK_NAMES.length;
        }, 200);

        // Simulate processing time
        setTimeout(async () => {
            clearInterval(interval);
            setScanningPatient(null);

            const today = new Date();
            const newResults: SimulationResult[] = MOCK_NAMES.slice(0, 6).map((name, index) => {
                const profile = generateRandomProfile(name);
                const prediction = predictTreatment(profile);
                const condition = MEDICAL_DATABASE[profile.conditionId];

                return {
                    id: `sim-${Date.now()}-${index}`, // Unique ID
                    date: addDays(today, index + 1),
                    timeStr: `${9 + index}:00 AM`,
                    patientName: name,
                    condition: condition.name,
                    visitType: 'Consultation',
                    location: 'Main Clinic',
                    drug: prediction.recommendedDrug,
                    acquisitionMethod: prediction.acquisitionMethod,
                    status: prediction.contraindicated ? 'Transport Needed' : 'Scheduled',
                    price: prediction.price,
                    profile: profile,
                    aiPrediction: prediction
                };
            });

            // Save to Firestore
            for (const result of newResults) {
                await FirestoreService.set(`users/${user.id}/simulations`, result.id, {
                    ...result,
                    date: result.date.toISOString() // Store as string for simplicity or let Firestore handle Date
                });
            }

            setIsSimulating(false);
        }, 3000);
    };

    const addSimulationResult = async (result: SimulationResult) => {
        if (!user) return;
        await FirestoreService.set(`users/${user.id}/simulations`, result.id, {
            ...result,
            date: result.date.toISOString()
        });
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
            predictTreatment,
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
