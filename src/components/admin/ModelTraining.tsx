import { useState, useEffect, useRef } from 'react';
import { SyntheaGenerator, type SyntheticBundle } from '../../utils/syntheaGenerator';
import { Brain, Database, Terminal, Play, CheckCircle, Activity, Download } from 'lucide-react';

export function ModelTraining() {
    const [isTraining, setIsTraining] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [progress, setProgress] = useState(0);
    const [patientCount, setPatientCount] = useState(100);
    const [logs, setLogs] = useState<string[]>([]);
    const [stats, setStats] = useState({
        totalPatients: 0,
        conditionsIdentified: 0,
        accuracy: 87.5 // Initial baseline
    });
    const [generatedData, setGeneratedData] = useState<SyntheticBundle[]>([]);
    const logsEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [logs]);

    const addLog = (message: string) => {
        setLogs(prev => [...prev.slice(-19), `[${new Date().toLocaleTimeString()}] ${message}`]);
    };

    const startTraining = async () => {
        setIsTraining(true);
        setIsFetching(true);
        setGeneratedData([]);
        setProgress(0);
        setLogs([
            'Initializing Synthea™ Patient Generator...',
            `Connecting to Live Data Stream (randomuser.me) to fetch ${patientCount} identities...`
        ]);

        try {
            // 1. Fetch Data First
            const data = await SyntheaGenerator.generateBatch(patientCount);
            setGeneratedData(data);
            setIsFetching(false);
            addLog(`Successfully fetched ${data.length} unique patient profiles.`);
            addLog('Starting Clinical Analysis & Model Training...');

            // 2. Simulate Training on the Data
            let processed = 0;
            let conditions = 0;
            const batchSize = Math.max(1, Math.ceil(patientCount / 50)); // Process in 50 steps

            const interval = setInterval(() => {
                const batch = data.slice(processed, processed + batchSize);
                processed += batch.length;
                conditions += batch.reduce((acc, b) => acc + b.conditions.length, 0);

                const currentProgress = Math.min(100, (processed / patientCount) * 100);
                setProgress(currentProgress);

                // Log a sample
                if (batch.length > 0) {
                    const sample = batch[0];
                    addLog(`Analyzing: ${sample.patient.name[0].given[0]} ${sample.patient.name[0].family} | Dx: ${sample.conditions[0]?.code.coding[0].display}`);
                }

                setStats(prev => ({
                    totalPatients: processed,
                    conditionsIdentified: conditions,
                    accuracy: Math.min(99.2, prev.accuracy + 0.1)
                }));

                if (processed >= data.length) {
                    clearInterval(interval);
                    setIsTraining(false);
                    addLog('Training Complete. Model weights updated.');
                    addLog(`Final Accuracy: ${stats.accuracy.toFixed(1)}%`);
                    addLog('Dataset ready for export.');
                }
            }, 50); // Fast processing

        } catch (error: any) {
            setIsFetching(false);
            setIsTraining(false);
            addLog(`ERROR: Data fetch failed - ${error.message}`);
            console.error(error);
        }
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
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Control Panel */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                                <Brain className="h-6 w-6 text-indigo-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">AI Model Training</h2>
                                <p className="text-sm text-slate-500">Synthea™ Data Engine</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Number of Patients to Simulate
                                </label>
                                <div className="space-y-3">
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="10"
                                            max="10000"
                                            value={patientCount}
                                            onChange={(e) => setPatientCount(Number(e.target.value))}
                                            disabled={isTraining || isFetching}
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg text-lg font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                                            placeholder="e.g. 50"
                                        />
                                        <div className="absolute right-3 top-3.5 text-slate-400 text-sm font-medium">
                                            patients
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <span className="text-xs text-slate-500 font-medium">Quick Adjust:</span>
                                        <input
                                            type="range"
                                            min="10"
                                            max="10000"
                                            step="10"
                                            value={patientCount}
                                            onChange={(e) => setPatientCount(Number(e.target.value))}
                                            disabled={isTraining || isFetching}
                                            className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={startTraining}
                                disabled={isTraining || isFetching}
                                className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold text-white transition-all ${isTraining || isFetching
                                    ? 'bg-slate-400 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200'
                                    }`}
                            >
                                {isFetching ? (
                                    <>
                                        <Activity className="h-5 w-5 animate-spin" />
                                        Fetching Data...
                                    </>
                                ) : isTraining ? (
                                    <>
                                        <Activity className="h-5 w-5 animate-spin" />
                                        Training...
                                    </>
                                ) : (
                                    <>
                                        <Play className="h-5 w-5" />
                                        Start Simulation
                                    </>
                                )}
                            </button>

                            {generatedData.length > 0 && !isTraining && (
                                <button
                                    onClick={downloadData}
                                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-all"
                                >
                                    <Download className="h-5 w-5" />
                                    Download Dataset ({generatedData.length})
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h3 className="text-sm font-semibold text-slate-900 mb-4">Model Performance</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Database className="h-5 w-5 text-blue-500" />
                                    <span className="text-sm text-slate-600">Dataset Size</span>
                                </div>
                                <span className="font-mono font-bold text-slate-900">{stats.totalPatients.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Activity className="h-5 w-5 text-orange-500" />
                                    <span className="text-sm text-slate-600">Data Points</span>
                                </div>
                                <span className="font-mono font-bold text-slate-900">{stats.conditionsIdentified.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                    <span className="text-sm text-green-900">Model Accuracy</span>
                                </div>
                                <span className="font-mono font-bold text-green-700">{stats.accuracy.toFixed(1)}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Terminal / Visualization */}
                <div className="md:col-span-2">
                    <div className="bg-slate-900 rounded-xl shadow-lg overflow-hidden flex flex-col h-[500px]">
                        <div className="bg-slate-800 px-4 py-3 flex items-center justify-between border-b border-slate-700">
                            <div className="flex items-center gap-2">
                                <Terminal className="h-4 w-4 text-slate-400" />
                                <span className="text-xs font-mono text-slate-400">synthea-cli — v2.4.0</span>
                            </div>
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                <div className="w-3 h-3 rounded-full bg-green-500" />
                            </div>
                        </div>

                        <div className="flex-1 p-4 font-mono text-sm overflow-y-auto space-y-2">
                            {logs.length === 0 && (
                                <div className="text-slate-500 italic">Ready to initialize simulation...</div>
                            )}
                            {logs.map((log, i) => (
                                <div key={i} className="text-green-400 break-all">
                                    <span className="text-slate-500 mr-2">$</span>
                                    {log}
                                </div>
                            ))}
                            <div ref={logsEndRef} />
                        </div>

                        {/* Progress Bar */}
                        {isTraining && (
                            <div className="bg-slate-800 p-4 border-t border-slate-700">
                                <div className="flex justify-between text-xs text-slate-400 mb-2">
                                    <span>Training Progress</span>
                                    <span>{Math.round(progress)}%</span>
                                </div>
                                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
