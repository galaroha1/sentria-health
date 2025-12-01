import { FileText, ShieldCheck, Download, AlertTriangle } from 'lucide-react';

export function ComplianceTab() {
    const audits = [
        { id: 1, type: 'DEA Check', status: 'Passed', date: '2024-03-15', auditor: 'System' },
        { id: 2, type: 'Temp Log Review', status: 'Warning', date: '2024-03-14', auditor: 'Dr. Rodriguez' },
        { id: 3, type: 'Inventory Count', status: 'Passed', date: '2024-03-10', auditor: 'Sarah Chen' },
    ];

    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-bold text-slate-900">Compliance Status</h3>
                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                            <ShieldCheck className="h-8 w-8" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">Compliant</p>
                            <p className="text-sm text-slate-500">Last full audit: 3 days ago</p>
                        </div>
                    </div>
                    <div className="mt-6 space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600">DEA Reporting</span>
                            <span className="flex items-center gap-1 font-medium text-emerald-600"><CheckCircle2 className="h-3 w-3" /> Up to date</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600">FDA Track & Trace</span>
                            <span className="flex items-center gap-1 font-medium text-emerald-600"><CheckCircle2 className="h-3 w-3" /> Active</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600">Temp Logs</span>
                            <span className="flex items-center gap-1 font-medium text-amber-600"><AlertTriangle className="h-3 w-3" /> Review Needed</span>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-bold text-slate-900">Quick Reports</h3>
                    <div className="grid gap-3">
                        <button
                            onClick={() => alert('Downloading Controlled Substance Log...')}
                            className="flex items-center justify-between rounded-lg border border-slate-200 p-3 hover:bg-slate-50"
                        >
                            <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5 text-slate-400" />
                                <div className="text-left">
                                    <p className="font-medium text-slate-900">Controlled Substance Log</p>
                                    <p className="text-xs text-slate-500">Last 30 Days • PDF</p>
                                </div>
                            </div>
                            <Download className="h-4 w-4 text-slate-400" />
                        </button>
                        <button
                            onClick={() => alert('Downloading Expiration Report...')}
                            className="flex items-center justify-between rounded-lg border border-slate-200 p-3 hover:bg-slate-50"
                        >
                            <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5 text-slate-400" />
                                <div className="text-left">
                                    <p className="font-medium text-slate-900">Expiration Report</p>
                                    <p className="text-xs text-slate-500">Next 90 Days • CSV</p>
                                </div>
                            </div>
                            <Download className="h-4 w-4 text-slate-400" />
                        </button>
                        <button
                            onClick={() => alert('Downloading Wastage Analysis...')}
                            className="flex items-center justify-between rounded-lg border border-slate-200 p-3 hover:bg-slate-50"
                        >
                            <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5 text-slate-400" />
                                <div className="text-left">
                                    <p className="font-medium text-slate-900">Wastage Analysis</p>
                                    <p className="text-xs text-slate-500">Q1 2024 • PDF</p>
                                </div>
                            </div>
                            <Download className="h-4 w-4 text-slate-400" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-6 py-4">
                    <h3 className="text-lg font-bold text-slate-900">Recent Audit Activity</h3>
                </div>
                <div className="divide-y divide-slate-100">
                    {audits.map((audit) => (
                        <div key={audit.id} className="flex items-center justify-between p-4 px-6">
                            <div className="flex items-center gap-4">
                                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${audit.status === 'Passed' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                                    }`}>
                                    {audit.status === 'Passed' ? <ShieldCheck className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                                </div>
                                <div>
                                    <p className="font-medium text-slate-900">{audit.type}</p>
                                    <p className="text-sm text-slate-500">{audit.date} • {audit.auditor}</p>
                                </div>
                            </div>
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${audit.status === 'Passed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                }`}>
                                {audit.status}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

import { CheckCircle2 } from 'lucide-react';
