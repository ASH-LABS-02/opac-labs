'use client';

import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
async function downloadInvoice(order: Order) {
    try {
        const invoice = await import('@/lib/generateInvoice');
        invoice.downloadInvoice(order);
    } catch (error) {
        console.error('Could not generate invoice:', error);
        window.alert('Could not download the invoice. Please try again.');
    }
}

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
    const styles = {
        Processing: { bg: '#ffe87a', color: '#111' },
        Delivered: { bg: 'var(--opac-green)', color: '#111' },
        Cancelled: { bg: '#ffcdd2', color: '#991b1b' },
    };
    const s = styles[status] || styles.Processing;
    return (
        <span style={{
            display: 'inline-block',
            padding: '4px 12px',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-archivo-black), sans-serif',
            textTransform: 'uppercase',
            background: s.bg,
            color: s.color,
            border: '2px solid #111',
            boxShadow: '2px 2px 0px #111',
            borderRadius: '2px'
        }}>
            {status}
        </span>
    );
}

function PreviewModal({ order, onClose }: { order: Order; onClose: () => void }) {
    const [pdfUrl, setPdfUrl] = useState('');
    const [error, setError] = useState('');
    useEffect(() => {
        let cancelled = false;
        setPdfUrl('');
        setError('');
        import('@/lib/generateInvoice').then(({ getInvoiceDataURL }) => {
            if (!cancelled) setPdfUrl(getInvoiceDataURL(order));
        }).catch(() => { if (!cancelled) setError('Could not load the invoice. Please close and try again.'); });
        return () => { cancelled = true; };
    }, [order]);

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }} onClick={onClose}>
            <div style={{
                background: '#fff',
                width: '100%',
                maxWidth: '820px',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                border: '4px solid #111',
                boxShadow: '10px 10px 0px #111'
            }} onClick={e => e.stopPropagation()}>

                {/* Modal header */}
                <div style={{
                    padding: '16px 24px',
                    background: '#ffe87a',
                    borderBottom: '3px solid #111',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div>
                        <div style={{ fontSize: '16px', fontFamily: 'var(--font-archivo-black), sans-serif', textTransform: 'uppercase' }}>
                            INVOICE PREVIEW
                        </div>
                        <div style={{ fontSize: '12px', fontFamily: 'var(--font-space-mono), monospace', color: '#444' }}>
                            ORDER #{order.orderId.slice(0, 8).toUpperCase()}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <button
                            onClick={() => downloadInvoice(order)}
                            className="manga-btn-primary"
                            style={{ padding: '8px 14px', fontSize: '0.8rem' }}
                        >
                            DOWNLOAD
                        </button>
                        <button
                            onClick={onClose}
                            className="manga-btn-secondary"
                            style={{ padding: '8px 12px', fontSize: '0.8rem' }}
                        >
                            CLOSE
                        </button>
                    </div>
                </div>

                <div style={{ flex: 1, background: '#f5f5f5', minHeight: '500px' }}>
                    {pdfUrl ? (
                        <iframe src={pdfUrl} style={{ width: '100%', height: '100%', minHeight: '500px', border: 'none' }} title="Invoice" />
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '500px', color: '#111', fontFamily: 'var(--font-space-mono), monospace', fontSize: '14px' }}>
                            {error || 'GENERATING INVOICE...'}
                        </div>
                    )}
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
                    return {
                        orderId: doc.id,
                        date: d.createdAt?.toDate().toLocaleDateString() || 'N/A',
                        items: d.items || [],
                        total: d.total || 0,
                        status: d.status || 'Processing',
                        userName: d.userName,
                        userEmail: d.userEmail
                    };
                });
                fetched.sort((a, b) => b.orderId.localeCompare(a.orderId));
                setOrders(fetched);
            } catch (e) {
                console.error(e);
            } finally {
                setLoadingOrders(false);
            }
        };
        fetch();
    }, [user]);

    const handleDownload = useCallback((order: Order, e: React.MouseEvent) => {
        e.stopPropagation();
        downloadInvoice(order);
    }, []);

    if (loading || !user) {
        return (
            <main className="manga-profile-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
                <div className="manga-panel" style={{ background: '#ffe87a', textAlign: 'center', padding: '24px 36px' }}>
                    <h2 style={{ fontFamily: 'var(--font-archivo-black), sans-serif', fontSize: '20px', margin: 0 }}>
                        LOADING ORDERS...
                    </h2>
                </div>
            </main>
        );
    }

    return (
        <>
            <main className="manga-profile-page" style={{ padding: '60px 20px 100px' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>

                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                        <h1 style={{
                            fontFamily: 'var(--font-archivo-black), sans-serif',
                            fontSize: 'clamp(28px, 4vw, 38px)',
                            textTransform: 'uppercase',
                            margin: '0 0 8px 0',
                            letterSpacing: '1px'
                        }}>
                            MY ORDERS & INVOICES
                        </h1>
                        <p style={{ fontFamily: 'var(--font-kalam), cursive', fontSize: '1.1rem', color: '#444', margin: 0 }}>
                            View your purchase history and download invoices
                        </p>
                    </div>

                    {loadingOrders ? (
                        <div className="manga-panel" style={{ textAlign: 'center', padding: '48px 24px', background: '#fff' }}>
                            <p style={{ fontFamily: 'var(--font-space-mono), monospace', fontSize: '14px', margin: 0 }}>
                                FETCHING ORDERS...
                            </p>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="manga-panel" style={{ textAlign: 'center', padding: '48px 24px', background: '#fff' }}>
                            <h3 style={{ fontFamily: 'var(--font-archivo-black), sans-serif', fontSize: '20px', marginBottom: '12px' }}>
                                NO ORDERS YET
                            </h3>
                            <p style={{ fontFamily: 'var(--font-space-mono), monospace', fontSize: '14px', color: '#555', marginBottom: '24px' }}>
                                You haven&apos;t placed any orders yet. Describe your idea and build your project to get started.
                            </p>
                            <Link href="/build-project" className="manga-btn-primary">
                                BUILD PROJECT
                            </Link>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {orders.map((order) => (
                                <div key={order.orderId} className="manga-panel" style={{ padding: '0', background: '#fff' }}>

                                    {/* Order header */}
                                    <div style={{
                                        padding: '20px 24px',
                                        background: '#ffe87a',
                                        borderBottom: '3px solid #111',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        flexWrap: 'wrap',
                                        gap: '12px'
                                    }}>
                                        <div>
                                            <div style={{ fontSize: '16px', fontFamily: 'var(--font-archivo-black), sans-serif', textTransform: 'uppercase' }}>
                                                ORDER #{order.orderId.slice(0, 8).toUpperCase()}
                                            </div>
                                            <div style={{ fontSize: '12px', fontFamily: 'var(--font-space-mono), monospace', color: '#444' }}>
                                                DATE: {order.date}
                                            </div>
                                        </div>
                                        <StatusBadge status={order.status} />
                                    </div>

                                    {/* Items */}
                                    <div style={{ padding: '20px 24px' }}>
                                        <div style={{
                                            fontSize: '0.75rem',
                                            fontFamily: 'var(--font-archivo-black), sans-serif',
                                            color: 'var(--opac-accent)',
                                            textTransform: 'uppercase',
                                            marginBottom: '12px'
                                        }}>
                                            PRODUCTS IN ORDER
                                        </div>
                                        {order.items.map((item, i) => (
                                            <div key={i} style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                padding: '10px 0',
                                                borderBottom: i < order.items.length - 1 ? '2px dashed #eee' : 'none'
                                            }}>
                                                <span style={{ fontSize: '14px', fontFamily: 'var(--font-space-mono), monospace', color: '#111' }}>
                                                    {item.name}
                                                </span>
                                                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                                    <span style={{
                                                        fontSize: '12px',
                                                        fontFamily: 'var(--font-space-mono), monospace',
                                                        background: '#f0f0f0',
                                                        border: '1px solid #111',
                                                        padding: '2px 8px'
                                                    }}>
                                                        x{item.quantity}
                                                    </span>
                                                    <span style={{
                                                        fontSize: '14px',
                                                        fontFamily: 'var(--font-archivo-black), sans-serif',
                                                        color: '#111',
                                                        minWidth: '90px',
                                                        textAlign: 'right'
                                                    }}>
                                                        Rs. {(item.price * item.quantity).toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Order Footer */}
                                    <div style={{
                                        padding: '16px 24px',
                                        borderTop: '3px solid #111',
                                        background: '#fafafa',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        flexWrap: 'wrap',
                                        gap: '16px'
                                    }}>
                                        <div>
                                            <div style={{ fontSize: '0.7rem', fontFamily: 'var(--font-archivo-black), sans-serif', textTransform: 'uppercase', color: '#666' }}>
                                                TOTAL AMOUNT
                                            </div>
                                            <div style={{ fontSize: '22px', fontFamily: 'var(--font-archivo-black), sans-serif', color: '#111' }}>
                                                Rs. {order.total.toFixed(2)}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button
                                                onClick={() => setPreviewOrder(order)}
                                                className="manga-btn-secondary"
                                                style={{ padding: '8px 16px', fontSize: '0.8rem' }}
                                            >
                                                PREVIEW
                                            </button>
                                            <button
                                                onClick={e => handleDownload(order, e)}
                                                className="manga-btn-primary"
                                                style={{ padding: '8px 16px', fontSize: '0.8rem' }}
                                            >
                                                DOWNLOAD INVOICE
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
