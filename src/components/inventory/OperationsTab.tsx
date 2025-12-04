import { useState } from 'react';
import { Truck, RefreshCw, ArrowRightLeft, Zap } from 'lucide-react';
import { ProcurementTab } from './ProcurementTab';
import { LogisticsTab } from './LogisticsTab';
import { ReorderingTab } from './ReorderingTab';
import { OptimizationService, type OptimizationProposal } from '../../services/optimization.service';
import { OptimizationApprovals } from './OptimizationApprovals';
import { useApp } from '../../context/AppContext';
import toast from 'react-hot-toast';

type SubTab = 'procurement' | 'logistics' | 'reorder';

export function OperationsTab() {
    const [activeSubTab, setActiveSubTab] = useState<SubTab>('procurement');
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [proposals, setProposals] = useState<OptimizationProposal[]>([]);
    const { sites, inventories, addRequest } = useApp();

    const subTabs = [
        { id: 'procurement' as SubTab, label: 'Procurement', icon: Truck },
        { id: 'logistics' as SubTab, label: 'Logistics', icon: ArrowRightLeft },
        { id: 'reorder' as SubTab, label: 'Reordering', icon: RefreshCw },
    ];

    const handleRunOptimization = async () => {
        setIsOptimizing(true);
        // Simulate calculation delay for effect
        await new Promise(resolve => setTimeout(resolve, 1500));

        const newProposals = OptimizationService.generateProposals(sites, inventories);
        setProposals(newProposals);
        setIsOptimizing(false);

        if (newProposals.length > 0) {
            toast.success(`Generated ${newProposals.length} optimization proposals`);
        } else {
            toast('No optimization opportunities found', { icon: 'info' });
        }
    };

    const handleApprove = (proposal: OptimizationProposal) => {
        // Create the actual request based on proposal
        if (proposal.type === 'transfer') {
            // Mock creating a transfer request
            addRequest({
                id: `req-${Date.now()}`,
                requestedBy: 'System (Auto-Optimization)',
                requestedBySite: sites.find(s => s.id === proposal.targetSiteId)!,
                targetSite: sites.find(s => s.id === proposal.sourceSiteId)!,
                drug: {
                    name: proposal.drugName,
                    ndc: proposal.ndc,
                    quantity: proposal.quantity
                },
                reason: proposal.reason,
                urgency: 'routine',
                status: 'pending',
                requestedAt: new Date().toISOString()
            });
            toast.success('Transfer request created');
        } else {
            toast.success('Procurement order generated');
        }

        // Remove from list
        setProposals(prev => prev.filter(p => p.id !== proposal.id));
    };

    const handleReject = (proposal: OptimizationProposal) => {
        setProposals(prev => prev.filter(p => p.id !== proposal.id));
        toast('Proposal rejected');
    };

    return (
        <div className="space-y-6">
            {/* Header with Optimization Trigger */}
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

                <button
                    onClick={handleRunOptimization}
                    disabled={isOptimizing}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-bold text-white shadow-lg transition-all hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl disabled:opacity-70"
                >
                    <Zap className={`h-4 w-4 ${isOptimizing ? 'animate-spin' : ''}`} />
                    {isOptimizing ? 'Optimizing Network...' : 'Run Auto-Logistics'}
                </button>
            </div>

            {/* Optimization Results Area */}
            {proposals.length > 0 && (
                <div className="rounded-xl bg-slate-50 p-6 border border-slate-200">
                    <OptimizationApprovals
                        proposals={proposals}
                        onApprove={handleApprove}
                        onReject={handleReject}
                    />
                </div>
            )}

            {/* Tab Content */}
            <div className="mt-4">
                {activeSubTab === 'procurement' && <ProcurementTab />}
                {activeSubTab === 'logistics' && <LogisticsTab />}
                {activeSubTab === 'reorder' && <ReorderingTab />}
            </div>
        </div>
    );
}
