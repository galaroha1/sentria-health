
import { useState, useEffect } from 'react';
import { RecommendationEngine, type PatientProfile } from '../services/recommendation.engine';
import { PatientService } from '../services/patient.service';

import { Brain, Database, RefreshCw, Zap, Server, Activity } from 'lucide-react';

export default function RoroTrial() {
    const [stats, setStats] = useState({ trainingSetSize: 0, loss: 0, isUsingGPU: false });
    const [patient, setPatient] = useState<PatientProfile | null>(null);
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [isTraining, setIsTraining] = useState(false);
    const [trainLog, setTrainLog] = useState<string[]>([]);

    // Config
    const [sources, setSources] = useState({
        uhn: true,
        hap: true,
        synthea: false,
        practiceFusion: false,
        humana: false
    });
    const [apiKey, setApiKey] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            setStats(RecommendationEngine.getStats());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleTrain = async () => {
        setIsTraining(true);
        setTrainLog([]);

        const selectedSources = [];
        if (sources.uhn) selectedSources.push({ name: 'UHN (Public)', url: '/sentria-health/api/uhn' });
        if (sources.hap) selectedSources.push({ name: 'HAP (Sandbox)', url: '/sentria-health/api/hap' });
        if (sources.synthea) selectedSources.push({ name: 'MITRE Synthea', url: '/sentria-health/api/synthea', key: apiKey });
        if (sources.practiceFusion) selectedSources.push({ name: 'Practice Fusion', url: 'https://api.practicefusion.com/fhir' });
        if (sources.humana) selectedSources.push({ name: 'Humana', url: 'https://sandbox-fhir.humana.com/api' });

        await RecommendationEngine.trainFromSources(selectedSources, (msg) => {
            setTrainLog(prev => [...prev.slice(-4), msg]); // Keep last 5 lines
        });

        setIsTraining(false);
    };

    const handleNewPatient = async () => {
        // Generate a random mock patient to test inference
        const mock = PatientService.generateMockPatients(1)[0];

        // Manual "Adapt" since we can't import the class internal method easily in UI 
        // without exposing it, so we replicate extraction:
        const isAdvanced = mock.diagnosis.includes('Stage IV');
        const profile: PatientProfile = {
            id: mock.id,
            diagnosis: mock.diagnosis,
            age: 45 + Math.floor(Math.random() * 30), // Add Age for GPU
            gender: Math.random() > 0.5 ? 'male' : 'female',
            stage: isAdvanced ? 'IV' : 'II', // Simplified
            vitals: { bp: '120/80', hr: 72 },
            history: []
        };

        setPatient(profile);
        const recs = await RecommendationEngine.recommend(profile);
        setRecommendations(recs);
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <Brain className="h-8 w-8 text-indigo-600" />
                        Roro AI Trial
                        {stats.isUsingGPU && <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full flex items-center gap-1 border border-green-200"><Zap className="h-3 w-3" /> GPU ACTIVE (WebGL)</span>}
                    </h1>
                    <p className="text-slate-500 mt-2">Deep Learning Drug Recommendation Engine</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT: Training Control */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Server className="h-5 w-5 text-indigo-600" />
                        Data Sources
                    </h2>

                    <div className="space-y-3">
                        <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                            <input type="checkbox" checked={sources.uhn} onChange={e => setSources({ ...sources, uhn: e.target.checked })} />
                            <span className="font-medium text-slate-700">UHN (Public)</span>
                        </label>
                        <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                            <input type="checkbox" checked={sources.hap} onChange={e => setSources({ ...sources, hap: e.target.checked })} />
                            <span className="font-medium text-slate-700">HAP (Public)</span>
                        </label>
                        <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                            <input type="checkbox" checked={sources.synthea} onChange={e => setSources({ ...sources, synthea: e.target.checked })} />
                            <span className="font-medium text-slate-700">MITRE Synthea</span>
                        </label>
                        {sources.synthea && (
                            <input
                                type="text"
                                placeholder="Enter Synthea API Key"
                                className="w-full text-sm p-2 border rounded"
                                value={apiKey}
                                onChange={e => setApiKey(e.target.value)}
                            />
                        )}
                        <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                            <input type="checkbox" checked={sources.practiceFusion} onChange={e => setSources({ ...sources, practiceFusion: e.target.checked })} />
                            <span className="font-medium text-slate-700">Practice Fusion</span>
                        </label>
                        <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                            <input type="checkbox" checked={sources.humana} onChange={e => setSources({ ...sources, humana: e.target.checked })} />
                            <span className="font-medium text-slate-700">Humana</span>
                        </label>
                    </div>

                    <button
                        onClick={handleTrain}
                        disabled={isTraining}
                        className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 text-white font-medium transition-all ${isTraining ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg'
                            }`}
                    >
                        {isTraining ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Database className="h-5 w-5" />}
                        {isTraining ? 'Training Neural Net...' : 'Start GPU Training'}
                    </button>

                    {/* Live Log */}
                    <div className="bg-slate-900 rounded-lg p-4 font-mono text-xs text-green-400 h-40 overflow-hidden relative">
                        {trainLog.map((line, i) => (
                            <div key={i} className="mb-1">{line}</div>
                        ))}
                        {trainLog.length === 0 && <span className="text-slate-600 italic">System Idle. Select sources to train.</span>}
                    </div>

                    {/* Stats */}
                    <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-4 text-center">
                        <div>
                            <div className="text-2xl font-bold text-slate-900">{stats.trainingSetSize}</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wide">Records Ingested</div>
                        </div>
                        <div>
                            <div className={`text-2xl font-bold ${stats.loss > 0.5 ? 'text-amber-500' : 'text-green-600'}`}>
                                {stats.loss.toFixed(4)}
                            </div>
                            <div className="text-xs text-slate-500 uppercase tracking-wide">Current Loss</div>
                        </div>
                    </div>
                </div>

                {/* CENTER: Patient Simulation */}
                <div className="col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <Activity className="h-5 w-5 text-indigo-600" />
                                Patient Inference
                            </h2>
                            <button
                                onClick={handleNewPatient}
                                className="px-4 py-2 text-sm bg-white border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700 font-medium transition-colors"
                            >
                                New Mock Patient
                            </button>
                        </div>

                        {patient ? (
                            <div className="space-y-6">
                                {/* Patient Card */}
                                <div className="flex gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                                    <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl shrink-0">
                                        {patient.diagnosis[0]}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">{patient.diagnosis}</h3>
                                        <div className="text-sm text-slate-500 flex gap-4 mt-1">
                                            <span>Age: {patient.age}</span>
                                            <span>Gender: {patient.gender}</span>
                                            <span>Stage: {patient.stage}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Recommendations */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">AI Recommendations</h3>
                                    {recommendations.map((rec, i) => (
                                        <div key={i} className={`p-4 rounded-lg border flex items-start gap-4 transition-all ${i === 0
                                            ? 'bg-indigo-50 border-indigo-200 shadow-sm'
                                            : 'bg-white border-slate-200 opacity-75'
                                            }`}>
                                            <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${rec.confidenceScore > 80 ? 'bg-green-500' :
                                                rec.confidenceScore > 50 ? 'bg-amber-500' : 'bg-red-500'
                                                }`} />
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-bold text-slate-900">{rec.drugName}</h4>
                                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${rec.confidenceScore > 80 ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                                                        }`}>
                                                        {rec.confidenceScore.toFixed(1)}% Confidence
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-600 mt-1">{rec.reasoning}</p>



                                                {/* DOCTOR FEEDBACK LOOP (RLHF) */}
                                                <div className="mt-3 flex gap-2 items-center">
                                                    <button
                                                        onClick={() => {
                                                            const newDrug = prompt("Doctor Override: Classification Correction.\n\nPlease enter the correct drug name:");
                                                            if (newDrug && newDrug !== rec.drugName) {
                                                                if (patient) {
                                                                    RecommendationEngine.submitFeedback(patient, rec.drugName, newDrug, "Doctor Manual Override");
                                                                    alert("Feedback Recorded! The Neural Network will retrain on this correction.");
                                                                }
                                                            }
                                                        }}
                                                        className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium"
                                                    >
                                                        <Zap className="h-3 w-3" />
                                                        Correct prediction
                                                    </button>

                                                    <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded border border-slate-200 ml-auto">
                                                        Source: {rec.source}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-slate-400">
                                <Activity className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                <p>Generate a patient to see AI recommendations</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
