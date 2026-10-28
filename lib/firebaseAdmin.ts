import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import type { NextRequest } from 'next/server';
import { readFileSync } from 'node:fs';
import type { DecodedIdToken } from 'firebase-admin/auth';

let adminApp: App;

export function getAdminApp(): App {
    if (getApps().length > 0) return getApps()[0];

    // Use service account JSON if provided, otherwise use application default credentials
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_FILE
        ? readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_FILE, 'utf8')
        : process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

    if (serviceAccountJson) {
        const serviceAccount = JSON.parse(serviceAccountJson);
        const expectedProject = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
        if (!process.env.FIREBASE_AUTH_EMULATOR_HOST && expectedProject && serviceAccount.project_id !== expectedProject) {
            throw new Error('Firebase Admin credentials do not match the configured project.');
        }
        adminApp = initializeApp({ credential: cert(serviceAccount) });
    } else {
        // Fallback: initialize with project ID only (works in Firebase-hosted environments)
        adminApp = initializeApp({
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        });
    }

    return adminApp;
}

export function getAdminDb() {
    return getFirestore(getAdminApp());
}

export async function getAuthenticatedUser(req: NextRequest) {
    const match = /^Bearer (.+)$/i.exec(req.headers.get('authorization') || '');
    if (!match) return null;
    try {
        const user = await getAuth(getAdminApp()).verifyIdToken(match[1], true);
        // The local Auth emulator does not require email verification. Production does.
        return user.email_verified === true || process.env.FIREBASE_AUTH_EMULATOR_HOST ? user : null;
    } catch {
        return null;
    }
}

export async function getAdminUser(req: NextRequest) {
    const user = await getAuthenticatedUser(req);
    return await hasAdminAccess(user) ? user : null;
}

export function isAdminToken(user: DecodedIdToken | null) {
    return user?.admin === true && user.email_verified === true &&
        (process.env.ADMIN_MFA_REQUIRED !== 'true' || user.firebase?.sign_in_second_factor === 'totp');
}

export async function hasAdminAccess(user: DecodedIdToken | null) {
    if (!isAdminToken(user)) return false;
    if (process.env.ADMIN_MFA_REQUIRED !== 'true') return true;
    try {
        const access = await getAdminDb().collection('adminAccess').doc(user!.uid).get();
        return access.data()?.enabled === true;
    } catch {
        return false;
    }
}
