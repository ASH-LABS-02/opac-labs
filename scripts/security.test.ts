import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { enforceRateLimit, rateLimiterReady, RequestError, clientAddress, readJsonRequest } from '../lib/serverSecurity';
import { getMongoClient, records } from '../lib/database';

test('MongoDB quotas are atomic across workers, reset on expiry, and fail closed', async () => {
    const mongo = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongo.getUri(); process.env.MONGODB_DB = 'opac_security_test';
    const scope = randomUUID();
    try {
        const result = await Promise.allSettled(Array.from({ length: 12 }, () => enforceRateLimit(scope, 'identifier', 3, 60000)));
        assert.equal(result.filter(item => item.status === 'fulfilled').length, 3);
        for (const item of result.filter(item => item.status === 'rejected')) { assert.ok(item.reason instanceof RequestError); assert.equal(item.reason.status, 429); }
        const collection = await records('rateLimits'), counter = await collection.findOne({});
        assert.ok(counter); assert.equal(counter.count, 4); assert.match(counter._id, /^[a-f0-9]{64}$/); assert.ok(counter.expiresAt instanceof Date);
        await collection.updateOne({ _id: counter._id }, { $set: { resetAt: new Date(0) } });
        await enforceRateLimit(scope, 'identifier', 3, 60000);
        assert.equal((await collection.findOne({ _id: counter._id }))?.count, 1);
        assert.equal(await rateLimiterReady(), true);
        await getMongoClient().close();
        await assert.rejects(enforceRateLimit(scope, 'identifier', 3, 60000), (e: unknown) => e instanceof RequestError && e.status === 503);
        assert.equal(await rateLimiterReady(), false);
    } finally { await getMongoClient().close(); await mongo.stop(); }
});

test('proxy identity and request checks reject spoofing, cross-origin writes and oversized bodies', async () => {
    process.env.TRUST_PROXY_HEADERS = 'true'; process.env.TRUSTED_PROXY_PROVIDER = 'netlify';
    assert.equal(clientAddress(new Request('https://opac.example', { headers: { 'x-forwarded-for': '1.2.3.4', 'x-nf-client-connection-ip': '203.0.113.8' } })), '203.0.113.8');
    assert.equal(clientAddress(new Request('https://opac.example', { headers: { 'x-forwarded-for': '1.2.3.4' } })), 'unknown');
    await assert.rejects(readJsonRequest(new Request('https://opac.example/api/contact', { method: 'POST', headers: { host: 'opac.example', origin: 'https://attacker.example', 'content-type': 'application/json' }, body: '{}' }), 100), (e: unknown) => e instanceof RequestError && e.status === 403);
    await assert.rejects(readJsonRequest(new Request('https://opac.example/api/contact', { method: 'POST', headers: { host: 'opac.example', 'content-type': 'application/json' }, body: JSON.stringify({ value: 'a'.repeat(500) }) }), 100), (e: unknown) => e instanceof RequestError && e.status === 413);
    for (const body of ['null', '[]', '"text"']) await assert.rejects(readJsonRequest(new Request('https://opac.example/api/contact', { method: 'POST', headers: { host: 'opac.example', 'content-type': 'application/json' }, body }), 100), (e: unknown) => e instanceof RequestError && e.status === 400);
});
