import { useState, useEffect } from 'react';
import { Key, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { FirestoreService } from '../../services/firebase.service';

export function SystemSettings() {
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [keys, setKeys] = useState({
        openai_api_key: '',
        mckesson_api_key: '',
        cardinal_api_key: ''
    });

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const settings = await FirestoreService.getById<{
                    openai_api_key: string;
                    mckesson_api_key: string;
                    cardinal_api_key: string;
                }>('system_settings', 'global');

                if (settings) {
                    setKeys({
                        openai_api_key: settings.openai_api_key || '',
                        mckesson_api_key: settings.mckesson_api_key || '',
                        cardinal_api_key: settings.cardinal_api_key || ''
                    });
                }
            } catch (err) {
                console.error("Failed to load system settings", err);
            }
        };
        loadSettings();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setKeys(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setSuccessMessage('');

        // Simulate secure save (keeping UI feedback)
        await new Promise(resolve => setTimeout(resolve, 800));

        // Save to Firestore
        try {
            await FirestoreService.set('system_settings', 'global', {
                ...keys,
                updatedAt: new Date().toISOString(),
                updatedBy: 'admin' // In real app, use auth.currentUser.uid
            });
            setSuccessMessage('System configuration updated successfully.');
        } catch (error) {
            console.error('Failed to save settings:', error);
            setSuccessMessage('Error saving settings. Check console.');
        }
        setIsLoading(false);
    };

    return (
        <div className="max-w-2xl space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                        <Key className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900">API Configuration</h3>
                        <p className="text-sm text-slate-500">Manage external integration keys securely.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {successMessage && (
                        <div className={`flex items-center gap-2 p-3 ${successMessage.includes('Error') ? 'bg-red-50 text-red-700 border-red-100' : 'bg-green-50 text-green-700 border-green-100'} text-sm rounded-lg border`}>
                            {successMessage.includes('Error') ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                            {successMessage}
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">OpenAI API Key</label>
                        <input
                            type="password"
                            name="openai_api_key"
                            value={keys.openai_api_key}
                            onChange={handleChange}
                            placeholder="sk-..."
                            className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <p className="text-xs text-slate-400">Used for Generative AI and Decision Engine.</p>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">McKesson Connect API Key</label>
                        <input
                            type="password"
                            name="mckesson_api_key"
                            value={keys.mckesson_api_key}
                            onChange={handleChange}
                            placeholder="Full Access Token"
                            className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">Cardinal Health IO Key</label>
                        <input
                            type="password"
                            name="cardinal_api_key"
                            value={keys.cardinal_api_key}
                            onChange={handleChange}
                            placeholder="Integrations Key"
                            className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex items-center gap-2 px-4 py-2 bg-primary-800 text-white text-sm font-medium rounded-lg hover:bg-primary-900 transition-colors disabled:opacity-50"
                        >
                            <Save className="h-4 w-4" />
                            {isLoading ? 'Saving...' : 'Save Configuration'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                    <h4 className="text-sm font-semibold text-blue-900">Security Note</h4>
                    <p className="text-xs text-blue-700 mt-1">
                        Keys are encrypted at rest. Never share these keys outside of the secure admin console.
                        Changes may take up to 5 minutes to propagate to the decision engine.
                    </p>
                </div>
            </div>
        </div>
    );
}
