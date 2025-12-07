import { Users, DollarSign, ShieldCheck, AlertTriangle, Activity, PieChart } from 'lucide-react';

export function Analytics() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Executive Dashboard</h1>
                <p className="text-slate-600">Real-time insights across Supply Chain, Clinical, and Financial operations.</p>
            </div>

            {/* Top Level KPIs */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[
                    { label: 'Total Savings (YTD)', value: '$2.4M', change: '+18%', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-100' },
                    { label: 'Compliance Score', value: '98.5%', change: '+2.1%', icon: ShieldCheck, color: 'text-blue-600', bg: 'bg-blue-100' },
                    { label: 'Clinical Waste Reduced', value: '$142k', change: '-12%', icon: Activity, color: 'text-purple-600', bg: 'bg-purple-100' },
                    { label: '340B Capture Rate', value: '84%', change: '+5%', icon: PieChart, color: 'text-amber-600', bg: 'bg-amber-100' },
                ].map((stat, i) => (
                    <div key={i} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.bg} ${stat.color}`}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                            <span className={`text-sm font-medium ${stat.change.startsWith('+') ? 'text-emerald-600' : 'text-emerald-600'}`}>
                                {stat.change}
                            </span>
                        </div>
                        <div className="mt-4">
                            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Financial Intelligence Section */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Financial Performance</h3>
                            <p className="text-sm text-slate-500">340B & NADAC Benchmarking</p>
                        </div>
                        <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">View Report</button>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="font-medium text-slate-700">340B Savings Target</span>
                                <span className="text-slate-500">$1.2M / $1.5M</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-slate-100">
                                <div className="h-2 w-[80%] rounded-full bg-indigo-600"></div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="rounded-lg bg-slate-50 p-4">
                                <p className="text-xs font-medium text-slate-500">NADAC Price Efficiency</p>
                                <p className="mt-1 text-xl font-bold text-slate-900">12.4%</p>
                                <p className="text-xs text-emerald-600">Below National Avg</p>
                            </div>
                            <div className="rounded-lg bg-slate-50 p-4">
                                <p className="text-xs font-medium text-slate-500">WAC Spending</p>
                                <p className="mt-1 text-xl font-bold text-slate-900">$450k</p>
                                <p className="text-xs text-amber-600">Optimization Opportunity</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Clinical Operations Section */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Clinical Operations</h3>
                            <p className="text-sm text-slate-500">Preference Card Optimization</p>
                        </div>
                        <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">View Details</button>
                    </div>

                    <div className="space-y-4">
                        {[
                            { label: 'Total Knee Arthroplasty', waste: '-$450/case', status: 'Optimized' },
                            { label: 'Laparoscopic Cholecystectomy', waste: '-$120/case', status: 'Pending' },
                            { label: 'Spinal Fusion (L4-L5)', waste: '-$850/case', status: 'Critical' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
                                <div>
                                    <p className="font-medium text-slate-900">{item.label}</p>
                                    <p className="text-xs text-slate-500">Projected Savings: <span className="font-medium text-emerald-600">{item.waste}</span></p>
                                </div>
                                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${item.status === 'Optimized' ? 'bg-emerald-100 text-emerald-800' :
                                    item.status === 'Critical' ? 'bg-red-100 text-red-800' :
                                        'bg-amber-100 text-amber-800'
                                    }`}>
                                    {item.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Regulatory Compliance Section */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Regulatory Compliance</h3>
                        <p className="text-sm text-slate-500">FDA Alerts & Recall Management</p>
                    </div>
                    <span className="flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800">
                        <ShieldCheck className="h-4 w-4" />
                        System Healthy
                    </span>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <div className="flex items-start gap-4 rounded-lg bg-red-50 p-4">
                        <AlertTriangle className="mt-1 h-5 w-5 text-red-600" />
                        <div>
                            <p className="font-bold text-red-900">2 Active Recalls</p>
                            <p className="mt-1 text-sm text-red-700">Action required for 2 inventory items matching FDA enforcement reports.</p>
                            <button className="mt-3 text-sm font-medium text-red-800 underline hover:text-red-900">View Recalls</button>
                        </div>
                    </div>

                    <div className="flex items-start gap-4 rounded-lg bg-blue-50 p-4">
                        <Activity className="mt-1 h-5 w-5 text-blue-600" />
                        <div>
                            <p className="font-bold text-blue-900">DSCSA Verification</p>
                            <p className="mt-1 text-sm text-blue-700">100% of inbound shipments verified with openFDA in the last 30 days.</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4 rounded-lg bg-slate-50 p-4">
                        <Users className="mt-1 h-5 w-5 text-slate-600" />
                        <div>
                            <p className="font-bold text-slate-900">Audit Readiness</p>
                            <p className="mt-1 text-sm text-slate-600">All transaction logs and 340B split-billing records are archived and ready.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
