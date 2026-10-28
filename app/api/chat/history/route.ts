import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminDb, getAuthenticatedUser } from '@/lib/firebaseAdmin';
import { RequestError, enforceRateLimit, readJsonRequest, requestErrorResponse } from '@/lib/serverSecurity';
import { expiresAt } from '@/lib/retention';

export const dynamic = 'force-dynamic';

const SESSION_ID = /^[A-Za-z0-9]{20}$/;
type StoredMessage = {
    role: 'user' | 'assistant';
    content: string;
    suggestions?: { name: string; reason: string }[];
};

function parseMessages(value: unknown): StoredMessage[] | null {
    if (!Array.isArray(value) || value.length < 1 || value.length > 10) return null;
    const clean: StoredMessage[] = [];
    for (const entry of value) {
        if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return null;
        const { role, content, suggestions } = entry as Record<string, unknown>;
        if ((role !== 'user' && role !== 'assistant') || typeof content !== 'string' ||
            content.trim().length < 1 || content.length > 2000) return null;
        const message: StoredMessage = { role, content: content.trim() };
        if (suggestions !== undefined) {
            if (role !== 'assistant' || !Array.isArray(suggestions) || suggestions.length > 4) return null;
            const items: { name: string; reason: string }[] = [];
            for (const item of suggestions) {
                if (!item || typeof item !== 'object' || Array.isArray(item) ||
                    typeof item.name !== 'string' || typeof item.reason !== 'string' ||
                    item.name.length > 80 || item.reason.length > 240) return null;
                items.push({ name: item.name, reason: item.reason });
            }
            message.suggestions = items;
        }
        clean.push(message);
    }
    return clean.some(message => message.role === 'user') ? clean : null;
}

export async function GET(req: NextRequest) {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
    try {
        await enforceRateLimit('chat-history-read', user.uid, 60, 60_000);
        const snap = await getAdminDb().collection('chatHistory').doc(user.uid)
            .collection('sessions').orderBy('createdAt', 'desc').limit(50).get();
        const sessions = snap.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                title: data.title ?? 'Untitled',
                createdAt: data.createdAt?.toDate().toISOString() ?? null,
                messages: data.messages ?? [],
            };
        });
        return NextResponse.json({ sessions });
    } catch (error) {
        if (!(error instanceof RequestError)) console.error('Could not load chat history:', error);
        return requestErrorResponse(error, 'Could not load chat history');
    }
}

export async function POST(req: NextRequest) {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
    try {
        const body = await readJsonRequest<Record<string, unknown>>(req, 32 * 1024);
        const messages = parseMessages(body?.messages);
        const sessionId = body?.sessionId;
        if (!messages || (sessionId !== undefined && (typeof sessionId !== 'string' || !SESSION_ID.test(sessionId)))) {
            return NextResponse.json({ error: 'Invalid chat session.' }, { status: 400 });
        }
        await enforceRateLimit('chat-history-user', user.uid, 60, 60_000);
        const title = messages.find(message => message.role === 'user')!.content.slice(0, 50);
        const sessions = getAdminDb().collection('chatHistory').doc(user.uid).collection('sessions');
        if (typeof sessionId === 'string') {
            const ref = sessions.doc(sessionId);
            if (!(await ref.get()).exists) return NextResponse.json({ error: 'Session not found' }, { status: 404 });
            await ref.update({ title, messages, updatedAt: FieldValue.serverTimestamp(), expiresAt: expiresAt('CHAT_RETENTION_DAYS', 180) });
            return NextResponse.json({ id: ref.id, title });
        }
        const existing = await sessions.limit(50).get();
        if (existing.size >= 50) {
            return NextResponse.json({ error: 'You have reached the 50-session limit. Delete an older session to save a new one.' }, { status: 429 });
        }
        const ref = await sessions.add({ title, messages, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(), expiresAt: expiresAt('CHAT_RETENTION_DAYS', 180) });
        return NextResponse.json({ id: ref.id, title }, { status: 201 });
    } catch (error) {
        if (!(error instanceof RequestError)) console.error('Could not save chat history:', error);
        return requestErrorResponse(error, 'Could not save chat history.');
    }
}

export async function DELETE(req: NextRequest) {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
    const sessionId = req.nextUrl.searchParams.get('sessionId');
    if (!sessionId || !SESSION_ID.test(sessionId)) {
        return NextResponse.json({ error: 'Valid sessionId is required' }, { status: 400 });
    }
    try {
        await enforceRateLimit('chat-history-delete', user.uid, 60, 60_000);
        await getAdminDb().collection('chatHistory').doc(user.uid).collection('sessions').doc(sessionId).delete();
        return NextResponse.json({ success: true });
    } catch (error) {
        if (!(error instanceof RequestError)) console.error('Could not delete chat history:', error);
        return requestErrorResponse(error, 'Could not delete chat history');
    }
}
