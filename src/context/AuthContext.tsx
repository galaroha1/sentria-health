import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import type { User, LoginCredentials, AuthState } from '../types';
import { MOCK_USERS, ROLE_PERMISSIONS } from '../types';
import { SessionTimeoutModal } from '../components/auth/SessionTimeoutModal';

interface AuthContextType extends AuthState {
    login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    hasPermission: (route: string) => boolean;
    updateUser: (updates: Partial<User>) => void;
    changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
    extendSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'sentria_auth_user';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const WARNING_TIME = 5 * 60 * 1000; // Show warning 5 minutes before timeout

export function AuthProvider({ children }: { children: ReactNode }) {
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        isAuthenticated: false,
        isLoading: true,
    });
    const [sessionWarning, setSessionWarning] = useState(false);
    const [lastActivity, setLastActivity] = useState(Date.now());
    const sessionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Load user from localStorage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem(STORAGE_KEY);
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser) as User;
                setAuthState({
                    user,
                    isAuthenticated: true,
                    isLoading: false,
                });
            } catch (error) {
                console.error('Failed to parse stored user:', error);
                localStorage.removeItem(STORAGE_KEY);
                setAuthState(prev => ({ ...prev, isLoading: false }));
            }
        } else {
            setAuthState(prev => ({ ...prev, isLoading: false }));
        }
    }, []);

    const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
        const { email, password } = credentials;

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const userRecord = MOCK_USERS[email.toLowerCase()];

        if (!userRecord) {
            return { success: false, error: 'Invalid email or password' };
        }

        if (userRecord.password !== password) {
            return { success: false, error: 'Invalid email or password' };
        }

        const user = userRecord.user;

        // Store in localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));

        setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false,
        });

        return { success: true };
    };

    const logout = () => {
        localStorage.removeItem(STORAGE_KEY);
        setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
        });
    };

    const changePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
        if (!authState.user) {
            return { success: false, error: 'Not authenticated' };
        }

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const userRecord = MOCK_USERS[authState.user.email.toLowerCase()];

        if (!userRecord) {
            return { success: false, error: 'User not found' };
        }

        if (userRecord.password !== currentPassword) {
            return { success: false, error: 'Current password is incorrect' };
        }

        // Update password in mock database
        userRecord.password = newPassword;

        return { success: true };
    };

    const hasPermission = (route: string): boolean => {
        if (!authState.user) return false;

        const permissions = ROLE_PERMISSIONS[authState.user.role];

        // Super admin has full access
        if (permissions.includes('*')) return true;

        // Check if route is in permissions
        return permissions.includes(route);
    };

    const updateUser = (updates: Partial<User>) => {
        if (!authState.user) return;

        const updatedUser = { ...authState.user, ...updates };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));

        setAuthState(prev => ({
            ...prev,
            user: updatedUser,
        }));
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

        // Set warning timer (25 minutes)
        warningTimerRef.current = setTimeout(() => {
            setSessionWarning(true);
        }, SESSION_TIMEOUT - WARNING_TIME);

        // Set logout timer (30 minutes)  
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

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
