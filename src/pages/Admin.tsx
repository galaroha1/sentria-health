import { useState } from 'react';
import { ModelTraining } from '../components/admin/ModelTraining';
import { NetworkConfig } from '../components/admin/NetworkConfig';
import { SystemSettings } from '../components/admin/SystemSettings';
import { Brain, Shield, Network } from 'lucide-react';

export function Admin() {
    const [activeTab, setActiveTab] = useState<'training' | 'network' | 'settings'>('training');

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Admin Console</h1>
                    <p className="text-slate-500">Manage system settings, AI models, and network configuration.</p>
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
                        onClick={() => setActiveTab('network')}
                        className={`${activeTab === 'network'
                            ? 'border-purple-500 text-purple-600'
                            : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium flex items-center gap-2`}
                    >
                        <Network className="h-4 w-4" />
                        Network Configuration
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
                {activeTab === 'network' && <NetworkConfig />}
                {activeTab === 'settings' && <SystemSettings />}
            </div>
        </div>
    );
}
