import { NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { isIP } from 'node:net';
import { createClient } from 'redis';
import { getAppCheck } from 'firebase-admin/app-check';
import { getAdminApp } from '@/lib/firebaseAdmin';

export class RequestError extends Error {
    constructor(public status: number, message: string) {
        super(message);
    }
}

export async function requireAppCheck(request: Request) {
    if (process.env.FIREBASE_APPCHECK_REQUIRED !== 'true') return;
    const token = request.headers.get('x-firebase-appcheck');
    if (!token) throw new RequestError(401, 'App verification required. Please reload and try again.');
    try {
        await getAppCheck(getAdminApp()).verifyToken(token);
    } catch {
        throw new RequestError(401, 'App verification failed. Please reload and try again.');
    }
}

export function validName(value: unknown): value is string {
    return typeof value === 'string' && value.trim().length >= 2 && value.length <= 120 &&
        !/[\u0000-\u001f\u007f\u2028\u2029]/.test(value);
}

export function validEmail(value: unknown): value is string {
    return typeof value === 'string' && value.length <= 254 &&
        /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value);
}

export function validPhone(value: unknown): value is string {
    return typeof value === 'string' && /^\+?[0-9 ()-]{7,30}$/.test(value) &&
        value.replace(/\D/g, '').length >= 7;
}

const counters = new Map<string, { count: number; resetAt: number }>();
function connectRedis() {
    const client = createClient({
        url: process.env.REDIS_URL,
        socket: { connectTimeout: 1500, reconnectStrategy: retries => retries > 1 ? false : 100 },
    });
    client.on('error', error => console.error('Redis rate limiter connection:', error));
    return client.connect().then(() => client);
}
let redisConnection: ReturnType<typeof connectRedis> | undefined;

function redisClient() {
    if (!redisConnection) redisConnection = connectRedis().catch(error => {
        redisConnection = undefined;
        throw error;
    });
    return redisConnection;
}

export async function rateLimiterReady() {
    if (!process.env.REDIS_URL) return process.env.NODE_ENV !== 'production' || !!process.env.FIREBASE_AUTH_EMULATOR_HOST;
    try { return (await (await redisClient()).ping()) === 'PONG'; }
    catch { return false; }
}

export function clientAddress(request: Request) {
    if (process.env.TRUST_PROXY_HEADERS !== 'true') return 'local';
    const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '';
    return isIP(forwarded) ? forwarded : 'unknown';
}

// Redis makes limits shared across web replicas. Local emulators retain an in-memory fallback.
export async function enforceRateLimit(scope: string, key: string, max: number, windowMs: number) {
    if (process.env.REDIS_URL) {
        const digest = createHash('sha256').update(key).digest('hex');
        const id = `opac:rate:${scope}:${digest}:${Math.floor(Date.now() / windowMs)}`;
        try {
            const client = await redisClient();
            const count = await client.eval(
                "local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('PEXPIRE',KEYS[1],ARGV[1]) end; return n",
                { keys: [id], arguments: [String(windowMs * 2)] },
            );
            if (Number(count) > max) throw new RequestError(429, 'Too many requests. Please try again later.');
            return;
        } catch (error) {
            if (error instanceof RequestError) throw error;
            console.error('Shared rate limiter unavailable:', error);
            throw new RequestError(503, 'Service temporarily unavailable. Please try again later.');
        }
    }
    if (process.env.NODE_ENV === 'production' && !process.env.FIREBASE_AUTH_EMULATOR_HOST) {
        throw new RequestError(503, 'Service temporarily unavailable. Please try again later.');
    }
    const now = Date.now();
    const id = `${scope}:${key}`;
    const previous = counters.get(id);
    if (previous && previous.resetAt > now && previous.count >= max) {
        throw new RequestError(429, 'Too many requests. Please try again later.');
    }
    counters.set(id, previous && previous.resetAt > now
        ? { count: previous.count + 1, resetAt: previous.resetAt }
        : { count: 1, resetAt: now + windowMs });
    if (counters.size > 1000) {
        for (const [entry, value] of counters) if (value.resetAt <= now) counters.delete(entry);
    }
}

export async function readJsonRequest<T>(request: Request, maxBytes: number): Promise<T> {
    if (request.headers.get('content-type')?.split(';', 1)[0]?.trim().toLowerCase() !== 'application/json') {
        throw new RequestError(415, 'Send JSON with Content-Type: application/json.');
    }
    const origin = request.headers.get('origin');
    if (origin) {
        const requestUrl = new URL(request.url);
        const host = request.headers.get('host');
        const forwardedProto = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim();
        const protocol = forwardedProto === 'http' || forwardedProto === 'https'
            ? forwardedProto : requestUrl.protocol.slice(0, -1);
        let sameOrigin = false;
        try {
            const originUrl = new URL(origin);
            sameOrigin = !!host && originUrl.host === host && originUrl.protocol === `${protocol}:`;
        } catch { /* Invalid Origin is rejected below. */ }
        if (!sameOrigin) throw new RequestError(403, 'Cross-origin requests are not allowed.');
    }
    const declaredLength = Number(request.headers.get('content-length'));
    if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
        throw new RequestError(413, 'Request is too large.');
    }
    if (!request.body) throw new RequestError(400, 'A JSON request body is required.');

    const reader = request.body.getReader();
    const decoder = new TextDecoder('utf-8', { fatal: true });
    let bytes = 0;
    let text = '';
    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            bytes += value.byteLength;
            if (bytes > maxBytes) {
                await reader.cancel();
                throw new RequestError(413, 'Request is too large.');
            }
            text += decoder.decode(value, { stream: true });
        }
        text += decoder.decode();
        return JSON.parse(text) as T;
    } catch (error) {
        if (error instanceof RequestError) throw error;
        throw new RequestError(400, 'Invalid JSON request.');
    }
}

export function requestErrorResponse(error: unknown, fallback: string) {
    if (error instanceof RequestError) {
        return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: fallback }, { status: 500 });
}
