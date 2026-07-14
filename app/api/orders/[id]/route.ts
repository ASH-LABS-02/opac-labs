import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';

// PATCH /api/orders/:id  — update order status (admin)
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const { status } = await req.json();
        const validStatuses = ['Processing', 'Delivered', 'Cancelled'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const db = getAdminDb();
        await db.collection('orders').doc(id).update({ status });
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('PATCH /api/orders/[id] error:', err);
        return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }
}

// GET /api/orders/:id  — get a single order
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const db = getAdminDb();
        const doc = await db.collection('orders').doc(id).get();
        if (!doc.exists) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }
        const d = doc.data()!;
        return NextResponse.json({
            orderId: doc.id,
            date: d.createdAt?.toDate().toLocaleDateString() ?? 'N/A',
            items: d.items ?? [],
            total: d.total ?? 0,
            status: d.status ?? 'Processing',
            userName: d.userName,
            userEmail: d.userEmail,
        });
    } catch (err) {
        console.error('GET /api/orders/[id] error:', err);
        return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
    }
}
