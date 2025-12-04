import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    updatePassword as firebaseUpdatePassword,
    type User as FirebaseUser
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { FirestoreService } from '../services/firebase.service';
import type { User, LoginCredentials, AuthState } from '../types';
import { ROLE_PERMISSIONS, UserRole, UserStatus } from '../types';
import { SessionTimeoutModal } from '../components/auth/SessionTimeoutModal';

interface AuthContextType extends AuthState {
    login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
    signup: (credentials: LoginCredentials, name: string, role?: UserRole) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    hasPermission: (route: string) => boolean;
    updateUser: (updates: Partial<User>) => Promise<void>;
    changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
    extendSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const WARNING_TIME = 5 * 60 * 1000; // Show warning 5 minutes before timeout

export function AuthProvider({ children }: { children: ReactNode }) {
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        isAuthenticated: false,
        isLoading: true,
    });

    const [sessionWarning, setSessionWarning] = useState(false);
    const [lastActivity, setLastActivity] = useState(() => Date.now());
    const sessionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Listen for Firebase Auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
            if (firebaseUser) {
                try {
                    // Fetch user details from Firestore
                    const userDoc = await FirestoreService.getById<User>('users', firebaseUser.uid);

                    if (userDoc) {
                        setAuthState({
                            user: userDoc,
                            isAuthenticated: true,
                            isLoading: false,
                        });
                    } else {
                        // Handle case where user exists in Auth but not Firestore (shouldn't happen ideally)
                        console.error('User document not found in Firestore');
                        setAuthState({
                            user: null,
                            isAuthenticated: false,
                            isLoading: false,
                        });
                    }
                } catch (error) {
                    console.error('Error fetching user details:', error);
                    setAuthState({
                        user: null,
                        isAuthenticated: false,
                        isLoading: false,
                    });
                }
            } else {
                setAuthState({
                    user: null,
                    isAuthenticated: false,
                    isLoading: false,
                });
            }
        });

        return () => unsubscribe();
    }, []);

    const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
        try {
            await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
            return { success: true };
        } catch (error: any) {
            console.error('Login error:', error);
            return { success: false, error: error.message || 'Failed to login' };
        }
    };

    const signup = async (credentials: LoginCredentials, name: string, role: UserRole = UserRole.PHARMACY_MANAGER): Promise<{ success: boolean; error?: string }> => {
        try {
            // 1. Check if there is a pending user invite for this email
            // We need to query the 'users' collection where email == credentials.email
            // Since we don't have a direct query method exposed in FirestoreService for this specific case easily without adding one,
            // let's fetch all users and filter (not efficient for large DBs but fine for this scale)
            // OR better, let's assume we can use FirestoreService.getAll and filter.

            const allUsers = await FirestoreService.getAll<User>('users');
            const pendingUser = allUsers.find(u => u.email.toLowerCase() === credentials.email.toLowerCase());

            // Special bypass for demo accounts
            const DEMO_ACCOUNTS: Record<string, { role: UserRole; name: string; department: string }> = {
                'admin@sentria.health': { role: UserRole.SUPER_ADMIN, name: 'Super Admin', department: 'Administration' },
                'pharmacy@sentria.health': { role: UserRole.PHARMACY_MANAGER, name: 'Pharmacy Manager', department: 'Pharmacy' },
                'procurement@sentria.health': { role: UserRole.PROCUREMENT_OFFICER, name: 'Procurement Officer', department: 'Procurement' }
            };

            const demoAccount = DEMO_ACCOUNTS[credentials.email.toLowerCase()];

            if (!pendingUser && !demoAccount) {
                return { success: false, error: 'Account not authorized. Please contact a Super Admin to invite you.' };
            }

            // 2. Create Auth User
            const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, credentials.email, credentials.password);

            // 3. Create new User document with Auth UID, inheriting data from pending user or demo account
            const newUser: User = {
                ...(pendingUser || {}), // Inherit role, department, etc. if pending user exists
                id: firebaseUser.uid,
                email: credentials.email, // Ensure email is set
                name: name || pendingUser?.name || demoAccount?.name || 'User',
                role: (pendingUser?.role || demoAccount?.role || role),
                department: pendingUser?.department || demoAccount?.department || 'General',
                status: UserStatus.ACTIVE, // Activate the user
                createdAt: new Date().toISOString(), // Reset created at? Or keep original? Let's reset for "joined" date.
                lastLogin: new Date().toISOString(),
            };

            await FirestoreService.set('users', firebaseUser.uid, newUser);

            // 4. Delete the old pending/invite document if it exists
            if (pendingUser && pendingUser.id !== firebaseUser.uid) {
                await FirestoreService.delete('users', pendingUser.id);
            }

            return { success: true };
        } catch (error: any) {
            console.error('Signup error:', error);
            return { success: false, error: error.message || 'Failed to sign up' };
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            setAuthState({
                user: null,
                isAuthenticated: false,
                isLoading: false,
            });
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const changePassword = async (_currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
        if (!auth.currentUser) {
            return { success: false, error: 'Not authenticated' };
        }

        try {
            // Note: Re-authentication might be required here in a real app if the session is old
            await firebaseUpdatePassword(auth.currentUser, newPassword);
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message || 'Failed to update password' };
        }
    };

    const hasPermission = (route: string): boolean => {
        if (!authState.user) return false;

        const permissions = ROLE_PERMISSIONS[authState.user.role];

        // Super admin has full access
        if (permissions.includes('*')) return true;

        // Check if route is in permissions
        return permissions.includes(route);
    };

    const updateUser = async (updates: Partial<User>) => {
        if (!authState.user) return;

        try {
            await FirestoreService.update('users', authState.user.id, updates);

            // Local state update will happen via onSnapshot if we subscribed, 
            // but for now we manually update local state for immediate feedback
            setAuthState(prev => ({
                ...prev,
                user: prev.user ? { ...prev.user, ...updates } : null,
            }));
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    const extendSession = () => {
        setLastActivity(Date.now());
        setSessionWarning(false);
    };

    // Session timeout management
    useEffect(() => {
        if (!authState.isAuthenticated) return;

        // Clear existing timers
        if (sessionTimerRef.current) clearTimeout(sessionTimerRef.current);
        if (warningTimerRef.current) clearTimeout(warningTimerRef.current);

        // Set warning timer
        warningTimerRef.current = setTimeout(() => {
            setSessionWarning(true);
        }, SESSION_TIMEOUT - WARNING_TIME);

        // Set logout timer
        sessionTimerRef.current = setTimeout(() => {
            logout();
        }, SESSION_TIMEOUT);

        return () => {
            if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
            if (sessionTimerRef.current) clearTimeout(sessionTimerRef.current);
        };
    }, [authState.isAuthenticated, lastActivity]);

    return (
        <>
            <AuthContext.Provider
                value={{
                    ...authState,
                    login,
                    signup,
                    logout,
                    hasPermission,
                    updateUser,
                    changePassword,
                    extendSession,
                }}
            >
                {children}
            </AuthContext.Provider>

            {sessionWarning && (
                <SessionTimeoutModal
                    isOpen={sessionWarning}
                    remainingSeconds={WARNING_TIME / 1000}
                    onExtend={extendSession}
                    onLogout={logout}
                />
            )}
        </>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
