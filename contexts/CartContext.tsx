'use client';

import { createContext, useState, useEffect, useContext, ReactNode, useRef } from 'react';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useFirebaseAuth } from './FirebaseAuthContext';

interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    image: string;
}

interface CartContextType {
    cart: CartItem[];
    loading: boolean;
    addToCart: (product: any) => void;
    removeFromCart: (productId: number) => void;
    updateQuantity: (productId: number, quantity: number) => void;
    clearCart: () => void;
    itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const { user, loading: authLoading } = useFirebaseAuth();
    // Track if we're in the middle of a local update to ignore the echo from onSnapshot
    const localUpdateRef = useRef(false);

    // Subscribe to Firestore cart in real-time
    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            setCart([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const ref = doc(db, 'carts', user.uid);
        const unsubscribe = onSnapshot(ref, (snap) => {
            // If we triggered this update ourselves, skip it to avoid flicker
            if (localUpdateRef.current) return;
            if (snap.exists()) {
                setCart(snap.data().items || []);
            } else {
                setCart([]);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, authLoading]);

    // Write updated items to Firestore and update local state immediately
    const persist = (userId: string, updatedItems: CartItem[]) => {
        localUpdateRef.current = true;
        // Update local state immediately — no waiting for Firestore
        setCart(updatedItems);
        // Write to Firestore in background
        setDoc(doc(db, 'carts', userId), {
            items: updatedItems,
            updatedAt: new Date().toISOString()
        }).finally(() => {
            // Allow onSnapshot to update state again after write settles
            setTimeout(() => { localUpdateRef.current = false; }, 500);
        });
    };

    const addToCart = (product: any) => {
        if (!user) return;
        const existing = cart.find(item => item.id === product.id);
        let updated: CartItem[];
        if (existing) {
            updated = cart.map(item =>
                item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            );
        } else {
            updated = [...cart, {
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
                image: product.image
            }];
        }
        persist(user.uid, updated);
    };

    const removeFromCart = (productId: number) => {
        if (!user) return;
        const updated = cart.filter(item => item.id !== productId);
        persist(user.uid, updated);
    };

    const updateQuantity = (productId: number, quantity: number) => {
        if (!user) return;
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        const updated = cart.map(item =>
            item.id === productId ? { ...item, quantity } : item
        );
        persist(user.uid, updated);
    };

    const clearCart = () => {
        if (!user) return;
        persist(user.uid, []);
    };

    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{ cart, loading, addToCart, removeFromCart, updateQuantity, clearCart, itemCount }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
