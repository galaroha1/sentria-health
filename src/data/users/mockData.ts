import type { User, UserRole, UserStatus } from '../../types';

export interface UserActivityLog {
    id: string;
    userId: string;
    action: string;
    timestamp: string;
    ipAddress: string;
    status: 'success' | 'failed';
    details?: string;
}

// Extended mock users with status and activity
export const MOCK_USERS_DB: Record<string, { password: string; user: User }> = {
    'admin@sentria.health': {
        password: 'admin123',
        user: {
            id: '1',
            email: 'admin@sentria.health',
            name: 'Dr. Sarah Chen',
            role: 'Super Admin' as UserRole,
            department: 'Administration',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
            phone: '+1 (555) 123-4567',
            createdAt: '2023-01-15',
            status: 'active' as UserStatus,
            lastLogin: new Date().toISOString(),
            createdBy: 'system',
        },
    },
    'pharmacy@sentria.health': {
        password: 'pharmacy123',
        user: {
            id: '2',
            email: 'pharmacy@sentria.health',
            name: 'Michael Rodriguez',
            role: 'Pharmacy Manager' as UserRole,
            department: 'Pharmacy Services',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
            phone: '+1 (555) 234-5678',
            createdAt: '2023-03-20',
            status: 'active' as UserStatus,
            lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            createdBy: '1',
        },
    },
    'procurement@sentria.health': {
        password: 'procurement123',
        user: {
            id: '3',
            email: 'procurement@sentria.health',
            name: 'Emily Thompson',
            role: 'Procurement Officer' as UserRole,
            department: 'Procurement & Supply Chain',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
            phone: '+1 (555) 345-6789',
            createdAt: '2023-05-10',
            status: 'active' as UserStatus,
            lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            createdBy: '1',
        },
    },
    'john.smith@sentria.health': {
        password: 'password123',
        user: {
            id: '4',
            email: 'john.smith@sentria.health',
            name: 'John Smith',
            role: 'Pharmacy Manager' as UserRole,
            department: 'Pharmacy Services',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
            phone: '+1 (555) 456-7890',
            createdAt: '2023-06-15',
            status: 'active' as UserStatus,
            lastLogin: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            createdBy: '1',
        },
    },
    'lisa.wong@sentria.health': {
        password: 'password123',
        user: {
            id: '5',
            email: 'lisa.wong@sentria.health',
            name: 'Lisa Wong',
            role: 'Procurement Officer' as UserRole,
            department: 'Procurement & Supply Chain',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
            phone: '+1 (555) 567-8901',
            createdAt: '2023-07-01',
            status: 'inactive' as UserStatus,
            lastLogin: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            createdBy: '1',
        },
    },
    'david.park@sentria.health': {
        password: 'password123',
        user: {
            id: '6',
            email: 'david.park@sentria.health',
            name: 'David Park',
            role: 'Pharmacy Manager' as UserRole,
            department: 'Pharmacy Services',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
            phone: '+1 (555) 678-9012',
            createdAt: '2023-08-10',
            status: 'active' as UserStatus,
            lastLogin: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            createdBy: '1',
        },
    },
};

// Mock activity logs
export const MOCK_ACTIVITY_LOGS: UserActivityLog[] = [
    {
        id: 'log-1',
        userId: '1',
        action: 'Login',
        timestamp: new Date().toISOString(),
        ipAddress: '192.168.1.100',
        status: 'success',
    },
    {
        id: 'log-2',
        userId: '2',
        action: 'Login',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        ipAddress: '192.168.1.101',
        status: 'success',
    },
    {
        id: 'log-3',
        userId: '3',
        action: 'Password Change',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        ipAddress: '192.168.1.102',
        status: 'success',
    },
    {
        id: 'log-4',
        userId: '4',
        action: 'Login',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        ipAddress: '192.168.1.103',
        status: 'success',
    },
    {
        id: 'log-5',
        userId: '5',
        action: 'Login Failed',
        timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        ipAddress: '192.168.1.104',
        status: 'failed',
        details: 'Invalid password',
    },
];
