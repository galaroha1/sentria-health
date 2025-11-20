import { ShieldCheck, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DateRangeSelector } from '../components/reports/DateRangeSelector';
import { ExportMenu } from '../components/reports/ExportMenu';

const savingsData = [
    { month: 'Jan', savings: 4000 },
    { month: 'Feb', savings: 3000 },
    { month: 'Mar', savings: 5500 },
    { month: 'Apr', savings: 4800 },
    { month: 'May', savings: 6200 },
    { month: 'Jun', savings: 7500 },
];

const complianceData = [
    { id: 'TX-99281', date: '2025-06-15', type: 'Purchase', drug: 'Keytruda', status: 'Verified', hash: '0x8f...2a1' },
    { id: 'TX-99282', date: '2025-06-14', type: 'Sale', drug: 'Rituxan', status: 'Verified', hash: '0x3d...9b2' },
    { id: 'TX-99283', date: '2025-06-14', type: 'Transfer', drug: 'Opdivo', status: 'Verified', hash: '0x1c...5f4' },
    { id: 'TX-99284', date: '2025-06-12', type: 'Purchase', drug: 'Avastin', status: 'Verified', hash: '0x7e...8c3' },
    { id: 'TX-99285', date: '2025-06-10', type: 'Disposal', drug: 'Herceptin', status: 'Verified', hash: '0x2a...4d9' },
];

export function Reports() {
    // Date range state can be used for filtering data in the future

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Reports & Analytics</h1>
                    <p className="text-sm text-slate-500">Track cost savings, inventory turnover, and compliance audits.</p>
                </div>
                <ExportMenu data={complianceData} filename="sentria-compliance-report" />
            </div>

            <DateRangeSelector onRangeChange={() => { }} />

            <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-6 flex items-center justify-between">
                        <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                            <TrendingUp className="h-5 w-5 text-emerald-600" />
                            Cost Savings Analysis
                        </h3>
                        <span className="text-2xl font-bold text-emerald-600">$31,000</span>
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={savingsData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(value) => `$${value}`} />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                />
                                <Bar dataKey="savings" fill="#059669" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-6 flex items-center justify-between">
                        <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                            <ShieldCheck className="h-5 w-5 text-primary-600" />
                            DSCSA Compliance Audit
                        </h3>
                        <button className="text-sm font-medium text-primary-600 hover:text-primary-700">View Full Log</button>
                    </div>
                    <div className="overflow-hidden rounded-lg border border-slate-100">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Transaction ID</th>
                                    <th className="px-4 py-3 font-medium">Type</th>
                                    <th className="px-4 py-3 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {complianceData.map((item) => (
                                    <tr key={item.id}>
                                        <td className="px-4 py-3 font-medium text-slate-900">{item.id}</td>
                                        <td className="px-4 py-3 text-slate-600">{item.type}</td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                                                <ShieldCheck className="h-3 w-3" />
                                                {item.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div >
    );
}
