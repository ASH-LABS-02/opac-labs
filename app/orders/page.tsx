'use client';

import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { downloadInvoice, getInvoiceDataURL } from '@/lib/generateInvoice';

interface Order {
    orderId: string;
    date: string;
    items: Array<{ name: string; quantity: number; price: number }>;
    total: number;
    status: 'Processing' | 'Delivered' | 'Cancelled';
    userName?: string;
    userEmail?: string;
}

function StatusBadge({ status }: { status: Order['status'] }) {
    const map = {
        Processing: { bg: '#fef9ec', color: '#92400e', dot: '#f59e0b' },
        Delivered:  { bg: '#f0fdf4', color: '#065f46', dot: '#10b981' },
        Cancelled:  { bg: '#fef2f2', color: '#991b1b', dot: '#ef4444' },
    };
    const s = map[status];
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', fontSize: '12px', fontWeight: '600', background: s.bg, color: s.color, border: `1px solid ${s.dot}22` }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, display: 'inline-block' }} />
            {status}
        </span>
    );
}

function PreviewModal({ order, onClose }: { order: Order; onClose: () => void }) {
    const [pdfUrl, setPdfUrl] = useState('');
    useEffect(() => { setPdfUrl(getInvoiceDataURL(order)); }, [order]);

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }} onClick={onClose}>
            <div style={{ background: '#fff', width: '100%', maxWidth: '820px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>
                {/* Modal header */}
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #e5e5e5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#111' }}>Invoice Preview</div>
                        <div style={{ fontSize: '12px', color: '#999' }}>Order #{order.orderId.slice(0, 8).toUpperCase()}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <button onClick={() => downloadInvoice(order)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#111', border: 'none', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                            Download
                        </button>
                        <button onClick={onClose} style={{ width: 32, height: 32, background: '#f5f5f5', border: '1px solid #e5e5e5', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                    </div>
                </div>
                <div style={{ flex: 1, background: '#f5f5f5', minHeight: '500px' }}>
                    {pdfUrl
                        ? <iframe src={pdfUrl} style={{ width: '100%', height: '100%', minHeight: '500px', border: 'none' }} title="Invoice" />
                        : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '500px', color: '#999', fontSize: '14px' }}>Generating invoice...</div>
                    }
                </div>
            </div>
        </div>
    );
}

export default function Orders() {
    const { user, loading } = useFirebaseAuth();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [previewOrder, setPreviewOrder] = useState<Order | null>(null);

    useEffect(() => {
        if (!loading && !user) router.push('/login');
    }, [user, loading, router]);

    useEffect(() => {
        const fetch = async () => {
            if (!user) return;
            try {
                const q = query(collection(db, 'orders'), where('userId', '==', user.uid));
                const snap = await getDocs(q);
                const fetched: Order[] = snap.docs.map(doc => {
                    const d = doc.data();
                    return { orderId: doc.id, date: d.createdAt?.toDate().toLocaleDateString() || 'N/A', items: d.items || [], total: d.total || 0, status: d.status || 'Processing', userName: d.userName, userEmail: d.userEmail };
                });
                fetched.sort((a, b) => b.orderId.localeCompare(a.orderId));
                setOrders(fetched);
            } catch (e) { console.error(e); }
            finally { setLoadingOrders(false); }
        };
        fetch();
    }, [user]);

    const handleDownload = useCallback((order: Order, e: React.MouseEvent) => { e.stopPropagation(); downloadInvoice(order); }, []);

    if (loading || !user) return <main><div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}><p>Loading...</p></div></main>;

    return (
        <>
            <main>
                {/* Hero — white, centered */}
                <div style={{ background: '#ffffff', padding: '48px 24px 40px', borderBottom: '1px solid #e5e5e5', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '32px', fontWeight: '600', color: '#111', lineHeight: 1.15 }}>My Orders</h1>
                </div>

                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '64px 24px 120px' }}>
                    {loadingOrders ? (
                        <div style={{ textAlign: 'center', padding: '80px 0', color: '#999', fontSize: '14px' }}>Loading your orders...</div>
                    ) : orders.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '80px 24px', border: '1px solid #e5e5e5', background: '#fafafa' }}>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" style={{ marginBottom: '20px' }}><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                            <p style={{ fontSize: '15px', color: '#666', marginBottom: '24px' }}>No orders yet.</p>
                            <Link href="/catalog" className="btn-primary" style={{ display: 'inline-block', width: 'auto', textDecoration: 'none' }}>Browse Products</Link>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {orders.map((order) => (
                                <div key={order.orderId} style={{ border: '1px solid #e5e5e5', background: '#fff' }}>
                                    {/* Order header */}
                                    <div style={{ padding: '20px 28px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#111', marginBottom: '3px' }}>Order #{order.orderId.slice(0, 8).toUpperCase()}</div>
                                            <div style={{ fontSize: '12px', color: '#999' }}>{order.date}</div>
                                        </div>
                                        <StatusBadge status={order.status} />
                                    </div>

                                    {/* Items */}
                                    <div style={{ padding: '0 28px' }}>
                                        <div style={{ padding: '16px 0 8px', fontSize: '11px', fontWeight: '600', color: '#999', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Products</div>
                                        {order.items.map((item, i) => (
                                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < order.items.length - 1 ? '1px solid #f5f5f5' : 'none' }}>
                                                <span style={{ fontSize: '14px', color: '#1a1a1a' }}>{item.name}</span>
                                                <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '12px', color: '#999', background: '#f5f5f5', padding: '2px 8px' }}>×{item.quantity}</span>
                                                    <span style={{ fontSize: '13px', color: '#111', fontWeight: '500', minWidth: '80px', textAlign: 'right' }}>Rs. {(item.price * item.quantity).toFixed(2)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Footer */}
                                    <div style={{ padding: '16px 28px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontSize: '11px', fontWeight: '600', color: '#999', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>Total</div>
                                            <div style={{ fontSize: '20px', fontWeight: '600', color: '#111' }}>Rs. {order.total.toFixed(2)}</div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => setPreviewOrder(order)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: '#fff', border: '1px solid #e5e5e5', color: '#444', fontSize: '13px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.15s' }}
                                                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#999'; (e.currentTarget as HTMLButtonElement).style.color = '#111'; }}
                                                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#e5e5e5'; (e.currentTarget as HTMLButtonElement).style.color = '#444'; }}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                                Preview
                                            </button>
                                            <button onClick={e => handleDownload(order, e)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: '#111', border: '1px solid #111', color: '#fff', fontSize: '13px', fontWeight: '500', cursor: 'pointer', transition: 'background 0.15s' }}
                                                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#333'; }}
                                                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#111'; }}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                                Download
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
            {previewOrder && <PreviewModal order={previewOrder} onClose={() => setPreviewOrder(null)} />}
        </>
    );
}
