import { ArrowRight, Plane, Truck, Bike, Clock, DollarSign, BrainCircuit } from 'lucide-react';
import type { TransferSuggestion } from '../../types/location';
import type { Site } from '../../types/location';

interface SmartTransferCardProps {
    suggestion: TransferSuggestion;
    sourceSite: Site;
    targetSite: Site;
    onApprove: (suggestion: TransferSuggestion) => void;
    onDismiss: (id: string) => void;
}

export function SmartTransferCard({ suggestion, sourceSite, targetSite, onApprove, onDismiss }: SmartTransferCardProps) {
    const TransportIcon = {
        'drone': Plane,
        'courier_bike': Bike,
        'courier_car': Truck,
        'van_refrigerated': Truck, // Could use Snowflake icon overlay
        'freight': Truck
    }[suggestion.transportMethod];

    return (
        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
            {/* AI Badge */}
            <div className="absolute top-0 right-0 rounded-bl-xl bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700 flex items-center gap-1">
                <BrainCircuit className="h-3 w-3" />
                AI Optimized
            </div>

            <div className="mb-4 flex items-start justify-between pr-24">
                <div>
                    <h4 className="font-bold text-slate-900">{suggestion.drugName}</h4>
                    <p className="text-sm text-slate-500">Suggestion: Transfer {suggestion.quantity} units</p>
                </div>
            </div>

            {/* Route Visualization */}
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-slate-50 p-3 text-sm">
                <div className="flex-1 truncate text-right font-medium text-slate-700">{sourceSite.name}</div>
                <div className="flex flex-col items-center px-2">
                    <span className="text-[10px] text-slate-400">{suggestion.estimatedTimeMinutes} min</span>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                    <TransportIcon className="h-4 w-4 text-primary-600" />
                </div>
                <div className="flex-1 truncate text-left font-medium text-slate-700">{targetSite.name}</div>
            </div>

            {/* Logic Explanation */}
            <div className="mb-4 space-y-1">
                {suggestion.reason.map((reason, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        {reason}
                    </div>
                ))}
            </div>

            {/* Stats Footer */}
            <div className="mb-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                <div className="flex items-center gap-1 text-slate-600">
                    <Clock className="h-3 w-3" />
                    {suggestion.estimatedTimeMinutes} min ETA
                </div>
                <div className="flex items-center gap-1 text-slate-600">
                    <DollarSign className="h-3 w-3" />
                    ${suggestion.estimatedCost.toFixed(2)} est.
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                <button
                    onClick={() => onDismiss(suggestion.id)}
                    className="flex-1 rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                    Dismiss
                </button>
                <button
                    onClick={() => onApprove(suggestion)}
                    className="flex-1 rounded-lg bg-slate-900 py-2 text-sm font-medium text-white hover:bg-slate-800"
                >
                    Approve
                </button>
            </div>
        </div>
    );
}
