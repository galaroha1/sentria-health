import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type User, UserStatus } from '../types';
import { FirestoreService } from '../core/services/firebase.service';

interface UserContextType {
    users: User[];
    addUser: (user: Omit<User, 'id' | 'createdAt' | 'lastLogin' | 'createdBy'>) => Promise<void>;
    updateUser: (id: string, updates: Partial<User>) => Promise<void>;
    deleteUser: (id: string) => Promise<void>;
    toggleUserStatus: (id: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        const unsubscribe = FirestoreService.subscribe<User>('users', (data) => {
            setUsers(data);
        });
        return () => unsubscribe();
    }, []);

    const addUser = async (userData: Omit<User, 'id' | 'createdAt' | 'lastLogin' | 'createdBy'>) => {
        // Create a pending user document.
        // AuthContext.signup() will look for a user with this email to 'claim' the profile.
        // This allows admins to pre-set roles/departments for users who haven't signed up yet.
        const newUser: User = {
            ...userData,
            email: userData.email.toLowerCase(), // Ensure normalization
            id: `invite-${Date.now()}`,
            createdAt: new Date().toISOString(),
            lastLogin: undefined,
            createdBy: 'admin',
            status: UserStatus.PENDING
        };

        await FirestoreService.set('users', newUser.id, newUser);
    };

    const updateUser = async (id: string, updates: Partial<User>) => {
        await FirestoreService.update('users', id, updates);
    };

    const deleteUser = async (id: string) => {
        await FirestoreService.delete('users', id);
    };

    const toggleUserStatus = async (id: string) => {
        const user = users.find(u => u.id === id);
        if (user) {
            const newStatus = user.status === UserStatus.ACTIVE ? UserStatus.SUSPENDED : UserStatus.ACTIVE;
            await FirestoreService.update('users', id, { status: newStatus });
        }
    };

    return (
        <UserContext.Provider value={{ users, addUser, updateUser, deleteUser, toggleUserStatus }}>
            {children}
        </UserContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useUsers() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUsers must be used within a UserProvider');
    }
    return context;
}
