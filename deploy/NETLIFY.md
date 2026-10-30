# Netlify Free + MongoDB Atlas

The website is deployed to `opaclab-web.netlify.app`. `/admin` is the staff dashboard on the same origin. The former `opaclab-admin.netlify.app` site is only a redirect. The root `netlify.toml` uses Netlify's Next.js adapter so API routes run as functions; do not publish a static export.

## Server environment

Set these in the website's **Production** environment through the Netlify API/UI. Keep the default all-scopes setting on Free so variables reach functions as well as builds. Do not give previews production credentials.

| Variable | Value |
| --- | --- |
| `MONGODB_URI` | Private authenticated Atlas URI with verified TLS |
| `MONGODB_DB` | `opac_labs` |
| `MONGODB_TRANSACTIONS` | `true` for Atlas |
| `BETTER_AUTH_URL` | `https://opaclab-web.netlify.app` |
| `BETTER_AUTH_SECRET` | At least 32 cryptographically random characters |
| `SMTP_HOST` | `smtp-relay.brevo.com` (selected) |
| `SMTP_PORT` | `587` for Brevo |
| `SMTP_USER` | Brevo SMTP Login (not the sender address) |
| `SMTP_PASSWORD` | Private Brevo SMTP key (not an API key) |
| `EMAIL_FROM` | `OPAC Labs <your-mail-account>` |
| `TRUST_PROXY_HEADERS` | `true` |
| `TRUSTED_PROXY_PROVIDER` | `netlify` |
| `OPAC_PAID_AI_ENABLED` | `false` |

All values are server-only. No Firebase API key, service-account key, App Check key, Redis or separate auth subscription is needed. SMTP can send verification and recovery messages without buying a domain when using Gmail's own address. Do not use your ordinary Google password. Verify the SMTP connection without emailing third parties.

## Brevo account emails

Brevo Free is the selected email provider after Google blocked Gmail app-password setup. Verify the business sender, configure the SMTP Login/key and confirm that transactional sending is active. A successful SMTP login alone does not prove that Brevo has approved sending or that recipients receive messages. Before a custom domain is connected, Brevo may rewrite the sender to its own domain. The owner approved disabling SMTP-only IP blocking for Netlify Free dynamic egress; API-key blocking can stay enabled. Keep the SMTP key private.

## Atlas

The free `opac-production` cluster is in AWS `US_EAST_1`, near the hosting backend. Use a dedicated `opac-runtime` database user with `readWrite` only on `opac_labs`, Keep it in the dedicated OPAC project; restrict its cluster scope if adding other clusters. Do not grant Atlas administrator or cross-database permissions.

The owner approved `0.0.0.0/0` network access for Netlify Free's changing egress IPs. TLS and strong database authentication remain mandatory. The connector may require its own confirmation for creating users and network rules; if that confirmation fails, complete those two settings in Atlas manually. Never paste credentials into a chat or public issue.

The application creates its indexes before serving database operations. Verify unique email/session/account indexes and TTL indexes after connection. Atlas Free backups need a separate export/backup process.

## Release

1. Finish the Atlas user/network rules and privately configure SMTP, MongoDB and the auth secret. Remove obsolete Firebase/Redis/old Vite variables from the production project once replacing the old deployment.
2. Run the security, hosting, integration, type and build checks. Build the reviewed source with `netlify build --context production`. This invokes the guarded `build:netlify` command.
3. Deploy the complete adapter output with `netlify deploy --prod --no-build --site opaclab-web`. Do not pass `--context` with `--no-build`; the CLI rejects that combination. Publish the `admin-app` redirect separately if retaining its hostname.
4. Verify the actual HTTPS health endpoint, verification email delivery, sign-in/out/reset, draft restoration, project submission/tracking, profile editing, planner/history, owner isolation, rejected cross-origin requests and shared quotas. Create the real staff account, verify email, grant its role from a trusted environment and test TOTP enrollment, MFA login, inbox/status updates and revocation.
5. Push the reviewed current source to GitHub. A successful local build alone does not establish a working cloud database or email provider.

Netlify Free and Atlas M0 have usage limits. Keep paid AI disabled. Configure a domain later (currently considering `opaclab.in`), then update `BETTER_AUTH_URL` and redeploy. Sign in again after changing origins.

## Migration

Keep the old database intact until any real customer records have been exported and imported explicitly. Two verified legacy account profiles have been imported; old passwords and browser sessions are not copied. Imported users must choose a new password through account recovery. Old project-brief and contact collections were empty at the migration check. After the replacement works, revoke the old website runtime key and retire its unused configuration. Do not delete unrelated Google resources.
