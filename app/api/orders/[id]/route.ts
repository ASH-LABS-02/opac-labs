import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb, getAuthenticatedUser, getAdminUser, hasAdminAccess } from '@/lib/firebaseAdmin';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: RouteContext) {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
    try {
        const { id } = await params;
        const doc = await getAdminDb().collection('orders').doc(id).get();
        if (!doc.exists) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        const data = doc.data()!;
        if (data.userId !== user.uid && !(await hasAdminAccess(user))) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        return NextResponse.json({ orderId: doc.id, date: data.createdAt?.toDate().toLocaleDateString() ?? 'N/A', items: data.items ?? [], total: data.total ?? 0, status: data.status ?? 'Processing', userName: data.userName, userEmail: data.userEmail });
    } catch (error) {
        console.error('Could not load order:', error);
        return NextResponse.json({ error: 'Could not load order' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
    if (!(await getAdminUser(req))) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    try {
        const { status } = await req.json();
        if (!['Processing', 'Delivered', 'Cancelled'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }
        const { id } = await params;
        const ref = getAdminDb().collection('orders').doc(id);
        if (!(await ref.get()).exists) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        await ref.update({ status });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Could not update order:', error);
        return NextResponse.json({ error: 'Could not update order' }, { status: 500 });
    }
}
