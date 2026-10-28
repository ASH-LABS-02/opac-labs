# OPAC Labs

OPAC Labs is a software and hardware project studio. The website shows completed work, helps visitors explore an idea, and accepts project briefs. It does **not** sell components or take payments. Visitors can submit a brief without an account; signed-in clients can view their saved requests. Staff review briefs and contact messages in a separate admin app.

## Run the local stack

Install Docker Desktop with Compose, then run from this directory:

```bash
docker compose up --build
```

Open the website at <http://localhost:3000>, admin app at <http://localhost:5173>, and Firebase emulator UI at <http://localhost:4000>. The stack runs Firebase Auth and Firestore emulators locally and persists their data in the `firebase-data` Docker volume. It does not create a product catalog.

To create a local admin account, copy `.env.example` to `.env`, set `ADMIN_BOOTSTRAP_EMAIL` and a password of at least 12 characters, then run:

```bash
docker compose --profile setup run --rm admin-bootstrap
```

Sign in to the admin app with that account. The password is used by the setup container and is not bundled into the browser. Keep `.env` private. `docker compose down` stops the stack without deleting the emulator volume.

## Project flow

Visitors can browse `/projects` and `/student-projects`, use `/build-project` to outline an idea, and send the prefilled brief at `/request-project`. Submissions are saved to Firestore before the success screen appears. WhatsApp is an optional follow-up link; opening it is not required for the request to reach the team. The admin dashboard shows project briefs and contact messages and lets staff update their status.

The project assistant provides a basic local planning outline without an API key. Set `OPENAI_API_KEY` in `.env` and restart the web service to enable generated planning responses. The key is only read by the server.

## Run without Docker

For a real Firebase project, copy `.env.example` to `.env.local`, enter the `NEXT_PUBLIC_FIREBASE_*` values from Firebase project settings, enable Email/Password authentication, create a Firestore database, and deploy `firestore.rules`. The Next.js server needs `FIREBASE_SERVICE_ACCOUNT_JSON` or Google Application Default Credentials. Then run `npm ci` and `npm run dev`. In `admin-app`, copy its `.env.example` to `.env.local`, enter the matching `VITE_FIREBASE_*` values, run `npm ci` and `npm run dev`, and grant staff the `admin` custom claim through a trusted Firebase Admin SDK process.

For local emulators outside Docker, start Auth and Firestore with `firebase emulators:start --project demo-opac-labs --only auth,firestore`. Set `NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true`, `NEXT_PUBLIC_FIREBASE_EMULATOR_HOST=127.0.0.1`, `FIRESTORE_EMULATOR_HOST=127.0.0.1:8080`, and `FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099`. Set the admin app's `VITE_USE_FIREBASE_EMULATORS=true` and `VITE_FIREBASE_EMULATOR_HOST=127.0.0.1` as well. The web and admin app project IDs must both match the emulator project ID. For local staff access, run `scripts/bootstrap-admin.mjs` with `ADMIN_BOOTSTRAP_EMAIL`, `ADMIN_BOOTSTRAP_PASSWORD`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, and `FIREBASE_AUTH_EMULATOR_HOST` set.

## Production

`compose.prod.yaml` is the production stack: Caddy serves HTTPS for the site and admin domains, the web server runs as a non-root user, Redis shares request limits across web replicas, and the admin UI is served as static files. Only Caddy publishes ports. Caddy persists TLS certificates in named volumes. The web service mounts Firebase Admin credentials as a Docker secret; the optional AI override mounts the OpenAI key as another secret. Do not put either secret in `NEXT_PUBLIC_*` or `VITE_*` variables.

1. In a real Firebase project, enable Email/Password and the sign-in providers you use, create Firestore, and register **both** the public and admin web apps. Register a separate reCAPTCHA Enterprise App Check site key for each app and add both deployment domains to their allowlists. Enable App Check enforcement for Firestore after verifying that both apps obtain tokens. Configure Identity Platform TOTP MFA for admin accounts. Configure email enumeration protection and authentication quotas.
2. Copy `production.env.example` to `production.env` and fill in the two domains, ACME email, and public Firebase/App Check values. Create `secrets/firebase-service-account.json` from a service account with the required Firebase Admin/Firestore permissions. If using generated AI replies, put the OpenAI key in `secrets/openai-api-key.txt` as plain text and set `OPENAI_API_KEY_PATH` in `production.env`. These paths are ignored by Git and Docker build contexts.
3. Point DNS for both domains to the Docker host, and make ports 80 and 443 reachable. Build and start the stack:

   ```bash
   docker compose --env-file production.env -f compose.prod.yaml up --build -d
   # With AI replies:
   docker compose --env-file production.env -f compose.prod.yaml -f compose.prod.ai.yaml up --build -d
   ```

4. Deploy **production** Firestore rules and TTL policies to the same Firebase project, after reviewing the project ID and rules:

   ```bash
   npm run verify:production
   npx firebase-tools deploy --project YOUR_FIREBASE_PROJECT_ID --config firebase.prod.json --only firestore:rules,firestore:indexes
   ```

   Production rules require a verified admin account, its `admin` custom claim, and a TOTP second factor for staff reads and status updates. After a staff member creates and verifies an account, grant the claim from a trusted machine:

   ```bash
   node --env-file=production.env scripts/manage-admin.mjs grant staff@example.com
   # When offboarding:
   node --env-file=production.env scripts/manage-admin.mjs revoke staff@example.com
   ```

   The admin app then guides a newly granted staff member through authenticator enrollment and a new sign-in. The CLI checks the Firebase project, preserves other custom claims, and revokes refresh tokens on both actions. A separate `adminAccess` record gates production Firestore and admin API reads, so revoking staff access takes effect without waiting for an existing ID token to expire. Local emulator rules remain in `firestore.rules` for development.

5. Verify HTTPS, site and admin sign-in, App Check protected submissions, inbox access after TOTP sign-in, and Firestore TTL policy status. Monitor Firebase usage, auth failures, and HTTP 429/5xx counts. Back up Firestore separately before relying on TTL cleanup; Firestore TTL deletion is asynchronous.

The website remains unavailable if Redis fails, so rate limits never silently switch to per-process counters. The OpenAI integration is optional; without its secret the project assistant returns a local planning outline. Real production secrets, Firebase console settings, DNS, and live deployment must be supplied for your own project.

## Verify

```bash
npm run build
cd admin-app && npm ci && npm run build
```

With local emulators and the web server running, `node scripts/smoke-local.mjs` checks project and contact submissions, chat history, Firebase authorization rules, request limits, and response headers.
