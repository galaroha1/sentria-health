import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, DollarSign, Package, Truck } from 'lucide-react';
import { InventoryAlerts } from '../components/dashboard/InventoryAlerts';
import { PredictiveAnalytics } from '../components/dashboard/PredictiveAnalytics';
import { SavingsProjection } from '../components/dashboard/SavingsProjection';
import { MorningBriefing } from '../components/dashboard/MorningBriefing';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { PageTransition } from '../components/layout/PageTransition';
import { UserRole } from '../types';

type TabType = 'overview' | 'analytics' | 'savings' | 'training';

export function Dashboard() {
    const navigate = useNavigate();
    const { requests, resetSimulation } = useApp();
    const { user } = useAuth();
    const activeTransfersCount = requests.filter(r => r.status === 'in_transit').length;
    const [activeTab, setActiveTab] = useState<TabType>('overview');

    const tabs = [
        { id: 'overview' as TabType, label: 'Overview', icon: Package },
        { id: 'analytics' as TabType, label: 'Predictive Analytics', icon: TrendingUp },
        { id: 'savings' as TabType, label: 'Savings & ROI', icon: DollarSign },
    ];

    return (
        <div className="space-y-6 relative">
            <div className="absolute top-0 right-0 -z-10 h-[500px] w-[500px] bg-primary-300/20 rounded-full blur-3xl animate-pulse-slow"></div>
            <div className="absolute bottom-0 left-0 -z-10 h-[500px] w-[500px] bg-secondary-300/20 rounded-full blur-3xl animate-float"></div>

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                        <span className="text-gradient">Sentria</span> Dashboard
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Intelligent insights and real-time metrics for your hospital network.</p>
                </div>
                <div className="flex items-center gap-3">
                    {user?.role === UserRole.SUPER_ADMIN && (
                        <button
                            onClick={resetSimulation}
                            className="text-sm text-secondary-600 hover:text-secondary-700 font-medium px-3 py-1 rounded-md hover:bg-secondary-50 transition-colors"
                        >
                            Reset Demo
                        </button>
                    )}
                    <button
                        onClick={() => {
                            // Export actual transfer requests
                            const headers = ['ID', 'Item', 'Source', 'Destination', 'Status', 'Priority', 'Created At'];
                            const csvContent = [
                                headers.join(','),
                                ...requests.map(r => [
                                    r.id,
                                    `"${r.drug.name}"`,
                                    `"${r.requestedBySite.name}"`,
                                    `"${r.targetSite.name}"`,
                                    r.status,
                                    r.urgency,
                                    r.requestedAt
                                ].join(','))
                            ].join('\n');

                            const blob = new Blob([csvContent], { type: 'text/csv' });
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `sentria-transfers-${new Date().toISOString().split('T')[0]}.csv`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            window.URL.revokeObjectURL(url);
                        }}
                        className="glass-card px-4 py-2 text-sm font-medium text-slate-700 hover:text-primary-600 hover:border-primary-200"
                    >
                        Export Report
                    </button>
                    <button
                        onClick={() => navigate('/marketplace')}
                        className="rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-5 py-2.5 text-sm font-bold text-white shadow-glow-md hover:shadow-glow-lg transition-all hover:-translate-y-0.5"
                    >
                        + New Order
                    </button>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="glass-panel rounded-2xl p-2">
                <div className="flex gap-2 overflow-x-auto">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all whitespace-nowrap ${isActive
                                    ? 'bg-slate-900 text-white shadow-lg scale-105'
                                    : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                <Icon className={`h-4 w-4 ${isActive ? 'text-primary-300' : 'text-slate-400'}`} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                <div className="p-6">
                    {activeTab === 'overview' && (
                        <PageTransition>
                            <div className="space-y-6">
                                <MorningBriefing />

                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {/* Active Transfers - Shortcuts to Inventory/Logistics */}
                                    <div
                                        onClick={() => navigate('/inventory')}
                                        className="cursor-pointer rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-primary-200 group"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-slate-500 group-hover:text-primary-600 transition-colors">Logistics & AI</p>
                                                <p className="text-2xl font-bold text-slate-900">{activeTransfersCount} Active</p>
                                            </div>
                                            <div className="rounded-full bg-purple-100 p-3 text-purple-600 group-hover:bg-purple-200 transition-colors">
                                                <Truck className="h-6 w-6" />
                                            </div>
                                        </div>
                                    </div>
                                    <InventoryAlerts />
                                </div>
                            </div>
                        </PageTransition>
                    )}

                    {activeTab === 'analytics' && (
                        <PageTransition>
                            <PredictiveAnalytics />
                        </PageTransition>
                    )}

                    {activeTab === 'savings' && (
                        <PageTransition>
                            <SavingsProjection />
                        </PageTransition>
                    )}


                </div>
            </div>
        </div>
    );
}
