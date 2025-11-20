import { DollarSign, ArrowRight, Sparkles } from 'lucide-react';

export function CostOptimizer() {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                    <DollarSign className="h-5 w-5 text-emerald-600" />
                    Cost Optimizer
                </h3>
                <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 border border-emerald-100">
                    <Sparkles className="h-3 w-3" />
                    20% Savings Found
                </span>
            </div>

            <div className="space-y-4">
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-900">Recommended Strategy</p>
                    <div className="mt-3 space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500">Wholesaler A (Standard)</span>
                            <span className="font-medium text-slate-900">12 Units @ $4,200</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-1 text-emerald-600 font-medium">
                                Marketplace (Short-dated)
                            </span>
                            <span className="font-medium text-emerald-700">3 Units @ $3,100</span>
                        </div>
                        <div className="border-t border-slate-200 pt-2 mt-2 flex items-center justify-between font-bold">
                            <span className="text-slate-900">Total Cost</span>
                            <span className="text-slate-900">$59,700</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>vs. Standard GPO Price</span>
                            <span className="line-through">$74,625</span>
                        </div>
                    </div>
                </div>

                <button className="group flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors">
                    Execute Strategy
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
            </div>
        </div>
    );
}
