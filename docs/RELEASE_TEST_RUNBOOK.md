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
- `npm test` runs the Staff HQ demo data-layer tests, public API guard/mount tests and PWA configuration checks using Node's test runner through the existing `tsx` dependency.
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

These tests exercise the in-memory Staff HQ data client, not the live Neon API, React click flows, RLS, or authentication. They are a foundation, not a replacement for live integration tests.

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
