import { Search, Filter, AlertTriangle, ScanLine } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { StockLocatorModal } from '../components/inventory/StockLocatorModal';
import { NetworkRequestForm } from '../components/location/NetworkRequestForm';
import { BarcodeScanner } from '../components/common/BarcodeScanner';
import type { Site } from '../types/location';

export function Inventory() {
    const { inventories, sites, addRequest } = useApp();
    const [searchTerm, setSearchTerm] = useState('');
    const [locatorDrug, setLocatorDrug] = useState<{ name: string, siteId: string } | null>(null);
    const [transferTarget, setTransferTarget] = useState<{ site: Site, drug: string } | null>(null);
    const [showScanner, setShowScanner] = useState(false);

    // Flatten inventory for the table view (simplified for this demo)
    // In a real app, we might group by site or have a site selector
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

    const lowStockCount = allItems.filter(i => i.status === 'low' || i.status === 'critical').length;

    const handleLocateStock = (drugName: string, siteId: string) => {
        setLocatorDrug({ name: drugName, siteId });
    };

    const handleInitiateTransfer = (targetSiteId: string) => {
        if (!locatorDrug) return;
        const targetSite = sites.find(s => s.id === targetSiteId);
        if (targetSite) {
            setTransferTarget({ site: targetSite, drug: locatorDrug.name });
            setLocatorDrug(null); // Close locator
        }
    };

    const handleScan = (decodedText: string) => {
        setSearchTerm(decodedText);
        setShowScanner(false);
        // Optional: Play a success sound or show a toast
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Inventory Management</h1>
                    <p className="text-sm text-slate-500">Track stock levels across all {sites.length} locations.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowScanner(true)}
                        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm"
                    >
                        <ScanLine className="h-4 w-4" />
                        Scan Item
                    </button>
                    <div className="flex items-center gap-2 rounded-lg bg-white border border-slate-200 px-3 py-2 shadow-sm">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        <span className="text-sm font-medium text-slate-700">{lowStockCount} Low Stock Alerts</span>
                    </div>
                    <button className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 shadow-sm">
                        Add Inventory
                    </button>
                </div>
            </div>

            {/* Search and Filter Bar */}
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
                            <th className="px-6 py-4 font-medium">Quantity</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredItems.map((item, index) => (
                            <tr key={`${item.siteId}-${item.ndc}-${index}`} className="hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium text-slate-900">{item.drugName}</td>
                                <td className="px-6 py-4 text-slate-600">{item.siteName}</td>
                                <td className="px-6 py-4 text-slate-500">{item.ndc}</td>
                                <td className="px-6 py-4 font-medium text-slate-900">{item.quantity}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${item.status === 'critical' ? 'bg-red-100 text-red-800' :
                                        item.status === 'low' ? 'bg-amber-100 text-amber-800' :
                                            item.status === 'overstocked' ? 'bg-blue-100 text-blue-800' :
                                                'bg-emerald-100 text-emerald-800'
                                        }`}>
                                        {item.status.replace('_', ' ').toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {(item.status === 'low' || item.status === 'critical') && (
                                        <button
                                            onClick={() => handleLocateStock(item.drugName, item.siteId)}
                                            className="flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium"
                                        >
                                            <MapPin className="h-3 w-3" />
                                            Locate Stock
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showScanner && (
                <BarcodeScanner
                    onScan={handleScan}
                    onClose={() => setShowScanner(false)}
                />
            )}

            {locatorDrug && (
                <StockLocatorModal
                    drugName={locatorDrug.name}
                    currentSiteId={locatorDrug.siteId}
                    onClose={() => setLocatorDrug(null)}
                    onRequestTransfer={handleInitiateTransfer}
                />
            )}

            {transferTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl">
                        <NetworkRequestForm
                            sourceSite={transferTarget.site}
                            destinationSite={sites.find(s => s.id === locatorDrug?.siteId) || sites[0]} // Fallback logic, ideally we pass the requesting site
                            inventories={inventories}
                            onClose={() => setTransferTarget(null)}
                            onSubmit={(req) => {
                                addRequest(req);
                                setTransferTarget(null);
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
