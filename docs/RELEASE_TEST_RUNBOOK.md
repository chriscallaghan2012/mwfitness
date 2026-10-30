> **CURRENT HANDOFF — 2026-10-30 (PR #143 / production commit 3cab220e8c9acd4ec0587682f4a1ebc33f5223d9)**  
> This status block supersedes older deployment statements later in this historical runbook. Production Vercel deployment is **READY** with aliases `mwfitnessuk.com` and `www.mwfitnessuk.com`. This confirms build/deployment only, not runtime or end-to-end tests. No manual deployment, production migration or environment change was performed.
>
> **Completed:** PR #143 merged; SHWAG Neon result-mapping fix and regression tests added; production build READY. Five active online coaching plans were read-only matched to active live GBP one-time Stripe Prices and Products (amounts and default-price IDs match). The plan/price migration is already reflected in production and must not be reapplied. Four active SHWAG products exist in Neon. Function count remains 11/12.
>
> **Owner go-live checklist:**
> - [ ] **Resend/email:** add and verify the sending domain in Resend; publish its exact DNS records; configure sender/from and API key; add the required server-side Resend environment variables to Vercel Production (Preview separately if needed); then test real enquiry/transactional delivery, reply-to, spam placement, bounces and failure handling. No SMTP variables were found in Vercel. Use the actual Resend integration/configuration; do not assume SMTP.
> - [ ] **Production smoke test:** verify apex/www HTTPS and redirects; direct-load and hard-refresh public, member and Staff HQ routes; inspect console/network; check `/api/health`, `/api/plans`, `/api/products`. Keep issue #49 open until production products response is confirmed.
> - [ ] **Automated checks at exact commit:** clean checkout `3cab220e8c9acd4ec0587682f4a1ebc33f5223d9`; run `npm ci`, `npm test`, `npm run lint`, `npm run build`; capture output. Not run here; no passing status is claimed.
> - [ ] **Auth / Staff HQ / Neon:** dedicated test accounts for signup/login/logout/session restore; coach/admin/member permissions; supported CRUD; member isolation; demo/live separation. Perform destructive writes only on a disposable Neon branch, never real member data.
> - [ ] **Mobile:** fresh Android export/build and physical-device install; test auth/session, membership, check-ins, weigh-ins, nutrition/workout/cardio, photo privacy and push if in scope; verify mobile → Neon → Staff HQ → mobile reload.
> - [ ] **PWA:** test installability, manifest/icon, offline fallback, cache refresh and service-worker updates in real browsers.
> - [ ] **Stripe:** keep live payment activation disabled. Vercel has no Stripe secret/publishable/webhook keys or payment-ledger flag. Before enabling, complete signed/invalid/stale webhook, duplicate idempotency, paid/unpaid, amount/currency/mode mismatch, refunds, account linking and membership provisioning/revocation tests. Ledger migration is prepared but unapplied; do not apply to production without explicit approval. Automatic membership provisioning/revocation is not complete.
> - [ ] **Operations:** verify backup/recovery, rollback owner/procedure, privacy/legal/contact content and monitoring; record evidence and explicit go/no-go.
>
> **No changes made:** Resend, DNS, Vercel environment, Stripe configuration, Neon production data/schema/migrations. Legacy unused Supabase variables were left untouched; encrypted `DATABASE_URL` could not be independently matched to Neon.
>
> **One-build rule:** keep remaining code/docs changes off `main`; complete checks on the final candidate, then one approved merge/build. Do not incrementally deploy. This documentation branch has not been merged or deployed.
>
> ---
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


## SHWAG catalogue regression — added 2026-10-30

Production Neon contains four active SHWAG products. The prior `api/products.mjs` implementation read `rows.rows` after calling Neon serverless `sql.query()`. With the driver's default result format, `sql.query()` returns the row array directly; the `rows` property is only present when `fullResults: true` is requested. The endpoint could therefore return HTTP 200 with an empty catalogue despite active database rows.

The candidate branch corrects this by mapping the returned array directly and adds `tests/products.test.ts` covering:
- one returned product row and numeric price conversion;
- missing optional sizes;
- empty and non-array results.

Run `npm test` from a clean checkout to execute the new regression test. This test has been added but has **not yet been run** in this environment. The fix is on `docs/release-status-and-one-build-policy`, not deployed. Do not count issue #49 as resolved until the final candidate passes automated checks, is merged/deployed once, and `GET /api/products` is verified on the production domain.

## Live coaching Stripe price verification — 2026-10-30

Read-only Neon and Stripe checks verified all five active online coaching plans against the live `MWFitnessUk` Stripe account. Each Price is active, GBP, one-time, live mode, and matches the Neon amount. The mapping migration is already reflected in production rows/schema and should not be reapplied. The payment-ledger table is still absent from production, so the ledger migration remains unapplied and the payment gate stays disabled.


## Vercel environment readiness — 2026-10-30

Metadata-only inspection found Neon Auth/Data API and DATABASE_URL variables assigned to Production, Preview and Development. No Stripe secret/publishable keys, webhook secret or payment-ledger gate are listed, so live checkout must remain unavailable. No SMTP host/port/user/password variables are listed, so email delivery is not configured in Vercel and remains outstanding. Legacy VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY variables remain in Production and Development, but repository code search found no current references; they were left untouched. The encrypted Vercel DATABASE_URL could not be safely matched to a Neon host/database in this pass.


> **Stripe key follow-up — 2026-10-30:** The connected Stripe session exposes the `MWFitnessUk` account in live mode only; no test-mode context for this account is available in the current connection. Stripe product/price objects were previously verified in live mode. The Stripe API integration does not expose/recover the account's existing secret API key, and the secret key is not stored in the repository or Vercel environment. Do not try to retrieve or commit it. The owner must add `STRIPE_SECRET_KEY` and `VITE_STRIPE_PUBLISHABLE_KEY` directly as encrypted/sensitive Vercel **Production** environment variables from Stripe Dashboard → Developers → API keys. Do not paste secret keys into chat or commit them to Git. Keep `STRIPE_PAYMENT_LEDGER_ENABLED` absent/false and do not enable live checkout until `STRIPE_WEBHOOK_SECRET`, the approved ledger migration and webhook/idempotency/membership lifecycle tests are complete. No Stripe keys were added or changed in this session. With no Stripe keys, Preview/Development already resolve to the clearly labelled mock checkout; Production intentionally fails closed and must not be switched to mock.


## Latest external configuration results — 2026-10-30

### Stripe live setup

The connected MWFitnessUk live account has five active coaching Products and five active GBP one-time Prices matching the Neon plans: £99.99, £159.99, £299.99, £399.99 and £449.99. No live webhook endpoint exists. Vercel has no Stripe key variables configured. The connected Stripe account list did not expose an MWFitnessUk test/sandbox account; do not use another client's account for testing.

For the web server, prefer a restricted API key with only:
- Prices: Read
- Checkout Sessions: Write

The final-readiness branch accepts rk_live_ / rk_test_ keys as well as sk_live_ / sk_test_. Set the restricted key in Vercel as a **sensitive** Production environment variable named STRIPE_SECRET_KEY; set the matching pk_live_ value as VITE_STRIPE_PUBLISHABLE_KEY. Never commit keys or put them in mobile app configuration.

The same branch adds a server-side webhook gate: the handler returns 503 until STRIPE_PAYMENT_LEDGER_ENABLED=true. This is deliberate. Do not create the live webhook endpoint or enable the gate until the payment-ledger migration is applied to an approved branch, webhook tests pass, and the account-linking/membership fulfilment design is complete. The new tests are authored but **not run**.

If no MW Fitness test credentials are available, Preview/Development should remain with both Stripe keys absent and show the explicit mock simulation. It must not create a Stripe session, take a payment, or activate a membership. Production must continue to fail closed.

### Resend setup blocker

The connected Resend account has reached its three-domain plan limit. mwfitnessuk.com is not registered there; the attempt to add it was rejected by the plan limit. No DNS or existing domains were changed.

Owner actions:
1. Upgrade the Resend plan to permit another domain, or explicitly choose an approved alternative sending domain.
2. Add the chosen domain in the EU region and publish the exact DNS records Resend returns.
3. Verify the domain, then create a dedicated sending_access API key restricted to that domain.
4. Add RESEND_API_KEY as a sensitive Vercel Production variable and set RESEND_FROM_EMAIL to the verified sender.
5. Confirm MAIL_TO (the current code default is mwfitnessukonline@gmail.com) and test an enquiry alert plus customer acknowledgement.

The website mailer already supports Resend directly; Gmail SMTP is not required if Resend is configured.

### Mobile security / build checks

A source review found that mobile index.ts contains permissive placeholder crypto methods: Math.random() random fallback, subtle.verify always true, no-op importKey, zero-filled sign and digest fallbacks. Replace this with a genuine supported WebCrypto implementation before signing off production auth. The current main branch also has no npm test script; release/neon-schema-contract-tests adds schema-contract tests and the script but is unmerged and untested.

Current mobile checks still required:
- [ ] Replace and test the unsafe crypto shim.
- [ ] Run npm ci, npx tsc --noEmit, npm run lint, and npx expo export --platform android.
- [ ] Run the schema-contract tests from the release candidate.
- [ ] Build and install a fresh Android app on a physical device.
- [ ] Verify login, session restore, logout, reset deep link, member/staff roles and cross-account isolation.
- [ ] Verify check-ins, weigh-ins, progress photos, cardio, nutrition and workout completion persist through Neon and appear in Staff HQ.
- [ ] Verify Expo push token registration, delivery and cleanup on logout using valid FCM/Expo credentials.
- [ ] Keep Google Play on internal testing until Mike approves a production-track release.

### Website / Staff HQ checks still required

- [ ] Run npm ci, npm test, npm run lint, npm run build on the exact final candidate; tests have not been run in this environment.
- [ ] Verify /api/health, /api/plans, /api/products over HTTPS; keep issue #49 open until products return the four active SHWAG rows.
- [ ] Test direct navigation/hard refresh, desktop/mobile responsive layouts, console/network, PWA install/offline/update.
- [ ] Test Neon Auth signup/login/logout/session restore/password recovery using dedicated accounts.
- [ ] Test all supported Staff HQ create/edit/delete actions in demo mode, then repeat live CRUD and RLS checks on a disposable Neon branch.
- [ ] Prove Member A cannot access Member B's profile, progress photos, check-ins, nutrition, workouts or messages.
- [ ] Verify coach/admin role restrictions, named-admin allowlist, account panel limitations and safe error feedback.
- [ ] Verify contact enquiries persist when email delivery fails, then test Resend delivery after domain verification.
- [ ] Confirm notification rules/templates are actually triggered and delivered; a saved template/rule is not evidence of an automation.
- [ ] Verify the payment ledger UI only becomes live after the approved migration and platform-admin access test.

### Platform evidence limitations

The current production Vercel deployment is READY for commit 3cab220e8c9acd4ec0587682f4a1ebc33f5223d9, but no live HTTP/browser smoke test was completed. The last 50 minutes of runtime logs contained no entries. A successful Vercel status is not an end-to-end pass. The website main commit has a Vercel success status but no GitHub Actions workflow run was returned. Mobile main has no status checks returned. Local GitHub cloning was unavailable due DNS resolution failure, so no local install, lint, tests, TypeScript or Expo export was run here.

The website PWA files are present on main, but browser install/offline/update tests remain outstanding. Vercel Hobby still has 11 of 12 top-level API function slots in use.

## Exact Stripe environment variable names

Add values in Vercel Project → Settings → Environment Variables. Do not put values in GitHub, source files, mobile config or chat.

### Production (live)

- `STRIPE_SECRET_KEY` — restricted live API key, preferably `rk_live_…`. Minimum current checkout scope: **Prices: Read** and **Checkout Sessions: Write**. Keep server-only/sensitive.
- `VITE_STRIPE_PUBLISHABLE_KEY` — matching live publishable key, `pk_live_…`. This is public by design, but must match live mode.
- `STRIPE_WEBHOOK_SECRET` — signing secret generated by the **live webhook endpoint** (starts `whsec_…`). It is not an API key and is unique to each endpoint.
- `STRIPE_PAYMENT_LEDGER_ENABLED` — leave `false` or unset until the approved ledger migration is applied and the webhook/membership lifecycle passes acceptance. Do not enable live checkout just because keys exist.
- `DATABASE_URL` and `PUBLIC_SITE_URL=https://mwfitnessuk.com` must already be configured.

### Preview / Development (test)

- `STRIPE_SECRET_KEY` — restricted test/sandbox key, `rk_test_…` (or standard `sk_test_…` only if a restricted key is unavailable).
- `VITE_STRIPE_PUBLISHABLE_KEY` — matching `pk_test_…`.
- `STRIPE_WEBHOOK_SECRET` — signing secret from a **test/sandbox webhook endpoint** pointing to the Preview deployment URL, using the same path below. Test endpoint secrets are not interchangeable with live secrets.
- `STRIPE_PAYMENT_LEDGER_ENABLED` — keep `false` until the test database has the ledger migration and lifecycle tests pass.
- Test Price IDs, if testing Stripe mode, use the existing variable names: `STRIPE_PRICE_ONLINE_4_WEEK_ONCE`, `STRIPE_PRICE_ONLINE_BRONZE_4WEEK`, `STRIPE_PRICE_ONLINE_SILVER_8WEEK`, `STRIPE_PRICE_ONLINE_GOLD_8WEEK`, and `STRIPE_PRICE_ONLINE_PLATINUM_8WEEK`. They must be test-mode Prices in the same Stripe sandbox as the test key. If no test credentials/Prices are available, leave **both Stripe keys absent** in Preview/Development so the explicit mock flow remains active. Do not put live keys in Preview.

### Webhook endpoint

Once the ledger and lifecycle are ready, register a Stripe webhook for:

- Live URL: `https://mwfitnessuk.com/api/create-checkout?route=webhook`
- Preview URL: the exact Vercel Preview deployment URL followed by `/api/create-checkout?route=webhook`.

Subscribe at minimum to `checkout.session.completed`, `checkout.session.async_payment_succeeded`, and `charge.refunded`. The endpoint handler currently records paid sessions as `pending_account_link`; it does **not** automatically activate memberships. The live endpoint must not be enabled until that operational workflow and refund/manual-review handling are agreed and tested.

### Staff HQ product ↔ Stripe behavior (current implementation)

Staff HQ currently saves coaching plan rows to Neon `public.plans` and SHWAG catalogue rows to Neon `public.swag_products`. It does **not** create or update Stripe Products/Prices. Online checkout reads the active plan's existing `stripe_price_id` and validates its mode, GBP currency and amount. Changing a price in Staff HQ without also updating/relinking the Stripe Price can make checkout fail closed with a price mismatch.

SHWAG products are currently enquiry/catalogue-only; they do not have a Stripe checkout flow. Do not silently create Stripe prices for them. A future Stripe sync must be a server-side operation with an admin authorization check, explicit product/price mapping, idempotency, deactivation/archive handling, and a clear partial-failure result. Stripe secret keys must never be used in browser code.
