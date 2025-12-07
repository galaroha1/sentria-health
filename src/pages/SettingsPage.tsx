import { User, Bell, Lock, Globe, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ApiManager } from '../components/admin/ApiManager';
import { UserRole } from '../types';

import { useNavigate } from 'react-router-dom';

export function Settings() {
    const { user } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="max-w-4xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
                <p className="text-slate-600">Manage your account and application preferences.</p>
            </div>

            {/* SUPER ADMIN ONLY: System API Manager */}
            {user?.role === UserRole.SUPER_ADMIN && (
                <div className="animate-fade-in-up">
                    <ApiManager />
                </div>
            )}

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="divide-y divide-slate-100">
                    {[
                        { title: 'Profile Information', description: 'Update your photo and personal details.', icon: User },
                        { title: 'Notifications', description: 'Choose what updates you want to receive.', icon: Bell },
                        { title: 'Security', description: 'Manage your password and 2FA settings.', icon: Lock },
                        { title: 'Language & Region', description: 'Set your preferred language and timezone.', icon: Globe },
                        { title: 'Privacy', description: 'Control how your data is used and shared.', icon: Shield },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-4 p-6 hover:bg-slate-50 cursor-pointer transition-colors">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                                <item.icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-medium text-slate-900">{item.title}</h3>
                                <p className="text-sm text-slate-500">{item.description}</p>
                            </div>
                            <button
                                onClick={() => {
                                    if (item.title === 'Profile Information') {
                                        navigate('/profile');
                                    } else {
                                        // Placeholder feedback
                                        alert(`${item.title} management coming in next release.`);
                                    }
                                }}
                                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-white hover:text-slate-900 active:bg-slate-50 transition-colors"
                            >
                                Manage
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
