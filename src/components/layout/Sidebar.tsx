
import { LayoutDashboard, Package, Settings, Truck, BarChart3, Stethoscope, Brain, Shield } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface NavigationItem {
    name: string;
    href: string;
    icon: typeof LayoutDashboard;
    permission: string;
}

interface NavigationGroup {
    title: string;
    items: NavigationItem[];
}

export function Sidebar() {
    const { user, hasPermission } = useAuth();
    const location = useLocation();

    const navigationGroups: NavigationGroup[] = [
        {
            title: 'Overview',
            items: [
                { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, permission: 'dashboard' },
            ]
        },
        {
            title: 'Operations',
            items: [
                { name: 'Inventory', href: '/inventory', icon: Package, permission: 'inventory' },
                { name: 'Logistics', href: '/logistics', icon: Truck, permission: 'transfers' },
                { name: 'AI Optimizer', href: '/decisions', icon: Brain, permission: 'dashboard' },
            ]
        },
        {
            title: 'Governance',
            items: [
                { name: 'Clinical Hub', href: '/clinical', icon: Stethoscope, permission: 'clinical' },
                { name: 'Clinical Admin', href: '/clinical/admin', icon: Shield, permission: 'manage_users' },
                { name: 'Analytics', href: '/analytics', icon: BarChart3, permission: 'reports' },
            ]
        },
        {
            title: 'System',
            items: [
                { name: 'Data Generation', href: '/data-generation', icon: Brain, permission: 'inventory' },
                { name: 'Settings', href: '/settings', icon: Settings, permission: 'manage_users' },
            ]
        }
    ];

    return (
        <aside className="hidden md:flex w-20 hover:w-64 flex-col border-r border-slate-200 bg-slate-50 transition-all duration-300 ease-in-out group overflow-hidden z-[2000] shadow-sm hover:shadow-xl fixed left-0 top-0 h-full">
            <div className="flex h-16 items-center border-b border-slate-200 px-6 overflow-hidden whitespace-nowrap shrink-0">
                <img src={`${import.meta.env.BASE_URL}penn_logo.png`} alt="Penn Medicine" className="h-10 w-auto object-contain transition-all duration-300" />
                {/* <span className="text-lg font-bold text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 whitespace-nowrap">Penn Medicine</span> */}
            </div>

            <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
                <nav className="flex-1 space-y-4 p-3">
                    {navigationGroups.map((group) => {
                        const filteredItems = group.items.filter(item => !user || hasPermission(item.permission));
                        if (filteredItems.length === 0) return null;

                        return (
                            <div key={group.title} className="space-y-1">
                                <h3 className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 mb-2">
                                    {group.title}
                                </h3>
                                {filteredItems.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <NavLink
                                            key={item.name}
                                            to={item.href}
                                            className={({ isActive }: { isActive: boolean }) =>
                                                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 whitespace-nowrap group/item ${isActive
                                                    ? 'bg-primary-50 text-primary-900 shadow-sm'
                                                    : 'text-slate-600 hover:bg-white hover:shadow-sm hover:text-slate-900'
                                                } `
                                            }
                                        >
                                            <Icon className={`h-5 w-5 shrink-0 transition-colors ${item.href === location.pathname ? 'text-primary-800' : 'text-slate-500 group-hover/item:text-slate-700'} `} />
                                            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">{item.name}</span>
                                        </NavLink>
                                    );
                                })}
                            </div>
                        );
                    })}
                </nav>

                <div className="border-t border-slate-200 p-4 whitespace-nowrap bg-slate-50/50 backdrop-blur-sm shrink-0 mt-auto">
                    <div className="flex items-center gap-3 px-2 py-2 rounded-xl transition-colors hover:bg-white/60">
                        <div className="h-8 w-8 shrink-0 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center">
                            {user?.avatar ? (
                                <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                            ) : (
                                <span className="text-sm font-bold text-primary-700">{user?.name?.charAt(0)}</span>
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
