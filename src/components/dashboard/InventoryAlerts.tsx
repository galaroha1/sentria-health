import { AlertTriangle, Clock, ArrowUpRight } from 'lucide-react';

const alerts = [
    {
        id: 1,
        drug: 'Rituximab',
        lot: 'RX-2024-001',
        expires: '14 days',
        quantity: 5,
        status: 'critical',
    },
    {
        id: 2,
        drug: 'Bevacizumab',
        lot: 'BV-2024-089',
        expires: '45 days',
        quantity: 12,
        status: 'warning',
    },
    {
        id: 3,
        drug: 'Trastuzumab',
        lot: 'TR-2024-112',
        expires: '60 days',
        quantity: 8,
        status: 'warning',
    },
];

export function InventoryAlerts() {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                    <Clock className="h-5 w-5 text-amber-500" />
                    Expiring Soon
                </h3>
                <button className="text-sm font-medium text-primary-600 hover:text-primary-700">
                    View All
                </button>
            </div>

            <div className="space-y-3">
                {alerts.map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3">
                        <div className="flex items-center gap-3">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${alert.status === 'critical' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                                }`}>
                                <AlertTriangle className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-900">{alert.drug}</p>
                                <p className="text-xs text-slate-500">Expires in {alert.expires}</p>
                            </div>
                        </div>
                        <button className="flex items-center gap-1 rounded-md bg-white px-2 py-1 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 border border-slate-200">
                            List
                            <ArrowUpRight className="h-3 w-3" />
                        </button>
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
