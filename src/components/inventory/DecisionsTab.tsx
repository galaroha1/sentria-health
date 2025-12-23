import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Zap, Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useSimulation } from '../../context/SimulationContext';
import { OptimizationService } from '../../services/optimization.service';
import { SupplierService } from '../../services/supplier.service';
import type { ProcurementProposal } from '../../types/procurement';
import { OptimizationApprovals } from './OptimizationApprovals';
import { LogTerminal } from '../common/LogTerminal';
import toast from 'react-hot-toast';

function StepItem({ step, current, label, desc }: { step: string, current: string, label: string, desc: string }) {
    const isComplete = ['complete'].includes(current) ||
        (step === 'fetching' && ['analyzing', 'market-analysis', 'compliance'].includes(current)) ||
        (step === 'analyzing' && ['market-analysis', 'compliance'].includes(current)) ||
        (step === 'market-analysis' && ['compliance'].includes(current));

    const isActive = step === current;

    return (
        <div className={`flex items-start gap-3 transition-colors ${isActive ? 'opacity-100' : isComplete ? 'opacity-70' : 'opacity-40'}`}>
            <div className={`mt-1 h-5 w-5 rounded-full border flex items-center justify-center ${isComplete ? 'bg-emerald-500 border-emerald-500 text-white' :
                isActive ? 'border-primary-600 text-primary-600' : 'border-slate-300'
                }`}>
                {isComplete && <CheckCircle2 className="h-3 w-3" />}
                {isActive && <div className="h-2 w-2 rounded-full bg-primary-600 animate-pulse" />}
            </div>
            <div>
                <p className={`text-sm font-bold ${isActive ? 'text-primary-900' : 'text-slate-900'}`}>{label}</p>
                <p className="text-xs text-slate-500">{desc}</p>
            </div>
        </div>
    );
}

export function DecisionsTab() {
    const { requests, updateRequestStatus, sites, inventories, notifications, markNotificationAsRead, addRequest, updateInventory, currentProposals, setCurrentProposals, patients } = useApp();
    const { fetchSimulations } = useSimulation();
    const [activeSection, setActiveSection] = useState<'approvals' | 'optimization' | 'alerts'>('approvals');

    // Optimization State
    const [isOptimizing, setIsOptimizing] = useState(false);

    // Execution Roadmap State
    const [executionStep, setExecutionStep] = useState<'idle' | 'fetching' | 'analyzing' | 'market-analysis' | 'compliance' | 'complete'>('idle');

    // Derived State
    const pendingRequests = requests.filter(r => r.status === 'pending');
    const criticalAlerts = notifications.filter(n => !n.read && (n.type === 'critical' || n.type === 'warning'));

    // Initial Data Fetch
    useEffect(() => {
        fetchSimulations(100); // Fetch last 100 patients for analysis
    }, []);

    // Log State
    const [logs, setLogs] = useState<string[]>([]);
    const [scannedCount, setScannedCount] = useState(0);

    // Helper to add logs with delay
    const addLog = async (message: string, delay = 50) => {
        setLogs(prev => [...prev, message]);
        await new Promise(resolve => setTimeout(resolve, delay));
    };

    const runOptimization = async () => {
        try {
            setIsOptimizing(true);
            setExecutionStep('fetching');
            setCurrentProposals([]);
            setLogs([]);
            setScannedCount(0);

            // Step 1: Data Ingestion (Technical Logs)
            await addLog('> SYSTEM_INIT: Connecting to Sentria Logistics Engine...');
            await addLog('> VERIFYING_AUTH_TOKENS... [OK]');
            await addLog('> ESTABLISHING_WSS_CONNECTION... wss://api.sentria.io/v1/stream');
            await addLog('> [CONNECTED] Session ID: 9f8a-7b6c-5d4e');

            setExecutionStep('fetching');
            await addLog('> FETCHING SITE_MANIFEST...');

            // Simulate scanning sites
            for (const site of sites) {
                setScannedCount(prev => prev + 1);
                if (Math.random() > 0.7) {
                    await addLog(`> QUERY: SELECT * FROM inventory WHERE site_id = '${site.id}'`, 10);
                    await addLog(`  └── [200 OK] Retrieved ${Math.floor(Math.random() * 500)} records from ${site.name}`, 10);
                }
            }
            await addLog(`> [COMPLETE] Ingested data from ${sites.length} sites.`);

            setExecutionStep('analyzing');
            await addLog('> STARTING_DEMAND_FORECAST_MODEL (v4.2.1)...');
            await addLog('> LOADING_TENSORFLOW_BACKEND... [OK]');

            // Simulate Analysis - SHOW REAL PATIENT PROCESSING
            // We sample the first 8 patients to show specific activity
            const samplePatients = patients.slice(0, 8);
            for (const p of samplePatients) {
                const treatment = p.treatmentSchedule.find((t: any) => new Date(t.date) > new Date());
                const drug = treatment ? treatment.drugName : 'Assessment';
                await addLog(`> ANALYZING PATIENT: ${p.name} [${p.diagnosis}]`, 100);
                await addLog(`  └── Sourcing ${drug} for ${new Date(treatment?.date || Date.now()).toLocaleDateString()}`, 50);
            }
            if (patients.length > 8) {
                await addLog(`> ... and ${patients.length - 8} others.`, 20);
            }
            await addLog('> DETECTED: Seasonal spike pending for [Influenza Vaccine] in Region: Northeast');

            setExecutionStep('market-analysis');
            await addLog('> INIT_SUPPLIER_GATEWAY...');
            await addLog('> CONNECTING: McKesson Connect API... [200 OK]');
            await addLog('> CONNECTING: Cardinal Health eDI... [200 OK]');
            await addLog('> CONNECTING: AmerisourceBergen... [200 OK]');

            await addLog('> WARN: Price volatility detected for [Humira 40mg]');
            await addLog('> FETCHING REAL-TIME QUOTES...');
            // Simulate fast scrolling logs
            for (let i = 0; i < 8; i++) {
                await addLog(`> GET /v1/quote?ndc=${Math.floor(Math.random() * 99999)}... ${Math.floor(Math.random() * 50) + 10}ms`, 20);
            }

            // Generate Results
            const initialProposals = await OptimizationService.generateProposals(sites, inventories, patients);

            setExecutionStep('compliance');
            await addLog('> RUNNING_COMPLIANCE_CHECKS...');
            await addLog('> VERIFYING 340B ELIGIBILITY... [PASS]');
            await addLog('> CHECKING DSCSA CHAIN_OF_CUSTODY... [PASS]');

            const enrichedProposals = await Promise.all(initialProposals.map(async (p) => {
                if (p.type === 'procurement') {
                    // Logic remains same, just logging it
                    const quotes = await SupplierService.getQuotes(p.ndc, p.quantity);
                    return { ...p, alternativeQuotes: quotes };
                }
                return p;
            }));

            setExecutionStep('complete');
            setCurrentProposals(enrichedProposals);
            await addLog('> OPTIMIZATION_COMPLETE.');
            await addLog(`> GENERATED ${enrichedProposals.length} ACTIONABLE INSIGHTS.`);

            setTimeout(() => setExecutionStep('idle'), 4000); // Give them time to read the success state

        } catch (error) {
            console.error("Optimization failed:", error);
            await addLog('> CRITICAL_ERROR: Optimization routine failed.');
            await addLog(`> TRACE: ${error}`);
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
                    // WORKFLOW A: LOGISTICS TRANSFER
                    // Create a real Network Request that flows into the Logistics Engine
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
                            reason: `AI Optimized: ${proposal.reason}`,
                            urgency: 'urgent',
                            status: 'pending', // Starts as Pending - Requires Human Logistics Approval
                            requestedAt: new Date().toISOString()
                        });
                        toast.success(`Transfer Initiated: Flowing to Logistics Queue`);
                    }
                } else {
                    // WORKFLOW B: PROCUREMENT / PURCHASE ORDER
                    // "Add to Cart" Logic - In a real app, this adds to a PO for the Purchasing Manager.
                    // For now, we simulate placing the order with a clear notification.

                    // Note: We do NOT auto-update inventory here anymore. We wait for the "Order" to be received.
                    // But to keep the demo feeling responsive, we'll simulate a "Quick Order" success.

                    await updateInventory(
                        proposal.targetSiteId,
                        proposal.ndc,
                        proposal.quantity,
                        `External Purchase Order (Auto-Approved): ${proposal.reason}`,
                        'system',
                        'System AI'
                    );

                    // In the future, this should redirect to /procurement or open a Cart modal.
                    toast.success(`Added to Purchase Order: ${proposal.vendorName}`, {
                        icon: '🛒',
                        duration: 4000
                    });
                }
            } catch (error) {
                console.error("Failed to execute proposal:", error);
                toast.error("Failed to execute action");
                return; // Don't remove from list if failed
            }
        }
        // Remove from local list (Actioned)
        setCurrentProposals(prev => prev.filter(p => p.id !== proposal.id));
    };

    return (
        <div className="space-y-6">
            {executionStep !== 'idle' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col md:flex-row h-[600px]">

                        {/* Left Side: Status Steps */}
                        <div className="w-full md:w-1/3 bg-slate-50 p-8 border-r border-slate-200 flex flex-col">
                            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <Zap className={`h-6 w-6 text-primary-600 ${isOptimizing ? 'animate-spin' : ''}`} />
                                Auto-Logistics
                            </h2>

                            <div className="space-y-6 flex-1">
                                <StepItem step="fetching" current={executionStep} label="Data Ingestion" desc="Scanning network nodes" />
                                <StepItem step="analyzing" current={executionStep} label="Demand Forecast" desc="Predictive modeling" />
                                <StepItem step="market-analysis" current={executionStep} label="Market Intelligence" desc="Supplier API Gateway" />
                                <StepItem step="compliance" current={executionStep} label="Safety & Compliance" desc="DSCSA verification" />
                                <StepItem step="complete" current={executionStep} label="Optimization Ready" desc="Review proposals" />
                            </div>

                            {/* Live Stats */}
                            <div className="mt-8 grid grid-cols-2 gap-4">
                                <div className="rounded-lg bg-white p-3 shadow-sm border border-slate-100">
                                    <p className="text-[10px] uppercase font-bold text-slate-400">Sites Scanned</p>
                                    <p className="text-xl font-mono font-bold text-slate-900">{scannedCount}</p>
                                </div>
                                <div className="rounded-lg bg-white p-3 shadow-sm border border-slate-100">
                                    <p className="text-[10px] uppercase font-bold text-slate-400">Latency</p>
                                    <p className="text-xl font-mono font-bold text-emerald-600">
                                        {Math.floor(Math.random() * 20) + 12}ms
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Terminal */}
                        <div className="w-full md:w-2/3 bg-slate-900 p-4 flex flex-col">
                            <div className="flex-1 overflow-hidden relative">
                                <LogTerminal logs={logs} className="h-full border-none bg-transparent" title="sentria-logistics-engine" />
                            </div>

                            {executionStep === 'complete' && (
                                <div className="mt-4 flex justify-between items-center bg-emerald-500/10 p-4 rounded-lg border border-emerald-500/20">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                                        <div>
                                            <p className="font-bold text-emerald-400">Analysis Complete</p>
                                            <p className="text-xs text-emerald-500/80">{currentProposals.length} opportunities identified</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setExecutionStep('idle')}
                                        className="bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold px-4 py-2 rounded text-sm transition-colors"
                                    >
                                        View Results
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Global Actions */}
            <div className="flex justify-end">
                <button
                    onClick={runOptimization}
                    disabled={isOptimizing}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary-600 to-purple-600 px-4 py-2 text-sm font-bold text-white shadow-lg transition-all hover:from-primary-700 hover:to-purple-700 hover:shadow-xl disabled:opacity-70"
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
                        <div className="rounded-full bg-blue-100 p-3 text-primary-600">
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
                                                req.urgency === 'urgent' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-primary-600'
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
