import { DollarSign, ArrowRight, Sparkles, CheckCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';

export function CostOptimizer() {
    const { metrics } = useApp();
    const navigate = useNavigate();
    const hasSavings = metrics.potentialSavings > 0;

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                    <DollarSign className="h-5 w-5 text-emerald-600" />
                    Cost Optimizer
                </h3>
                {hasSavings ? (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 border border-emerald-100">
                        <Sparkles className="h-3 w-3" />
                        {metrics.optimizationCount} Opportunities
                    </span>
                ) : (
                    <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                        <CheckCircle className="h-3 w-3" />
                        Optimized
                    </span>
                )}
            </div>

            <div className="space-y-4">
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-900">
                        {hasSavings ? 'Optimization Strategies Found' : 'Network Efficiency Status'}
                    </p>
                    <div className="mt-3 space-y-3">
                        {hasSavings ? (
                            <>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500">Identified Savings</span>
                                    <span className="font-bold text-emerald-600 text-lg">
                                        ${metrics.potentialSavings.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs text-slate-500">
                                    <span>Across {metrics.optimizationCount} proposals</span>
                                    <span>AMIOP Engine Active</span>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-3 py-2">
                                <CheckCircle className="h-8 w-8 text-emerald-500/20" />
                                <div className="text-sm text-slate-500">
                                    No immediate optimization opportunities detected. System is monitoring real-time demand.
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <button
                    onClick={() => navigate('/decisions')}
                    className="group flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
                >
                    {hasSavings ? 'View Proposals' : 'View Decisions'}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
            </div>
        </div>
    );
}
