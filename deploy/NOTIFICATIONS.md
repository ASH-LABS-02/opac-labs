# Private Telegram alerts

Contact messages and project briefs can notify one paired owner's private Telegram chat. Normal Bot API sends are free; paid broadcasts are explicitly disabled. The bot is outbound-only after setup: Telegram messages do not grant staff access or change website records.

## Connect the owner's chat

1. In the official [BotFather](https://t.me/BotFather), use `/newbot` to create a dedicated alert bot. Save its token outside the repository in a private environment file as `TELEGRAM_BOT_TOKEN=...`. Treat the token as a password.
2. Run `node scripts/setup-telegram.mjs link PRIVATE_ENV_FILE`. Open the generated one-time link in the owner's Telegram account and press Start.
3. Run `node scripts/setup-telegram.mjs confirm PRIVATE_ENV_FILE`. The script accepts only the matching nonce from a personal, non-bot account. It writes `TELEGRAM_CHAT_ID` privately; it never prints credentials. A bare `/start` or the first arbitrary visitor to the bot cannot select the alert destination. Pairing expires after 30 minutes.
4. Run `node scripts/setup-telegram.mjs test PRIVATE_ENV_FILE` for a setup message to that chat.
5. Set both values in Netlify's production Builds and Functions environment, retain the same `BETTER_AUTH_URL`, and rebuild/redeploy using the guarded release command. Never use `NEXT_PUBLIC_` prefixes. Existing auth and MongoDB secrets must remain unchanged.

## Delivery behavior

- Each valid enquiry contains its pending delivery state in the same MongoDB insert. Honeypots and invalid submissions do not enqueue alerts.
- Next.js `after()` attempts delivery after saving and returning the form result. Contact alerts open the Messages tab; brief alerts open Project briefs. The full details stay behind staff sign-in and fresh MFA.
- The `telegram-notifications` Netlify function runs every five minutes on production deployments. It recovers expired leases and retries temporary failures with exponential backoff, respecting Telegram's retry-after response. Pending alerts are retained with the enquiry until its normal expiry.
- A shared dispatcher lease prevents ordinary concurrent sends of the same record. Telegram does not provide a client idempotency key: an accepted request followed by a network/process failure can produce a duplicate retry. The stable reference identifies the enquiry.
- Alerts contain the submitted name and a bounded preview, not the email/phone fields. Visitor text is plain text with control characters removed. Buttons, recipient, origin and paid-broadcast settings are server-controlled. Fetch errors containing bot URLs are never logged.
- A site-wide budget caps delivery attempts at 200 per UTC day. Excess alerts remain queued for the following day. Existing form/auth quotas still apply. Empty scheduled runs do not consume the delivery allowance.
- If either Telegram setting is absent or invalid, delivery stays disabled and enquiries remain saved. Do not delete saved enquiries to troubleshoot a notification problem.

Scheduled retries are provided by Netlify on the selected hosting setup. A Docker deployment forwards the optional credentials and can attempt immediate delivery; it needs its own scheduler for unattended retry processing.

## Verify

Run `npm run test:notifications`, `npm run test:hosting`, `npm run test:integration`, TypeScript and the Netlify production build. The notification tests use disposable MongoDB and mocked Telegram responses. For the live check, submit one clearly labeled setup enquiry and confirm it arrives in the paired private chat and is marked delivered in MongoDB. Confirm the scheduled function is deployed with its schedule and cannot be invoked by public URL.
