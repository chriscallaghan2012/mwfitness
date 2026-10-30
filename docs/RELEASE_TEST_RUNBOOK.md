# MW FITNESS — Release Test Runbook

This runbook is for the website/Staff HQ release candidate. It does not authorize a production deployment or production database writes.

## 1. Run automated checks locally

From the website repository root:

```bash
npm ci
npm test
npm run lint
npm run build
```

Expected:
- `npm test` runs Staff HQ demo-data regression tests, public API guard/mount tests, PWA configuration checks, mocked Stripe session and checkout API mode tests, checkout UI regression tests, and the Neon integration test when `RELEASE_TEST_DATABASE_URL` is provided.
- `npm run lint` runs the TypeScript check.
- `npm run build` creates the Vite production build.

Record the branch and commit SHA, Node/npm versions, each command's exit code, and the full output for any failure. Do not report a check as passed unless it was run against the exact candidate commit.

## 2. Automated coverage currently added

`tests/admin-demo-db.test.ts` covers:
- seeded demo plan listing and sorting;
- create → read → update → delete round-trip;
- embedded profile/plan relation projection;
- demo reset discarding session changes;
- explicit error for an unknown table.

These tests exercise the in-memory Staff HQ data client, not live Staff HQ UI flows, RLS or authentication. They are only one layer of coverage.

## 3. Staff HQ UI test — demo mode

Use demo mode first so destructive testing cannot affect member data.

For each section that exposes the action, test:
1. List loads and refresh works.
2. Create a record with an obvious prefix such as `RELEASE_TEST_`.
3. Confirm the new row appears.
4. Edit one field and confirm the changed value survives refresh.
5. Delete only the test record and confirm it disappears.
6. Cancel the delete confirmation and confirm the record remains.
7. Try invalid required fields and invalid numeric values; verify a clear error and no record is saved.
8. Check empty and error states.

Test the applicable actions for Plans, Swag Products, Memberships, Nutrition, Workouts, Programmes, Videos, Website Leads, Check-ins, Progress, Client Records and Communications. Do not assume every screen supports all three CRUD actions: the UI's documented capabilities are the scope of each test.

Known scope limitations to keep visible:
- Staff HQ's customer account panel explicitly does not create or delete Neon Auth identities; it edits coaching profiles only.
- Communications automation rules are not the same as a live automation engine, and broadcasts must not be assumed delivered merely because a draft appears.
- A coaching-video catalogue is not proof that video file upload/storage exists.
- Removing a membership record does not cancel a Stripe subscription or issue a refund.

## 4. Live Neon integration — use a disposable test branch

Do not run create/edit/delete tests against real member records or production data.

Before live integration testing:
- Create/identify a disposable Neon branch/database with the same migration state and RLS policies as production.
- Use a dedicated test staff account and at least two dedicated member accounts.
- Record the database branch identifier; do not paste credentials or tokens into GitHub.
- Verify migrations against that branch before running tests.

Run the following flows with test-only records:
- Staff creates/edits a plan; public pricing reads the persisted change.
- Staff assigns a plan to a test member; membership survives reload and appears in the mobile app.
- Staff changes test member coaching data; the correct member sees it after mobile reload.
- Mobile saves a check-in, weigh-in, daily metrics, cardio log, nutrition completion and workout completion; Staff HQ sees each saved record after refresh.
- Upload a small test progress photo; confirm it persists and is visible only to the owner and authorized staff.
- Member A attempts to read/update Member B's records; the operation must be denied by RLS.
- Coach attempts to make a platform-admin-only profile/role change; it must be denied.
- Test demo mode and live mode separately; demo writes must not reach Neon, and live mode must not silently substitute sample data after an error.

Delete only the dedicated test records after the results have been recorded.

## 5. Mobile checks you must run on your machine/device

Mobile branding assets are intentionally outside this runbook's current work scope and will be handled separately.

For the non-branding release candidate, run in the mobile repository:

```bash
npm ci
npx tsc --noEmit
npm run lint
npx expo export --platform android
```

Then install a fresh Android build on a physical device and test:
- cold start, sign-in, sign-out and session restore;
- profile/membership reload;
- check-in, weigh-in, daily water/steps, cardio, meal completion and workout completion;
- calendar history after the records above are saved;
- photo upload and private gallery;
- push permission/token registration if push notifications are in scope;
- offline/lost-network feedback and retry;
- no cross-account data leakage after signing out and signing in as a second test user.

A successful JavaScript export does not prove the native Android app starts correctly. Keep device/build evidence separately.

## 6. Remaining gates that require external access or human verification

- Production RLS/access tests using authorized staff and member accounts.
- Stripe signed webhook, idempotency, refund and membership-provisioning tests before paid membership activation is enabled.
- Email delivery and failure/retry behavior.
- Physical-device Android startup and upgrade tests.
- Website PWA installability, offline fallback and service-worker update behavior. PWA manifest, icon, service worker and production-only registration have been added on the review branch; verify them in a real browser before calling this gate passed.
- Production HTTP/browser smoke tests against the exact deployed commit.
- Backup/restore and a named rollback owner.
- Explicit go/no-go approval.

Do not apply migrations, write production test records, run deployments or publish a mobile release as part of this runbook.

## Real Neon CRUD integration test (disposable branch only)

Create a separate Neon branch for release testing and set `RELEASE_TEST_DATABASE_URL` to that branch's connection string. Do not point this variable at the production branch. If `DATABASE_URL` is available in the test process, the test also checks that the hostname differs. The test creates one dedicated test table on that disposable branch, inserts/reads/updates/deletes a unique fixture, and cleans up its row. It never falls back to `DATABASE_URL`.

```bash
RELEASE_TEST_DATABASE_URL='postgresql://...disposable-branch...' npm test
```

This verifies a real Neon connection and database CRUD, and reads public pricing/product endpoints against the disposable branch. It does **not** by itself verify Staff HQ's Neon Data API, user authentication, role permissions or RLS. Those require signed-in test accounts and live UI/API tests against disposable records.

## Stripe Checkout tests and configuration

The Stripe unit tests mock Stripe's API; they must not charge a card. Preview/Development without either Stripe key must use the clearly labelled mock simulation; it must never create a Stripe session, claim a payment succeeded, or activate a membership. When configured, Preview/Development must use matching test publishable/secret keys and test Price IDs. Production must use matching live keys and live Price IDs and must fail closed when keys are missing. Live keys are rejected outside Production. The API verifies the plan is active and `kind=online` in Neon, then retrieves the selected Stripe Price and checks both its `livemode` and GBP amount against the database plan price before creating a session. The current Vercel audit found no Stripe variables, so Production checkout is not yet configured.

Embedded Checkout uses Stripe's payment form inside the website; the browser loads Stripe.js directly from `js.stripe.com`. Card data must never be posted to MW Fitness endpoints or logged by the site.

Manual embedded checkout acceptance checklist:
- [ ] On a Preview deployment with both Stripe keys absent, continue checkout and verify the explicit “Preview mock checkout” panel appears.
- [ ] Verify mock checkout says no payment was taken and no membership/access was activated; verify no Stripe session is created.
- [ ] Verify Production with missing Stripe keys reports checkout unavailable and never shows mock checkout.
- [ ] Verify a partial key pair or live keys in Preview fails closed instead of falling back to mock.
- [ ] Verify a Price ID whose Stripe `livemode` does not match the configured key mode is rejected before a Checkout Session is created.
- [ ] Confirm the form renders inside `/checkout` and does not redirect to a separate Stripe-hosted page for the standard card flow.
- [ ] Confirm card number, expiry, CVC and billing fields are rendered by Stripe, not ordinary MW Fitness `<input>` elements.
- [ ] Confirm the name/email placeholders are readable and form borders/focus states have sufficient contrast.
- [ ] Confirm the amount and selected package match both the active Neon plan and the matching Stripe Price in the current environment.
- [ ] Complete a Stripe test-mode payment with a Stripe test card; never use real card details in test mode.
- [ ] Exercise a declined test card and a redirect/3DS flow; verify clear recovery and that the selected package is restored after returning.
- [ ] Confirm a failed checkout never reports payment success or activates a membership.
- [ ] Verify no card details, Stripe client secret or secret API key are written to app logs or MW Fitness API requests.
- [ ] Do not test live charges until the webhook, idempotent payment record and membership activation flow are complete and explicitly approved.

## Payment lifecycle — post-merge gate (2026-10-30)

PR #140 is merged. The current source includes `POST /api/stripe-webhook`, `GET /api/checkout-status`, a prepared `db/migrations/20261026_stripe_payment_records.sql` migration and a read-only Staff HQ payment ledger.

Before enabling real checkout, complete and record all of the following against the exact candidate commit:
- [ ] Run `npm test`, `npm run lint` and `npm run build`; retain command output and commit SHA.
- [ ] Apply the ledger migration only to an approved disposable Neon branch first; verify schema, RLS and platform-admin read access.
- [ ] Verify a valid signed test webhook is recorded once; duplicate events do not duplicate records; invalid/stale signatures are rejected.
- [ ] Verify paid, unpaid, amount-mismatch, currency-mismatch and test/live-mode-mismatch sessions.
- [ ] Verify partial refunds go to manual review and full refunds reconcile correctly; confirm membership access is not left active after a confirmed refund.
- [ ] Verify the checkout return endpoint cannot activate membership or expose secrets and does not trust the redirect alone.
- [ ] Complete verified customer-account linking and membership provisioning/revocation design and tests before any automatic access is granted.
- [ ] Verify the self-hosted raw-body webhook route and Vercel webhook configuration independently.
- [ ] Record evidence and obtain explicit go/no-go approval.

The migration remains prepared only, and `STRIPE_PAYMENT_LEDGER_ENABLED` must remain disabled until the release gates pass. No test pass is claimed from the merge alone. Do not run production migrations or deploy as part of this runbook without explicit authorization.

Production Price ID source note: after PR #141, Production reads the live `stripe_price_id` from the active Neon plan row; Preview/Development still use test Price IDs from environment variables. The source migration is `db/migrations/20261024_live_stripe_coaching_products.sql`. Verify all five active online plan rows and matching Stripe Price mode/currency/amount before enabling the payment gate. Production row values were not independently re-verified during this code change.


## Vercel Hobby function-count constraint

The payment webhook and checkout-status paths are rewritten to the existing `/api/create-checkout` serverless function. Their shared handlers live under `lib/`, outside Vercel's `api/` function directory. Do not add new top-level files under `api/` without checking the 12-function Hobby limit and the production deployment result.


## Current production candidate — 2026-10-30

Latest known production deployment is commit `d41e7cb2eaddf0c302b84633d0348b8e6c5a5503`, state **READY**:
[View deployment](https://vercel.com/cjc101187s-projects/mwfitness/AuAhbzTdWgqA6sZgzURUoB3biomx).

The previous deployment failed because Vercel Hobby permits no more than 12 Serverless Functions. PR #142 moved the webhook and checkout-status implementations into `lib/` and routes both paths through `/api/create-checkout`. The current source has 11 top-level API endpoint files, leaving one function slot. The endpoint inventory is recorded in `LIVE_RELEASE_AUDIT_AND_GO_LIVE_PLAN.md`.

**Do not add another top-level API endpoint casually.** Prefer extending an existing route or putting shared handler logic in `lib/`. Count the final candidate's actual Vercel functions before merging. A deployment can be READY while individual routes still fail, so complete the smoke tests below.

### Production browser/API smoke tests — human execution

Use the deployed custom domain and record the tested commit. Do not submit real payments or destructive production writes.

- [ ] Open the apex and www domains; verify HTTPS and canonical redirect behavior.
- [ ] Open every route listed in the release audit directly and hard-refresh.
- [ ] Check browser console/network for failed chunks and API errors.
- [ ] Confirm `GET /api/health`, `GET /api/plans` and `GET /api/products` return expected safe responses.
- [ ] Confirm unsupported methods return the intended 405 response and do not mutate data.
- [ ] Confirm `/api/checkout-status` rejects missing/invalid session identifiers safely and does not trust query-string claims.
- [ ] Confirm `/api/stripe-webhook` rejects unsigned/invalid requests. Do not send fabricated signed events to production; use Stripe test mode and a disposable test setup for positive webhook tests.
- [ ] Confirm public routes do not expose Stripe Price IDs, secrets, private member data or admin-only fields.
- [ ] Test account/auth and Staff HQ journeys using dedicated test users, not real member accounts.

### Current human test handoff

The developer must first run the clean-checkout commands in section 1 against the final release candidate. Then the owner should run the production browser/API smoke tests above and the Staff HQ/auth/member-isolation checklist in sections 3–4 of the main release audit. Record exact commit, environment, account role, result and evidence. Do not mark a test complete based only on Vercel READY.

### One-build merge policy

All outstanding source and documentation changes are to be kept together off `main`. Do not merge small PRs one at a time or manually trigger deployments during the work. Once the complete release candidate has passed developer checks and review, merge once to `main`; the existing Git integration will trigger the production deployment. If the candidate changes after testing, rerun affected checks before that single merge.

This documentation update itself is not merged to `main` and has not triggered a production build.

**Current release status: NOT APPROVED.** Payment migrations are not applied, `STRIPE_PAYMENT_LEDGER_ENABLED` remains disabled, and live payment processing must not be enabled until the signed webhook, idempotency, refund and membership lifecycle are tested and approved.
