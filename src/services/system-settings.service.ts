

export interface SystemSettings {
    id: string; // 'config'
    apiKeys: {
        mckessonApiKey?: string;
        mckessonAccountId?: string;
        cardinalApiKey?: string;
    };
    lastUpdated: string;
    updatedBy: string;
}

export class SystemSettingsService {
    private static cache: SystemSettings | null = null;
    private static readonly DOC_ID = 'global';

    /**
     * Get a secret key. Tries Firestore first, falls back to ENV.
     */
    static async getSecret(key: 'VITE_MCKESSON_API_KEY' | 'VITE_MCKESSON_ACCOUNT_ID' | 'VITE_CARDINAL_API_KEY'): Promise<string | undefined> {
        // 1. Try Cache
        if (!this.cache) {
            await this.loadSettings();
        }

        // 2. Map Key to Cache Field
        let val: string | undefined;
        if (this.cache?.apiKeys) {
            if (key === 'VITE_MCKESSON_API_KEY') val = this.cache.apiKeys.mckessonApiKey;
            if (key === 'VITE_MCKESSON_ACCOUNT_ID') val = this.cache.apiKeys.mckessonAccountId;
            if (key === 'VITE_CARDINAL_API_KEY') val = this.cache.apiKeys.cardinalApiKey;
        }

        // 3. Fallback to Env if missing in DB
        if (!val) {
            val = import.meta.env[key];
        }

        return val;
    }

    static async updateSettings(keys: Partial<SystemSettings['apiKeys']>, userId: string): Promise<void> {
        // Proxy to Backend for Secure Storage
        // NOTE: The UI typically handles this, but if called programmatically:
        try {
            await fetch('/api/ai/memory/set', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    key: 'system_settings_global',
                    value: {
                        mckesson_api_key: keys.mckessonApiKey,
                        cardinal_api_key: keys.cardinalApiKey,
                        updatedBy: userId
                    }
                })
            });
            // Refresh cache
            await this.loadSettings();
        } catch (e) {
            console.error("Failed to updates secure settings", e);
        }
    }

    private static async loadSettings() {
        try {
            const res = await fetch('/api/ai/memory/get/system_settings_global');
            if (res.ok) {
                const data = await res.json();
                this.cache = {
                    id: this.DOC_ID,
                    apiKeys: {
                        mckessonApiKey: data.mckesson_api_key,
                        cardinalApiKey: data.cardinal_api_key
                    },
                    lastUpdated: new Date().toISOString(),
                    updatedBy: 'system'
                };
            }
        } catch (error) {
            console.warn('Failed to load system settings', error);
        }
    }
}
