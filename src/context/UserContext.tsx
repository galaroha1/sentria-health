import { createContext, useContext, useState, type ReactNode } from 'react';
import { type User, type UserStatus } from '../types';
import { MOCK_USERS_DB } from '../data/users/mockData';

interface UserContextType {
    users: User[];
    addUser: (user: Omit<User, 'id' | 'createdAt' | 'lastLogin' | 'createdBy'>) => void;
    updateUser: (id: string, updates: Partial<User>) => void;
    deleteUser: (id: string) => void;
    toggleUserStatus: (id: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [users, setUsers] = useState<User[]>(() =>
        Object.values(MOCK_USERS_DB).map(record => record.user)
    );

    const addUser = (userData: Omit<User, 'id' | 'createdAt' | 'lastLogin' | 'createdBy'>) => {
        const newUser: User = {
            ...userData,
            id: Math.random().toString(36).substr(2, 9),
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(), // Default to now for new users
            createdBy: 'current-user', // In a real app, this would be the current user's ID
        };
        setUsers(prev => [...prev, newUser]);
    };

    const updateUser = (id: string, updates: Partial<User>) => {
        setUsers(prev => prev.map(user =>
            user.id === id ? { ...user, ...updates } : user
        ));
    };

    const deleteUser = (id: string) => {
        setUsers(prev => prev.filter(user => user.id !== id));
    };

    const toggleUserStatus = (id: string) => {
        setUsers(prev => prev.map(user => {
            if (user.id === id) {
                const newStatus = user.status === 'active' ? 'inactive' : 'active';
                return { ...user, status: newStatus as UserStatus };
            }
            return user;
        }));
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
