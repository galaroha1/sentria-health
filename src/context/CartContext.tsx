import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { FirestoreService } from '../core/services/firebase.service';
import { useAuth } from './AuthContext';

interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    seller: string;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (id: number) => void;
    clearCart: () => void;
    checkout: () => Promise<string>;
    total: number;
    itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);



export function CartProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [items, setItems] = useState<CartItem[]>([]);

    // Subscribe to Firestore cart items
    useEffect(() => {
        if (!user) {
            setItems([]);
            return;
        }

        const unsubscribe = FirestoreService.subscribe<CartItem>(`users/${user.id}/cart`, (data) => {
            setItems(data);
        });
        return () => unsubscribe();
    }, [user]);

    const addToCart = async (newItem: CartItem) => {
        if (!user) return; // Or handle local cart for guests? For now, assume auth required.

        const existing = items.find((item) => item.id === newItem.id);
        if (existing) {
            await FirestoreService.update(`users/${user.id}/cart`, newItem.id.toString(), { quantity: existing.quantity + 1 });
        } else {
            await FirestoreService.set(`users/${user.id}/cart`, newItem.id.toString(), { ...newItem, quantity: 1 });
        }
    };

    const removeFromCart = async (id: number) => {
        if (!user) return;
        await FirestoreService.delete(`users/${user.id}/cart`, id.toString());
    };

    const clearCart = async () => {
        if (!user) return;
        const batch = items.map(item => FirestoreService.delete(`users/${user.id}/cart`, item.id.toString()));
        await Promise.all(batch);
    };

    const checkout = async (): Promise<string> => {
        if (!user) throw new Error('User not authenticated');
        if (items.length === 0) throw new Error('Cart is empty');

        const orderId = `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const orderData = {
            id: orderId,
            items: items,
            total: total + 150, // Including shipping
            status: 'processing',
            createdAt: new Date().toISOString(),
            shipping: {
                method: 'Cold Chain Express',
                cost: 150
            }
        };

        // Save order to history
        await FirestoreService.set(`users/${user.id}/orders`, orderId, orderData);

        // Clear cart
        await clearCart();

        return orderId;
    };

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, checkout, total, itemCount }}>
            {children}
        </CartContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
