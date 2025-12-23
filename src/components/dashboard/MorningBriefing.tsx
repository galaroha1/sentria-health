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
        <div className="rounded-xl bg-gradient-to-r from-primary-600 to-violet-600 p-6 text-white shadow-lg">
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-2 text-primary-100">
                        <Sun className="h-5 w-5" />
                        <span className="font-medium">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <h2 className="mt-2 text-3xl font-bold">{getTimeGreeting()}, Dr. Smith.</h2>
                    <p className="mt-1 text-primary-100">Here's what requires your attention today:</p>
                </div>
                <div className="hidden rounded-lg bg-white/10 p-3 backdrop-blur-sm sm:block">
                    <div className="text-center">
                        <p className="text-xs font-medium text-primary-100">System Status</p>
                        <div className="mt-1 flex items-center justify-center gap-1.5">
                            <div className="h-2 w-2 rounded-full bg-emerald-400" />
                            <span className="text-sm font-bold">Operational</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm transition-colors hover:bg-white/20">
                    <div className="flex items-center gap-3">
                        <div className="rounded-full bg-red-500/20 p-2 text-red-100">
                            <AlertCircle className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{criticalStockouts}</p>
                            <p className="text-xs font-medium text-primary-100">Critical Stockouts</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm transition-colors hover:bg-white/20">
                    <div className="flex items-center gap-3">
                        <div className="rounded-full bg-amber-500/20 p-2 text-amber-100">
                            <Clock className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{pendingRequests}</p>
                            <p className="text-xs font-medium text-primary-100">Pending Approvals</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm transition-colors hover:bg-white/20">
                    <div className="flex items-center gap-3">
                        <div className="rounded-full bg-emerald-500/20 p-2 text-emerald-100">
                            <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{activeTransfers}</p>
                            <p className="text-xs font-medium text-primary-100">Active Transfers</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
