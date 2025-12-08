import { TrendingUp, ArrowRight, DollarSign } from 'lucide-react';
import type { SuggestedTransfer } from '../../types/transfer';
import { useFirestore } from '../../hooks/useFirestore';
export function SuggestedTransfers({ onInitiate }: { onInitiate: (suggestion: SuggestedTransfer) => void }) {
    const { data: suggestions, loading, error } = useFirestore<SuggestedTransfer>('suggestedTransfers');
    if (loading) return <div>Loading suggestions...</div>;
    if (error) return <div>Error loading suggestions.</div>;
    return (
        <div className="space-y-4">
            {suggestions.map((suggestion) => (
                <div key={suggestion.id} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-start justify-between">
                        <div className="flex items-center gap-2">
                            <span className={`rounded-full px-2 py-1 text-xs font-medium ${suggestion.priority === 'high' ? 'bg-red-50 text-red-700' :
                                suggestion.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                                    'bg-blue-100 text-blue-700'
                                }`}>
                                {suggestion.priority.toUpperCase()} PRIORITY
                            </span>
                        </div>
                        {suggestion.potentialSavings && (
                            <div className="flex items-center gap-1 text-emerald-600">
                                <DollarSign className="h-4 w-4" />
                                <span className="text-sm font-bold">${suggestion.potentialSavings.toLocaleString()} savings</span>
                            </div>
                        )}
                    </div>

                    <h3 className="text-lg font-bold text-slate-900">{suggestion.drug.name}</h3>
                    <p className="mt-1 text-sm text-slate-500">NDC: {suggestion.drug.ndc}</p>

                    <div className="mt-4 flex items-center gap-4">
                        <div className="flex-1 rounded-lg bg-emerald-50 p-3">
                            <p className="text-xs font-medium text-emerald-700">Source (Overstocked)</p>
                            <p className="mt-1 text-sm font-bold text-slate-900">{suggestion.sourceDepartment.name}</p>
                            <p className="mt-1 text-xs text-slate-600">{suggestion.sourceQuantity} units available</p>
                        </div>

                        <ArrowRight className="h-5 w-5 flex-shrink-0 text-slate-400" />

                        <div className="flex-1 rounded-lg bg-amber-50 p-3">
                            <p className="text-xs font-medium text-amber-700">Destination (Low Stock)</p>
                            <p className="mt-1 text-sm font-bold text-slate-900">{suggestion.destinationDepartment.name}</p>
                            <p className="mt-1 text-xs text-slate-600">Needs {suggestion.destinationNeed} units</p>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2 rounded-lg bg-slate-50 p-3">
                        <TrendingUp className="h-4 w-4 text-primary-600" />
                        <p className="text-sm text-slate-700">{suggestion.reason}</p>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                        <div className="text-sm">
                            <span className="font-medium text-slate-900">Suggested transfer: </span>
                            <span className="font-bold text-slate-900">{suggestion.suggestedQuantity} units</span>
                        </div>
                        <button
                            onClick={() => onInitiate(suggestion)}
                            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                        >
                            Initiate Transfer
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
