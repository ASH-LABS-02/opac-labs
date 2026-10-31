import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseEnv } from 'node:util';

export function pairedPrivateChat(updates, state) {
    const chats = new Set(updates.filter(update => {
        const m = update.message;
        return m?.text === `/start ${state.nonce}` && m.chat?.type === 'private' && m.from?.is_bot === false &&
            m.from.id === m.chat.id && m.date >= Math.floor(state.createdAt / 1000) - 10;
    }).map(update => String(update.message.chat.id)));
    if (chats.size !== 1) throw new Error('Open the one-time pairing link in your Telegram account and press Start first.');
    const chat = [...chats][0];
    if (!/^[1-9]\d{4,19}$/.test(chat)) throw new Error('A personal Telegram chat is required.');
    return chat;
}

async function run() {
    const [mode, envPath] = process.argv.slice(2);
    if (!['link', 'confirm', 'test'].includes(mode) || !envPath) throw new Error('Usage: node scripts/setup-telegram.mjs link|confirm|test PRIVATE_ENV_FILE');
    const file = resolve(envPath), stateFile = file + '.pairing.json';
    const envText = readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
    const env = parseEnv(envText);
    const token = env.TELEGRAM_BOT_TOKEN?.trim();
    if (!/^\d{5,20}:[A-Za-z0-9_-]{30,100}$/.test(token || '')) throw new Error('Save the BotFather token in TELEGRAM_BOT_TOKEN in the private file first.');
    async function api(method, payload = {}) {
        let response;
        try { response = await fetch(`https://api.telegram.org/bot${token}/${method}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: AbortSignal.timeout(10000), redirect: 'error' }); }
        catch { throw new Error('Could not reach Telegram. No credentials were printed.'); }
        const result = await response.json();
        if (!response.ok || result.ok !== true) throw new Error(`Telegram rejected ${method} (HTTP ${response.status}).`);
        return result.result;
    }
    const bot = await api('getMe');
    if (!bot.is_bot || !bot.username) throw new Error('The credential must belong to a dedicated Telegram bot.');
    if (mode === 'link') {
        const state = { botId: bot.id, nonce: randomBytes(24).toString('base64url'), createdAt: Date.now() };
        writeFileSync(stateFile, JSON.stringify(state), { mode: 0o600 });
        console.log(`Open this one-time link in your own Telegram account and press Start:\nhttps://t.me/${bot.username}?start=${state.nonce}`);
    } else if (mode === 'confirm') {
        if (!existsSync(stateFile)) throw new Error('Create a one-time pairing link first.');
        const state = JSON.parse(readFileSync(stateFile, 'utf8'));
        if (state.botId !== bot.id || Date.now() - state.createdAt > 30 * 60_000) throw new Error('Pairing expired or the bot changed. Create a new link.');
        const updates = await api('getUpdates', { timeout: 0, limit: 100, allowed_updates: ['message'] });
        const chat = pairedPrivateChat(updates, state);
        const line = `TELEGRAM_CHAT_ID=${chat}`;
        const next = /^TELEGRAM_CHAT_ID=.*$/m.test(envText) ? envText.replace(/^TELEGRAM_CHAT_ID=.*$/m, line) : envText.trimEnd() + '\n' + line + '\n';
        writeFileSync(file, next, { mode: 0o600 });
        unlinkSync(stateFile);
        console.log('Personal chat paired. Its identifier was saved privately; no token was printed.');
    } else {
        if (!/^[1-9]\d{4,19}$/.test(env.TELEGRAM_CHAT_ID || '')) throw new Error('Pair your personal chat first.');
        await api('sendMessage', { chat_id: env.TELEGRAM_CHAT_ID, text: 'OPAC Labs alerts are connected. New website messages and project briefs will appear here with a link to your staff dashboard.', allow_paid_broadcast: false, link_preview_options: { is_disabled: true } });
        console.log('Setup notification accepted by Telegram for the paired private chat.');
    }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
    run().catch(error => { console.error(error.message); process.exitCode = 1; });
}
