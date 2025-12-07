import {
    LayoutDashboard,
    Package,
    Truck,
    BarChart3,
    Settings,
    Scan
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function MobileNav() {
    const { user } = useAuth();

    const navigation = [
        { name: 'Home', href: '/dashboard', icon: LayoutDashboard, permission: 'view_dashboard' },
        { name: 'Stock', href: '/inventory', icon: Package, permission: 'inventory' },
        { name: 'Map', href: '/logistics', icon: Truck, permission: 'transfers' },
        { name: 'Data', href: '/analytics', icon: BarChart3, permission: 'view_analytics' },
        { name: 'More', href: '/settings', icon: Settings, permission: 'manage_users' },
    ];

    // Filter navigation based on user permissions
    const filteredNavigation = navigation.filter(item => {
        if (!user) return false;
        if (user.role === 'admin') return true;
        return user.permissions.includes(item.permission as any);
    });

    return (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white pb-safe md:hidden">
            <div className="relative flex items-center justify-around p-2">
                {filteredNavigation.map((item, index) => {
                    // Insert FAB in the middle
                    if (index === 2) {
                        return (
                            <div key="scan-fab" className="relative -top-6">
                                <button className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-200 transition-transform active:scale-95">
                                    <Scan className="h-6 w-6" />
                                </button>
                            </div>
                        );
                    }

                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.name}
                            to={item.href}
                            className={({ isActive }) =>
                                `flex flex-col items-center gap-1 p-2 text-[10px] font-medium transition-colors ${isActive
                                    ? 'text-indigo-600'
                                    : 'text-slate-500'
                                }`
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
