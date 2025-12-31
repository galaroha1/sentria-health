import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, DollarSign, Package, Truck, Brain } from 'lucide-react';
import { InventoryAlerts } from '../components/dashboard/InventoryAlerts';
import { PredictiveAnalytics } from '../components/dashboard/PredictiveAnalytics';
import { SavingsProjection } from '../components/dashboard/SavingsProjection';
import { ModelTraining } from '../features/admin/components/ModelTraining';
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
        { id: 'training' as TabType, label: 'AI Model Training', icon: Brain },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                    <p className="text-sm text-slate-500">Intelligent insights and real-time metrics for your hospital network.</p>
                </div>
                <div className="flex items-center gap-3">
                    {user?.role === UserRole.SUPER_ADMIN && (
                        <button
                            onClick={resetSimulation}
                            className="text-sm text-red-600 hover:text-red-700 font-medium px-3 py-1 rounded-md hover:bg-red-50 transition-colors"
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
                        className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-colors"
                    >
                        Export Report
                    </button>
                    <button
                        onClick={() => navigate('/marketplace')}
                        className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 active:bg-primary-800 transition-colors"
                    >
                        New Order
                    </button>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex gap-2 border-b border-slate-200 p-2 overflow-x-auto">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
                                    ? 'bg-slate-900 text-white'
                                    : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                            >
                                <Icon className="h-4 w-4" />
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

                    {activeTab === 'training' && (
                        <PageTransition>
                            <ModelTraining />
                        </PageTransition>
                    )}
                </div>
            </div>
        </div>
    );
}
