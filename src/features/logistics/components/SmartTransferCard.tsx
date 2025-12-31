import { ArrowRight, TrendingUp, Clock, DollarSign, ShoppingCart } from 'lucide-react';
import type { TransferSuggestion, Site } from '../../types/location';

interface SmartTransferCardProps {
    suggestion: TransferSuggestion;
    sourceSite?: Site;
    targetSite: Site;
    onApprove: (suggestion: TransferSuggestion) => void;
    onDismiss: (id: string) => void;
}

export function SmartTransferCard({ suggestion, sourceSite, targetSite, onApprove, onDismiss }: SmartTransferCardProps) {
    const isBuy = suggestion.action === 'buy';

    return (
        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
            {/* Background Pattern */}
            <div className={`absolute top-0 right-0 h-24 w-24 translate-x-8 translate-y--8 transform rounded-full opacity-10 ${isBuy ? 'bg-blue-500' : 'bg-primary-500'}`} />

            <div className="mb-4 flex items-start justify-between relative z-10">
                <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${isBuy ? 'bg-blue-50 text-primary-600' : 'bg-primary-50 text-primary-600'}`}>
                        {isBuy ? <ShoppingCart className="h-5 w-5" /> : <TrendingUp className="h-5 w-5" />}
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-900">{isBuy ? 'Market Opportunity' : 'Network Balancing'}</h4>
                        <p className="text-xs text-slate-500">
                            AI Confidence: <span className="font-medium text-green-600">{suggestion.priorityScore}%</span>
                        </p>
                    </div>
                </div>
                <div className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${suggestion.urgency === 'emergency' ? 'bg-red-50 text-red-700' :
                    suggestion.urgency === 'urgent' ? 'bg-amber-50 text-amber-700' :
                        'bg-slate-100 text-slate-600'
                    }`}>
                    {suggestion.urgency}
                </div>
            </div>

            {/* Action Visual */}
            <div className="mb-4 flex items-center justify-between rounded-lg bg-slate-50 p-3">
                <div className="flex flex-col">
                    <span className="text-xs text-slate-500">Source</span>
                    <span className="text-sm font-medium text-slate-700 truncate max-w-[100px]" title={isBuy ? suggestion.externalSourceId : sourceSite?.name}>
                        {isBuy ? suggestion.externalSourceId : sourceSite?.name}
                    </span>
                </div>
                <div className="flex flex-col items-center px-2">
                    <div className="h-[1px] w-12 bg-slate-300 relative top-3"></div>
                    <ArrowRight className="h-4 w-4 text-slate-400 relative z-10 bg-slate-50 px-1" />
                    <span className="text-[10px] text-slate-400 mt-1 uppercase">
                        {suggestion.transportMethod.replace('_', ' ')}
                    </span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-xs text-slate-500">Destination</span>
                    <span className="text-sm font-medium text-slate-700 truncate max-w-[100px]">{targetSite.name}</span>
                </div>
            </div>

            <div className="mb-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 flex items-center gap-1.5">
                        <span className="font-medium text-slate-900">{suggestion.drugName}</span>
                    </span>
                    <span className="font-mono font-medium text-slate-900">{suggestion.quantity} units</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm font-medium text-slate-900">
                    {suggestion.action === 'buy' ? (
                        <span className="text-emerald-700">{suggestion.externalSourceId}</span>
                    ) : (
                        // Priority: Explicit Dept Name > Site Name Lookup > ID
                        <span>{suggestion.sourceDepartmentName || sourceSite?.name || suggestion.sourceSiteId}</span>
                    )}
                </div>
                {suggestion.reason.map((reason, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-600 bg-slate-50/50 p-1.5 rounded">
                        <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary-500 shrink-0" />
                        {reason}
                    </div>
                ))}
            </div>

            <div className="flex gap-3 relative z-10">
                <button
                    onClick={() => onDismiss(suggestion.id)}
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                >
                    Dismiss
                </button>
                <button
                    onClick={() => onApprove(suggestion)}
                    className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors ${isBuy ? 'bg-primary-600 hover:bg-blue-700' : 'bg-slate-900 hover:bg-slate-800'}`}
                >
                    {isBuy ? 'Purchase & Ship' : 'Approve Transfer'}
                </button>
            </div>

            {/* Quick Stats Overlay (if applicable) */}
            {suggestion.action === 'buy' && (
                <div className="mt-3 flex items-center gap-4 text-xs text-slate-500 border-t pt-2 border-slate-100">
                    <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" /> Cost: ${suggestion.estimatedCost}
                    </span>
                    <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Time: {Math.round(suggestion.estimatedTimeMinutes / 60)}h
                    </span>
                </div>
            )}
        </div>
    );
}
