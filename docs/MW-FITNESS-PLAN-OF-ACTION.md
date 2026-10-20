# MW Fitness — plan of action and test gates

This file contains historical notes for both `mwfitness` (website / Staff HQ) and `MW-FITNESS-APP-MOBILE` (Expo app). For current website work, `main` is the source of truth. Compare divergent branches at file level and recover only changes genuinely missing from `main`; do not merge stale branches wholesale or assume ahead/behind counts equal missing features. Keep website and Android changes separate. Do not deploy, dispatch GitHub workflows/build submissions, post to Slack, send test emails, or change the shared Neon database without explicit approval. Website verification is configured as manual-only.

## Completed in this work batch
- [x] Android nutrition day selector now loads and saves the selected calendar date rather than always reading/writing today's nutrition log.
- [x] Android nutrition log helper accepts an explicit date while retaining today's date as the backwards-compatible default.
- [x] Staff programme builder initializes the missing-backend state correctly, handles load exceptions, reports client-list failures, and refuses write actions when Neon is not configured.
- [x] Pricing query errors are logged in the browser console for diagnosis while visitor-facing error copy remains generic.
- [x] Video library load exceptions and missing Neon configuration now produce explicit states; save/delete/visibility actions are guarded when no live client is configured.
- [x] Staff HQ plan, workout, nutrition, membership, user, and check-in/progress modules guard missing Neon configuration instead of dereferencing a null client.
- [x] Staff user CRUD now catches load/save/create exceptions, checks for a missing Neon client before writes, and always clears its busy state after save/create failures.
- [x] Removed role editing from routine client-profile editing: the single coach/operator keeps staff access, while trainees are managed as client accounts.
- [x] Progress tools now load the newly selected client rather than a stale previous ID, validate manual weigh-ins, and surface database errors for check-in review/delete and progress CRUD.
- [x] Check-in list loading, review saves, and deletes now surface backend errors rather than silently failing.
- [x] Membership assignment/removal and workout/session loading now report backend errors instead of silently leaving stale tables.
- [x] Workout template creation, session scheduling/status changes, and lead inbox load/status updates now catch request failures and show actionable error states.
- [x] Nutrition admin now guards missing Neon configuration for client-plan reads and all writes, catches rejected save/delete/assignment requests, and keeps the editor open when a save fails.
- [x] Programme visibility updates now check the live database client, disable during requests, and report rejected updates instead of silently failing.
- [x] Workout template deletion now guards missing Neon configuration and catches rejected delete requests.
- [x] Nutrition template/client-plan reads now catch rejected requests; template assignment reports the actual read error and always resets busy state.
- [x] Pricing catalogue admin now catches rejected plan reads, creates/edits, deletes and visibility updates, preserving form state on save failures.
- [x] Android login no longer presents a role toggle that only changed labels; access is determined by the authenticated profile, with coach/admin profiles routed to the coaching dashboard and trainee profiles to the member experience.
- [x] Nutrition date changes now show the selected day as loading until that date's log resolves; failed daily-log saves show a connection error and reliably clear the saving state.
- Historical branch note (not current status): Android and website changes were once separated across working branches. Current website merge status must be checked against `main`; do not treat this historical note as evidence that the website changes are still unmerged.

## Premium Staff HQ / demo workspace — active work (2026-10-19)
- [x] Replaced the demo's tiny two-row lists with a richer fictional workspace across clients, app records, plans, memberships, nutrition, workouts, programmes, videos, check-ins, progress, messages, leads and activity.
- [x] Added module-specific demo form schemas instead of generating forms only from the small set of table columns. The demo editor now exposes coaching fields, goals, measurements, nutrition macros/meals, workout scheduling, programme metadata, check-in scores, lead follow-up, and notes.
- [x] Demo record editing initializes all module fields, not only visible table columns; sample edits remain browser-local and never write to Neon.
- [x] Reworked the demo overview into a coaching command-centre dashboard with actionable metrics, workspace shortcuts and coach priorities.
- [x] Added a responsive Staff HQ navigation rail and upgraded shared admin inputs, buttons, cards, empty states and data-table styling.
- [ ] Audit every live-mode admin form for missing domain fields and replace raw JSON-only editing where a guided form is appropriate.
- [ ] Run TypeScript/build/lint and interactive demo CRUD checks before asking for merge approval. No build/test pass is claimed yet.
- Historical status note: this branch checklist is not the current merge status. The consolidated website implementation is on `main`; use the latest GitHub comparison and PR history for current status.

## Must pass before any release
1. **Website pricing** — user confirms public pricing currently displays correctly on the live site. Do not treat pricing as a live incident or change its data flow without a reproducible failure. Keep the Neon-backed implementation and never add hard-coded fallback prices.
2. **Staff HQ access** — test real coach and admin accounts; confirm non-staff accounts are rejected; review RLS policies for every staff-read and write table. Keep demo mode browser-local and ensure it cannot write to Neon.
3. **Staff HQ CRUD** — exercise create/edit/delete/assign flows for users, plans, memberships, nutrition, workouts, programmes, videos, check-ins, progress, messages, leads, and member activity. Verify validation, loading, empty, missing-schema, permission-denied, retry, and save-failure states.
4. **Shared backend** — verify migration history and schema in a disposable Neon branch first. Never apply migrations to the shared production database as part of this task. Validate the nutrition tables/log unique key and the member activity tables/policies.
5. **Android startup crash** — reproduce on the user's installed test build or local emulator; collect the actual native/JS crash output before changing startup code. Check splash/font loading, Neon config/session bootstrap, and navigation initialization; don't infer the cause from the splash screen alone.
6. **Android app data contract** — verify nutrition plans, meals/foods, daily logs, workout templates/sessions, check-ins, progress photos/history, daily metrics, cardio, supplements, and coach messages round-trip between the app and Staff HQ under owner/staff RLS.
7. **Build quality** — run website build/typecheck/lint and Expo lint/typecheck/local Android build; record exact pass/fail output. GitHub branch pushes are not evidence that builds passed.
8. **Google Play** — internal testing only after local launch, login, pricing, and backend gates pass. Do not publish production.

## Progress update — remaining tracks
- [ ] Run website TypeScript/build/lint and Android Expo lint/typecheck locally; this environment has GitHub source access but no verified repository checkout/build output.
- [x] Pricing status corrected: the user confirms prices display correctly on the live website. No pricing outage/root cause is asserted; retain the existing Neon-only implementation and only investigate again if a reproducible failure is reported.
- [ ] Capture the Android launch crash trace from the installed test APK/device. Startup diagnostic handling exists, but the crash is not claimed fixed without the actual error.
- [ ] Continue Staff HQ CRUD and authorization/RLS audit against disposable test data, including all save/delete paths; recent hardening now covers nutrition, plan catalogue, programme visibility, workout deletion, user, membership, progress/check-in and workout loading paths, but is not a complete permission audit.
- [ ] Access control: product intent is one coach/operator with staff access and trainee accounts. The routine user editor no longer changes roles. Still verify that new sign-ups default to trainee access and deployed RLS prevents trainees from reading or writing other clients' records; do not apply the documented draft trigger to shared production without testing the deployed auth mapping.

## Known blocked items / not claimed complete
- The reported immediate Android launch crash requires a real crash trace to diagnose.
- Video storage/upload, video-to-programme assignment, programme schema, and verified server-side Neon Auth account deletion need schema/API/security review before implementation or use.
- Historical snapshot corrected on 2026-10-20: website PRs #17–#19 and #22–#26 are merged into `main`; PR #29's manual-only workflow change is also merged. No shared Neon migrations, fresh build verification, Vercel deployment, EAS build, or Play submission is claimed by this reconciliation.


## Neon-only live-data audit — 2026-10-19

### Prepared implementation (source merged to `main`; not deployed or applied to the shared database)

- [x] Renamed the website client to `src/lib/neon.ts` and moved website/admin imports to the shared `neon` client.
- [x] Replaced the legacy auth adapter with Neon SDK's native `BetterAuthVanillaAdapter`; website staff sign-in and password recovery now use Neon/Better Auth methods.
- [x] Updated Android sign-in and session restoration to the native Neon Auth response shape.
- [x] Added a read-only `GET /api/plans?kind=pt|online` endpoint that reads active public plans through the server-side Neon connection and never returns Stripe price IDs.
- [x] Changed the public website plan loader to use that endpoint, so public pricing no longer depends on browser-side anonymous Data API access.
- [x] Updated the Android nutrition loader to map existing `nutrition_plans.targets/sections` JSON into the meal UI instead of querying absent normalized meal tables.
- [x] Prepared a migration adding training/non-training plan types, daily meal-completion logs, and the RLS policies needed for member replies in coach conversations.
- [x] Replaced the Android messages preview flow with Neon-backed conversation loading and message inserts; demo mode remains explicitly local.
- [x] Removed misleading Staff HQ success labels for actions that are not connected to live services.

### Verified from the live Neon schema

- [x] The public `plans` table has six active rows: two online-coaching plans and four PT plans.
- [x] Anonymous/public SELECT privileges and read policies exist for `plans`.
- [x] The Vercel Neon Auth/Data API environment URLs point at the same Neon endpoint used by the configured Data API.
- [x] The Vercel `DATABASE_URL` points at the same Neon project and `mwfitness` database.
- [x] The live database currently has the existing `nutrition_plans`, `nutrition_templates`, `nutrition_logs`, `coach_messages`, and `device_push_tokens` tables. It does not have `nutrition_plan_days`, `nutrition_plan_meals`, `nutrition_plan_foods`, or `nutrition_daily_logs`.
- [x] `coach_messages` and `device_push_tokens` currently contain no rows; no Android device-token registration flow exists yet.

### Release gates still open

- [ ] Run website lint/build and Android TypeScript/lint/Android export against the complete repositories. No successful build is claimed yet.
- [ ] Apply `db/migrations/20261019_mobile_nutrition_live.sql` only after review/approval; it has not been executed against shared Neon.
- [ ] Add the SDK-57-compatible Expo Notifications dependency, Android permission/token registration, token persistence, and notification-tap handling.
- [ ] Verify that a member can send a message, Staff HQ can read/reply, and a registered device receives the push notification.
- [ ] Verify `/api/plans?kind=online` and `/api/plans?kind=pt` in the deployed environment; the public domain could not be reached from this execution environment, so the endpoint has not been exercised over HTTP.
- [ ] Test Stripe checkout in test mode and confirm success/cancel handling.
- [ ] Run the configured manual GitHub Actions checks when a supported workflow-dispatch path is available.
- [ ] Run website TypeScript/build/lint and record the exact `main` SHA and result before treating the website as verified. No fresh build pass is claimed. Deployment remains separate and requires explicit approval.

## Communications centre + Android startup follow-up (2026-10-20)
- [x] Communications centre shell added to Staff HQ with template editing, read-only automation rules/history, and a local-only broadcast draft; dispatch button remains disabled.
- [x] Communications schema and starter content are committed in `main`: 13 email templates and 12 automation rules, all automation rules disabled. Migration has **not** been applied to shared/production Neon.
- [x] Unsubscribe endpoint changed so GET renders a confirmation form without mutating preferences; the signed unsubscribe action occurs only on POST. Local Express server now parses the confirmation form.
- [x] Test-email failure path records a failed delivery and bounded error message; it still requires live SMTP/Neon verification.
- [x] Communications UI clears stale records on missing Neon/read failure and checks that template updates actually affect a row.
- [ ] Verify unsubscribe GET has no DB side effects and POST suppresses only the signed email; verify SMTP success/failure state and table RLS before any live sends.
- [ ] Build server-side audience preview, consent/suppression filtering, idempotent dispatch and provider delivery tracking before enabling broadcasts.
- [x] Android entry point now has a visible startup-diagnostic fallback for module import failures instead of leaving only the native splash screen.
- [ ] Android startup crash is **not confirmed fixed**; produce a fresh Android export/build and retest on the Play internal-test device.
- [ ] Android CI remains blocked at `npm ci`: lockfile is missing `ajv@8.20.0`, `fast-uri@3.1.8`, `json-schema-traverse@1.0.0`, and `require-from-string@2.0.2`. The lockfile repair workflow is manual-only and has not been dispatched.
- [ ] Run the website and Android manual verification workflows after the user authorises/runs them; no fresh lint, build, or device-test pass is claimed.

- [x] Corrected an earlier inaccurate pricing diagnosis: the user confirms prices are working on the live site. The legacy `supabase` filename/variable names found on `main` are compatibility names around the Neon SDK, not evidence that the project uses Supabase as its backend. Do not describe pricing as broken or change working live pricing without fresh evidence.


## Additional static fixes — 2026-10-20

- [x] Corrected unsubscribe email validation to use standard whitespace and domain-separator matching. The previous regex was over-escaped and could reject valid addresses or validate incorrectly; only the signed token can change a marketing preference, and GET remains read-only.
- [x] Improved Android fatal-runtime diagnostics so a fatal error after the root React component mounts triggers a visible error screen instead of only updating an unused module-level string.
- [ ] Re-run website TypeScript/build/lint and Android lockfile repair + typecheck/lint/Android export before treating these changes as verified. The repository integrations available in this session do not provide a local checkout/build runner, and no GitHub Actions workflow has been dispatched.


## Admin form and compliance consolidation — 2026-10-20

- [x] Added a guided meal/food editor to Staff HQ nutrition forms, including add/remove meal and food actions, portion notes, calories and protein. Existing per-section/per-food metadata is retained when editing; malformed section data remains repairable through the JSON fallback.
- [x] Added guided numeric nutrition target fields while preserving unknown target metadata, plus a wider responsive editor modal.
- [x] Replaced the package feature JSON array editor with one feature per line; each non-empty line saves as one public feature.
- [x] Consolidated the online-plan-focused footer and direct privacy, cookie and account/data deletion links without the staff-login link or unverified insurance/qualification claims.
- [x] Added the cookie policy screen, /cookies client route and Vercel SPA rewrite. The policy explicitly remains a draft until live cookies and third-party scripts are audited.
- [x] Reconciled stale/diverged website branches against current `main` at file level on 2026-10-20. No open PRs remained after the manual-only workflow fix was merged. The older branches contain superseded versions (including legacy `supabase` compatibility-client imports and older Staff HQ forms); preserve them as history and do not merge wholesale.


## CRUD verification hardening — 2026-10-20

- [x] Nutrition template/client-plan saves now require the API to return an affected row; a permission-filtered or missing-row update is no longer reported as saved.
- [x] Package saves now verify an affected row for inserts and updates.
- [x] Video library saves now validate non-negative whole-second duration, handle thrown network errors, reset the busy state in all cases, and verify a saved row before showing success.
- [x] Staff profile edits now verify an affected row instead of treating a zero-row update as success.
- [x] Added request sequencing to nutrition-plan and progress-log customer queries so a slower response for a previous customer cannot replace the current customer's rows.
- [ ] These are source-level changes only until typecheck/build and interactive Neon CRUD checks pass. No GitHub Actions, local build, Neon migration or deployment has been run.


- [x] Extended the guided food editor to capture gram amounts, calories, protein, carbohydrates, fats and salt so the mobile macro overview can receive the full set of values from Staff HQ.
- [x] Changed marketing preference uniqueness and unsubscribe upserts to be case-insensitive, avoiding duplicate suppression records for differently-cased versions of the same email address.

- [x] Extended affected-row verification to package visibility toggles, workout template deletion/session status, membership assignment/removal, progress weigh-in creation/deletion, and multi-recipient coach-message inserts.


## Website completion track — Staff HQ, swag and Resend (2026-10-20)

### Merged into `main` via PRs #22–#26 (not deployed; prepared migrations have not been applied)

- [x] Added a server-side Resend dispatch endpoint for authenticated coach/admin users, with individual sends, member audiences, consent-filtered marketing audiences, exact recipient-count confirmation, per-recipient idempotency keys, and event/delivery audit rows.
- [x] Routed Staff HQ test sends through Resend so a test can only target the signed-in staff member.
- [x] Added audience-count preview and confirmed send controls to the communications composer.
- [x] Improved email preview by rendering common template placeholders with sample values in the sandboxed iframe.
- [x] Added guarded toggles for website enquiry, consultation and app-waitlist acknowledgement automations. Other app/scheduled rules remain locked until their event handlers are implemented.
- [x] Added an idempotent transactional-email helper for enabled website form automations; failure to send the acknowledgement does not discard a saved website lead.
- [x] Made the existing website enquiry alert prefer Resend when `RESEND_API_KEY` and a verified `RESEND_FROM_EMAIL` are configured; SMTP remains a fallback.
- [x] Added the public Neon-backed swag catalogue endpoint, a Staff HQ product editor (name, slug, description, category, price, compare-at price, image/order URL, sizes, stock status, visibility and sort order), and connected the public SHWAG cards to the catalogue API.
- [x] Added a prepared `swag_products` migration with public read access only for active products and staff-only writes.
- [x] Seeded the four existing advertised products (Classic SHWAG T-Shirt, SHWAG Hoodie, SHWAG Gym Bag and SHWAG Water Bottle) as enquiry-only with no invented prices, sizes, images or stock claims; added an enquiry-only status to Staff HQ.
- [x] Kept those existing SHWAG items visible as an enquiry-only fallback if the product API is unavailable before migration setup.
- [x] Hardened Staff HQ programme CRUD/assignment/visibility and video delete/visibility actions with confirmed-row checks, error handling and busy-state guards.
- [x] Added confirmed-row checks for lead-status updates and workout template/session inserts so the UI cannot report success when no row was saved.

### Required before real sends / production use

- [ ] Configure `RESEND_API_KEY` and a sender address on a verified MW Fitness domain in Vercel and local environment. The connected Resend account currently lists `christopherjcallaghan.com`, `rub-n-scub.com`, and `dapperman.co.uk` as verified; `mwfitnessuk.com` is not listed as verified, so do not send from it until domain verification is completed.
- [ ] Review and approve the prepared communications and swag migrations, then apply them to a disposable Neon branch and verify policies before considering any shared database change. They have not been applied by this task.
- [ ] Test template save/preview/test-send, one-recipient sends, consent-filtered audience counts, suppression/unsubscribe handling, duplicate-send protection, and delivery history using test addresses.
- [ ] Add Resend webhook signature verification and delivery/bounce/complaint event ingestion before describing accepted messages as delivered. Current delivery rows record provider acceptance/failure only.
- [ ] Implement event handlers for app push/in-app and scheduled automations. Those rules must remain disabled until each trigger is implemented and tested.
- [ ] Run website TypeScript/build checks locally or in an approved manual workflow. No build pass is claimed; no GitHub Actions, deploy, Slack post or shared database migration was run.



### Named Staff HQ administrators and password recovery
- [x] Added `instantonlinesuccess@gmail.com` and `mwfitnessukonline@gmail.com` to the Staff HQ sign-in identity checks; these named accounts must have the `admin` profile role.
- [x] Restricted the Staff HQ reset-request UI to the two named admin email addresses; reset tokens/passwords remain handled by Neon Auth.
- [x] Added prepared migration `db/migrations/20261020_staff_admin_allowlist.sql` to promote matching existing profile rows to `admin`.
- [ ] Create/verify both accounts in Neon Auth and ensure matching `public.profiles` rows exist.
- [ ] Review and explicitly approve the admin-role migration before applying it to the shared Neon database.
- [ ] Verify the Neon Auth email provider/reset link works on the live auth branch. Neon Auth's built-in provider can send reset links without Resend; use Resend for the separate communications suite, or configure a custom provider/webhook if branded auth emails are required.
- [ ] No build, GitHub Actions workflow, deployment, or test email was run while this work was prepared.

## Premium Staff HQ dashboard — draft PR #31 (2026-10-20)

- [x] Remove the duplicated section-navigation grid from the demo overview; the sidebar remains the single navigation source.
- [x] Add premium KPI cards and circular progress indicators to the demo overview. These values derive only from the fictional in-browser demo rows and remain visibly labelled as sample data.
- [x] Upgrade shared Staff HQ card and table surfaces for a consistent charcoal/orange visual system.
- [x] Add a distinct live overview that queries shared Neon records for profile, plan, membership and website-lead counts, active states and new enquiries. Live figures are not sourced from demo rows.
- [x] Keep revenue and sales out of the live overview until a verified transaction source is available; website package prices or membership plan values must not be presented as money earned.
- [x] Align live dashboard queries to the known fields used by the public pricing endpoint and membership records: athlete profiles, boolean plan visibility, and membership status/profile ownership. Active-member coverage counts athletes with an active membership, not profile status flags.
- [x] Add a read-only Published website packages panel using the same public `/api/plans` feed the frontend uses for PT and online coaching. It displays current active catalogue names, prices, tags and descriptions in live mode; it never imports fictional demo rows or stale legacy `ONLINE_COACHING.plans` examples.
- [x] If the public catalogue feed fails, display an explicit unavailable state instead of silently substituting old frontend examples. Website package prices are catalogue data, not sales or revenue.
- [ ] Verify the live profile/plan/membership queries and public catalogue feed against an authorized test environment; ensure missing optional website_leads access is clearly distinguished from a true zero count.
- [ ] Build/typecheck and review desktop/mobile responsiveness plus live/demo switching. No build has been run and this PR remains unmerged.


## Current project hub update — 2026-10-20 (latest status)

This section supersedes older historical status notes above where they conflict with current merged PR/deployment state.

### Website and Staff HQ — latest
- [x] Staff HQ premium dashboard PR #31 is merged to `main`: duplicate navigation removed from the overview, sidebar is the single navigation source, premium KPI cards/circular progress indicators added, and live data remains separate from browser-local demo data.
- [x] Homepage design updates merged: electric orange card edge/pulse treatment, homepage packages aligned with the live online coaching catalogue, and matching card treatment for “Training Made Simple” / “Three Simple Steps”.
- [x] Button interaction polish merged: pointer cursor, stable hover treatment, shine only on hover, and consistent orange/dark contrast.
- [x] Fixed the homepage package-card JSX syntax issue and removed duplicate `className` attributes.
- [x] PR #39 merged: card borders turn orange on hover; dark buttons turn orange with black text and orange borders; orange primary buttons invert to a dark background with white text and an orange border.
- [x] Vercel production deployment for commit `3a1cd7fd749d114b7f9c88a5dc5cf811b70c61b5` is **READY** and aliases include `https://mwfitnessuk.com` and `https://www.mwfitnessuk.com`.
- [x] User confirms live website pricing displays correctly. Do not reopen pricing as an incident without a reproducible failure.
- [ ] Still required: capture and record fresh website typecheck/build/lint output and manually inspect the live desktop/mobile hover states. Vercel READY confirms deployment state, not a complete browser QA or CRUD pass.

### Mobile app — latest
- [x] User confirms the mobile app now loads again.
- [ ] Keep mobile app work separate from the website repository.
- [ ] Still required before release: local Expo/typecheck/lint, Android build and on-device launch checks, repair/verify the Android lockfile/CI dependency state, verify Neon Auth and RLS, exercise app ↔ Staff HQ data round-trips, test notifications, and verify Stripe checkout in test mode.
- [ ] Do not claim the Android build, full app integration, or release gates have passed until actual logs/test evidence are captured.

### Communications and safety
- [x] Posted a website-specific update to Slack `#website`, an app-specific update to `#app`, and the combined project status to `#mw-fitness-main` on 2026-10-20.
- [ ] Continue to keep shared Neon migrations un-applied until explicitly approved and tested on a disposable Neon branch.
- [ ] No GitHub Actions, EAS build, Google Play submission, test email, or shared Neon database change was performed for this status update.
- [ ] Neon remains the backend; do not introduce Supabase as a backend.


## Website verification pass — 2026-10-20 (manual sandbox, no CI)

### Build verification
- [x] Cloned the website repository into an isolated Vercel sandbox at the current `main` revision; dependency installation via `npm ci` completed successfully.
- [x] `npm run lint` passed. The repository's lint script is `tsc --noEmit`, so this confirms TypeScript checking, not a separate ESLint run.
- [x] `npm run build` passed on `main`, PR #40's branch, and PR #41's branch.
- [x] Both website-only draft PR branches passed `npm run lint` and `npm run build` in the sandbox.
- [ ] No unit/integration test script is defined in `package.json`; build success is not a substitute for live CRUD/security tests.
- [ ] Build emits existing dependency annotation warnings from Neon/Zod and a bundle-size warning for the ~660 kB minified JavaScript chunk. Build still completes successfully; assess code-splitting separately rather than masking the warning.
- [ ] No GitHub Actions workflow, deployment, email, or database migration was run during this verification.

### Read-only production endpoint checks
- [x] `https://mwfitnessuk.com` returned HTTP 200 and served the current SPA shell.
- [x] `/api/plans?kind=online` returned HTTP 200 with four online-coaching plans (Bronze, Silver, Gold, Platinum). This agrees with the user's confirmation that live online prices display correctly.
- [ ] `/api/plans?kind=pt` returned HTTP 200 with an empty `plans` array. Investigate whether PT plans are expected in the current production database/catalogue before changing any pricing data. Do not claim the public online-pricing page is broken; its live endpoint is returning the four expected online plans.
- [ ] `/api/products` returned HTTP 503 because the `swag_products` catalogue is not available in the live environment. The prepared migration `db/migrations/20261020_swag_products.sql` remains unapplied; review and test it in a disposable Neon branch before requesting approval for any shared-database change.
- [x] `/cookies` returned HTTP 200 via the SPA rewrite.
- [ ] These were HTTP/API checks only. They do not constitute interactive browser QA, visual hover verification, Staff HQ authentication checks, or live CRUD/RLS verification.

### Communications safety PRs
- [x] PR #40 branch (`fix/communications-preview-invalidation`) passes TypeScript and production build checks. It invalidates the cached recipient-count preview when template selection changes, template data refreshes, or template saving starts.
- [x] PR #41 branch (`fix/marketing-unsubscribe-config-gate`) passes TypeScript and production build checks. It fails closed on marketing dispatch when the signed unsubscribe secret or public site URL is absent.
- [ ] PR #40 and PR #41 remain unmerged. No live email was sent; no Neon migration was applied. Verify actual environment configuration and signed unsubscribe behaviour in a disposable/test environment before enabling marketing dispatch.


## Website follow-up — security patch and current blockers (2026-10-20)

- [x] Opened draft PR #42 to patch vulnerable compatible dependency resolutions in `package-lock.json` only; `package.json` ranges remain unchanged.
- [x] Reinstalled from the committed lockfile in an isolated Vercel sandbox; `npm ci` passed.
- [x] Full `npm audit --audit-level=high` now reports **0 vulnerabilities** on PR #42's branch.
- [x] `npm run lint` / `tsc --noEmit` and `npm run build` passed on PR #42's branch.
- [x] PR #40 (communications audience-preview invalidation) and PR #41 (fail-closed marketing unsubscribe configuration) each passed `npm run lint` and `npm run build` in the same isolated sandbox.
- [ ] PR #40, #41 and #42 are still draft/unmerged; no CI was run. Keep the dependency/security changes off production until reviewed and approved.
- [ ] Production HTTP check found `/api/plans?kind=online` returns four online packages, while `/api/plans?kind=pt` returns an empty list. Investigate the expected PT catalogue against current approved data; do not alter prices or production records based on assumption.
- [ ] Production `/api/products` currently returns HTTP 503 because the swag catalogue is not available in the live database. The prepared swag migration is still unapplied; only review/test in a disposable Neon branch until explicitly approved.
- [ ] Manual interactive browser QA (desktop/mobile, hover/focus, route navigation, forms), Staff HQ role checks, and Neon CRUD/RLS checks remain open. HTTP status checks and successful builds are not substitutes.
- [ ] Existing successful builds still emit upstream Neon/Zod annotation warnings and a ~660 kB minified JavaScript chunk warning. Consider bundle splitting as a separate, measured improvement.
- [ ] No GitHub Actions workflow, production deployment, shared Neon migration, or email send was run for this follow-up.


### Read-only route smoke checks
- [x] `/online-coaching`, `/shwag`, `/contact`, `/admin`, `/privacy`, `/cookies`, and `/delete-account` each returned HTTP 200 and the SPA HTML shell from production.
- [ ] The route checks did not execute client-side JavaScript or verify page visuals/forms; complete real browser QA when a browser runner is available.
