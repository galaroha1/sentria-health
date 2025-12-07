
import { useState, useEffect } from 'react';
import { MapPin, Search, ArrowUpRight, ArrowDownLeft, Building2, Activity, Users } from 'lucide-react';
import { networkService } from '../services/networkService';
import type { Organization, SharedInventoryItem } from '../services/networkService';

export function NetworkHub() {
    const [activeTab, setActiveTab] = useState<'exchange' | 'partners'>('exchange');
    const [partners, setPartners] = useState<Organization[]>([]);
    const [activity, setActivity] = useState<SharedInventoryItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        networkService.getNearbyOrganizations().then(setPartners);
        networkService.getNetworkActivity().then(setActivity);
    }, []);

    const handleRequest = (item: SharedInventoryItem) => {
        const result = networkService.requestTransfer(item.id, 10); // Mock qty
        alert(result.message);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Regional Network</h1>
                    <p className="text-sm text-slate-500">Connect with nearby health systems for mutual aid and resource sharing.</p>
                </div>
                <div className="flex rounded-lg bg-slate-100 p-1">
                    <button
                        onClick={() => setActiveTab('exchange')}
                        className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${activeTab === 'exchange' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                        <Activity className="h-4 w-4" />
                        Live Exchange
                    </button>
                    <button
                        onClick={() => setActiveTab('partners')}
                        className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${activeTab === 'partners' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                        <Users className="h-4 w-4" />
                        Partners
                    </button>
                </div>
            </div>

            {activeTab === 'exchange' && (
                <div className="space-y-6">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search network for drugs, supplies, or equipment..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 shadow-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Activity Feed */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {activity.map((item) => (
                            <div key={item.id} className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
                                <div className={`absolute left-0 top-0 h-full w-1 ${item.type === 'Surplus' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                <div className="mb-3 flex items-start justify-between">
                                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${item.type === 'Surplus' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                                        }`}>
                                        {item.type === 'Surplus' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownLeft className="h-3 w-3" />}
                                        {item.type}
                                    </span>
                                    <span className="text-xs text-slate-400">2h ago</span>
                                </div>

                                <h3 className="font-bold text-slate-900">{item.name}</h3>
                                <p className="text-sm text-slate-500">{item.orgName}</p>

                                <div className="mt-4 flex items-center justify-between">
                                    <div className="text-sm">
                                        <span className="font-medium text-slate-900">{item.quantity}</span> units
                                        <span className="mx-1 text-slate-300">|</span>
                                        <span className="text-slate-500">Exp: {new Date(item.expiryDate).toLocaleDateString()}</span>
                                    </div>
                                    {item.type === 'Surplus' && (
                                        <button
                                            onClick={() => handleRequest(item)}
                                            className="rounded-lg bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-100"
                                        >
                                            Request
                                        </button>
                                    )}
                                    {item.type === 'Shortage' && (
                                        <button className="rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-600 hover:bg-emerald-100">
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
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-6 py-4">
                        <h3 className="text-lg font-bold text-slate-900">Connected Systems</h3>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {partners.map((org) => (
                            <div key={org.id} className="flex items-center justify-between p-6">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                                        <Building2 className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-slate-900">{org.name}</h4>
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${org.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                                                org.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                                                }`}>
                                                {org.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <MapPin className="h-3 w-3" /> {org.distanceMiles} miles away
                                            </span>
                                            <span>•</span>
                                            <span>{org.type}</span>
                                            <span>•</span>
                                            <span className="text-indigo-600">{org.trustLevel}</span>
                                        </div>
                                    </div>
                                </div>
                                <button className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                                    View Profile
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="bg-slate-50 p-4 text-center">
                        <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                            + Invite New Partner
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
