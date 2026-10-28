import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cert, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

const [action, email] = process.argv.slice(2);
if (!['grant', 'revoke'].includes(action) || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  throw new Error('Usage: node --env-file=production.env scripts/manage-admin.mjs grant|revoke staff@example.com');
}
if (process.env.FIREBASE_AUTH_EMULATOR_HOST || process.env.FIRESTORE_EMULATOR_HOST) {
  throw new Error('Production admin management cannot run against Firebase emulators.');
}

const projectId = process.env.FIREBASE_PROJECT_ID;
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
if (!projectId || projectId.startsWith('demo-') || !serviceAccountPath) {
  throw new Error('Set a real FIREBASE_PROJECT_ID and FIREBASE_SERVICE_ACCOUNT_PATH in production.env.');
}
const serviceAccount = JSON.parse(readFileSync(resolve(serviceAccountPath), 'utf8'));
if (serviceAccount.project_id !== projectId) {
  throw new Error('The service account does not belong to FIREBASE_PROJECT_ID.');
}

const app = initializeApp({ credential: cert(serviceAccount), projectId });
const auth = getAuth(app);
const user = await auth.getUserByEmail(email.trim().toLowerCase());
if (action === 'grant' && !user.emailVerified) {
  throw new Error('Verify the staff email address before granting admin access.');
}

const claims = { ...(user.customClaims ?? {}) };
const access = getFirestore(app).collection('adminAccess').doc(user.uid);
if (action === 'grant') {
  claims.admin = true;
  await auth.setCustomUserClaims(user.uid, claims);
  await access.set({ enabled: true, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  await auth.revokeRefreshTokens(user.uid);
} else {
  await access.set({ enabled: false, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  await auth.revokeRefreshTokens(user.uid);
  delete claims.admin;
  await auth.setCustomUserClaims(user.uid, claims);
}
console.log(`Admin access ${action === 'grant' ? 'granted to' : 'revoked from'} ${user.email}. Existing refresh tokens were revoked.`);
