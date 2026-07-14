import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

// GET /api/orders?userId=xxx  — fetch orders for a user
export async function GET(req: NextRequest) {
    const userId = req.nextUrl.searchParams.get('userId');
    if (!userId) {
        return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    try {
        const db = getAdminDb();
        const snap = await db
            .collection('orders')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();

        const orders = snap.docs.map(doc => {
            const d = doc.data();
            return {
                orderId: doc.id,
                date: d.createdAt?.toDate().toLocaleDateString() ?? 'N/A',
                items: d.items ?? [],
                total: d.total ?? 0,
                status: d.status ?? 'Processing',
                userName: d.userName,
                userEmail: d.userEmail,
            };
        });

        return NextResponse.json({ orders });
    } catch (err) {
        console.error('GET /api/orders error:', err);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}

// POST /api/orders  — create a new order
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId, userName, userEmail, items, total } = body;

        if (!userId || !items?.length || total == null) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const db = getAdminDb();
        const ref = await db.collection('orders').add({
            userId,
            userName: userName ?? '',
            userEmail: userEmail ?? '',
            items,
            total,
            status: 'Processing',
            createdAt: FieldValue.serverTimestamp(),
        });

        return NextResponse.json({ orderId: ref.id }, { status: 201 });
    } catch (err) {
        console.error('POST /api/orders error:', err);
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }
}
