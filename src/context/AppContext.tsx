import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { NetworkRequest, Site, SiteInventory } from '../types/location';
import type { Notification } from '../types/notification';
import type { AuditLogEntry } from '../types/audit';
import { sites, siteInventories as initialInventories } from '../data/location/mockData';
import { mockNotifications as initialNotifications } from '../data/notifications/mockData';
import { FirestoreService } from '../services/firebase.service';

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
    const [requests, setRequests] = useState<NetworkRequest[]>([]);

    const [notifications, setNotifications] = useState<Notification[]>(() => {
        const saved = localStorage.getItem('sentria_notifications');
        return saved ? JSON.parse(saved) : initialNotifications;
    });

    const [inventories, setInventories] = useState<SiteInventory[]>([]);

    const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
        const saved = localStorage.getItem('sentria_audit_logs');
        return saved ? JSON.parse(saved) : [];
    });

    // Persist to localStorage whenever state changes (only for notifications and audit logs)
    useEffect(() => {
        localStorage.setItem('sentria_notifications', JSON.stringify(notifications));
    }, [notifications]);

    useEffect(() => {
        localStorage.setItem('sentria_audit_logs', JSON.stringify(auditLogs));
    }, [auditLogs]);

    // Subscribe to Firestore collections
    useEffect(() => {
        const unsubscribeRequests = FirestoreService.subscribe<NetworkRequest>('transfers', (data) => {
            setRequests(data);
        });

        const unsubscribeInventories = FirestoreService.subscribe<SiteInventory>('inventoryItems', (data) => {
            if (data.length === 0 && initialInventories.length > 0) {
                // Seed data if Firestore is empty
                console.log('Seeding inventory data...');
                initialInventories.forEach(inv => {
                    FirestoreService.set('inventoryItems', inv.siteId, inv);
                });
            } else {
                setInventories(data);
            }
        });

        const unsubscribeNotifications = FirestoreService.subscribe<Notification>('notifications', (data) => {
            setNotifications(data);
        });

        const unsubscribeAuditLogs = FirestoreService.subscribe<AuditLogEntry>('auditLogs', (data) => {
            setAuditLogs(data);
        });

        return () => {
            unsubscribeRequests();
            unsubscribeInventories();
            unsubscribeNotifications();
            unsubscribeAuditLogs();
        };
    }, []);

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
    const updateInventory = async (siteId: string, ndc: string, quantityChange: number, reason: string, userId: string, userName: string) => {
        const inventory = inventories.find(inv => inv.siteId === siteId);
        if (!inventory) return;

        let updatedDrugName = '';
        let newQuantity = 0;

        const updatedDrugs = inventory.drugs.map(drug => {
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
        });

        const updatedInventory = {
            ...inventory,
            lastUpdated: new Date().toISOString(),
            drugs: updatedDrugs
        };

        // Save to Firestore
        await FirestoreService.set('inventoryItems', siteId, updatedInventory);

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

        await FirestoreService.set('auditLogs', logEntry.id, logEntry);
    };

    // Request Handlers
    const addRequest = async (request: NetworkRequest) => {
        await FirestoreService.set('transfers', request.id, request);

        // Add corresponding notification
        const newNotification: Notification = {
            id: `notif-${Date.now()}`,
            type: 'info',
            category: 'alert',
            title: 'New Transfer Request',
            message: `${request.requestedBySite.name} requested ${request.drug.quantity} units of ${request.drug.name}`,
            timestamp: new Date().toISOString(),
            read: false,
            link: '/transfers'
        };

        await FirestoreService.set('notifications', newNotification.id, newNotification);
    };

    const updateRequestStatus = async (id: string, status: NetworkRequest['status'], approvedBy?: string) => {
        const updates: Partial<NetworkRequest> = { status };
        if (approvedBy) {
            updates.approvedBy = approvedBy;
            updates.approvedAt = new Date().toISOString();
        }
        if (status === 'in_transit') updates.inTransitAt = new Date().toISOString();
        if (status === 'completed') updates.completedAt = new Date().toISOString();

        await FirestoreService.update('transfers', id, updates);

        const request = requests.find(r => r.id === id);
        if (!request) return;

        const title = status === 'in_transit' ? 'Transfer Approved' :
            status === 'denied' ? 'Request Denied' : 'Status Updated';

        const newNotification: Notification = {
            id: `notif-${Date.now()}`,
            type: status === 'denied' ? 'warning' : 'success',
            category: 'approval',
            title,
            message: `Request for ${request.drug.name} has been ${status === 'in_transit' ? 'approved' : status}`,
            timestamp: new Date().toISOString(),
            read: false,
            link: '/transfers'
        };
        await FirestoreService.set('notifications', newNotification.id, newNotification);

        if (status === 'completed') {
            await updateInventory(
                request.requestedBySite.id,
                request.drug.ndc,
                -request.drug.quantity,
                `Transfer to ${request.targetSite.name}`,
                'System',
                'System'
            );

            await updateInventory(
                request.targetSite.id,
                request.drug.ndc,
                request.drug.quantity,
                `Transfer received from ${request.requestedBySite.name}`,
                'System',
                'System'
            );
        }
    };

    // Notification Handlers
    const addNotification = async (notification: Notification) => {
        await FirestoreService.set('notifications', notification.id, notification);
    };

    const markNotificationAsRead = async (id: string) => {
        await FirestoreService.update('notifications', id, { read: true });
    };

    const markAllNotificationsAsRead = async () => {
        const batch = notifications.map(n => FirestoreService.update('notifications', n.id, { read: true }));
        await Promise.all(batch);
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
