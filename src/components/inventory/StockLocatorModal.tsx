import { useState, useEffect } from 'react';
import { MapPin, Truck, X, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { findTransferCandidates, TransferCandidate } from '../../utils/transferOptimization';

interface StockLocatorModalProps {
    drugName: string;
    currentSiteId: string;
    onClose: () => void;
    onRequestTransfer: (targetSiteId: string) => void;
}

export function StockLocatorModal({ drugName, currentSiteId, onClose, onRequestTransfer }: StockLocatorModalProps) {
    const { inventories, sites } = useApp();
    const [candidates, setCandidates] = useState<TransferCandidate[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate network delay for realism
        const timer = setTimeout(() => {
            const results = findTransferCandidates(inventories, sites, drugName, currentSiteId);
            setCandidates(results);
            setLoading(false);
        }, 600);

        return () => clearTimeout(timer);
    }, [inventories, sites, drugName, currentSiteId]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-200 p-6">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Locate Stock: {drugName}</h2>
                        <p className="text-sm text-slate-500">Finding available inventory across the network</p>
                    </div>
                    <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-primary-600"></div>
                            <p className="mt-4 text-sm text-slate-500">Searching nearby locations...</p>
                        </div>
                    ) : candidates.length > 0 ? (
                        <div className="space-y-4">
                            <p className="text-sm font-medium text-slate-700">Found {candidates.length} locations with available stock:</p>
                            {candidates.map((site) => (
                                <div key={site.siteId} className="flex items-center justify-between rounded-lg border border-slate-200 p-4 hover:border-primary-200 hover:bg-primary-50/30 transition-colors">
                                    <div className="flex items-start gap-4">
                                        <div className="rounded-full bg-slate-100 p-2 text-slate-600">
                                            <MapPin className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900">{site.siteName}</h3>
                                            <div className="mt-1 flex items-center gap-3 text-sm">
                                                <span className="text-slate-600">{site.distance} away</span>
                                                <span className={`flex items-center gap-1 font-medium ${site.status === 'overstocked' ? 'text-amber-600' : 'text-emerald-600'
                                                    }`}>
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    {site.availableQuantity} units available
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => onRequestTransfer(site.siteId)}
                                        className="flex items-center gap-2 rounded-lg bg-white border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:border-primary-500 hover:text-primary-600 shadow-sm"
                                    >
                                        <Truck className="h-4 w-4" />
                                        Request Transfer
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="rounded-full bg-slate-100 p-4 text-slate-400">
                                <MapPin className="h-8 w-8" />
                            </div>
                            <h3 className="mt-4 text-lg font-medium text-slate-900">No Stock Found</h3>
                            <p className="mt-2 max-w-sm text-sm text-slate-500">
                                We couldn't find any locations with sufficient stock of {drugName} nearby. Consider placing a purchase order.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
