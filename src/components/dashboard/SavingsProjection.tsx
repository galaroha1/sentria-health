import { DollarSign, TrendingUp, Package, ArrowUpRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useApp } from '../../context/AppContext';

// Base mock data for visual stability in demo
const BASE_SAVINGS = 24800; // Original hardcoded value for transfers

export function SavingsProjection() {
    const { metrics } = useApp();

    // Combine Mock + Realized for the "Transfer" category
    // This allows the demo to look populated but react to user actions
    const totalTransferSavings = BASE_SAVINGS + metrics.realizedSavings;

    const savingsBreakdown = [
        {
            category: 'Inter-Service Transfers',
            amount: totalTransferSavings,
            change: '+16.5%',
            description: 'Avoided purchases by redistributing existing stock',
            icon: Package,
            color: 'emerald',
        },
        {
            category: 'Vendor Optimization',
            amount: 14500,
            change: '+13.3%',
            description: 'Better prices from preferred vendors',
            icon: TrendingUp,
            color: 'blue',
        },
        {
            category: 'Bulk Discounts',
            amount: 9600,
            change: '+7.9%',
            description: 'Volume-based pricing advantages',
            icon: DollarSign,
            color: 'purple',
        },
    ];

    const totalSavings = savingsBreakdown.reduce((sum, item) => sum + item.amount, 0);
    const annualizedSavings = totalSavings * 12;

    const savingsData = [
        { month: 'Jul', transferSavings: 12500, vendorOptimization: 8300, bulkDiscounts: 5200 },
        { month: 'Aug', transferSavings: 15200, vendorOptimization: 9100, bulkDiscounts: 6800 },
        { month: 'Sep', transferSavings: 18700, vendorOptimization: 11200, bulkDiscounts: 7500 },
        { month: 'Oct', transferSavings: 21300, vendorOptimization: 12800, bulkDiscounts: 8900 },
        { month: 'Nov', transferSavings: totalTransferSavings, vendorOptimization: 14500, bulkDiscounts: 9600 },
    ];

    return (
        <div className="space-y-6">
            {/* Total Savings Overview */}
            <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-sm">
                    <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600">
                            <DollarSign className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-600">Monthly Savings</p>
                            <p className="text-2xl font-bold text-slate-900">${totalSavings.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-1 text-sm text-emerald-600">
                        <ArrowUpRight className="h-4 w-4" />
                        <span className="font-medium">12.4% vs last month</span>
                    </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm">
                    <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600">
                            <TrendingUp className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-600">Projected Annual Savings</p>
                            <p className="text-2xl font-bold text-slate-900">${annualizedSavings.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="mt-4 text-sm text-slate-600">
                        <span className="font-medium">ROI:</span> 287% on platform investment
                    </div>
                </div>
            </div>

            {/* Savings Trend Chart */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-bold text-slate-900">Savings Trend by Category</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={savingsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                        <Tooltip
                            formatter={(value: number) => `$${value.toLocaleString()}`}
                            labelStyle={{ color: '#0f172a' }}
                        />
                        <Legend />
                        <Bar dataKey="transferSavings" fill="#10b981" name="Transfer Savings" />
                        <Bar dataKey="vendorOptimization" fill="#3b82f6" name="Vendor Optimization" />
                        <Bar dataKey="bulkDiscounts" fill="#8b5cf6" name="Bulk Discounts" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Savings Breakdown */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-bold text-slate-900">Savings Breakdown</h3>
                <div className="space-y-4">
                    {savingsBreakdown.map((item, index) => {
                        const Icon = item.icon;
                        const colorClassesMap: Record<string, { bg: string; text: string; badge: string }> = {
                            emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600', badge: 'bg-emerald-50 text-emerald-700' },
                            blue: { bg: 'bg-blue-100', text: 'text-blue-600', badge: 'bg-blue-50 text-blue-700' },
                            purple: { bg: 'bg-purple-100', text: 'text-purple-600', badge: 'bg-purple-50 text-purple-700' },
                        };
                        const colorClasses = colorClassesMap[item.color];

                        return (
                            <div key={index} className="flex items-center gap-4">
                                <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${colorClasses.bg}`}>
                                    <Icon className={`h-6 w-6 ${colorClasses.text}`} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium text-slate-900">{item.category}</p>
                                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${colorClasses.badge}`}>
                                            {item.change}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600">{item.description}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-bold text-slate-900">${item.amount.toLocaleString()}</p>
                                    <p className="text-xs text-slate-500">this month</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
