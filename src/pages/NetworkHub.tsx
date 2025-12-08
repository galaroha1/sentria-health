
import { useState, useEffect } from 'react';
import { MapPin, Search, ArrowUpRight, ArrowDownLeft, Building2, Activity, Users, Map as MapIcon, List } from 'lucide-react';
import { networkService } from '../services/networkService';
import type { Organization, SharedInventoryItem } from '../services/networkService';
import type { Site } from '../types/location';
import { InteractiveMap } from '../components/location/InteractiveMap';
import { PartnerProfileModal } from '../components/network/PartnerProfileModal';
import toast from 'react-hot-toast';

export function NetworkHub() {
    const [activeTab, setActiveTab] = useState<'exchange' | 'partners'>('exchange');
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
    const [partners, setPartners] = useState<Organization[]>([]);
    const [activity, setActivity] = useState<SharedInventoryItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPartner, setSelectedPartner] = useState<Organization | null>(null);

    const refreshData = () => {
        networkService.getNearbyOrganizations().then(setPartners);
        networkService.getNetworkActivity().then(setActivity);
    };

    useEffect(() => {
        refreshData();
    }, []);

    const handleRequest = (item: SharedInventoryItem) => {
        const result = networkService.requestTransfer(item.id, 10); // Mock qty
        if (result.success) {
            toast.success(result.message);
            refreshData(); // Refresh UI
        } else {
            toast.error(result.message);
        }
    };

    const handleOfferHelp = (item: SharedInventoryItem) => {
        const result = networkService.offerHelp(item.id);
        if (result.success) {
            toast.success(result.message);
            refreshData(); // Refresh UI
        } else {
            toast.error(result.message);
        }
    };

    // Convert Organizations to Sites for Map
    const mapSites: Site[] = partners.map(org => ({
        id: org.id,
        name: org.name,
        type: org.type === 'Pharmacy' ? 'pharmacy' : org.type === 'Academic' ? 'hospital' : 'clinic',
        coordinates: org.location,
        address: org.address,
        manager: 'N/A',
        phone: 'N/A',
        email: 'N/A',
        departments: [],
        regulatoryAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=' + org.name,
        classOfTrade: org.type === 'Pharmacy' ? 'retail_pharmacy' : 'hospital',
        parentEntity: 'Region Network',
        regulatoryProfile: {
            dea_license: 'PENDING',
            state_license: 'PENDING',
            npi: 'PENDING',
            dea_expiry: '2025-01-01',
            state_expiry: '2025-01-01',
            last_audit: '2024-01-01',
            audit_score: 100
        },
        contact: {
            name: 'N/A',
            email: 'N/A',
            phone: 'N/A',
            role: 'Manager'
        },
        shippingAddress: org.address,
        billingAddress: org.address,
        timezone: 'America/New_York',
        status: 'active',
        capacity: 1000,
        currentUtilization: 75
    }));

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col gap-4 border-b border-blue-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Regional Network</h1>
                    <p className="text-sm text-slate-500">Connect with nearby health systems for mutual aid and resource sharing.</p>
                </div>
                <div className="flex items-center gap-4">
                    {activeTab === 'partners' && (
                        <div className="flex rounded-lg bg-slate-100 p-1">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-900'}`}
                            >
                                <List className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('map')}
                                className={`p-2 rounded-md transition-all ${viewMode === 'map' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-900'}`}
                            >
                                <MapIcon className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                    <div className="flex rounded-xl bg-white p-1 shadow-sm border border-blue-100">
                        <button
                            onClick={() => setActiveTab('exchange')}
                            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${activeTab === 'exchange' ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
                        >
                            <Activity className="h-4 w-4" />
                            Live Exchange
                        </button>
                        <button
                            onClick={() => setActiveTab('partners')}
                            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${activeTab === 'partners' ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
                        >
                            <Users className="h-4 w-4" />
                            Partners
                        </button>
                    </div>
                </div>
            </div>

            {activeTab === 'exchange' && (
                <div className="space-y-6">
                    {/* Search Bar */}
                    <div className="relative max-w-2xl mx-auto">
                        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-400" />
                        <input
                            type="text"
                            placeholder="Search network for drugs, supplies, or equipment..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-2xl border border-blue-100 bg-white py-4 pl-12 pr-4 shadow-sm outline-none transition-all focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
                        />
                    </div>

                    {/* Activity Feed */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {activity.map((item) => (
                            <div key={item.id} className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-blue-200">
                                <div className={`absolute left-0 top-0 h-full w-1.5 ${item.type === 'Surplus' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                                <div className="mb-4 flex items-start justify-between pl-2">
                                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${item.type === 'Surplus' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-red-50 text-red-700 ring-1 ring-red-200'
                                        }`}>
                                        {item.type === 'Surplus' ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownLeft className="h-3.5 w-3.5" />}
                                        {item.type}
                                    </span>
                                    <span className="text-xs font-medium text-slate-400">2h ago</span>
                                </div>

                                <div className="pl-2">
                                    <h3 className="font-bold text-slate-900 text-lg">{item.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Building2 className="h-3.5 w-3.5 text-blue-400" />
                                        <p className="text-sm font-medium text-slate-600">{item.orgName}</p>
                                    </div>
                                </div>

                                <div className="mt-5 flex items-center justify-between border-t border-slate-50 pt-4 pl-2">
                                    <div className="text-sm">
                                        <span className="font-bold text-slate-900">{item.quantity}</span> <span className="text-slate-500">units</span>
                                        <span className="mx-2 text-slate-200">|</span>
                                        <span className="text-slate-500">Exp: {new Date(item.expiryDate).toLocaleDateString()}</span>
                                    </div>
                                    {item.type === 'Surplus' && (
                                        <button
                                            onClick={() => handleRequest(item)}
                                            className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-100"
                                        >
                                            Request
                                        </button>
                                    )}
                                    {item.type === 'Shortage' && (
                                        <button
                                            onClick={() => handleOfferHelp(item)}
                                            className="rounded-lg bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-600 transition-colors hover:bg-emerald-100"
                                        >
                                            Offer Help
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'partners' && (
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden min-h-[600px] flex flex-col">
                    <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-slate-900">Connected Systems</h3>
                        <span className="text-sm text-slate-500">{partners.length} active partners</span>
                    </div>

                    {viewMode === 'list' ? (
                        <div className="divide-y divide-slate-100">
                            {partners.map((org) => (
                                <div key={org.id} className="flex items-center justify-between p-6 transition-colors hover:bg-blue-50/30">
                                    <div className="flex items-center gap-5">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100">
                                            <Building2 className="h-7 w-7" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h4 className="text-lg font-bold text-slate-900">{org.name}</h4>
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${org.status === 'Active' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' :
                                                    org.status === 'Pending' ? 'bg-amber-50 text-amber-700 ring-amber-200' : 'bg-slate-100 text-slate-600 ring-slate-200'
                                                    }`}>
                                                    <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${org.status === 'Active' ? 'bg-emerald-500' :
                                                        org.status === 'Pending' ? 'bg-amber-500' : 'bg-slate-400'
                                                        }`}></span>
                                                    {org.status}
                                                </span>
                                            </div>
                                            <div className="mt-1 flex items-center gap-4 text-sm text-slate-500">
                                                <span className="flex items-center gap-1.5">
                                                    <MapPin className="h-4 w-4 text-blue-400" /> {org.distanceMiles} miles away
                                                </span>
                                                <span className="text-slate-300">•</span>
                                                <span>{org.type}</span>
                                                <span className="text-slate-300">•</span>
                                                <span className="font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{org.trustLevel}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedPartner(org)}
                                        className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm"
                                    >
                                        View Profile
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-[600px] w-full">
                            <InteractiveMap
                                sites={mapSites}
                                inventories={[]}
                                onSiteClick={(site) => {
                                    const org = partners.find(p => p.id === site.id);
                                    if (org) setSelectedPartner(org);
                                }}
                            />
                        </div>
                    )}

                    {viewMode === 'list' && (
                        <div className="bg-slate-50 p-6 text-center border-t border-slate-100 mt-auto">
                            <button
                                onClick={() => toast('Invite feature coming soon', { icon: '📧' })}
                                className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                            >
                                + Invite New Partner
                            </button>
                        </div>
                    )}
                </div>
            )}

            <PartnerProfileModal
                isOpen={!!selectedPartner}
                onClose={() => setSelectedPartner(null)}
                partner={selectedPartner}
            />
        </div>
    );
}
