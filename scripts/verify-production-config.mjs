import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const developmentRules = read('firestore.rules');
const productionRules = read('firestore.prod.rules');
const normalAdmin = "function admin() { return signedIn() && request.auth.token.admin == true && request.auth.token.email_verified == true; }";
const productionAdmin = "function admin() { return signedIn() && request.auth.token.admin == true && request.auth.token.email_verified == true && request.auth.token.firebase.sign_in_second_factor == 'totp' && get(/databases/$(database)/documents/adminAccess/$(request.auth.uid)).data.enabled == true; }";

assert.ok(developmentRules.includes(normalAdmin), 'Local Firestore admin rule changed; review production rules.');
assert.equal(productionRules, developmentRules.replace(normalAdmin, productionAdmin), 'Production rules differ beyond the admin MFA requirement.');

const config = JSON.parse(read('firebase.prod.json'));
assert.equal(config.firestore.rules, 'firestore.prod.rules');
assert.equal(config.firestore.indexes, 'firestore.indexes.json');
const indexes = JSON.parse(read('firestore.indexes.json'));
for (const collectionGroup of ['projectRequests', 'contactMessages', 'sessions']) {
  assert.ok(indexes.fieldOverrides.some(override => override.collectionGroup === collectionGroup && override.fieldPath === 'expiresAt' && override.ttl === true), `Missing ${collectionGroup} TTL policy`);
}

console.log('Production Firestore rules and TTL policies verified.');
