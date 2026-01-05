import { useState } from 'react';
import { CalendarGrid } from './CalendarGrid';
import { Plus, Calendar as CalendarIcon, FileText, User } from 'lucide-react';

interface ScheduledCase {
    id: string;
    date: Date;
    patientName: string;
    procedureId: string;
    procedureName: string;
    preferenceCardId?: string; // LINK TO OVERRIDE
}

export function DoctorSchedule() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [cases, setCases] = useState<ScheduledCase[]>([
        { id: '1', date: new Date(), patientName: 'John Doe', procedureId: '1', procedureName: 'Total Knee Arthroplasty', preferenceCardId: 'pref-1' },
    ]);
    const [showAddModal, setShowAddModal] = useState(false);

    // Mock Form State
    const [newPatient, setNewPatient] = useState('');
    const [newProcedure, setNewProcedure] = useState('1');

    const handleAddCase = () => {
        if (!selectedDate || !newPatient) return;

        const procedureName = newProcedure === '1' ? 'Total Knee Arthroplasty' : 'Cataract Surgery';

        setCases([...cases, {
            id: Date.now().toString(),
            date: selectedDate,
            patientName: newPatient,
            procedureId: newProcedure,
            procedureName: procedureName,
            preferenceCardId: `pref-${newProcedure}` // Mock link
        }]);
        setShowAddModal(false);
        setNewPatient('');
    };

    const calendarEvents = cases.map(c => ({
        id: c.id,
        date: c.date,
        type: 'surgery' as const,
        title: c.procedureName,
        patientName: c.patientName
    }));

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-100px)]">
            {/* Left: Calendar */}
            <div className="lg:col-span-2 flex flex-col gap-4">
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Surgical Schedule</h2>
                        <p className="text-slate-500">Manage your cases and attach preference cards.</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 shadow-sm"
                    >
                        <Plus className="h-4 w-4" />
                        Book Case
                    </button>
                </div>

                <CalendarGrid
                    currentDate={currentDate}
                    events={calendarEvents}
                    onDateChange={setCurrentDate}
                    onSelectDate={setSelectedDate}
                    selectedDate={selectedDate}
                />
            </div>

            {/* Right: Day Detail */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col h-full">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                        <CalendarIcon className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900">
                            {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </h3>
                        <p className="text-xs text-slate-500">{cases.filter(c => c.date.toDateString() === selectedDate?.toDateString()).length} Cases Scheduled</p>
                    </div>
                </div>

                <div className="space-y-4 overflow-y-auto flex-1">
                    {cases
                        .filter(c => c.date.toDateString() === selectedDate?.toDateString())
                        .map(c => (
                            <div key={c.id} className="p-4 rounded-lg border border-slate-200 bg-slate-50 hover:border-primary-200 hover:bg-white transition-all group">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <User className="h-3 w-3 text-slate-400" />
                                        <span className="font-medium text-slate-900">{c.patientName}</span>
                                    </div>
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wide">Confirmed</span>
                                </div>
                                <h4 className="text-sm font-bold text-primary-700 mb-3">{c.procedureName}</h4>

                                {c.preferenceCardId && (
                                    <div className="flex items-center gap-2 text-xs text-slate-500 bg-white border border-slate-200 p-2 rounded">
                                        <FileText className="h-3 w-3 text-slate-400" />
                                        <span>Preference Card Attached</span>
                                    </div>
                                )}
                            </div>
                        ))
                    }
                    {cases.filter(c => c.date.toDateString() === selectedDate?.toDateString()).length === 0 && (
                        <div className="text-center py-12 text-slate-400">
                            <p>No cases scheduled.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                        <h3 className="mb-4 text-lg font-bold text-slate-900">Book New Case</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Patient Name</label>
                                <input
                                    type="text"
                                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                                    value={newPatient}
                                    onChange={e => setNewPatient(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Procedure</label>
                                <select
                                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                                    value={newProcedure}
                                    onChange={e => setNewProcedure(e.target.value)}
                                >
                                    <option value="1">Total Knee Arthroplasty (Card Available)</option>
                                    <option value="3">Cataract Surgery</option>
                                </select>
                            </div>
                            <div className="mt-4 rounded-lg bg-blue-50 p-3 text-xs text-blue-700">
                                <strong>Note:</strong> Booking this case will automatically reserve inventory based on your linked Preference Card.
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button onClick={() => setShowAddModal(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                            <button onClick={handleAddCase} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">Book Case</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
