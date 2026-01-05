import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { NetworkRequest } from '../../../types/location';
import type { Notification } from '../../../types/notification';
import { FirestoreService, orderBy, limit } from '../../../core/services/firebase.service';
import { useAuth } from '../../../context/AuthContext';
import { useInventory } from '../../inventory/context/InventoryContext';

interface LogisticsContextType {
    requests: NetworkRequest[];
    addRequest: (request: NetworkRequest) => Promise<void>;
    updateRequestStatus: (id: string, status: NetworkRequest['status'], approvedBy?: string) => Promise<void>;
}

const LogisticsContext = createContext<LogisticsContextType | undefined>(undefined);

export function LogisticsProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const { updateInventory } = useInventory(); // Dependency on Inventory System
    const [requests, setRequests] = useState<NetworkRequest[]>([]);

    useEffect(() => {
        if (!user) {
            setRequests([]);
            return;
        }

        const unsubscribeRequests = FirestoreService.subscribe<NetworkRequest>(
            'transfers',
            (data) => { setRequests(data); },
            orderBy('requestedAt', 'desc'),
            limit(50)
        );

        return () => unsubscribeRequests();
    }, [user]);

    const addRequest = async (request: NetworkRequest) => {
        // Optimistic
        setRequests(prev => [...prev, request]);
        await FirestoreService.set('transfers', request.id, request);

        // Notify
        const newNotification: Notification = {
            id: `notif-${Date.now()}`,
            type: 'info',
            category: 'alert',
            title: 'New Transfer Request',
            message: `${request.requestedBySite.name} requested ${request.drug.quantity} units of ${request.drug.name}`,
            timestamp: new Date().toISOString(),
            read: false,
            link: '/logistics'
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

        // Fetch fresh request data or find in local state
        // Local state might be stale if strict ordering... finding is safer
        const request = requests.find(r => r.id === id); // We hope this is up to date via subscription
        if (!request) return; // Should we fetch if missing? For now rely on sub.

        // Notifications
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
            link: '/logistics'
        };
        await FirestoreService.set('notifications', newNotification.id, newNotification);

        // Inventory Movement on Completion
        if (status === 'completed') {
            // 1. Add to Requesting Site (Receiver)
            await updateInventory(
                request.requestedBySite.id,
                request.drug.ndc,
                request.drug.quantity,
                `Transfer received from ${request.targetSite.name}`,
                'System',
                'System'
            );

            // 2. Remove from Target Site (Sender)
            await updateInventory(
                request.targetSite.id,
                request.drug.ndc,
                -request.drug.quantity,
                `Transfer sent to ${request.requestedBySite.name}`,
                'System',
                'System'
            );
        }
    };

    return (
        <LogisticsContext.Provider value={{ requests, addRequest, updateRequestStatus }}>
            {children}
        </LogisticsContext.Provider>
    );
}

export function useLogistics() {
    const context = useContext(LogisticsContext);
    if (context === undefined) {
        throw new Error('useLogistics must be used within a LogisticsProvider');
    }
    return context;
}
