import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Building2, Calendar, Edit2, Save, X } from 'lucide-react';
import { ChangePasswordModal } from '../components/auth/ChangePasswordModal';

export function Profile() {
    const { user, updateUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        department: user?.department || '',
    });

    if (!user) return null;

    const handleSave = () => {
        updateUser(formData);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setFormData({
            name: user.name,
            phone: user.phone || '',
            department: user.department,
        });
        setIsEditing(false);
    };

    return (
        <>
            <div className="mx-auto max-w-4xl">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-900">Profile Settings</h1>
                    <p className="text-sm text-slate-500">Manage your personal information and preferences</p>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="text-center">
                                <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-slate-100 ring-4 ring-slate-200">
                                    {user.avatar ? (
                                        <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <User className="h-12 w-12 text-slate-400" />
                                    )}
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">{user.name}</h3>
                                <p className="text-sm text-slate-500">{user.role}</p>
                                <div className="mt-4 inline-flex items-center gap-1 rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700">
                                    <span className="h-2 w-2 rounded-full bg-primary-600"></span>
                                    Active
                                </div>
                            </div>

                            <div className="mt-6 space-y-3 border-t border-slate-100 pt-6">
                                <div className="flex items-center gap-3 text-sm">
                                    <Mail className="h-4 w-4 text-slate-400" />
                                    <span className="text-slate-600">{user.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Building2 className="h-4 w-4 text-slate-400" />
                                    <span className="text-slate-600">{user.department}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Calendar className="h-4 w-4 text-slate-400" />
                                    <span className="text-slate-600">Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Details Card */}
                    <div className="lg:col-span-2">
                        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="mb-6 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-slate-900">Personal Information</h3>
                                {!isEditing ? (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                        Edit
                                    </button>
                                ) : (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleCancel}
                                            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                        >
                                            <X className="h-4 w-4" />
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            className="flex items-center gap-2 rounded-lg bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700"
                                        >
                                            <Save className="h-4 w-4" />
                                            Save
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Full Name</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                        />
                                    ) : (
                                        <p className="mt-1 text-slate-900">{user.name}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Email Address</label>
                                    <p className="mt-1 text-slate-500">{user.email}</p>
                                    <p className="mt-1 text-xs text-slate-400">Email cannot be changed</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Phone Number</label>
                                    {isEditing ? (
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                            placeholder="+1 (555) 123-4567"
                                        />
                                    ) : (
                                        <p className="mt-1 text-slate-900">{user.phone || 'Not set'}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Department</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={formData.department}
                                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                        />
                                    ) : (
                                        <p className="mt-1 text-slate-900">{user.department}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Role</label>
                                    <p className="mt-1 text-slate-900">{user.role}</p>
                                    <p className="mt-1 text-xs text-slate-400">Role is assigned by system administrators</p>
                                </div>
                            </div>
                        </div>

                        {/* Account Settings */}
                        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h3 className="mb-4 text-lg font-bold text-slate-900">Account Settings</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-4">
                                    <div>
                                        <p className="font-medium text-slate-900">Password</p>
                                        <p className="text-sm text-slate-500">Last changed 3 months ago</p>
                                    </div>
                                    <button
                                        onClick={() => setShowPasswordModal(true)}
                                        className="text-sm font-medium text-primary-600 hover:text-primary-700"
                                    >
                                        Change
                                    </button>
                                </div>
                                <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-4">
                                    <div>
                                        <p className="font-medium text-slate-900">Two-Factor Authentication</p>
                                        <p className="text-sm text-slate-500">Add an extra layer of security</p>
                                    </div>
                                    <button className="text-sm font-medium text-primary-600 hover:text-primary-700">
                                        Enable
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ChangePasswordModal
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
            />
        </>
    );
}
