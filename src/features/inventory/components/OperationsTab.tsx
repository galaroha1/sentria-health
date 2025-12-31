import { useState } from 'react';
import { Truck, RefreshCw, ArrowRightLeft } from 'lucide-react';
import { ProcurementTab } from './ProcurementTab';
import { LogisticsTab } from './LogisticsTab';
import { ReorderingTab } from './ReorderingTab';

type SubTab = 'procurement' | 'logistics' | 'reorder';

export function OperationsTab() {
    const [activeSubTab, setActiveSubTab] = useState<SubTab>('procurement');

    const subTabs = [
        { id: 'procurement' as SubTab, label: 'Procurement', icon: Truck },
        { id: 'logistics' as SubTab, label: 'Logistics', icon: ArrowRightLeft },
        { id: 'reorder' as SubTab, label: 'Reordering', icon: RefreshCw },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-6">
                <nav className="flex space-x-8" aria-label="Tabs">
                    {subTabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeSubTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveSubTab(tab.id)}
                                className={`
                                    group inline-flex items-center border-b-2 py-4 px-1 text-sm font-medium transition-colors
                                    ${isActive
                                        ? 'border-purple-500 text-purple-600'
                                        : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                                    }
                                `}
                            >
                                <Icon className={`-ml-0.5 mr-2 h-5 w-5 ${isActive ? 'text-purple-500' : 'text-slate-400 group-hover:text-slate-500'}`} />
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="mt-4">
                {activeSubTab === 'procurement' && <ProcurementTab />}
                {activeSubTab === 'logistics' && <LogisticsTab />}
                {activeSubTab === 'reorder' && <ReorderingTab />}
            </div>
        </div>
    );
}
