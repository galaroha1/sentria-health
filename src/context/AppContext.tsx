import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { NetworkRequest, Site, SiteInventory } from '../types/location';
import type { Notification } from '../types/notification';
import type { AuditLogEntry } from '../types/audit';
import { networkRequests as initialRequests, sites, siteInventories as initialInventories } from '../data/location/mockData';
import { mockNotifications as initialNotifications } from '../data/notifications/mockData';

interface AppContextType {
    // Location & Requests
    requests: NetworkRequest[];
    sites: Site[];
    inventories: SiteInventory[];
    addRequest: (request: NetworkRequest) => void;
    updateRequestStatus: (id: string, status: NetworkRequest['status'], approvedBy?: string) => void;

    // Inventory Management
    updateInventory: (siteId: string, ndc: string, quantityChange: number, reason: string, userId: string, userName: string) => void;

    // Notifications
    notifications: Notification[];
    addNotification: (notification: Notification) => void;
    markNotificationAsRead: (id: string) => void;
    markAllNotificationsAsRead: () => void;

    // Audit Logs
    auditLogs: AuditLogEntry[];
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

    const [inventories, setInventories] = useState<SiteInventory[]>(() => {
        const saved = localStorage.getItem('sentria_inventories');
        return saved ? JSON.parse(saved) : initialInventories;
    });

    const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
        const saved = localStorage.getItem('sentria_audit_logs');
        return saved ? JSON.parse(saved) : [];
    });

    // Persist to localStorage whenever state changes
    useEffect(() => {
        localStorage.setItem('sentria_requests', JSON.stringify(requests));
    }, [requests]);

    useEffect(() => {
        localStorage.setItem('sentria_notifications', JSON.stringify(notifications));
    }, [notifications]);

    useEffect(() => {
        localStorage.setItem('sentria_inventories', JSON.stringify(inventories));
    }, [inventories]);

    useEffect(() => {
        localStorage.setItem('sentria_audit_logs', JSON.stringify(auditLogs));
    }, [auditLogs]);

    // Sync across tabs
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'sentria_requests' && e.newValue) {
                setRequests(JSON.parse(e.newValue));
            }
            if (e.key === 'sentria_notifications' && e.newValue) {
                setNotifications(JSON.parse(e.newValue));
            }
            if (e.key === 'sentria_inventories' && e.newValue) {
                setInventories(JSON.parse(e.newValue));
            }
            if (e.key === 'sentria_audit_logs' && e.newValue) {
                setAuditLogs(JSON.parse(e.newValue));
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Check inventory levels and generate alerts
    // Check inventory levels and generate alerts
    useEffect(() => {
        inventories.forEach(siteInv => {
            const site = sites.find(s => s.id === siteInv.siteId);
            if (!site) return;

            siteInv.drugs.forEach(drug => {
                if (drug.status === 'low' || drug.status === 'critical') {
                    setNotifications(prevNotifications => {
                        // Check if we already have an active notification for this item today
                        const today = new Date().toISOString().split('T')[0];
                        const hasNotification = prevNotifications.some(n =>
                            n.title.includes(drug.drugName) &&
                            n.message.includes(site.name) &&
                            n.timestamp.startsWith(today)
                        );

                        if (!hasNotification) {
                            return [{
                                id: `alert-${site.id}-${drug.ndc}-${Date.now()}`,
                                type: drug.status === 'critical' ? 'critical' : 'warning',
                                category: 'alert',
                                title: `${drug.status === 'critical' ? 'Critical' : 'Low'} Stock: ${drug.drugName}`,
                                message: `${site.name} is running low on ${drug.drugName}. Current quantity: ${drug.quantity} (Min: ${drug.minLevel})`,
                                timestamp: new Date().toISOString(),
                                read: false,
                                link: '/inventory',
                                actionUrl: `/transfers?source=${site.id}&drug=${drug.ndc}` // Suggest transfer
                            }, ...prevNotifications];
                        }
                        return prevNotifications;
                    });
                }
            });
        });
    }, [inventories]); // Run when inventories change

    // Inventory Management
    const updateInventory = (siteId: string, ndc: string, quantityChange: number, reason: string, userId: string, userName: string) => {
        let updatedDrugName = '';
        let newQuantity = 0;

        setInventories(prev => prev.map(inv => {
            if (inv.siteId !== siteId) return inv;

            return {
                ...inv,
                lastUpdated: new Date().toISOString(),
                drugs: inv.drugs.map(drug => {
                    if (drug.ndc !== ndc) return drug;

                    updatedDrugName = drug.drugName;
                    newQuantity = Math.max(0, drug.quantity + quantityChange);

                    // Recalculate status
                    let status: 'well_stocked' | 'low' | 'critical' | 'overstocked' = 'well_stocked';
                    if (newQuantity <= drug.minLevel / 2) status = 'critical';
                    else if (newQuantity <= drug.minLevel) status = 'low';
                    else if (newQuantity >= drug.maxLevel * 1.2) status = 'overstocked';

                    return {
                        ...drug,
                        quantity: newQuantity,
                        status
                    };
                })
            };
        }));

        // Create Audit Log
        const site = sites.find(s => s.id === siteId);
        const logEntry: AuditLogEntry = {
            id: `audit-${Date.now()}`,
            action: quantityChange > 0 ? 'add' : 'remove',
            drugName: updatedDrugName,
            ndc,
            quantityChange,
            newQuantity,
            siteId,
            siteName: site?.name || 'Unknown Site',
            userId,
            userName,
            timestamp: new Date().toISOString(),
            reason
        };

        setAuditLogs(prev => [logEntry, ...prev]);
    };

    // Request Handlers
    const addRequest = (request: NetworkRequest) => {
        const newRequests = [request, ...requests];
        setRequests(newRequests);

        // Add corresponding notification
        const newNotification: Notification = {
            // eslint-disable-next-line react-hooks/purity
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
                // eslint-disable-next-line react-hooks/purity
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

            // If completed, update inventory
            if (status === 'completed') {
                // Deduct from source
                updateInventory(
                    updatedRequest.requestedBySite.id, // When 'completed', add to requester.
                    updatedRequest.drug.ndc,
                    updatedRequest.drug.quantity,
                    `Transfer completed from ${updatedRequest.targetSite.name}`,
                    'system',
                    'System'
                );
            }
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
            inventories,
            addRequest,
            updateRequestStatus,
            updateInventory,
            notifications,
            addNotification,
            markNotificationAsRead,
            markAllNotificationsAsRead,
            auditLogs
        }}>
            {children}
        </AppContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
}
