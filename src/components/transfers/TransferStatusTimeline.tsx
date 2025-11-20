import { CheckCircle2, Clock, Truck, Package } from 'lucide-react';
import type { TransferRequest } from '../../types/transfer';

export function TransferStatusTimeline({ transfer }: { transfer: TransferRequest }) {
    const stages = [
        {
            name: 'Requested',
            completed: true,
            timestamp: transfer.requestedAt,
            user: transfer.requestedBy,
            icon: Package,
        },
        {
            name: 'Approved',
            completed: transfer.status === 'approved' || transfer.status === 'in_transit' || transfer.status === 'completed',
            timestamp: transfer.approvedAt,
            user: transfer.approvedBy,
            icon: CheckCircle2,
        },
        {
            name: 'In Transit',
            completed: transfer.status === 'in_transit' || transfer.status === 'completed',
            timestamp: transfer.inTransitAt,
            user: transfer.inTransitAt ? 'Pharmacy Tech' : undefined,
            icon: Truck,
        },
        {
            name: 'Completed',
            completed: transfer.status === 'completed',
            timestamp: transfer.completedAt,
            user: transfer.completedAt ? 'System' : undefined,
            icon: CheckCircle2,
        },
    ];

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-6 text-lg font-bold text-slate-900">Transfer Status</h3>

            <div className="relative">
                {stages.map((stage, index) => {
                    const Icon = stage.icon;
                    const isLast = index === stages.length - 1;

                    return (
                        <div key={stage.name} className="relative flex gap-4 pb-8 last:pb-0">
                            {!isLast && (
                                <div className={`absolute left-5 top-10 h-full w-0.5 ${stage.completed ? 'bg-emerald-200' : 'bg-slate-200'}`} />
                            )}

                            <div className={`relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${stage.completed ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                                }`}>
                                <Icon className="h-5 w-5" />
                            </div>

                            <div className="flex-1 pt-1">
                                <p className={`font-medium ${stage.completed ? 'text-slate-900' : 'text-slate-500'}`}>
                                    {stage.name}
                                </p>
                                {stage.timestamp && (
                                    <p className="mt-1 text-xs text-slate-500">
                                        {new Date(stage.timestamp).toLocaleString()}
                                    </p>
                                )}
                                {stage.user && (
                                    <p className="mt-1 text-xs text-slate-500">
                                        by {stage.user}
                                    </p>
                                )}
                                {!stage.completed && index > 0 && (
                                    <div className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                                        <Clock className="h-3 w-3" />
                                        Awaiting
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
