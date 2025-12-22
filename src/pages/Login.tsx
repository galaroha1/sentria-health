import { useState, useEffect } from 'react';
import { Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, AlertCircle } from 'lucide-react';

const REMEMBER_ME_KEY = 'sentria_remember_me';

export function Login() {
    const { login, signup, isAuthenticated, isLoading: useAuthLoading } = useAuth();
    const location = useLocation();

    // Redirect if already authenticated
    if (isAuthenticated) {
        const from = (location.state as any)?.from?.pathname || '/dashboard';
        return <Navigate to={from} replace />;
    }
    // Initialize state from localStorage
    const [email, setEmail] = useState(() => {
        try {
            const savedCreds = localStorage.getItem(REMEMBER_ME_KEY);
            if (savedCreds) {
                const { email: savedEmail, rememberMe: wasRemembered } = JSON.parse(savedCreds);
                if (wasRemembered) return savedEmail;
            }
        } catch (error) {
            console.error('Failed to load saved credentials:', error);
        }
        return '';
    });

    const [rememberMe, setRememberMe] = useState(() => {
        try {
            const savedCreds = localStorage.getItem(REMEMBER_ME_KEY);
            if (savedCreds) {
                const { rememberMe: wasRemembered } = JSON.parse(savedCreds);
                return !!wasRemembered;
            }
        } catch (error) {
            console.error('Failed to load saved credentials:', error);
        }
        return false;
    });

    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);



    // Watch for auth state changes to handle errors during login
    // If we are locally loading (waiting for login), but global auth finishes loading and we are NOT authenticated,
    // it means the login succeeded but the profile load failed (e.g. Firestore permissions).
    useEffect(() => {
        if (isLoading && !useAuthLoading && !isAuthenticated) {
            setError('Login successful, but failed to load user profile. Please check your Firestore Security Rules or network connection.');
            setIsLoading(false);
        }
    }, [useAuthLoading, isAuthenticated, isLoading]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        let result;
        if (isLogin) {
            result = await login({ email, password });
        } else {
            result = await signup({ email, password }, name);
        }

        if (result.success) {
            // Do nothing, wait for isAuthenticated to trigger redirect
            // Keep isLoading true to show progress
        } else {
            setError(result.error || (isLogin ? 'Login failed' : 'Sign up failed'));
            setIsLoading(false);
        }
    };

    const DEMO_CREDENTIALS = {
        admin: { email: 'admin@sentria.health', password: 'admin123', name: 'Super Admin' },
        pharmacy: { email: 'pharmacy@sentria.health', password: 'pharmacy123', name: 'Pharmacy Manager' },
        procurement: { email: 'procurement@sentria.health', password: 'procurement123', name: 'Procurement Officer' },
    };

    const handleDemoLogin = async (role: keyof typeof DEMO_CREDENTIALS) => {
        const creds = DEMO_CREDENTIALS[role];
        setIsLoading(true);
        setError('');

        // Try login first
        let result = await login({ email: creds.email, password: creds.password });

        if (result.success) {
            // Do nothing, wait for isAuthenticated to trigger redirect
            return;
        }

        console.log('Login failed:', result.error, result.code);

        // If login failed, it might be because the user doesn't exist (auth/user-not-found)
        // or because the password is wrong (auth/wrong-password).
        // If it's wrong password, we shouldn't try to signup (it will fail with email-already-in-use).

        if (result.code === 'auth/wrong-password') {
            setError('Incorrect password for this demo account. If you changed it, please sign in manually.');
            setIsLoading(false);
            return;
        }

        // For other errors (like user-not-found), try to create the account
        console.log('Attempting to create demo account...');
        const signupResult = await signup({ email: creds.email, password: creds.password }, creds.name);

        if (signupResult.success) {
            // Do nothing, wait for isAuthenticated to trigger redirect
        } else {
            console.error('Signup failed:', signupResult.error, signupResult.code);

            if (signupResult.code === 'auth/email-already-in-use') {
                setError('Account exists but password incorrect. Please sign in manually.');
            } else {
                setError(signupResult.error || 'Failed to access demo account');
            }
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 via-slate-50 to-secondary-50 px-4">
            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-600 shadow-lg">
                        <ShieldCheck className="h-10 w-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900">Sentria Health</h1>
                    <p className="mt-2 text-sm text-slate-600">
                        {isLogin ? 'Sign in to your account' : 'Create a new account'}
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-100">
                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {!isLogin && (
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                                    Full Name
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                    placeholder="John Doe"
                                />
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                placeholder="you@sentria.health"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            {isLogin && (
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                                    />
                                    <span className="text-sm text-slate-600">Remember me</span>
                                </label>
                            )}
                            <Link
                                to="/forgot-password"
                                className="text-sm font-medium text-primary-600 hover:text-primary-700"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isLoading ? (isLogin ? 'Signing in...' : 'Creating Account...') : (isLogin ? 'Sign In' : 'Create Account')}
                        </button>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsLogin(!isLogin);
                                    setError('');
                                }}
                                className="text-sm font-medium text-primary-600 hover:text-primary-700"
                            >
                                {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 border-t border-slate-200 pt-6">
                        <p className="mb-3 text-xs font-semibold text-slate-700">One-Click Demo Access:</p>
                        <div className="space-y-3">
                            <button
                                type="button"
                                onClick={() => handleDemoLogin('admin')}
                                disabled={isLoading}
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-left hover:bg-slate-100 hover:border-slate-300 transition-all disabled:opacity-50"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">Super Admin</p>
                                        <p className="mt-1 text-xs text-slate-600">
                                            Full system access - manage all features, users, inventory, vendors, and reports
                                        </p>
                                    </div>
                                    <span className="ml-2 rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">All</span>
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDemoLogin('pharmacy')}
                                disabled={isLoading}
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-left hover:bg-slate-100 hover:border-slate-300 transition-all disabled:opacity-50"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">Pharmacy Manager</p>
                                        <p className="mt-1 text-xs text-slate-600">
                                            Manage inventory, track stock levels, approve transfers, and oversee vendor relationships
                                        </p>
                                    </div>
                                    <span className="ml-2 rounded-full bg-teal-100 px-2 py-0.5 text-xs font-medium text-teal-700">Ops</span>
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDemoLogin('procurement')}
                                disabled={isLoading}
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-left hover:bg-slate-100 hover:border-slate-300 transition-all disabled:opacity-50"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">Procurement Officer</p>
                                        <p className="mt-1 text-xs text-slate-600">
                                            Purchase from marketplace, manage orders, track procurement analytics and cost savings
                                        </p>
                                    </div>
                                    <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">Buy</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                <p className="mt-4 text-center text-xs text-slate-500">
                    Demo credentials are auto-filled when you click a role button
                </p>
            </div>
        </div>
    );
}
