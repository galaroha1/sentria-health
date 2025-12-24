import { useState, useRef, useEffect } from 'react';
import { Activity, Database, Server, Play, CheckCircle2, AlertTriangle, Clock, Trash2 } from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';
import { useApp } from '../../context/AppContext';
import toast, { Toaster } from 'react-hot-toast';

export function ModelTraining() {
    const { resetSimulation } = useApp();
    const {
        isTraining,
        progress,
        eta,
        logs,
        stats,
        startTraining,
        clearData,
        simulationResults
    } = useSimulation();

    const [patientCount, setPatientCount] = useState(100);
    const logsEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [logs]);

    const handleStart = () => {
        if (patientCount > 10000) {
            toast.error('Maximum limit is 10,000 patients per simulation.', {
                icon: '⚠️',
                style: {
                    borderRadius: '10px',
                    background: '#333',
                    color: '#fff',
                },
            });
            return;
        }
        startTraining(patientCount);
    };

    const handleClear = () => {
        if (confirm('Are you sure you want to clear all simulation data? This cannot be undone.')) {
            clearData();
            toast.success('All simulation data cleared!', {
                duration: 3000,
                position: 'bottom-right',
                style: {
                    background: '#EF4444',
                    color: '#fff',
                    fontWeight: 'bold',
                },
                icon: '🗑️'
            });
        }
    };

    return (
        <div className="space-y-6">
            <Toaster />
            {/* Header / Controls */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-lg font-bold text-slate-900">AI Model Training & Simulation</h2>
                    <p className="text-sm text-slate-500">Generate synthetic patient data to train the clinical prediction model.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
                        <span className="text-sm text-slate-500">Patients to Generate:</span>
                        <input
                            type="number"
                            min="1"
                            max="10000"
                            value={patientCount}
                            onChange={(e) => setPatientCount(Number(e.target.value))}
                            className="w-20 rounded border border-slate-200 px-2 py-1 text-sm font-medium focus:border-purple-500 focus:outline-none"
                            disabled={isTraining}
                        />
                    </div>


                    {simulationResults.length > 0 && !isTraining && (
                        <div className="flex gap-2">
                            <button
                                onClick={async () => {
                                    if (confirm("Reset Inventory to Baseline? This helps if demand/optimization seems stuck.")) {
                                        await resetSimulation();
                                        toast.success("Inventory Reset Complete");
                                    }
                                }}
                                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                <Database className="h-4 w-4" />
                                Reset Inventory
                            </button>
                            <button
                                onClick={handleClear}
                                className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors"
                            >
                                <Trash2 className="h-4 w-4" />
                                Clear Data
                            </button>
                        </div>
                    )}

                    <button
                        onClick={handleStart}
                        disabled={isTraining}
                        className={`flex items-center gap-2 rounded-lg px-6 py-2 text-sm font-medium text-white transition-all ${isTraining
                            ? 'cursor-not-allowed bg-slate-400'
                            : 'bg-purple-600 hover:bg-purple-700 shadow-md hover:shadow-lg'
                            }`}
                    >
                        {isTraining ? (
                            <>
                                <Activity className="h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <Play className="h-4 w-4" />
                                Start Simulation
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Progress & Stats Grid */}
            <div className="grid gap-6 md:grid-cols-3">
                {/* Progress Card */}
                <div className="md:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-6 flex items-center justify-between">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                            <Activity className="h-5 w-5 text-purple-500" />
                            Training Progress
                        </h3>
                        {isTraining && (
                            <span className="flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700 animate-pulse">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                                </span>
                                Active
                            </span>
                        )}
                    </div>

                    <div className="mb-2 flex justify-between text-sm">
                        <span className="font-medium text-slate-700">
                            {progress < 40 ? 'Generating Synthetic Data...' :
                                progress < 80 ? 'Training Neural Network...' :
                                    progress < 100 ? 'Syncing to Database...' : 'Complete'}
                        </span>
                        <span className="font-bold text-purple-600">{progress.toFixed(1)}%</span>
                    </div>
                    <div className="mb-6 h-3 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                            className="h-full bg-gradient-to-r from-purple-500 to-primary-600 transition-all duration-300 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-6">
                        <div>
                            <p className="text-xs text-slate-500 mb-1">Estimated Time</p>
                            <p className="font-mono text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Clock className="h-4 w-4 text-slate-400" />
                                {eta}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 mb-1">Patients Processed</p>
                            <p className="font-mono text-lg font-bold text-slate-900">{stats.totalPatients.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 mb-1">Model Accuracy</p>
                            <p className="font-mono text-lg font-bold text-emerald-600">{stats.accuracy.toFixed(1)}%</p>
                        </div>
                    </div>
                </div>

                {/* System Status */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 font-bold text-slate-900 flex items-center gap-2">
                        <Server className="h-5 w-5 text-slate-500" />
                        System Status
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600">Synthea™ Engine</span>
                            <span className="flex items-center gap-1 text-emerald-600 font-medium">
                                <CheckCircle2 className="h-3 w-3" /> Ready
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600">TensorFlow.js</span>
                            <span className="flex items-center gap-1 text-emerald-600 font-medium">
                                <CheckCircle2 className="h-3 w-3" /> Loaded
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600">Firestore Sync</span>
                            <span className={`flex items-center gap-1 font-medium ${isTraining && progress > 80 ? 'text-amber-600 animate-pulse' : 'text-emerald-600'}`}>
                                {isTraining && progress > 80 ? (
                                    <><Activity className="h-3 w-3" /> Syncing...</>
                                ) : (
                                    <><CheckCircle2 className="h-3 w-3" /> Connected</>
                                )}
                            </span>
                        </div>

                        <div className="mt-6 rounded-lg bg-slate-50 p-3">
                            <div className="flex items-start gap-2">
                                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                                <p className="text-xs text-slate-500">
                                    <strong>Note:</strong> Generating large datasets (10k+) may take several minutes. Do not close this tab, but you can navigate to other tabs.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Live Logs */}
            <div className="rounded-xl border border-slate-200 bg-slate-900 p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <Database className="h-5 w-5 text-emerald-400" />
                        Live Execution Logs
                    </h3>
                    <span className="text-xs text-slate-400 font-mono">stdout</span>
                </div>
                <div className="h-64 overflow-y-auto rounded-lg bg-slate-950 p-4 font-mono text-xs text-slate-300">
                    {logs.length === 0 ? (
                        <span className="text-slate-600 italic">Waiting for simulation to start...</span>
                    ) : (
                        <div className="space-y-1">
                            {logs.map((log, i) => (
                                <div key={i} className="border-l-2 border-slate-800 pl-2 hover:border-emerald-500 hover:text-emerald-400 transition-colors">
                                    {log}
                                </div>
                            ))}
                            {isTraining && (
                                <div className="animate-pulse text-emerald-500">_</div>
                            )}
                            <div ref={logsEndRef} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
