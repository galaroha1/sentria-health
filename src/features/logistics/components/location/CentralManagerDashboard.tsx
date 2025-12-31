import { CheckCircle2, XCircle, Package, TrendingUp } from 'lucide-react';
import type { NetworkRequest } from '../../../../types/location';

interface CentralManagerDashboardProps {
    requests: NetworkRequest[];
    onApprove: (id: string) => void;
    onDeny: (id: string) => void;
}

export function CentralManagerDashboard({ requests, onApprove, onDeny }: CentralManagerDashboardProps) {
    const pendingRequests = requests.filter(r => r.status === 'pending');

    const getUrgencyColor = (urgency: string) => {
        switch (urgency) {
            case 'emergency': return 'bg-red-50 text-red-700';
            case 'urgent': return 'bg-amber-100 text-amber-700';
            default: return 'bg-blue-100 text-blue-700';
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Pending Network Requests</h3>
                <span className="rounded-full bg-red-50 px-3 py-1 text-sm font-bold text-red-700">
                    {pendingRequests.length} Pending
                </span>
            </div>

            {pendingRequests.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-12 text-center">
                    <Package className="mx-auto h-12 w-12 text-slate-300" />
                    <p className="mt-3 text-sm text-slate-500">No pending requests</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {pendingRequests.map((request) => (
                        <div key={request.id} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-slate-900">{request.drug.name}</h4>
                                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${getUrgencyColor(request.urgency)}`}>
                                            {request.urgency.toUpperCase()}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-sm text-slate-500">Request ID: {request.id}</p>
                                </div>
                                <span className="text-sm font-medium text-slate-900">{request.drug.quantity} units</span>
                            </div>

                            <div className="mt-4 grid gap-4 md:grid-cols-2">
                                <div>
                                    <p className="text-xs font-medium text-slate-500">From (Source)</p>
                                    <p className="mt-1 text-sm font-medium text-slate-900">{request.targetSite.name}</p>
                                    <p className="text-xs text-slate-600">{request.targetSite.type}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-slate-500">To (Destination)</p>
                                    <p className="mt-1 text-sm font-medium text-slate-900">{request.requestedBySite.name}</p>
                                    <p className="text-xs text-slate-600">{request.requestedBySite.type}</p>
                                </div>
                            </div>

                            <div className="mt-4">
                                <p className="text-xs font-medium text-slate-500">Requested By</p>
                                <p className="mt-1 text-sm text-slate-900">{request.requestedBy}</p>
                                <p className="text-xs text-slate-600">{new Date(request.requestedAt).toLocaleString()}</p>
                            </div>

                            <div className="mt-4 rounded-lg bg-slate-50 p-3">
                                <p className="text-xs font-medium text-slate-700">Reason</p>
                                <p className="mt-1 text-sm text-slate-600">{request.reason}</p>
                            </div>

                            <div className="mt-4 flex gap-3">
                                <button
                                    onClick={() => onApprove(request.id)}
                                    className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                                >
                                    <CheckCircle2 className="h-4 w-4" />
                                    Approve Transfer
                                </button>
                                <button
                                    onClick={() => onDeny(request.id)}
                                    className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                                >
                                    <XCircle className="h-4 w-4" />
                                    Deny Request
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Active Transfers */}
            <div className="mt-8">
                <h3 className="mb-4 text-lg font-bold text-slate-900">Active Transfers</h3>
                <div className="space-y-2">
                    {requests.filter(r => r.status === 'in_transit').map((request) => (
                        <div key={request.id} className="rounded-lg border border-slate-200 bg-white p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-slate-900">{request.drug.name}</p>
                                    <p className="text-xs text-slate-500">
                                        {request.targetSite.name} → {request.requestedBySite.name}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 animate-pulse text-blue-500" />
                                    <span className="text-xs font-medium text-slate-600">In Transit</span>
                                </div>
                            </div>
                            {request.estimatedDelivery && (
                                <p className="mt-2 text-xs text-slate-500">
                                    ETA: {new Date(request.estimatedDelivery).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
