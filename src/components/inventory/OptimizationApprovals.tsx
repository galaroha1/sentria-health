import { Check, X, ArrowRight, TrendingDown, AlertTriangle } from 'lucide-react';
import type { ProcurementProposal } from '../../types/procurement';

interface OptimizationApprovalsProps {
    proposals: ProcurementProposal[];
    onApprove: (proposal: ProcurementProposal) => void;
    onReject: (proposal: ProcurementProposal) => void;
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
                        <div className={`absolute right-0 top-0 rounded-bl-xl px-3 py-1 text-xs font-bold border-b border-l ${(proposal.regulatoryJustification?.riskScore || 0) > 0
                                ? 'bg-amber-50 text-amber-600 border-amber-100'
                                : 'bg-slate-50 text-slate-500 border-slate-100'
                            }`}>
                            Match Score: {proposal.score}
                        </div>

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            {/* Main Info */}
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${proposal.channel === '340B' ? 'bg-purple-50 text-purple-700 ring-purple-600/20' :
                                            proposal.channel === 'GPO' ? 'bg-blue-50 text-blue-700 ring-blue-600/20' :
                                                'bg-slate-50 text-slate-700 ring-slate-600/20'
                                        }`}>
                                        {proposal.channel}
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

                                {/* Compliance Justification */}
                                {proposal.regulatoryJustification && (
                                    <div className="mt-3 space-y-1">
                                        {proposal.regulatoryJustification.details.map((detail, idx) => (
                                            <div key={idx} className="flex items-start gap-1.5 text-xs text-emerald-700 bg-emerald-50/50 px-2 py-1 rounded border border-emerald-100">
                                                <Check className="h-3 w-3 mt-0.5 flex-shrink-0 text-emerald-600" />
                                                <span className="font-medium">{detail}</span>
                                            </div>
                                        ))}
                                        {(proposal.regulatoryJustification.riskScore || 0) > 0 && (
                                            <div className="flex items-center text-xs text-yellow-500 mt-1">
                                                <AlertTriangle className="w-3 h-3 mr-1.5" />
                                                Risk Score: {proposal.regulatoryJustification.riskScore}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* FDA Verification & Alternative Quotes */}
                                {proposal.alternativeQuotes && proposal.alternativeQuotes.length > 0 && (
                                    <div className="mt-4 rounded-lg bg-indigo-50 p-3 border border-indigo-100">

                                        {/* Header */}
                                        <div className="mb-2 flex items-center justify-between">
                                            <p className="text-xs font-bold text-indigo-900 uppercase tracking-wider">Live Supplier Intelligence</p>
                                            <span className="flex items-center gap-1 text-[10px] text-indigo-600 bg-white px-2 py-0.5 rounded-full border border-indigo-100 shadow-sm animate-pulse">
                                                <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span> Live Feed
                                            </span>
                                        </div>

                                        {/* Quotes List */}
                                        <div className="space-y-2">
                                            {proposal.alternativeQuotes.map((quote: any) => (
                                                <div key={quote.supplierId} className="flex items-center justify-between text-sm bg-white p-2 rounded border border-indigo-100 shadow-sm hover:border-indigo-300 transition-colors">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-slate-700 capitalize">{quote.supplierId}</span>
                                                        {quote.priceTrend === 'down' && (
                                                            <span className="flex items-center text-xs text-green-600 bg-green-50 px-1 rounded">
                                                                <TrendingDown className="h-3 w-3 mr-0.5" /> Price Drop
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-mono font-bold text-slate-900">${quote.price.toFixed(2)}</div>
                                                        <div className="text-xs text-slate-500">
                                                            {new Date(quote.deliveryDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: 'numeric' })}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Cost Analysis & Actions */}
                            <div className="flex flex-col gap-4 sm:items-end">
                                <div className="flex flex-col gap-2 min-w-[200px] rounded-lg bg-slate-50 p-3 text-sm">
                                    <div className="flex justify-between text-slate-600">
                                        <span>Est. Cost:</span>
                                        <span className="font-mono font-medium">${proposal.costAnalysis.totalCost.toLocaleString()}</span>
                                    </div>
                                    {proposal.costAnalysis.savings && proposal.costAnalysis.savings > 0 && (
                                        <div className="flex justify-between text-emerald-600 font-bold border-t border-slate-200 pt-1 mt-1">
                                            <span className="flex items-center gap-1"><TrendingDown className="h-3 w-3" /> Savings:</span>
                                            <span className="font-mono">${proposal.costAnalysis.savings.toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-2 sm:flex-col">
                                    <button
                                        onClick={() => onApprove(proposal)}
                                        className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 shadow-sm transition-colors"
                                    >
                                        <Check className="h-4 w-4" />
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => onReject(proposal)}
                                        className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                                    >
                                        <X className="h-4 w-4" />
                                        Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
