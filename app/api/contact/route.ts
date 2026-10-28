import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminDb, getAdminUser } from '@/lib/firebaseAdmin';
import { RequestError, clientAddress, enforceRateLimit, readJsonRequest, requestErrorResponse, requireAppCheck, validEmail, validName } from '@/lib/serverSecurity';
import { expiresAt } from '@/lib/retention';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        await enforceRateLimit('contact-global', 'all', 1000, 60_000);
        await enforceRateLimit('contact-ip', clientAddress(req), 10, 60_000);
        await requireAppCheck(req);
        const body = await readJsonRequest<Record<string, unknown>>(req, 16 * 1024);
        if (!body || typeof body !== 'object' || Array.isArray(body)) {
            return NextResponse.json({ error: 'Enter a valid name, email, and message.' }, { status: 400 });
        }
        const { name, email, message, website } = body;
        if (typeof website === 'string' && website.trim()) return NextResponse.json({ success: true }, { status: 201 });
        if (!validName(name) || !validEmail(email) || typeof message !== 'string' ||
            message.trim().length < 10 || message.length > 5000) {
            return NextResponse.json({ error: 'Enter your name, a valid email, and a message of at least 10 characters.' }, { status: 400 });
        }
        await enforceRateLimit('contact-email', email.toLowerCase(), 5, 15 * 60_000);
        const ref = await getAdminDb().collection('contactMessages').add({
            name: name.trim(), email: email.trim().toLowerCase(), message: message.trim(),
            status: 'new', createdAt: FieldValue.serverTimestamp(), expiresAt: expiresAt('CONTACT_RETENTION_DAYS', 180),
        });
        return NextResponse.json({ success: true, id: ref.id }, { status: 201 });
    } catch (error) {
        if (!(error instanceof RequestError)) console.error('Could not save contact message:', error);
        return requestErrorResponse(error, 'Could not send message. Please try again.');
    }
}

export async function GET(req: NextRequest) {
    if (!(await getAdminUser(req))) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    try {
        await enforceRateLimit('contact-admin-read', 'all', 60, 60_000);
        const snap = await getAdminDb().collection('contactMessages').orderBy('createdAt', 'desc').limit(100).get();
        return NextResponse.json({ messages: snap.docs.map(doc => ({ id: doc.id, ...doc.data(), createdAt: doc.data().createdAt?.toDate().toISOString() ?? null })) });
    } catch (error) {
        if (!(error instanceof RequestError)) console.error('Could not load messages:', error);
        return requestErrorResponse(error, 'Could not load messages');
    }
}
