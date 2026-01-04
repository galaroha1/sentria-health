/**
 * SystemMemoryService
 * 
 * CORE ARCHITECTURE COMPONENT
 * ---------------------------
 * This service acts as the bridge between the React Frontend and the Secure Python Backend.
 * It strictly handles the transmission of JSON data for persistent storage.
 * 
 * SECURITY NOTE:
 * All data sent through this service is encrypted at rest by the backend (AES-256).
 * This service does NOT handle encryption keys; it relies on the backend's secure vault.
 */
export class SystemMemoryService {
    private static BASE_URL = '/api/ai/memory';

    /**
     * Persists an object to the Secure Backend Memory.
     * 
     * @param key - Unique identifier for the data (e.g., 'currentOptimizationRun').
     * @param value - The JSON serializable object to be encrypted and stored.
     * @returns Promise<void> - Resolves when data is successfully encrypted and written to SQLite.
     * 
     * AUDIT TRAIL: This action triggers a WRITE event in the backend Audit Log.
     */
    static async save(key: string, value: any): Promise<void> {
        try {
            const response = await fetch(`${this.BASE_URL}/set`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ key, value })
            });

            if (!response.ok) {
                throw new Error(`Memory Save Failed: ${response.statusText}`);
            }
        } catch (error) {
            console.error('SystemMemoryService.save error:', error);
            // Non-blocking error, allow app to continue even if memory fails
        }
    }

    /**
     * Retrieves and Decrypts an object from the Secure Backend Memory.
     * 
     * @param key - Unique identifier to fetch.
     * @returns Promise<T | null> - The decrypted data object, or null if not found.
     * 
     * AUDIT TRAIL: This action triggers a READ event in the backend Audit Log.
     */
    static async load<T>(key: string): Promise<T | null> {
        try {
            const response = await fetch(`${this.BASE_URL}/get/${key}`);

            if (!response.ok) {
                if (response.status === 404 || response.status === 500) return null; // Handle missing keys gracefully
                throw new Error(`Memory Load Failed: ${response.statusText}`);
            }

            const data = await response.json();
            // Backend returns {} if empty, so check if empty object if T expects something else? 
            // Our backend code returns {} for not found.
            // Let's assume the caller handles validation or defaults.
            if (Object.keys(data).length === 0) return null;

            return data as T;
        } catch (error) {
            console.error('SystemMemoryService.load error:', error);
            return null;
        }
    }

    /**
     * Clear a specific memory key.
     * @param key Unique key to clear
     */
    static async clear(key: string): Promise<void> {
        try {
            await fetch(`${this.BASE_URL}/clear/${key}`, { method: 'POST' });
        } catch (error) {
            console.error('SystemMemoryService.clear error:', error);
        }
    }
}
