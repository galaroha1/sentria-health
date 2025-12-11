import { AlertTriangle, Clock, ShoppingCart, ArrowRightLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFirestore } from '../../hooks/useFirestore';

interface InventoryAlert {
    id: string;
    drug: string;
    lot: string;
    expires: string;
    quantity: number;
    status: 'critical' | 'warning';
}

export function InventoryAlerts() {
    const navigate = useNavigate();
    const { data: alerts, loading, error } = useFirestore<InventoryAlert>('inventoryAlerts');

    if (loading) return <div className="p-4 text-center text-sm text-slate-500">Loading alerts...</div>;
    if (error) return <div className="p-4 text-center text-sm text-red-500">Error loading alerts</div>;
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                    <Clock className="h-5 w-5 text-amber-500" />
                    Expiring Soon
                </h3>
                <button
                    onClick={() => navigate('/inventory')}
                    className="text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                    View All
                </button>
            </div>

            <div className="space-y-3">
                {alerts.map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3">
                        <div className="flex items-center gap-3">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${alert.status === 'critical' ? 'bg-red-50 text-red-600' : 'bg-amber-100 text-amber-600'
                                }`}>
                                <AlertTriangle className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-900">{alert.drug}</p>
                                <p className="text-xs text-slate-500">Expires in {alert.expires}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => navigate('/marketplace')}
                                className="flex items-center gap-1 rounded-md bg-white px-2 py-1 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 border border-slate-200"
                                title="Quick Order"
                            >
                                <ShoppingCart className="h-3 w-3" />
                            </button>
                            <button
                                onClick={() => navigate('/logistics')}
                                className="flex items-center gap-1 rounded-md bg-white px-2 py-1 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 border border-slate-200"
                                title="Transfer"
                            >
                                <ArrowRightLeft className="h-3 w-3" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 rounded-lg bg-blue-50 p-3">
                <p className="text-xs text-blue-700">
                    <span className="font-bold">Tip:</span> Listing these items on the marketplace now could recover up to 60% of costs.
                </p>
            </div>
        </div>
    );
}
