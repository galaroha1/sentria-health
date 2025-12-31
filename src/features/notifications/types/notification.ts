export type NotificationType = 'critical' | 'warning' | 'info' | 'success';
export type NotificationCategory = 'alert' | 'approval' | 'system';

export interface Notification {
    id: string;
    type: NotificationType;
    category: NotificationCategory;
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
    link?: string;
    actionUrl?: string;
    metadata?: {
        drugName?: string;
        siteName?: string;
        requestId?: string;
        quantity?: number;
    };
}
