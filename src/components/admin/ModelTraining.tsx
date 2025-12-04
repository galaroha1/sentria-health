import { useState, useEffect, useRef } from 'react';
import { SyntheaGenerator, type SyntheticBundle } from '../../utils/syntheaGenerator';
import { Brain, Database, Play, CheckCircle, Activity, Download } from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';
import { MEDICAL_DATABASE } from '../../data/medicalDatabase';
import { predictTreatment, type PatientProfile } from '../../utils/aiPrediction';
import toast, { Toaster } from 'react-hot-toast';

export function ModelTraining() {
    const [isTraining, setIsTraining] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [progress, setProgress] = useState(0);
    const [eta, setEta] = useState<string>('--:--');
    const [patientCount, setPatientCount] = useState(50);
    const [logs, setLogs] = useState<string[]>([]);
    const [stats, setStats] = useState({
        totalPatients: 0,
        conditionsIdentified: 0,
        accuracy: 87.5 // Initial baseline
    });
    const [generatedData, setGeneratedData] = useState<SyntheticBundle[]>([]);
    const logsEndRef = useRef<HTMLDivElement>(null);
    const { addSimulationResult } = useSimulation();
    const [isSaving, setIsSaving] = useState(false);

    const scrollToBottom = () => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [logs]);

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

    const startTraining = async () => {
        setIsTraining(true);
        setIsFetching(true);
        setGeneratedData([]);
        setProgress(0);
        setEta('--:--');
        setLogs([
            'Initializing Synthea™ Patient Generator...',
            `Connecting to Live Data Stream (randomuser.me) to fetch ${patientCount} identities...`
        ]);

        const startTime = Date.now();

        try {
            // 1. Fetch Data First (Async & Chunked)
            // Progress 0-40%
            const data = await SyntheaGenerator.generateBatch(patientCount, (p) => {
                setProgress(p * 0.4);

                // Estimate time based on generation speed
                const elapsed = Date.now() - startTime;
                const rate = (p / 100) / elapsed; // progress per ms
                const remaining = (1 - (p / 100)) / rate;
                setEta(formatTime(remaining));
            });

            setGeneratedData(data);
            setIsFetching(false);
            addLog(`Successfully fetched ${data.length} unique patient profiles.`);
            addLog('Starting Clinical Analysis & Model Training...');

            // 2. Simulate Training on the Data (Non-blocking loop)
            // Progress 40-80%
            let processed = 0;
            let conditions = 0;
            const batchSize = Math.max(1, Math.ceil(patientCount / 100)); // Smaller batches for smoother UI
            const trainingStartTime = Date.now();

            const processBatch = async () => {
                const batch = data.slice(processed, processed + batchSize);
                processed += batch.length;
                conditions += batch.reduce((acc, b) => acc + b.conditions.length, 0);

                const trainingProgress = processed / patientCount;
                const totalProgress = 40 + (trainingProgress * 40); // Map to 40-80%
                setProgress(totalProgress);

                // Update ETA
                const elapsed = Date.now() - trainingStartTime;
                const rate = trainingProgress / elapsed;
                const remaining = (1 - trainingProgress) / rate;
                setEta(formatTime(remaining));

                // Log a sample occasionally
                if (batch.length > 0 && Math.random() < 0.1) {
                    const sample = batch[0];
                    addLog(`Analyzing: ${sample.patient.name[0].given[0]} ${sample.patient.name[0].family} | Dx: ${sample.conditions[0]?.code.coding[0].display}`);
                }

                setStats(prev => ({
                    totalPatients: processed,
                    conditionsIdentified: conditions,
                    accuracy: Math.min(99.2, prev.accuracy + 0.1)
                }));

                if (processed < data.length && isTraining) {
                    // Schedule next batch
                    setTimeout(processBatch, 0);
                } else {
                    // Training Complete
                    addLog('Training Complete. Model weights updated.');
                    addLog(`Final Accuracy: ${stats.accuracy.toFixed(1)}%`);

                    // 3. Save to Firestore / Context (Batched)
                    // Progress 80-100%
                    await saveToDatabase(data);
                    setIsTraining(false);
                }
            };

            // Start the loop
            setTimeout(processBatch, 0);

        } catch (error: any) {
            setIsFetching(false);
            setIsTraining(false);
            setIsSaving(false);
            addLog(`ERROR: Data fetch failed - ${error.message}`);
            toast.error(`Simulation failed: ${error.message}`);
            console.error(error);
        }
    };

    const saveToDatabase = async (data: SyntheticBundle[]) => {
        setIsSaving(true);
        addLog('Syncing generated patients to database...');

        const conditionEntries = Object.entries(MEDICAL_DATABASE);
        const SAVE_BATCH_SIZE = 50; // Save 50 at a time to avoid network congestion
        const saveStartTime = Date.now();

        for (let i = 0; i < data.length; i += SAVE_BATCH_SIZE) {
            const chunk = data.slice(i, i + SAVE_BATCH_SIZE);

            const savePromises = chunk.map(async (bundle) => {
                const patient = bundle.patient;
                const conditionName = bundle.conditions[0]?.code.coding[0].display;

                // Reverse map condition name to ID
                const conditionEntry = conditionEntries.find(([_, c]) => c.name === conditionName);
                const conditionId = conditionEntry ? conditionEntry[0] : 'oncology_lung_nsclc'; // Fallback

                // Create Profile
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

                return addSimulationResult({
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
                    // @ts-ignore - We'll add this field to the type definition next
                    rawBundle: bundle
                });
            });

            await Promise.all(savePromises);

            // Update Progress & ETA
            const processed = i + chunk.length;
            const saveProgress = processed / data.length;
            const totalProgress = 80 + (saveProgress * 20); // Map to 80-100%
            setProgress(totalProgress);

            const elapsed = Date.now() - saveStartTime;
            const rate = saveProgress / elapsed;
            const remaining = (1 - saveProgress) / rate;
            setEta(formatTime(remaining));

            // Yield to UI
            await new Promise(resolve => setTimeout(resolve, 10));
        }

        setIsSaving(false);
        addLog('✓ Data successfully synced to Patient Records.');
        toast.success(`${data.length} patients synced to database!`, {
            duration: 5000,
            position: 'bottom-right',
            style: {
                background: '#10B981',
                color: '#fff',
                fontWeight: 'bold',
            },
            icon: '🚀'
        });
    };

    const downloadData = () => {
        const jsonString = JSON.stringify(generatedData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `synthea_dataset_${new Date().toISOString()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        addLog('Dataset downloaded successfully.');
        toast.success('Dataset downloaded!');
    };

    return (
        <div className="h-full flex flex-col gap-6">
            <Toaster />
            {/* Header */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Control Panel */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                                    <Brain className="h-6 w-6 text-white" />
                                </div>
                                <h2 className="text-xl font-bold">AI Model Training</h2>
                            </div>
                            <p className="text-indigo-100 text-sm">Synthea™ Data Engine & Predictive Modeling</p>
                        </div>

                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-3">
                                    Simulation Parameters
                                </label>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-sm font-medium text-slate-700">Target Patient Count</label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="10000"
                                                    value={patientCount}
                                                    onChange={(e) => setPatientCount(Math.max(1, Math.min(10000, Number(e.target.value))))}
                                                    className="w-20 px-2 py-1 text-right text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                />
                                                <span className="text-sm font-bold text-indigo-600">patients</span>
                                            </div>
                                        </div>
                                        <input
                                            type="range"
                                            min="10"
                                            max="10000"
                                            step="10"
                                            value={patientCount}
                                            onChange={(e) => setPatientCount(Number(e.target.value))}
                                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                        />
                                        <div className="flex justify-between text-xs text-slate-500 mt-2">
                                            <span>10</span>
                                            <span>10,000</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                data-testid="start-simulation-btn"
                                onClick={startTraining}
                                disabled={isTraining || isFetching || isSaving}
                                className={`w-full group relative flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-bold text-white shadow-lg transition-all duration-300 ${isTraining || isFetching || isSaving
                                    ? 'bg-slate-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-indigo-500/30 hover:-translate-y-0.5'
                                    }`}
                            >
                                {isFetching ? (
                                    <>
                                        <Activity className="h-5 w-5 animate-spin" />
                                        <span>Fetching Live Data...</span>
                                    </>
                                ) : isTraining ? (
                                    <>
                                        <Activity className="h-5 w-5 animate-spin" />
                                        <span>Training Model...</span>
                                    </>
                                ) : isSaving ? (
                                    <>
                                        <Database className="h-5 w-5 animate-bounce" />
                                        <span>Syncing Database...</span>
                                    </>
                                ) : (
                                    <>
                                        <Play className="h-5 w-5 fill-current" />
                                        <span>Start Simulation</span>
                                    </>
                                )}
                            </button>

                            {generatedData.length > 0 && !isTraining && !isSaving && (
                                <div className="space-y-3">
                                    <button
                                        onClick={downloadData}
                                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 transition-all"
                                    >
                                        <Download className="h-5 w-5" />
                                        Download Dataset ({generatedData.length})
                                    </button>

                                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
                                        <div className="flex items-center justify-center gap-2 text-emerald-700 font-bold mb-1">
                                            <CheckCircle className="h-5 w-5" />
                                            <span>Sync Complete</span>
                                        </div>
                                        <p className="text-xs text-emerald-600 mb-3">
                                            {generatedData.length} patients added to live records.
                                        </p>
                                        <a
                                            href="/sentria-health/inventory"
                                            className="block w-full py-2 px-4 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors"
                                        >
                                            View Patient Data
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 gap-4">
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-indigo-100 transition-all">
                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Dataset Size</p>
                                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalPatients.toLocaleString()}</p>
                            </div>
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                                <Database className="h-6 w-6" />
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-indigo-100 transition-all">
                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Data Points</p>
                                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.conditionsIdentified.toLocaleString()}</p>
                            </div>
                            <div className="p-3 bg-orange-50 text-orange-600 rounded-lg group-hover:bg-orange-100 transition-colors">
                                <Activity className="h-6 w-6" />
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-indigo-100 transition-all">
                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Model Accuracy</p>
                                <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.accuracy.toFixed(1)}%</p>
                            </div>
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-100 transition-colors">
                                <CheckCircle className="h-6 w-6" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Activity Stream */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden flex flex-col h-[600px] relative">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                    <Activity className="h-4 w-4" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900">Live Activity Stream</h3>
                                    <p className="text-xs text-slate-500">Real-time simulation events</p>
                                </div>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-medium border ${isTraining || isFetching || isSaving
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                {isTraining || isFetching || isSaving ? '● Processing' : '○ Ready'}
                            </div>
                        </div>

                        <div className="flex-1 p-6 overflow-y-auto space-y-3 bg-slate-50/30">
                            {logs.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                                    <div className="p-6 bg-slate-50 rounded-full border border-slate-100">
                                        <Brain className="h-10 w-10 opacity-20" />
                                    </div>
                                    <p className="text-sm font-medium">Waiting to start simulation...</p>
                                </div>
                            )}
                            {logs.map((log, i) => (
                                <div key={i} className="flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300 group">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-2 h-2 rounded-full mt-2 ${log.includes('ERROR') ? 'bg-red-500' :
                                            log.includes('Success') ? 'bg-emerald-500' :
                                                'bg-indigo-500'
                                            }`} />
                                        {i !== logs.length - 1 && <div className="w-px h-full bg-slate-200 my-1" />}
                                    </div>
                                    <div className="flex-1 bg-white p-3 rounded-xl border border-slate-100 shadow-sm group-hover:shadow-md transition-all">
                                        <p className={`text-sm ${log.includes('ERROR') ? 'text-red-600 font-medium' :
                                            log.includes('Success') ? 'text-emerald-700 font-medium' :
                                                'text-slate-600'
                                            }`}>
                                            {log}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            <div ref={logsEndRef} />
                        </div>

                        {/* Progress Bar */}
                        {(isTraining || isFetching || isSaving) && (
                            <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-slate-100 p-6 z-10">
                                <div className="flex justify-between text-sm font-bold text-slate-700 mb-2">
                                    <div className="flex items-center gap-2">
                                        <span>Progress</span>
                                        <span className="text-xs font-normal text-slate-500">
                                            ({isFetching ? 'Generating Data' : isTraining ? 'Training Model' : 'Saving Data'})
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-indigo-600">ETA: {eta}</span>
                                        <span>{Math.round(progress)}%</span>
                                    </div>
                                </div>
                                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300 relative"
                                        style={{ width: `${progress}%` }}
                                    >
                                        <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite]"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
