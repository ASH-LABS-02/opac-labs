// Trusted, one-time profile import. Existing passwords/tokens/roles are never copied.
import { readFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { MongoClient, ObjectId } from 'mongodb';
import { hashPassword } from 'better-auth/crypto';

const input = process.argv[2];
if (!input || !process.env.MONGODB_URI) throw new Error('Usage: node --env-file=PRIVATE_ENV scripts/import-accounts.mjs PRIVATE_JSON');
const entries = JSON.parse(readFileSync(input, 'utf8').replace(/^\uFEFF/, ''));
if (!Array.isArray(entries)) throw new Error('Expected an array of trusted account profiles.');
const client = new MongoClient(process.env.MONGODB_URI);
try {
    const db = client.db(process.env.MONGODB_DB || 'opac_labs');
    await db.collection('user').createIndex({ email: 1 }, { unique: true });
    await db.collection('account').createIndex({ providerId: 1, accountId: 1 }, { unique: true });
    let imported = 0, skipped = 0;
    for (const entry of entries) {
        const email = typeof entry.email === 'string' ? entry.email.trim().toLowerCase() : '';
        if (!entry.emailVerified || entry.disabled || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { skipped++; continue; }
        if (await db.collection('user').findOne({ email })) { skipped++; continue; }
        const id = new ObjectId(), now = new Date();
        const name = typeof entry.name === 'string' ? entry.name.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 120) || 'OPAC Client' : 'OPAC Client';
        // An unknown random password forces email recovery before the first login.
        const password = await hashPassword(randomBytes(48).toString('base64url'));
        const session = client.startSession();
        try {
            await session.withTransaction(async () => {
                await db.collection('user').insertOne({ _id: id, name, email, emailVerified: true, role: 'user', twoFactorEnabled: false, createdAt: now, updatedAt: now }, { session });
                await db.collection('account').insertOne({ _id: new ObjectId(), providerId: 'credential', accountId: id.toString(), userId: id, password, createdAt: now, updatedAt: now }, { session });
            });
            imported++;
        } finally { await session.endSession(); }
    }
    console.log(`Account profiles imported: ${imported}; skipped: ${skipped}. Imported users must request a password reset. No emails sent.`);
} finally { await client.close(); }
