import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    updatePassword as firebaseUpdatePassword,
    type User as FirebaseUser
} from 'firebase/auth';
import { auth } from '../core/config/firebase';
import { FirestoreService } from '../core/services/firebase.service';
import type { User, LoginCredentials, AuthState } from '../types';
import { ROLE_PERMISSIONS, UserRole, UserStatus } from '../types';
import { SessionTimeoutModal } from '../components/auth/SessionTimeoutModal';

interface AuthContextType extends AuthState {
    login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string; code?: string }>;
    signup: (credentials: LoginCredentials, name: string, role?: UserRole) => Promise<{ success: boolean; error?: string; code?: string }>;
    logout: () => Promise<void>;
    hasPermission: (route: string) => boolean;
    updateUser: (updates: Partial<User>) => Promise<void>;
    changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
    extendSession: () => void;
    updateSessionDuration: (ms: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    // 1. Session Duration State (Must be inside component)
    const [sessionDuration, setSessionDuration] = useState(() => {
        const saved = localStorage.getItem('sentria_session_duration');
        return saved ? parseInt(saved, 10) : 30 * 60 * 1000;
    });

    const updateSessionDuration = (ms: number) => {
        setSessionDuration(ms);
        localStorage.setItem('sentria_session_duration', ms.toString());
    };

    const SESSION_TIMEOUT = sessionDuration;
    const WARNING_TIME = 5 * 60 * 1000; // Show warning 5 minutes before timeout

    // 2. Auth State
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        isAuthenticated: false,
        isLoading: true,
    });

    const [sessionWarning, setSessionWarning] = useState(false);
    const [lastActivity, setLastActivity] = useState(() => Date.now());
    const sessionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // 3. Auth Logic
    const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string; code?: string }> => {
        try {
            await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
            // Reset session timer on login
            const now = Date.now();
            setLastActivity(now);
            localStorage.setItem('sentria_last_activity', now.toString());
            return { success: true };
        } catch (error: any) {
            console.error('Login error:', error);
            return { success: false, error: error.message || 'Failed to login', code: error.code };
        }
    };

    const signup = async (credentials: LoginCredentials, name: string, role: UserRole = UserRole.PHARMACY_MANAGER): Promise<{ success: boolean; error?: string; code?: string }> => {
        try {
            // 1. Check if there is a pending user invite for this email (Optional now - Open Registration)
            const allUsers = await FirestoreService.getAll<User>('users');
            const pendingUser = allUsers.find(u => u.email.toLowerCase() === credentials.email.toLowerCase());

            // Special bypass for demo accounts
            const DEMO_ACCOUNTS: Record<string, { role: UserRole; name: string; department: string }> = {
                'admin@sentria.health': { role: UserRole.SUPER_ADMIN, name: 'Super Admin', department: 'Administration' },
                'super@penn.edu': { role: UserRole.SUPER_ADMIN, name: 'Penn Super Admin', department: 'Administration' },
                'pharmacy@sentria.health': { role: UserRole.PHARMACY_MANAGER, name: 'Pharmacy Manager', department: 'Pharmacy' },
                'procurement@sentria.health': { role: UserRole.PROCUREMENT_OFFICER, name: 'Procurement Officer', department: 'Procurement' },
                'doctor@sentria.health': { role: UserRole.DOCTOR, name: 'Dr. Emily Carter', department: 'Surgery' }
            };

            const demoAccount = DEMO_ACCOUNTS[credentials.email.toLowerCase()];

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
                createdAt: new Date().toISOString(),
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
            return { success: false, error: error.message || 'Failed to sign up', code: error.code };
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            localStorage.removeItem('sentria_last_activity');
            setAuthState({
                user: null,
                isAuthenticated: false,
                isLoading: false,
            });
            setSessionWarning(false);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const changePassword = async (_currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
        if (!auth.currentUser) {
            return { success: false, error: 'Not authenticated' };
        }

        try {
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

            setAuthState(prev => ({
                ...prev,
                user: prev.user ? { ...prev.user, ...updates } : null,
            }));
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    const extendSession = () => {
        const now = Date.now();
        setLastActivity(now);
        localStorage.setItem('sentria_last_activity', now.toString());
        setSessionWarning(false);
    };

    // 4. Effects
    // Listen for Firebase Auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
            if (firebaseUser) {
                try {
                    // Check session timeout immediately on restore
                    const now = Date.now();
                    const savedActivity = localStorage.getItem('sentria_last_activity');
                    const lastActiveTime = savedActivity ? parseInt(savedActivity, 10) : now;

                    if (now - lastActiveTime > SESSION_TIMEOUT) {
                        console.warn('Session expired during reload');
                        await signOut(auth);
                        setAuthState({ user: null, isAuthenticated: false, isLoading: false });
                        localStorage.removeItem('sentria_last_activity');
                        return;
                    }

                    // Fetch user details from Firestore
                    const userDoc = await FirestoreService.getById<User>('users', firebaseUser.uid);

                    if (userDoc) {
                        setAuthState({
                            user: userDoc,
                            isAuthenticated: true,
                            isLoading: false,
                        });
                    } else {
                        // Handle case where user exists in Auth but not Firestore
                        console.warn('User document not found in Firestore. Checking if it is a demo account...');

                        const DEMO_ACCOUNTS: Record<string, { role: UserRole; name: string; department: string }> = {
                            'admin@sentria.health': { role: UserRole.SUPER_ADMIN, name: 'Super Admin', department: 'Administration' },
                            'super@penn.edu': { role: UserRole.SUPER_ADMIN, name: 'Penn Super Admin', department: 'Administration' },
                            'pharmacy@sentria.health': { role: UserRole.PHARMACY_MANAGER, name: 'Pharmacy Manager', department: 'Pharmacy' },
                            'procurement@sentria.health': { role: UserRole.PROCUREMENT_OFFICER, name: 'Procurement Officer', department: 'Procurement' },
                            'doctor@sentria.health': { role: UserRole.DOCTOR, name: 'Dr. Emily Carter', department: 'Surgery' }
                        };

                        const email = firebaseUser.email?.toLowerCase();
                        const demoAccount = email ? DEMO_ACCOUNTS[email] : null;

                        if (demoAccount && email) {
                            console.log('Restoring missing demo account profile for:', email);
                            const newUser: User = {
                                id: firebaseUser.uid,
                                email: email,
                                name: demoAccount.name,
                                role: demoAccount.role,
                                department: demoAccount.department,
                                status: UserStatus.ACTIVE,
                                createdAt: new Date().toISOString(),
                                lastLogin: new Date().toISOString(),
                            };

                            await FirestoreService.set('users', firebaseUser.uid, newUser);

                            setAuthState({
                                user: newUser,
                                isAuthenticated: true,
                                isLoading: false,
                            });
                        } else {
                            console.error('User document not found and not a demo account.');
                            setAuthState({
                                user: null,
                                isAuthenticated: false,
                                isLoading: false,
                            });
                        }
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
    }, [SESSION_TIMEOUT]); // Re-run if session timeout changes, though typically we might want to be careful here

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
    }, [authState.isAuthenticated, lastActivity, SESSION_TIMEOUT]);

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
                    updateSessionDuration,
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
