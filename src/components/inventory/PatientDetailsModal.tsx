import { X, Activity, FileText, AlertCircle, Calendar, User } from 'lucide-react';
import type { SimulationResult } from '../../context/SimulationContext';

interface PatientDetailsModalProps {
    patient: SimulationResult;
    onClose: () => void;
}

export function PatientDetailsModal({ patient, onClose }: PatientDetailsModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                            <User className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">{patient.patientName}</h2>
                            <p className="text-sm text-slate-500">ID: {patient.id.toUpperCase()}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                    {/* Vitals Section */}
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                            <p className="text-xs font-medium text-slate-500">Heart Rate</p>
                            <p className="text-lg font-bold text-slate-900">72 <span className="text-xs font-normal text-slate-400">bpm</span></p>
                        </div>
                        <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                            <p className="text-xs font-medium text-slate-500">Blood Pressure</p>
                            <p className="text-lg font-bold text-slate-900">120/80</p>
                        </div>
                        <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                            <p className="text-xs font-medium text-slate-500">Temp</p>
                            <p className="text-lg font-bold text-slate-900">98.6 <span className="text-xs font-normal text-slate-400">°F</span></p>
                        </div>
                        <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                            <p className="text-xs font-medium text-slate-500">Weight</p>
                            <p className="text-lg font-bold text-slate-900">165 <span className="text-xs font-normal text-slate-400">lbs</span></p>
                        </div>
                    </div>

                    {/* Clinical Info */}
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-slate-900 font-semibold">
                                <Activity className="h-4 w-4 text-blue-500" />
                                <h3>Diagnosis & Condition</h3>
                            </div>
                            <div className="rounded-lg border border-slate-200 p-4">
                                <p className="font-medium text-slate-900">{patient.condition}</p>
                                <p className="mt-1 text-sm text-slate-500">Primary diagnosis confirmed via recent screening.</p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                                        Chronic
                                    </span>
                                    <span className="inline-flex items-center rounded-full bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700">
                                        Monitoring Required
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-slate-900 font-semibold">
                                <FileText className="h-4 w-4 text-emerald-500" />
                                <h3>Treatment Plan</h3>
                            </div>
                            <div className="rounded-lg border border-slate-200 p-4">
                                <p className="font-medium text-slate-900">{patient.visitType}</p>
                                <p className="mt-1 text-sm text-slate-500">Scheduled for {patient.location}</p>
                                <div className="mt-3 rounded bg-slate-50 p-2 text-sm">
                                    <span className="font-medium text-slate-700">Prescribed:</span> {patient.drug}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Allergies & Alerts */}
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                        <div className="mb-2 flex items-center gap-2 text-amber-800">
                            <AlertCircle className="h-5 w-5" />
                            <h3 className="font-bold">Medical Alerts</h3>
                        </div>
                        <ul className="list-inside list-disc text-sm text-amber-700">
                            <li>Patient has a known allergy to Penicillin.</li>
                            <li>History of mild asthma.</li>
                        </ul>
                    </div>

                    {/* Appointment Info */}
                    <div className="flex items-center justify-between rounded-lg bg-slate-900 p-4 text-white">
                        <div className="flex items-center gap-3">
                            <Calendar className="h-8 w-8 text-slate-400" />
                            <div>
                                <p className="text-sm text-slate-400">Next Appointment</p>
                                <p className="font-bold">{patient.date.toDateString()} at {patient.timeStr}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-slate-400">Status</p>
                            <p className="font-bold text-emerald-400">{patient.status}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
