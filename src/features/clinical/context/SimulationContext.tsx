
import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import { type PatientProfile, type PredictionResult } from '../types';
import { MEDICAL_DATABASE } from '../../../data/medicalDatabase';
import { useAuth } from '../../../context/AuthContext';
import { useApp } from '../../../context/AppContext';
import { FirestoreService } from '../../../core/services/firebase.service';
import type { SyntheticBundle } from '../../../utils/diseaseGenerator';
import { PatientService } from '../services/patient.service';
import { RecommendationEngine } from '../services/recommendation.engine';
import toast from 'react-hot-toast';
import { SecureLogger } from '../../../services/logger.service';


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
    manualOverride?: string; // Doctor's override
    assignedSiteId?: string;
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
    };
    startTraining: (patientCount: number) => Promise<void>;
    clearData: () => Promise<void>;
    addSimulationResult: (result: SimulationResult) => void;
    // predictTreatment removed for Strict Mode
    selectedPatient: SimulationResult | null;
    setSelectedPatient: (patient: SimulationResult | null) => void;
    viewPatientDetails: (patient: SimulationResult) => void;
    fetchSimulations: (pageSize?: number, startAfterDoc?: any, sortField?: string, sortDirection?: 'asc' | 'desc') => Promise<{ data: SimulationResult[], lastVisible: any }>;
    loading: boolean;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export function SimulationProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const { addPatient } = useApp();
    const [simulationResults, setSimulationResults] = useState<SimulationResult[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<SimulationResult | null>(null);

    // Persistent Training State
    const [isTraining, setIsTraining] = useState(false);
    const [progress, setProgress] = useState(0);
    const [eta, setEta] = useState<string>('--:--');
    const [logs, setLogs] = useState<string[]>([]);
    // Ref to track training state instantly inside async loops
    const isTrainingRef = useRef(false);

    const [stats, setStats] = useState({
        totalPatients: 0,
        conditionsIdentified: 0,
    });

    // Pagination State
    // const [lastDoc, setLastDoc] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const fetchCount = async () => {
        if (!user) return;
        try {
            const { getCountFromServer, collection } = await import('firebase/firestore');
            const { db } = await import('../../../core/config/firebase');
            const coll = collection(db, `users/${user.id}/simulations`);
            const snapshot = await getCountFromServer(coll);
            const count = snapshot.data().count;

            setStats(prev => ({
                ...prev,
                totalPatients: count
            }));
        } catch (error) {
            SecureLogger.error("Failed to fetch patient count:", error);
        }
    };

    // Initial Load
    useEffect(() => {
        if (user) {
            fetchCount();
            fetchSimulations(20); // Load initial page so UI isn't empty
        }
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
        isTrainingRef.current = true;
        setProgress(0);
        setEta('--:--');
        setLogs([
            'Initializing Synthea™ Patient Generator...',
            `Connecting to Live Data Stream (randomuser.me) to fetch ${patientCount} identities...`
        ]);

        try {
            let data: SyntheticBundle[] = [];

            // 1. Generate Synthetic Patients (New Case Flow)
            addLog(`Generating ${patientCount} new patient cases...`);
            data = await import('../../../utils/diseaseGenerator').then(m => m.DiseaseGenerator.generateBatch(patientCount, (pct) => {
                setProgress(pct * 0.4); // First 40% is generation
            }));

            addLog(`✓ Generated ${data.length} unique patient profiles.`);
            setProgress(40);

            // 2. AI Inference (V2 Clinical Model)
            addLog('Initializing V2 Clinical Model (TensorFlow.js)...');
            try {
                await RecommendationEngine.loadModel();
                addLog('✓ V2 Model Loaded. Running inference...');
            } catch (e) {
                addLog('❌ Model Load Failed. Aborting simulation (Strict Mode).');
                console.error(e);
                setIsTraining(false);
                isTrainingRef.current = false;
                toast.error('AI Model failed to load. Aborting.');
                return;
            }

            const inferenceStartTime = Date.now();
            const totalPatients = data.length;

            const enrichedData: { bundle: SyntheticBundle; prediction: any }[] = [];

            for (let i = 0; i < totalPatients; i++) {
                const bundle = data[i];
                const patient = bundle.patient;
                const birthDate = new Date(patient.birthDate);
                const age = new Date().getFullYear() - birthDate.getFullYear();

                const profile: PatientProfile = {
                    name: `${patient.name[0].given.join(' ')} ${patient.name[0].family}`,
                    age: age,
                    gender: patient.gender === 'male' ? 'Male' : 'Female',
                    conditionId: 'unknown',
                    medicalHistory: bundle.conditions.slice(1).map(c => c.code.coding[0].display),
                    vitals: {
                        weight: 70,
                        bpSystolic: 120,
                        bpDiastolic: 80,
                        heartRate: 72,
                        temperature: 98.6
                    },
                    allergies: []
                };

                // Async Prediction
                const recommendations = await RecommendationEngine.recommend(profile);
                const topRec = recommendations[0];

                enrichedData.push({
                    bundle,
                    prediction: topRec
                        ? {
                            recommendedDrug: topRec.drugName,
                            confidenceScore: topRec.confidenceScore,
                            reasoning: [topRec.reasoning],
                            contraindicated: false,
                            dosage: 'Standard',
                            frequency: 'Daily',
                            price: 10 + Math.random() * 50,
                            acquisitionMethod: 'Clear Bag'
                        }
                        : null
                });

                if (i % 50 === 0) {
                    const pct = 40 + ((i / totalPatients) * 40); // 40% -> 80%
                    setProgress(pct);
                    const elapsed = Date.now() - inferenceStartTime;
                    const rate = (i + 1) / elapsed;
                    const remaining = (totalPatients - i) / rate;
                    setEta(formatTime(remaining));
                    addLog(`Analyzed Patient ${i + 1}/${totalPatients} - Pred: ${topRec?.drugName || 'None'}`);
                }
            }

            addLog('Inference Complete. Syncing to database...');

            // 3. Save (Strict Mode: Fail if no prediction)
            await saveToDatabase(data, enrichedData);

            // Refresh
            fetchSimulations();
            fetchCount();

            setIsTraining(false);
            isTrainingRef.current = false;

        } catch (error: any) {
            setIsTraining(false);
            isTrainingRef.current = false;
            addLog(`ERROR: Workflow failed - ${error.message}`);
            toast.error(`Workflow failed: ${error.message}`);
            console.error(error);
        }
    };

    const saveToDatabase = async (data: SyntheticBundle[], enrichedPredictions?: any[]) => {
        if (!user) return;
        addLog('Syncing generated patients to database...');

        const conditionEntries = Object.entries(MEDICAL_DATABASE);
        const SAVE_BATCH_SIZE = 500;

        // Prepare all data first to avoid computation during write loop
        const allResults: SimulationResult[] = [];

        for (let i = 0; i < data.length; i++) {
            const bundle = data[i];
            const patient = bundle.patient;
            const conditionName = bundle.conditions[0]?.code.coding[0].display;
            const conditionEntry = conditionEntries.find(([_, c]) => c.name === conditionName);
            const conditionId = conditionEntry ? conditionEntry[0] : 'oncology_lung_nsclc';
            const birthDate = new Date(patient.birthDate);
            const age = new Date().getFullYear() - birthDate.getFullYear();

            // Generate Biometrics
            const weight = 45 + Math.random() * 75;
            const height = 150 + Math.random() * 45;
            const bsa = 0.007184 * Math.pow(weight, 0.425) * Math.pow(height, 0.725);
            const biometrics = {
                weight: parseFloat(weight.toFixed(1)),
                height: parseFloat(height.toFixed(0)),
                bsa: parseFloat(bsa.toFixed(2))
            };

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
                    weight: biometrics.weight
                },
                allergies: []
            };

            // Use Enriched V2 Prediction if available, else Fallback
            let prediction;
            if (enrichedPredictions && enrichedPredictions[i] && enrichedPredictions[i].prediction) {
                prediction = enrichedPredictions[i].prediction;
            } else {
                // Strict Mode: No fallback
                throw new Error(`Strict Mode Error: No AI prediction for patient index ${i}`);
            }

            // Deterministic Location Assignment
            const location = PatientService.assignLocation(conditionName || 'General');

            allResults.push({
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
                rawBundle: bundle,
                // @ts-ignore - biometrics prop might be dynamic
                biometrics: biometrics,
                assignedSiteId: location.siteId,
                assignedDepartmentId: location.assignedDepartmentId
            });
        }

        const { writeBatch, doc } = await import('firebase/firestore');
        const { db } = await import('../../../core/config/firebase');

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

            setStats({ totalPatients: 0, conditionsIdentified: 0 });
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

        // SYNC TO GLOBAL APP CONTEXT (Clinical View)
        const newPatient = {
            id: result.id,
            mrn: `MRN-${Math.floor(10000 + Math.random() * 90000)}`,
            name: result.patientName,
            dateOfBirth: new Date(new Date().getFullYear() - (result.profile?.age || 45), 0, 1).toISOString().split('T')[0],
            gender: result.profile?.gender.toLowerCase() || 'male',
            diagnosis: result.condition,
            type: 'adult',
            attendingPhysician: 'Dr. Auto',
            treatmentSchedule: []
        };

        const weight = 50 + Math.random() * 70;
        const height = 150 + Math.random() * 40;
        const bsa = 0.007184 * Math.pow(weight, 0.425) * Math.pow(height, 0.725);

        // @ts-ignore - Extending the object dynamically
        newPatient.biometrics = {
            weight: parseFloat(weight.toFixed(1)),
            height: parseFloat(height.toFixed(0)),
            bsa: parseFloat(bsa.toFixed(2))
        };

        addPatient(newPatient);
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
            // predictTreatment removed
            selectedPatient,
            setSelectedPatient,
            viewPatientDetails,
            fetchSimulations,
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
