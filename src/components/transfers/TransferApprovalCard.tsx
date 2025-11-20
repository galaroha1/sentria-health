import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import type { TransferRequest } from '../../types/transfer';

export function TransferApprovalCard({ transfer, onApprove, onDeny }: {
    transfer: TransferRequest;
    onApprove: (id: string) => void;
    onDeny: (id: string, reason: string) => void;
}) {
    const allPoliciesPassed = transfer.policyChecks.every(check => check.passed);

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-start justify-between">
                <div>
                    <h3 className="text-lg font-bold text-slate-900">{transfer.drug.name}</h3>
                    <p className="text-sm text-slate-500">Transfer ID: {transfer.id}</p>
                </div>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                    Pending Approval
                </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div>
                    <p className="text-xs font-medium text-slate-500">From</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{transfer.sourceDepartment.name}</p>
                </div>
                <div>
                    <p className="text-xs font-medium text-slate-500">To</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{transfer.destinationDepartment.name}</p>
                </div>
                <div>
                    <p className="text-xs font-medium text-slate-500">NDC / Lot</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{transfer.drug.ndc} / {transfer.drug.lotNumber}</p>
                </div>
                <div>
                    <p className="text-xs font-medium text-slate-500">Quantity</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{transfer.quantity} units</p>
                </div>
            </div>

            <div className="mt-4">
                <p className="text-xs font-medium text-slate-500">Requested By</p>
                <p className="mt-1 text-sm text-slate-900">{transfer.requestedBy} on {new Date(transfer.requestedAt).toLocaleString()}</p>
            </div>

            <div className="mt-4">
                <p className="text-xs font-medium text-slate-500">Reason</p>
                <p className="mt-1 text-sm text-slate-700">{transfer.reason}</p>
            </div>

            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <h4 className="mb-2 text-xs font-bold uppercase text-slate-700">Policy Checks</h4>
                <div className="space-y-2">
                    {transfer.policyChecks.map((check) => (
                        <div key={check.id} className="flex items-center gap-2">
                            {check.passed ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            ) : (
                                <AlertTriangle className="h-4 w-4 text-amber-600" />
                            )}
                            <span className="text-xs text-slate-700">{check.name}: {check.message}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-6 flex gap-3">
                <button
                    onClick={() => onApprove(transfer.id)}
                    disabled={!allPoliciesPassed}
                    className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <CheckCircle2 className="mr-2 inline-block h-4 w-4" />
                    Approve Transfer
                </button>
                <button
                    onClick={() => onDeny(transfer.id, 'Policy violation or clinical concern')}
                    className="flex-1 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
                >
                    <XCircle className="mr-2 inline-block h-4 w-4" />
                    Deny Transfer
                </button>
            </div>
        </div>
    );
}
