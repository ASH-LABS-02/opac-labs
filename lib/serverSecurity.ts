import { NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { isIP } from 'node:net';
import { records } from '@/lib/database';

export class RequestError extends Error {
    constructor(public status: number, message: string) {
        super(message);
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

export async function rateLimiterReady() {
    try { await (await records('rateLimits')).findOne({ _id: '_health' }, { projection: { _id: 1 } }); return true; } catch { return false; }
}

export function clientAddress(request: Request) {
    if (process.env.TRUST_PROXY_HEADERS !== 'true') return 'local';
    if (process.env.TRUSTED_PROXY_PROVIDER === 'netlify') {
        const address = request.headers.get('x-nf-client-connection-ip')?.trim() || '';
        return isIP(address) ? address : 'unknown';
    }
    const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '';
    return isIP(forwarded) ? forwarded : 'unknown';
}

// Each atomic update reserves a slot across every worker. Denied counters are
// capped at max + 1, and expiry resets the window without waiting for TTL cleanup.
export async function enforceRateLimit(scope: string, key: string, max: number, windowMs: number) {
    const digest = createHash('sha256').update(`${scope}:${key}`).digest('hex');
    const now = new Date();
    const end = new Date(now.getTime() + windowMs);
    try {
        const result = await (await records('rateLimits')).findOneAndUpdate({ _id: digest }, [{ $set: {
            count: { $min: [max + 1, { $cond: [{ $gt: ['$resetAt', now] }, { $add: ['$count', 1] }, 1] }] },
            resetAt: { $cond: [{ $gt: ['$resetAt', now] }, '$resetAt', end] },
            expiresAt: new Date(end.getTime() + 86400000),
        } }], { upsert: true, returnDocument: 'after' });
        if (!result || !Number.isSafeInteger(result.count) || result.count < 1) throw new Error('Invalid quota counter.');
        if (result.count > max) throw new RequestError(429, 'Too many requests. Please try again later.');
    } catch (error) {
        if (error instanceof RequestError) throw error;
        throw new RequestError(503, 'Service temporarily unavailable. Please try again later.');
    }
}

export async function readJsonRequest<T>(request: Request, maxBytes: number): Promise<T> {
    if (request.headers.get('sec-fetch-site') === 'cross-site') {
        throw new RequestError(403, 'Cross-origin requests are not allowed.');
    }
    if (request.headers.get('content-type')?.split(';', 1)[0]?.trim().toLowerCase() !== 'application/json') {
        throw new RequestError(415, 'Send JSON with Content-Type: application/json.');
    }
    const origin = request.headers.get('origin');
    if (origin) {
        const requestUrl = new URL(request.url);
        const host = request.headers.get('host');
        const forwardedProto = process.env.TRUST_PROXY_HEADERS === 'true'
            ? request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim() : undefined;
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
    let deadline: ReturnType<typeof setTimeout>;
    const timeout = new Promise<never>((_, reject) => {
        deadline = setTimeout(() => reject(new RequestError(408, 'Request timed out. Please try again.')), 10_000);
    });
    let bytes = 0;
    let text = '';
    try {
        while (true) {
            const { done, value } = await Promise.race([reader.read(), timeout]);
            if (done) break;
            bytes += value.byteLength;
            if (bytes > maxBytes) {
                void reader.cancel().catch(() => {});
                throw new RequestError(413, 'Request is too large.');
            }
            text += decoder.decode(value, { stream: true });
        }
        text += decoder.decode();
        const value = JSON.parse(text);
        if (!value || typeof value !== 'object' || Array.isArray(value)) throw new RequestError(400, 'A JSON object is required.');
        return value as T;
    } catch (error) {
        if (error instanceof RequestError) throw error;
        throw new RequestError(400, 'Invalid JSON request.');
    } finally {
        clearTimeout(deadline!);
        void reader.cancel().catch(() => {});
    }
}

export function requestErrorResponse(error: unknown, fallback: string) {
    if (error instanceof RequestError) {
        return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: fallback }, { status: 500 });
}
