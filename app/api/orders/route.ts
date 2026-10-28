import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb, getAuthenticatedUser } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

// Historical records remain readable to their owners. Component ordering is closed.
export async function GET(req: NextRequest) {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
    try {
        const snap = await getAdminDb().collection('orders').where('userId', '==', user.uid).get();
        const orders = snap.docs.map(doc => ({ orderId: doc.id, ...doc.data() }));
        return NextResponse.json({ orders });
    } catch (error) {
        console.error('Could not load historical orders:', error);
        return NextResponse.json({ error: 'Could not load historical records' }, { status: 500 });
    }
}

export async function POST() {
    return NextResponse.json({ error: 'Component ordering is unavailable. Please request a software or hardware project instead.' }, { status: 410 });
}
