import { useState } from 'react';
import { ModelTraining } from '../components/admin/ModelTraining';
import { Brain, Shield } from 'lucide-react';

export function Admin() {
    const [activeTab, setActiveTab] = useState<'training' | 'settings'>('training');

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Admin Console</h1>
                    <p className="text-slate-500">Manage system settings, AI models, and user permissions.</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('training')}
                        className={`${activeTab === 'training'
                            ? 'border-purple-500 text-purple-600'
                            : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium flex items-center gap-2`}
                    >
                        <Brain className="h-4 w-4" />
                        AI Model Training
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`${activeTab === 'settings'
                            ? 'border-purple-500 text-purple-600'
                            : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium flex items-center gap-2`}
                    >
                        <Shield className="h-4 w-4" />
                        System Settings
                    </button>
                </nav>
            </div>

            {/* Content */}
            <div className="min-h-[400px]">
                {activeTab === 'training' && <ModelTraining />}
                {activeTab === 'settings' && (
                    <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-500">
                        <Shield className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                        <h3 className="text-lg font-medium text-slate-900">System Settings</h3>
                        <p>Global system configuration options will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
