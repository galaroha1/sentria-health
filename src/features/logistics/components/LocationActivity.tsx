import { ArrowRight, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle2, Truck, AlertCircle } from 'lucide-react';
import type { NetworkRequest, Site } from '../../../types/location';

interface LocationActivityProps {
    site: Site;
    requests: NetworkRequest[];
}

export function LocationActivity({ site, requests }: LocationActivityProps) {
    // Outbound: Leaving this site (Source)
    const outbound = requests.filter(r => r.requestedBySite.id === site.id);

    // Inbound: Arriving at this site (Target)
    const inbound = requests.filter(r => r.targetSite.id === site.id);

    const getStatusColor = (status: NetworkRequest['status']) => {
        switch (status) {
            case 'pending': return 'bg-amber-100 text-amber-700';
            case 'approved': return 'bg-blue-100 text-blue-700';
            case 'in_transit': return 'bg-primary-100 text-primary-700';
            case 'completed': return 'bg-emerald-100 text-emerald-700';
            case 'denied': return 'bg-red-100 text-red-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getStatusIcon = (status: NetworkRequest['status']) => {
        switch (status) {
            case 'pending': return Clock;
            case 'approved': return CheckCircle2;
            case 'in_transit': return Truck;
            case 'completed': return CheckCircle2;
            case 'denied': return AlertCircle;
            default: return Clock;
        }
    };

    const TransferList = ({ title, items, type }: { title: string, items: NetworkRequest[], type: 'inbound' | 'outbound' }) => (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${type === 'inbound' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-primary-600'}`}>
                        {type === 'inbound' ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                    </div>
                    <h3 className="font-bold text-slate-900">{title}</h3>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">
                    {items.length}
                </span>
            </div>
            <div className="divide-y divide-slate-100">
                {items.length === 0 ? (
                    <div className="p-8 text-center text-sm text-slate-500">
                        No {type} transfers found.
                    </div>
                ) : (
                    items.map((req) => {
                        const StatusIcon = getStatusIcon(req.status);
                        return (
                            <div key={req.id} className="flex items-center justify-between p-4 hover:bg-slate-50">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 shrink-0 rounded-lg bg-slate-100 flex items-center justify-center">
                                        <Truck className="h-5 w-5 text-slate-500" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900">{req.drug.name}</p>
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <span>{req.drug.quantity} units</span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                                {type === 'inbound' ? (
                                                    <>From: {req.requestedBySite.name}</>
                                                ) : (
                                                    <>To: {req.targetSite.name}</>
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${getStatusColor(req.status)}`}>
                                        <StatusIcon className="h-3.5 w-3.5" />
                                        <span className="capitalize">{req.status.replace('_', ' ')}</span>
                                    </span>
                                    <ArrowRight className="h-4 w-4 text-slate-300" />
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
                <TransferList title="Inbound (Arriving)" items={inbound} type="inbound" />
                <TransferList title="Outbound (Leaving)" items={outbound} type="outbound" />
            </div>
        </div>
    );
}
