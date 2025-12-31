import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { type User, UserRole, UserStatus } from '../../../../types';

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (user: Omit<User, 'id' | 'createdAt' | 'lastLogin' | 'createdBy'>) => void;
    initialData?: User;
    isEditing?: boolean;
}

export function UserModal({ isOpen, onClose, onSave, initialData, isEditing = false }: UserModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'Pharmacy Manager' as UserRole,
        department: '',
        status: 'active' as UserStatus,
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData && isEditing) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setFormData({
                    name: initialData.name,
                    email: initialData.email,
                    role: initialData.role as UserRole,
                    department: initialData.department,
                    status: initialData.status as UserStatus,
                });
            } else {
                setFormData({
                    name: '',
                    email: '',
                    role: 'Pharmacy Manager' as UserRole,
                    department: '',
                    status: 'active' as UserStatus,
                });
            }
        }
    }, [initialData, isEditing, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...formData,
            // Preserve existing fields if editing, though onSave expects Omit<User...>
            // The parent handler will merge these with existing ID if editing
            avatar: initialData?.avatar,
            phone: initialData?.phone,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-200 p-4">
                    <h2 className="text-lg font-semibold text-slate-900">
                        {isEditing ? 'Edit User' : 'Add New User'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4">
                    <div className="space-y-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">
                                Full Name
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                                placeholder="John Doe"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">
                                Email Address
                            </label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                                placeholder="john@example.com"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">
                                Role
                            </label>
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                            >
                                <option value="Super Admin">Super Admin</option>
                                <option value="Pharmacy Manager">Pharmacy Manager</option>
                                <option value="Procurement Officer">Procurement Officer</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">
                                Department
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.department}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                                placeholder="e.g. Pharmacy Services"
                            />
                        </div>

                        {isEditing && (
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700">
                                    Status
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as UserStatus })}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="suspended">Suspended</option>
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
                        >
                            {isEditing ? 'Save Changes' : 'Add User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
