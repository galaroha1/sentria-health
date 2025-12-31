
import { useState } from 'react';
import { MapPin, Bell, Network } from 'lucide-react';
import toast from 'react-hot-toast';
import { InteractiveMap } from '../features/logistics/components/location/InteractiveMap';
import { SiteDetailPanel } from '../features/logistics/components/location/SiteDetailPanel';
import { NetworkRequestForm } from '../features/logistics/components/location/NetworkRequestForm';
import { CentralManagerDashboard } from '../features/logistics/components/location/CentralManagerDashboard';
import { sites, siteInventories } from '../data/location/mockData';
import type { Site, NetworkRequest } from '../types/location';

type ViewMode = 'map' | 'requests';

import { useApp } from '../context/AppContext';

export function LocationMap() {
    const { requests, addRequest, updateRequestStatus } = useApp();
    const [selectedSite, setSelectedSite] = useState<Site | null>(null);
    const [requestFormSource, setRequestFormSource] = useState<Site | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('map');

    const pendingRequestsCount = requests.filter(r => r.status === 'pending').length;

    const handleSiteClick = (site: Site) => {
        setSelectedSite(site);
    };

    const handleRequestTransfer = (site: Site) => {
        setRequestFormSource(site);
        setSelectedSite(null);
    };

    const handleApproveRequest = (id: string) => {
        updateRequestStatus(id, 'in_transit', 'Current User');
    };

    const handleDenyRequest = (id: string) => {
        updateRequestStatus(id, 'denied');
    };

    const handleRequestSubmit = (newRequest: NetworkRequest) => {
        addRequest(newRequest);
        setRequestFormSource(null);
        toast.success('Network transfer request submitted successfully');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Medicine Location Tracking</h1>
                    <p className="text-sm text-slate-500">Monitor inventory across all network locations</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-primary-600">
                            <MapPin className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Total Sites</p>
                            <p className="text-2xl font-bold text-slate-900">{sites.length}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                            <Bell className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Pending Requests</p>
                            <p className="text-2xl font-bold text-slate-900">{pendingRequestsCount}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                            <Network className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Active Transfers</p>
                            <p className="text-2xl font-bold text-slate-900">
                                {requests.filter(r => r.status === 'in_transit').length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* View Toggle */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex gap-2 border-b border-slate-200 p-2">
                    <button
                        onClick={() => setViewMode('map')}
                        className={`flex items - center gap - 2 rounded - lg px - 4 py - 2 text - sm font - medium transition - colors ${viewMode === 'map'
                            ? 'bg-slate-900 text-white'
                            : 'text-slate-600 hover:bg-slate-100'
                            } `}
                    >
                        <MapPin className="h-4 w-4" />
                        Map View
                    </button>
                    <button
                        onClick={() => setViewMode('requests')}
                        className={`flex items - center gap - 2 rounded - lg px - 4 py - 2 text - sm font - medium transition - colors ${viewMode === 'requests'
                            ? 'bg-slate-900 text-white'
                            : 'text-slate-600 hover:bg-slate-100'
                            } `}
                    >
                        <Network className="h-4 w-4" />
                        Network Requests
                        {pendingRequestsCount > 0 && (
                            <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                                {pendingRequestsCount}
                            </span>
                        )}
                    </button>
                </div>

                <div className="p-6">
                    {viewMode === 'map' ? (
                        <div className="relative">
                            <InteractiveMap
                                sites={sites}
                                inventories={siteInventories}
                                onSiteClick={handleSiteClick}
                            />
                        </div>
                    ) : (
                        <CentralManagerDashboard
                            requests={requests}
                            onApprove={handleApproveRequest}
                            onDeny={handleDenyRequest}
                        />
                    )}
                </div>
            </div>

            {/* Side Panel */}
            {selectedSite && (
                <SiteDetailPanel
                    site={selectedSite}
                    inventory={siteInventories.find(inv => inv.siteId === selectedSite.id)}
                    onClose={() => setSelectedSite(null)}
                    onRequestTransfer={handleRequestTransfer}
                />
            )}

            {/* Request Form Modal */}
            {requestFormSource && (
                <NetworkRequestForm
                    sourceSite={requestFormSource}
                    inventories={siteInventories}
                    onClose={() => setRequestFormSource(null)}
                    onSubmit={handleRequestSubmit}
                />
            )}
        </div>
    );
}
