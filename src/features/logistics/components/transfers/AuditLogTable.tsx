import { Download, Search } from 'lucide-react';
import type { AuditLogEntry } from '../../../../types/transfer';

export function AuditLogTable({ logs }: { logs: AuditLogEntry[] }) {
    const getActionBadge = (action: AuditLogEntry['action']) => {
        const styles = {
            request_created: 'bg-blue-100 text-blue-700',
            approved: 'bg-emerald-100 text-emerald-700',
            denied: 'bg-red-50 text-red-700',
            in_transit: 'bg-amber-100 text-amber-700',
            completed: 'bg-slate-100 text-slate-700',
            cancelled: 'bg-slate-100 text-slate-700',
        };

        const labels = {
            request_created: 'Requested',
            approved: 'Approved',
            denied: 'Denied',
            in_transit: 'In Transit',
            completed: 'Completed',
            cancelled: 'Cancelled',
        };

        return (
            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${styles[action]}`}>
                {labels[action]}
            </span>
        );
    };

    return (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 p-6">
                <h3 className="font-bold text-slate-900">Audit Log</h3>
                <div className="flex gap-3">
                    <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
                        <Search className="h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search logs..."
                            className="bg-transparent text-sm outline-none placeholder:text-slate-400"
                        />
                    </div>
                    <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                        <Download className="h-4 w-4" />
                        Export
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                        <tr>
                            <th className="px-6 py-3 font-medium">Timestamp</th>
                            <th className="px-6 py-3 font-medium">User</th>
                            <th className="px-6 py-3 font-medium">Action</th>
                            <th className="px-6 py-3 font-medium">Transfer ID</th>
                            <th className="px-6 py-3 font-medium">Drug</th>
                            <th className="px-6 py-3 font-medium">Quantity</th>
                            <th className="px-6 py-3 font-medium">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                        {logs.map((log) => (
                            <tr key={log.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 text-slate-600">
                                    {new Date(log.timestamp).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 font-medium text-slate-900">{log.userName}</td>
                                <td className="px-6 py-4">{getActionBadge(log.action)}</td>
                                <td className="px-6 py-4 font-mono text-xs text-slate-600">{log.transferId}</td>
                                <td className="px-6 py-4 text-slate-900">{log.drug}</td>
                                <td className="px-6 py-4 text-slate-600">{log.quantity}</td>
                                <td className="px-6 py-4 text-slate-600">{log.details}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
