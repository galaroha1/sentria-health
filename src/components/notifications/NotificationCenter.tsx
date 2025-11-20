import { useState } from 'react';
import { Bell, X, AlertTriangle, CheckCircle2, Info, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import type { Notification } from '../../types/notification';
import { useApp } from '../../context/AppContext';

export function NotificationCenter() {
    const [isOpen, setIsOpen] = useState(false);
    const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useApp();
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const navigate = useNavigate();

    const unreadCount = notifications.filter(n => !n.read).length;
    const filteredNotifications = filter === 'unread'
        ? notifications.filter(n => !n.read)
        : notifications;

    const handleNotificationClick = (notification: Notification) => {
        markNotificationAsRead(notification.id);
        if (notification.actionUrl) {
            navigate(notification.actionUrl);
            setIsOpen(false);
        } else if (notification.link) {
            navigate(notification.link);
            setIsOpen(false);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'critical':
                return <AlertTriangle className="h-5 w-5 text-red-500" />;
            case 'warning':
                return <AlertTriangle className="h-5 w-5 text-amber-500" />;
            case 'success':
                return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
            default:
                return <Info className="h-5 w-5 text-blue-500" />;
        }
    };

    return (
        <div className="relative">
            {/* Bell Icon */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-30"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Panel */}
                    <div className="absolute right-0 top-full z-40 mt-2 w-96 rounded-xl border border-slate-200 bg-white shadow-2xl">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-slate-200 p-4">
                            <div>
                                <h3 className="font-bold text-slate-900">Notifications</h3>
                                <p className="text-xs text-slate-500">{unreadCount} unread</p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Filter Tabs */}
                        <div className="flex gap-2 border-b border-slate-200 px-4 py-2">
                            <button
                                onClick={() => setFilter('all')}
                                className={`rounded-lg px-3 py-1 text-sm font-medium ${filter === 'all'
                                    ? 'bg-slate-900 text-white'
                                    : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setFilter('unread')}
                                className={`rounded-lg px-3 py-1 text-sm font-medium ${filter === 'unread'
                                    ? 'bg-slate-900 text-white'
                                    : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                            >
                                Unread ({unreadCount})
                            </button>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllNotificationsAsRead}
                                    className="ml-auto text-xs text-primary-600 hover:text-primary-700"
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>

                        {/* Notifications List */}
                        <div className="max-h-96 overflow-y-auto">
                            {filteredNotifications.length === 0 ? (
                                <div className="p-8 text-center">
                                    <Bell className="mx-auto h-12 w-12 text-slate-300" />
                                    <p className="mt-2 text-sm text-slate-500">No notifications</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {filteredNotifications.map((notification) => (
                                        <button
                                            key={notification.id}
                                            onClick={() => handleNotificationClick(notification)}
                                            className={`w-full p-4 text-left transition-colors hover:bg-slate-50 ${!notification.read ? 'bg-blue-50/50' : ''
                                                }`}
                                        >
                                            <div className="flex gap-3">
                                                <div className="flex-shrink-0">
                                                    {getIcon(notification.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <p className={`text-sm font-medium text-slate-900 ${!notification.read ? 'font-bold' : ''}`}>
                                                            {notification.title}
                                                        </p>
                                                        {!notification.read && (
                                                            <span className="h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
                                                        )}
                                                    </div>
                                                    <p className="mt-1 text-xs text-slate-600 line-clamp-2">
                                                        {notification.message}
                                                    </p>
                                                    <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                                                        <Clock className="h-3 w-3" />
                                                        {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {filteredNotifications.length > 0 && (
                            <div className="border-t border-slate-200 p-3 text-center">
                                <button className="text-sm text-primary-600 hover:text-primary-700">
                                    View all notifications
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
