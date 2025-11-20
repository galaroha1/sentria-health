import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { NetworkRequest, Site, SiteInventory } from '../types/location';
import type { Notification } from '../types/notification';
import { networkRequests as initialRequests, sites, siteInventories } from '../data/location/mockData';
import { mockNotifications as initialNotifications } from '../data/notifications/mockData';

interface AppContextType {
    // Location & Requests
    requests: NetworkRequest[];
    sites: Site[];
    inventories: SiteInventory[];
    addRequest: (request: NetworkRequest) => void;
    updateRequestStatus: (id: string, status: NetworkRequest['status'], approvedBy?: string) => void;

    // Notifications
    notifications: Notification[];
    addNotification: (notification: Notification) => void;
    markNotificationAsRead: (id: string) => void;
    markAllNotificationsAsRead: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
    // Initialize with localStorage or mock data
    const [requests, setRequests] = useState<NetworkRequest[]>(() => {
        const saved = localStorage.getItem('sentria_requests');
        return saved ? JSON.parse(saved) : initialRequests;
    });

    const [notifications, setNotifications] = useState<Notification[]>(() => {
        const saved = localStorage.getItem('sentria_notifications');
        return saved ? JSON.parse(saved) : initialNotifications;
    });

    // Persist to localStorage whenever state changes
    useEffect(() => {
        localStorage.setItem('sentria_requests', JSON.stringify(requests));
    }, [requests]);

    useEffect(() => {
        localStorage.setItem('sentria_notifications', JSON.stringify(notifications));
    }, [notifications]);

    // Sync across tabs
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'sentria_requests' && e.newValue) {
                setRequests(JSON.parse(e.newValue));
            }
            if (e.key === 'sentria_notifications' && e.newValue) {
                setNotifications(JSON.parse(e.newValue));
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Check inventory levels and generate alerts
    useEffect(() => {
        const newNotifications: Notification[] = [];

        siteInventories.forEach(siteInv => {
            const site = sites.find(s => s.id === siteInv.siteId);
            if (!site) return;

            siteInv.drugs.forEach(drug => {
                if (drug.status === 'low' || drug.status === 'critical') {
                    // Check if we already have an active notification for this item today
                    const today = new Date().toISOString().split('T')[0];
                    const hasNotification = notifications.some(n =>
                        n.title.includes(drug.drugName) &&
                        n.message.includes(site.name) &&
                        n.timestamp.startsWith(today)
                    );

                    if (!hasNotification) {
                        newNotifications.push({
                            id: `alert-${site.id}-${drug.ndc}-${Date.now()}`,
                            type: drug.status === 'critical' ? 'critical' : 'warning',
                            category: 'alert',
                            title: `${drug.status === 'critical' ? 'Critical' : 'Low'} Stock: ${drug.drugName}`,
                            message: `${site.name} is running low on ${drug.drugName}. Current quantity: ${drug.quantity} (Min: ${drug.minLevel})`,
                            timestamp: new Date().toISOString(),
                            read: false,
                            link: '/inventory',
                            actionUrl: `/transfers?source=${site.id}&drug=${drug.ndc}` // Suggest transfer
                        });
                    }
                }
            });
        });

        if (newNotifications.length > 0) {
            setNotifications(prev => [...newNotifications, ...prev]);
        }
    }, []); // Run once on mount (in a real app, this might run on a schedule or inventory update)

    // Request Handlers
    const addRequest = (request: NetworkRequest) => {
        const newRequests = [request, ...requests];
        setRequests(newRequests);

        // Add corresponding notification
        const newNotification: Notification = {
            id: `notif-${Date.now()}`,
            type: 'info',
            category: 'alert',
            title: 'New Transfer Request',
            message: `${request.requestedBy} requested ${request.drug.quantity} units of ${request.drug.name}`,
            timestamp: new Date().toISOString(),
            read: false,
            link: '/locations'
        };
        addNotification(newNotification);
    };

    const updateRequestStatus = (id: string, status: NetworkRequest['status'], approvedBy?: string) => {
        let updatedRequest: NetworkRequest | undefined;

        const newRequests = requests.map(req => {
            if (req.id === id) {
                updatedRequest = {
                    ...req,
                    status,
                    ...(status === 'in_transit' || status === 'approved' ? {
                        approvedAt: new Date().toISOString(),
                        approvedBy: approvedBy || 'System'
                    } : {})
                };
                return updatedRequest;
            }
            return req;
        });

        setRequests(newRequests);

        // Add notification for status change
        if (updatedRequest) {
            const title = status === 'in_transit' ? 'Transfer Approved' :
                status === 'denied' ? 'Request Denied' : 'Status Updated';

            const newNotification: Notification = {
                id: `notif-${Date.now()}`,
                type: status === 'denied' ? 'warning' : 'success',
                category: 'approval',
                title,
                message: `Request for ${updatedRequest.drug.name} has been ${status === 'in_transit' ? 'approved' : status}`,
                timestamp: new Date().toISOString(),
                read: false,
                link: '/locations'
            };
            addNotification(newNotification);
        }
    };

    // Notification Handlers
    const addNotification = (notification: Notification) => {
        setNotifications(prev => [notification, ...prev]);
    };

    const markNotificationAsRead = (id: string) => {
        setNotifications(prev => prev.map(n =>
            n.id === id ? { ...n, read: true } : n
        ));
    };

    const markAllNotificationsAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    return (
        <AppContext.Provider value={{
            requests,
            sites,
            inventories: siteInventories,
            addRequest,
            updateRequestStatus,
            notifications,
            addNotification,
            markNotificationAsRead,
            markAllNotificationsAsRead
        }}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
}
