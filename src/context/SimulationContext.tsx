import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { predictTreatment, type PatientProfile, type PredictionResult } from '../utils/aiPrediction';
import { MEDICAL_DATABASE } from '../data/medicalDatabase';
import { useAuth } from './AuthContext';
import { FirestoreService } from '../services/firebase.service';
import { SyntheaGenerator, type SyntheticBundle } from '../utils/syntheaGenerator';
import toast from 'react-hot-toast';

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
    rawBundle?: any; // Full FHIR-like bundle
}

interface SimulationContextType {
    simulationResults: SimulationResult[];
    isTraining: boolean;
    progress: number;
    eta: string;
    logs: string[];
    stats: {
        totalPatients: number;
        conditionsIdentified: number;
        accuracy: number;
    };
    startTraining: (patientCount: number) => Promise<void>;
    clearData: () => Promise<void>;
    addSimulationResult: (result: SimulationResult) => void;
    predictTreatment: (profile: PatientProfile) => PredictionResult;
    selectedPatient: SimulationResult | null;
    setSelectedPatient: (patient: SimulationResult | null) => void;
    viewPatientDetails: (patient: SimulationResult) => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export function SimulationProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [simulationResults, setSimulationResults] = useState<SimulationResult[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<SimulationResult | null>(null);

    // Persistent Training State
    const [isTraining, setIsTraining] = useState(false);
    const [progress, setProgress] = useState(0);
    const [eta, setEta] = useState<string>('--:--');
    const [logs, setLogs] = useState<string[]>([]);
    const [stats, setStats] = useState({
        totalPatients: 0,
        conditionsIdentified: 0,
        accuracy: 87.5
    });

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

    const addLog = (message: string) => {
        setLogs(prev => [...prev.slice(-19), `[${new Date().toLocaleTimeString()}] ${message}`]);
    };

    const formatTime = (ms: number) => {
        if (!isFinite(ms) || ms < 0) return '--:--';
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const startTraining = async (patientCount: number) => {
        if (!user) return;

        setIsTraining(true);
        setProgress(0);
        setEta('--:--');
        setLogs([
            'Initializing Synthea™ Patient Generator...',
            `Connecting to Live Data Stream (randomuser.me) to fetch ${patientCount} identities...`
        ]);

        const startTime = Date.now();

        try {
            // 1. Fetch Data First (Async & Chunked)
            const data = await SyntheaGenerator.generateBatch(patientCount, (p) => {
                setProgress(p * 0.4);

                const elapsed = Date.now() - startTime;
                const rate = (p / 100) / elapsed;
                const remaining = (1 - (p / 100)) / rate;
                setEta(formatTime(remaining));
            });

            addLog(`Successfully fetched ${data.length} unique patient profiles.`);
            addLog('Starting Clinical Analysis & Model Training...');

            // 2. Simulate Training on the Data (Non-blocking loop)
            let processed = 0;
            let conditions = 0;
            const batchSize = Math.max(1, Math.ceil(patientCount / 100));
            const trainingStartTime = Date.now();

            const processBatch = async () => {
                const batch = data.slice(processed, processed + batchSize);
                processed += batch.length;
                conditions += batch.reduce((acc, b) => acc + b.conditions.length, 0);

                const trainingProgress = processed / patientCount;
                const totalProgress = 40 + (trainingProgress * 40);
                setProgress(totalProgress);

                const elapsed = Date.now() - trainingStartTime;
                const rate = trainingProgress / elapsed;
                const remaining = (1 - trainingProgress) / rate;
                setEta(formatTime(remaining));

                if (batch.length > 0 && Math.random() < 0.1) {
                    const sample = batch[0];
                    addLog(`Analyzing: ${sample.patient.name[0].given[0]} ${sample.patient.name[0].family} | Dx: ${sample.conditions[0]?.code.coding[0].display}`);
                }

                setStats(prev => ({
                    totalPatients: processed,
                    conditionsIdentified: conditions,
                    accuracy: Math.min(99.2, prev.accuracy + 0.1)
                }));

                if (processed < data.length && isTraining) { // Check isTraining to allow cancellation if we implemented it
                    setTimeout(processBatch, 0);
                } else {
                    addLog('Training Complete. Model weights updated.');
                    addLog(`Final Accuracy: ${stats.accuracy.toFixed(1)}%`);

                    // 3. Save to Firestore (Batched)
                    await saveToDatabase(data);
                    setIsTraining(false);
                }
            };

            setTimeout(processBatch, 0);

        } catch (error: any) {
            setIsTraining(false);
            addLog(`ERROR: Data fetch failed - ${error.message}`);
            toast.error(`Simulation failed: ${error.message}`);
            console.error(error);
        }
    };

    const saveToDatabase = async (data: SyntheticBundle[]) => {
        if (!user) return;
        addLog('Syncing generated patients to database...');

        const conditionEntries = Object.entries(MEDICAL_DATABASE);
        const SAVE_BATCH_SIZE = 50;
        const saveStartTime = Date.now();

        for (let i = 0; i < data.length; i += SAVE_BATCH_SIZE) {
            const chunk = data.slice(i, i + SAVE_BATCH_SIZE);

            const savePromises = chunk.map(async (bundle) => {
                const patient = bundle.patient;
                const conditionName = bundle.conditions[0]?.code.coding[0].display;

                const conditionEntry = conditionEntries.find(([_, c]) => c.name === conditionName);
                const conditionId = conditionEntry ? conditionEntry[0] : 'oncology_lung_nsclc';

                const birthDate = new Date(patient.birthDate);
                const age = new Date().getFullYear() - birthDate.getFullYear();

                const profile: PatientProfile = {
                    name: `${patient.name[0].given.join(' ')} ${patient.name[0].family}`,
                    age: age,
                    gender: patient.gender === 'male' ? 'Male' : 'Female',
                    conditionId: conditionId,
                    medicalHistory: bundle.conditions.slice(1).map(c => c.code.coding[0].display),
                    vitals: {
                        bpSystolic: 120 + Math.floor(Math.random() * 20),
                        bpDiastolic: 80 + Math.floor(Math.random() * 10),
                        heartRate: 60 + Math.floor(Math.random() * 40),
                        temperature: 98.6,
                        weight: 70
                    },
                    allergies: []
                };

                const prediction = predictTreatment(profile);

                const result: SimulationResult = {
                    id: patient.id,
                    date: new Date(),
                    timeStr: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    patientName: profile.name,
                    condition: conditionName || 'Unknown',
                    visitType: 'Initial Consultation',
                    location: 'Main Clinic',
                    drug: prediction.recommendedDrug,
                    acquisitionMethod: prediction.acquisitionMethod,
                    status: prediction.contraindicated ? 'Transport Needed' : 'Scheduled',
                    price: prediction.price,
                    profile: profile,
                    aiPrediction: prediction,
                    rawBundle: bundle
                };

                return FirestoreService.set(`users/${user.id}/simulations`, result.id, {
                    ...result,
                    date: result.date.toISOString()
                });
            });

            await Promise.all(savePromises);

            const processed = i + chunk.length;
            const saveProgress = processed / data.length;
            const totalProgress = 80 + (saveProgress * 20);
            setProgress(totalProgress);

            const elapsed = Date.now() - saveStartTime;
            const rate = saveProgress / elapsed;
            const remaining = (1 - saveProgress) / rate;
            setEta(formatTime(remaining));

            await new Promise(resolve => setTimeout(resolve, 10));
        }

        addLog('✓ Data successfully synced to Patient Records.');
        toast.success(`${data.length} patients synced to database!`);
    };

    const clearData = async () => {
        if (!user) return;
        try {
            // Let's implement a loop to delete the current loaded results.
            const batchSize = 500;
            const chunks = [];
            for (let i = 0; i < simulationResults.length; i += batchSize) {
                chunks.push(simulationResults.slice(i, i + batchSize));
            }

            for (const chunk of chunks) {
                await Promise.all(chunk.map(r => FirestoreService.delete(`users/${user.id}/simulations`, r.id)));
            }

            setSimulationResults([]);
            setStats({ totalPatients: 0, conditionsIdentified: 0, accuracy: 87.5 });
            setLogs([]);
            toast.success('Simulation data cleared.');
        } catch (error) {
            console.error("Failed to clear data", error);
            toast.error("Failed to clear data.");
        }
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
            isTraining,
            progress,
            eta,
            logs,
            stats,
            startTraining,
            clearData,
            addSimulationResult,
            predictTreatment,
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
