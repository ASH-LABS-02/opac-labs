import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { getDatabase, getMongoClient, type StoredRecord } from '../lib/database';
import { flushTelegramNotifications, pendingTelegramNotification, telegramAlert } from '../lib/notifications';
import { pairedPrivateChat } from './setup-telegram.mjs';

test('Telegram pairing accepts only the one-time code from one personal account', () => {
    const state = { nonce: 'owner-only-random-fixture', createdAt: Date.now() };
    const message = { text: `/start ${state.nonce}`, date: Math.floor(Date.now() / 1000), chat: { id: 123456789, type: 'private' }, from: { id: 123456789, is_bot: false } };
    assert.equal(pairedPrivateChat([{ message }], state), '123456789');
    for (const changed of [{ text: '/start' }, { text: '/start incorrect' }, { chat: { id: -123456789, type: 'group' } }, { from: { id: 123456789, is_bot: true } }, { date: 0 }]) {
        assert.throws(() => pairedPrivateChat([{ message: { ...message, ...changed } }], state));
    }
    assert.throws(() => pairedPrivateChat([{ message }, { message: { ...message, chat: { id: 987654321, type: 'private' }, from: { id: 987654321, is_bot: false } } }], state));
});

test('Telegram outbox keeps saved enquiries, leases concurrent work and retries failed sends', async t => {
    const mongo = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongo.getUri(); process.env.MONGODB_DB = 'opac_notifications_test';
    process.env.BETTER_AUTH_URL = 'https://opac.example.test';
    process.env.TELEGRAM_BOT_TOKEN = '123456789:' + 'A'.repeat(35); process.env.TELEGRAM_CHAT_ID = '123456789';
    const calls: Record<string, unknown>[] = [];
    let error: number | null = null;
    const mockFetch = t.mock.method(globalThis, 'fetch', async (url: string, init: RequestInit) => {
        assert.equal(url, 'https://api.telegram.org/bot' + process.env.TELEGRAM_BOT_TOKEN + '/sendMessage');
        calls.push(JSON.parse(init.body as string));
        return Response.json(error ? { ok: false, error_code: error, parameters: { retry_after: 120 } } : { ok: true, result: { message_id: calls.length } }, { status: error || 200 });
    });
    try {
        const db = await getDatabase();
        const enquiries = db.collection<StoredRecord>('contactMessages');
        const make = (id: string) => ({ _id: id, name: 'Customer <b>text</b>', email: 'private@example.test', phone: '+919876543210', message: 'A project brief with a preview. ' + 'x'.repeat(500), createdAt: new Date(), expiresAt: new Date(Date.now() + 86400_000), telegram: pendingTelegramNotification() });
        const alert = telegramAlert(make('format'), 'contactMessages', 'https://opac.example.test');
        assert.equal('parse_mode' in alert, false); assert.equal(alert.allow_paid_broadcast, false);
        assert.ok(alert.text.includes('<b>text</b>')); assert.ok(alert.text.length < 650);
        assert.ok(!alert.text.includes('private@example.test')); assert.ok(!alert.text.includes('+919876543210'));
        assert.equal(alert.reply_markup.inline_keyboard[0][0].url, 'https://opac.example.test/admin?inbox=messages');

        await enquiries.insertOne(make('one'));
        const pair = await Promise.all([flushTelegramNotifications({ limit: 1 }), flushTelegramNotifications({ limit: 1 })]);
        assert.equal(pair.reduce((n, r) => n + r.delivered, 0), 1); assert.equal(calls.length, 1);
        assert.equal((await enquiries.findOne({ _id: 'one' }))?.telegram.status, 'sent');
        await flushTelegramNotifications({ limit: 1 }); assert.equal(calls.length, 1, 'Delivered events cannot be sent again.');

        await enquiries.insertOne(make('retry'));
        error = 429;
        assert.equal((await flushTelegramNotifications({ limit: 1 })).deferred, 1);
        const pending = await enquiries.findOne({ _id: 'retry' });
        assert.equal(pending?.telegram.status, 'pending'); assert.equal(pending?.telegram.errorCode, 429);
        assert.ok(pending?.telegram.nextAttemptAt.getTime() > Date.now() + 110_000);
        assert.equal(pending?.message, make('retry').message, 'Delivery failures cannot change the saved enquiry.');
        error = null;
        await flushTelegramNotifications({ limit: 1 }); assert.equal(calls.length, 2, 'Backoff must be respected.');
        await enquiries.updateOne({ _id: 'retry' }, { $set: { 'telegram.nextAttemptAt': new Date(0) } });
        assert.equal((await flushTelegramNotifications({ limit: 1 })).delivered, 1);

        await enquiries.insertOne(make('crashed-worker'));
        await enquiries.updateOne({ _id: 'crashed-worker' }, { $set: { 'telegram.status': 'sending', 'telegram.nextAttemptAt': new Date(0), 'telegram.leaseId': 'stale' } });
        assert.equal((await flushTelegramNotifications({ limit: 1 })).delivered, 1, 'Expired delivery leases can be recovered.');

        await enquiries.insertOne(make('daily-cap'));
        const beforeCap = calls.length;
        await db.collection<StoredRecord>('notificationControl').updateOne({ _id: 'telegram' }, { $set: { day: new Date().toISOString().slice(0, 10), attemptsToday: 200 } });
        await flushTelegramNotifications(); assert.equal(calls.length, beforeCap);
        assert.equal((await enquiries.findOne({ _id: 'daily-cap' }))?.telegram.status, 'pending');

        delete process.env.TELEGRAM_CHAT_ID;
        assert.equal((await flushTelegramNotifications()).enabled, false); assert.equal(calls.length, beforeCap);
        process.env.TELEGRAM_CHAT_ID = '-123456789';
        assert.equal((await flushTelegramNotifications()).enabled, false, 'Only the paired private chat is supported.');
        mockFetch.mock.restore();
    } finally { await getMongoClient().close(); await mongo.stop(); }
});
