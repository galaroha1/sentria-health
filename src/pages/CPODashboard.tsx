
import { ArrowRight, ShieldCheck, DollarSign, Stethoscope, BarChart3, FileText, CheckCircle2, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

export function CPODashboard() {
    return (
        <div className="space-y-8 pb-12 bg-slate-50/50 min-h-screen p-8">
            <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-10 text-white shadow-xl shadow-blue-200">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="mb-4 inline-flex items-center rounded-full bg-white/20 px-4 py-1.5 text-xs font-semibold text-white ring-1 ring-inset ring-white/30 backdrop-blur-sm">
                            Executive Briefing
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight">Supply Chain Modernization</h1>
                        <p className="mt-4 max-w-2xl text-lg text-blue-100 leading-relaxed">
                            This dashboard provides a high-level summary of the new logic and capabilities integrated into the Sentria Health platform.
                            Review the core algorithms driving compliance, financial optimization, and clinical efficiency.
                        </p>
                    </div>
                    <div className="hidden lg:block">
                        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 backdrop-blur-md ring-1 ring-white/20">
                            <FileText className="h-10 w-10 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                {/* 1. Regulatory Intelligence */}
                <div className="group rounded-2xl border border-slate-100 bg-white p-8 shadow-sm transition-all hover:shadow-lg hover:border-blue-200">
                    <div className="mb-6 flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100 group-hover:bg-emerald-100 transition-colors">
                            <ShieldCheck className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Regulatory Intelligence</h2>
                            <p className="text-sm font-medium text-slate-500">Automated FDA Compliance</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-xl bg-slate-50/80 p-5 border border-slate-100">
                            <h3 className="mb-3 font-semibold text-slate-900 flex items-center gap-2">
                                <Activity className="h-4 w-4 text-blue-500" /> The Logic
                            </h3>
                            <ul className="space-y-3 text-sm text-slate-600">
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500 shrink-0" />
                                    <span><strong className="text-slate-900">Real-time Verification:</strong> Every scanned UDI is instantly checked against the openFDA GUDID database.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500 shrink-0" />
                                    <span><strong className="text-slate-900">Recall Monitoring:</strong> Daily background jobs cross-reference inventory with FDA Enforcement Reports.</span>
                                </li>
                            </ul>
                        </div>

                        <div className="flex items-center justify-between rounded-xl border border-slate-100 p-1 pl-5 pr-1 bg-white group-hover:border-blue-100 transition-colors">
                            <div>
                                <p className="font-semibold text-slate-900">See it in action</p>
                                <p className="text-xs font-medium text-slate-400">Inventory Hub &gt; Compliance Tab</p>
                            </div>
                            <Link to="/inventory" className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-emerald-700 hover:shadow-md hover:shadow-emerald-200">
                                Launch Demo <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* 2. Financial Optimization */}
                <div className="group rounded-2xl border border-slate-100 bg-white p-8 shadow-sm transition-all hover:shadow-lg hover:border-blue-200">
                    <div className="mb-6 flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-100 group-hover:bg-blue-100 transition-colors">
                            <DollarSign className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Financial Optimization</h2>
                            <p className="text-sm font-medium text-slate-500">340B & Price Benchmarking</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-xl bg-slate-50/80 p-5 border border-slate-100">
                            <h3 className="mb-3 font-semibold text-slate-900 flex items-center gap-2">
                                <Activity className="h-4 w-4 text-blue-500" /> The Logic
                            </h3>
                            <ul className="space-y-3 text-sm text-slate-600">
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-blue-500 shrink-0" />
                                    <span><strong className="text-slate-900">NADAC Benchmarking:</strong> Vendor prices are compared against the National Average Drug Acquisition Cost.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-blue-500 shrink-0" />
                                    <span><strong className="text-slate-900">Split-Billing Engine:</strong> Automatically qualifies transactions for 340B pricing based on Patient, Provider, and Location eligibility rules.</span>
                                </li>
                            </ul>
                        </div>

                        <div className="flex items-center justify-between rounded-xl border border-slate-100 p-1 pl-5 pr-1 bg-white group-hover:border-blue-100 transition-colors">
                            <div>
                                <p className="font-semibold text-slate-900">See it in action</p>
                                <p className="text-xs font-medium text-slate-400">Marketplace &gt; Product Cards</p>
                            </div>
                            <Link to="/inventory" className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-700 hover:shadow-md hover:shadow-blue-200">
                                Launch Demo <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* 3. Clinical Operations */}
                <div className="group rounded-2xl border border-slate-100 bg-white p-8 shadow-sm transition-all hover:shadow-lg hover:border-blue-200">
                    <div className="mb-6 flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 ring-1 ring-purple-100 group-hover:bg-purple-100 transition-colors">
                            <Stethoscope className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Clinical Operations</h2>
                            <p className="text-sm font-medium text-slate-500">Waste Reduction & Standardization</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-xl bg-slate-50/80 p-5 border border-slate-100">
                            <h3 className="mb-3 font-semibold text-slate-900 flex items-center gap-2">
                                <Activity className="h-4 w-4 text-blue-500" /> The Logic
                            </h3>
                            <ul className="space-y-3 text-sm text-slate-600">
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-purple-500 shrink-0" />
                                    <span><strong className="text-slate-900">Preference Card AI:</strong> Analyzes historical usage vs. open items to identify consistent waste.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-purple-500 shrink-0" />
                                    <span><strong className="text-slate-900">Recommendation Engine:</strong> Suggests "Change to Hold" or "Reduce Quantity" actions with projected savings.</span>
                                </li>
                            </ul>
                        </div>

                        <div className="flex items-center justify-between rounded-xl border border-slate-100 p-1 pl-5 pr-1 bg-white group-hover:border-blue-100 transition-colors">
                            <div>
                                <p className="font-semibold text-slate-900">See it in action</p>
                                <p className="text-xs font-medium text-slate-400">Clinical Hub &gt; Preference Cards</p>
                            </div>
                            <Link to="/clinical" className="flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-purple-700 hover:shadow-md hover:shadow-purple-200">
                                Launch Demo <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* 4. Executive Analytics */}
                <div className="group rounded-2xl border border-slate-100 bg-white p-8 shadow-sm transition-all hover:shadow-lg hover:border-blue-200">
                    <div className="mb-6 flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 ring-1 ring-amber-100 group-hover:bg-amber-100 transition-colors">
                            <BarChart3 className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Executive Analytics</h2>
                            <p className="text-sm font-medium text-slate-500">Impact Visualization</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-xl bg-slate-50/80 p-5 border border-slate-100">
                            <h3 className="mb-3 font-semibold text-slate-900 flex items-center gap-2">
                                <Activity className="h-4 w-4 text-blue-500" /> The Logic
                            </h3>
                            <ul className="space-y-3 text-sm text-slate-600">
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-amber-500 shrink-0" />
                                    <span><strong className="text-slate-900">Unified Data Model:</strong> Aggregates data from FDA checks, NADAC pricing, and Clinical usage into a single view.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-amber-500 shrink-0" />
                                    <span><strong className="text-slate-900">KPI Tracking:</strong> Real-time calculation of Total Savings, Compliance Score, and 340B Capture Rate.</span>
                                </li>
                            </ul>
                        </div>

                        <div className="flex items-center justify-between rounded-xl border border-slate-100 p-1 pl-5 pr-1 bg-white group-hover:border-blue-100 transition-colors">
                            <div>
                                <p className="font-semibold text-slate-900">See it in action</p>
                                <p className="text-xs font-medium text-slate-400">Analytics &gt; Executive Dashboard</p>
                            </div>
                            <Link to="/analytics" className="flex items-center gap-2 rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-amber-700 hover:shadow-md hover:shadow-amber-200">
                                Launch Demo <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
