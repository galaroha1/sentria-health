import { Search, Filter, Download, Package, AlertTriangle, RefreshCw } from 'lucide-react';
import { InventoryTable } from '../components/inventory/InventoryTable';
import { useApp } from '../context/AppContext';

export function Inventory() {
    const { inventories } = useApp();

    // Flatten all inventory items across all sites
    const allItems = inventories.flatMap(site => site.drugs.map(drug => ({
        ...drug,
        siteId: site.siteId
    })));

    // Calculate stats
    const lowStockCount = allItems.filter(i => i.status === 'low' || i.status === 'critical').length;
    const totalValue = allItems.reduce((sum, item) => sum + (item.quantity * 150), 0); // Mock price $150/unit

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Inventory Management</h1>
                    <p className="text-sm text-slate-500">Real-time tracking of stock levels, expiration dates, and valuation.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                        <Download className="h-4 w-4" />
                        Export Report
                    </button>
                    <button className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
                        <Package className="h-4 w-4" />
                        Add Product
                    </button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                            <Package className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Total Asset Value</p>
                            <p className="text-2xl font-bold text-slate-900">${totalValue.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                            <AlertTriangle className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Low Stock Alerts</p>
                            <p className="text-2xl font-bold text-slate-900">{lowStockCount}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                            <RefreshCw className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Turnover Rate (MoM)</p>
                            <p className="text-2xl font-bold text-slate-900">12.4%</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <Search className="h-5 w-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search inventory by name, NDC, or batch number..."
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
                <div className="h-6 w-px bg-slate-200"></div>
                <button className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900">
                    <Filter className="h-4 w-4" />
                    Filters
                </button>
            </div>

            <InventoryTable items={allItems} />
        </div>
    );
}
