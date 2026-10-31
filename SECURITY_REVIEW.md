# MongoDB migration security review

## Controls in the new backend

- Database access is server-only. The runtime Atlas user is restricted to the application database and cluster.
- Better Auth handles password hashing, verified email, HttpOnly session cookies, token expiry, single-use recovery and session revocation. Production configuration requires a random auth secret and SMTP.
- Sign-up cannot set staff roles or MFA timestamps. Factor secrets, disabling factors, recovery-code regeneration and other sensitive account changes also require fresh MFA when enabled, so an expired staff session cannot replace its own second factor. Staff checks read current database-backed sessions and require a verified admin role plus a successful second-factor exchange on the current session within 30 minutes.
- Database-backed atomic quotas cover authentication, briefs, contacts, chat, history and staff actions across workers. Account email is capped at 200/day site-wide and 5/day per recipient. Storage failure refuses requests; no local fallback runs in production.
- Customer queries constrain ownership on the server. Status changes require staff MFA, validate allowed states and record the actor; Atlas commits status and audit together in a transaction.
- JSON bodies have byte/time limits; fields and IDs are checked before queries. Same-origin checks and cookie protections reject cross-site mutations. Project forms retain a bounded tab-local draft through sign-in, with explicit submission after return.
- Chat history is bounded to 50 sessions per owner and 10 messages per session. Concurrent creates use an atomic array-size condition. Paid AI stays disabled unless explicitly enabled with a private key, and has minute/daily budgets when enabled.
- TTL indexes handle expired records; auth/quotas enforce expiry independently. Public assets must not contain private database/auth/mail credentials or the retired personal portfolio identities.
- A separate Netlify no-build upload publishes only `.netlify/static` and the private server function. The deployment guard rejects server manifests, environment files, standalone dependencies and symlinks in that public directory. Publishing raw `.next` was caught during live checks and replaced; internal manifests must return 404.
- Telegram alerts use a server-only token and one-time private-chat pairing. Enquiries and their delivery state are saved atomically; a leased dispatcher retries failures without removing the enquiry. Plain-text previews, fixed inbox links, per-day delivery budgets and disabled paid broadcasts limit abuse. Notification delivery does not change staff authorization.

## Deployment boundaries

The owner approved Atlas network access from any IP because Netlify Free uses dynamic egress. TLS and restricted credentials protect the connection; this is not a private network. Fixed/private access requires another hosting arrangement.

Firebase App Check is removed with Firebase. Application quotas, authenticated ownership, same-origin checks and form honeypots remain; they do not establish browser attestation. Consider a CAPTCHA/WAF if abuse exceeds the current controls.

The CSP currently restricts framing, objects, base URLs and form targets; it is not a strict script nonce policy. A full independent penetration test has not been performed. Dependency advisories and integration tests cover their stated cases only.

Existing Firebase accounts/data are preserved in the old service. Two verified profiles were imported transactionally with unusable random passwords and ordinary user roles. They require email password recovery; no previous passwords, sessions or privileges were copied. Legacy briefs/contact collections were empty. Configure backups separately for Atlas M0.

## Required release verification

Run `test:security`, `test:hosting`, `test:integration`, TypeScript and production builds. Then verify cloud SMTP, Atlas connectivity, HTTPS, verified registration/recovery, draft return, owner isolation, staff TOTP/inbox/status changes and revocation against the deployed app. Automated local checks do not replace live provider verification.
