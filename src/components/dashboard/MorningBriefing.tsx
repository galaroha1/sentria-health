import { Sun, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function MorningBriefing() {
    const { requests, inventories } = useApp();

    // Calculate metrics
    const pendingRequests = requests.filter(r => r.status === 'pending').length;
    const criticalStockouts = inventories.reduce((acc, inv) =>
        acc + inv.drugs.filter(d => d.status === 'critical').length, 0
    );
    const activeTransfers = requests.filter(r => r.status === 'in_transit').length;

    const getTimeGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    return (
        <div className="rounded-xl bg-white border border-slate-200 p-6 shadow-sm">
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-2 text-slate-500">
                        <Sun className="h-5 w-5 text-amber-500" />
                        <span className="font-medium">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <h2 className="mt-2 text-3xl font-bold text-slate-900">{getTimeGreeting()}, Dr. Smith.</h2>
                    <p className="mt-1 text-slate-500">Here's what requires your attention today:</p>
                </div>
                <div className="hidden rounded-lg bg-slate-50 border border-slate-100 p-3 sm:block">
                    <div className="text-center">
                        <p className="text-xs font-medium text-slate-500">System Status</p>
                        <div className="mt-1 flex items-center justify-center gap-1.5">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                            <span className="text-sm font-bold text-slate-700">Operational</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg bg-red-50 border border-red-100 p-4 transition-colors hover:bg-red-100/50">
                    <div className="flex items-center gap-3">
                        <div className="rounded-full bg-white p-2 text-red-600 shadow-sm border border-red-100">
                            <AlertCircle className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">{criticalStockouts}</p>
                            <p className="text-xs font-medium text-red-700">Critical Stockouts</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg bg-amber-50 border border-amber-100 p-4 transition-colors hover:bg-amber-100/50">
                    <div className="flex items-center gap-3">
                        <div className="rounded-full bg-white p-2 text-amber-600 shadow-sm border border-amber-100">
                            <Clock className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">{pendingRequests}</p>
                            <p className="text-xs font-medium text-amber-700">Pending Approvals</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg bg-blue-50 border border-blue-100 p-4 transition-colors hover:bg-blue-100/50">
                    <div className="flex items-center gap-3">
                        <div className="rounded-full bg-white p-2 text-blue-600 shadow-sm border border-blue-100">
                            <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">{activeTransfers}</p>
                            <p className="text-xs font-medium text-blue-700">Active Transfers</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
