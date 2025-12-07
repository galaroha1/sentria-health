import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Search, Pill, AlertTriangle } from 'lucide-react';
import { PatientService } from '../services/patient.service';
import type { Patient, Treatment } from '../types/patient';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function PatientCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [searchQuery, setSearchQuery] = useState('');

    // Generate static mock data (memoized to prevent hydration mismatches in real app, though here it's static)
    const patients = useMemo(() => PatientService.generateMockPatients(15), []);

    // Filter appointments for the current month
    const appointments = useMemo(() => {
        const apps: { day: number; patient: Patient; treatment: Treatment }[] = [];
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        patients.forEach(patient => {
            patient.treatmentSchedule.forEach(tx => {
                const txDate = new Date(tx.date);
                if (txDate.getFullYear() === year && txDate.getMonth() === month &&
                    (patient.name.toLowerCase().includes(searchQuery.toLowerCase()) || tx.drugName.toLowerCase().includes(searchQuery.toLowerCase()))) {
                    apps.push({
                        day: txDate.getDate(),
                        patient,
                        treatment: tx
                    });
                }
            });
        });
        return apps.sort((a, b) => new Date(a.treatment.date).getTime() - new Date(b.treatment.date).getTime());
    }, [patients, currentDate, searchQuery]);

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        return { days, firstDay };
    };

    const { days, firstDay } = getDaysInMonth(currentDate);

    const formatTime = (isoString: string) => {
        return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const handlePrevMonth = () => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
    const handleNextMonth = () => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));

    return (
        <div className="flex h-full flex-col gap-6 p-6">
            {/* Header */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Infusion Calendar</h1>
                    <p className="text-sm text-slate-500">Manage patient treatment schedules and inventory readiness.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search patient or drug..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="rounded-lg border border-slate-200 py-2 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                    </div>
                    <div className="flex items-center rounded-lg border border-slate-200 bg-white p-1">
                        <button onClick={handlePrevMonth} className="rounded-md p-1 hover:bg-slate-100">
                            <ChevronLeft className="h-5 w-5 text-slate-500" />
                        </button>
                        <span className="min-w-[140px] text-center font-bold text-slate-900">
                            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </span>
                        <button onClick={handleNextMonth} className="rounded-md p-1 hover:bg-slate-100">
                            <ChevronRight className="h-5 w-5 text-slate-500" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 overflow-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
                    {DAYS.map(day => (
                        <div key={day} className="py-3 text-center text-sm font-semibold text-slate-500">
                            {day}
                        </div>
                    ))}
                </div>
                <div className="grid h-full grid-cols-7 grid-rows-5 divide-x divide-y divide-slate-100">
                    {/* Empty cells for prev month */}
                    {Array.from({ length: firstDay }).map((_, i) => (
                        <div key={`empty-${i}`} className="bg-slate-50/50" />
                    ))}

                    {/* Days */}
                    {Array.from({ length: days }).map((_, i) => {
                        const day = i + 1;
                        const dayApps = appointments.filter(a => a.day === day);
                        const isToday = new Date().getDate() === day && new Date().getMonth() === currentDate.getMonth();

                        return (
                            <div key={day} className={`group min-h-[120px] p-2 transition-colors hover:bg-slate-50 ${isToday ? 'bg-blue-50/30' : ''}`}>
                                <div className="mb-2 flex items-center justify-between">
                                    <span className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium ${isToday ? 'bg-primary-600 text-white' : 'text-slate-700'
                                        }`}>
                                        {day}
                                    </span>
                                    {dayApps.length > 0 && (
                                        <span className="text-xs font-medium text-slate-400">{dayApps.length} appts</span>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    {dayApps.map((app, idx) => {
                                        // Mock inventory check: random yes/no
                                        const isInStock = Math.random() > 0.2;
                                        return (
                                            <div key={idx} className={`rounded border px-2 py-1.5 text-xs shadow-sm transition-all hover:scale-[1.02] ${isInStock
                                                ? 'border-emerald-100 bg-emerald-50 text-emerald-800'
                                                : 'border-red-100 bg-red-50 text-red-800'
                                                }`}>
                                                <div className="font-bold flex justify-between">
                                                    <span>{app.patient.name.split(' ')[1]}</span>
                                                    <span>{formatTime(app.treatment.date)}</span>
                                                </div>
                                                <div className="mt-0.5 flex items-center gap-1 opacity-90 truncate">
                                                    <Pill className="h-3 w-3" />
                                                    {app.treatment.drugName}
                                                </div>
                                                {!isInStock && (
                                                    <div className="mt-1 flex items-center gap-1 font-bold text-red-600">
                                                        <AlertTriangle className="h-3 w-3" />
                                                        Shortage
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
