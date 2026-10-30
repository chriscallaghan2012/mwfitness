# MW Fitness — End-to-End Release Checklist

**Purpose:** One practical checklist for the manual end-to-end release pass. Tick items only after testing the actual deployed website/app against the intended environment. A green Vercel build or a passing mocked test is not proof of a live workflow.

- Website repo: `chriscallaghan2012/mwfitness`
- Production branch: `main`
- Live data: Neon — use real production only for safe read-only checks or explicitly approved, reversible test actions.
- Payments: **do not take live payments during this checklist** until the signed webhook, payment ledger, account linking, membership provisioning and refund/access handling are all implemented and verified.
- Mobile assets: intentionally deferred; the owner will supply/update these later.
- Rule: record the date, tester, commit/deployment, environment and evidence for any PASS. Leave unchecked if not tested.

## 0. Test setup and safety

- [ ] Record the exact `main` commit and Vercel deployment being tested.
- [ ] Confirm the production URL and Preview URL; verify each is using its intended environment.
- [ ] Confirm Preview/Development use Stripe test mode when test credentials are configured.
- [ ] Confirm Preview/Development with both Stripe keys absent uses the clearly labelled mock checkout and never creates a Stripe session or takes money.
- [ ] Confirm partial/mismatched Stripe key configuration fails closed instead of silently using mock checkout.
- [ ] Confirm Production has matching live Stripe keys. Coaching Price IDs come from Neon `public.plans`; do not add per-plan `STRIPE_PRICE_*` environment variables.
- [ ] Confirm Preview plan sync stays blocked until Preview has separate Neon Auth, Data API and DATABASE_URL values, matching Stripe test keys, and both Preview-only flags `STRIPE_PLAN_SYNC_PREVIEW_ENABLED=true` and `STRIPE_PLAN_SYNC_PREVIEW_DATABASE_ISOLATED=true`.
- [ ] Confirm no `STRIPE_WEBHOOK_SECRET` is configured yet; live paid membership processing must remain blocked until the real webhook endpoint and signing secret are configured and the ledger/membership lifecycle tests pass.
- [ ] Confirm no secret keys, database URLs, webhook secrets or customer-sensitive data are pasted into GitHub issues, screenshots or logs.
- [ ] Confirm any live-data write test uses an explicitly approved test account/fixture and has a cleanup plan.
- [ ] Confirm current database schema/migrations are documented before running schema changes.
- [ ] Record who is testing and where failures should be reported.

## 1. Website public journeys

- [ ] Open the homepage in a fresh private/incognito browser window.
- [ ] Verify logo, favicon, typography, orange/black branding, navigation and footer.
- [ ] Verify no console errors or failed critical network requests on initial load.
- [ ] Refresh the homepage and directly open a nested URL; routing should survive refresh.
- [ ] Check desktop and mobile-browser layouts, including narrow viewport and navigation/sidebar behavior.
- [ ] Open coaching packages and verify names, prices, features, highlighted Gold package and button alignment.
- [ ] Confirm package data is sourced from the intended backend and stale/demo values are not presented as live.
- [ ] Submit the enquiry/lead form with valid data using an approved test fixture; verify validation, success/error state and persistence.
- [ ] Repeat form submission with missing/invalid fields; confirm helpful errors and no malformed record.
- [ ] Check privacy/GDPR wording, contact details and policy links.
- [ ] Check PWA manifest, icon, service-worker registration and installability in a real browser; verify API responses are not cached.
- [ ] Check a failed/offline request and confirm the UI explains the failure rather than showing false success.

## 2. Authentication and member account

- [ ] Create or use an approved test member account in the intended environment.
- [ ] Sign in with valid credentials.
- [ ] Verify invalid credentials show a safe, understandable error.
- [ ] Verify sign-out clears access and returns to a signed-out state.
- [ ] Verify a session survives refresh where expected and expires safely.
- [ ] Verify direct navigation to member-only routes while signed out is blocked.
- [ ] Verify one member cannot read or edit another member's profile, check-ins, photos, messages, nutrition or workout data.
- [ ] Verify profile edits persist after refresh and a new session.
- [ ] Verify member email/account identifiers are handled consistently across checkout and account flows.
- [ ] Verify password reset/account recovery if enabled in the release.

## 3. Staff HQ — live Neon data

Run these checks with authorised staff test accounts, not demo mode. Use safe fixtures and clean up only those fixtures.

- [ ] Confirm Staff HQ clearly indicates whether it is connected to live Neon or demo data.
- [ ] Confirm the admin data-source switch cannot accidentally show demo data as live.
- [ ] Read the member list from Neon; refresh and confirm it remains consistent.
- [ ] Create a test member/record where supported; verify it appears in Neon and after refresh.
- [ ] Edit an approved test record; verify the persisted values after reload.
- [ ] Test validation errors and duplicate/conflicting input handling.
- [ ] Test delete/archive only against a disposable fixture; confirm related-data protection and expected confirmation.
- [ ] Test plans/package reads and permitted edits; verify each online coaching plan's Neon Stripe Product/Price mapping matches the correct active GBP Price. The release candidate creates a new immutable Price on price change and archives online plans instead of hard-deleting them.
- [ ] Test online coaching plan create/edit/price-change/hide/reactivate/archive against a disposable Stripe test account + disposable Neon branch when Preview has isolated credentials/database. Do not test destructive sync against live plans.
- [ ] Confirm SHWAG products remain catalogue/enquiry-only; do not create Stripe Prices until its checkout/sales flow exists.
- [ ] Test memberships reads/updates with a disposable account; confirm correct member association and no cross-member leakage.
- [ ] Test nutrition, workouts, check-ins, progress entries/photos, messages, videos, programmes/assignments and leads where the UI supports those operations.
- [ ] Confirm failed writes show a visible error and do not claim success.
- [ ] Refresh after every successful write to prove persistence.
- [ ] Verify platform-admin-only functions are unavailable to coaches and members.
- [ ] Verify coach access is limited to assigned/authorised members and permitted operations.
- [ ] Verify member accounts cannot access Staff HQ APIs or other members' records.
- [ ] Verify direct API calls are also protected; hiding a button or page is not sufficient.
- [ ] Confirm payment ledger access, if the migration is later approved/applied, is platform-admin-only and read-only from the browser.
- [ ] Record any missing CRUD operation, unclear error, RLS failure or data mismatch as a blocker.

## 4. Neon schema, migrations and isolation

- [ ] Compare repository migration history with the actual live Neon schema before applying anything.
- [ ] Reconcile the existing profile cardio-prescription field/migration discrepancy; do not blindly rerun an old migration.
- [ ] Confirm required tables, columns, indexes, constraints and foreign keys exist.
- [ ] Review RLS enabled status and policies for every member-private table.
- [ ] Verify anonymous access is denied for private member and payment data.
- [ ] Verify authenticated members can access only their own records.
- [ ] Verify staff roles match the intended access matrix, including the distinction between `is_admin()` and `is_platform_admin()`.
- [ ] Run automated Neon CRUD integration tests only against a disposable non-production Neon branch via `RELEASE_TEST_DATABASE_URL`.
- [ ] Verify integration tests clean up their own unique fixtures even when an assertion fails.
- [ ] Confirm no test/demo records were inserted into production.
- [ ] Record migration application order and the exact database branch tested.

## 5. Checkout and payment lifecycle

**Safety gate: no real charge until every required item below has passed and live payment testing is explicitly approved.**

- [ ] Verify mock checkout is labelled as a simulation and cannot create a Stripe session, payment or membership.
- [ ] Verify Preview test checkout embeds Stripe on the website when valid test keys and test Price IDs are configured.
- [ ] Verify website name/email fields have readable placeholders and usable validation.
- [ ] Verify Stripe collects card details; MW Fitness never receives or stores raw card number/CVC.
- [ ] Verify each active package maps to the correct Stripe Price ID, amount and currency.
- [ ] Verify wrong-mode Price IDs and mixed live/test keys fail closed.
- [ ] Verify cancel, payment failure, pending/asynchronous payment and return-to-site behavior.
- [ ] Verify a return URL does not itself grant membership access.
- [ ] Verify returned Checkout Session identity, payment status, expected amount, currency and live/test mode against Stripe.
- [ ] Verify duplicate webhook delivery is idempotent.
- [ ] Verify invalid signature, stale signature timestamp, wrong-mode event and malformed body are rejected.
- [ ] Verify paid events are recorded in the server-only payment ledger without exposing Stripe secrets or customer details to the browser.
- [ ] Verify unmatched customer/account, wrong plan/amount/currency and incomplete payment are held for manual review.
- [ ] Implement and verify secure customer account linking before granting membership.
- [ ] Implement and verify idempotent membership activation only after a confirmed paid event and valid account link.
- [ ] Implement and verify refund, dispute and access-revocation/reconciliation behavior.
- [ ] Verify staff can safely reconcile a payment and cannot accidentally link it to the wrong member.
- [ ] Configure the correct test/live webhook endpoint and signing secret for the intended environment.
- [ ] Keep `STRIPE_PAYMENT_LEDGER_ENABLED=false` until the approved migration and webhook are deployed and verified.
- [ ] Only after approval, perform a controlled live transaction/refund and record evidence.

## 6. Communications, email, leads and push

- [ ] Verify a test enquiry is persisted and the expected notification is sent once.
- [ ] Verify email provider configuration and sender/domain authentication.
- [ ] Verify template variables are escaped and missing variables fail safely.
- [ ] Verify test-send endpoints require authorised staff access and cannot be abused anonymously.
- [ ] Verify unsubscribe/consent behavior and relevant privacy requirements.
- [ ] Verify notification failures are logged without exposing credentials or personal data.
- [ ] Verify push-token registration, delivery and invalid-token handling if push is in scope.
- [ ] Verify communication rules do not send duplicate or unintended messages.
- [ ] Confirm test emails/messages are clearly marked and do not reach real members accidentally.

## 7. Mobile app — functionality only (assets deferred)

- [ ] Install a clean build from the intended mobile branch/commit.
- [ ] Verify app launches without a startup crash.
- [ ] Sign in and sign out using a test member account.
- [ ] Verify profile, plans, workouts, nutrition, check-ins, photos and messages load from the intended Neon-backed API.
- [ ] Create/update safe test data and verify it persists after app restart and on the website where shared.
- [ ] Verify image/photo access is private and only the authorised member can open it.
- [ ] Verify session expiry, network loss, retry and API error handling.
- [ ] Verify app does not silently fall back to demo data while appearing connected to live data.
- [ ] Build and install on a physical Android device; record version and commit.
- [ ] Verify deep links/notification navigation if in scope.
- [ ] **Deferred:** replace/finalise app icon, splash and adaptive icon assets after the owner supplies them.

## 8. Production smoke test

- [ ] Confirm the intended release commit is deployed and Vercel reports READY.
- [ ] Open the production domain in a fresh browser session.
- [ ] Check homepage, packages, login, member pages, enquiry form and Staff HQ sign-in.
- [ ] Check key public/API endpoints return expected status without leaking configuration.
- [ ] Confirm health/status output does not disclose secret values.
- [ ] Check Vercel runtime logs for new critical errors during the smoke test.
- [ ] Confirm database connectivity and no unexpected write/migration activity.
- [ ] Confirm Production uses production-only environment variables and live Price IDs only when payment approval is granted.
- [ ] Confirm Preview uses Preview variables and cannot accidentally charge a live card.
- [ ] Check mobile viewport and PWA behavior.
- [ ] Record any console errors, API failures or data mismatches with exact time and route.

## 9. Rollback, monitoring and sign-off

- [ ] Record the previous known-good website deployment and rollback steps.
- [ ] Document how to stop checkout/notifications safely without deleting customer data.
- [ ] Confirm database migration rollback/recovery approach separately from application rollback.
- [ ] Confirm monitoring/alerts and an owner for production errors.
- [ ] Verify backups/recovery approach for member records and private photos.
- [ ] Review all P0/P1 issues and document accepted risks.
- [ ] Attach test results/screenshots/log excerpts with private data redacted.
- [ ] Record final decision: GO / NO-GO / GO WITH EXPLICIT ACCEPTED RISKS.
- [ ] Record sign-off from the people responsible for website, data/security, mobile and payments.

## Results log

| Date/time | Tester | Commit/deployment | Environment | Result | Evidence / issue |
|---|---|---|---|---|---|
| | | | | NOT RUN | |

## Blocker log

| Priority | Area | Failure / missing evidence | Owner | Issue link | Status |
|---|---|---|---|---|---|
| P0 | Staff HQ live CRUD and role/RLS | Not verified until tested against authorised live data | | | OPEN |
| P0 | Member data isolation | Not verified until cross-account access tests pass | | | OPEN |
| P0 | Mobile-to-Neon persistence | Not verified until round-trip tests pass | | | OPEN |
| P0 if payments launch | Payment-to-membership lifecycle | Account linking, activation and refund/access lifecycle must be complete | | | BLOCKED |
| P1 | Production browser smoke test | READY deployment alone is insufficient | | | OPEN |
| P1 | Android clean build/device test | Must be run on a physical device | | | OPEN |
| P1 | Schema/migration reconciliation | Must compare repository history with live schema | | | OPEN |

**Status convention:** PASS = tested with evidence; FAIL = tested and failed; BLOCKED = cannot safely test yet; NOT RUN = no test performed. Do not mark an item complete from code review alone.
