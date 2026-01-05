import { useState, useEffect } from 'react';
import { Key, Save, AlertCircle, ShieldCheck } from 'lucide-react';

export function SystemSettings() {
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [keys, setKeys] = useState<{
        mckesson_api_key?: string;
        cardinal_api_key?: string;
        [key: string]: string | undefined;
    }>({
        mckesson_api_key: '',
        cardinal_api_key: ''
    });

    useEffect(() => {
        const loadSettings = async () => {
            try {
                // FETCH FROM SECURE BACKEND MEMORY
                const res = await fetch('/api/ai/memory/get/system_settings_global');
                if (res.ok) {
                    const data = await res.json();
                    // Identify if we got data or empty object
                    if (data && Object.keys(data).length > 0) {
                        setKeys({
                            mckesson_api_key: data.mckesson_api_key || '',
                            cardinal_api_key: data.cardinal_api_key || ''
                        });
                    }
                }
            } catch (err) {
                console.error("Failed to load system settings from backend", err);
            }
        };
        loadSettings();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setKeys((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setSuccessMessage('');

        try {
            // SEND TO SECURE BACKEND (AES-256 ENCRYPTED)
            const response = await fetch('/api/ai/memory/set', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    key: 'system_settings_global',
                    value: keys
                })
            });

            if (!response.ok) throw new Error('Backend encryption failed');

            setSuccessMessage('Keys encrypted & stored securely (AES-256).');
        } catch (error) {
            console.error('Failed to save settings:', error);
            setSuccessMessage('Error saving settings. Ensure Backend is running.');
        }
        setIsLoading(false);
    };

    return (
        <div className="max-w-2xl space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                        <Key className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900">API Configuration</h3>
                        <p className="text-sm text-slate-500">Manage external integration keys securely.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {successMessage && (
                        <div className={`flex items-center gap-2 p-3 ${successMessage.includes('Error') ? 'bg-red-50 text-red-700 border-red-100' : 'bg-green-50 text-green-700 border-green-100'} text-sm rounded-lg border`}>
                            {successMessage.includes('Error') ? <AlertCircle className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                            {successMessage}
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">McKesson Connect API Key</label>
                        <input
                            type="password"
                            name="mckesson_api_key"
                            value={keys.mckesson_api_key}
                            onChange={handleChange}
                            placeholder="Full Access Token"
                            className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            <Save className="h-4 w-4" />
                            {isLoading ? 'Encrypting...' : 'Save Securely'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                    <h4 className="text-sm font-semibold text-emerald-900">Valid Security: AES-256 Encryption</h4>
                    <p className="text-xs text-emerald-800 mt-1">
                        Keys are now encrypted at rest using the Python Backend's Secure Memory (AES-256).
                        They are NOT stored in Firestore plaintext.
                    </p>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50 p-6 rounded-xl border border-red-100 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-red-900">Danger Zone</h3>
                        <p className="text-sm text-red-600">Irreversible actions for data management.</p>
                    </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-100">
                    <div>
                        <p className="font-medium text-slate-900">Reset Simulation Data</p>
                        <p className="text-sm text-slate-500">Wipes all inventory, audits, and transfers. Resets to mock baseline.</p>
                    </div>
                    <ResetButton />
                </div>
            </div>
        </div>
    );
}

function ResetButton() {
    // Import locally to avoid circular dependencies if possible, or use hook
    const { resetSimulation, isLoading } = useSystemReset();

    return (
        <button
            onClick={resetSimulation}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
        >
            {isLoading ? 'Resetting...' : 'Reset Demo'}
        </button>
    );
}

// Helper hook to access reset from context without direct AppContext import if simpler, 
// OR just import useApp at top.
import { useApp } from '../../../context/AppContext';
function useSystemReset() {
    const { resetSimulation, isLoading } = useApp();
    return { resetSimulation, isLoading };
}
