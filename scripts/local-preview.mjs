import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { mkdirSync, writeFileSync } from 'node:fs';
import { MongoMemoryServer } from 'mongodb-memory-server';
const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL('../', import.meta.url));
const port = process.argv[2] || '3007';
if (!/^\d+$/.test(port) || Number(port) < 1024 || Number(port) > 65535) throw new Error('Invalid preview port.');
const mongo = await MongoMemoryServer.create();
const secrets = join(process.env.USERPROFILE || process.env.HOME, '.codex', 'secrets');
mkdirSync(secrets, { recursive: true });
const mailbox = process.env.OPAC_LOCAL_MAILBOX || join(secrets, 'opac-local-mail.jsonl');
writeFileSync(join(secrets, 'opac-local-preview.json'), JSON.stringify({ uri: mongo.getUri(), db: 'opac_local_preview', port: Number(port) }), { mode: 0o600 });
const child = spawn(process.execPath, [require.resolve('next/dist/bin/next'), 'dev', '--hostname', 'localhost', '--port', port], {
    cwd: root, stdio: 'inherit', env: { ...process.env,
        NODE_ENV: 'development', MONGODB_URI: mongo.getUri(), MONGODB_DB: 'opac_local_preview', MONGODB_TRANSACTIONS: 'false',
        BETTER_AUTH_URL: `http://localhost:${port}`, BETTER_AUTH_SECRET: randomBytes(48).toString('base64url'),
        SMTP_HOST: '', SMTP_PORT: '', SMTP_USER: '', SMTP_PASSWORD: '',
        OPAC_LOCAL_MAILBOX: mailbox, OPAC_PAID_AI_ENABLED: 'false', OPENAI_API_KEY: '', OPENAI_API_KEY_FILE: '',
        TRUST_PROXY_HEADERS: 'false', TRUSTED_PROXY_PROVIDER: '',
    },
});
console.log(`Disposable MongoDB preview: http://localhost:${port}. Data is removed when stopped.`);
console.log(`Local verification/reset emails: ${mailbox}. No external email or paid AI calls.`);
async function stop() { child.kill(); await mongo.stop(); }
process.once('SIGINT', () => { void stop(); }); process.once('SIGTERM', () => { void stop(); });
child.once('exit', async code => { await mongo.stop(); process.exitCode = code || 0; });
