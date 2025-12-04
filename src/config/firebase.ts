import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';

// Use environment variables for configuration
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let app: FirebaseApp;
let db: Firestore;
let auth: Auth;

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

} catch (error) {
    console.error('Firebase Initialization Error:', error);
    // Re-throw to be caught by global error handlers or cause a visible crash
    // We can't really recover if Firebase is essential
    throw error;
}

export { app, db, auth };
export default app;
