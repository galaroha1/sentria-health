import { useState } from 'react';
import { User, Bell, Lock, Globe, Shield, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SystemSettings } from '../features/admin/components/SystemSettings';
import { UserRole } from '../types';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { InviteUserModal } from '../features/admin/components/InviteUserModal';

export function Settings() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

    // UI State
    const [expandedSection, setExpandedSection] = useState<string | null>(null);

    // Mock Settings State
    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        sms: false,
        marketing: false
    });

    const [security, setSecurity] = useState({
        twoFactor: true,
        sessionTimeout: '15m'
    });

    const toggleSection = (section: string) => {
        if (expandedSection === section) {
            setExpandedSection(null);
        } else {
            setExpandedSection(section);
        }
    };

    const handleNotificationChange = (key: keyof typeof notifications) => {
        setNotifications(prev => {
            const newState = { ...prev, [key]: !prev[key] };
            toast.success('Notification preferences updated');
            return newState;
        });
    };

    return (
        <div className="max-w-4xl space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
                    <p className="text-slate-600">Manage your account and application preferences.</p>
                </div>
                {user?.role === UserRole.SUPER_ADMIN && (
                    <button
                        onClick={() => setIsInviteModalOpen(true)}
                        className="bg-primary-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-900 transition-colors flex items-center gap-2"
                    >
                        <User className="h-4 w-4" />
                        Invite New User
                    </button>
                )}
            </div>

            {/* SUPER ADMIN ONLY: System API Manager & Danger Zone */}
            {user?.role === UserRole.SUPER_ADMIN && (
                <div className="animate-fade-in-up">
                    <SystemSettings />
                </div>
            )}

            <InviteUserModal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} />

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="divide-y divide-slate-100">

                    {/* Profile Information (Navigates Away) */}
                    <div className="flex items-center gap-4 p-6 hover:bg-slate-50 cursor-pointer transition-colors" onClick={() => navigate('/profile')}>
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                            <User className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-medium text-slate-900">Profile Information</h3>
                            <p className="text-sm text-slate-500">Update your photo and personal details.</p>
                        </div>
                        <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-white">
                            Manage
                        </button>
                    </div>

                    {/* Notifications (Expandable) */}
                    <div className="bg-white">
                        <div
                            className="flex items-center gap-4 p-6 hover:bg-slate-50 cursor-pointer transition-colors"
                            onClick={() => toggleSection('notifications')}
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                                <Bell className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-medium text-slate-900">Notifications</h3>
                                <p className="text-sm text-slate-500">Choose what updates you want to receive.</p>
                            </div>
                            {expandedSection === 'notifications' ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
                        </div>

                        {expandedSection === 'notifications' && (
                            <div className="px-6 pb-6 pl-[4.5rem] space-y-4 animate-in slide-in-from-top-2 duration-200">
                                <div className="space-y-3">
                                    {[
                                        { id: 'email', label: 'Email Notifications', desc: 'Receive daily summaries and critical alerts via email.' },
                                        { id: 'push', label: 'Push Notifications', desc: 'Real-time alerts on your device.' },
                                        { id: 'sms', label: 'SMS Alerts', desc: 'Text messages for urgent security incidents.' },
                                        { id: 'marketing', label: 'Product Updates', desc: 'News about feature releases and improvements.' }
                                    ].map(item => (
                                        <label key={item.id} className="flex items-start gap-3 cursor-pointer group">
                                            <div className="relative flex items-center">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={notifications[item.id as keyof typeof notifications]}
                                                    onChange={() => handleNotificationChange(item.id as keyof typeof notifications)}
                                                />
                                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                                            </div>
                                            <div>
                                                <span className="block text-sm font-medium text-slate-900 group-hover:text-blue-700">{item.label}</span>
                                                <span className="block text-xs text-slate-500">{item.desc}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Security (Expandable) */}
                    <div className="bg-white">
                        <div
                            className="flex items-center gap-4 p-6 hover:bg-slate-50 cursor-pointer transition-colors"
                            onClick={() => toggleSection('security')}
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                                <Lock className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-medium text-slate-900">Security</h3>
                                <p className="text-sm text-slate-500">Manage your password and 2FA settings.</p>
                            </div>
                            {expandedSection === 'security' ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
                        </div>

                        {expandedSection === 'security' && (
                            <div className="px-6 pb-6 pl-[4.5rem] space-y-4 animate-in slide-in-from-top-2 duration-200">
                                <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border border-slate-100">
                                    <div>
                                        <p className="font-medium text-slate-900">Two-Factor Authentication</p>
                                        <p className="text-sm text-slate-500">Add an extra layer of security to your account.</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setSecurity(prev => ({ ...prev, twoFactor: !prev.twoFactor }));
                                            toast.success(`2FA ${!security.twoFactor ? 'Enabled' : 'Disabled'}`);
                                        }}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${security.twoFactor ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                                    >
                                        {security.twoFactor ? 'Enabled' : 'Enable'}
                                    </button>
                                </div>
                                <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border border-slate-100">
                                    <div>
                                        <p className="font-medium text-slate-900">Session Timeout</p>
                                        <p className="text-sm text-slate-500">Automatically lock screen after inactivity.</p>
                                    </div>
                                    <select
                                        value={security.sessionTimeout}
                                        onChange={(e) => setSecurity(prev => ({ ...prev, sessionTimeout: e.target.value }))}
                                        className="rounded-md border-slate-200 text-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="15m">15 minutes</option>
                                        <option value="30m">30 minutes</option>
                                        <option value="1h">1 hour</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Language (Placeholder with Toast) */}
                    <div className="flex items-center gap-4 p-6 hover:bg-slate-50 cursor-pointer transition-colors" onClick={() => toast.success('Language settings saved (En-US)')}>
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                            <Globe className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-medium text-slate-900">Language & Region</h3>
                            <p className="text-sm text-slate-500">English (US) • Eastern Time</p>
                        </div>
                        <div className="text-slate-400">
                            <Check className="h-4 w-4" />
                        </div>
                    </div>

                    {/* Privacy (Placeholder with Toast) */}
                    <div className="flex items-center gap-4 p-6 hover:bg-slate-50 cursor-pointer transition-colors" onClick={() => toast.success('Privacy policy displayed')}>
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                            <Shield className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-medium text-slate-900">Privacy</h3>
                            <p className="text-sm text-slate-500">Control how your data is used.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
