import { TrendingUp, AlertTriangle, Calendar, DollarSign } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const forecastData = [
    { month: 'Oct', actual: 145000, predicted: 145000, optimal: 140000 },
    { month: 'Nov', actual: 152000, predicted: 152000, optimal: 145000 },
    { month: 'Dec', actual: null, predicted: 159000, optimal: 148000 },
    { month: 'Jan', actual: null, predicted: 154000, optimal: 147000 },
    { month: 'Feb', actual: null, predicted: 161000, optimal: 150000 },
];

const upcomingStockouts = [
    {
        drug: 'Remicade (Infliximab)',
        ndc: '57894-030-01',
        currentStock: 8,
        predictedShortfall: '3 days',
        recommendedAction: 'Order 25 units immediately',
        severity: 'critical',
    },
    {
        drug: 'Humira (Adalimumab)',
        ndc: '0074-3799-02',
        currentStock: 2,
        predictedShortfall: '1 day',
        recommendedAction: 'Emergency transfer from Central Warehouse',
        severity: 'critical',
    },
    {
        drug: 'Keytruda (Pembrolizumab)',
        ndc: '0006-3026-02',
        currentStock: 18,
        predictedShortfall: '7 days',
        recommendedAction: 'Plan order for 40 units',
        severity: 'warning',
    },
];

export function PredictiveAnalytics() {
    return (
        <div className="space-y-6">
            {/* Cost Forecast */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Cost Forecast & Optimization</h3>
                        <p className="text-sm text-slate-500">AI-predicted spending vs optimal targets</p>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg bg-primary-50 px-3 py-2">
                        <TrendingUp className="h-4 w-4 text-primary-600" />
                        <span className="text-sm font-medium text-primary-700">8.5% potential savings</span>
                    </div>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={forecastData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis
                            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                        />
                        <Tooltip
                            formatter={(value: number) => `$${value.toLocaleString()}`}
                            labelStyle={{ color: '#0f172a' }}
                        />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="actual"
                            stroke="#0f172a"
                            strokeWidth={2}
                            name="Actual Spending"
                            dot={{ r: 5 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="predicted"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            name="Predicted Spending"
                            dot={{ r: 5 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="optimal"
                            stroke="#10b981"
                            strokeWidth={2}
                            strokeDasharray="3 3"
                            name="Optimal Spending"
                            dot={{ r: 5 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Upcoming Stockouts */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <h3 className="text-lg font-bold text-slate-900">Predicted Stockouts</h3>
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
                        {upcomingStockouts.filter(s => s.severity === 'critical').length} Critical
                    </span>
                </div>

                <div className="space-y-3">
                    {upcomingStockouts.map((item, index) => (
                        <div
                            key={index}
                            className={`rounded-lg border p-4 ${item.severity === 'critical'
                                    ? 'border-red-200 bg-red-50'
                                    : 'border-amber-200 bg-amber-50'
                                }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <p className="font-medium text-slate-900">{item.drug}</p>
                                    <p className="text-xs text-slate-500">NDC: {item.ndc}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-slate-400" />
                                    <span className={`text-sm font-medium ${item.severity === 'critical' ? 'text-red-700' : 'text-amber-700'
                                        }`}>
                                        {item.predictedShortfall}
                                    </span>
                                </div>
                            </div>
                            <div className="mt-2 flex items-center justify-between text-sm">
                                <span className="text-slate-600">Current: {item.currentStock} units</span>
                                <span className={`font-medium ${item.severity === 'critical' ? 'text-red-700' : 'text-amber-700'
                                    }`}>
                                    {item.recommendedAction}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Optimal Order Timing */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-bold text-slate-900">Optimal Order Timing</h3>
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-emerald-600" />
                            <span className="font-medium text-slate-900">Best Time to Order</span>
                        </div>
                        <p className="mt-2 text-2xl font-bold text-slate-900">Tuesday, 2-4 PM</p>
                        <p className="mt-1 text-sm text-slate-600">Average 12% lower prices during this window</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-blue-600" />
                            <span className="font-medium text-slate-900">Next Recommended Order</span>
                        </div>
                        <p className="mt-2 text-2xl font-bold text-slate-900">Dec 3, 2025</p>
                        <p className="mt-1 text-sm text-slate-600">Based on consumption patterns and lead times</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
