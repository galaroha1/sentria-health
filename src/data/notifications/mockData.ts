import type { Notification } from '../../types/notification';

export const mockNotifications: Notification[] = [
    {
        id: 'notif-1',
        type: 'critical',
        category: 'alert',
        title: 'Critical Stock Level',
        message: 'Remicade (Infliximab) at Memorial Regional Hospital is below minimum threshold (8 units remaining)',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
        read: false,
        actionUrl: '/inventory',
        metadata: {
            drugName: 'Remicade (Infliximab)',
            siteName: 'Memorial Regional Hospital',
            quantity: 8,
        },
    },
    {
        id: 'notif-2',
        type: 'warning',
        category: 'approval',
        title: 'Transfer Request Pending',
        message: 'Downtown Community Clinic requested 10 units of Keytruda - requires your approval',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
        read: false,
        actionUrl: '/transfers',
        metadata: {
            requestId: 'NR-001',
            siteName: 'Downtown Community Clinic',
            drugName: 'Keytruda (Pembrolizumab)',
            quantity: 10,
        },
    },
    {
        id: 'notif-3',
        type: 'warning',
        category: 'alert',
        title: 'Expiration Warning',
        message: '5 units of Keytruda at Central Warehouse will expire in 7 days',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        read: false,
        actionUrl: '/inventory',
        metadata: {
            drugName: 'Keytruda (Pembrolizumab)',
            siteName: 'Central Warehouse',
            quantity: 5,
        },
    },
    {
        id: 'notif-4',
        type: 'success',
        category: 'system',
        title: 'Transfer Completed',
        message: 'Transfer of 15 units of Humira to East Valley Clinic completed successfully',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
        read: true,
        actionUrl: '/transfers',
        metadata: {
            requestId: 'NR-003',
            drugName: 'Humira (Adalimumab)',
            siteName: 'East Valley Clinic',
            quantity: 15,
        },
    },
    {
        id: 'notif-5',
        type: 'info',
        category: 'system',
        title: 'New Order Received',
        message: 'Order #12847 from McKesson delivered to Central Warehouse',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        read: true,
        actionUrl: '/inventory',
    },
    {
        id: 'notif-6',
        type: 'warning',
        category: 'approval',
        title: 'Network Request Pending',
        message: 'Westside Medical Center requested 20 units of Remicade',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        read: true,
        actionUrl: '/locations',
        metadata: {
            requestId: 'NR-002',
            siteName: 'Westside Medical Center',
            drugName: 'Remicade (Infliximab)',
            quantity: 20,
        },
    },
];
