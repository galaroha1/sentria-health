
import {
    LayoutDashboard,
    Package,
    Truck,
    BarChart3,
    Settings,
    Stethoscope,
    FileText,
    Share2,
    Brain
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface NavigationItem {
    name: string;
    href: string;
    icon: typeof LayoutDashboard;
    permission: string;
    isFab?: boolean;
}

export function MobileNav() {
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
        { name: 'More', href: '/settings', icon: Settings, permission: 'manage_users' },
    ];

    // Filter navigation based on user permissions
    const filteredNavigation = navigation.filter(item => {
        if (!user) return false;
        return hasPermission(item.permission);
    });

    // Limit to 5 items for mobile nav to fit well
    const displayNavigation = filteredNavigation.slice(0, 5);

    return (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white pb-safe md:hidden">
            <div className="flex items-center justify-around p-2">
                {displayNavigation.map((item) => {
                    const Icon = item.icon;

                    if (item.isFab) {
                        return (
                            <div key={item.name} className="relative -top-5">
                                <button className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-200 transition-transform active:scale-95">
                                    <Icon className="h-6 w-6" />
                                </button>
                            </div>
                        );
                    }

                    return (
                        <NavLink
                            key={item.name}
                            to={item.href}
                            className={({ isActive }: { isActive: boolean }) =>
                                `flex flex - col items - center gap - 1 p - 2 text - [10px] font - medium transition - colors ${isActive
                                    ? 'text-indigo-600'
                                    : 'text-slate-500'
                                } `
                            }
                        >
                            <Icon className="h-6 w-6" />
                            {item.name}
                        </NavLink>
                    );
                })}
            </div>
        </div>
    );
}
