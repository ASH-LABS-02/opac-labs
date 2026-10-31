import { MongoClient } from 'mongodb';
const failures = [];
const required = key => { const v = process.env[key]?.trim(); if (!v) failures.push(`${key} is required.`); return v; };
const mongo = required('MONGODB_URI'), url = required('BETTER_AUTH_URL'), secret = required('BETTER_AUTH_SECRET');
required('MONGODB_DB');
if (mongo) {
    try {
        const options = new MongoClient(mongo).options;
        const hosts = options.srvHost ? [options.srvHost] : options.hosts.map(host => host.host);
        if (!hosts.length || hosts.some(host => !host.endsWith('.mongodb.net')) || options.tls !== true ||
            options.rejectUnauthorized === false || typeof options.checkServerIdentity === 'function' ||
            !options.credentials?.username || !options.credentials.password ||
            /^(USERNAME|REPLACE.*)$/i.test(options.credentials.username) || /^(PASSWORD|REPLACE.*)$/i.test(options.credentials.password)) throw new Error();
    } catch { failures.push('Use an authenticated Atlas URI with verified TLS and no placeholders.'); }
}
if (url) { try { const target = new URL(url); if (target.protocol !== 'https:' || target.username || target.password || target.pathname !== '/' || /localhost|\.example$/.test(target.hostname)) throw new Error(); } catch { failures.push('BETTER_AUTH_URL must be the exact public HTTPS origin.'); } }
if (secret && (secret.length < 32 || /replace|local-development|change-before/i.test(secret))) failures.push('Use a random BETTER_AUTH_SECRET of at least 32 characters.');
for (const key of ['SMTP_HOST','SMTP_PORT','SMTP_USER','SMTP_PASSWORD','EMAIL_FROM']) required(key);
if (!['465','587'].includes(process.env.SMTP_PORT)) failures.push('SMTP_PORT must be 465 or 587.');
if (process.env.SMTP_ALLOW_INSECURE_LOCAL === 'true' || process.env.OPAC_LOCAL_MAILBOX) failures.push('Local email delivery cannot be enabled in production.');
if (process.env.MONGODB_TRANSACTIONS !== 'true') failures.push('MONGODB_TRANSACTIONS must be true for Atlas.');
if (process.env.TRUST_PROXY_HEADERS !== 'true') failures.push('TRUST_PROXY_HEADERS must be true behind the configured hosting proxy.');
if (process.argv.includes('--platform=netlify') && process.env.TRUSTED_PROXY_PROVIDER !== 'netlify') failures.push('TRUSTED_PROXY_PROVIDER must be netlify.');
if (process.env.OPAC_PAID_AI_ENABLED !== 'false') failures.push('Keep paid AI explicitly disabled for the free launch.');
if (process.env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_CHAT_ID) {
    if (!/^\d{5,20}:[A-Za-z0-9_-]{30,100}$/.test(process.env.TELEGRAM_BOT_TOKEN || '') || !/^[1-9]\d{4,19}$/.test(process.env.TELEGRAM_CHAT_ID || '')) failures.push('Telegram alerts require both a private bot token and the paired personal chat ID.');
}
if (Object.keys(process.env).some(k => /^(NEXT_PUBLIC_|VITE_).*(SECRET|PASSWORD|MONGODB_URI|PRIVATE_KEY|OPENAI|TOKEN)/.test(k))) failures.push('Remove server secrets from browser-prefixed variables.');
if (failures.length) { console.error('Production configuration blocked:\n' + failures.map(x => '- ' + x).join('\n')); process.exitCode = 1; }
else console.log('Production configuration shape verified. Live MongoDB, email and account flows must still be tested.');
