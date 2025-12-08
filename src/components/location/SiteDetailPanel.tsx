import { X, AlertTriangle, Calendar, User, Phone, MapPin } from 'lucide-react';
import type { Site, SiteInventory } from '../../types/location';

interface SiteDetailPanelProps {
    site: Site;
    inventory: SiteInventory | undefined;
    onClose: () => void;
    onRequestTransfer: (site: Site) => void;
}

export function SiteDetailPanel({ site, inventory, onClose, onRequestTransfer }: SiteDetailPanelProps) {
    return (
        <div className="fixed right-0 top-0 z-[1000] h-full w-full max-w-md overflow-y-auto border-l border-slate-200 bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-6">
                <h2 className="text-xl font-bold text-slate-900">{site.name}</h2>
                <button
                    onClick={onClose}
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            <div className="p-6 space-y-6">
                {/* Site Info */}
                <div>
                    <h3 className="mb-3 text-sm font-bold uppercase text-slate-700">Site Information</h3>
                    <div className="space-y-3">
                        <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 mt-0.5 text-slate-400" />
                            <div>
                                <p className="text-sm text-slate-900">{site.address}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-slate-400" />
                            <p className="text-sm text-slate-900">{site.phone}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-slate-400" />
                            <p className="text-sm text-slate-900">{site.manager}</p>
                        </div>
                    </div>
                    <div className="mt-3 rounded-lg bg-slate-50 p-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Capacity Utilization</span>
                            <span className="font-medium text-slate-900">{site.currentUtilization}%</span>
                        </div>
                        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                            <div
                                className={`h-full ${site.currentUtilization > 85 ? 'bg-amber-500' : 'bg-emerald-500'
                                    }`}
                                style={{ width: `${site.currentUtilization}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Inventory */}
                {inventory && inventory.drugs.length > 0 && (
                    <div>
                        <h3 className="mb-3 text-sm font-bold uppercase text-slate-700">Current Inventory</h3>
                        <div className="space-y-2">
                            {inventory.drugs.map((drug, index) => (
                                <div key={index} className="rounded-lg border border-slate-200 p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <p className="font-medium text-slate-900">{drug.drugName}</p>
                                            <p className="text-xs text-slate-500">NDC: {drug.ndc}</p>
                                        </div>
                                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${drug.status === 'well_stocked' ? 'bg-emerald-100 text-emerald-700' :
                                            drug.status === 'low' ? 'bg-amber-100 text-amber-700' :
                                                drug.status === 'critical' ? 'bg-red-50 text-red-700' :
                                                    'bg-blue-100 text-blue-700'
                                            }`}>
                                            {drug.status.replace('_', ' ').toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="mt-2 flex items-center justify-between text-sm">
                                        <span className="text-slate-600">Quantity:</span>
                                        <span className="font-medium text-slate-900">
                                            {drug.quantity} / {drug.maxLevel} units
                                        </span>
                                    </div>
                                    {drug.expirationWarnings > 0 && (
                                        <div className="mt-2 flex items-center gap-1 text-xs text-amber-600">
                                            <AlertTriangle className="h-3 w-3" />
                                            {drug.expirationWarnings} units expiring soon
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {inventory && inventory.lastUpdated && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Calendar className="h-3 w-3" />
                        Last updated: {new Date(inventory.lastUpdated).toLocaleString()}
                    </div>
                )}

                <button
                    onClick={() => onRequestTransfer(site)}
                    className="w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800"
                >
                    Request Transfer from this Site
                </button>
            </div>
        </div>
    );
}
