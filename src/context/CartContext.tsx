import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { FirestoreService } from '../services/firebase.service';

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
    total: number;
    itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);



export function CartProvider({ children }: { children: ReactNode }) {
    // Initialize with empty array, data will come from Firestore
    const [items, setItems] = useState<CartItem[]>([]);

    // Subscribe to Firestore cart items
    useEffect(() => {
        const unsubscribe = FirestoreService.subscribe<CartItem>('cartItems', (data) => {
            setItems(data);
        });
        return () => unsubscribe();
    }, []);

    const addToCart = async (newItem: CartItem) => {
        const existing = items.find((item) => item.id === newItem.id);
        if (existing) {
            await FirestoreService.update('cartItems', newItem.id.toString(), { quantity: existing.quantity + 1 });
        } else {
            await FirestoreService.set('cartItems', newItem.id.toString(), { ...newItem, quantity: 1 });
        }
    };

    const removeFromCart = async (id: number) => {
        await FirestoreService.delete('cartItems', id.toString());
    };

    const clearCart = async () => {
        const batch = items.map(item => FirestoreService.delete('cartItems', item.id.toString()));
        await Promise.all(batch);
    };

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, total, itemCount }}>
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
