import { useState } from 'react';
import { Plus, Clock, CheckCircle2, TrendingUp, FileText, Truck } from 'lucide-react';
import { auditLog } from '../data/transfers/mockData';
import { TransferRequestForm } from '../components/transfers/TransferRequestForm';
import { useApp } from '../context/AppContext';
import { TransferApprovalCard } from '../components/transfers/TransferApprovalCard';
import { TransferStatusTimeline } from '../components/transfers/TransferStatusTimeline';
import { SuggestedTransfers } from '../components/transfers/SuggestedTransfers';
import { AuditLogTable } from '../components/transfers/AuditLogTable';
import type { NetworkRequest } from '../types/location';
import type { TransferRequest } from '../types/transfer';

type TabType = 'active' | 'approvals' | 'suggested' | 'audit';

export function Transfers() {
    const { requests, updateRequestStatus, addRequest, sites } = useApp();
    const [activeTab, setActiveTab] = useState<TabType>('active');
    const [showRequestForm, setShowRequestForm] = useState(false);

    // Adapter to convert NetworkRequest to TransferRequest for UI components
    const adaptRequest = (req: NetworkRequest): TransferRequest => ({
        id: req.id,
        requestedBy: req.requestedBy,
        requestedAt: req.requestedAt,
        sourceDepartment: { id: req.requestedBySite.id, name: req.requestedBySite.name, type: 'clinical' }, // Mapping Site to Dept
        destinationDepartment: { id: req.targetSite.id, name: req.targetSite.name, type: 'clinical' },
        drug: {
            name: req.drug.name,
            ndc: req.drug.ndc,
            lotNumber: req.drug.lotNumber || 'N/A',
        },
        quantity: req.drug.quantity,
        reason: req.reason,
        status: req.status,
        policyChecks: req.policyChecks || [],
        approvedBy: req.approvedBy,
        approvedAt: req.approvedAt,
        inTransitAt: req.inTransitAt,
        completedAt: req.completedAt,
    });

    // Filter requests for different views
    const pendingTransfers = requests.filter(t => t.status === 'pending').map(adaptRequest);
    const inTransitTransfers = requests.filter(t => t.status === 'in_transit').map(adaptRequest);
    const completedToday = requests.filter(t =>
        t.status === 'completed' &&
        t.completedAt &&
        new Date(t.completedAt).toDateString() === new Date().toDateString()
    ).map(adaptRequest);

    const activeTransfers = requests
        .filter(t => t.status !== 'completed' && t.status !== 'denied')
        .map(adaptRequest);

    const handleApprove = (id: string) => {
        updateRequestStatus(id, 'in_transit', 'Current User');
    };

    const handleDeny = (id: string) => {
        updateRequestStatus(id, 'denied');
    };

    const handleInitiateSuggestion = () => {
        setShowRequestForm(true);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleRequestSubmit = (data: any) => {
        // Map form data to NetworkRequest
        // Note: TransferRequestForm uses 'departments' but we need 'sites'.
        // For now, we'll try to find a site that matches the ID or just use the first one as fallback/mock
        // In a real app, the form should use the same 'sites' data.

        const sourceSite = sites.find(s => s.id === data.sourceDept) || sites[0];
        const targetSite = sites.find(s => s.id === data.destDept) || sites[1];

        const newRequest: NetworkRequest = {
            id: `TR-${Date.now()}`,
            requestedBy: 'Current User',
            requestedBySite: sourceSite,
            targetSite: targetSite,
            drug: {
                name: data.drugName,
                ndc: data.ndc,
                quantity: parseInt(data.quantity),
                lotNumber: data.lotNumber
            },
            reason: data.reason,
            urgency: 'routine',
            status: 'pending',
            requestedAt: new Date().toISOString(),
            policyChecks: [
                { id: '1', name: 'Expiration Date', passed: true, message: 'Sufficient shelf life' },
                { id: '2', name: 'Storage Compatibility', passed: true, message: 'Compatible' },
                { id: '3', name: 'Payer Restrictions', passed: true, message: 'No conflicts' },
                { id: '4', name: 'Hospital Policy', passed: true, message: 'Authorized' },
            ]
        };

        addRequest(newRequest);
        setShowRequestForm(false);
    };

    const tabs = [
        { id: 'active' as TabType, label: 'Active Transfers', icon: Truck },
        { id: 'approvals' as TabType, label: 'Pending Approvals', icon: Clock, badge: pendingTransfers.length },
        { id: 'suggested' as TabType, label: 'Suggested', icon: TrendingUp },
        { id: 'audit' as TabType, label: 'Audit Log', icon: FileText },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Inter-Service Transfers</h1>
                    <p className="text-sm text-slate-500">Manage inventory transfers between departments</p>
                </div>
                <button
                    onClick={() => setShowRequestForm(true)}
                    className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                >
                    <Plus className="h-4 w-4" />
                    New Transfer Request
                </button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                            <Clock className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Pending Approvals</p>
                            <p className="text-2xl font-bold text-slate-900">{pendingTransfers.length}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                            <Truck className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">In Transit</p>
                            <p className="text-2xl font-bold text-slate-900">{inTransitTransfers.length}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                            <CheckCircle2 className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Completed Today</p>
                            <p className="text-2xl font-bold text-slate-900">{completedToday.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200">
                    <div className="flex gap-1 p-2">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`relative flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${activeTab === tab.id
                                        ? 'bg-slate-900 text-white'
                                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {tab.label}
                                    {tab.badge !== undefined && tab.badge > 0 && (
                                        <span className={`ml-1 rounded-full px-2 py-0.5 text-xs font-bold ${activeTab === tab.id ? 'bg-white text-slate-900' : 'bg-primary-100 text-primary-700'
                                            }`}>
                                            {tab.badge}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="p-6">
                    {activeTab === 'active' && (
                        <div className="space-y-6">
                            {activeTransfers.map((transfer) => (
                                <TransferStatusTimeline key={transfer.id} transfer={transfer} />
                            ))}
                        </div>
                    )}

                    {activeTab === 'approvals' && (
                        <div className="space-y-6">
                            {pendingTransfers.length === 0 ? (
                                <p className="py-12 text-center text-slate-500">No pending approvals</p>
                            ) : (
                                pendingTransfers.map((transfer) => (
                                    <TransferApprovalCard
                                        key={transfer.id}
                                        transfer={transfer}
                                        onApprove={handleApprove}
                                        onDeny={handleDeny}
                                    />
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'suggested' && (
                        <SuggestedTransfers
                            onInitiate={handleInitiateSuggestion}
                        />
                    )}

                    {activeTab === 'audit' && (
                        <AuditLogTable logs={auditLog} />
                    )}
                </div>
            </div>

            {showRequestForm && (
                <TransferRequestForm
                    onClose={() => setShowRequestForm(false)}
                    onSubmit={handleRequestSubmit}
                />
            )}
        </div>
    );
}
