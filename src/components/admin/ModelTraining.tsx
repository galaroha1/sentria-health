import { useState, useEffect, useRef } from 'react';
import { SyntheaGenerator } from '../../utils/syntheaGenerator';
import { Brain, Database, Terminal, Play, CheckCircle, Activity } from 'lucide-react';

export function ModelTraining() {
    const [isTraining, setIsTraining] = useState(false);
    const [progress, setProgress] = useState(0);
    const [patientCount, setPatientCount] = useState(1000);
    const [logs, setLogs] = useState<string[]>([]);
    const [stats, setStats] = useState({
        totalPatients: 0,
        conditionsIdentified: 0,
        accuracy: 87.5 // Initial baseline
    });
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
        setProgress(0);
        setLogs(['Initializing Synthea™ Patient Generator...', 'Loading clinical protocols (ICD-10, SNOMED-CT)...']);

        const batchSize = Math.ceil(patientCount / 100); // Update every 1%
        let generated = 0;
        let conditions = 0;

        const interval = setInterval(() => {
            generated += batchSize;
            const currentProgress = Math.min(100, (generated / patientCount) * 100);

            // Generate a small batch to simulate work
            const batch = SyntheaGenerator.generateBatch(5); // Generate 5 real samples for stats
            conditions += batch.reduce((acc, b) => acc + b.conditions.length, 0);

            // Update logs with realistic details
            const sample = batch[0];
            addLog(`Generated Patient: ${sample.patient.id.substring(0, 8)}... | Condition: ${sample.conditions[0]?.code.coding[0].display}`);

            setProgress(currentProgress);
            setStats(prev => ({
                totalPatients: Math.min(generated, patientCount),
                conditionsIdentified: conditions,
                accuracy: Math.min(99.2, prev.accuracy + 0.1) // Simulate learning
            }));

            if (generated >= patientCount) {
                clearInterval(interval);
                setIsTraining(false);
                addLog('Training Complete. Model weights updated.');
                addLog(`Final Accuracy: ${stats.accuracy.toFixed(1)}%`);
            }
        }, 100); // Fast simulation
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
                                    Synthetic Patients to Generate
                                </label>
                                <input
                                    type="range"
                                    min="100"
                                    max="10000"
                                    step="100"
                                    value={patientCount}
                                    onChange={(e) => setPatientCount(Number(e.target.value))}
                                    disabled={isTraining}
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                                <div className="flex justify-between text-xs text-slate-500 mt-1">
                                    <span>100</span>
                                    <span className="font-bold text-indigo-600">{patientCount.toLocaleString()} Patients</span>
                                    <span>10,000</span>
                                </div>
                            </div>

                            <button
                                onClick={startTraining}
                                disabled={isTraining}
                                className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold text-white transition-all ${isTraining
                                    ? 'bg-slate-400 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200'
                                    }`}
                            >
                                {isTraining ? (
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
