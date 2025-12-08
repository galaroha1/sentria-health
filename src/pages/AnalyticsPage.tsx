import { useState, useEffect } from 'react';
import { DollarSign, Activity, Truck, AlertCircle, TrendingUp, TrendingDown, ShieldCheck, Package } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart as RePieChart, Pie, Cell } from 'recharts';

export function Analytics() {
    // Live Data Simulation
    const [data, setData] = useState<any[]>([]);
    const [inventoryValue, setInventoryValue] = useState(2400000);
    const [activerequests, setActiveRequests] = useState(145);

    // Generate initial live data
    useEffect(() => {
        const initialData = Array.from({ length: 24 }, (_, i) => ({
            time: `${i}:00`,
            requests: 120 + Math.random() * 50,
            value: 2000 + Math.random() * 500,
            efficiency: 85 + Math.random() * 10
        }));
        setData(initialData);

        // Simulate live updates
        const interval = setInterval(() => {
            setData(prev => {
                const newData = [...prev.slice(1)];
                const nextTime = parseInt(prev[prev.length - 1].time) + 1;

                newData.push({
                    time: `${nextTime % 24}:00`,
                    requests: 120 + Math.random() * 50,
                    value: 2000 + Math.random() * 500,
                    efficiency: 85 + Math.random() * 10
                });
                return newData;
            });

            // Ticker effect
            setInventoryValue(prev => prev + (Math.random() - 0.5) * 1000);
            setActiveRequests(prev => Math.max(100, prev + Math.floor((Math.random() - 0.5) * 5)));

        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const categoryData = [
        { name: 'Oncology', value: 400, color: '#4f46e5' },
        { name: 'Surgery', value: 300, color: '#0ea5e9' },
        { name: 'Emergency', value: 300, color: '#ef4444' },
        { name: 'General', value: 200, color: '#22c55e' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Executive Dashboard</h1>
                    <p className="text-slate-600">Real-time insights across Supply Chain, Clinical, and Financial operations.</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    Live Data Feed Active
                </div>
            </div>

            {/* Top Level KPIs */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[
                    { label: 'Total Inventory Value', value: `$${(inventoryValue / 1000000).toFixed(2)}M`, change: '+1.2%', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-100' },
                    { label: 'Network Efficiency', value: '98.5%', change: '+2.1%', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-100' },
                    { label: 'Active Requests', value: activerequests, change: '-5/hr', icon: Truck, color: 'text-purple-600', bg: 'bg-purple-100' },
                    { label: 'Pending Approvals', value: '12', change: '+2', icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-100' },
                ].map((stat, i) => (
                    <div key={i} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-slate-300 group">
                        <div className="flex items-center justify-between">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                            <span className={`flex items-center text-sm font-medium ${stat.change.startsWith('+') ? 'text-emerald-600' : 'text-amber-600'}`}>
                                {stat.change.startsWith('+') ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                                {stat.change}
                            </span>
                        </div>
                        <div className="mt-4">
                            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                            <p className="text-2xl font-bold text-slate-900 tabular-nums">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Trends Chart */}
                <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Network Traffic Volume</h3>
                            <p className="text-sm text-slate-500">Live request transfers across all regions</p>
                        </div>
                        <div className="flex gap-2">
                            <select className="text-sm border-slate-200 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                                <option>Last 24 Hours</option>
                                <option>Last 7 Days</option>
                            </select>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <RechartsTooltip
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="requests"
                                    stroke="#6366f1"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorRequests)"
                                    animationDuration={1000}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Spend Analysis */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-slate-900">Spend by Category</h3>
                        <p className="text-sm text-slate-500">Real-time allocation</p>
                    </div>
                    <div className="h-[250px] w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <RePieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                    ))}
                                </Pie>
                                <RechartsTooltip />
                            </RePieChart>
                        </ResponsiveContainer>
                        {/* Center Text */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="text-center">
                                <p className="text-xs text-slate-500">Total Spend</p>
                                <p className="text-xl font-bold text-slate-900">$2.4M</p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-3 mt-4">
                        {categoryData.map(d => (
                            <div key={d.name} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></div>
                                    <span className="text-slate-600">{d.name}</span>
                                </div>
                                <span className="font-medium text-slate-900">${d.value}k</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Efficiency Trends</h3>
                    <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.slice(-12)}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                                <RechartsTooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px' }} />
                                <Bar dataKey="efficiency" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-900">Regulatory Compliance</h3>
                        <span className="flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800">
                            <ShieldCheck className="h-4 w-4" />
                            System Healthy
                        </span>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-start gap-4 rounded-lg bg-slate-50 p-4 border border-slate-100">
                            <Package className="mt-1 h-5 w-5 text-indigo-600" />
                            <div>
                                <p className="font-bold text-slate-900">DSCSA Verification Rate</p>
                                <div className="mt-2 h-2 w-full rounded-full bg-slate-200">
                                    <div className="h-2 w-[98%] rounded-full bg-indigo-600"></div>
                                </div>
                                <p className="mt-1 text-xs text-slate-600 text-right">98% Verified</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 rounded-lg bg-slate-50 p-4 border border-slate-100">
                            <AlertCircle className="mt-1 h-5 w-5 text-amber-600" />
                            <div>
                                <p className="font-bold text-slate-900">Recall Response Time</p>
                                <div className="mt-2 h-2 w-full rounded-full bg-slate-200">
                                    <div className="h-2 w-[85%] rounded-full bg-amber-500"></div>
                                </div>
                                <p className="mt-1 text-xs text-slate-600 text-right">1.2 Hours Avg</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
