import { OptimizationService } from '../../../../services/optimization.service';
import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import type { Site, SiteInventory, NetworkRequest } from '../../../../types/location';
import { useApp } from '../../../../context/AppContext';
import toast from 'react-hot-toast';

interface NetworkRequestFormProps {
    sourceSite: Site;
    destinationSite?: Site;
    inventories: SiteInventory[];
    onClose: () => void;
    onSubmit: (request: NetworkRequest) => void;
}

export function NetworkRequestForm({ sourceSite, destinationSite, inventories, onClose, onSubmit }: NetworkRequestFormProps) {
    const { sites: allSites } = useApp();
    const [selectedDrug, setSelectedDrug] = useState('');
    const [quantity, setQuantity] = useState('');
    const [reason, setReason] = useState('');
    const [urgency, setUrgency] = useState<'routine' | 'urgent' | 'emergency'>('routine');
    const [destSite, setDestSite] = useState(destinationSite?.id || '');
    const [sourceDeptId, setSourceDeptId] = useState(sourceSite.departments?.[0]?.id || '');
    const [destDeptId, setDestDeptId] = useState('');
    const [validationError, setValidationError] = useState<string | null>(null);

    const sourceInventory = inventories.find(inv => inv.siteId === sourceSite.id);
    const availableDrugs = sourceInventory?.drugs || [];

    const selectedDrugInfo = availableDrugs.find(d => d.drugName === selectedDrug);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedDrugInfo || !destSite) return;

        const targetSite = allSites.find(s => s.id === destSite);
        if (!targetSite) return;

        const newRequest: NetworkRequest = {
            // eslint-disable-next-line react-hooks/purity
            id: `NR-${Date.now()}`,
            requestedBy: 'Current User',
            requestedBySite: sourceSite,
            sourceDepartmentId: sourceDeptId,
            targetSite: targetSite,
            targetDepartmentId: destDeptId,
            drug: {
                name: selectedDrugInfo.drugName,
                ndc: selectedDrugInfo.ndc,
                quantity: parseInt(quantity),
            },
            reason,
            urgency,
            status: 'pending',
            requestedAt: new Date().toISOString(),
        };

        onSubmit(newRequest);
    };

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-200 p-6">
                    <h2 className="text-xl font-bold text-slate-900">Request Network Transfer</h2>
                    <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">From (Source)</label>
                            <input
                                type="text"
                                value={sourceSite.name}
                                disabled
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm"
                            />
                            {sourceSite.departments && sourceSite.departments.length > 0 && (
                                <div className="mt-2">
                                    <label className="mb-1 block text-xs font-medium text-slate-700">Department</label>
                                    <select
                                        value={sourceDeptId}
                                        onChange={(e) => setSourceDeptId(e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                                    >
                                        {sourceSite.departments.map(dept => (
                                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">To (Destination)</label>
                                <div className="flex gap-2">
                                    <select
                                        value={destSite}
                                        onChange={(e) => {
                                            const newDestId = e.target.value;
                                            setDestSite(newDestId);
                                            setDestDeptId('');

                                            // Validation
                                            if (newDestId) {
                                                const target = allSites.find(s => s.id === newDestId);
                                                if (target) {
                                                    // Infer attrs or use null for generic site check (Act 145/DSCSA only) if no drug selected
                                                    const attrs = selectedDrugInfo
                                                        ? OptimizationService.inferAttributes(selectedDrugInfo.drugName, selectedDrugInfo.ndc)
                                                        : { schedule: null, isColdChain: false };

                                                    const result = OptimizationService.validateTransfer(sourceSite, target, attrs);
                                                    if (!result.valid) {
                                                        setValidationError(result.reason || 'Invalid transfer');
                                                    } else {
                                                        setValidationError(null);
                                                    }
                                                }
                                            } else {
                                                setValidationError(null);
                                            }
                                        }}
                                        className={`w-full rounded-lg border px-4 py-2 text-sm outline-none focus:ring-2 ${validationError ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-slate-200 focus:border-primary-500 focus:ring-primary-100'}`}
                                        required
                                    >
                                        <option value="">Select destination...</option>
                                        {allSites.filter(s => s.id !== sourceSite.id).map(site => (
                                            <option key={site.id} value={site.id}>{site.name}</option>
                                        ))}
                                    </select>

                                    {/* Smart Suggest Button */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            // Simple logic: find closest compliant site
                                            // For now, just pick the first compliant one that isn't source
                                            const attrs = selectedDrugInfo
                                                ? OptimizationService.inferAttributes(selectedDrugInfo.drugName, selectedDrugInfo.ndc)
                                                : { schedule: null, isColdChain: false };

                                            const compliantSite = allSites.find(s =>
                                                s.id !== sourceSite.id &&
                                                OptimizationService.validateTransfer(sourceSite, s, attrs).valid
                                            );
                                            if (compliantSite) {
                                                setDestSite(compliantSite.id);
                                                setValidationError(null);
                                            } else {
                                                toast.error('No compliant sites found.');
                                            }
                                        }}
                                        className="whitespace-nowrap rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 text-xs font-medium text-purple-700 hover:bg-purple-100"
                                        title="Find best compliant site"
                                    >
                                        Auto-Select
                                    </button>
                                </div>
                                {validationError && (
                                    <div className="mt-2 flex items-center gap-1 text-xs text-red-600 animate-in slide-in-from-top-1">
                                        <AlertTriangle className="h-3 w-3" />
                                        {validationError}
                                    </div>
                                )}
                            </div>
                            {destSite && (
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-slate-700">Department</label>
                                    <select
                                        value={destDeptId}
                                        onChange={(e) => setDestDeptId(e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                                    >
                                        <option value="">Select department...</option>
                                        {allSites.find(s => s.id === destSite)?.departments?.map(dept => (
                                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">Medication</label>
                            <select
                                value={selectedDrug}
                                onChange={(e) => setSelectedDrug(e.target.value)}
                                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                                required
                            >
                                <option value="">Select medication...</option>
                                {availableDrugs.map((drug, index) => (
                                    <option key={index} value={drug.drugName}>
                                        {drug.drugName} ({drug.quantity} available)
                                    </option>
                                ))}
                            </select>
                            {selectedDrugInfo && (
                                <p className="mt-1 text-xs text-slate-500">
                                    NDC: {selectedDrugInfo.ndc} | Available: {selectedDrugInfo.quantity} units
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">Quantity Requested</label>
                            <input
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                min="1"
                                max={selectedDrugInfo?.quantity || 999}
                                placeholder="Enter quantity"
                                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                                required
                            />
                            {selectedDrugInfo && parseInt(quantity) > selectedDrugInfo.quantity && (
                                <div className="mt-2 flex items-center gap-1 text-xs text-red-600">
                                    <AlertTriangle className="h-3 w-3" />
                                    Requested quantity exceeds available stock
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">Urgency Level</label>
                            <div className="grid grid-cols-3 gap-2">
                                {(['routine', 'urgent', 'emergency'] as const).map((level) => (
                                    <button
                                        key={level}
                                        type="button"
                                        onClick={() => setUrgency(level)}
                                        className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${urgency === level
                                            ? level === 'emergency' ? 'border-red-500 bg-red-50 text-red-700' :
                                                level === 'urgent' ? 'border-amber-500 bg-amber-50 text-amber-700' :
                                                    'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                            }`}
                                    >
                                        {level.charAt(0).toUpperCase() + level.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">Reason for Request</label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Explain the clinical need..."
                                rows={3}
                                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                                required
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!selectedDrug || !quantity || !destSite || (selectedDrugInfo && parseInt(quantity) > selectedDrugInfo.quantity)}
                            className="flex-1 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Submit Request
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
