import { useState, useEffect } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, AlertCircle } from 'lucide-react';

const REMEMBER_ME_KEY = 'sentria_remember_me';

export function Login() {
    const navigate = useNavigate();
    const { login, isAuthenticated } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Load saved credentials on mount
    useEffect(() => {
        const savedCreds = localStorage.getItem(REMEMBER_ME_KEY);
        if (savedCreds) {
            try {
                const { email: savedEmail, rememberMe: wasRemembered } = JSON.parse(savedCreds);
                if (wasRemembered) {
                    setEmail(savedEmail);
                    setRememberMe(true);
                }
            } catch (error) {
                console.error('Failed to load saved credentials:', error);
            }
        }
    }, []);

    // Redirect if already authenticated
    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const result = await login({ email, password });

        if (result.success) {
            // Save email if remember me is checked
            if (rememberMe) {
                localStorage.setItem(REMEMBER_ME_KEY, JSON.stringify({ email, rememberMe: true }));
            } else {
                localStorage.removeItem(REMEMBER_ME_KEY);
            }
            navigate('/', { replace: true });
        } else {
            setError(result.error || 'Login failed');
            setIsLoading(false);
        }
    };

    const quickFill = (role: 'admin' | 'pharmacy' | 'procurement') => {
        const credentials = {
            admin: { email: 'admin@sentria.health', password: 'admin123' },
            pharmacy: { email: 'pharmacy@sentria.health', password: 'pharmacy123' },
            procurement: { email: 'procurement@sentria.health', password: 'procurement123' },
        };
        setEmail(credentials[role].email);
        setPassword(credentials[role].password);
        setError('');
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 via-slate-50 to-secondary-50 px-4">
            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-600 shadow-lg">
                        <ShieldCheck className="h-10 w-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900">Sentria Health</h1>
                    <p className="mt-2 text-sm text-slate-600">Sign in to your account</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-100">
                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                <span>{error}</span>
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
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                                />
                                <span className="text-sm text-slate-600">Remember me</span>
                            </label>
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
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-6 border-t border-slate-200 pt-6">
                        <p className="mb-3 text-xs font-semibold text-slate-700">Demo Access Levels:</p>
                        <div className="space-y-3">
                            <button
                                type="button"
                                onClick={() => quickFill('admin')}
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-left hover:bg-slate-100 hover:border-slate-300 transition-all"
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
                                onClick={() => quickFill('pharmacy')}
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-left hover:bg-slate-100 hover:border-slate-300 transition-all"
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
                                onClick={() => quickFill('procurement')}
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-left hover:bg-slate-100 hover:border-slate-300 transition-all"
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
