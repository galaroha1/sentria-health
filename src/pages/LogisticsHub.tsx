import { useState } from 'react';
import { MapPin, Plus, Search, Building2, LayoutList, Map as MapIcon, BrainCircuit } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LocationActivity } from '../components/logistics/LocationActivity';
import { TransferRequestForm } from '../components/transfers/TransferRequestForm';
import { InteractiveMap } from '../components/location/InteractiveMap';
import type { NetworkRequest, Site } from '../types/location';

export function LogisticsHub() {
    const { sites, requests, addRequest, inventories } = useApp();
    const [selectedSiteId, setSelectedSiteId] = useState<string>(sites[0]?.id || '');
    const [searchQuery, setSearchQuery] = useState('');
    const [showRequestForm, setShowRequestForm] = useState(false);
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
    const [suggestions, setSuggestions] = useState<TransferSuggestion[]>([]);
    const [lastScan, setLastScan] = useState<number>(0); // Timestamp for forcing refreshes

    const selectedSite = sites.find(s => s.id === selectedSiteId);
    const selectedInventory = inventories.find(inv => inv.siteId === selectedSiteId);

    {/* Smart Logistics Panel Removed - Centralized in Inventory > AI Optimization */ }


    <div className="p-6 bg-slate-50/50">
        {/* Activity Header with AI Controls */}
        <div className="mb-6 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Recent Activity</h3>
            <button
                onClick={() => setLastScan(Date.now())}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
            >
                <BrainCircuit className="h-3 w-3" />
                Re-scan Network
            </button>
        </div>
        <LocationActivity site={selectedSite} requests={requests} />
    </div>
                            </>
                        ) : (
        <div className="flex h-64 items-center justify-center text-slate-400">
            <div className="text-center">
                <Building2 className="mx-auto h-12 w-12 opacity-20" />
                <p className="mt-4">Select a location to view activity</p>
            </div>
        </div>
    )
}
                    </div >
                </div >
            )}

{
    showRequestForm && (
        <TransferRequestForm
            onClose={() => setShowRequestForm(false)}
            onSubmit={handleRequestSubmit}
        />
    )
}
        </div >
    );
}
