import { Calendar } from 'lucide-react';
import { useState } from 'react';
import { format, subDays } from 'date-fns';

interface DateRangeSelectorProps {
    onRangeChange: (start: Date, end: Date) => void;
}

export function DateRangeSelector({ onRangeChange }: DateRangeSelectorProps) {
    const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    const presets = [
        { label: 'Last 7 Days', days: 7 },
        { label: 'Last 30 Days', days: 30 },
        { label: 'Last 90 Days', days: 90 },
    ];

    const handlePreset = (days: number) => {
        const end = new Date();
        const start = subDays(end, days);
        setStartDate(format(start, 'yyyy-MM-dd'));
        setEndDate(format(end, 'yyyy-MM-dd'));
        onRangeChange(start, end);
    };

    const handleCustomRange = () => {
        onRangeChange(new Date(startDate), new Date(endDate));
    };

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-4 w-4 text-slate-600" />
                <h3 className="text-sm font-medium text-slate-900">Date Range</h3>
            </div>

            <div className="flex gap-2 mb-3">
                {presets.map((preset) => (
                    <button
                        key={preset.label}
                        onClick={() => handlePreset(preset.days)}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                        {preset.label}
                    </button>
                ))}
            </div>

            <div className="flex gap-2">
                <div className="flex-1">
                    <label className="mb-1 block text-xs text-slate-600">Start Date</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
                    />
                </div>
                <div className="flex-1">
                    <label className="mb-1 block text-xs text-slate-600">End Date</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
                    />
                </div>
                <button
                    onClick={handleCustomRange}
                    className="self-end rounded-lg bg-primary-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-700"
                >
                    Apply
                </button>
            </div>
        </div>
    );
}
