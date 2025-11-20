// Permission action types
export const Permission = {
    CREATE: 'create',
    READ: 'read',
    UPDATE: 'update',
    DELETE: 'delete',
} as const;

export type Permission = typeof Permission[keyof typeof Permission];

// Resource names that can have permissions
export const Resource = {
    DASHBOARD: 'dashboard',
    MARKETPLACE: 'marketplace',
    INVENTORY: 'inventory',
    TRANSFERS: 'transfers',
    LOCATIONS: 'locations',
    USERS: 'users',
    VENDORS: 'vendors',
    REPORTS: 'reports',
    PERMISSIONS: 'permissions',
} as const;

export type Resource = typeof Resource[keyof typeof Resource];

// Permission for a specific resource and action
export interface ResourcePermission {
    resource: Resource;
    actions: Permission[];
}

// Complete permission matrix for a role
export type PermissionMatrix = Record<Resource, Permission[]>;

// Helper function to check if role has specific permission
export function hasResourcePermission(
    matrix: PermissionMatrix,
    resource: Resource,
    action?: Permission
): boolean {
    const permissions = matrix[resource];

    // If no specific action requested, check if has any permission
    if (!action) {
        return permissions && permissions.length > 0;
    }

    // Check for specific action
    return permissions?.includes(action) || false;
}

// Default permission matrices for each role
export const DEFAULT_PERMISSION_MATRICES: Record<string, PermissionMatrix> = {
    'Super Admin': {
        [Resource.DASHBOARD]: [Permission.CREATE, Permission.READ, Permission.UPDATE, Permission.DELETE],
        [Resource.MARKETPLACE]: [Permission.CREATE, Permission.READ, Permission.UPDATE, Permission.DELETE],
        [Resource.INVENTORY]: [Permission.CREATE, Permission.READ, Permission.UPDATE, Permission.DELETE],
        [Resource.TRANSFERS]: [Permission.CREATE, Permission.READ, Permission.UPDATE, Permission.DELETE],
        [Resource.LOCATIONS]: [Permission.CREATE, Permission.READ, Permission.UPDATE, Permission.DELETE],
        [Resource.USERS]: [Permission.CREATE, Permission.READ, Permission.UPDATE, Permission.DELETE],
        [Resource.VENDORS]: [Permission.CREATE, Permission.READ, Permission.UPDATE, Permission.DELETE],
        [Resource.REPORTS]: [Permission.CREATE, Permission.READ, Permission.UPDATE, Permission.DELETE],
        [Resource.PERMISSIONS]: [Permission.CREATE, Permission.READ, Permission.UPDATE, Permission.DELETE],
    },
    'Pharmacy Manager': {
        [Resource.DASHBOARD]: [Permission.READ],
        [Resource.MARKETPLACE]: [],
        [Resource.INVENTORY]: [Permission.CREATE, Permission.READ, Permission.UPDATE, Permission.DELETE],
        [Resource.TRANSFERS]: [Permission.CREATE, Permission.READ, Permission.UPDATE],
        [Resource.LOCATIONS]: [Permission.READ],
        [Resource.USERS]: [],
        [Resource.VENDORS]: [Permission.READ, Permission.UPDATE],
        [Resource.REPORTS]: [Permission.READ],
        [Resource.PERMISSIONS]: [],
    },
    'Procurement Officer': {
        [Resource.DASHBOARD]: [Permission.READ],
        [Resource.MARKETPLACE]: [Permission.CREATE, Permission.READ],
        [Resource.INVENTORY]: [Permission.READ],
        [Resource.TRANSFERS]: [],
        [Resource.LOCATIONS]: [],
        [Resource.USERS]: [],
        [Resource.VENDORS]: [Permission.READ],
        [Resource.REPORTS]: [Permission.READ],
        [Resource.PERMISSIONS]: [],
    },
};
