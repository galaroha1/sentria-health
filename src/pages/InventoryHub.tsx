import { useState } from 'react';
import { Search, Filter, Warehouse, ShoppingCart, Building2 } from 'lucide-react';
import { Inventory } from './Inventory';
import { Marketplace } from './Marketplace';
import { Vendors } from './Vendors';

type TabType = 'internal' | 'marketplace' | 'vendors';

export function InventoryHub() {
    const [activeTab, setActiveTab] = useState<TabType>('internal');
    const [searchQuery, setSearchQuery] = useState('');

    const tabs = [
        { id: 'internal' as TabType, label: 'Internal Stock', icon: Warehouse },
        { id: 'marketplace' as TabType, label: 'Marketplace', icon: ShoppingCart },
        { id: 'vendors' as TabType, label: 'Vendor Catalog', icon: Building2 },
    ];

    return (
        <div className="flex h-[calc(100vh-4rem)] flex-col gap-6">
            {/* Header Area */}
            <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Inventory Management</h1>
                    <p className="text-sm text-slate-500">Manage stock, procure supplies, and monitor vendors.</p>
                </div>

                {/* Global Search & Filter */}
                <div className="flex flex-1 items-center justify-end gap-3">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search across inventory, marketplace, and vendors..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                        />
                    </div>
                    <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                        <Filter className="h-4 w-4" />
                        <span>Filters</span>
                    </button>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex space-x-1 rounded-xl bg-slate-100 p-1 sm:w-fit">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${isActive
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-500 hover:text-slate-900'
                                }`}
                        >
                            <Icon className={`h-4 w-4 ${isActive ? 'text-primary-600' : 'text-slate-400'}`} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto">
                {activeTab === 'internal' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Inventory />
                    </div>
                )}
                {activeTab === 'marketplace' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Marketplace />
                    </div>
                )}
                {activeTab === 'vendors' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Vendors />
                    </div>
                )}
            </div>
        </div>
    );
}
