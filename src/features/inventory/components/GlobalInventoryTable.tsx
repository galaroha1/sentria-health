import { useState, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import { Search } from 'lucide-react';


interface GlobalItem {
    ndc: string;
    drugName: string;
    totalQuantity: number;
    sites: {
        siteId: string;
        siteName: string;
        quantity: number;
        status: string;
    }[];
}

export function GlobalInventoryTable() {
    const { inventories, sites } = useApp();
    const [searchTerm, setSearchTerm] = useState('');

    // Aggregate inventory data
    const globalItems = useMemo(() => {
        const itemMap = new Map<string, GlobalItem>();

        inventories.forEach(inv => {
            const site = sites.find(s => s.id === inv.siteId);
            const siteName = site?.name || 'Unknown Site';

            inv.drugs.forEach(drug => {
                if (!itemMap.has(drug.ndc)) {
                    itemMap.set(drug.ndc, {
                        ndc: drug.ndc,
                        drugName: drug.drugName,
                        totalQuantity: 0,
                        sites: []
                    });
                }
                const item = itemMap.get(drug.ndc)!;
                item.totalQuantity += drug.quantity;
                item.sites.push({
                    siteId: inv.siteId,
                    siteName,
                    quantity: drug.quantity,
                    status: drug.status || 'well_stocked'
                });
            });
        });

        return Array.from(itemMap.values()).sort((a, b) => b.totalQuantity - a.totalQuantity);
    }, [inventories, sites]);

    const filteredItems = globalItems.filter(item =>
        item.drugName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.ndc.includes(searchTerm)
    );

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-lg bg-white p-4 border border-slate-200 shadow-sm">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">Global Inventory Visibility</h2>
                    <p className="text-sm text-slate-500">Master view of stock across all health system locations.</p>
                </div>
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by drug name or NDC..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 pl-10 pr-4 py-2 text-sm focus:border-purple-500 focus:outline-none"
                    />
                </div>
            </div>

            {/* Main Table */}
            <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3">Drug Name / NDC</th>
                                <th className="px-4 py-3 text-right">System Total</th>
                                <th className="px-4 py-3">Distribution Breakdown</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredItems.map((item) => (
                                <tr key={item.ndc} className="hover:bg-slate-50">
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-slate-900">{item.drugName}</div>
                                        <div className="text-xs text-slate-500 font-mono">{item.ndc}</div>
                                    </td>
                                    <td className="px-4 py-3 text-right font-bold text-slate-900">
                                        {item.totalQuantity.toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap gap-2">
                                            {item.sites.map(site => (
                                                <div key={site.siteId} className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs shadow-sm" title={`${site.quantity} units at ${site.siteName}`}>
                                                    <span className={`h-1.5 w-1.5 rounded-full ${site.status === 'critical' ? 'bg-red-500' :
                                                        site.status === 'low' ? 'bg-amber-500' :
                                                            site.status === 'overstocked' ? 'bg-blue-500' : 'bg-emerald-500'
                                                        }`} />
                                                    <span className="font-medium text-slate-700 max-w-[100px] truncate">{site.siteName}</span>
                                                    <span className="font-bold text-slate-900 border-l border-slate-200 pl-1.5">{site.quantity}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredItems.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="px-4 py-8 text-center text-slate-500 italic">
                                        No inventory items found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
