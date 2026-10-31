import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
const fixture = {
 MONGODB_URI: 'mongodb+srv://fixture-user:fixture-only@fixture.mongodb.net/opac_labs', MONGODB_DB: 'opac_labs', MONGODB_TRANSACTIONS: 'true',
 BETTER_AUTH_URL: 'https://opaclab-web.netlify.app', BETTER_AUTH_SECRET: 'fixture-only-000000000000000000000000000000000000',
 SMTP_HOST: 'smtp.gmail.com', SMTP_PORT: '465', SMTP_USER: 'fixture@example.test', SMTP_PASSWORD: 'fixture-only', EMAIL_FROM: 'OPAC Labs <fixture@example.test>',
 TRUST_PROXY_HEADERS: 'true', TRUSTED_PROXY_PROVIDER: 'netlify', OPAC_PAID_AI_ENABLED: 'false',
};
function check(changes = {}) { return spawnSync(process.execPath, ['scripts/production-preflight.mjs','--platform=netlify'], { encoding: 'utf8', env: { PATH:process.env.PATH,SystemRoot:process.env.SystemRoot,...fixture,...changes } }); }
test('Atlas and SMTP configuration passes offline validation', () => { assert.equal(check().status,0); });
test('standard Atlas seed hosts with TLS pass too', () => { assert.equal(check({ MONGODB_URI: 'mongodb://fixture:fixture-only@one.mongodb.net:27017,two.mongodb.net:27017/opac_labs?tls=true&replicaSet=fixture' }).status, 0); });

test('Telegram configuration must be complete and restricted to the paired private chat', () => {
 const token='123456789:'+ 'A'.repeat(35);
 assert.equal(check({TELEGRAM_BOT_TOKEN:token,TELEGRAM_CHAT_ID:'123456789'}).status,0);
 for(const change of [{TELEGRAM_BOT_TOKEN:token},{TELEGRAM_CHAT_ID:'123456789'},{TELEGRAM_BOT_TOKEN:token,TELEGRAM_CHAT_ID:'-123456789'},{TELEGRAM_BOT_TOKEN:'placeholder',TELEGRAM_CHAT_ID:'123456789'}]) assert.notEqual(check(change).status,0);
});
test('missing credentials, local transports, public secrets and unsafe origins are blocked', () => {
 for(const change of [{MONGODB_URI:''},{MONGODB_URI:fixture.MONGODB_URI+'?tls=false'},{MONGODB_URI:fixture.MONGODB_URI+'?tlsAllowInvalidCertificates=true'},{MONGODB_URI:fixture.MONGODB_URI+'?tlsAllowInvalidHostnames=true'},{MONGODB_URI:fixture.MONGODB_URI+'?tlsInsecure=true'},{MONGODB_URI:'mongodb://localhost/opac'},{BETTER_AUTH_SECRET:'short'},{SMTP_PASSWORD:''},{SMTP_ALLOW_INSECURE_LOCAL:'true'},{OPAC_LOCAL_MAILBOX:'/tmp/mail'},{NEXT_PUBLIC_MONGODB_URI:fixture.MONGODB_URI},{MONGODB_TRANSACTIONS:'false'},{BETTER_AUTH_URL:'http://localhost:3007'},{TRUSTED_PROXY_PROVIDER:'unknown'},{OPAC_PAID_AI_ENABLED:'true'}]) assert.notEqual(check(change).status,0);
});
