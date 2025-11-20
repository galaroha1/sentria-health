export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'pharmacist' | 'clerk' | 'manager';
    department: string;
    status: 'active' | 'inactive';
    lastActive: string;
    avatar?: string;
}

export interface Role {
    id: string;
    name: string;
    permissions: string[];
    description: string;
}

export interface ActivityLogEntry {
    id: string;
    userId: string;
    userName: string;
    action: string;
    details: string;
    timestamp: string;
    ipAddress?: string;
}
