import { useState } from 'react';
import { Brain, Link as LinkIcon, Zap, Activity, Play, Calendar as CalendarIcon, MapPin, Truck, Package, CheckCircle2, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    addMonths,
    subMonths,
    isSameMonth,
    isSameDay,
    addDays,
    addWeeks,
    subWeeks,
    isToday
} from 'date-fns';

interface SimulationResult {
    id: string;
    date: Date;
    timeStr: string;
    patientName: string;
    condition: string;
    visitType: string;
    location: string;
    drug: string;
    acquisitionMethod: 'White Bag' | 'Brown Bag' | 'Clear Bag';
    status: 'Scheduled' | 'Transport Needed' | 'In Stock';
}

type CalendarView = 'month' | 'week' | 'day';

export function AdvancedTab() {
    const [isSimulating, setIsSimulating] = useState(false);
    const [simulationResults, setSimulationResults] = useState<SimulationResult[]>([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<CalendarView>('month');

    const runSimulation = () => {
        setIsSimulating(true);
        // Simulate processing time
        setTimeout(() => {
            const today = new Date();
            const results: SimulationResult[] = [
                {
                    id: 'sim-1',
                    date: addDays(today, 1),
                    timeStr: '09:00 AM',
                    patientName: 'Sarah Connor',
                    condition: 'Oncology - Cycle 3',
                    visitType: 'Infusion Therapy',
                    location: 'Infusion Center A',
                    drug: 'Keytruda (Pembrolizumab)',
                    acquisitionMethod: 'White Bag',
                    status: 'Transport Needed'
                },
                {
                    id: 'sim-2',
                    date: addDays(today, 1),
                    timeStr: '10:30 AM',
                    patientName: 'James Howlett',
                    condition: 'Rheumatoid Arthritis',
                    visitType: 'Follow-up Injection',
                    location: 'Clinic North',
                    drug: 'Remicade (Infliximab)',
                    acquisitionMethod: 'Clear Bag',
                    status: 'In Stock'
                },
                {
                    id: 'sim-3',
                    date: addDays(today, 2),
                    timeStr: '02:00 PM',
                    patientName: 'Wade Wilson',
                    condition: 'Immunotherapy',
                    visitType: 'New Patient Consult',
                    location: 'Main Hospital - Oncology',
                    drug: 'Opdivo (Nivolumab)',
                    acquisitionMethod: 'Brown Bag',
                    status: 'Scheduled'
                },
                {
                    id: 'sim-4',
                    date: addDays(today, 3),
                    timeStr: '08:45 AM',
                    patientName: 'Jean Grey',
                    condition: 'Multiple Sclerosis',
                    visitType: 'Routine Infusion',
                    location: 'Neurology Wing',
                    drug: 'Ocrevus (Ocrelizumab)',
                    acquisitionMethod: 'White Bag',
                    status: 'Transport Needed'
                },
                {
                    id: 'sim-5',
                    date: addDays(today, 5),
                    timeStr: '11:00 AM',
                    patientName: 'Tony Stark',
                    condition: 'Cardiac Support',
                    visitType: 'Check-up',
                    location: 'Cardiology Dept',
                    drug: 'Entresto',
                    acquisitionMethod: 'Clear Bag',
                    status: 'In Stock'
                },
                {
                    id: 'sim-6',
                    date: addDays(today, 12),
                    timeStr: '01:30 PM',
                    patientName: 'Bruce Banner',
                    condition: 'Stress Management',
                    visitType: 'Therapy Session',
                    location: 'Psychiatry Wing',
                    drug: 'Lexapro',
                    acquisitionMethod: 'Brown Bag',
                    status: 'Scheduled'
                }
            ];
            setSimulationResults(results);
            setIsSimulating(false);
        }, 1500);
    };

    const nextPeriod = () => {
        if (view === 'month') setCurrentDate(addMonths(currentDate, 1));
        else if (view === 'week') setCurrentDate(addWeeks(currentDate, 1));
        else setCurrentDate(addDays(currentDate, 1));
    };

    const prevPeriod = () => {
        if (view === 'month') setCurrentDate(subMonths(currentDate, 1));
        else if (view === 'week') setCurrentDate(subWeeks(currentDate, 1));
        else setCurrentDate(addDays(currentDate, -1));
    };

    const renderHeader = () => {
        const dateFormat = view === 'month' ? 'MMMM yyyy' : 'MMMM d, yyyy';
        return (
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                    <button onClick={prevPeriod} className="rounded-full p-1 hover:bg-slate-100">
                        <ChevronLeft className="h-5 w-5 text-slate-600" />
                    </button>
                    <h3 className="min-w-[150px] text-center text-lg font-bold text-slate-900">
                        {format(currentDate, dateFormat)}
                    </h3>
                    <button onClick={nextPeriod} className="rounded-full p-1 hover:bg-slate-100">
                        <ChevronRight className="h-5 w-5 text-slate-600" />
                    </button>
                </div>
                <div className="flex rounded-lg bg-slate-100 p-1">
                    {(['month', 'week', 'day'] as CalendarView[]).map((v) => (
                        <button
                            key={v}
                            onClick={() => setView(v)}
                            className={`rounded-md px-3 py-1 text-sm font-medium capitalize transition-all ${view === v ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {v}
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    const renderMonthView = () => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const days = eachDayOfInterval({ start: startDate, end: endDate });
        const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        return (
            <div className="rounded-lg border border-slate-200">
                <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
                    {weekDays.map(day => (
                        <div key={day} className="py-2 text-center text-xs font-semibold text-slate-500 uppercase">
                            {day}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 auto-rows-[minmax(100px,auto)] divide-x divide-y divide-slate-200 bg-white">
                    {days.map((day) => {
                        const dayEvents = simulationResults.filter(r => isSameDay(r.date, day));
                        return (
                            <div
                                key={day.toString()}
                                className={`min-h-[100px] p-2 transition-colors hover:bg-slate-50 ${!isSameMonth(day, monthStart) ? 'bg-slate-50/50 text-slate-400' : ''
                                    } ${isToday(day) ? 'bg-blue-50/30' : ''}`}
                            >
                                <div className={`mb-1 flex justify-between`}>
                                    <span className={`text-sm font-medium ${isToday(day) ? 'flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white' : ''}`}>
                                        {format(day, 'd')}
                                    </span>
                                    {dayEvents.length > 0 && (
                                        <span className="text-[10px] font-bold text-slate-400">{dayEvents.length} events</span>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    {dayEvents.map(event => (
                                        <div key={event.id} className="cursor-pointer rounded border border-slate-100 bg-white p-1.5 shadow-sm hover:border-blue-200">
                                            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-700">
                                                <Clock className="h-3 w-3" /> {event.timeStr}
                                            </div>
                                            <div className="truncate text-xs font-medium text-purple-700" title={event.drug}>
                                                {event.drug}
                                            </div>
                                            <div className="truncate text-[10px] text-slate-500">
                                                {event.location}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderWeekView = () => {
        const startDate = startOfWeek(currentDate);
        const endDate = endOfWeek(currentDate);
        const days = eachDayOfInterval({ start: startDate, end: endDate });

        return (
            <div className="grid grid-cols-7 gap-2">
                {days.map(day => {
                    const dayEvents = simulationResults.filter(r => isSameDay(r.date, day));
                    return (
                        <div key={day.toString()} className="flex flex-col rounded-lg border border-slate-200 bg-white">
                            <div className={`border-b border-slate-100 p-2 text-center ${isToday(day) ? 'bg-blue-50' : 'bg-slate-50'}`}>
                                <div className="text-xs font-medium text-slate-500 uppercase">{format(day, 'EEE')}</div>
                                <div className={`mx-auto mt-1 flex h-8 w-8 items-center justify-center rounded-full text-lg font-bold ${isToday(day) ? 'bg-blue-600 text-white' : 'text-slate-900'}`}>
                                    {format(day, 'd')}
                                </div>
                            </div>
                            <div className="flex-1 space-y-2 p-2">
                                {dayEvents.map(event => (
                                    <div key={event.id} className="rounded-lg border border-slate-100 bg-white p-2 shadow-sm hover:border-blue-200">
                                        <div className="mb-1 flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-700">{event.timeStr}</span>
                                            <span className={`h-2 w-2 rounded-full ${event.status === 'Transport Needed' ? 'bg-amber-500' : 'bg-emerald-500'
                                                }`} />
                                        </div>
                                        <p className="text-xs font-medium text-purple-700 line-clamp-2">{event.drug}</p>
                                        <p className="text-[10px] text-slate-500 mt-1">{event.patientName}</p>
                                    </div>
                                ))}
                                {dayEvents.length === 0 && (
                                    <div className="py-8 text-center text-xs text-slate-400 italic">No events</div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderDayView = () => {
        const dayEvents = simulationResults.filter(r => isSameDay(r.date, currentDate));

        return (
            <div className="rounded-lg border border-slate-200 bg-white">
                <div className="border-b border-slate-200 bg-slate-50 p-4 text-center">
                    <h3 className="text-xl font-bold text-slate-900">{format(currentDate, 'EEEE, MMMM do')}</h3>
                    <p className="text-sm text-slate-500">{dayEvents.length} scheduled events</p>
                </div>
                <div className="divide-y divide-slate-100">
                    {dayEvents.length > 0 ? (
                        dayEvents.map(event => (
                            <div key={event.id} className="flex items-start gap-4 p-4 hover:bg-slate-50">
                                <div className="flex w-24 flex-col items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-2 text-center">
                                    <Clock className="mb-1 h-5 w-5 text-slate-400" />
                                    <span className="text-sm font-bold text-slate-900">{event.timeStr}</span>
                                </div>
                                <div className="flex-1">
                                    <div className="mb-1 flex items-center justify-between">
                                        <h4 className="font-bold text-slate-900">{event.drug}</h4>
                                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${event.status === 'Transport Needed' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                                            }`}>
                                            {event.status === 'Transport Needed' ? <Truck className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                                            {event.status}
                                        </span>
                                    </div>
                                    <div className="mb-2 flex items-center gap-4 text-sm text-slate-500">
                                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {event.location}</span>
                                        <span className="flex items-center gap-1"><Package className="h-3 w-3" /> {event.acquisitionMethod}</span>
                                    </div>
                                    <div className="rounded-md bg-slate-50 p-2 text-sm text-slate-600">
                                        <span className="font-medium">Patient:</span> {event.patientName} • <span className="font-medium">Visit:</span> {event.visitType}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-12 text-center text-slate-500">
                            No logistics events scheduled for this day.
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
                {/* AI Simulation Control */}
                <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-purple-100 p-2 text-purple-600">
                                <Brain className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">AI Demand Simulation</h3>
                                <p className="text-sm text-slate-500">Patient-centric forecasting & logistics planning</p>
                            </div>
                        </div>
                        <button
                            onClick={runSimulation}
                            disabled={isSimulating}
                            className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
                        >
                            {isSimulating ? (
                                <>
                                    <Activity className="h-4 w-4 animate-spin" />
                                    Running Simulation...
                                </>
                            ) : (
                                <>
                                    <Play className="h-4 w-4" />
                                    Run Simulation
                                </>
                            )}
                        </button>
                    </div>

                    {/* Calendar Component */}
                    {simulationResults.length > 0 ? (
                        <div className="mt-6">
                            {renderHeader()}
                            {view === 'month' && renderMonthView()}
                            {view === 'week' && renderWeekView()}
                            {view === 'day' && renderDayView()}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 py-12 text-center">
                            <div className="mb-4 rounded-full bg-slate-50 p-4">
                                <CalendarIcon className="h-8 w-8 text-slate-300" />
                            </div>
                            <h4 className="font-medium text-slate-900">Simulation Not Started</h4>
                            <p className="text-sm text-slate-500">Run the simulation to populate the logistics calendar.</p>
                        </div>
                    )}
                </div>

                {/* Blockchain Ledger */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="rounded-lg bg-indigo-100 p-2 text-indigo-600">
                            <LinkIcon className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Blockchain Ledger</h3>
                            <p className="text-sm text-slate-500">Immutable chain-of-custody tracking</p>
                        </div>
                    </div>

                    <div className="relative border-l-2 border-slate-200 pl-6 space-y-6">
                        <div className="relative">
                            <div className="absolute -left-[31px] top-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-500 shadow-sm" />
                            <p className="font-mono text-xs text-slate-400">TX: 0x8f2...9a1 • 10 mins ago</p>
                            <p className="font-medium text-slate-900">Administered: Remicade (Lot: K99)</p>
                            <p className="text-sm text-slate-500">Verified by Dr. Smith (ID: P-102)</p>
                        </div>
                        <div className="relative">
                            <div className="absolute -left-[31px] top-1 h-4 w-4 rounded-full border-2 border-white bg-blue-500 shadow-sm" />
                            <p className="font-mono text-xs text-slate-400">TX: 0x3d1...b4c • 2 hours ago</p>
                            <p className="font-medium text-slate-900">Transfer: Warehouse &rarr; Clinic A</p>
                            <p className="text-sm text-slate-500">Auto-verified by IoT Sensor #442</p>
                        </div>
                        <div className="relative">
                            <div className="absolute -left-[31px] top-1 h-4 w-4 rounded-full border-2 border-white bg-slate-400 shadow-sm" />
                            <p className="font-mono text-xs text-slate-400">TX: 0x1a9...f22 • 5 hours ago</p>
                            <p className="font-medium text-slate-900">Received: Shipment #PO-992</p>
                            <p className="text-sm text-slate-500">Signed by Receiving Dept.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="rounded-full bg-white/10 p-3">
                            <Zap className="h-6 w-6 text-yellow-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">System Optimization Score</h3>
                            <p className="text-slate-300">Based on efficiency, waste reduction, and compliance</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-3xl font-bold">94/100</p>
                        <p className="text-sm text-emerald-400 flex items-center justify-end gap-1">
                            <Activity className="h-3 w-3" /> +2.4% this week
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
