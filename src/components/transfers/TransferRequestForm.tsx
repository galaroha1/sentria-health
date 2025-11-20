import { useState } from 'react';
import { Package, AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { PolicyCheck } from '../../types/transfer';

export function TransferRequestForm({ onClose, onSubmit }: { onClose: () => void; onSubmit: (data: any) => void }) {
    const { sites } = useApp();
    const [sourceSiteId, setSourceSiteId] = useState('');
    const [sourceDeptId, setSourceDeptId] = useState('');
    const [destSiteId, setDestSiteId] = useState('');
    const [destDeptId, setDestDeptId] = useState('');
    const [drugName, setDrugName] = useState('');
    const [ndc, setNdc] = useState('');
    const [lotNumber, setLotNumber] = useState('');
    const [quantity, setQuantity] = useState('');
    const [reason, setReason] = useState('');

    const sourceSite = sites.find(s => s.id === sourceSiteId);
    const destSite = sites.find(s => s.id === destSiteId);

    const policyChecks: PolicyCheck[] = [
        { id: '1', name: 'Expiration Date', passed: true, message: 'Sufficient shelf life (8+ months)' },
        { id: '2', name: 'Storage Compatibility', passed: true, message: 'Both departments have refrigeration' },
        { id: '3', name: 'Payer Restrictions', passed: true, message: 'No conflicts detected' },
        { id: '4', name: 'Hospital Policy', passed: quantity ? parseInt(quantity) <= 50 : true, message: quantity && parseInt(quantity) > 50 ? 'Quantities >50 require director approval' : 'Transfer allowed' },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            sourceDept: sourceDeptId, // Keeping key name for compatibility but passing ID
            destDept: destDeptId,
            drugName,
            ndc,
            lotNumber,
            quantity,
            reason
        });
    };

    const allPassed = policyChecks.every(check => check.passed);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-3xl rounded-xl border border-slate-200 bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-200 p-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                            <Package className="h-5 w-5" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">New Transfer Request</h2>
                    </div>
                    <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Source Selection */}
                        <div className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">Source Location</label>
                                <select
                                    value={sourceSiteId}
                                    onChange={(e) => {
                                        setSourceSiteId(e.target.value);
                                        setSourceDeptId('');
                                    }}
                                    className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                                    required
                                >
                                    <option value="">Select location...</option>
                                    {sites.map(site => (
                                        <option key={site.id} value={site.id}>{site.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">Source Department</label>
                                <select
                                    value={sourceDeptId}
                                    onChange={(e) => setSourceDeptId(e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                                    required
                                    disabled={!sourceSiteId}
                                >
                                    <option value="">Select department...</option>
                                    {sourceSite?.departments?.map(dept => (
                                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Destination Selection */}
                        <div className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">Destination Location</label>
                                <select
                                    value={destSiteId}
                                    onChange={(e) => {
                                        setDestSiteId(e.target.value);
                                        setDestDeptId('');
                                    }}
                                    className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                                    required
                                >
                                    <option value="">Select location...</option>
                                    {sites.filter(s => s.id !== sourceSiteId).map(site => (
                                        <option key={site.id} value={site.id}>{site.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">Destination Department</label>
                                <select
                                    value={destDeptId}
                                    onChange={(e) => setDestDeptId(e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                                    required
                                    disabled={!destSiteId}
                                >
                                    <option value="">Select department...</option>
                                    {destSite?.departments?.map(dept => (
                                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">Drug Name</label>
                            <input
                                type="text"
                                value={drugName}
                                onChange={(e) => setDrugName(e.target.value)}
                                placeholder="e.g., Keytruda (Pembrolizumab)"
                                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">NDC</label>
                            <input
                                type="text"
                                value={ndc}
                                onChange={(e) => setNdc(e.target.value)}
                                placeholder="0006-3026-02"
                                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">Lot Number</label>
                            <input
                                type="text"
                                value={lotNumber}
                                onChange={(e) => setLotNumber(e.target.value)}
                                placeholder="K99281"
                                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">Quantity</label>
                            <input
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                placeholder="5"
                                min="1"
                                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                                required
                            />
                        </div>
                    </div>

                    <div className="mt-6">
                        <label className="mb-2 block text-sm font-medium text-slate-700">Reason for Transfer</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Describe the clinical need for this transfer..."
                            rows={3}
                            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                            required
                        />
                    </div>

                    <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <h3 className="mb-3 text-sm font-bold text-slate-900">Policy Validation</h3>
                        <div className="space-y-2">
                            {policyChecks.map((check) => (
                                <div key={check.id} className="flex items-start gap-2">
                                    {check.passed ? (
                                        <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-600" />
                                    ) : (
                                        <AlertTriangle className="h-4 w-4 flex-shrink-0 text-amber-600" />
                                    )}
                                    <div>
                                        <p className={`text-sm font-medium ${check.passed ? 'text-slate-900' : 'text-amber-900'}`}>
                                            {check.name}
                                        </p>
                                        <p className="text-xs text-slate-600">{check.message}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!allPassed}
                            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Submit for Approval
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
