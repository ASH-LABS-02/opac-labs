import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { APIError, createAuthMiddleware } from 'better-auth/api';
import { twoFactor } from 'better-auth/plugins';
import { getDatabase, getMongoClient } from './database';
import { sendAccountEmail } from './email';
import { enforceRateLimit, RequestError } from './serverSecurity';
import { after } from 'next/server';

function configureAuth(db: Awaited<ReturnType<typeof getDatabase>>) {
    if (!process.env.BETTER_AUTH_SECRET || process.env.BETTER_AUTH_SECRET.length < 32) throw new Error('A strong auth secret is required.');
    const baseURL = process.env.BETTER_AUTH_URL || 'http://localhost:3007';
    return betterAuth({
        appName: 'OPAC Labs', baseURL, secret: process.env.BETTER_AUTH_SECRET,
        trustedOrigins: [new URL(baseURL).origin],
        database: mongodbAdapter(db, process.env.MONGODB_TRANSACTIONS === 'true' ? { client: getMongoClient() } : {}),
        emailAndPassword: {
            enabled: true, requireEmailVerification: true, minPasswordLength: 12, maxPasswordLength: 128,
            revokeSessionsOnPasswordReset: true,
            sendResetPassword: async ({ user, url }) => { after(() => sendAccountEmail(user.email, 'Reset your OPAC Labs password', url)); },
        },
        emailVerification: {
            sendOnSignUp: true, autoSignInAfterVerification: false,
            sendVerificationEmail: async ({ user, url }) => { after(() => sendAccountEmail(user.email, 'Verify your OPAC Labs email', url)); },
        },
        user: { additionalFields: { role: { type: 'string', defaultValue: 'user', input: false }, phone: { type: 'string', required: false, input: false } } },
        session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60, cookieCache: { enabled: false },
            additionalFields: { mfaVerifiedAt: { type: 'date', required: false, input: false } } },
        rateLimit: { enabled: true, storage: 'database', window: 60, max: 60,
            customStorage: { async consume(key, rule) {
                try { await enforceRateLimit('auth', key, rule.max, rule.window * 1000); return { allowed: true, retryAfter: 0 }; }
                catch (error) { if (error instanceof RequestError && error.status === 429) return { allowed: false, retryAfter: rule.window }; throw error; }
            } },
            customRules: {
                '/sign-in/email': { window: 300, max: 10 },
                '/sign-up/email': { window: 3600, max: 5 },
                '/request-password-reset': { window: 900, max: 5 },
                '/send-verification-email': { window: 900, max: 5 },
                '/two-factor/*': { window: 300, max: 10 },
            } },
        advanced: { cookiePrefix: 'opac', useSecureCookies: baseURL.startsWith('https:'),
            ipAddress: { ipAddressHeaders: ['x-opac-auth-ip'] } },
        plugins: [twoFactor({ issuer: 'OPAC Labs', skipVerificationOnEnable: false })],
        hooks: { after: createAuthMiddleware(async ctx => {
            // Only a successful second-factor exchange can grant this session staff access.
            if (!['/two-factor/verify-totp', '/two-factor/verify-backup-code'].includes(ctx.path)) return;
            if (ctx.context.returned instanceof APIError || (ctx.context.returned instanceof Response && !ctx.context.returned.ok)) return;
            const verified = ctx.context.newSession || ctx.context.session;
            if (verified?.session.token && verified.user.twoFactorEnabled) {
                await db.collection('session').updateOne({ token: verified.session.token }, { $set: { mfaVerifiedAt: new Date() } });
            }
        }) },
    });
}

let auth: ReturnType<typeof configureAuth> | undefined;
export async function getAuthServer() {
    if (!auth) auth = configureAuth(await getDatabase());
    return auth;
}

export async function getAuthenticatedSession(request: Request) {
    try { return await (await getAuthServer()).api.getSession({ headers: request.headers }); }
    catch { throw new RequestError(503, 'Account service is temporarily unavailable. Please try again later.'); }
}

export async function getAuthenticatedUser(request: Request) {
    const session = await getAuthenticatedSession(request);
    if (!session?.user.emailVerified) return null;
    return { uid: session.user.id, email: session.user.email, email_verified: true,
        name: session.user.name, phone: session.user.phone, role: session.user.role, session: session.session, twoFactorEnabled: session.user.twoFactorEnabled };
}

export function hasAdminAccess(user: Awaited<ReturnType<typeof getAuthenticatedUser>>) {
    return !!(user?.role === 'admin' && user.twoFactorEnabled && hasRecentSecondFactor(user.session));
}

export function hasRecentSecondFactor(session: { mfaVerifiedAt?: Date | null }) {
    const time = session.mfaVerifiedAt ? new Date(session.mfaVerifiedAt).getTime() : 0;
    return time > Date.now() - 30 * 60_000 && time <= Date.now() + 5000;
}

export async function getAdminUser(request: Request) {
    const user = await getAuthenticatedUser(request);
    return hasAdminAccess(user) ? user : null;
}
