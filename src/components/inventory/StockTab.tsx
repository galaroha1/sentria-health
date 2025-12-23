import { Search, Filter, MapPin, AlertTriangle, Thermometer, Droplets } from 'lucide-react';
import { useState } from 'react';
import type { SiteInventory, Site } from '../../types/location';
import { GlobalInventoryTable } from './GlobalInventoryTable';

interface StockTabProps {
    inventories: SiteInventory[];
    sites: Site[];
    onLocate: (drugName: string, siteId: string) => void;
}

export function StockTab({ inventories, sites, onLocate }: StockTabProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const allItems = inventories.flatMap(inv =>
        inv.drugs.map(drug => ({
            ...drug,
            siteId: inv.siteId,
            siteName: sites.find(s => s.id === inv.siteId)?.name || 'Unknown Site'
        }))
    );

    const filteredItems = allItems.filter(item =>
        item.drugName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.ndc.includes(searchTerm)
    );

    return (
        <div className="space-y-6">
            {/* Environment Status Mock */}
            <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                        <Thermometer className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Avg Temperature</p>
                        <p className="text-xl font-bold text-slate-900">4.2°C</p>
                        <p className="text-xs text-emerald-600">Optimal Range</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-primary-600">
                        <Droplets className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Humidity</p>
                        <p className="text-xl font-bold text-slate-900">45%</p>
                        <p className="text-xs text-primary-600">Normal</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                        <AlertTriangle className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Active Alerts</p>
                        <p className="text-xl font-bold text-slate-900">2</p>
                        <p className="text-xs text-amber-600">Low Stock Warnings</p>
                    </div>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by drug name, NDC, or lot number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 pl-10 pr-4 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    />
                </div>
                <button className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                    <Filter className="h-4 w-4" />
                    Filters
                </button>
            </div>

            {/* Inventory Table */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                        <tr>
                            <th className="px-6 py-4 font-medium">Drug Name</th>
                            <th className="px-6 py-4 font-medium">Location</th>
                            <th className="px-6 py-4 font-medium">NDC</th>
                            <th className="px-6 py-4 font-medium w-48">Stock Level</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredItems.map((item, index) => {
                            // Mock max capacity for visualization
                            const maxCapacity = Math.max(item.quantity * 1.5, 100);
                            const percentage = Math.min((item.quantity / maxCapacity) * 100, 100);
                            const getProgressColor = (status: string) => {
                                switch (status) {
                                    case 'critical': return 'bg-red-500';
                                    case 'low': return 'bg-amber-500';
                                    case 'overstocked': return 'bg-blue-500';
                                    default: return 'bg-emerald-500';
                                }
                            };

                            return (
                                <tr key={`${item.siteId}-${item.ndc}-${index}`} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 font-medium text-slate-900">{item.drugName}</td>
                                    <td className="px-6 py-4 text-slate-600">{item.siteName}</td>
                                    <td className="px-6 py-4 text-slate-500">{item.ndc}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${getProgressColor(item.status)}`}
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-medium text-slate-700 w-8 text-right">{item.quantity}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${item.status === 'critical' ? 'bg-red-50 text-red-700 ring-1 ring-red-100' :
                                            item.status === 'low' ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-100' :
                                                item.status === 'overstocked' ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-100' :
                                                    'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
                                            }`}>
                                            {item.status.replace('_', ' ').toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => onLocate(item.drugName, item.siteId)}
                                            className="flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium"
                                        >
                                            <MapPin className="h-3 w-3" />
                                            Locate
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Backend Visibility / Global Table */}
            <div className="pt-8 border-t border-slate-200">
                <GlobalInventoryTable />
            </div>
        </div>
    );
}
