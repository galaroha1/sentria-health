import { LayoutDashboard, ShoppingCart, Package, Users, Settings, X, ArrowRightLeft, MapPin } from 'lucide-react';
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
    { name: 'Marketplace', href: '/marketplace', icon: ShoppingCart, requirePermission: 'marketplace' },
    { name: 'Inventory', href: '/inventory', icon: Package, requirePermission: 'inventory' },
    { name: 'Transfers', href: '/transfers', icon: ArrowRightLeft, requirePermission: 'transfers' },
    { name: 'Locations', href: '/locations', icon: MapPin, requirePermission: 'locations' },
    { name: 'Users', href: '/users', icon: Users, requirePermission: 'dashboard' },
    { name: 'Vendors', href: '/vendors', icon: Users, requirePermission: 'vendors' },

];

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const location = useLocation();
    const { hasPermission, user } = useAuth();

    // Filter navigation items based on user permissions
    const visibleNavigation = navigation.filter(item => hasPermission(item.requirePermission));

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-20 bg-slate-900/50 backdrop-blur-sm lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div
                className={clsx(
                    "fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-slate-900 text-white transition-transform duration-300 lg:static lg:translate-x-0",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex h-16 items-center px-6">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 shrink-0 rounded-lg bg-primary-500 flex items-center justify-center">
                            <span className="text-xl font-bold text-white">S</span>
                        </div>
                        <span className="text-xl font-bold">Sentria</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="ml-auto lg:hidden text-slate-400 hover:text-white"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <nav className="flex-1 space-y-1 px-3 py-4">
                    {visibleNavigation.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                onClick={onClose}
                                className={clsx(
                                    'group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                    isActive
                                        ? 'bg-primary-600 text-white'
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                )}
                            >
                                <item.icon className={clsx('h-5 w-5 shrink-0 transition-colors', isActive ? 'text-white' : 'text-slate-400 group-hover:text-white')} />
                                <span className="ml-3">
                                    {item.name}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="border-t border-slate-800 p-4">
                    <div className="flex items-center gap-3 px-3 py-2">
                        <div className="h-8 w-8 shrink-0 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center">
                            {user?.avatar ? (
                                <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                            ) : (
                                <span className="text-sm font-bold text-primary-600">{user?.name.charAt(0)}</span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                            <p className="text-xs text-slate-400 truncate">{user?.role}</p>
                        </div>
                    </div>
                    <Link
                        to="/profile"
                        className="group mt-2 flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                        <Settings className="h-5 w-5 shrink-0 text-slate-400 group-hover:text-white" />
                        <span className="ml-3">
                            Settings
                        </span>
                    </Link>
                </div>
            </div>
        </>
    );
}
