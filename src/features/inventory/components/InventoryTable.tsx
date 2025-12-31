import { MoreVertical, AlertCircle, CheckCircle2, Clock, Package } from 'lucide-react';
import type { DrugInventoryItem } from '../../../types/location';

interface InventoryTableProps {
    items: (DrugInventoryItem & { siteId: string })[];
}

export function InventoryTable({ items }: InventoryTableProps) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4">
                <h3 className="font-bold text-slate-900">Current Inventory</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                        <tr>
                            <th className="px-6 py-3 font-medium">Drug Name</th>
                            <th className="px-6 py-3 font-medium">NDC</th>
                            <th className="px-6 py-3 font-medium">Batch #</th>
                            <th className="px-6 py-3 font-medium">Expiry</th>
                            <th className="px-6 py-3 font-medium">Quantity</th>
                            <th className="px-6 py-3 font-medium">Value</th>
                            <th className="px-6 py-3 font-medium">Status</th>
                            <th className="px-6 py-3 font-medium"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                        {items.map((item, index) => (
                            <tr key={`${item.siteId}-${item.ndc}-${index}`} className="hover:bg-slate-50">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                                            <Package className="h-4 w-4" />
                                        </div>
                                        <span className="font-medium text-slate-900">{item.drugName}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-slate-600">{item.ndc}</td>
                                <td className="px-6 py-4 text-slate-600">B-{item.ndc.slice(-4)}</td>
                                <td className="px-6 py-4 text-slate-600">2025-12-31</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-slate-900">{item.quantity}</span>
                                        <span className="text-xs text-slate-400">/ {item.minLevel} min</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-medium text-slate-900">${(item.quantity * 150).toLocaleString()}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${item.status === 'critical' ? 'bg-red-50 text-red-700 ring-1 ring-red-100' :
                                        item.status === 'low' ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-100' :
                                            item.status === 'overstocked' ? 'bg-primary-50 text-primary-700 ring-1 ring-primary-100' :
                                                'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
                                        }`}>
                                        {item.status === 'well_stocked' && <CheckCircle2 className="h-3 w-3" />}
                                        {item.status === 'low' && <AlertCircle className="h-3 w-3" />}
                                        {item.status === 'critical' && <AlertCircle className="h-3 w-3" />}
                                        {item.status === 'overstocked' && <Clock className="h-3 w-3" />}
                                        {item.status === 'well_stocked' ? 'In Stock' :
                                            item.status === 'low' ? 'Low Stock' :
                                                item.status === 'critical' ? 'Critical' : 'Overstocked'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                                        <MoreVertical className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
