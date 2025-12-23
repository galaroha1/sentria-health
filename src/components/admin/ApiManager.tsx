import { useState, useEffect } from 'react';
import { Shield, Key, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';
import { SystemSettingsService } from '../../services/system-settings.service';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

export function ApiManager() {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Form State
    const [keys, setKeys] = useState({
        mckessonApiKey: '',
        mckessonAccountId: '',
        cardinalApiKey: ''
    });

    const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

    // Load existing (masked) checking
    useEffect(() => {
        loadCurrentState();
    }, []);

    const loadCurrentState = async () => {
        // We can't really "load" the secrets back for security usually, 
        // but here we can check if they exist or load them if allowed.
        // For security, usually we only return whether it is SET or NOT SET.
        // But since this is a prototype, we'll try to load them to edit.

        try {
            const mckKey = await SystemSettingsService.getSecret('VITE_MCKESSON_API_KEY');
            const mckAcc = await SystemSettingsService.getSecret('VITE_MCKESSON_ACCOUNT_ID');
            const cardKey = await SystemSettingsService.getSecret('VITE_CARDINAL_API_KEY');

            setKeys({
                mckessonApiKey: mckKey || '',
                mckessonAccountId: mckAcc || '',
                cardinalApiKey: cardKey || ''
            });
        } catch (error) {
            console.error(error);
        }
    };

    const handleSave = async () => {
        if (!user || user.role !== UserRole.SUPER_ADMIN) {
            setMessage({ type: 'error', text: 'Unauthorized' });
            return;
        }

        setIsLoading(true);
        try {
            await SystemSettingsService.updateSettings({
                mckessonApiKey: keys.mckessonApiKey,
                mckessonAccountId: keys.mckessonAccountId,
                cardinalApiKey: keys.cardinalApiKey
            }, user.id);

            setMessage({ type: 'success', text: 'API Keys updated successfully. New requests will use these keys.' });
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update keys' });
        } finally {
            setIsLoading(false);
        }
    };

    const toggleShow = (field: string) => {
        setShowSecrets(prev => ({ ...prev, [field]: !prev[field] }));
    };

    if (user?.role !== UserRole.SUPER_ADMIN) return null;

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center">
                        <Shield className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">System Administration</h2>
                        <p className="text-sm text-slate-500">Manage external API integrations and secrets</p>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-6">
                {/* McKesson */}
                <div className="space-y-4">
                    <h3 className="text-sm font-medium text-slate-900 flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                        McKesson Connect
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-500">API Key</label>
                            <div className="relative">
                                <Key className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                <input
                                    type={showSecrets.mckKey ? "text" : "password"}
                                    value={keys.mckessonApiKey}
                                    onChange={e => setKeys({ ...keys, mckessonApiKey: e.target.value })}
                                    className="w-full pl-9 pr-10 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50"
                                    placeholder="Enter Production API Key"
                                />
                                <button onClick={() => toggleShow('mckKey')} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600">
                                    {showSecrets.mckKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-500">Account ID</label>
                            <div className="relative">
                                <Shield className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    value={keys.mckessonAccountId}
                                    onChange={e => setKeys({ ...keys, mckessonAccountId: e.target.value })}
                                    className="w-full pl-9 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50"
                                    placeholder="McKesson Account ID"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="h-px bg-slate-100"></div>

                {/* Cardinal */}
                <div className="space-y-4">
                    <h3 className="text-sm font-medium text-slate-900 flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                        Cardinal Health
                    </h3>
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-500">API Key</label>
                        <div className="relative">
                            <Key className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <input
                                type={showSecrets.cardKey ? "text" : "password"}
                                value={keys.cardinalApiKey}
                                onChange={e => setKeys({ ...keys, cardinalApiKey: e.target.value })}
                                className="w-full pl-9 pr-10 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50"
                                placeholder="Enter Production API Key"
                            />
                            <button onClick={() => toggleShow('cardKey')} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600">
                                {showSecrets.cardKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                </div>

                {message && (
                    <div className={`p-3 rounded-lg flex items-center gap-2 text-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                        {message.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                        {message.text}
                    </div>
                )}

                <div className="flex justify-end pt-2">
                    <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors"
                    >
                        {isLoading ? 'Saving...' : 'Save API Configuration'}
                    </button>
                </div>
            </div>
        </div>
    );
}
