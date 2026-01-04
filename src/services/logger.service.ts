/**
 * SecureLogger
 * 
 * SECURITY COMPONENT
 * -------------------
 * Acts as the 'Firewall' for information leakage to the browser console.
 * Epic Systems requires that NO Protected Health Information (PHI/PII)
 * is visible in the client-side developer tools.
 * 
 * Features:
 * - Redacts sensitive keys (ssn, mrn, name, email) recursively.
 * - Only logs detailed objects in DEV mode.
 * - Suppresses stack traces in Production.
 */
export class SecureLogger {
    private static isDev = import.meta.env.DEV;

    // LIST OF RESTRICTED KEYS (Case-insensitive matching)
    // Any object key matching these substrings will be redacted.
    private static SENSITIVE_KEYS = ['ssn', 'mrn', 'name', 'email', 'phone', 'address', 'password', 'token', 'dob'];

    /**
     * Safe Log
     * Prints to console only if in Development environment.
     * Silent in Production.
     */
    static log(message: string, ...args: any[]) {
        if (this.isDev) {
            console.log(`[SENTRIA] ${message}`, ...args);
        }
    }

    /**
     * Info Split
     * Used for high-volume telemetry that should be stripped in Prod.
     */
    static split(message: string, ...args: any[]) {
        if (this.isDev) {
            console.log(`[SENTRIA-INFO] ${message}`, ...args);
        }
    }

    /**
     * Safe Warn
     * Logs a warning message but suppresses potential PII arguments in Production.
     */
    static warn(message: string, ..._args: any[]) {
        console.warn(`[SENTRIA-WARN] ${message}`);
        // In prod, we purposefully suppress args to prevent data leaks
    }

    /**
     * Safe Error
     * Logs critical application errors.
     * IN PROD: Logs only the message, hides the Error object (which may contain stack traces/data).
     * IN DEV: Logs full interactivity.
     */
    static error(message: string, error?: any) {
        if (this.isDev) {
            console.error(`[SENTRIA-ERROR] ${message}`, error);
        } else {
            console.error(`[SENTRIA-ERROR] ${message} (Details hidden for privacy)`);
        }
    }

    /**
     * PII Sanitizer
     * Recursively traverses objects to find and redact sensitive keys.
     * Useful if we ever need to send logs to a backend and want to scrub them client-side first.
     * 
     * @param data - The raw object containing potential PII.
     * @returns A deep copy of the object with sensitive strings replaced by '***REDACTED***'.
     */
    static sanitize(data: any): any {
        if (!data || typeof data !== 'object') return data;

        if (Array.isArray(data)) {
            return data.map(item => this.sanitize(item));
        }

        const sanitized = { ...data };
        for (const key of Object.keys(sanitized)) {
            if (this.SENSITIVE_KEYS.some(k => key.toLowerCase().includes(k))) {
                sanitized[key] = '***REDACTED***';
            } else if (typeof sanitized[key] === 'object') {
                sanitized[key] = this.sanitize(sanitized[key]);
            }
        }
        return sanitized;
    }
}
