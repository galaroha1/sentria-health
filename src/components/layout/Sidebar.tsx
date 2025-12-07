import { useState } from 'react';
import { LayoutDashboard, Package, Settings, X, Zap, Truck } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import { useAuth } from '../../context/AuthContext';

interface NavigationItem {
    name: string;
    href: string;
    icon: typeof LayoutDashboard;
    requirePermission: string;
}

const navigation: NavigationItem[] = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard, requirePermission: 'dashboard' },
    { name: 'Inventory', href: '/inventory', icon: Package, requirePermission: 'inventory' },
    { name: 'Logistics', href: '/logistics', icon: Truck, requirePermission: 'transfers' }, // Using Truck for Logistics
    { name: 'Analytics', href: '/decisions', icon: Zap, requirePermission: 'inventory' }, // Decisions -> Analytics
    { name: 'Settings', href: '/admin', icon: Settings, requirePermission: 'manage_users' }, // Admin -> Settings (or keep separate?) - Request asked for [Dashboard, Inventory, Logistics, Analytics, Settings]
    // The user request said: "Sidebar: [Dashboard, Inventory, Logistics, Analytics, Settings]"
    // Existing "Decisions" seems to map to "Analytics".
    // Existing "Admin" or "Profile" could be "Settings". The mockup usually puts Settings at the bottom.
    // Let's map "Decisions" to "Analytics" and keep "Settings" as the bottom link (which is already there in the component, but maybe I should add it to the main list if requested, or just rely on the bottom link).
    // The bottom link in the existing code is "Settings" pointing to "/profile".
export function Sidebar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, permission: 'view_dashboard' },
        { name: 'Inventory', href: '/inventory', icon: Package, permission: 'inventory' },
        { name: 'Logistics', href: '/logistics', icon: Truck, permission: 'transfers' },
        { name: 'Analytics', href: '/analytics', icon: BarChart3, permission: 'view_analytics' },
        { name: 'Settings', href: '/settings', icon: Settings, permission: 'manage_users' },
    ];

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Failed to log out', error);
        }
    };

    // Filter navigation based on user permissions
    const filteredNavigation = navigation.filter(item => {
        if (!user) return false;
        // If user is admin, show everything
        if (user.role === 'admin') return true;
        // Check specific permission
        return user.permissions.includes(item.permission as any);
    });

    return (
        <aside className="hidden md:flex w-64 flex-col border-r border-slate-200 bg-white">
            <div className="flex h-16 items-center border-b border-slate-200 px-6">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold">
                        S
                    </div>
                    <span className="text-lg font-bold text-slate-900">Sentria</span>
                </div>
            </div>

            <div className="flex flex-1 flex-col justify-between p-4">
                <nav className="space-y-1">
                    {filteredNavigation.map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.name}
                                to={item.href}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive
                                        ? 'bg-indigo-50 text-indigo-600'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`
                                }
                            >
                                <Icon className="h-5 w-5" />
                                {item.name}
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="border-t border-slate-800 p-4 overflow-hidden whitespace-nowrap">
                    <div className="flex items-center gap-3 px-3 py-2">
                        <div className="h-8 w-8 shrink-0 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center">
                            {user?.avatar ? (
                                <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                            ) : (
                                <span className="text-sm font-bold text-primary-600">{user?.name.charAt(0)}</span>
                            )}
                        </div>
                        <div className={clsx(
                            "flex-1 min-w-0 transition-opacity duration-300",
                            isHovered ? "opacity-100" : "opacity-0 w-0 hidden"
                        )}>
                            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                            <p className="text-xs text-slate-400 truncate">{user?.role}</p>
                        </div>
                    </div>
                    <Link
                        to="/profile"
                        className="group mt-2 flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors whitespace-nowrap"
                    >
                        <Settings className="h-5 w-5 shrink-0 text-slate-400 group-hover:text-white" />
                        <span className={clsx(
                            "ml-3 transition-opacity duration-300",
                            isHovered ? "opacity-100" : "opacity-0 w-0 hidden"
                        )}>
                            Settings
                        </span>
                    </Link>
                </div>
            </div>
        </>
    );
}
