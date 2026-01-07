import { useState } from 'react';
import { X, UserPlus, Wand2, Activity, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { useSimulation, type SimulationResult } from '../../clinical/context/SimulationContext';
import { useApp } from '../../../context/AppContext';
import { MEDICAL_DATABASE, ALLERGIES_LIST, COMORBIDITIES_LIST } from '../../../data/medicalDatabase';
import type { PatientProfile } from '../../clinical/types';

import { RecommendationEngine } from '../../clinical/services/recommendation.engine';
import { toast } from 'react-hot-toast';

interface AddPatientModalProps {
    onClose: () => void;
}

export function AddPatientModal({ onClose }: AddPatientModalProps) {
    const { addSimulationResult } = useSimulation();
    const { addNotification } = useApp();

    // Form State
    const [name, setName] = useState('');
    const [age, setAge] = useState(45);
    const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
    const [conditionId, setConditionId] = useState(Object.keys(MEDICAL_DATABASE)[0]);
    const [date, setDate] = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd'));

    // Vitals
    const [bpSystolic, setBpSystolic] = useState(120);
    const [bpDiastolic, setBpDiastolic] = useState(80);
    const [heartRate, setHeartRate] = useState(72);
    const [weight, setWeight] = useState(70);

    // Multi-selects
    const [selectedHistory, setSelectedHistory] = useState<string[]>([]);
    const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);

    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleAutofill = () => {
        const randomNames = ["John Doe", "Jane Smith", "Alice Johnson", "Bob Brown", "Charlie Davis"];
        setName(randomNames[Math.floor(Math.random() * randomNames.length)]);
        setAge(20 + Math.floor(Math.random() * 60));
        setBpSystolic(110 + Math.floor(Math.random() * 30));
        setBpDiastolic(70 + Math.floor(Math.random() * 20));
        setHeartRate(60 + Math.floor(Math.random() * 40));
        setWeight(50 + Math.floor(Math.random() * 50));

        // Random history/allergies
        if (Math.random() > 0.5) {
            setSelectedHistory([COMORBIDITIES_LIST[Math.floor(Math.random() * COMORBIDITIES_LIST.length)]]);
        } else {
            setSelectedHistory([]);
        }
    };

    const toggleHistory = (item: string) => {
        setSelectedHistory(prev =>
            prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
        );
    };

    const toggleAllergy = (item: string) => {
        setSelectedAllergies(prev =>
            prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
        );
    };

    const handleSubmit = async () => {
        if (!name || !conditionId) return;

        setIsAnalyzing(true);

        try {
            const profile: PatientProfile = {
                name,
                age,
                gender,
                conditionId,
                medicalHistory: selectedHistory,
                vitals: {
                    bpSystolic,
                    bpDiastolic,
                    heartRate,
                    temperature: 98.6,
                    weight
                },
                allergies: selectedAllergies
            };

            // Use Primary AI Model (Async)
            const recommendations = await RecommendationEngine.recommend(profile);

            if (!recommendations || recommendations.length === 0) {
                throw new Error("AI Model returned no prediction.");
            }

            const topRec = recommendations[0];
            const condition = MEDICAL_DATABASE[conditionId];

            const newResult: SimulationResult = {
                id: `manual-${Date.now()}`,
                date: new Date(date),
                timeStr: '09:00 AM', // Default
                patientName: name,
                condition: condition.name,
                visitType: 'New Patient Consult',
                location: 'Main Clinic',
                drug: topRec.drugName,
                acquisitionMethod: 'Clear Bag', // Default or derived
                status: topRec.contraindications.length > 0 ? 'Transport Needed' : 'Scheduled',
                price: 50, // Mock price or derived
                profile: profile,
                aiPrediction: {
                    recommendedDrug: topRec.drugName,
                    confidenceScore: topRec.confidenceScore,
                    reasoning: [topRec.reasoning],
                    contraindicated: topRec.contraindications.length > 0,
                    dosage: 'Standard',
                    frequency: 'Daily',
                    price: 50,
                    acquisitionMethod: 'Clear Bag',
                    warnings: topRec.contraindications,
                }
            };

            addSimulationResult(newResult);
            addNotification({
                id: Date.now().toString(),
                type: 'success',
                message: `Scheduled ${name}. AI recommended ${topRec.drugName}`,
                timestamp: new Date().toISOString(),
                read: false,
                category: 'system',
                title: 'Patient Scheduled'
            });

            onClose();
        } catch (error) {
            console.error("Manual Patient AI Error", error);
            toast.error("Failed to generate AI prediciton. Please try again.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="flex h-[90vh] w-full max-w-4xl flex-col rounded-xl bg-white shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 p-6">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <UserPlus className="h-6 w-6 text-purple-600" />
                            Add New Patient
                        </h2>
                        <p className="text-sm text-slate-500">Enter EHR data for AI analysis and treatment prediction</p>
                    </div>
                    <button onClick={onClose} className="rounded-full p-2 hover:bg-slate-100">
                        <X className="h-5 w-5 text-slate-500" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Left Column: Demographics & Vitals */}
                        <div className="space-y-6">
                            <div className="rounded-lg border border-slate-200 p-4">
                                <h3 className="mb-4 font-semibold text-slate-900 flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-blue-500" /> Demographics
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-slate-700">Full Name</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
                                            placeholder="e.g. John Doe"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-slate-700">Age</label>
                                            <input
                                                type="number"
                                                value={age}
                                                onChange={(e) => setAge(parseInt(e.target.value))}
                                                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-slate-700">Gender</label>
                                            <select
                                                value={gender}
                                                onChange={(e) => setGender(e.target.value as any)}
                                                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                                            >
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-slate-700">Diagnosis (ICD-10)</label>
                                        <select
                                            value={conditionId}
                                            onChange={(e) => setConditionId(e.target.value)}
                                            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                                        >
                                            {Object.values(MEDICAL_DATABASE).map(c => (
                                                <option key={c.id} value={c.id}>
                                                    {c.name} ({c.icd10})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-slate-700">Appointment Date</label>
                                        <input
                                            type="date"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-lg border border-slate-200 p-4">
                                <h3 className="mb-4 font-semibold text-slate-900 flex items-center gap-2">
                                    <Activity className="h-4 w-4 text-emerald-500" /> Vitals
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-slate-700">BP Systolic</label>
                                        <input
                                            type="number"
                                            value={bpSystolic}
                                            onChange={(e) => setBpSystolic(parseInt(e.target.value))}
                                            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-slate-700">BP Diastolic</label>
                                        <input
                                            type="number"
                                            value={bpDiastolic}
                                            onChange={(e) => setBpDiastolic(parseInt(e.target.value))}
                                            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-slate-700">Heart Rate</label>
                                        <input
                                            type="number"
                                            value={heartRate}
                                            onChange={(e) => setHeartRate(parseInt(e.target.value))}
                                            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-slate-700">Weight (kg)</label>
                                        <input
                                            type="number"
                                            value={weight}
                                            onChange={(e) => setWeight(parseInt(e.target.value))}
                                            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: History & Allergies */}
                        <div className="space-y-6">
                            <div className="rounded-lg border border-slate-200 p-4">
                                <h3 className="mb-4 font-semibold text-slate-900 flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4 text-amber-500" /> Medical History & Comorbidities
                                </h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {COMORBIDITIES_LIST.map(item => (
                                        <label key={item} className="flex items-center gap-2 rounded-md border border-slate-100 p-2 hover:bg-slate-50 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selectedHistory.includes(item)}
                                                onChange={() => toggleHistory(item)}
                                                className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                                            />
                                            <span className="text-xs text-slate-700">{item}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-lg border border-slate-200 p-4">
                                <h3 className="mb-4 font-semibold text-slate-900 flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4 text-red-500" /> Allergies
                                </h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {ALLERGIES_LIST.map(item => (
                                        <label key={item} className="flex items-center gap-2 rounded-md border border-slate-100 p-2 hover:bg-slate-50 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selectedAllergies.includes(item)}
                                                onChange={() => toggleAllergy(item)}
                                                className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                                            />
                                            <span className="text-xs text-slate-700">{item}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-slate-100 p-6 bg-slate-50 rounded-b-xl">
                    <button
                        onClick={handleAutofill}
                        className="flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-800"
                    >
                        <Wand2 className="h-4 w-4" />
                        Autofill Random Data
                    </button>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={!name || isAnalyzing}
                            className="flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50 min-w-[160px] justify-center"
                        >
                            {isAnalyzing ? (
                                <>
                                    <Activity className="h-4 w-4 animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="h-4 w-4" />
                                    Predict & Schedule
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
