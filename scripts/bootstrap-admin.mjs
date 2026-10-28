import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const email = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim();
const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;
if (!email || !password || password.length < 12) {
  console.error('Set ADMIN_BOOTSTRAP_EMAIL and ADMIN_BOOTSTRAP_PASSWORD (at least 12 characters).');
  process.exit(1);
}
if (!/^(localhost|127\.0\.0\.1|\[::1\]|emulators):9099$/.test(process.env.FIREBASE_AUTH_EMULATOR_HOST || '')) {
  console.error('Admin bootstrap is limited to the local Auth emulator. Use a separate, reviewed process for production.');
  process.exit(1);
}
const app = initializeApp({ projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-opac-labs' });
const auth = getAuth(app);
let user;
try {
  user = await auth.getUserByEmail(email);
  if (user.customClaims?.admin === true && user.emailVerified) {
    console.log(`Admin access already configured for ${email}.`);
    process.exit(0);
  }
  console.error('Refusing to promote an existing non-admin account. Choose a new admin email.');
  process.exit(1);
} catch (error) {
  if (error.code !== 'auth/user-not-found') throw error;
  user = await auth.createUser({ email, password, emailVerified: true });
}
await auth.setCustomUserClaims(user.uid, { admin: true });
console.log(`Admin access ready for ${email}.`);
