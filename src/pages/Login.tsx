import { useState } from 'react';
import { Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle } from 'lucide-react';

const REMEMBER_ME_KEY = 'sentria_remember_me';

export function Login() {
    const { login, signup, isAuthenticated } = useAuth();
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
    // useEffect(() => {
    //     if (isLoading && !useAuthLoading && !isAuthenticated) {
    //         setError('Login successful, but failed to load user profile. Please check your Firestore Security Rules or network connection.');
    //         setIsLoading(false);
    //     }
    // }, [useAuthLoading, isAuthenticated, isLoading]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Add 3 second buffer as requested
        await new Promise(resolve => setTimeout(resolve, 3000));

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



    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 via-slate-50 to-secondary-50 px-4">
            <div className="w-full max-w-md">
                <div className="mb-8 text-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <img src="/penn_logo.png" alt="Penn Medicine" className="h-16 mx-auto mb-4 object-contain" />
                    {/* <h1 className="text-3xl font-bold text-primary-800">Penn Medicine</h1> */}
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                        Supply Chain Intelligence Platform
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
                                placeholder="you@pennmedicine.upenn.edu"
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
                            className="w-full rounded-lg bg-primary-800 px-4 py-3 text-sm font-semibold text-white hover:bg-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-800 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                </div>
            </div>
        </div>
    );
}
