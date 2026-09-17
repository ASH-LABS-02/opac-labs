'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { useToast } from '@/contexts/ToastContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function Cart() {
    const { cart, loading, removeFromCart, updateQuantity, clearCart } = useCart();
    const { user, loading: authLoading } = useFirebaseAuth();
    const { showToast } = useToast();
    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState(false);
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const handleCheckout = async () => {
        if (!user) {
            // Store the intended destination
            localStorage.setItem('redirectAfterLogin', '/cart');
            router.push('/login');
            return;
        }

        setIsProcessing(true);

        try {
            const userName = user.displayName || 'Customer';
            const userEmail = user.email || '';
            const whatsappNumber = '917867089886';

            // Build message first (before async calls to avoid popup blocker)
            let message = `*New Order from ${userName}*\n`;
            message += `Email: ${userEmail}\n\n`;
            message += `*Order Details:*\n`;
            cart.forEach((item, index) => {
                message += `${index + 1}. ${item.name}\n`;
                message += `   Qty: ${item.quantity} × Rs. ${item.price.toFixed(2)} = Rs. ${(item.price * item.quantity).toFixed(2)}\n`;
            });
            message += `\n*Total: Rs. ${total.toFixed(2)}*`;

            // Open WhatsApp immediately (before async) to avoid popup blocker
            const whatsappWindow = window.open(
                `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`,
                '_blank'
            );

            if (!whatsappWindow) {
                showToast('Please allow popups to open WhatsApp.');
            }

            // Save order to Firestore in background
            await addDoc(collection(db, 'orders'), {
                userId: user.uid,
                userName,
                userEmail,
                items: cart.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    image: item.image
                })),
                total,
                status: 'Processing',
                createdAt: serverTimestamp()
            });

            clearCart();
            showToast('Order placed successfully!');

        } catch (error) {
            console.error('Error creating order:', error);
            showToast('Failed to place order. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (authLoading || loading) {
        return (
            <main className="cart-page">
                <div className="container">
                    <div className="empty-cart">
                        <p style={{ color: '#bbb', fontSize: '14px' }}>Loading...</p>
                    </div>
                </div>
            </main>
        );
    }

    if (cart.length === 0) {
        return (
            <main className="cart-page">
                <div className="container">
                    <div className="empty-cart">
                        <h1>Your next build<br />starts here.</h1>
                        <p>Your cart is empty. Explore our projects or use OPAC AI to plan your build.</p>
                        <Link href="/build-project" className="btn-primary" style={{ display: 'inline-block', width: 'auto', textDecoration: 'none' }}>
                            Build with OPAC AI ↗
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="cart-page">
            <div className="container">
                <div className="cart-header">
                    <h1>Your cart</h1>
                    <Link href="/build-project" className="continue-link">Continue building →</Link>
                </div>
                
                <div className="cart-table-scroll"><table className="cart-table">
                    <thead>
                        <tr>
                            <th>PRODUCT</th>
                            <th>QUANTITY</th>
                            <th>TOTAL</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {cart.map(item => (
                            <tr key={item.id}>
                                <td>
                                    <div className="cart-item">
                                        <div style={{ position: 'relative', width: '80px', height: '80px' }}>
                                            <Image 
                                                src={item.image} 
                                                alt={item.name} 
                                                fill
                                                className="cart-item-image"
                                                style={{ objectFit: 'contain' }}
                                            />
                                        </div>
                                        <div className="cart-item-title">
                                            {item.name}<br />Rs. {item.price.toFixed(2)}
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="cart-quantity">
                                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                                        <input 
                                            type="number" 
                                            value={item.quantity} 
                                            min="1"
                                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                                        />
                                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                                    </div>
                                </td>
                                <td>Rs. {(item.price * item.quantity).toFixed(2)}</td>
                                <td>
                                    <button className="cart-remove" onClick={() => removeFromCart(item.id)}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                        </svg>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table></div>
                
                <div className="cart-summary">
                    <div className="cart-total">
                        <span>Estimated total</span>
                        <span>Rs. {total.toFixed(2)}</span>
                    </div>
                    <div className="cart-note">Taxes included. Discounts and shipping calculated at checkout.</div>
                    <button 
                        className="btn-primary" 
                        onClick={handleCheckout}
                        disabled={isProcessing}
                    >
                        {isProcessing ? 'Processing...' : 'Check out via WhatsApp'}
                    </button>
                </div>
            </div>
        </main>
    );
}
