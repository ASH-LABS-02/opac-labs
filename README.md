# OPAC Labs

A Next.js website for software, hardware, ERP/CRM, portfolio and student-project services. The backend uses **MongoDB and Better Auth**. Firebase is no longer required. Component ordering and payments are not enabled.

## Quick local preview

```bash
npm ci
npm run preview:local
```

Open `http://localhost:3007`; staff use `/admin`. The preview starts a disposable local MongoDB process automatically, forces local credentials, disables paid AI and external email, and never connects to Atlas. Its accounts and requests disappear when stopped. Verification and reset links are saved in the private local mailbox path printed by the launcher. The first launch downloads the MongoDB executable.

For persistent local data, use Docker:

```bash
docker compose up --build
```

Open the website at `http://localhost:3000` and the local email inbox at `http://localhost:8025`. MongoDB data persists in the `mongo-data` volume. The database has no published host port. The example database password and auth secret are **local development defaults**. Keep this stack on localhost.

## Production

Use [Netlify Free and MongoDB Atlas](deploy/NETLIFY.md). The public app, API routes, authentication and staff dashboard are one deployment. The former admin hostname redirects to `/admin` to avoid cross-domain session cookies.

Set the server-only values in `.env.example` through Netlify's production environment settings. A real Atlas connection, random auth secret and working SMTP transport are required. Brevo Free is the selected SMTP provider. Verify the business sender and activate transactional sending; a Gmail app password remains an optional alternative. `npm run build:netlify` blocks missing or unsafe production configuration. Never put database, auth or email secrets in `NEXT_PUBLIC_*` variables.

After `netlify build --context production`, use `npm run deploy:netlify` to publish the adapter's curated static assets and private server function. A separate no-build deployment must target `.netlify/static`, because `.next` contains internal server files. See the deployment guide for the dashboard visibility step.

For a Linux Docker host, fill `production.env.example` privately and run:

```bash
docker compose --env-file production.env -f compose.prod.yaml up --build -d
```

Caddy provides HTTPS, only ports 80/443 are public, and the app runs as a non-root user. This production setup uses external Atlas. A custom domain is not required for Netlify; the proposed domain is `opaclab.in`.

## Accounts and project requests

Customers register with a password of at least 12 characters and verify their email before signing in. Sessions use HttpOnly cookies. Password reset revokes existing sessions. Visitors can fill a brief before signing in; its tab-scoped draft survives sign-in, registration and refresh for 24 hours. The visitor reviews and explicitly submits it after sign-in. Requests are saved in MongoDB before success is shown and are listed under `/my-projects` only for their owner.

Staff receive requests at `/admin` under **Project briefs**, and contact messages in **Messages**. Automatic request-notification emails are not configured; SMTP is used for verification and account recovery. WhatsApp follow-up still requires the visitor to send it.

After the intended staff member creates and verifies their own account, grant access from a trusted machine with the private live MongoDB environment:

```bash
node --env-file=.env.local scripts/manage-admin.mjs grant staff@example.com
node --env-file=.env.local scripts/manage-admin.mjs revoke staff@example.com
```

Grant/revoke changes the server-controlled role and removes existing sessions. Staff must enroll an authenticator and complete TOTP verification. Server-side access checks require a verified account, the current admin role and a second-factor verification on the current session within 30 minutes. Customer sign-ups cannot assign roles or second-factor timestamps. Backup codes support recovery; keep them private.

The project planner uses a basic local outline by default. Paid AI requires both `OPAC_PAID_AI_ENABLED=true` and a server-only OpenAI key. User/site minute and daily quotas remain enforced when enabled. Netlify's automatic provider keys cannot activate it.

## Database and security

MongoDB stores accounts, revocable sessions, briefs, contact messages, bounded chat histories, audit records and shared rate limits. Atomic counters prevent parallel workers bypassing quotas and fail closed on database errors. Auth, form, user and global quotas are separate. Input validation, same-origin JSON checks, server-controlled ownership and role checks prevent direct browser database access and unauthorized updates.

TTL indexes clean up expired sessions, verification tokens, messages, briefs, histories and counters. TTL cleanup is asynchronous; authorization and rate windows check expiry independently. Atlas Free has storage/usage limits and no managed backup service: arrange a private export/backup before relying on it for important client data. Never commit backups.

The Netlify Free deployment uses changing egress IPs. The owner approved an Atlas `0.0.0.0/0` access rule; database connections still require TLS and a dedicated user restricted to `opac_labs`. A fixed/private network requires a different hosting arrangement.

The previous Firebase project is preserved. Verified account profiles can be imported with `scripts/import-accounts.mjs` from a trusted private JSON export. Passwords, sessions and previous roles are never copied; imported users use **Forgot password** to choose a password for the new login. Unverified or disabled profiles are skipped. The cutover account import is idempotent and runs in MongoDB transactions.

## Verify

```bash
npm run test:hosting
npm run test:security
npm run test:integration
npx tsc --noEmit
npm run build
```

Integration tests use a disposable MongoDB server and isolated test accounts, not the production database. See `SECURITY_REVIEW.md` for security coverage and remaining launch steps.
