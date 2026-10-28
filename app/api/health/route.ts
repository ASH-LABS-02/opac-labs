import { NextResponse } from 'next/server';
import { rateLimiterReady } from '@/lib/serverSecurity';
import { getAdminApp } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

export async function GET() {
    let credentialsReady = true;
    try { getAdminApp(); } catch { credentialsReady = false; }
    const ready = credentialsReady && await rateLimiterReady();
    return NextResponse.json({ status: ready ? 'ok' : 'unavailable' }, {
        status: ready ? 200 : 503,
        headers: { 'Cache-Control': 'no-store' },
    });
}
