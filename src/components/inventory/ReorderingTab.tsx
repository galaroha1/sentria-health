import { RefreshCw, TrendingDown, AlertCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';

export function ReorderingTab() {
    const { addToCart } = useCart();
    const { addNotification } = useApp();
    const navigate = useNavigate();

    const { inventories, sites } = useApp();

    // Derive reorder items from real inventory
    const reorderItems = inventories.flatMap(inv =>
        inv.drugs
            .filter(d => d.quantity <= d.minLevel)
            .map(d => ({
                id: d.ndc,
                name: d.drugName,
                current: d.quantity,
                min: d.minLevel,
                supplier: 'McKesson', // Default or derived from metadata if available
                cost: 4500, // Placeholder or fetch real price
                siteName: sites.find(s => s.id === inv.siteId)?.name
            }))
    );

    const handleCreatePO = (item: typeof reorderItems[0]) => {
        addToCart({
            id: parseInt(item.id.replace(/\D/g, '')) || Math.floor(Math.random() * 10000), // Hack for number ID
            name: item.name,
            price: item.cost,
            quantity: Math.max(item.min - item.current, 10), // Reorder difference or min 10
            seller: item.supplier
        });

        addNotification({
            id: `notif-${Date.now()}`,
            type: 'success',
            category: 'alert',
            title: 'Added to Cart',
            message: `Purchase Order for ${item.name} added to cart`,
            timestamp: new Date().toISOString(),
            read: false,
            link: '/cart'
        });
    };

    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                            <AlertCircle className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Below Threshold</p>
                            <p className="text-2xl font-bold text-slate-900">{reorderItems.length} Items</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                            <RefreshCw className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Pending Orders</p>
                            <p className="text-2xl font-bold text-slate-900">5 Active</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                            <TrendingDown className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Waste Reduction</p>
                            <p className="text-2xl font-bold text-slate-900">-12%</p>
                            <p className="text-xs text-emerald-600">vs Last Month</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-6 py-4">
                    <h3 className="text-lg font-bold text-slate-900">Suggested Reorders</h3>
                    <p className="text-sm text-slate-500">Items below minimum stock levels requiring attention</p>
                </div>
                <div className="divide-y divide-slate-100">
                    {reorderItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-6 hover:bg-slate-50">
                            <div className="flex items-center gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 font-bold text-slate-600">
                                    {item.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900">{item.name}</h4>
                                    <p className="text-sm text-slate-500">
                                        {item.siteName} • Supplier: {item.supplier} • Est. Cost: ${item.cost.toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <p className="text-sm font-medium text-slate-900">Stock: {item.current} / {item.min}</p>
                                    <div className="mt-1 h-1.5 w-24 rounded-full bg-slate-100">
                                        <div className="h-full rounded-full bg-amber-500" style={{ width: `${(item.current / item.min) * 100}%` }} />
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleCreatePO(item)}
                                    className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Create PO
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="bg-slate-50 p-4 text-center">
                    <button
                        onClick={() => navigate('/cart')}
                        className="text-sm font-medium text-primary-600 hover:text-primary-700"
                    >
                        View All Active Orders
                    </button>
                </div>
            </div>
        </div>
    );
}
