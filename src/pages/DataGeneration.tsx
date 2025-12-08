import { useState } from 'react';
import { Users, Zap } from 'lucide-react';
import { AdvancedTab } from '../components/inventory/AdvancedTab';
import { PatientDataTab } from '../components/inventory/PatientDataTab';

type TabType = 'patients' | 'advanced';

export function DataGeneration() {
    const [activeTab, setActiveTab] = useState<TabType>('patients');

    const tabs = [
        { id: 'patients' as TabType, label: 'Patient Data', icon: Users, desc: 'Generate & Manage Patients' },
        { id: 'advanced' as TabType, label: 'Advanced', icon: Zap, desc: 'AI & Simulation Tools' },
    ];

    return (
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            {/* Dynamic Sidebar Navigation */}
            <div className="w-full shrink-0 lg:sticky lg:top-6 lg:w-72">
                <div className="rounded-2xl bg-white p-4 shadow-xl border border-slate-100">
                    <div className="mb-6 px-4 pt-2">
                        <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700">Data Gen</h1>
                        <p className="text-xs font-bold text-slate-400 tracking-wider uppercase mt-1">Test & Simulation</p>
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
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-indigo-500 rounded-r-full" />
                                    )}

                                    <div className={`rounded-lg p-2 transition-all duration-300 ${isActive
                                        ? 'bg-white/20 text-white rotate-0'
                                        : 'bg-slate-100 text-slate-400 group-hover:bg-white group-hover:text-indigo-600 group-hover:rotate-12 group-hover:shadow-sm'
                                        }`}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <span className={`block font-bold text-sm ${isActive ? 'text-white' : 'text-slate-700'}`}>
                                            {tab.label}
                                        </span>
                                        <span className={`block text-[10px] font-medium ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                                            {tab.desc}
                                        </span>
                                    </div>

                                    {isActive && (
                                        <div className="absolute right-4 h-2 w-2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.6)] animate-pulse" />
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 min-w-0">
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {activeTab === 'patients' && <PatientDataTab />}
                    {activeTab === 'advanced' && <AdvancedTab />}
                </div>
            </div>
        </div>
    );
}
