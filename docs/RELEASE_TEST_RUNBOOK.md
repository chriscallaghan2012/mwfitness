> **CURRENT HANDOFF — 2026-10-30 (release candidate; not merged/deployed)**  
> Website release branch: `release/mwfitness-final-readiness-2026-10-30`. Mobile release branch: `release/final-readiness-2026-10-30`. Both are ahead of `main`; neither is merged or released. Production website baseline is `3cab220e8c9acd4ec0587682f4a1ebc33f5223d9`; mobile baseline is `21870989fcff771953e4823677047e3d8fab98db`. No production deploy or production database migration was performed by this work.
>
> **Website code updated:** dynamic Staff HQ online-plan create/edit/visibility/archive sync; Neon-backed Stripe Product/Price mapping; checkout no longer uses per-plan Price environment variables; webhook validation supports new online plan IDs; tests and docs updated. SHWAG products remain catalogue/enquiry-only and are not Stripe-synced because no sales/checkout flow exists. Preview plan sync is blocked while Preview shares production Neon. Full tests/build/lint have not been run in this environment.
>
> **Vercel environment inventory (metadata only; no secrets decrypted):** only seven project variables are currently listed: `DATABASE_URL`, `PUBLIC_SITE_URL`, `VITE_NEON_AUTH_URL`, `VITE_NEON_DATA_API_URL`, `STRIPE_SECRET_KEY`, `VITE_STRIPE_PUBLISHABLE_KEY`, and `STRIPE_PAYMENT_LEDGER_ENABLED`. No legacy `VITE_SUPABASE_*` variables and no per-plan `STRIPE_PRICE_*` variables are present in this current inventory. `STRIPE_WEBHOOK_SECRET` was not listed. The ledger flag is targeted at Production only; its encrypted value was not inspected. Do not enable live payment processing until the migration, webhook and membership lifecycle are reviewed and approved.
>
> **Payment state:** restricted Stripe secret key must allow Product/Price read-write and Checkout Session creation. Product/Price sync is separate from payment verification. The prepared migration `db/migrations/20261026_stripe_payment_records.sql` remains unapplied. No automatic membership activation/revocation is signed off.
>
> **Mobile security state:** fake WebCrypto success fallbacks were removed from the mobile release branch and a static test was added. This is not a native crypto sign-off: check SubtleCrypto compatibility, Neon Auth login/session/password reset and Data API access on a fresh physical Android build.
>
> **No CI result found:** GitHub Actions lists no workflow runs for either release branch. Source-level syntax checks were performed for the touched server modules, but the test suite, lint, TypeScript and production builds have not been run.
>
> **Release rule:** use disposable Neon test data/branch and dedicated test accounts. Do not merge, deploy, apply production migrations, charge live cards, send production test emails, or publish to Google Play without explicit authorization.
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

## 7. Stripe plan-management and payment-release checks

### Staff HQ plan sync (production-only code path)
Use a dedicated admin and an approved safe test window. The release candidate blocks Preview sync because Preview currently shares the production Neon database; do not bypass that guard.

Before enabling this workflow:
- [ ] Confirm the production restricted Stripe key has Product and Price read/write plus Checkout Session create permissions.
- [ ] Confirm current online plan rows have correct `stripe_product_id` / `stripe_price_id` mappings in Neon and match the expected active GBP Prices in Stripe.
- [ ] Test a create/edit/price change/hide/reactivate/archive sequence against a disposable Stripe test account and a disposable Neon branch once Preview has its own database and test keys.
- [ ] Verify a price change creates a new Price, deactivates the old one, and the public checkout uses the new Neon mapping.
- [ ] Verify failed Stripe sync is shown as an error and does not falsely report success; verify retries do not create duplicate Products/Prices.
- [ ] Verify archiving prevents new purchases but retains the plan and historic payment records.
- [ ] Verify SHWAG remains catalogue/enquiry-only; do not create Stripe Prices until its checkout/sales flow is designed.

### Before any live paid checkout
- [ ] Create the Stripe webhook endpoint for the production checkout route and configure its exact signing secret as `STRIPE_WEBHOOK_SECRET` in Vercel Production.
- [ ] Review the prepared `db/migrations/20261026_stripe_payment_records.sql` and obtain explicit approval before applying it to the intended production Neon branch.
- [ ] Verify valid, invalid, stale and duplicate webhook signatures/events; paid vs unpaid sessions; amount/currency/mode mismatch; refund/reversal; replay/idempotency.
- [ ] Implement and verify safe customer/account linking, membership provisioning and revocation. A payment-ledger row alone must not grant membership.
- [ ] Keep live checkout disabled until the complete lifecycle has passed. Never use live cards for tests.

## 8. Final website release checklist — Chris

Run from the website repo root against the exact release branch/commit:

```bash
npm ci
npm test
npm run lint
npm run build
```

- [ ] Record branch + commit SHA, Node/npm versions, output and exit code for each command.
- [ ] Open the production site and verify homepage, package/pricing pages, contact form, app waitlist, legal pages, direct-route refresh and mobile/desktop layout.
- [ ] Verify `/api/health` and `/api/products` over HTTP; issue #49 for `/api/products` remains open until verified against the intended deployment.
- [ ] Sign in to Staff HQ as the real authorized admin; verify non-staff is denied and coach cannot make platform-admin-only changes.
- [ ] Demo mode: CRUD/visibility for supported screens; refresh; invalid input; cancel delete; confirm demo writes do not persist to Neon.
- [ ] Disposable Neon branch: create/edit/assign plan and member data; confirm persisted after refresh and visible to the correct app account.
- [ ] Verify member A cannot read/write member B's data; verify private progress photos are private.
- [ ] Verify PWA install prompt/manifest/icon, offline fallback and service-worker update in a real browser.
- [ ] Verify enquiry persistence and email notification delivery/failure/retry.
- [ ] Run payment tests only in Stripe test mode after isolated Preview DB/test keys exist; do not test live payment until the payment gate above is complete.

## 9. Final mobile release checklist — Chris

Run from the mobile repo root against `release/final-readiness-2026-10-30`:

```bash
npm ci
npx tsc --noEmit
npm run lint
npm test
npx expo export --platform android
```

- [ ] Record branch + commit SHA, Node/npm versions, output and exit code for each command.
- [ ] Resolve lockfile/install errors before interpreting downstream failures.
- [ ] Build a fresh Android binary and install it on a physical device; a JS export is not proof that the native app starts.
- [ ] Test cold start, fatal-error screen, secure random generation and whether the actual Neon Auth dependency requires SubtleCrypto; never add a fake crypto success fallback.
- [ ] Test sign-up/sign-in, session restore, sign-out, password reset email/deep link, invalid/expired token and role routing.
- [ ] Verify profile/membership, check-ins, weigh-ins, photos, cardio, daily metrics, nutrition logs, workout completion/calendar, supplements/steps where enabled, and coach/member messages survive reload and appear in Staff HQ.
- [ ] Verify account isolation with two dedicated test members and an authorized coach/admin.
- [ ] Verify denied permissions, offline/retry/error states, photo privacy and notification token/permission flows if push is in day-one scope.
- [ ] Check app icon/splash/adaptive icon and font/layout/back navigation on device.
- [ ] Keep distribution to Google Play internal testing until the owner explicitly approves a wider release.

## 10. Human-only sign-off / do not skip

- [ ] Chris records the real web and mobile test results and any failures.
- [ ] Mike approves coaching/business acceptance and app release scope.
- [ ] Production backup/restore and rollback owner are confirmed.
- [ ] Final go/no-go is recorded against the exact tested commits.
- [ ] Only after approval: one planned merge/build/deployment; no repeated deployments during the test cycle.

Do not mark a test as passed based on source review, a branch existing, or a Vercel deployment marked READY.