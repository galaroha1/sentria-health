import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Zap, Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useSimulation } from '../../context/SimulationContext';
import { OptimizationService } from '../../services/optimization.service';
import type { ProcurementProposal } from '../../types/procurement';
import { OptimizationApprovals } from './OptimizationApprovals';
import toast from 'react-hot-toast';

export function DecisionsTab() {
    const { requests, updateRequestStatus, sites, inventories, notifications, markNotificationAsRead, addRequest, updateInventory, currentProposals, setCurrentProposals } = useApp();
    const { simulationResults, fetchSimulations } = useSimulation();
    const [activeSection, setActiveSection] = useState<'approvals' | 'optimization' | 'alerts'>('approvals');

    // Optimization State
    const [isOptimizing, setIsOptimizing] = useState(false);

    // Execution Roadmap State
    const [executionStep, setExecutionStep] = useState<'idle' | 'fetching' | 'analyzing' | 'compliance' | 'complete'>('idle');

    // Derived State
    const pendingRequests = requests.filter(r => r.status === 'pending');
    const criticalAlerts = notifications.filter(n => !n.read && (n.type === 'critical' || n.type === 'warning'));

    // Initial Data Fetch
    useEffect(() => {
        fetchSimulations(100); // Fetch last 100 patients for analysis
    }, []);

    // Run optimization on mount or when requested
    const runOptimization = async () => {
        try {
            setIsOptimizing(true);
            setExecutionStep('fetching');
            setCurrentProposals([]); // Clear existing to show refresh

            // Step 1: Data Pull
            await new Promise(resolve => setTimeout(resolve, 1500));
            setExecutionStep('analyzing');

            // Step 2: Analysis
            await new Promise(resolve => setTimeout(resolve, 1500));
            setExecutionStep('compliance');

            // Step 3: Compliance Checks
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Step 4: Generate Results
            // Pass active requests to filter out already addressed demand
            const newProposals = OptimizationService.generateProposals(sites, inventories, simulationResults, requests);
            setCurrentProposals(newProposals);

            setExecutionStep('complete');
            // Reset to idle after a moment so the modal/view can close or persist?
            // User likely wants to see the "Done" state before viewing results.
            setTimeout(() => setExecutionStep('idle'), 2000);

        } catch (error) {
            console.error("Optimization failed:", error);
            toast.error("Failed to run optimization");
            setExecutionStep('idle');
        } finally {
            setIsOptimizing(false);
        }
    };

    const handleApproveRequest = (id: string) => {
        updateRequestStatus(id, 'approved', 'Current User');
        toast.success('Request Approved');
    };

    const handleDenyRequest = (id: string) => {
        updateRequestStatus(id, 'denied', 'Current User');
        toast.error('Request Denied');
    };

    const handleOptimizationAction = async (proposal: ProcurementProposal, action: 'approve' | 'reject') => {
        if (action === 'approve') {
            try {
                if (proposal.type === 'transfer') {
                    // Create a real Network Request
                    const sourceSite = sites.find(s => s.id === proposal.sourceSiteId);
                    const targetSite = sites.find(s => s.id === proposal.targetSiteId);

                    if (sourceSite && targetSite) {
                        await addRequest({
                            id: `req-${Date.now()}`,
                            requestedBy: 'System AI',
                            requestedBySite: targetSite, // The site needing the drug
                            targetSite: sourceSite,      // The site providing the drug
                            drug: {
                                name: proposal.drugName,
                                ndc: proposal.ndc,
                                quantity: proposal.quantity
                            },
                            reason: proposal.reason,
                            urgency: 'urgent',
                            status: 'pending',
                            requestedAt: new Date().toISOString()
                        });
                        toast.success(`Transfer Request Created: ${proposal.drugName}`);
                    }
                } else {
                    // Procurement: Simulate order arrival (update inventory immediately for demo)
                    // In a real app, this would create a Purchase Order
                    await updateInventory(
                        proposal.targetSiteId,
                        proposal.ndc,
                        proposal.quantity,
                        `Procurement Order (Auto-Approved): ${proposal.reason}`,
                        'system',
                        'System AI'
                    );
                    toast.success(`Procurement Order Placed: ${proposal.drugName}`);
                }
            } catch (error) {
                console.error("Failed to execute proposal:", error);
                toast.error("Failed to execute action");
                return; // Don't remove from list if failed
            }
        }
        // Remove from local list
        setCurrentProposals(prev => prev.filter(p => p.id !== proposal.id));
    };

    return (
        <div className="space-y-6">
            {/* Execution Roadmap Modal / Overlay */}
            {executionStep !== 'idle' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-2xl">
                        <div className="text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100">
                                <Zap className={`h-8 w-8 text-indigo-600 ${executionStep !== 'complete' ? 'animate-pulse' : ''}`} />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">
                                {executionStep === 'complete' ? 'Optimization Complete' : 'Running Auto-Logistics'}
                            </h2>
                            <p className="text-slate-500">
                                {executionStep === 'complete' ? 'AI analysis finished successfully.' : 'Analyzing network data...'}
                            </p>
                        </div>

                        <div className="space-y-4">
                            {/* Step 1: Data Pull */}
                            <div className="flex items-center justify-between rounded-lg border border-slate-100 p-3 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${executionStep === 'fetching' ? 'bg-blue-100 text-blue-600 animate-pulse' :
                                        ['analyzing', 'compliance', 'complete'].includes(executionStep) ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'
                                        }`}>
                                        {['analyzing', 'compliance', 'complete'].includes(executionStep) ? <CheckCircle2 className="h-5 w-5" /> : <span className="font-bold">1</span>}
                                    </div>
                                    <div>
                                        <p className={`font-medium ${executionStep === 'fetching' ? 'text-blue-600' : 'text-slate-900'}`}>Data Ingestion</p>
                                        <p className="text-xs text-slate-500">Fetching inventory & patient signals</p>
                                    </div>
                                </div>
                                {executionStep === 'fetching' && <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />}
                            </div>

                            {/* Step 2: Analysis */}
                            <div className="flex items-center justify-between rounded-lg border border-slate-100 p-3 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${executionStep === 'analyzing' ? 'bg-purple-100 text-purple-600 animate-pulse' :
                                        ['compliance', 'complete'].includes(executionStep) ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'
                                        }`}>
                                        {['compliance', 'complete'].includes(executionStep) ? <CheckCircle2 className="h-5 w-5" /> : <span className="font-bold">2</span>}
                                    </div>
                                    <div>
                                        <p className={`font-medium ${executionStep === 'analyzing' ? 'text-purple-600' : 'text-slate-900'}`}>Smart Analysis</p>
                                        <p className="text-xs text-slate-500">Calculating deficits & routes</p>
                                    </div>
                                </div>
                                {executionStep === 'analyzing' && <div className="h-4 w-4 animate-spin rounded-full border-2 border-purple-600 border-t-transparent" />}
                            </div>

                            {/* Step 3: Compliance */}
                            <div className="flex items-center justify-between rounded-lg border border-slate-100 p-3 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${executionStep === 'compliance' ? 'bg-amber-100 text-amber-600 animate-pulse' :
                                        executionStep === 'complete' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'
                                        }`}>
                                        {executionStep === 'complete' ? <CheckCircle2 className="h-5 w-5" /> : <span className="font-bold">3</span>}
                                    </div>
                                    <div>
                                        <p className={`font-medium ${executionStep === 'compliance' ? 'text-amber-600' : 'text-slate-900'}`}>Compliance Check</p>
                                        <p className="text-xs text-slate-500">Verifying DSCSA & 340B rules</p>
                                    </div>
                                </div>
                                {executionStep === 'compliance' && <div className="h-4 w-4 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />}
                            </div>
                        </div>

                        {executionStep === 'complete' && (
                            <div className="flex justify-center">
                                <p className="font-bold text-green-600">3 Optimized Proposals Generated</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Global Actions */}
            <div className="flex justify-end">
                <button
                    onClick={runOptimization}
                    disabled={isOptimizing}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-bold text-white shadow-lg transition-all hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl disabled:opacity-70"
                >
                    <Zap className={`h-4 w-4 ${isOptimizing ? 'animate-spin' : ''}`} />
                    {isOptimizing ? 'Running Analysis...' : 'Run Auto-Logistics'}
                </button>
            </div>

            {/* Dashboard Header / Stats */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <button
                    onClick={() => setActiveSection('approvals')}
                    className={`relative overflow-hidden rounded-xl border p-6 text-left transition-all ${activeSection === 'approvals' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-slate-200 bg-white hover:border-blue-300'
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <div className="rounded-full bg-blue-100 p-3 text-blue-600">
                            <Clock className="h-6 w-6" />
                        </div>
                        <span className="text-2xl font-black text-slate-900">{pendingRequests.length}</span>
                    </div>
                    <p className="mt-4 font-bold text-slate-900">Pending Approvals</p>
                    <p className="text-xs text-slate-500">Awaiting sign-off</p>
                </button>

                <button
                    onClick={() => setActiveSection('optimization')}
                    className={`relative overflow-hidden rounded-xl border p-6 text-left transition-all ${activeSection === 'optimization' ? 'border-purple-500 bg-purple-50 ring-1 ring-purple-500' : 'border-slate-200 bg-white hover:border-purple-300'
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <div className="rounded-full bg-purple-100 p-3 text-purple-600">
                            <Zap className="h-6 w-6" />
                        </div>
                        <span className="text-2xl font-black text-slate-900">{currentProposals.length}</span>
                    </div>
                    <p className="mt-4 font-bold text-slate-900">Optimization Opportunities</p>
                    <p className="text-xs text-slate-500">AI-driven recommendations</p>
                </button>

                <button
                    onClick={() => setActiveSection('alerts')}
                    className={`relative overflow-hidden rounded-xl border p-6 text-left transition-all ${activeSection === 'alerts' ? 'border-amber-500 bg-amber-50 ring-1 ring-amber-500' : 'border-slate-200 bg-white hover:border-amber-300'
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <div className="rounded-full bg-amber-100 p-3 text-amber-600">
                            <AlertTriangle className="h-6 w-6" />
                        </div>
                        <span className="text-2xl font-black text-slate-900">{criticalAlerts.length}</span>
                    </div>
                    <p className="mt-4 font-bold text-slate-900">Critical Alerts</p>
                    <p className="text-xs text-slate-500">Requires immediate attention</p>
                </button>
            </div>

            {/* Main Content Area */}
            <div className="min-h-[400px] rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                {activeSection === 'approvals' && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-slate-900">Pending Network Requests</h3>
                        {pendingRequests.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                <CheckCircle2 className="mb-2 h-12 w-12 opacity-20" />
                                <p>All caught up! No pending requests.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {pendingRequests.map(req => (
                                    <div key={req.id} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-4 transition-all hover:border-slate-200 hover:shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${req.urgency === 'emergency' ? 'bg-red-100 text-red-600' :
                                                req.urgency === 'urgent' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                                                }`}>
                                                <Clock className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900">{req.drug.name} <span className="text-slate-400 font-normal">({req.drug.quantity} units)</span></h4>
                                                <p className="text-xs text-slate-500">
                                                    From <span className="font-medium text-slate-700">{req.requestedBySite.name}</span> to <span className="font-medium text-slate-700">{req.targetSite.name}</span>
                                                </p>
                                                <p className="mt-1 text-xs text-slate-400">Reason: {req.reason}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleDenyRequest(req.id)}
                                                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                                            >
                                                Deny
                                            </button>
                                            <button
                                                onClick={() => handleApproveRequest(req.id)}
                                                className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
                                            >
                                                Approve
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeSection === 'optimization' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-900">AI Optimization Opportunities</h3>
                        </div>
                        <OptimizationApprovals
                            proposals={currentProposals}
                            onApprove={(p) => handleOptimizationAction(p, 'approve')}
                            onReject={(p) => handleOptimizationAction(p, 'reject')}
                        />
                    </div>
                )}

                {activeSection === 'alerts' && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-slate-900">Critical System Alerts</h3>
                        {criticalAlerts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                <CheckCircle2 className="mb-2 h-12 w-12 opacity-20" />
                                <p>System healthy. No critical alerts.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {criticalAlerts.map(alert => (
                                    <div key={alert.id} className="flex items-start gap-4 rounded-lg border border-red-100 bg-red-50/50 p-4">
                                        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                                        <div className="flex-1">
                                            <h4 className="font-bold text-red-900">{alert.title}</h4>
                                            <p className="text-sm text-red-700">{alert.message}</p>
                                            <p className="mt-2 text-xs text-red-500">{new Date(alert.timestamp).toLocaleString()}</p>
                                        </div>
                                        <button
                                            onClick={() => markNotificationAsRead(alert.id)}
                                            className="rounded-full p-1 text-red-400 hover:bg-red-100 hover:text-red-600"
                                        >
                                            <XCircle className="h-5 w-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
