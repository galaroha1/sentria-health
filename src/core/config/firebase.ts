import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics, type Analytics } from 'firebase/analytics';

// Use environment variables for configuration
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAdp1LQZulE-vSKhUSSTNuYvV8CPXI1HS8",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "sentria-health.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "sentria-health",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "sentria-health.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "726240353286",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:726240353286:web:0c79b0523ee1c87ce0f787",
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-5MFE4C9X7Z"
};

let app: FirebaseApp;
let db: Firestore;
let auth: Auth;
let analytics: Analytics;
let initializationError: string | null = null;

try {
    // Check if config is valid
    if (!firebaseConfig.apiKey) {
        throw new Error('Firebase API Key is missing. Please check your .env file.');
    }

    // Initialize Firebase only if not already initialized
    if (!getApps().length) {
        app = initializeApp(firebaseConfig);
    } else {
        app = getApps()[0];
    }

    // Initialize services
    db = getFirestore(app);
    auth = getAuth(app);
    // Analytics is only supported in browser environments
    if (typeof window !== 'undefined') {
        analytics = getAnalytics(app);
    }

} catch (error: any) {
    console.error('Firebase Initialization Error:', error);
    initializationError = error.message || 'Unknown Firebase Error';

    // Create dummy objects to prevent immediate crashes on import
    // These will throw or log if methods are called, but allow the app to load
    app = {} as any;
    db = {} as any;
    auth = {} as any;
    analytics = {} as any;
}

const googleProvider = new GoogleAuthProvider();
export { app, db, auth, analytics, initializationError, googleProvider };
export default app;
