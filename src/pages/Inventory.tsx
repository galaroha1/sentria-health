import { useState } from 'react';
import { Truck, Package, Syringe, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StockLocatorModal } from '../features/inventory/components/StockLocatorModal';
import { NetworkRequestForm } from '../features/logistics/components/location/NetworkRequestForm';
import { BarcodeScanner } from '../core/components/common/BarcodeScanner';
import type { Site } from '../types/location';
import { useSimulation } from '../features/clinical/context/SimulationContext';

import { OperationsTab } from '../features/inventory/components/OperationsTab';
import { StockTab } from '../features/inventory/components/StockTab';
import { AdministrationTab } from '../features/inventory/components/AdministrationTab';
import { ComplianceTab } from '../features/inventory/components/ComplianceTab';

import { PatientDetailsModal } from '../features/inventory/components/PatientDetailsModal';

type TabType = 'operations' | 'stock' | 'admin' | 'compliance';

export function Inventory() {
    const { inventories, sites, addRequest, addNotification } = useApp();
    const { selectedPatient, setSelectedPatient } = useSimulation();
    // Default to 'stock' for better visibility
    const [activeTab, setActiveTab] = useState<TabType>('stock');

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

        // Simulate finding an item
        addNotification({
            id: `scan-${Date.now()}`,
            type: 'success',
            category: 'system',
            title: 'Item Scanned',
            message: `Successfully identified item: ${decodedText || 'Keytruda (NDC: 0006-3026-02)'}`,
            timestamp: new Date().toISOString(),
            read: false,
            link: '/inventory'
        });
    };





    const tabs = [
        { id: 'operations' as TabType, label: 'Logistics', icon: Truck, desc: 'Procurement, Shipping & Receiving' },
        { id: 'stock' as TabType, label: 'Stock & Storage', icon: Package, desc: 'Inventory Levels' },
        { id: 'compliance' as TabType, label: 'Compliance', icon: ShieldCheck, desc: 'Audits & Reports' },
        { id: 'admin' as TabType, label: 'Administration', icon: Syringe, desc: 'Patient Administration' },
    ];

    return (
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            {/* Dynamic Sidebar Navigation */}
            <div className="w-full shrink-0 lg:sticky lg:top-6 lg:w-72">
                <div className="rounded-2xl bg-white p-4 shadow-xl border border-slate-100">
                    <div className="mb-6 px-4 pt-2">
                        <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700">Inventory</h1>
                        <p className="text-xs font-bold text-slate-400 tracking-wider uppercase mt-1">PAM-IMS Workflow</p>
                    </div>
                    <nav className="space-y-2">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`group relative flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-left transition-all duration-200 ease-out ${isActive
                                        ? 'bg-slate-900 text-white shadow-lg scale-105 translate-x-2'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 hover:scale-105 hover:translate-x-1 hover:shadow-md'
                                        }`}
                                >
                                    {/* Active Indicator Line */}
                                    {isActive && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-primary-500 rounded-r-full" />
                                    )}

                                    <div className={`rounded-lg p-2 transition-all duration-300 ${isActive
                                        ? 'bg-white/20 text-white rotate-0'
                                        : 'bg-slate-100 text-slate-400 group-hover:bg-white group-hover:text-primary-600 group-hover:rotate-12 group-hover:shadow-sm'
                                        }`}>
                                        <Icon className="h-5 w-5" />
                                    </div>

                                    <div className="flex-1">
                                        <span className={`block text-sm font-bold transition-colors ${isActive ? 'text-white' : 'text-slate-700 group-hover:text-slate-900'}`}>
                                            {tab.label}
                                        </span>
                                        <span className={`block text-[10px] font-medium transition-colors ${isActive ? 'text-slate-400' : 'text-slate-400 group-hover:text-primary-500/80'
                                            }`}>
                                            {tab.desc}
                                        </span>
                                    </div>

                                    {/* Hover Arrow */}
                                    <div className={`transition-all duration-200 ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-primary-400' : 'bg-primary-600'}`} />
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

                    {activeTab === 'operations' && <OperationsTab />}

                    {activeTab === 'stock' && (
                        <StockTab
                            inventories={inventories}
                            sites={sites}
                            onLocate={handleLocateStock}
                        />
                    )}

                    {activeTab === 'admin' && <AdministrationTab />}

                    {activeTab === 'compliance' && <ComplianceTab />}


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

            {selectedPatient && (
                <PatientDetailsModal
                    patient={selectedPatient}
                    onClose={() => setSelectedPatient(null)}
                />
            )}
        </div>
    );
}
