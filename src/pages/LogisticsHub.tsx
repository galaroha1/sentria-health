import { useState, useEffect } from 'react';
import { MapPin, Plus, Search, Building2, LayoutList, Map as MapIcon, BrainCircuit } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LocationActivity } from '../components/logistics/LocationActivity';
import { TransferRequestForm } from '../components/transfers/TransferRequestForm';
import { InteractiveMap } from '../components/location/InteractiveMap';
import { SmartTransferCard } from '../components/logistics/SmartTransferCard';
import { autoLogisticsService } from '../services/logistics/AutoLogisticsService';
import type { NetworkRequest, Site, TransferSuggestion } from '../types/location';

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

    // Generate Auto-Logistics Suggestions
    useEffect(() => {
        if (!selectedSite || !selectedInventory) return;

        // 1. Identify Candidates
        // If triggered manually (lastScan > 0), check ALL items for "Balancing" opportunities
        // Otherwise, only check "Shortages"
        const isManualScan = lastScan > 0;

        let candidates = selectedInventory.drugs.filter(d => d.quantity < d.minLevel || d.status === 'critical' || d.status === 'low');

        if (isManualScan) {
            // Check top 20 items to prevent performance hit, prioritizing those with low stock relative to max
            // OR just check all if list is small. Let's check all for demo.
            candidates = selectedInventory.drugs;
        }

        // 2. Generate Suggestions
        let newSuggestions: TransferSuggestion[] = [];
        candidates.forEach(shortageItem => {
            const itemSuggestions = autoLogisticsService.generateSuggestions(
                selectedSite,
                shortageItem,
                sites,
                inventories
            );
            newSuggestions = [...newSuggestions, ...itemSuggestions];
        });

        // 3. Sort/Limit
        // Deduplicate by ID
        const uniqueMap = new Map<string, TransferSuggestion>();
        newSuggestions.forEach(s => uniqueMap.set(s.id, s));
        const uniqueSuggestions = Array.from(uniqueMap.values());

        setSuggestions(uniqueSuggestions.sort((a, b) => b.priorityScore - a.priorityScore).slice(0, 3));
    }, [selectedSite, selectedInventory, sites, inventories, lastScan]);

    const handleApproveSuggestion = (suggestion: TransferSuggestion) => {
        // Convert suggestion to request
        const sourceSite = sites.find(s => s.id === suggestion.sourceSiteId);
        const targetSite = sites.find(s => s.id === suggestion.targetSiteId);

        if (!sourceSite || !targetSite) return;

        const newRequest: NetworkRequest = {
            id: `TR-${Date.now()}`,
            requestedBy: 'AutoLogistics AI',
            requestedBySite: targetSite,
            targetSite: sourceSite, // Requesting FROM source
            drug: {
                name: suggestion.drugName,
                ndc: suggestion.ndc,
                quantity: suggestion.quantity
            },
            reason: `Auto-generated: ${suggestion.reason[0]}`,
            urgency: suggestion.urgency,
            status: 'approved', // Auto-approve
            requestedAt: new Date().toISOString(),
            approvedBy: 'System',
            approvedAt: new Date().toISOString()
        };

        addRequest(newRequest);
        setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
    };

    const filteredSites = sites.filter(site =>
        site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        site.type.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleRequestSubmit = (data: any) => {
        // This logic is adapted from Transfers.tsx
        if (!sites || sites.length === 0) return;

        const sourceSite = sites.find(s => s.id === data.sourceDept) || sites[0];
        const targetSite = sites.find(s => s.id === data.destDept) || sites[1];

        const newRequest: NetworkRequest = {
            id: `TR-${Date.now()}`,
            requestedBy: 'Current User',
            requestedBySite: sourceSite,
            targetSite: targetSite,
            drug: {
                name: data.drugName,
                ndc: data.ndc,
                quantity: parseInt(data.quantity),
                lotNumber: data.lotNumber
            },
            reason: data.reason,
            urgency: 'routine',
            status: 'pending',
            requestedAt: new Date().toISOString(),
            policyChecks: [
                { id: '1', name: 'Expiration Date', passed: true, message: 'Sufficient shelf life' },
                { id: '2', name: 'Storage Compatibility', passed: true, message: 'Compatible' },
                { id: '3', name: 'Payer Restrictions', passed: true, message: 'No conflicts' },
                { id: '4', name: 'Hospital Policy', passed: true, message: 'Authorized' },
            ]
        };

        addRequest(newRequest);
        setShowRequestForm(false);
    };

    const handleSiteClick = (site: Site) => {
        setSelectedSiteId(site.id);
        setViewMode('list');
    };

    return (
        <div className="flex flex-1 flex-col gap-6 h-full overflow-hidden">
            {/* Header */}
            <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Logistics Network</h1>
                    <p className="text-sm text-slate-500">Monitor inventory flow and manage transfers across sites.</p>
                </div>

                {/* View Toggle */}
                <div className="flex items-center rounded-lg border border-slate-200 bg-white p-1">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${viewMode === 'list'
                            ? 'bg-slate-900 text-white shadow-sm'
                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                    >
                        <LayoutList className="h-4 w-4" />
                        List View
                    </button>
                    <button
                        onClick={() => setViewMode('map')}
                        className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${viewMode === 'map'
                            ? 'bg-slate-900 text-white shadow-sm'
                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                    >
                        <MapIcon className="h-4 w-4" />
                        Map View
                    </button>
                </div>
            </div>

            {/* Content Area */}
            {viewMode === 'map' ? (
                <div className="flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <InteractiveMap
                        sites={sites}
                        inventories={inventories}
                        onSiteClick={handleSiteClick}
                    />
                </div>
            ) : (
                /* Master/Detail Layout */
                <div className="flex flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    {/* Left Pane: Locations List */}
                    <div className="flex w-80 flex-col border-r border-slate-200 bg-slate-50">
                        <div className="p-4 border-b border-slate-200">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search locations..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                                />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            {filteredSites.map((site) => {
                                const isSelected = selectedSiteId === site.id;
                                // Mock status logic: Randomly assign status for demo purposes if not available
                                // Real app would calculate this based on inventory levels
                                const hasShortage = Math.random() > 0.8;

                                return (
                                    <button
                                        key={site.id}
                                        onClick={() => setSelectedSiteId(site.id)}
                                        className={`group flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors ${isSelected
                                            ? 'bg-white shadow-sm ring-1 ring-slate-200'
                                            : 'hover:bg-slate-100'
                                            }`}
                                    >
                                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${isSelected ? 'bg-primary-50 text-primary-600' : 'bg-white text-slate-400 shadow-sm'
                                            }`}>
                                            <Building2 className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <p className={`font-medium truncate ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>
                                                    {site.name}
                                                </p>
                                                {/* Status Dot */}
                                                <div className={`h-2 w-2 rounded-full ${hasShortage ? 'bg-red-500' : 'bg-emerald-500'}`} />
                                            </div>
                                            <p className="text-xs text-slate-500 truncate capitalize">{site.type}</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Pane: Activity */}
                    <div className="flex-1 flex flex-col min-w-0 bg-white">
                        {selectedSite ? (
                            <>
                                <div className="flex items-center justify-between border-b border-slate-100 px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white shadow-lg">
                                            <MapPin className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-900">{selectedSite.name}</h2>
                                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                                <span className="capitalize">{selectedSite.type}</span>
                                                <span>•</span>
                                                <span>{selectedSite.address}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowRequestForm(true)}
                                        className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-bold text-white shadow-md hover:bg-primary-700 transition-colors"
                                    >
                                        <Plus className="h-4 w-4" />
                                        New Transfer
                                    </button>
                                </div>


                                {/* Smart Logistics Panel */}
                                {suggestions.length > 0 && (
                                    <div className="border-b border-slate-100 bg-slate-50/80 px-8 py-6">
                                        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-500">
                                            <span className="h-2 w-2 rounded-full bg-violet-500 animate-pulse"></span>
                                            AI Optimization Opportunities
                                        </h3>
                                        <div className="grid gap-4 xl:grid-cols-2">
                                            {suggestions.map(suggestion => (
                                                <SmartTransferCard
                                                    key={suggestion.id}
                                                    suggestion={suggestion}
                                                    sourceSite={sites.find(s => s.id === suggestion.sourceSiteId)!}
                                                    targetSite={sites.find(s => s.id === suggestion.targetSiteId)!}
                                                    onApprove={handleApproveSuggestion}
                                                    onDismiss={(id) => setSuggestions(prev => prev.filter(s => s.id !== id))}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
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
                            <div className="flex flex-1 items-center justify-center text-slate-400">
                                <div className="text-center">
                                    <Building2 className="mx-auto h-12 w-12 opacity-20" />
                                    <p className="mt-4">Select a location to view activity</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {showRequestForm && (
                <TransferRequestForm
                    onClose={() => setShowRequestForm(false)}
                    onSubmit={handleRequestSubmit}
                />
            )}
        </div>
    );
}
