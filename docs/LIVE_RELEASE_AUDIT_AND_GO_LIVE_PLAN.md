# MW FITNESS — Live Release Audit & Go-Live Plan

**Status:** Planning / release not yet approved (updated 2026-10-26 after PR #138 merge)  
**Scope:** Website, Staff HQ, Neon, Expo mobile app, branding, payments and production operations  
**Rule:** This document is a release plan, not evidence that tests have passed. Do not mark a gate complete without recorded evidence for the exact commit/build/environment tested.

## Executive decision

**Do not sign off the complete system for production use yet.** The website has a Vercel deployment marked READY, and the production Neon schema contains many expected tables. That does not prove that every route, Staff HQ mutation, role boundary, mobile save, native build or payment flow works end to end.

The initial audit found no automated test scripts. Review branches now add website demo-data regression tests, a real Neon CRUD integration test gated by RELEASE_TEST_DATABASE_URL, mocked Stripe session tests and mobile schema-contract tests. None have been run in this environment. Staff HQ live CRUD/RLS, mobile-to-Neon round trips and fresh Android build/device verification still need explicit evidence before release approval.

### Current status snapshot

| Area | Status | Evidence / next action |
|---|---|---|
| Website deployment | Deployment READY; functional status not fully verified | Run production HTTP and browser smoke tests against the exact deployed commit. |
| Website build / typecheck / lint | Not verified for release candidate | Run clean install, typecheck, lint and production build; save results. |
| Staff HQ | Partially implemented; live CRUD not signed off | Test supported create/edit/delete flows and all roles against controlled records. |
| Neon schema | Partially verified | Reconcile migration history with the actual production schema before applying any migration. |
| RLS / authorization | Needs end-to-end verification | Test coach, admin and member roles; prove member isolation and private-photo access. |
| Demo mode | Source implementation exists | Prove demo mutations never write to Neon and live mode never silently falls back to mock data. |
| Mobile persistence | Data-access code exists; round-trip not signed off | Prove mobile → Neon → Staff HQ → mobile reload for critical member data. |
| Android build / startup | Fresh build and device retest needed | Resolve any lockfile/build issues and test a newly installed build on a physical device. |
| Branding | Website PWA/favicon groundwork prepared on review branch; mobile icon/splash deferred | Verify website installability/offline behavior in a browser. Update native app icons and splash separately before store release. |
| Payments | Not ready for automatic paid membership activation until verified webhook lifecycle is complete | Test Stripe events, idempotency, membership provisioning, failures and refunds. |
| Release approval | Not ready to sign off | Complete all applicable P0 gates and record an explicit go/no-go decision. |

## Progress while working through this checklist (2026-10-26)

Latest checkout work:
- Replaced the fake disabled card-number/expiry/CVC inputs and misleading 'switch payments on' copy with an embedded Stripe Checkout mount. Stripe.js supplies the payment fields inside the website; the site never handles card numbers or CVCs.
- Added environment-based checkout modes: Production requires live keys and fails closed when missing; Preview/Development use test keys when configured and fall back to a clearly labelled mock only when both Stripe keys are absent. Partial key pairs and wrong-mode keys fail closed. For real Stripe sessions, the API verifies the plan is active/online in Neon and checks the selected Stripe Price object's `livemode`, GBP currency and amount against the active database plan before creating a session.
- Improved checkout input and placeholder contrast.
- Added a VITE_STRIPE_PUBLISHABLE_KEY placeholder plus server-side secret/Price ID placeholders to .env.example; expanded the health check so checkout is not marked configured until the publishable key, secret and all five active plan Price IDs are present.
- Added mocked Stripe-session tests, checkout UI regression tests and an optional real Neon CRUD round-trip test that only runs against RELEASE_TEST_DATABASE_URL, never DATABASE_URL.
- Read-only Vercel environment listing found PUBLIC_SITE_URL and DATABASE_URL, but no Stripe key or Price ID variables. Preview can use mock checkout until test credentials exist; Production remains unavailable until the owner adds real live keys and live Price IDs in Production. Do not create dummy Stripe environment values.
- PR #138 is merged into `main` at `1dbb45c7eb600f9a5c585a03c7212a86b5de39a8`. Vercel created production deployment `mwfitness-1h2l3hxne-cjc101187s-projects.vercel.app` with state `READY`; the Vite build completed. This is build evidence only, not browser/runtime/functional verification. Vite warned that the minified JavaScript bundle is about 839 kB, above the 500 kB warning threshold.
- A follow-up branch `release/post-merge-audit-and-payment-lifecycle` adds a prepared server-only payment ledger migration, signed Stripe webhook recording with timestamp-tolerant HMAC verification, idempotent session upsert, full/partial refund reconciliation, checkout return status verification, amount/currency checks, and a fail-closed payment-ledger environment gate. These changes are not merged/deployed, and the migration is not applied. The webhook records paid sessions as pending account linking/manual review; it does not grant membership access. New signature and status tests have been added but have not been run. Automated tests and `npm run lint` remain unrun.


The work from `release/staff-hq-tests-and-fixes` was squash-merged into `main` on 2026-10-26 as `1dbb45c7eb600f9a5c585a03c7212a86b5de39a8`. Vercel reported a pending status for that commit at the time of the follow-up audit; automated tests/build have not been run or verified. Further review work is being prepared separately on `release/post-merge-audit-and-payment-lifecycle` (not merged or deployed):
- Added `npm test` and a Node/tsx test suite for Staff HQ demo data operations: seed/read, create-update-delete, embedded relations, demo reset isolation and unknown-table errors.
- Fixed plan and nutrition-item deletion feedback so Staff HQ checks the returned deleted row instead of reporting success merely because the request had no API error. This matters when Neon RLS blocks a delete and returns zero affected rows.
- Fixed member-record assignment feedback so memberships, nutrition plans, workout sessions and programme assignments require a returned inserted row before reporting success.
- A fresh read-only query against the live `mwfitness` Neon branch confirms the enabled `profiles_guard_privileged_changes` and `workout_sessions_guard_member_completion` triggers exist, and the own-profile update policy checks that a user's role remains unchanged. This is schema evidence, not a substitute for runtime role/RLS tests.
- A read-only live-schema column check confirmed the current mobile helpers' key tables/columns exist for check-ins, progress photos, weigh-ins, cardio, daily metrics, nutrition logs, workouts, memberships, profiles and push tokens. This verifies schema presence only; it does not prove writes succeed under the real signed-in role or that data reloads end to end.
- Added [the repeatable release test runbook](./RELEASE_TEST_RUNBOOK.md), including safe demo testing, disposable Neon-branch integration tests, device checks and release gates.
- Added website PWA groundwork on this branch: a standalone manifest, square SVG icon, production-only service-worker registration and a worker that does not cache API/cross-origin responses. Browser installability/offline behavior remains unverified.

Work prepared on the mobile review branch `release/neon-schema-contract-tests` (not merged or released):
- Added a no-new-dependency `npm test` command and schema-contract tests that compare mobile read/write fields with the SQL migrations.
- The current `src/lib/remote.ts` already uses the migration-aligned calendar, progress-photo, weigh-in and cardio fields described in the older `MW-FITNESS-LIVE-NEON-PLAN.md`. Treat that older document's mismatch bullets as historical until the new tests and live round-trip tests are run; do not assume those issues remain present in current source.

**Execution status:** I could not run `npm ci`, tests, TypeScript or production builds from this environment because repository cloning/network resolution is unavailable here. The new tests are authored but are **not yet reported as passing**. Run the commands in the runbook on your machine and capture their output against these exact branches before merging.

**Still outstanding in this scope:**
- Website PWA verification: manifest, icon and service-worker registration are now prepared on the review branch; installability, offline fallback, cache refresh and real-browser behavior still need testing.
- Live Staff HQ UI CRUD, Neon RLS, and mobile-to-Staff-HQ persistence round trips using dedicated test accounts and a disposable Neon branch.
- Fresh Android native build and physical-device verification. Mobile branding assets are intentionally deferred at the user's request.
- Stripe webhook/idempotency and paid membership provisioning, email delivery, production browser/HTTP smoke tests, rollback and explicit go/no-go.

## 1. Scope and release principles

This plan covers:
- Website and public member journeys.
- Staff HQ administration and data management.
- Neon schema, migrations, access policies and persistence.
- Expo mobile app and native Android release.
- Brand assets, favicon, app icon and splash screen.
- Payments and membership activation, if live checkout is in scope.
- Deployment, rollback and post-launch monitoring.

Rules:
1. A feature in source code is not automatically a passed test.
2. A Vercel deployment marked READY is not proof that every route/API works.
3. Do not test destructive actions against real member records.
4. Use a disposable Neon test branch/database and clearly identified test accounts/records.
5. Never expose secrets in documentation, logs, issues or test output.
6. Do not apply migrations until repository migration history has been reconciled with the actual target schema.
7. Keep website and mobile release candidates identifiable by exact commit and build/version.
8. Mark every check PASS, FAIL, BLOCKED or NOT VERIFIED and link evidence.

## 2. Neon schema and migration verification

The audit inspected the MW Fitness Neon project using read-only queries. The production schema includes core tables for profiles, plans, memberships, nutrition, workouts, check-ins, progress, messages, videos, programmes, assignments, website leads, products and communications.

The current live schema includes `profiles.coach_prescription`. An older release note refers to migration `0013_profile_cardio_prescription.sql` as a prerequisite. Reconcile that documentation and the migration journal with the actual production schema before deciding whether a migration is needed. Do not blindly reapply a migration.

Read-only row counts observed during the audit:
- `plans`: 12
- `swag_products`: 4
- `communication_templates`: 13
- `coaching_videos`: 0
- `coaching_programmes`: 0
- `website_leads`: 0

These counts are a snapshot, not a pass/fail judgment. Empty tables need empty-state tests and a decision about initial content.

### Required checks
- [ ] Record production Neon project, branch and database identifiers.
- [ ] Compare migration files and migration journal with production schema.
- [ ] Identify unapplied migrations without executing them.
- [ ] Confirm backup/recovery point and recovery procedure.
- [ ] Verify foreign keys, constraints and indexes for release-critical data.
- [ ] Verify row-level security policies and role helper functions.
- [ ] Test member isolation for profiles, check-ins, nutrition, workouts, progress photos and messages.
- [ ] Verify staff/admin roles can only perform intended actions.
- [ ] Verify public endpoints expose only intended fields.
- [ ] Test migrations on an isolated branch first; record forward and rollback/recovery plan.

## 3. Staff HQ CRUD test matrix

Not every section necessarily supports every CRUD operation. Test the implemented contract; do not assume unavailable functionality exists. For each operation, verify success and failure states, persisted data after reload, role authorization, validation and related-record integrity.

| Staff HQ area | Create | Edit/update | Delete/remove | Additional checks |
|---|---|---|---|---|
| Members / profiles | Verify supported account-creation route | Update permitted profile fields | Verify supported removal/deactivation | Auth identity lifecycle, role protection, ownership |
| Plans / pricing | Create plan | Edit price, features, visibility | Delete unreferenced plan only | Protect referenced plans |
| Memberships | Assign plan | Change supported status/dates | Remove assignment where supported | Correct member/plan relationships |
| Nutrition | Create templates and member plans | Edit targets, meals, foods and portions | Delete where supported | Macro validation, assignment, member view |
| Training | Create templates/sessions | Edit exercises, schedule and status | Delete where supported | App assignment and completion state |
| Coaching programmes | Create programme | Edit duration, level and active state | Delete where safe | Assignments, dates and relationships |
| Videos | Create catalogue entry | Edit details and visibility | Delete entry where supported | URL validation, empty state |
| Check-ins | Submit from app / supported staff path | Review and save feedback | Delete only if supported | Member ownership, coach-only fields |
| Progress | Create weigh-in/photo via supported flow | Edit supported fields | Delete where supported | Private photo access and owner checks |
| Daily metrics / cardio | Create supported records | Update values | Remove where supported | Dates, units, prescription linkage |
| Supplements | Create/assign plan where supported | Edit plan | Remove where supported | Correct member assignment |
| Messages | Send message | Edit only if implemented | Delete only if implemented | Conversation isolation and sender permissions |
| Website leads | Submit enquiry | Update lead status | Verify supported deletion | Persistence when email delivery fails |
| Communications | Create supported template | Edit template/settings where implemented | Delete only if supported | Consent, suppression and safe test sends |
| SHWAG products | Create product | Edit price/details/stock/visibility | Delete where safe | Public catalogue reads active products |

### Standard CRUD acceptance procedure

For every supported create/edit/delete action:
1. Sign in with the correct role.
2. Load records from the intended test database.
3. Create a uniquely identifiable test record or use a designated test fixture.
4. Verify the UI reports success only after the write succeeds.
5. Reload the section and prove persistence.
6. Edit a field and verify the new value after reload.
7. Delete/deactivate the test record using the supported behaviour.
8. Reload and verify the expected outcome.
9. Verify related records and references remain consistent.
10. Repeat with invalid input, unauthorised role, missing configuration and a simulated database/network failure.

Failed saves must not show success, silently discard user input or leave a spinner stuck.

### Known limitations to verify against current code
- Member account creation/deletion is described as app-managed. Neon Auth identity lifecycle should use an authorized server-side route; editing a profile is not equivalent to deleting an auth identity.
- Communications automation rules are described as read-only, and the broadcast draft is local-only. Do not represent automation editing or live bulk dispatch as available until implemented and tested.
- Video catalogue records do not automatically prove video upload/storage is implemented.
- Prefer deactivation/archival where deleting a record could break membership or programme relationships.

## 4. Automated test strategy

The repositories' package scripts did not expose an existing automated test command during the audit. Add a repeatable test foundation.

Recommended layers:
- **Unit:** validation, data mapping, date handling, role logic and formatting.
- **Component:** Staff HQ forms, tables, dialogs, loading/error/empty states.
- **API:** authentication, input validation, permissions, database failures and safe error responses.
- **Database integration:** constraints, RLS and CRUD against an isolated Neon test branch.
- **End-to-end web:** browser login, Staff HQ journeys, refresh, persistence and logout.
- **Mobile integration:** data-access functions, session lifecycle, write/read/reload and error recovery.
- **Device acceptance:** newly installed Android build on a physical device.

Suggested tools: Vitest + React Testing Library + Playwright for the website; an Expo-compatible Jest setup plus integration/device testing for the mobile app. Confirm versions and compatibility before adding dependencies.

Test suites must use disposable fixtures and must never modify real member records. Keep secrets out of snapshots and logs. Run tests from a clean checkout and record exact commands/results.

## 5. Mobile app → Neon persistence acceptance

The app contains Neon-backed data-access functions, but the release must prove complete flows.

| Feature | Required acceptance |
|---|---|
| Authentication | Sign in, restore session after app restart, sign out, load correct profile |
| Membership | Display the membership assigned to the authenticated member |
| Training | Load assigned sessions; complete a permitted session; restart and verify persisted state |
| Nutrition | Load assigned plan; save supported completion/log state; reopen date and verify |
| Check-in | Submit in app; verify Neon record and Staff HQ view; reload app |
| Progress | Save weigh-in; verify history in app and staff view |
| Progress photos | Upload, reload, and verify owner/staff-only access |
| Water / steps | Save daily metrics; reopen correct date and verify |
| Cardio | Load coach prescription and save supported logs; compare app, staff view and schema |
| Supplements | Load the correct member's assigned plan |
| Messages | Member sends; staff reads/replies; member sees reply |
| Push notifications | Register token, deliver real test push, tap into intended screen |
| Failure handling | Test offline state, expired session, rejected writes, missing config and retry |

### Critical round-trip test
**Mobile action → Neon write → independent read → Staff HQ confirmation → mobile reload.**

Example: member submits check-in, the app confirms only after successful persistence, a test independently reads Neon, Staff HQ displays it, the coach saves feedback, and the member app reloads and displays the feedback. Repeat isolation checks with a second test member.

### Demo/live separation
- [ ] Demo records are clearly marked.
- [ ] Demo create/edit/delete never writes to Neon.
- [ ] Demo reset restores sample data.
- [ ] Refresh cannot silently switch modes.
- [ ] Live mode never silently substitutes fabricated records when Neon is unavailable.
- [ ] Exiting demo mode restores the correct live authentication/data source.

### Mobile build and device checks
The audit notes indicate a previously reported Android startup crash and a lockfile/clean-install concern require fresh verification.
- [ ] Clean dependency install succeeds from lockfile.
- [ ] Typecheck and lint pass.
- [ ] Expo export/native build succeeds.
- [ ] Fresh build installs and launches on physical Android device.
- [ ] Sign-in, core reads/writes, app restart and sign-out work.
- [ ] Push delivery works if notifications are in release scope.
- [ ] Build/version and tested commit are recorded.

## 6. Branding and installable web app

### Website checklist
- [ ] Approve the final source logo artwork.
- [ ] Update favicon using approved artwork.
- [ ] Verify browser-tab appearance at small sizes.
- [ ] Verify Apple touch icon and other browser icon formats where applicable.
- [ ] Check desktop/mobile navigation, login, account and Staff HQ branding.
- [ ] Check social preview image and metadata.
- [ ] Verify web manifest and PWA icon sizes if installability is in scope.
- [ ] Verify production appearance in a fresh browser session to avoid cached assets.

The website currently references `/logo.png` for its favicon, and `public/logo.png` exists. Verify the intended final favicon rather than assuming the reference is sufficient.

### Expo app checklist
Current configuration references:
- `assets/icon.png`
- `assets/splash-icon.png`
- `assets/android-icon-foreground.png`
- `assets/android-icon-monochrome.png`
- `assets/favicon.png`

The config uses the app name **MW Fitness**, splash background `#0B0C0E`, and version `1.0.0`; Expo remote version management is configured and the internal-test profile targets Google Play internal testing. Confirm actual remote build/version state before choosing the next version.

- [ ] Approve logo and contrast on dark backgrounds.
- [ ] Update source app icon.
- [ ] Regenerate derived assets using the existing repository script.
- [ ] Inspect Android adaptive foreground/background and monochrome output.
- [ ] Verify splash scaling, safe padding, contrast and background.
- [ ] Verify web favicon output.
- [ ] Verify app name and icon on launcher.
- [ ] Test cold-start splash on physical device.
- [ ] Build and install a fresh native package to verify included assets.

Changing a PNG in source does not update an already installed app. A fresh native build and installation are required.

## 7. Production configuration and security

- [ ] Verify production domain and HTTPS.
- [ ] Verify production vs preview environment separation.
- [ ] Verify Neon Auth redirect URLs, email verification and password recovery.
- [ ] Ensure secrets and payment credentials are server-side only.
- [ ] Verify public endpoints expose only intended fields.
- [ ] Test enquiry persistence when email notification succeeds and fails.
- [ ] Verify privacy, cookie and data-deletion information matches actual behaviour.
- [ ] Remove test credentials, demo records and placeholder claims from production experience.
- [ ] Confirm logs do not contain secrets or private member data.
- [ ] Verify error handling does not leak SQL, tokens or internal configuration.

## 8. Payments and membership activation (separate gate)

The website now prepares embedded Stripe Checkout, but no Stripe keys or Price IDs were present in the last Vercel environment audit. Production deployment is READY, but functional smoke tests have not been run. The follow-up branch prepares a signed webhook and payment ledger; its migration is not applied and its endpoint is not deployed/configured. Real checkout now also requires `STRIPE_WEBHOOK_SECRET` and `STRIPE_PAYMENT_LEDGER_ENABLED=true`. Keep the gate disabled until the ledger and webhook are verified. Account linking and idempotent membership provisioning remain incomplete; do not accept live payments.

- [ ] Add Stripe test-mode publishable/secret keys and matching test Price IDs to Preview/Development only.
- [ ] Test embedded checkout in Stripe test mode.
- [ ] Test success, cancellation and payment failure.
- [ ] Verify signed webhook events.
- [ ] Make event processing idempotent.
- [ ] Record verified payments and associate them with the correct account.
- [ ] Provision/link membership only after verified payment.
- [ ] Test account setup and access to purchased coaching.
- [ ] Test refunds and relevant failure cases.
- [ ] Prove browser redirects alone cannot grant paid access.
- [ ] Add live publishable/secret keys and matching live Price IDs to Vercel Production only.
- [ ] Confirm live Stripe configuration and operational ownership before enabling live payments.

## 9. Phased go-live checklist

### Phase 1 — Baseline and inventory
- [ ] Record website and mobile main commits.
- [ ] Record production deployment and mobile build/version.
- [ ] Review open PRs and stranded release-critical branches.
- [ ] Record production Neon project/branch/database.
- [ ] Reconcile migration history and live schema.
- [ ] Record environment-variable names and environment assignments without secret values.
- [ ] Verify recovery point and rollback/recovery procedures.
- [ ] Identify data and accounts that must never be used for tests.

**Exit:** known baseline, clear migration state and safe test environment.

### Phase 2 — Automated tests
- [ ] Add web and mobile test runners.
- [ ] Add disposable fixtures and isolated Neon test configuration.
- [ ] Add Staff HQ CRUD tests.
- [ ] Add API/authentication/role tests.
- [ ] Add RLS and member-isolation tests.
- [ ] Add demo/live isolation tests.
- [ ] Add mobile persistence and failure-path tests.
- [ ] Add cross-platform round-trip tests.
- [ ] Make commands reproducible from clean checkout.
- [ ] Record test output for exact commits.

**Exit:** repeatable suite; all release-critical tests pass.

### Phase 3 — Staff HQ and security
- [ ] Test supported CRUD flows and error handling.
- [ ] Test role-specific permissions and RLS.
- [ ] Test relationship integrity and delete protection.
- [ ] Verify real Neon persistence after refresh.
- [ ] Verify demo mode isolation.
- [ ] Document intentionally unsupported operations.

**Exit:** supported operations pass and access boundaries are verified.

### Phase 4 — Mobile
- [ ] Complete mobile-to-Neon round trips.
- [ ] Verify dates, photo storage/privacy and messages.
- [ ] Verify push delivery if in scope.
- [ ] Test session expiry, restart, sign-out and network failure.
- [ ] Resolve clean install/lockfile issues.
- [ ] Build, install and test on physical Android device.
- [ ] Verify final icon/splash in installed build.

**Exit:** stable launch and persistent real data on device.

### Phase 5 — Branding and production configuration
- [ ] Update website and mobile assets together.
- [ ] Verify favicon, icon, splash and adaptive icons.
- [ ] Verify auth, environment separation and public endpoints.
- [ ] Verify enquiry, privacy and error handling.

**Exit:** consistent branding and verified production configuration.

### Phase 6 — Payments (if enabled at launch)
- [ ] Complete signed webhook and membership provisioning lifecycle.
- [ ] Test idempotency, failure, cancellation and refund cases.
- [ ] Confirm paid access is granted only after verified payment.

**Exit:** complete test-mode lifecycle; live payments explicitly approved.

### Phase 7 — Release candidate
- [ ] Freeze exact release candidate commit(s).
- [ ] Clean install, typecheck, lint and production build pass.
- [ ] Automated tests pass and results are recorded.
- [ ] Staff HQ and mobile smoke tests pass.
- [ ] Production schema/migrations reconciled.
- [ ] Live domain/API smoke tests pass.
- [ ] Branding verified on desktop, mobile browser and Android device.
- [ ] No unresolved P0 blockers.
- [ ] Record accepted risks and explicit go/no-go decision.

**Exit:** all required checks pass for the exact candidate.

### Phase 8 — Controlled release
**Website**
- [ ] Deploy verified candidate.
- [ ] Wait for Vercel READY.
- [ ] Check domain, homepage, packages, login, Staff HQ and critical API endpoints.
- [ ] Run one controlled end-to-end smoke test.
- [ ] Confirm no unexpected database changes.

**Mobile**
- [ ] Build from verified commit with version recorded.
- [ ] Submit to Google Play internal testing first.
- [ ] Install submitted build and repeat critical tests.
- [ ] Verify login, data saves, icon, splash and message handling.
- [ ] Expand rollout only after internal testing passes and approval is recorded.

**Rollback**
- [ ] Keep previous known-good website deployment available.
- [ ] Keep previous mobile build/version and document rollback/stop-release procedure.
- [ ] Treat database migrations separately; app rollback does not automatically reverse schema/data changes.
- [ ] Stop expansion immediately for data loss, cross-member exposure or incorrect paid access.

### Phase 9 — Post-launch monitoring
- [ ] Monitor API errors and Neon connectivity.
- [ ] Check authentication and staff access failures.
- [ ] Verify check-ins and member records appear correctly.
- [ ] Confirm no test/demo data entered production.
- [ ] Check push delivery and payment events if enabled.
- [ ] Record and triage first-user issues.
- [ ] Confirm rollback path remains available.

## 10. Priority release blockers

| Priority | Item | Reason |
|---|---|---|
| P0 | Repeatable automated test suite for CRUD | Detect regressions in critical data operations |
| P0 | Staff HQ live CRUD and permission sign-off | Prevent failed writes and unauthorized changes |
| P0 | Mobile-to-Neon round-trip sign-off | Prove member data is actually saved and shared |
| P0 | Fresh Android build/startup verification | Resolve/verify prior reported startup issue |
| P0 | RLS and member-isolation verification | Protect private coaching and health-related member data |
| P1 | Migration documentation reconciliation | Avoid applying or skipping the wrong migration |
| P1 | Coordinated branding update | Consistent web and app identity |
| P1 | Production HTTP/browser smoke tests | READY deployment alone is insufficient |
| P1 if payments launch | Verified payment-to-membership lifecycle | Checkout alone does not securely activate paid access |
| P1 if notifications launch | End-to-end push/communications verification | Stored tokens/templates do not prove delivery |

These priorities are a proposed release order, not a claim that every item is a confirmed defect.

## 11. Release evidence log

Complete this table during release work.

| Gate | Status (PASS / FAIL / BLOCKED / NOT VERIFIED) | Commit/build/environment | Evidence link / notes | Owner |
|---|---|---|---|---|
| Baseline and migrations | NOT VERIFIED | | | |
| Web clean install/build/typecheck/lint | NOT VERIFIED | | | |
| Staff HQ CRUD | NOT VERIFIED | | | |
| Staff roles and RLS | NOT VERIFIED | | | |
| Demo/live isolation | NOT VERIFIED | | | |
| Mobile round trips | NOT VERIFIED | | | |
| Android build and device startup | NOT VERIFIED | | | |
| Branding on web and device | NOT VERIFIED | | | |
| Payments (if in scope) | NOT VERIFIED | | | |
| Production smoke test | NOT VERIFIED | | | |
| Rollback readiness | NOT VERIFIED | | | |
| Final go/no-go | NOT VERIFIED | | | |

## 12. Audit boundaries and reference links

The audit checked repository files, package scripts, release-plan documentation, production deployment metadata and selected read-only Neon schema/policy/table queries. It did not run a local build, execute the new test suite, perform Android device testing, mutate Neon, or verify every public URL with a complete browser session. Those items remain unverified until evidence is attached.

References:
- [Website repository](https://github.com/chriscallaghan2012/mwfitness)
- [Website release plan](https://github.com/chriscallaghan2012/mwfitness/blob/main/docs/MW-FITNESS-PLAN-OF-ACTION.md)
- [Live Neon and mobile integration plan](https://github.com/chriscallaghan2012/mwfitness/blob/main/docs/MW-FITNESS-LIVE-NEON-PLAN.md)
- [Staff HQ admin screen](https://github.com/chriscallaghan2012/mwfitness/blob/main/src/components/admin/AdminScreen.tsx)
- [Member management](https://github.com/chriscallaghan2012/mwfitness/blob/main/src/components/admin/UsersAdmin.tsx)
- [Admin data-source switch](https://github.com/chriscallaghan2012/mwfitness/blob/main/src/lib/admin/adminDb.ts)
- [Mobile repository](https://github.com/chriscallaghan2012/MW-FITNESS-APP-MOBILE)
- [Mobile Neon data-access layer](https://github.com/chriscallaghan2012/MW-FITNESS-APP-MOBILE/blob/main/src/lib/remote.ts)

## Final recommendation

Start with the test foundation, Staff HQ CRUD/security verification and mobile-to-Neon round trips. Then update branding, verify the fresh Android build, complete the release-candidate checks and release the website and app in controlled steps. Treat live payments as a separate gate unless their full webhook-to-membership lifecycle has passed.

**No release is approved by this document alone.**