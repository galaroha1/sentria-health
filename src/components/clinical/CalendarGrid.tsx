
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarEvent {
    id: string;
    date: Date;
    type: 'surgery' | 'treatment' | 'appointment';
    title: string;
    patientName: string;
}

interface CalendarGridProps {
    currentDate: Date;
    events: CalendarEvent[];
    onDateChange: (date: Date) => void;
    onSelectDate: (date: Date) => void;
    selectedDate: Date | null;
    highlightedDates?: Date[]; // NEW: Dates matching search query
}

export function CalendarGrid({ currentDate, events, onDateChange, onSelectDate, selectedDate, highlightedDates = [] }: CalendarGridProps) {
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

    const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    const handlePrevMonth = () => {
        onDateChange(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        onDateChange(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const getEventsForDay = (day: number) => {
        const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
        return events.filter(e => e.date.toDateString() === dateStr);
    };

    return (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <h3 className="text-lg font-bold text-slate-900">{monthName}</h3>
                <div className="flex items-center gap-2">
                    <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button onClick={() => onDateChange(new Date())} className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                        Today
                    </button>
                    <button onClick={handleNextMonth} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Grid Header */}
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="py-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        {day}
                    </div>
                ))}
            </div>

            {/* Grid Body */}
            <div className="grid grid-cols-7 auto-rows-[120px] divide-x divide-slate-100 border-b border-slate-200">
                {blanks.map(i => (
                    <div key={`blank-${i}`} className="bg-slate-50/50" />
                ))}

                {days.map(day => {
                    const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                    const dayEvents = getEventsForDay(day);
                    const isToday = new Date().toDateString() === dateObj.toDateString();
                    const isSelected = selectedDate?.getDate() === day && selectedDate?.getMonth() === currentDate.getMonth();

                    // Check if this date needs highlighting
                    const isHighlighted = highlightedDates.some(d => d.toDateString() === dateObj.toDateString());

                    const surgeryCount = dayEvents.filter(e => e.type === 'surgery').length;
                    const treatmentCount = dayEvents.filter(e => e.type !== 'surgery').length;

                    return (
                        <div
                            key={day}
                            onClick={() => onSelectDate(dateObj)}
                            className={`p-2 transition-all cursor-pointer flex flex-col justify-between group relative
                                ${isSelected ? 'bg-blue-50 ring-2 ring-inset ring-blue-500' : ''}
                                ${isToday ? 'bg-primary-50/30' : ''}
                                ${isHighlighted ? 'bg-yellow-50 ring-2 ring-inset ring-yellow-400 z-10' : 'hover:bg-blue-50/50'}
                            `}
                        >
                            {/* Highlight Badge */}
                            {isHighlighted && (
                                <div className="absolute -top-1 -right-1 z-20">
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                                    </span>
                                </div>
                            )}

                            <div className="flex justify-between items-start">
                                <span className={`text-sm font-medium h-7 w-7 flex items-center justify-center rounded-full ${isToday ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-700'
                                    }`}>
                                    {day}
                                </span>
                                {dayEvents.length > 0 && !isHighlighted && (
                                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                                )}
                            </div>

                            <div className="space-y-1">
                                {surgeryCount > 0 && (
                                    <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-amber-50 border border-amber-100 text-xs font-medium text-amber-700 truncate">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                                        {surgeryCount} Surgeries
                                    </div>
                                )}
                                {treatmentCount > 0 && (
                                    <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-blue-50 border border-blue-100 text-xs font-medium text-blue-700 truncate">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                                        {treatmentCount} Treatments
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
