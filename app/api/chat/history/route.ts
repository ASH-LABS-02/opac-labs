import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';

// GET /api/chat/history?userId=xxx  — fetch all chat sessions for a user
export async function GET(req: NextRequest) {
    const userId = req.nextUrl.searchParams.get('userId');
    if (!userId) {
        return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    try {
        const db = getAdminDb();
        const snap = await db
            .collection('chatHistory')
            .doc(userId)
            .collection('sessions')
            .orderBy('createdAt', 'desc')
            .get();

        const sessions = snap.docs.map(doc => {
            const d = doc.data();
            return {
                id: doc.id,
                title: d.title ?? 'Untitled',
                createdAt: d.createdAt?.toDate().toISOString() ?? null,
                messages: d.messages ?? [],
            };
        });

        return NextResponse.json({ sessions });
    } catch (err) {
        console.error('GET /api/chat/history error:', err);
        return NextResponse.json({ error: 'Failed to fetch chat history' }, { status: 500 });
    }
}

// DELETE /api/chat/history?userId=xxx&sessionId=yyy  — delete a session
export async function DELETE(req: NextRequest) {
    const userId = req.nextUrl.searchParams.get('userId');
    const sessionId = req.nextUrl.searchParams.get('sessionId');

    if (!userId || !sessionId) {
        return NextResponse.json({ error: 'userId and sessionId are required' }, { status: 400 });
    }

    try {
        const db = getAdminDb();
        await db
            .collection('chatHistory')
            .doc(userId)
            .collection('sessions')
            .doc(sessionId)
            .delete();

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('DELETE /api/chat/history error:', err);
        return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 });
    }
}
