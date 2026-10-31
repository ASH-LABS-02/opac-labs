import { randomUUID } from 'node:crypto';
import { getDatabase, type StoredRecord } from './database';

type Inbox = 'contactMessages' | 'projectRequests';
type Delivery = { status: 'pending' | 'sending' | 'sent'; attempts: number; nextAttemptAt: Date; leaseId?: string; sentAt?: Date; errorCode?: number | string };
type Enquiry = StoredRecord & { telegram: Delivery };
type Control = { _id: string; lockId: string; lockedUntil: Date; day?: string; attemptsToday?: number; lastAttemptAt?: Date };

export function pendingTelegramNotification(): Delivery {
    // Persisted with the enquiry itself, so no separate queue write can be lost.
    return { status: 'pending', attempts: 0, nextAttemptAt: new Date() };
}

function configuration() {
    const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
    const chatId = process.env.TELEGRAM_CHAT_ID?.trim();
    if (!token || !chatId) return null;
    if (!/^\d{5,20}:[A-Za-z0-9_-]{30,100}$/.test(token) || !/^[1-9]\d{4,19}$/.test(chatId)) return null;
    try {
        const origin = new URL(process.env.BETTER_AUTH_URL || '');
        if (origin.protocol !== 'https:' || origin.username || origin.password) return null;
        return { token, chatId, origin: origin.origin };
    } catch { return null; }
}

function preview(value: unknown, max: number) {
    if (typeof value !== 'string') return '';
    const clean = value.replace(/[\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]/g, ' ').replace(/\s+/g, ' ').trim();
    const chars = Array.from(clean);
    return chars.length > max ? chars.slice(0, max).join('') + '…' : clean;
}

export function telegramAlert(record: Enquiry, inbox: Inbox, origin: string) {
    const project = inbox === 'projectRequests';
    return {
        text: [project ? 'New project brief — OPAC Labs' : 'New website message — OPAC Labs',
            `From: ${preview(record.name, 120)}`,
            ...(project ? [`Service: ${preview(record.projectType, 40)}`] : []),
            `Preview: ${preview(project ? record.description : record.message, 400)}`,
            `Reference: ${record._id}`,
        ].join('\n'),
        // Plain text only: visitor content cannot supply Telegram formatting or buttons.
        link_preview_options: { is_disabled: true },
        allow_paid_broadcast: false,
        reply_markup: { inline_keyboard: [[{ text: project ? 'Open project briefs' : 'Open messages', url: `${origin}/admin?inbox=${project ? 'projects' : 'messages'}` }]] },
    };
}

export async function flushTelegramNotifications(options: { limit?: number } = {}) {
    const config = configuration();
    const summary = { enabled: !!config, delivered: 0, deferred: 0 };
    if (!config) return summary;
    const db = await getDatabase();
    const controls = db.collection<Control>('notificationControl');
    const lockId = randomUUID(), now = new Date();
    let control: Control | null;
    try {
        control = await controls.findOneAndUpdate({ _id: 'telegram', $or: [{ lockedUntil: { $lte: now } }, { lockedUntil: { $exists: false } }] },
            { $set: { lockId, lockedUntil: new Date(now.getTime() + 40_000) } }, { upsert: true, returnDocument: 'after' });
    } catch (error) {
        if ((error as { code?: number }).code === 11000) return summary; // Another worker owns the dispatcher.
        throw error;
    }
    if (!control) return summary;
    const deadline = Date.now() + 12_000;
    const limit = Math.max(1, Math.min(10, options.limit || 10));
    const day = new Date().toISOString().slice(0, 10);
    let attemptsToday = control.day === day ? control.attemptsToday || 0 : 0;
    try {
        const spacing = control.lastAttemptAt ? 1100 - (Date.now() - control.lastAttemptAt.getTime()) : 0;
        if (spacing > 0) await new Promise(resolve => setTimeout(resolve, Math.min(1100, spacing)));
        for (let i = 0; i < limit && Date.now() < deadline; i++) {
            // Keep notification spam bounded; excess enquiries stay queued for tomorrow.
            if (attemptsToday >= 200) break;
            const locked = await controls.updateOne({ _id: 'telegram', lockId, lockedUntil: { $gt: new Date() } },
                { $set: { lockedUntil: new Date(Date.now() + 40_000), day, attemptsToday: ++attemptsToday } });
            if (!locked.matchedCount) break;
            let claimed: { record: Enquiry; inbox: Inbox } | null = null;
            for (const inbox of (i % 2 ? ['projectRequests', 'contactMessages'] : ['contactMessages', 'projectRequests']) as Inbox[]) {
                const record = await db.collection<Enquiry>(inbox).findOneAndUpdate({
                    'telegram.status': { $in: ['pending', 'sending'] }, 'telegram.nextAttemptAt': { $lte: new Date() }, expiresAt: { $gt: new Date() },
                }, { $set: { 'telegram.status': 'sending', 'telegram.leaseId': lockId, 'telegram.nextAttemptAt': new Date(Date.now() + 60_000) }, $inc: { 'telegram.attempts': 1 } },
                { sort: { createdAt: 1 }, returnDocument: 'after' });
                if (record) { claimed = { record, inbox }; break; }
            }
            if (!claimed) {
                // Empty scheduled checks do not consume the daily delivery allowance.
                await controls.updateOne({ _id: 'telegram', lockId }, { $inc: { attemptsToday: -1 } });
                break;
            }
            const { record, inbox } = claimed;
            let retryAfter = Math.min(3600, 30 * 2 ** Math.min(record.telegram.attempts - 1, 7));
            let errorCode: string | number = 'network';
            try {
                await controls.updateOne({ _id: 'telegram', lockId }, { $set: { lastAttemptAt: new Date() } });
                const response = await fetch(`https://api.telegram.org/bot${config.token}/sendMessage`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ chat_id: config.chatId, ...telegramAlert(record, inbox, config.origin) }),
                    signal: AbortSignal.timeout(4000), redirect: 'error',
                });
                const result = await response.json() as { ok?: boolean; error_code?: number; parameters?: { retry_after?: number } };
                if (response.ok && result.ok === true) {
                    await db.collection<Enquiry>(inbox).updateOne({ _id: record._id, 'telegram.leaseId': lockId },
                        { $set: { 'telegram.status': 'sent', 'telegram.sentAt': new Date() }, $unset: { 'telegram.leaseId': '', 'telegram.errorCode': '' } });
                    summary.delivered++;
                    if (i + 1 < limit && Date.now() + 1100 < deadline) await new Promise(resolve => setTimeout(resolve, 1100));
                    continue;
                }
                errorCode = typeof result.error_code === 'number' ? result.error_code : response.status;
                const advised = result.parameters?.retry_after;
                if (typeof advised === 'number' && Number.isFinite(advised)) retryAfter = Math.max(retryAfter, Math.min(86_400, advised));
            } catch { /* Never log fetch errors: their URL contains the private bot token. */ }
            await db.collection<Enquiry>(inbox).updateOne({ _id: record._id, 'telegram.leaseId': lockId }, {
                $set: { 'telegram.status': 'pending', 'telegram.nextAttemptAt': new Date(Date.now() + retryAfter * 1000), 'telegram.errorCode': errorCode },
                $unset: { 'telegram.leaseId': '' },
            });
            summary.deferred++;
            break; // Back off the whole private chat after a provider failure.
        }
    } finally {
        await controls.updateOne({ _id: 'telegram', lockId }, { $set: { lockedUntil: new Date(0) } });
    }
    return summary;
}
