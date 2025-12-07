
import { ArrowRight, ShieldCheck, DollarSign, Stethoscope, BarChart3, FileText, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export function CPODashboard() {
    return (
        <div className="space-y-8 pb-12">
            <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 p-8 text-white shadow-xl">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="mb-2 inline-flex items-center rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-medium text-indigo-200 ring-1 ring-inset ring-indigo-500/40">
                            Executive Briefing
                        </div>
                        <h1 className="text-3xl font-bold">Supply Chain Modernization Overview</h1>
                        <p className="mt-2 max-w-2xl text-slate-300">
                            This dashboard provides a high-level summary of the new logic and capabilities integrated into the Sentria Health platform.
                            Review the core algorithms driving compliance, financial optimization, and clinical efficiency.
                        </p>
                    </div>
                    <div className="hidden lg:block">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
                            <FileText className="h-8 w-8 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                {/* 1. Regulatory Intelligence */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                            <ShieldCheck className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Regulatory Intelligence</h2>
                            <p className="text-sm text-slate-500">Automated FDA Compliance</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="rounded-lg bg-slate-50 p-4">
                            <h3 className="mb-2 font-semibold text-slate-900">The Logic</h3>
                            <ul className="space-y-2 text-sm text-slate-600">
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500 shrink-0" />
                                    <span>**Real-time Verification:** Every scanned UDI is instantly checked against the openFDA GUDID database.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500 shrink-0" />
                                    <span>**Recall Monitoring:** Daily background jobs cross-reference inventory with FDA Enforcement Reports.</span>
                                </li>
                            </ul>
                        </div>

                        <div className="flex items-center justify-between rounded-lg border border-slate-100 p-4">
                            <div>
                                <p className="font-medium text-slate-900">See it in action</p>
                                <p className="text-xs text-slate-500">Inventory Hub &gt; Compliance Tab</p>
                            </div>
                            <Link to="/inventory" className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
                                Launch Demo <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* 2. Financial Optimization */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                            <DollarSign className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Financial Optimization</h2>
                            <p className="text-sm text-slate-500">340B & Price Benchmarking</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="rounded-lg bg-slate-50 p-4">
                            <h3 className="mb-2 font-semibold text-slate-900">The Logic</h3>
                            <ul className="space-y-2 text-sm text-slate-600">
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-indigo-500 shrink-0" />
                                    <span>**NADAC Benchmarking:** Vendor prices are compared against the National Average Drug Acquisition Cost.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-indigo-500 shrink-0" />
                                    <span>**Split-Billing Engine:** Automatically qualifies transactions for 340B pricing based on Patient, Provider, and Location eligibility rules.</span>
                                </li>
                            </ul>
                        </div>

                        <div className="flex items-center justify-between rounded-lg border border-slate-100 p-4">
                            <div>
                                <p className="font-medium text-slate-900">See it in action</p>
                                <p className="text-xs text-slate-500">Marketplace &gt; Product Cards</p>
                            </div>
                            <Link to="/inventory" className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                                Launch Demo <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* 3. Clinical Operations */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                            <Stethoscope className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Clinical Operations</h2>
                            <p className="text-sm text-slate-500">Waste Reduction & Standardization</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="rounded-lg bg-slate-50 p-4">
                            <h3 className="mb-2 font-semibold text-slate-900">The Logic</h3>
                            <ul className="space-y-2 text-sm text-slate-600">
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-purple-500 shrink-0" />
                                    <span>**Preference Card AI:** Analyzes historical usage vs. open items to identify consistent waste.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-purple-500 shrink-0" />
                                    <span>**Recommendation Engine:** Suggests "Change to Hold" or "Reduce Quantity" actions with projected savings.</span>
                                </li>
                            </ul>
                        </div>

                        <div className="flex items-center justify-between rounded-lg border border-slate-100 p-4">
                            <div>
                                <p className="font-medium text-slate-900">See it in action</p>
                                <p className="text-xs text-slate-500">Clinical Hub &gt; Preference Cards</p>
                            </div>
                            <Link to="/clinical" className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700">
                                Launch Demo <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* 4. Executive Analytics */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                            <BarChart3 className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Executive Analytics</h2>
                            <p className="text-sm text-slate-500">Impact Visualization</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="rounded-lg bg-slate-50 p-4">
                            <h3 className="mb-2 font-semibold text-slate-900">The Logic</h3>
                            <ul className="space-y-2 text-sm text-slate-600">
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-amber-500 shrink-0" />
                                    <span>**Unified Data Model:** Aggregates data from FDA checks, NADAC pricing, and Clinical usage into a single view.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-amber-500 shrink-0" />
                                    <span>**KPI Tracking:** Real-time calculation of Total Savings, Compliance Score, and 340B Capture Rate.</span>
                                </li>
                            </ul>
                        </div>

                        <div className="flex items-center justify-between rounded-lg border border-slate-100 p-4">
                            <div>
                                <p className="font-medium text-slate-900">See it in action</p>
                                <p className="text-xs text-slate-500">Analytics &gt; Executive Dashboard</p>
                            </div>
                            <Link to="/analytics" className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700">
                                Launch Demo <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
