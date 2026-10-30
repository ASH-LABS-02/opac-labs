import { getAuthServer, getAuthenticatedUser, hasRecentSecondFactor } from '@/lib/auth';
import { clientAddress, enforceRateLimit, readJsonRequest, requestErrorResponse } from '@/lib/serverSecurity';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function authHeaders(request: Request) {
    const headers = new Headers(request.headers);
    const address = clientAddress(request);
    // Overwrite any caller-supplied value; every request has a quota identity.
    headers.set('x-opac-auth-ip', ['local', 'unknown'].includes(address) ? '127.0.0.1' : address);
    headers.delete('content-length');
    return headers;
}

const sensitive = new Set([
    '/two-factor/enable', '/two-factor/disable', '/two-factor/get-totp-uri',
    '/two-factor/generate-backup-codes', '/two-factor/view-backup-codes',
    '/change-password', '/set-password', '/change-email', '/delete-user',
    '/revoke-session', '/revoke-sessions', '/revoke-other-sessions',
]);

export async function GET(request: Request) {
    try { return await (await getAuthServer()).handler(new Request(request, { headers: authHeaders(request) })); }
    catch { return Response.json({ error: 'Account service is temporarily unavailable.' }, { status: 503 }); }
}

export async function POST(request: Request) {
    try {
        const body = await readJsonRequest(request, 16 * 1024);
        if (sensitive.has(new URL(request.url).pathname.replace(/^\/api\/auth/, ''))) {
            await enforceRateLimit('sensitive-auth-ip', clientAddress(request), 10, 60_000);
            const user = await getAuthenticatedUser(request);
            if (user?.twoFactorEnabled && !hasRecentSecondFactor(user.session)) {
                return Response.json({ error: 'Verify your authenticator again before changing account security.', code: 'TWO_FACTOR_REQUIRED' }, { status: 403 });
            }
        }
        const bounded = new Request(request.url, { method: 'POST', headers: authHeaders(request), body: JSON.stringify(body) });
        return await (await getAuthServer()).handler(bounded);
    } catch (error) { return requestErrorResponse(error, 'Account service is temporarily unavailable.'); }
}
