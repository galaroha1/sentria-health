
import { TrendingUp, AlertCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
    { name: 'Week 1', demand: 12, inventory: 20 },
    { name: 'Week 2', demand: 15, inventory: 18 },
    { name: 'Week 3', demand: 18, inventory: 15 },
    { name: 'Week 4', demand: 22, inventory: 10 },
    { name: 'Week 5', demand: 25, inventory: 5 },
    { name: 'Week 6', demand: 28, inventory: 0 },
];

export function PredictiveProcurement() {
    return (
        <div className="col-span-full lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                        <TrendingUp className="h-5 w-5 text-primary-600" />
                        Predictive Procurement
                    </h3>
                    <p className="text-sm text-slate-500">Forecast based on scheduled oncology patients</p>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700 border border-amber-100">
                    <AlertCircle className="h-4 w-4" />
                    Stockout risk in 4 weeks
                </div>
            </div>

            <div className="mb-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Keytruda (Pembrolizumab)</p>
                            <p className="mt-1 text-2xl font-bold text-slate-900">15 Units</p>
                        </div>
                        <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700">High Priority</span>
                    </div>
                    <p className="mt-3 text-xs text-slate-500">Recommended order for next 6 weeks</p>
                </div>

                <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Opdivo (Nivolumab)</p>
                            <p className="mt-1 text-2xl font-bold text-slate-900">10 Units</p>
                        </div>
                        <span className="rounded-full bg-primary-100 px-2 py-1 text-xs font-medium text-primary-700">Normal</span>
                    </div>
                    <p className="mt-3 text-xs text-slate-500">Recommended order for next 6 weeks</p>
                </div>
            </div>

            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            itemStyle={{ color: '#1e293b', fontSize: '12px' }}
                        />
                        <Area type="monotone" dataKey="demand" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#colorDemand)" name="Projected Demand" />
                        <Area type="monotone" dataKey="inventory" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" fill="none" name="Current Inventory" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
