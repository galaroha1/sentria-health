export const UserRole = {
    SUPER_ADMIN: 'Super Admin',
    PHARMACY_MANAGER: 'Pharmacy Manager',
    PROCUREMENT_OFFICER: 'Procurement Officer',
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export const UserStatus = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    SUSPENDED: 'suspended',
} as const;

export type UserStatus = typeof UserStatus[keyof typeof UserStatus];

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    department: string;
    avatar?: string;
    phone?: string;
    createdAt: string;
    status: UserStatus;
    lastLogin?: string;
    createdBy?: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

// Permission sets for each role
export const ROLE_PERMISSIONS = {
    [UserRole.SUPER_ADMIN]: ['*'], // Full access
    [UserRole.PHARMACY_MANAGER]: ['dashboard', 'inventory', 'vendors', 'reports', 'transfers', 'locations'],
    [UserRole.PROCUREMENT_OFFICER]: ['dashboard', 'marketplace', 'cart', 'reports'],
};

// Mock user database
export const MOCK_USERS: Record<string, { password: string; user: User }> = {
    'admin@sentria.health': {
        password: 'admin123',
        user: {
            id: '1',
            email: 'admin@sentria.health',
            name: 'Dr. Sarah Chen',
            role: UserRole.SUPER_ADMIN,
            department: 'Administration',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
            phone: '+1 (555) 123-4567',
            createdAt: '2023-01-15',
            status: UserStatus.ACTIVE,
        },
    },
    'pharmacy@sentria.health': {
        password: 'pharmacy123',
        user: {
            id: '2',
            email: 'pharmacy@sentria.health',
            name: 'Michael Rodriguez',
            role: UserRole.PHARMACY_MANAGER,
            department: 'Pharmacy Services',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
            phone: '+1 (555) 234-5678',
            createdAt: '2023-03-20',
            status: UserStatus.ACTIVE,
        },
    },
    'procurement@sentria.health': {
        password: 'procurement123',
        user: {
            id: '3',
            email: 'procurement@sentria.health',
            name: 'Emily Thompson',
            role: UserRole.PROCUREMENT_OFFICER,
            department: 'Procurement & Supply Chain',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
            phone: '+1 (555) 345-6789',
            createdAt: '2023-05-10',
            status: UserStatus.ACTIVE,
        },
    },
};
