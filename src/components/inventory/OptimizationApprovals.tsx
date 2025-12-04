import { Check, X, ArrowRight, TrendingDown } from 'lucide-react';
import type { OptimizationProposal } from '../../services/optimization.service';

interface OptimizationApprovalsProps {
    proposals: OptimizationProposal[];
    onApprove: (proposal: OptimizationProposal) => void;
    onReject: (proposal: OptimizationProposal) => void;
}

export function OptimizationApprovals({ proposals, onApprove, onReject }: OptimizationApprovalsProps) {
    if (proposals.length === 0) return null;

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Optimization Proposals</h3>
                <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
                    {proposals.length} Actions Proposed
                </span>
            </div>

            <div className="grid gap-4">
                {proposals.map((proposal) => (
                    <div key={proposal.id} className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
                        {/* Score Indicator */}
                        <div className="absolute right-0 top-0 rounded-bl-xl bg-slate-50 px-3 py-1 text-xs font-bold text-slate-500 border-b border-l border-slate-100">
                            Score: {proposal.score}
                        </div>

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            {/* Main Info */}
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${proposal.type === 'transfer'
                                        ? 'bg-blue-50 text-blue-700 ring-blue-600/20'
                                        : 'bg-amber-50 text-amber-700 ring-amber-600/20'
                                        }`}>
                                        {proposal.type === 'transfer' ? 'Network Transfer' : 'Procurement'}
                                    </span>
                                    <h4 className="font-bold text-slate-900">{proposal.drugName}</h4>
                                    <span className="text-sm text-slate-500">({proposal.quantity} units)</span>
                                </div>

                                <div className="flex items-center gap-3 text-sm text-slate-600">
                                    <span className="font-medium">{proposal.sourceSiteName || proposal.vendorName}</span>
                                    <ArrowRight className="h-4 w-4 text-slate-400" />
                                    <span className="font-medium">{proposal.targetSiteName}</span>
                                </div>

                                <p className="mt-2 text-sm text-slate-500 italic">
                                    "{proposal.reason}"
                                </p>
                            </div>

                            {/* Cost Analysis */}
                            <div className="flex flex-col gap-2 min-w-[200px] rounded-lg bg-slate-50 p-3 text-sm">
                                <div className="flex justify-between text-slate-600">
                                    <span>Distance:</span>
                                    <span className="font-mono">{proposal.costAnalysis.distanceKm} km</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>Est. Cost:</span>
                                    <span className="font-mono font-medium">${proposal.costAnalysis.totalCost}</span>
                                </div>
                                {proposal.costAnalysis.savings && proposal.costAnalysis.savings > 0 && (
                                    <div className="flex justify-between text-emerald-600 font-bold border-t border-slate-200 pt-1 mt-1">
                                        <span className="flex items-center gap-1"><TrendingDown className="h-3 w-3" /> Savings:</span>
                                        <span className="font-mono">${proposal.costAnalysis.savings}</span>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 sm:flex-col">
                                <button
                                    onClick={() => onApprove(proposal)}
                                    className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 shadow-sm"
                                >
                                    <Check className="h-4 w-4" />
                                    Approve
                                </button>
                                <button
                                    onClick={() => onReject(proposal)}
                                    className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                >
                                    <X className="h-4 w-4" />
                                    Reject
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
