import { useState } from 'react';
import { X, UserPlus, Wand2, Calendar } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { useSimulation, type SimulationResult } from '../../context/SimulationContext';
import { useApp } from '../../context/AppContext';

interface AddPatientModalProps {
    onClose: () => void;
}

export function AddPatientModal({ onClose }: AddPatientModalProps) {
    const { addSimulationResult, predictDrug } = useSimulation();
    const { addNotification } = useApp();

    const [name, setName] = useState('');
    const [condition, setCondition] = useState('');
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    const handleRandomize = () => {
        const randomNames = ["John Doe", "Jane Smith", "Alice Johnson", "Bob Brown", "Charlie Davis"];
        const randomConditions = ["Hypertension", "Diabetes Type 2", "Asthma", "Migraine", "Anxiety"];

        setName(randomNames[Math.floor(Math.random() * randomNames.length)]);
        setCondition(randomConditions[Math.floor(Math.random() * randomConditions.length)]);
        setDate(format(addDays(new Date(), Math.floor(Math.random() * 14)), 'yyyy-MM-dd'));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !condition) return;

        const prediction = predictDrug(condition, 'Consultation');
        const scheduleDate = new Date(date);
        scheduleDate.setHours(9 + Math.floor(Math.random() * 8));

        const newResult: SimulationResult = {
            id: `manual-${Date.now()}`,
            date: scheduleDate,
            timeStr: format(scheduleDate, 'hh:mm a'),
            patientName: name,
            condition: condition,
            visitType: 'New Patient Consult',
            location: 'Main Clinic',
            drug: prediction.drug,
            acquisitionMethod: prediction.acquisitionMethod,
            status: 'Scheduled',
            price: prediction.price
        };

        addSimulationResult(newResult);
        addNotification({
            id: Date.now().toString(),
            type: 'info',
            message: `Scheduled ${name} for ${prediction.drug}`,
            timestamp: new Date().toISOString(),
            read: false,
            category: 'system',
            title: 'Patient Scheduled'
        });

        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="w-full max-w-md rounded-xl bg-white shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-900">
                        <UserPlus className="h-5 w-5 text-purple-600" />
                        <h2 className="font-bold">Add New Patient</h2>
                    </div>
                    <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Patient Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
                            placeholder="e.g. John Doe"
                            required
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Condition</label>
                        <input
                            type="text"
                            value={condition}
                            onChange={(e) => setCondition(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
                            placeholder="e.g. Oncology"
                            required
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Appointment Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full rounded-lg border border-slate-200 pl-10 pr-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
                                required
                            />
                        </div>
                    </div>

                    <div className="pt-2 flex gap-3">
                        <button
                            type="button"
                            onClick={handleRandomize}
                            className="flex items-center gap-2 rounded-lg border border-purple-100 bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700 hover:bg-purple-100"
                        >
                            <Wand2 className="h-4 w-4" />
                            Autofill
                        </button>
                        <button
                            type="submit"
                            className="flex-1 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
                        >
                            Predict & Schedule
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
