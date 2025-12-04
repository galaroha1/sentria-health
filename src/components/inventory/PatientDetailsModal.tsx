import { X, Activity, AlertTriangle, FileText, Brain, Heart, Thermometer, Scale, Pill } from 'lucide-react';
import type { SimulationResult } from '../../context/SimulationContext';

interface PatientDetailsModalProps {
    patient: SimulationResult;
    onClose: () => void;
}

export function PatientDetailsModal({ patient, onClose }: PatientDetailsModalProps) {
    const { profile, aiPrediction } = patient;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="flex h-[85vh] w-full max-w-3xl flex-col rounded-xl bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">{patient.patientName}</h2>
                        <p className="text-sm text-slate-500">ID: {patient.id} • {patient.visitType}</p>
                    </div>
                    <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid gap-6">
                        {/* AI Analysis Section */}
                        {aiPrediction && (
                            <div className="rounded-xl border border-purple-100 bg-purple-50 p-5">
                                <h3 className="mb-3 flex items-center gap-2 font-bold text-purple-900">
                                    <Brain className="h-5 w-5" /> AI Treatment Analysis
                                </h3>
                                <div className="mb-4 flex items-center gap-4 rounded-lg bg-white p-3 shadow-sm">
                                    <div className="rounded-full bg-purple-100 p-2">
                                        <Pill className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-500 uppercase">Recommended Protocol</p>
                                        <p className="text-lg font-bold text-purple-700">{aiPrediction.recommendedDrug}</p>
                                        <p className="text-sm text-slate-600">{aiPrediction.dosage} • {aiPrediction.frequency}</p>
                                    </div>
                                    <div className="ml-auto text-right">
                                        <p className="text-2xl font-bold text-emerald-600">{aiPrediction.confidenceScore}%</p>
                                        <p className="text-xs font-medium text-slate-500">Confidence</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-xs font-semibold text-purple-900 uppercase">Reasoning Engine:</p>
                                    <ul className="list-disc pl-4 space-y-1 text-sm text-purple-800">
                                        {aiPrediction.reasoning.map((r, i) => (
                                            <li key={i}>{r}</li>
                                        ))}
                                    </ul>
                                </div>

                                {aiPrediction.warnings.length > 0 && (
                                    <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
                                        <p className="mb-1 flex items-center gap-1 text-xs font-bold text-amber-800 uppercase">
                                            <AlertTriangle className="h-3 w-3" /> Risk Factors Detected
                                        </p>
                                        <ul className="list-disc pl-4 space-y-1 text-sm text-amber-900">
                                            {aiPrediction.warnings.map((w, i) => (
                                                <li key={i}>{w}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Patient Vitals & History */}
                        {profile && (
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="rounded-xl border border-slate-200 p-5">
                                    <h3 className="mb-4 flex items-center gap-2 font-bold text-slate-900">
                                        <Activity className="h-5 w-5 text-blue-500" /> Clinical Vitals
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-full bg-red-50 p-2"><Heart className="h-4 w-4 text-red-500" /></div>
                                            <div>
                                                <p className="text-xs text-slate-500">Heart Rate</p>
                                                <p className="font-bold text-slate-900">{profile.vitals.heartRate} bpm</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-full bg-blue-50 p-2"><Activity className="h-4 w-4 text-blue-500" /></div>
                                            <div>
                                                <p className="text-xs text-slate-500">Blood Pressure</p>
                                                <p className="font-bold text-slate-900">{profile.vitals.bpSystolic}/{profile.vitals.bpDiastolic}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-full bg-amber-50 p-2"><Thermometer className="h-4 w-4 text-amber-500" /></div>
                                            <div>
                                                <p className="text-xs text-slate-500">Temp</p>
                                                <p className="font-bold text-slate-900">{profile.vitals.temperature.toFixed(1)}°F</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-full bg-slate-100 p-2"><Scale className="h-4 w-4 text-slate-600" /></div>
                                            <div>
                                                <p className="text-xs text-slate-500">Weight</p>
                                                <p className="font-bold text-slate-900">{profile.vitals.weight} kg</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-slate-200 p-5">
                                    <h3 className="mb-4 flex items-center gap-2 font-bold text-slate-900">
                                        <FileText className="h-5 w-5 text-slate-500" /> Medical Profile
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-xs font-medium text-slate-500 mb-1">Diagnosis</p>
                                            <p className="font-semibold text-slate-900">{patient.condition}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-slate-500 mb-1">Medical History</p>
                                            {profile.medicalHistory.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {profile.medicalHistory.map(h => (
                                                        <span key={h} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                                                            {h}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : <p className="text-sm text-slate-400 italic">None reported</p>}
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-slate-500 mb-1">Allergies</p>
                                            {profile.allergies.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {profile.allergies.map(a => (
                                                        <span key={a} className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">
                                                            {a}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : <p className="text-sm text-slate-400 italic">No known allergies</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {!profile && (
                            <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
                                <p>Detailed clinical profile not available for this simulation record.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
