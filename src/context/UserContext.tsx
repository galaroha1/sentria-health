import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type User, UserStatus } from '../types';
import { FirestoreService } from '../services/firebase.service';

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
        // Create a placeholder user document.
        // We use the email as a temporary ID or just a queryable field. 
        // To make lookup easy during signup, we can use the email as the document ID for the placeholder,
        // and then delete it and create a new one with the Auth UID later.
        // OR we can query by email. Querying by email is safer if we want to support changing emails later,
        // but for this simple "invite" flow, using email as ID for the invite is convenient.
        // Let's use a random ID but ensure we can query it.

        const newUser: User = {
            ...userData,
            id: `invite-${Date.now()}`,
            createdAt: new Date().toISOString(),
            lastLogin: undefined,
            createdBy: 'admin',
            status: 'pending' as UserStatus // Set initial status to pending
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
            const newStatus = user.status === 'active' ? 'suspended' : 'active';
            await FirestoreService.update('users', id, { status: newStatus as UserStatus });
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
