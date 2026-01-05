import { Search, User, ShoppingCart, LogOut, Settings as SettingsIcon, UserCircle, Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { NotificationCenter } from '../notifications/NotificationCenter';

interface HeaderProps {
    onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
    const { itemCount } = useCart();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowProfileMenu(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed', error);
            navigate('/login'); // Force navigation anyway
        }
    };

    return (
        <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur-sm">
            <div className="flex flex-1 items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="mr-2 rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
                >
                    <Menu className="h-6 w-6" />
                </button>
                <div className="relative w-full max-w-md hidden sm:block">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search inventory, orders, or vendors..."
                        className="h-10 w-full rounded-full border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <Link to="/cart" className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700">
                    <motion.div
                        key={itemCount}
                        initial={{ scale: 1 }}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.3 }}
                    >
                        <ShoppingCart className="h-5 w-5" />
                    </motion.div>
                    {itemCount > 0 && (
                        <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary-600 text-[10px] font-bold text-white">
                            {itemCount}
                        </span>
                    )}
                </Link>

                <NotificationCenter />

                <div className="h-8 w-px bg-slate-200"></div>

                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        className="flex items-center gap-3 rounded-lg px-2 py-1 hover:bg-slate-100 transition-colors"
                    >
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-slate-900">{user?.name || 'User'}</p>
                            <p className="text-xs text-slate-500">{user?.role || 'Role'}</p>
                        </div>
                        <div className="h-10 w-10 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center border border-primary-200">
                            {user?.avatar ? (
                                <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                            ) : (
                                <User className="h-5 w-5 text-primary-600" />
                            )}
                        </div>
                    </button>

                    {showProfileMenu && (
                        <div className="absolute right-0 mt-2 w-56 rounded-lg border border-slate-200 bg-white shadow-lg py-1 z-50">
                            <div className="px-4 py-3 border-b border-slate-100">
                                <p className="text-sm font-medium text-slate-900">{user?.name}</p>
                                <p className="text-xs text-slate-500">{user?.email}</p>
                            </div>
                            <Link
                                to="/profile"
                                onClick={() => setShowProfileMenu(false)}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                            >
                                <UserCircle className="h-4 w-4" />
                                View Profile
                            </Link>
                            <Link
                                to="/profile"
                                onClick={() => setShowProfileMenu(false)}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                            >
                                <SettingsIcon className="h-4 w-4" />
                                Settings
                            </Link>
                            <div className="border-t border-slate-100 my-1"></div>
                            <button
                                onClick={handleLogout}
                                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                                <LogOut className="h-4 w-4" />
                                Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
