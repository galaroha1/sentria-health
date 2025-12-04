import { ModelTraining } from '../admin/ModelTraining';
import { Link as LinkIcon, Zap, Activity } from 'lucide-react';

export function AdvancedTab() {
    return (
        <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
                {/* AI Simulation Control - Replaced with new ModelTraining component */}
                <div className="lg:col-span-2">
                    <ModelTraining />
                </div>

                {/* Blockchain Ledger */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="rounded-lg bg-indigo-100 p-2 text-indigo-600">
                            <LinkIcon className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Blockchain Ledger</h3>
                            <p className="text-sm text-slate-500">Immutable chain-of-custody tracking</p>
                        </div>
                    </div>

                    <div className="relative border-l-2 border-slate-200 pl-6 space-y-6">
                        <div className="relative">
                            <div className="absolute -left-[31px] top-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-500 shadow-sm" />
                            <p className="font-mono text-xs text-slate-400">TX: 0x8f2...9a1 • 10 mins ago</p>
                            <p className="font-medium text-slate-900">Administered: Remicade (Lot: K99)</p>
                            <p className="text-sm text-slate-500">Verified by Dr. Smith (ID: P-102)</p>
                        </div>
                        <div className="relative">
                            <div className="absolute -left-[31px] top-1 h-4 w-4 rounded-full border-2 border-white bg-blue-500 shadow-sm" />
                            <p className="font-mono text-xs text-slate-400">TX: 0x3d1...b4c • 2 hours ago</p>
                            <p className="font-medium text-slate-900">Transfer: Warehouse &rarr; Clinic A</p>
                            <p className="text-sm text-slate-500">Auto-verified by IoT Sensor #442</p>
                        </div>
                        <div className="relative">
                            <div className="absolute -left-[31px] top-1 h-4 w-4 rounded-full border-2 border-white bg-slate-400 shadow-sm" />
                            <p className="font-mono text-xs text-slate-400">TX: 0x1a9...f22 • 5 hours ago</p>
                            <p className="font-medium text-slate-900">Received: Shipment #PO-992</p>
                            <p className="text-sm text-slate-500">Signed by Receiving Dept.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="rounded-full bg-white/10 p-3">
                            <Zap className="h-6 w-6 text-yellow-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">System Optimization Score</h3>
                            <p className="text-slate-300">Based on efficiency, waste reduction, and compliance</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-3xl font-bold">94/100</p>
                        <p className="text-sm text-emerald-400 flex items-center justify-end gap-1">
                            <Activity className="h-3 w-3" /> +2.4% this week
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
