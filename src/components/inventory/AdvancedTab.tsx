import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Link as LinkIcon, Zap, Activity, Play, Calendar as CalendarIcon, MapPin, Truck, Package, CheckCircle2, ChevronLeft, ChevronRight, Clock, ShoppingCart, Loader2, UserPlus } from 'lucide-react';
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
import { useCart } from '../../context/CartContext';
import { useApp } from '../../context/AppContext';
import { useSimulation, type SimulationResult } from '../../context/SimulationContext';
import { AddPatientModal } from './AddPatientModal';

type CalendarView = 'month' | 'week' | 'day';

export function AdvancedTab() {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { addNotification } = useApp();
    const {
        simulationResults,
        isSimulating,
        runSimulation,
        scanningPatient,
        viewPatientDetails
    } = useSimulation();

    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<CalendarView>('month');

    const [showAddPatient, setShowAddPatient] = useState(false);

    const handleDayClick = (day: Date) => {
        setCurrentDate(day);
        setView('day');
    };

    const handleOrderDrug = (event: SimulationResult) => {
        addToCart({
            id: Math.floor(Math.random() * 10000), // Mock ID
            name: event.drug,
            price: event.price,
            quantity: 1,
            seller: 'Sentria Logistics'
        });
        addNotification({
            id: Date.now().toString(),
            type: 'success',
            message: `Added ${event.drug} to cart`,
            timestamp: new Date().toISOString(),
            read: false,
            category: 'system',
            title: 'Order Added'
        });
        navigate('/cart');
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
                                onClick={() => handleDayClick(day)}
                                className={`min-h-[100px] p-2 transition-colors hover:bg-slate-50 cursor-pointer ${!isSameMonth(day, monthStart) ? 'bg-slate-50/50 text-slate-400' : ''
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
                                        <div
                                            key={event.id}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                viewPatientDetails(event);
                                            }}
                                            className="rounded border border-slate-100 bg-white p-1.5 shadow-sm hover:border-blue-200 hover:bg-blue-50 transition-colors"
                                        >
                                            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-700">
                                                <Clock className="h-3 w-3" /> {event.timeStr}
                                            </div>
                                            <div className="truncate text-xs font-medium text-purple-700" title={event.drug}>
                                                {event.drug}
                                            </div>
                                            <div className="truncate text-[10px] text-slate-500">
                                                {event.patientName}
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
                        <div
                            key={day.toString()}
                            onClick={() => handleDayClick(day)}
                            className="flex flex-col rounded-lg border border-slate-200 bg-white cursor-pointer hover:border-blue-300 transition-colors"
                        >
                            <div className={`border-b border-slate-100 p-2 text-center ${isToday(day) ? 'bg-blue-50' : 'bg-slate-50'}`}>
                                <div className="text-xs font-medium text-slate-500 uppercase">{format(day, 'EEE')}</div>
                                <div className={`mx-auto mt-1 flex h-8 w-8 items-center justify-center rounded-full text-lg font-bold ${isToday(day) ? 'bg-blue-600 text-white' : 'text-slate-900'}`}>
                                    {format(day, 'd')}
                                </div>
                            </div>
                            <div className="flex-1 space-y-2 p-2">
                                {dayEvents.map(event => (
                                    <div
                                        key={event.id}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            viewPatientDetails(event);
                                        }}
                                        className="rounded-lg border border-slate-100 bg-white p-2 shadow-sm hover:border-blue-200 hover:bg-blue-50 transition-colors"
                                    >
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
                                        <span className="font-medium">Patient:</span>
                                        <button
                                            onClick={() => viewPatientDetails(event)}
                                            className="ml-1 font-semibold text-blue-600 hover:underline"
                                        >
                                            {event.patientName}
                                        </button>
                                        • <span className="font-medium">Visit:</span> {event.visitType}
                                    </div>
                                    <div className="mt-3">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleOrderDrug(event);
                                            }}
                                            className="flex items-center gap-2 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                                        >
                                            <ShoppingCart className="h-3 w-3" />
                                            Order Drug Now
                                        </button>
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
                <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm relative overflow-hidden">
                    {/* Scanning Overlay */}
                    {isSimulating && (
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm">
                            <div className="relative mb-6">
                                <div className="absolute inset-0 animate-ping rounded-full bg-purple-200 opacity-75"></div>
                                <div className="relative rounded-full bg-purple-100 p-4">
                                    <Brain className="h-12 w-12 text-purple-600 animate-pulse" />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Analyzing Patient Data</h3>
                            <div className="flex items-center gap-2 text-slate-500">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="font-mono text-sm">Scanning: {scanningPatient}</span>
                            </div>
                            <div className="mt-8 w-64 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-purple-600 animate-[progress_3s_ease-in-out_infinite]" style={{ width: '100%' }}></div>
                            </div>
                        </div>
                    )}

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
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowAddPatient(true)}
                                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                                <UserPlus className="h-4 w-4" />
                                Add Patient
                            </button>
                            <button
                                onClick={runSimulation}
                                disabled={isSimulating}
                                className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
                            >
                                {isSimulating ? (
                                    <>
                                        <Activity className="h-4 w-4 animate-spin" />
                                        Running...
                                    </>
                                ) : (
                                    <>
                                        <Play className="h-4 w-4" />
                                        Run Simulation
                                    </>
                                )}
                            </button>
                        </div>
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

            {showAddPatient && (
                <AddPatientModal onClose={() => setShowAddPatient(false)} />
            )}
        </div>
    );
}
