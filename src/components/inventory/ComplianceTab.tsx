import { useState } from 'react';
import { FileText, ShieldCheck, Download, AlertTriangle, CheckCircle2, Search, Loader2 } from 'lucide-react';
import { fdaService } from '../../services/fdaService';
import type { FdaRecallResult } from '../../services/fdaService';

export function ComplianceTab() {
    const [verificationTerm, setVerificationTerm] = useState('');
    const [verificationType, setVerificationType] = useState<'device' | 'drug'>('device');
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationResult, setVerificationResult] = useState<any>(null);
    const [recalls, setRecalls] = useState<FdaRecallResult[]>([]);

    const handleVerify = async () => {
        if (!verificationTerm) return;
        setIsVerifying(true);
        setVerificationResult(null);
        setRecalls([]);

        try {
            // 1. Verify Existence
            let result;
            if (verificationType === 'device') {
                result = await fdaService.verifyDeviceByUDI(verificationTerm);
            } else {
                result = await fdaService.searchDrugLabel(verificationTerm);
            }
            setVerificationResult(result || { error: 'Not found in FDA database' });

            // 2. Check Recalls
            if (result) {
                const recallData = await fdaService.checkRecalls(verificationTerm, verificationType);
                setRecalls(recallData);
            }
        } catch (error) {
            console.error(error);
            setVerificationResult({ error: 'Verification failed' });
        } finally {
            setIsVerifying(false);
        }
    };

    const audits = [
        { id: 1, type: 'DEA Check', status: 'Passed', date: '2024-03-15', auditor: 'System' },
        { id: 2, type: 'Temp Log Review', status: 'Warning', date: '2024-03-14', auditor: 'Dr. Rodriguez' },
        { id: 3, type: 'Inventory Count', status: 'Passed', date: '2024-03-10', auditor: 'Sarah Chen' },
    ];

    return (
        <div className="space-y-6">
            {/* FDA Verification Section */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">FDA Product Verification</h3>
                        <p className="text-sm text-slate-500">Verify UDIs and Drug Labels against openFDA database.</p>
                    </div>
                    <div className="flex rounded-lg bg-slate-100 p-1">
                        <button
                            onClick={() => setVerificationType('device')}
                            className={`rounded-md px-3 py-1 text-sm font-medium transition-all ${verificationType === 'device' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                        >
                            Device (UDI)
                        </button>
                        <button
                            onClick={() => setVerificationType('drug')}
                            className={`rounded-md px-3 py-1 text-sm font-medium transition-all ${verificationType === 'drug' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                        >
                            Drug (Name)
                        </button>
                    </div>
                </div>

                <div className="flex gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder={verificationType === 'device' ? "Enter UDI (Device Identifier)..." : "Enter Drug Brand Name..."}
                            value={verificationTerm}
                            onChange={(e) => setVerificationTerm(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                        />
                    </div>
                    <button
                        onClick={handleVerify}
                        disabled={isVerifying || !verificationTerm}
                        className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {isVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                        Verify
                    </button>
                </div>

                {/* Verification Results */}
                {verificationResult && (
                    <div className={`mt-4 rounded-lg border p-4 ${verificationResult.error ? 'border-red-200 bg-red-50' : 'border-emerald-200 bg-emerald-50'}`}>
                        {verificationResult.error ? (
                            <div className="flex items-center gap-3 text-red-800">
                                <AlertTriangle className="h-5 w-5" />
                                <span className="font-medium">{verificationResult.error}</span>
                            </div>
                        ) : (
                            <div>
                                <div className="flex items-center gap-3 text-emerald-800 mb-2">
                                    <CheckCircle2 className="h-5 w-5" />
                                    <span className="font-medium">Verified in FDA Database</span>
                                </div>
                                <div className="text-sm text-slate-600">
                                    {verificationType === 'device' ? (
                                        <>
                                            <p><span className="font-medium">Device:</span> {verificationResult.gudid?.brand_name}</p>
                                            <p><span className="font-medium">Company:</span> {verificationResult.gudid?.company_name}</p>
                                            <p><span className="font-medium">Model:</span> {verificationResult.gudid?.version_model_number}</p>
                                        </>
                                    ) : (
                                        <>
                                            <p><span className="font-medium">Drug:</span> {verificationResult.openfda?.brand_name?.[0]}</p>
                                            <p><span className="font-medium">Manufacturer:</span> {verificationResult.openfda?.manufacturer_name?.[0]}</p>
                                            <p><span className="font-medium">NDC:</span> {verificationResult.openfda?.product_ndc?.[0]}</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Recall Alerts */}
                {recalls.length > 0 && (
                    <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
                        <div className="mb-2 flex items-center gap-2 text-amber-800">
                            <AlertTriangle className="h-5 w-5" />
                            <span className="font-bold">Active Recalls Found</span>
                        </div>
                        <ul className="space-y-2">
                            {recalls.map((recall, i) => (
                                <li key={i} className="text-sm text-amber-900">
                                    <span className="font-medium">{recall.recall_number}:</span> {recall.reason_for_recall}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

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
