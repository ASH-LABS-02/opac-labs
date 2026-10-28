// Integration check for a running Next.js server and the demo Firebase emulators.
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
const base = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:3000';
const authBase = process.env.SMOKE_AUTH_URL || 'http://127.0.0.1:9099';
const firestoreBase = process.env.SMOKE_FIRESTORE_URL || 'http://127.0.0.1:8080';
if (![base, authBase, firestoreBase].every(url => ['localhost', '127.0.0.1'].includes(new URL(url).hostname))) {
  throw new Error('Smoke test only runs against local services.');
}
process.env.FIREBASE_AUTH_EMULATOR_HOST = new URL(authBase).host;
process.env.FIRESTORE_EMULATOR_HOST = new URL(firestoreBase).host;

async function call(path, options = {}) {
  const response = await fetch(base + path, options);
  const body = await response.json();
  return { status: response.status, body };
}
function expect(actual, expected, label) {
  if (actual !== expected) throw new Error(`${label}: expected ${expected}, got ${actual}`);
  console.log(`PASS ${label}`);
}

const email = `smoke-${Date.now()}@example.test`;
const brief = {
  name: 'Smoke Test', email, phone: '9876543210', projectType: 'software',
  description: 'A dashboard that helps a small team track project milestones.',
  budget: 'not-sure', timeline: 'flexible',
};
expect((await call('/api/request-project')).status, 401, 'request history requires sign-in');
expect((await call('/api/orders', { method: 'POST' })).status, 410, 'component orders are closed');
expect((await call('/api/seed-products', { method: 'POST' })).status, 410, 'catalog seeding is closed');

const anonymous = await call('/api/request-project', {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(brief),
});
expect(anonymous.status, 201, 'anonymous project brief persists');
if (!anonymous.body.requestId) throw new Error('Project request ID missing.');

const signup = await fetch(`${authBase}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-key`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password: 'LocalSmokeTest!123', returnSecureToken: true }),
});
const account = await signup.json();
expect(signup.status, 200, 'emulator sign-up');
const bearer = { Authorization: `Bearer ${account.idToken}` };
const signed = await call('/api/request-project', {
  method: 'POST', headers: { ...bearer, 'Content-Type': 'application/json' },
  body: JSON.stringify({ ...brief, projectType: 'hybrid' }),
});
expect(signed.status, 201, 'signed-in project brief persists');
const history = await call('/api/request-project', { headers: bearer });
expect(history.status, 200, 'client can load their briefs');
expect(history.body.requests.length, 1, 'client sees only their own brief');

const productRead = await fetch(`${firestoreBase}/v1/projects/demo-opac-labs/databases/(default)/documents/products/1`, { headers: bearer });
expect(productRead.status, 403, 'retired product data is not public');

const contact = await call('/api/contact', {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Smoke Test', email, message: 'Please contact me about a new software project.' }),
});
expect(contact.status, 201, 'contact message persists');

const chat = await call('/api/chat', {
  method: 'POST', headers: { 'Content-Type': 'application/json', Origin: base },
  body: JSON.stringify({ messages: [{ role: 'user', content: 'I need a web dashboard for project milestones' }] }),
});
expect(chat.status, 200, 'same-origin browser planner request responds');
if (!chat.body.suggestions?.some(step => step.name === 'Design the software') || chat.body.suggestions.some(step => 'price' in step || 'id' in step)) {
  throw new Error('Project planner returned product recommendations.');
}
console.log('PASS planner suggests service steps without products');

expect((await call('/api/request-project', {
  method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: 'hello',
})).status, 415, 'non-JSON form posts are rejected');
expect((await call('/api/request-project', {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: 'x'.repeat(13 * 1024),
})).status, 413, 'oversized project briefs are rejected');
expect((await call('/api/request-project', {
  method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://attacker.example' }, body: JSON.stringify(brief),
})).status, 403, 'cross-origin browser posts are rejected');
expect((await call('/api/request-project', {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...brief, projectType: 'constructor' }),
})).status, 400, 'prototype property names are not valid project types');
expect((await call('/api/request-project', {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...brief, name: 'Test\nStatus: approved' }),
})).status, 400, 'control characters cannot alter contact fields');

expect((await call('/api/chat/history', {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: [{ role: 'user', content: 'Build a dashboard' }] }),
})).status, 401, 'anonymous clients cannot save chat history');
const session = await call('/api/chat/history', {
  method: 'POST', headers: { ...bearer, 'Content-Type': 'application/json' },
  body: JSON.stringify({ messages: [{ role: 'user', content: 'Build a dashboard for project tracking' }] }),
});
expect(session.status, 201, 'authenticated chat history is saved by the API');
expect((await call('/api/chat/history', { headers: bearer })).body.sessions.length, 1, 'client sees their saved chat');
expect((await call('/api/chat/history', {
  method: 'POST', headers: { ...bearer, 'Content-Type': 'application/json' },
  body: JSON.stringify({ sessionId: session.body.id, messages: [{ role: 'user', content: 'Updated project dashboard idea' }] }),
})).status, 200, 'client can update their chat through the API');
expect((await call('/api/chat/history', {
  method: 'POST', headers: { ...bearer, 'Content-Type': 'application/json' },
  body: JSON.stringify({ messages: [{ role: 'admin', content: 'Forged role' }] }),
})).status, 400, 'forged chat roles are rejected');
const directChatWrite = await fetch(`${firestoreBase}/v1/projects/demo-opac-labs/databases/(default)/documents/chatHistory/${account.localId}/sessions/test`, {
  method: 'PATCH', headers: { ...bearer, 'Content-Type': 'application/json' },
  body: JSON.stringify({ fields: { title: { stringValue: 'Bypass' } } }),
});
expect(directChatWrite.status, 403, 'direct client chat writes are blocked');
expect((await call(`/api/chat/history?sessionId=${session.body.id}`, { method: 'DELETE', headers: bearer })).status, 200, 'client can delete their own chat');
expect((await call('/api/chat/history', { headers: bearer })).body.sessions.length, 0, 'deleted chat stays deleted');

const foreignBrief = await fetch(`${firestoreBase}/v1/projects/demo-opac-labs/databases/(default)/documents/projectRequests/${anonymous.body.requestId}`, { headers: bearer });
expect(foreignBrief.status, 403, 'client cannot read another visitor’s brief');
expect((await call('/api/contact', { headers: bearer })).status, 403, 'non-admin cannot read contact messages');
const validProfileWrite = await fetch(`${firestoreBase}/v1/projects/demo-opac-labs/databases/(default)/documents/users/${account.localId}`, {
  method: 'PATCH', headers: { ...bearer, 'Content-Type': 'application/json' },
  body: JSON.stringify({ fields: {
    name: { stringValue: 'Smoke Test' }, email: { stringValue: email }, phone: { stringValue: '9876543210' },
  } }),
});
expect(validProfileWrite.status, 200, 'valid profile updates remain available');
const profileWrite = await fetch(`${firestoreBase}/v1/projects/demo-opac-labs/databases/(default)/documents/users/${account.localId}`, {
  method: 'PATCH', headers: { ...bearer, 'Content-Type': 'application/json' },
  body: JSON.stringify({ fields: {
    name: { stringValue: 'Smoke Test' }, email: { stringValue: email }, phone: { stringValue: '1'.repeat(5000) },
  } }),
});
expect(profileWrite.status, 403, 'oversized profile fields are rejected by Firestore rules');

const adminAuth = getAuth(initializeApp({ projectId: 'demo-opac-labs' }, `smoke-${Date.now()}`));
for (const verified of [false, true]) {
  const adminEmail = `smoke-admin-${verified}-${Date.now()}@example.test`;
  const adminPassword = 'LocalAdminSmoke!123';
  const admin = await adminAuth.createUser({ email: adminEmail, password: adminPassword, emailVerified: verified });
  await adminAuth.setCustomUserClaims(admin.uid, { admin: true });
  const login = await fetch(`${authBase}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=demo-key`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: adminEmail, password: adminPassword, returnSecureToken: true }),
  });
  const adminAccount = await login.json();
  expect(login.status, 200, `${verified ? 'verified' : 'unverified'} admin signs into emulator`);
  const adminHeaders = { Authorization: `Bearer ${adminAccount.idToken}` };
  expect((await call('/api/contact', { headers: adminHeaders })).status, verified ? 200 : 403,
    `${verified ? 'verified' : 'unverified'} admin API access`);
  const ruleRead = await fetch(`${firestoreBase}/v1/projects/demo-opac-labs/databases/(default)/documents/contactMessages/${contact.body.id}`, { headers: adminHeaders });
  expect(ruleRead.status, verified ? 200 : 403, `${verified ? 'verified' : 'unverified'} admin Firestore access`);
}

const homeResponse = await fetch(base);
expect(homeResponse.headers.get('x-frame-options'), 'DENY', 'clickjacking header is present');
expect(homeResponse.headers.get('x-content-type-options'), 'nosniff', 'MIME sniffing is disabled');
if (!homeResponse.headers.get('content-security-policy')?.includes("frame-ancestors 'none'")) throw new Error('CSP frame policy missing.');
console.log('PASS CSP frame policy is present');
const privateResponse = await fetch(`${base}/api/request-project`, { headers: bearer });
expect(privateResponse.headers.get('cache-control'), 'no-store', 'private API responses are not cached');
const remoteImage = await fetch(`${base}/_next/image?url=${encodeURIComponent('https://example.com/image.png')}&w=640&q=75`, { signal: AbortSignal.timeout(10_000) });
expect(remoteImage.status, 400, 'arbitrary remote image optimization is closed');

for (let i = 0; i < 3; i++) {
  expect((await call('/api/request-project', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(brief),
  })).status, 201, `project brief within per-email allowance ${i + 3}`);
}
expect((await call('/api/request-project', {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(brief),
})).status, 429, 'repeat project submissions are throttled');
