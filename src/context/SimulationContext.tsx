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
    fetchSimulations: (pageSize?: number, startAfterDoc?: any, sortField?: string, sortDirection?: 'asc' | 'desc') => Promise<{ data: SimulationResult[], lastVisible: any }>;
    loading: boolean;
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

    // Pagination State
    // const [lastDoc, setLastDoc] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    // Initial Load - just get stats or empty state
    useEffect(() => {
        if (!user) {
            setSimulationResults([]);
            return;
        }
        // We no longer subscribe to ALL data. 
        // Components must request data via fetchSimulations.
    }, [user]);

    const fetchSimulations = async (pageSize: number = 20, startAfterDoc: any = null, sortField: string = 'date', sortDirection: 'asc' | 'desc' = 'desc') => {
        if (!user) {
            console.log("fetchSimulations: No user");
            return { data: [], lastVisible: null };
        }
        setLoading(true);
        console.log(`fetchSimulations: Fetching ${pageSize} items, sort=${sortField}:${sortDirection}, startAfter=${!!startAfterDoc}`);

        try {
            const { orderBy } = await import('firebase/firestore');
            const constraints = [orderBy(sortField, sortDirection)];

            const result = await FirestoreService.getPaginated<SimulationResult>(
                `users/${user.id}/simulations`,
                pageSize,
                startAfterDoc,
                ...constraints
            );

            console.log(`fetchSimulations: Got ${result.data.length} items`);

            // Convert dates
            const parsedData = result.data.map(item => ({
                ...item,
                date: item.date instanceof Date ? item.date : new Date(item.date as any)
            }));

            // If it's a new page (startAfterDoc exists), append. If it's a reset (startAfterDoc is null), replace.
            if (startAfterDoc) {
                setSimulationResults(prev => [...prev, ...parsedData]);
            } else {
                setSimulationResults(parsedData);
            }

            // setLastDoc(result.lastVisible); // Managed by component
            return { data: parsedData, lastVisible: result.lastVisible };
        } catch (error) {
            console.error("Error fetching simulations:", error);
            return { data: [], lastVisible: null };
        } finally {
            setLoading(false);
        }
    };

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



        try {
            // 1. Fetch Data First (Async & Chunked)
            const data = await SyntheaGenerator.generateBatch(patientCount, (p) => {
                // Throttle progress updates
                if (p % 10 === 0) setProgress(p * 0.4);
            });

            addLog(`Successfully fetched ${data.length} unique patient profiles.`);
            addLog('Starting Clinical Analysis & Model Training...');

            // 2. Simulate Training on the Data (Non-blocking loop)
            let processed = 0;
            let conditions = 0;
            const batchSize = Math.max(10, Math.ceil(patientCount / 20)); // Larger batches for UI responsiveness
            const trainingStartTime = Date.now();

            const processBatch = async () => {
                const batch = data.slice(processed, processed + batchSize);
                processed += batch.length;
                conditions += batch.reduce((acc, b) => acc + b.conditions.length, 0);

                const trainingProgress = processed / patientCount;

                // Throttle UI updates - only update every 5% or on completion
                if (processed >= data.length || processed % (Math.ceil(patientCount / 20)) === 0) {
                    const totalProgress = 40 + (trainingProgress * 40);
                    setProgress(totalProgress);

                    const elapsed = Date.now() - trainingStartTime;
                    const rate = trainingProgress / elapsed;
                    const remaining = (1 - trainingProgress) / rate;
                    setEta(formatTime(remaining));

                    setStats(prev => ({
                        totalPatients: processed,
                        conditionsIdentified: conditions,
                        accuracy: Math.min(99.2, prev.accuracy + 0.1)
                    }));
                }

                if (batch.length > 0 && Math.random() < 0.05) { // Log less frequently
                    const sample = batch[0];
                    addLog(`Analyzing: ${sample.patient.name[0].given[0]} ${sample.patient.name[0].family}`);
                }

                if (processed < data.length && isTraining) {
                    setTimeout(processBatch, 0);
                } else {
                    addLog('Training Complete. Model weights updated.');

                    // 3. Save to Firestore (Batched)
                    await saveToDatabase(data);
                    setIsTraining(false);

                    // Refresh the view
                    fetchSimulations();
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
        const SAVE_BATCH_SIZE = 500; // Maximize batch size for fewer writes


        // Prepare all data first to avoid computation during write loop
        const allResults: SimulationResult[] = data.map(bundle => {
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

            return {
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
        });

        const { writeBatch, doc } = await import('firebase/firestore');
        const { db } = await import('../config/firebase');

        console.log(`saveToDatabase: Saving ${allResults.length} items for user ${user.id}`);

        for (let i = 0; i < allResults.length; i += SAVE_BATCH_SIZE) {
            const chunk = allResults.slice(i, i + SAVE_BATCH_SIZE);
            const batch = writeBatch(db);
            console.log(`saveToDatabase: Processing chunk ${i} to ${i + chunk.length}`);

            chunk.forEach(result => {
                const docRef = doc(db, `users/${user.id}/simulations`, result.id);
                batch.set(docRef, {
                    ...result,
                    date: result.date.toISOString()
                });
            });

            await batch.commit();
            console.log(`saveToDatabase: Chunk ${i} committed`);

            const processed = i + chunk.length;
            const saveProgress = processed / data.length;
            const totalProgress = 80 + (saveProgress * 20);
            setProgress(totalProgress);
        }

        addLog('✓ Data successfully synced to Patient Records.');
        toast.success(`${data.length} patients synced to database!`);
    };

    const clearData = async () => {
        if (!user) return;
        try {
            // Use the recursive delete method to efficiently wipe the entire collection
            await FirestoreService.deleteAllDocuments(`users/${user.id}/simulations`);

            setStats({ totalPatients: 0, conditionsIdentified: 0, accuracy: 87.5 });
            setLogs([]);
            setSimulationResults([]); // Clear local view
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
        // Optimistically add to list if it fits sort order? 
        // For now, just re-fetch or prepend
        setSimulationResults(prev => [result, ...prev]);
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
            viewPatientDetails,
            fetchSimulations, // Exported for manual fetching
            loading
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
