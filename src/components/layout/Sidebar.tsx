import { LayoutDashboard, Package, Settings, Truck, BarChart3, Stethoscope } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface NavigationItem {
    name: string;
    href: string;
    icon: typeof LayoutDashboard;
    permission: string;
}

export function Sidebar() {
    const { user, hasPermission } = useAuth();

    const navigation: NavigationItem[] = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, permission: 'dashboard' },
        { name: 'Inventory', href: '/inventory', icon: Package, permission: 'inventory' },
        { name: 'Clinical', href: '/clinical', icon: Stethoscope, permission: 'inventory' },
        { name: 'Logistics', href: '/logistics', icon: Truck, permission: 'transfers' },
        { name: 'Analytics', href: '/analytics', icon: BarChart3, permission: 'reports' },
        { name: 'Settings', href: '/settings', icon: Settings, permission: 'manage_users' },
    ];

    // Filter navigation based on user permissions
    const filteredNavigation = navigation.filter(item => {
        if (!user) return false;
        return hasPermission(item.permission);
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
                                className={({ isActive }: { isActive: boolean }) =>
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

                <div className="border-t border-slate-200 pt-4">
                    <div className="flex items-center gap-3 px-3 py-2">
                        <div className="h-8 w-8 shrink-0 rounded-full overflow-hidden bg-indigo-100 flex items-center justify-center">
                            {user?.avatar ? (
                                <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                            ) : (
                                <span className="text-sm font-bold text-indigo-600">{user?.name?.charAt(0)}</span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{user?.name}</p>
                            <p className="text-xs text-slate-500 truncate">{user?.role}</p>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
