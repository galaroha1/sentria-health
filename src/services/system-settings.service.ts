import { FirestoreService } from './firebase.service';

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
    private static readonly DOC_ID = 'config';

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
        const update: Partial<SystemSettings> = {
            apiKeys: {
                ...this.cache?.apiKeys,
                ...keys
            },
            lastUpdated: new Date().toISOString(),
            updatedBy: userId
        };

        await FirestoreService.set('system_settings', this.DOC_ID, update);

        // Refresh cache
        await this.loadSettings();
    }

    private static async loadSettings() {
        try {
            const settings = await FirestoreService.getById<SystemSettings>('system_settings', this.DOC_ID);
            if (settings) {
                this.cache = settings;
            } else {
                // Init empty
                this.cache = {
                    id: this.DOC_ID,
                    apiKeys: {},
                    lastUpdated: new Date().toISOString(),
                    updatedBy: 'system'
                };
            }
        } catch (error) {
            console.warn('Failed to load system settings', error);
        }
    }
}
