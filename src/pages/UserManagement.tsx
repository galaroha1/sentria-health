import { useState } from 'react';
import { Users, Search, UserPlus, Edit2, Ban, RotateCw, Eye } from 'lucide-react';
import { MOCK_USERS_DB } from '../data/users/mockData';
import { UserStatus } from '../types';

export function UserManagement() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | UserStatus>('all');
    const [roleFilter, setRoleFilter] = useState<string>('all');

    // Get all users from mock database
    const allUsers = Object.values(MOCK_USERS_DB).map(record => record.user);

    // Filter users
    const filteredUsers = allUsers.filter(user => {
        const matchesSearch =
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;

        return matchesSearch && matchesStatus && matchesRole;
    });

    const activeUsers = allUsers.filter(u => u.status === UserStatus.ACTIVE).length;
    const inactiveUsers = allUsers.filter(u => u.status === UserStatus.INACTIVE).length;

    const getStatusBadge = (status: UserStatus) => {
        switch (status) {
            case UserStatus.ACTIVE:
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                        Active
                    </span>
                );
            case UserStatus.INACTIVE:
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
                        Inactive
                    </span>
                );
            case UserStatus.SUSPENDED:
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
                        Suspended
                    </span>
                );
        }
    };

    const getRoleBadge = (role: string) => {
        const colors: Record<string, string> = {
            'Super Admin': 'bg-purple-100 text-purple-700',
            'Pharmacy Manager': 'bg-blue-100 text-blue-700',
            'Procurement Officer': 'bg-teal-100 text-teal-700',
        };

        return (
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${colors[role] || 'bg-slate-100 text-slate-700'}`}>
                {role}
            </span>
        );
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return 'Never';
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
                    <p className="text-sm text-slate-500">Manage users, roles, and permissions</p>
                </div>
                <button className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
                    <UserPlus className="h-4 w-4" />
                    Add User
                </button>
            </div>

            {/* Stats */}
            <div className="grid gap-6 md:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                            <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Total Users</p>
                            <p className="text-2xl font-bold text-slate-900">{allUsers.length}</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div>
                        <p className="text-sm font-medium text-slate-500">Active Users</p>
                        <p className="text-2xl font-bold text-emerald-600">{activeUsers}</p>
                    </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div>
                        <p className="text-sm font-medium text-slate-500">Inactive Users</p>
                        <p className="text-2xl font-bold text-slate-600">{inactiveUsers}</p>
                    </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div>
                        <p className="text-sm font-medium text-slate-500">Super Admins</p>
                        <p className="text-2xl font-bold text-slate-900">
                            {allUsers.filter(u => u.role === 'Super Admin').length}
                        </p>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 p-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                            />
                        </div>
                        <div className="flex gap-2">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="suspended">Suspended</option>
                            </select>
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500"
                            >
                                <option value="all">All Roles</option>
                                <option value="Super Admin">Super Admin</option>
                                <option value="Pharmacy Manager">Pharmacy Manager</option>
                                <option value="Procurement Officer">Procurement Officer</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium text-slate-600">
                                <th className="px-4 py-3">User</th>
                                <th className="px-4 py-3">Role</th>
                                <th className="px-4 py-3">Department</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Last Login</th>
                                <th className="px-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-slate-100">
                                                {user.avatar ? (
                                                    <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                                                ) : (
                                                    <span className="text-sm font-medium text-slate-600">
                                                        {user.name.split(' ').map(n => n[0]).join('')}
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900">{user.name}</p>
                                                <p className="text-xs text-slate-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">{getRoleBadge(user.role)}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{user.department}</td>
                                    <td className="px-4 py-3">{getStatusBadge(user.status)}</td>
                                    <td className="px-4 py-3 text-xs text-slate-500">{formatDate(user.lastLogin)}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <button
                                                title="Edit User"
                                                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                title="View Activity"
                                                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                            {user.status === UserStatus.ACTIVE ? (
                                                <button
                                                    title="Deactivate User"
                                                    className="rounded p-1 text-slate-400 hover:bg-red-100 hover:text-red-600"
                                                >
                                                    <Ban className="h-4 w-4" />
                                                </button>
                                            ) : (
                                                <button
                                                    title="Reactivate User"
                                                    className="rounded p-1 text-slate-400 hover:bg-emerald-100 hover:text-emerald-600"
                                                >
                                                    <RotateCw className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredUsers.length === 0 && (
                    <div className="py-12 text-center">
                        <p className="text-sm text-slate-500">No users found matching your criteria</p>
                    </div>
                )}
            </div>
        </div>
    );
}
