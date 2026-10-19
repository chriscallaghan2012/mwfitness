# MW Fitness website/backend — mobile integration contract

## Architecture

The public website, Staff HQ and Android app share the MW Fitness Neon project. The public website uses server-only API routes for privileged operations and the Neon Data API client for authenticated staff workflows. Never expose `DATABASE_URL`, SMTP credentials, Stripe secret keys or service credentials to browser/mobile bundles.

## Existing API routes

| Route | Purpose | Expected behaviour |
|---|---|---|
| `GET /api/health` | Service and backend readiness | Returns safe status labels only; never credentials or URLs |
| `POST /api/send-mail` | Validate and persist website enquiry, then notify by email | A successful database save remains successful even if notification email fails |
| `POST /api/create-checkout` | Create Stripe Checkout session for an allow-listed plan | Reject unknown plan IDs and missing configuration |
| `POST /api/send-push` | Push notification delivery | Requires review of authentication and payload validation before wider use |

## Health endpoint

The health route checks whether the server can query the configured database and reports only capability labels for database, email and checkout. It intentionally does not return secret values, endpoint URLs, database errors or stack traces. HTTP 503 means the shared database is not reachable/configured; optional email/checkout not being configured is reported separately.

## Staff HQ data areas

- Users and roles
- Client records and progress photos
- Plans, pricing and memberships
- Coach-managed nutrition plans and meals
- Workouts and programmes
- Exercise videos
- Daily check-ins and progress history
- Messages and website leads
- **Member activity**: hydration, steps, cardio logs and coach-assigned supplement plans

The new Member Activity view should clearly identify when migration 0007 is missing instead of showing fabricated live data. Demo records remain isolated in the existing local demo state and must never write to Neon.

## Data and security contract

- Authenticate staff with Neon Auth and verify `profiles.role` is `coach` or `admin` before rendering staff tools.
- Enforce member ownership and coach/admin permissions with RLS policies.
- Use parameterized SQL in server routes; validate all client input at the boundary.
- Return stable, human-readable errors to clients; keep stack traces and provider responses in server logs only.
- Never return a successful save response until the database write has succeeded.
- The health route is operational diagnostics, not an authentication or authorization mechanism.

## Deployment gates

1. Verify the production Neon branch/project identity before any migration.
2. Check migrations 0007 and 0008 against the live schema; apply only after confirming they are not already applied.
3. Test `GET /api/health` in the Vercel deployment and local Express server.
4. Test lead capture with email enabled and with email unavailable; lead persistence must not be lost.
5. Test Stripe using test-mode keys and valid configured price IDs; never create a live charge during verification.
6. Verify staff tabs at desktop and mobile widths, including loading, empty, error and retry states.
7. Merge only after website build/typecheck and app typecheck/lint pass. Run the Android internal build as a separate release gate.
