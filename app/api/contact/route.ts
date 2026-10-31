import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { records, publicRecord } from '@/lib/database';
import { getAdminUser } from '@/lib/auth';
import { RequestError, clientAddress, enforceRateLimit, readJsonRequest, requestErrorResponse, validEmail, validName } from '@/lib/serverSecurity';
import { expiresAt } from '@/lib/retention';
import { after } from 'next/server';
import { pendingTelegramNotification, flushTelegramNotifications } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        await enforceRateLimit('contact-global', 'all', 1000, 60_000);
        await enforceRateLimit('contact-ip', clientAddress(req), 10, 60_000);
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
        const ref = { id: randomUUID() };
        await (await records('contactMessages')).insertOne({ _id: ref.id,
            name: name.trim(), email: email.trim().toLowerCase(), message: message.trim(),
            status: 'new', createdAt: new Date(), expiresAt: expiresAt('CONTACT_RETENTION_DAYS', 180),
            telegram: pendingTelegramNotification(),
        });
        after(async () => {
            try { await flushTelegramNotifications({ limit: 1 }); }
            catch { console.error('Contact alert deferred; the enquiry remains saved.'); }
        });
        return NextResponse.json({ success: true, id: ref.id }, { status: 201 });
    } catch (error) {
        if (!(error instanceof RequestError)) console.error('Could not save contact message:', error);
        return requestErrorResponse(error, 'Could not send message. Please try again.');
    }
}

export async function GET(req: NextRequest) {
    try {
        if (!(await getAdminUser(req))) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        await enforceRateLimit('contact-admin-read', 'all', 60, 60_000);
        const messages = (await (await records('contactMessages')).find({}).sort({ createdAt: -1 }).limit(100).toArray()).map(publicRecord);
        return NextResponse.json({ messages });
    } catch (error) {
        if (!(error instanceof RequestError)) console.error('Could not load messages:', error);
        return requestErrorResponse(error, 'Could not load messages');
    }
}
