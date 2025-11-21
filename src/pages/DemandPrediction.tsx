import { useState } from 'react';
import { generatePatientData, getPatientDisplayName } from '../ml/dataGenerator';
import { drugPredictor } from '../ml/DrugPredictor';
import type { VisitType, DrugRecommendation } from '../ml/clinicalRules';
import { Brain, Activity, User, Stethoscope, AlertTriangle, CheckCircle, TrendingUp, Pill } from 'lucide-react';

export const DemandPrediction = () => {
    const [selectedPatientId, setSelectedPatientId] = useState<string>('');
    const [visitType, setVisitType] = useState<VisitType>('Primary Care');
    const [recommendations, setRecommendations] = useState<DrugRecommendation[]>([]);
    const [showResults, setShowResults] = useState(false);

    const patients = generatePatientData();
    const selectedPatient = patients.find(p => p.id === selectedPatientId);

    const visitTypes: VisitType[] = [
        'Primary Care',
        'Cardiology',
        'Endocrinology',
        'Pulmonology',
        'Emergency',
        'Nephrology'
    ];

    const handlePredict = () => {
        if (!selectedPatient) return;

        const input = {
            patient: selectedPatient,
            visitType
        };

        const errors = drugPredictor.validateInput(input);
        if (errors.length > 0) {
            alert('Validation errors:\n' + errors.join('\n'));
            return;
        }

        const predictions = drugPredictor.predict(input, 5);
        setRecommendations(predictions);
        setShowResults(true);
    };

    const getConfidenceBadge = (confidence: number) => {
        const percentage = Math.round(confidence * 100);
        if (percentage >= 90) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        if (percentage >= 75) return 'bg-blue-100 text-blue-700 border-blue-200';
        if (percentage >= 60) return 'bg-amber-100 text-amber-700 border-amber-200';
        return 'bg-slate-100 text-slate-700 border-slate-200';
    };

    const getPriorityIcon = (priority: 'high' | 'medium' | 'low') => {
        if (priority === 'high') return <TrendingUp className="h-4 w-4 text-red-600" />;
        if (priority === 'medium') return <Activity className="h-4 w-4 text-amber-600" />;
        return <Activity className="h-4 w-4 text-slate-400" />;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg">
                        <Brain className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Drug Recommendations</h1>
                        <p className="text-sm text-slate-600">AI-powered medication suggestions based on patient EHR</p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Left Panel: Patient Selection & Input */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Patient Selector */}
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center gap-2">
                            <User className="h-5 w-5 text-slate-600" />
                            <h2 className="text-lg font-bold text-slate-900">Select Patient</h2>
                        </div>
                        <select
                            value={selectedPatientId}
                            onChange={(e) => {
                                setSelectedPatientId(e.target.value);
                                setShowResults(false);
                            }}
                            className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                        >
                            <option value="">Choose a patient...</option>
                            {patients.map(patient => (
                                <option key={patient.id} value={patient.id}>
                                    {getPatientDisplayName(patient)} - {patient.conditions[0]}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Visit Type Selector */}
                    {selectedPatient && (
                        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="mb-4 flex items-center gap-2">
                                <Stethoscope className="h-5 w-5 text-slate-600" />
                                <h2 className="text-lg font-bold text-slate-900">Visit Type</h2>
                            </div>
                            <div className="space-y-2">
                                {visitTypes.map(type => (
                                    <label key={type} className="flex items-center gap-3 cursor-pointer rounded-lg border border-slate-200 p-3 hover:bg-slate-50">
                                        <input
                                            type="radio"
                                            name="visitType"
                                            value={type}
                                            checked={visitType === type}
                                            onChange={(e) => {
                                                setVisitType(e.target.value as VisitType);
                                                setShowResults(false);
                                            }}
                                            className="h-4 w-4 text-primary-600"
                                        />
                                        <span className="text-sm font-medium text-slate-700">{type}</span>
                                    </label>
                                ))}
                            </div>

                            <button
                                onClick={handlePredict}
                                disabled={!selectedPatient}
                                className="mt-6 w-full rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <Brain className="h-4 w-4" />
                                Get Recommendations
                            </button>
                        </div>
                    )}

                    {/* Patient Summary */}
                    {selectedPatient && (
                        <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-sm">
                            <h3 className="mb-3 text-sm font-bold text-slate-900">Patient Summary</h3>
                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Age:</span>
                                    <span className="font-medium text-slate-900">{selectedPatient.demographics.age} years</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Gender:</span>
                                    <span className="font-medium text-slate-900">{selectedPatient.demographics.gender === 'M' ? 'Male' : 'Female'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">BMI:</span>
                                    <span className="font-medium text-slate-900">{selectedPatient.demographics.bmi.toFixed(1)}</span>
                                </div>
                                <div className="mt-3 pt-3 border-t border-indigo-200">
                                    <p className="text-slate-600 mb-2">Active Conditions:</p>
                                    <div className="flex flex-wrap gap-1">
                                        {selectedPatient.conditions.map((condition, idx) => (
                                            <span key={idx} className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                                                {condition}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="mt-3 pt-3 border-t border-indigo-200">
                                    <p className="text-slate-600 mb-2">Vitals:</p>
                                    <div className="space-y-1">
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">BP:</span>
                                            <span className="font-medium text-slate-900">{selectedPatient.vitals.systolic}/{selectedPatient.vitals.diastolic} mmHg</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">HR:</span>
                                            <span className="font-medium text-slate-900">{selectedPatient.vitals.heartRate} bpm</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-3 pt-3 border-t border-indigo-200">
                                    <p className="text-slate-600 mb-2">Key Labs:</p>
                                    <div className="space-y-1">
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">A1C:</span>
                                            <span className="font-medium text-slate-900">{selectedPatient.labs.a1c}%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">LDL:</span>
                                            <span className="font-medium text-slate-900">{selectedPatient.labs.ldl} mg/dL</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Glucose:</span>
                                            <span className="font-medium text-slate-900">{selectedPatient.labs.glucose} mg/dL</span>
                                        </div>
                                    </div>
                                </div>
                                {selectedPatient.allergies.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-red-200">
                                        <p className="text-red-600 mb-2 font-semibold">⚠️ Allergies:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {selectedPatient.allergies.map((allergy, idx) => (
                                                <span key={idx} className="rounded-full bg-red-200 px-2 py-0.5 text-xs font-bold text-red-900">
                                                    {allergy}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Panel: Results */}
                <div className="lg:col-span-2">
                    {!showResults ? (
                        <div className="flex h-full items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-12">
                            <div className="text-center">
                                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-purple-100">
                                    <Pill className="h-10 w-10 text-purple-600" />
                                </div>
                                <h3 className="mb-2 text-lg font-bold text-slate-900">Select a Patient & Visit Type</h3>
                                <p className="text-sm text-slate-600">
                                    Choose a patient profile and visit type to get AI-powered drug recommendations
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Header */}
                            <div className="rounded-xl border border-slate-200 bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white shadow-lg">
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="h-6 w-6" />
                                    <div>
                                        <h2 className="text-xl font-bold">Drug Recommendations</h2>
                                        <p className="text-sm text-purple-100">
                                            {recommendations.length} recommendation{recommendations.length !== 1 ? 's' : ''} for {visitType}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Recommendations */}
                            {recommendations.length === 0 ? (
                                <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                                    <AlertTriangle className="mx-auto mb-3 h-12 w-12 text-amber-500" />
                                    <h3 className="mb-2 text-lg font-bold text-slate-900">No Recommendations</h3>
                                    <p className="text-sm text-slate-600">
                                        No specific drug recommendations based on current patient profile and visit type.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {recommendations.map((rec, idx) => (
                                        <div
                                            key={idx}
                                            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-start gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                                                        {getPriorityIcon(rec.priority)}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-bold text-slate-900">{rec.drug.name}</h3>
                                                        <p className="text-xs text-slate-500">NDC: {rec.drug.ndc} • {rec.drug.category}</p>
                                                    </div>
                                                </div>
                                                <div className={`rounded-full border px-3 py-1 text-xs font-bold ${getConfidenceBadge(rec.confidence)}`}>
                                                    {Math.round(rec.confidence * 100)}% Confidence
                                                </div>
                                            </div>

                                            {/* Reasons */}
                                            <div className="mb-3 rounded-lg bg-blue-50 p-3">
                                                <p className="text-xs font-semibold text-blue-900 mb-1">Clinical Rationale:</p>
                                                {rec.reasons.map((reason, rIdx) => (
                                                    <div key={rIdx} className="flex items-start gap-2 text-xs text-blue-800">
                                                        <CheckCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                                        <span>{reason}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Warnings */}
                                            {rec.warnings.length > 0 && (
                                                <div className="mb-3 rounded-lg bg-amber-50 border border-amber-200 p-3">
                                                    <p className="text-xs font-semibold text-amber-900 mb-1">⚠️ Warnings:</p>
                                                    {rec.warnings.map((warning, wIdx) => (
                                                        <div key={wIdx} className="flex items-start gap-2 text-xs text-amber-800">
                                                            <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                                            <span>{warning}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Dosage */}
                                            <div className="flex items-center gap-2 text-xs text-slate-600">
                                                <Pill className="h-3 w-3" />
                                                <span>Typical Dosage: {rec.drug.typicalDosage}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Clinical Context */}
                            {selectedPatient && recommendations.length > 0 && (
                                <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-blue-50 p-6 shadow-sm">
                                    <h3 className="mb-3 text-sm font-bold text-slate-900 flex items-center gap-2">
                                        <Activity className="h-4 w-4" />
                                        Clinical Context
                                    </h3>
                                    <div className="space-y-2 text-xs text-slate-700">
                                        <p><strong>Primary Conditions:</strong> {selectedPatient.conditions.join(', ')}</p>
                                        <p><strong>Visit Type:</strong> {visitType}</p>
                                        <p><strong>Key Findings:</strong></p>
                                        <ul className="ml-4 list-disc space-y-1">
                                            {selectedPatient.vitals.systolic >= 140 && (
                                                <li>Elevated blood pressure ({selectedPatient.vitals.systolic}/{selectedPatient.vitals.diastolic} mmHg)</li>
                                            )}
                                            {selectedPatient.labs.a1c >= 6.5 && (
                                                <li>Diabetes indicator (A1C: {selectedPatient.labs.a1c}%)</li>
                                            )}
                                            {selectedPatient.labs.ldl >= 130 && (
                                                <li>Elevated LDL cholesterol ({selectedPatient.labs.ldl} mg/dL)</li>
                                            )}
                                            {selectedPatient.demographics.bmi >= 30 && (
                                                <li>Obesity (BMI: {selectedPatient.demographics.bmi.toFixed(1)})</li>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
