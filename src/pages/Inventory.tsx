import { useState } from 'react';
import { Truck, Package, Syringe, RefreshCw, FileText, Zap, ArrowRightLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StockLocatorModal } from '../components/inventory/StockLocatorModal';
import { NetworkRequestForm } from '../components/location/NetworkRequestForm';
import { BarcodeScanner } from '../components/common/BarcodeScanner';
import type { Site } from '../types/location';

// Tabs
import { ProcurementTab } from '../components/inventory/ProcurementTab';
import { StockTab } from '../components/inventory/StockTab';
import { AdministrationTab } from '../components/inventory/AdministrationTab';
import { ReorderingTab } from '../components/inventory/ReorderingTab';
import { ComplianceTab } from '../components/inventory/ComplianceTab';
import { AdvancedTab } from '../components/inventory/AdvancedTab';
import { LogisticsTab } from '../components/inventory/LogisticsTab';

type TabType = 'procurement' | 'stock' | 'admin' | 'reorder' | 'compliance' | 'advanced' | 'logistics';



export function Inventory() {
    const { inventories, sites, addRequest } = useApp();
    const [activeTab, setActiveTab] = useState<TabType>('logistics');

    // Shared state for modals
    const [locatorDrug, setLocatorDrug] = useState<{ name: string, siteId: string } | null>(null);
    const [transferTarget, setTransferTarget] = useState<{ site: Site, drug: string } | null>(null);
    const [showScanner, setShowScanner] = useState(false);

    const handleLocateStock = (drugName: string, siteId: string) => {
        setLocatorDrug({ name: drugName, siteId });
    };

    const handleInitiateTransfer = (targetSiteId: string) => {
        if (!locatorDrug) return;
        const targetSite = sites.find(s => s.id === targetSiteId);
        if (targetSite) {
            setTransferTarget({ site: targetSite, drug: locatorDrug.name });
            setLocatorDrug(null);
        }
    };

    const handleScan = (decodedText: string) => {
        console.log('Scanned:', decodedText);
        setShowScanner(false);
        // In a real app, this would route to the specific item or action based on the scan
    };

    const tabs = [
        { id: 'logistics' as TabType, label: 'Logistics', icon: ArrowRightLeft, desc: 'Check-in/out & Transfers' },
        { id: 'advanced' as TabType, label: 'Advanced', icon: Zap, desc: 'AI & Analytics' },
        { id: 'procurement' as TabType, label: 'Procurement', icon: Truck, desc: 'Receiving & Orders' },
        { id: 'stock' as TabType, label: 'Stock & Storage', icon: Package, desc: 'Inventory Levels' },
        { id: 'admin' as TabType, label: 'Administration', icon: Syringe, desc: 'Patient Administration' },
        { id: 'reorder' as TabType, label: 'Reordering', icon: RefreshCw, desc: 'Replenishment' },
        { id: 'compliance' as TabType, label: 'Compliance', icon: FileText, desc: 'Audits & Reports' },
    ];

    return (
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            {/* Sticky Sidebar Navigation */}
            <div className="w-full shrink-0 lg:sticky lg:top-6 lg:w-64">
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="mb-4 px-2">
                        <h1 className="text-xl font-bold text-slate-900">Inventory</h1>
                        <p className="text-xs text-slate-500">PAM-IMS Workflow</p>
                    </div>
                    <nav className="space-y-1">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`group flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-all ${activeTab === tab.id
                                        ? 'bg-slate-900 text-white shadow-md'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                        }`}
                                >
                                    <div className={`rounded-md p-1.5 transition-colors ${activeTab === tab.id ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700'
                                        }`}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <span className="block text-sm font-bold">{tab.label}</span>
                                        <span className={`block text-[10px] ${activeTab === tab.id ? 'text-slate-300' : 'text-slate-400'}`}>
                                            {tab.desc}
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="min-h-[600px] flex-1">
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-6 border-b border-slate-100 pb-4">
                        <h2 className="text-2xl font-bold text-slate-900">
                            {tabs.find(t => t.id === activeTab)?.label}
                        </h2>
                        <p className="text-slate-500">
                            {tabs.find(t => t.id === activeTab)?.desc}
                        </p>
                    </div>

                    {activeTab === 'logistics' && <LogisticsTab />}

                    {activeTab === 'procurement' && <ProcurementTab />}

                    {activeTab === 'stock' && (
                        <StockTab
                            inventories={inventories}
                            sites={sites}
                            onLocate={handleLocateStock}
                        />
                    )}

                    {activeTab === 'admin' && <AdministrationTab />}

                    {activeTab === 'reorder' && <ReorderingTab />}

                    {activeTab === 'compliance' && <ComplianceTab />}

                    {activeTab === 'advanced' && <AdvancedTab />}
                </div>
            </div>

            {/* Shared Modals */}
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
                            destinationSite={sites.find(s => s.id === locatorDrug?.siteId) || sites[0]}
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
