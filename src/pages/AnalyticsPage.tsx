import { BarChart3, TrendingUp, Users, DollarSign } from 'lucide-react';

export function Analytics() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
                <p className="text-slate-600">Performance metrics and insights.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[
                    { label: 'Total Revenue', value: '$4.2M', change: '+12%', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-100' },
                    { label: 'Active Users', value: '1,234', change: '+5%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
                    { label: 'Inventory Value', value: '$8.5M', change: '-2%', icon: BarChart3, color: 'text-purple-600', bg: 'bg-purple-100' },
                    { label: 'Growth', value: '18%', change: '+4%', icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-100' },
                ].map((stat, i) => (
                    <div key={i} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.bg} ${stat.color}`}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                            <span className={`text-sm font-medium ${stat.change.startsWith('+') ? 'text-emerald-600' : 'text-red-600'}`}>
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

            <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                    <BarChart3 className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900">Detailed Reports Coming Soon</h3>
                <p className="mt-2 text-slate-500">We are building comprehensive reporting tools for you.</p>
            </div>
        </div>
    );
}
