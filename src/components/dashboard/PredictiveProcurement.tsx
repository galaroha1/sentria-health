import { useMemo } from 'react';
import { TrendingUp, AlertCircle, Package } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useApp } from '../../context/AppContext';
import type { Treatment } from '../../types/patient';

export function PredictiveProcurement() {
    const { patients, inventories } = useApp();

    // Configuration: Drugs to Track
    const TRACKED_DRUGS = [
        { name: 'Keytruda (Pembrolizumab)', ndc: '0006-3026-02', color: '#0ea5e9' },
        { name: 'Opdivo (Nivolumab)', ndc: '0003-3772-11', color: '#8b5cf6' }
    ];

    // 1. Calculate Current Global Inventory for Tracked Drugs
    const currentStock = useMemo(() => {
        const stockMap: Record<string, number> = {};

        TRACKED_DRUGS.forEach(drug => {
            stockMap[drug.ndc] = inventories.reduce((sum, inv) => {
                const item = inv.drugs.find(d => d.ndc === drug.ndc);
                return sum + (item ? item.quantity : 0);
            }, 0);
        });

        return stockMap;
    }, [inventories]);

    // 2. Generate Time-Series Forecast (Next 6 Weeks)
    const chartData = useMemo(() => {
        const weeks = Array.from({ length: 6 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() + (i * 7));
            return {
                name: `Week ${i + 1}`,
                start: date,
                end: new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000),
                demand: 0,
                // We'll track Keytruda specifically for the chart for now
                inventory: 0
            };
        });

        // Current running inventory (starts at global stock)
        let runningInventory = currentStock[TRACKED_DRUGS[0].ndc] || 0;

        // Iterate Weeks to fill Demand/Inventory
        return weeks.map(week => {
            let weeklyDemand = 0;

            // Sum demand from ALL patients for Keytruda in this week
            patients.forEach(p => {
                p.treatmentSchedule.forEach((tx: Treatment) => {
                    if (tx.ndc === TRACKED_DRUGS[0].ndc && tx.status === 'scheduled') {
                        const txDate = new Date(tx.date);
                        if (txDate >= week.start && txDate < week.end) {
                            weeklyDemand += (parseInt(tx.dose) || 1);
                        }
                    }
                });
            });

            // Deplete Inventory
            runningInventory = Math.max(0, runningInventory - weeklyDemand);

            return {
                name: week.name,
                demand: weeklyDemand,
                inventory: runningInventory,
                fullDate: week.start.toLocaleDateString()
            };
        });
    }, [patients, currentStock]);

    // 3. Derived Metrics
    // const totalProjectedDemand = chartData.reduce((sum, w) => sum + w.demand, 0); // Removed unused var
    const weeksUntilStockout = chartData.findIndex(w => w.inventory === 0);
    const stockoutRiskWarning = weeksUntilStockout !== -1
        ? `Stockout projected in Week ${weeksUntilStockout + 1}`
        : null;

    return (
        <div className="col-span-full lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                        <TrendingUp className="h-5 w-5 text-primary-600" />
                        Predictive Procurement
                    </h3>
                    <p className="text-sm text-slate-500">
                        {patients.length > 0
                            ? `Live Forecast based on ${patients.length} active patients`
                            : 'No active patient simulation data'}
                    </p>
                </div>
                {stockoutRiskWarning ? (
                    <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-1 text-sm font-medium text-red-700 border border-red-100">
                        <AlertCircle className="h-4 w-4" />
                        {stockoutRiskWarning}
                    </div>
                ) : (
                    <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-1 text-sm font-medium text-green-700 border border-green-100">
                        <Package className="h-4 w-4" />
                        Supply Chain Balanced
                    </div>
                )}
            </div>

            <div className="mb-6 grid gap-4 sm:grid-cols-2">
                {TRACKED_DRUGS.map(drug => {
                    // Calculate specific demand for this drug for the card
                    const drugDemand = patients.reduce((total, p) => {
                        return total + p.treatmentSchedule
                            .filter((tx: Treatment) => tx.ndc === drug.ndc && tx.status === 'scheduled')
                            .reduce((sum: number, tx: Treatment) => sum + (parseInt(tx.dose) || 1), 0);
                    }, 0);

                    const currentLevel = currentStock[drug.ndc] || 0;
                    const isCritical = currentLevel < drugDemand;

                    return (
                        <div key={drug.ndc} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">{drug.name}</p>
                                    <div className="flex items-baseline gap-2 mt-1">
                                        <p className="text-2xl font-bold text-slate-900">{currentLevel} Units</p>
                                        <span className="text-xs text-slate-500">vs {drugDemand} Needed</span>
                                    </div>
                                </div>
                                {isCritical ? (
                                    <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700">Shortage</span>
                                ) : (
                                    <span className="rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">Healthy</span>
                                )}
                            </div>
                            <p className="mt-3 text-xs text-slate-500">
                                {isCritical
                                    ? `Deficit of ${drugDemand - currentLevel} units based on 90-day schedule`
                                    : 'Sufficient inventory for scheduled treatments'}
                            </p>
                        </div>
                    );
                })}
            </div>

            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                            labelStyle={{ color: '#64748b', fontSize: '12px', marginBottom: '4px' }}
                        />
                        <Area type="monotone" dataKey="demand" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#colorDemand)" name="Weekly Demand" />
                        <Area type="monotone" dataKey="inventory" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" fill="none" name="Proj. Inventory" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
