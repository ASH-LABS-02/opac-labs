import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let adminApp: App;

function getAdminApp(): App {
    if (getApps().length > 0) return getApps()[0];

    // Use service account JSON if provided, otherwise use application default credentials
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

    if (serviceAccountJson) {
        const serviceAccount = JSON.parse(serviceAccountJson);
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
