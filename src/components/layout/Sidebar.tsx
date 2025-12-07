import { LayoutDashboard, Package, Settings, Truck, BarChart3, Stethoscope, FileText, Share2, Brain } from 'lucide-react';
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
        { name: 'CPO View', href: '/cpo-overview', icon: FileText, permission: 'dashboard' },
        { name: 'AI Optimizer', href: '/decisions', icon: Brain, permission: 'dashboard' },
        { name: 'Network', href: '/network', icon: Share2, permission: 'inventory' },
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
        <aside className="hidden md:flex w-20 hover:w-64 flex-col border-r border-slate-200 bg-white transition-all duration-300 ease-in-out group overflow-hidden z-50 shadow-sm hover:shadow-xl">
            <div className="flex h-16 items-center border-b border-slate-200 px-6 overflow-hidden whitespace-nowrap">
                <div className="flex items-center gap-3 transition-all duration-300">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold">
                        S
                    </div>
                    <span className="text-lg font-bold text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">Sentria</span>
                </div>
            </div>

            <div className="flex flex-1 flex-col justify-between p-4 overflow-hidden">
                <nav className="space-y-1">
                    {filteredNavigation.map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.name}
                                to={item.href}
                                className={({ isActive }: { isActive: boolean }) =>
                                    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap ${isActive
                                        ? 'bg-indigo-50 text-indigo-600'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`
                                }
                            >
                                <Icon className="h-6 w-6 shrink-0" />
                                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">{item.name}</span>
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="border-t border-slate-200 pt-4 whitespace-nowrap">
                    <div className="flex items-center gap-3 px-2 py-2">
                        <div className="h-8 w-8 shrink-0 rounded-full overflow-hidden bg-indigo-100 flex items-center justify-center">
                            {user?.avatar ? (
                                <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                            ) : (
                                <span className="text-sm font-bold text-indigo-600">{user?.name?.charAt(0)}</span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                            <p className="text-sm font-medium text-slate-900 truncate">{user?.name}</p>
                            <p className="text-xs text-slate-500 truncate">{user?.role}</p>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
