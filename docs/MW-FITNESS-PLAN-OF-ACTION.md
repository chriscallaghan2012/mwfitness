# MW Fitness — plan of action and test gates

This checklist tracks work across `mwfitness` (website / Staff HQ) and `MW-FITNESS-APP-MOBILE` (Expo app). Continue fixing the working branches and verify the changes before merging them to main. Do not deploy, run GitHub workflows/build submissions, or change the shared Neon database without explicit approval.

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
- [x] Android changes are on `work/mwfitness-android-bulk-fixes-2026-10`; website changes are intended for `work/mwfitness-bulk-fixes-2026-10`. No main merge or deployment.

## Premium Staff HQ / demo workspace — active work (2026-10-19)
- [x] Replaced the demo's tiny two-row lists with a richer fictional workspace across clients, app records, plans, memberships, nutrition, workouts, programmes, videos, check-ins, progress, messages, leads and activity.
- [x] Added module-specific demo form schemas instead of generating forms only from the small set of table columns. The demo editor now exposes coaching fields, goals, measurements, nutrition macros/meals, workout scheduling, programme metadata, check-in scores, lead follow-up, and notes.
- [x] Demo record editing initializes all module fields, not only visible table columns; sample edits remain browser-local and never write to Neon.
- [x] Reworked the demo overview into a coaching command-centre dashboard with actionable metrics, workspace shortcuts and coach priorities.
- [x] Added a responsive Staff HQ navigation rail and upgraded shared admin inputs, buttons, cards, empty states and data-table styling.
- [ ] Audit every live-mode admin form for missing domain fields and replace raw JSON-only editing where a guided form is appropriate.
- [ ] Run TypeScript/build/lint and interactive demo CRUD checks before asking for merge approval. No build/test pass is claimed yet.
- [ ] User approval still required before merge/deployment; this branch has not been merged to `main`.

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
- No production database changes, merges to `main`, Vercel deployments, EAS builds, or Play submissions have been performed.


## Neon-only live-data audit — 2026-10-19

### Prepared implementation (not merged, deployed, or applied to the shared database)

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
- [ ] Consolidate changes to a work branch only after the above code checks; no production merge or deployment without approval.

## Communications centre + Android startup follow-up (2026-10-20)
- [x] Communications centre shell added to Staff HQ with template editing, read-only automation rules/history, and a local-only broadcast draft; dispatch button remains disabled.
- [x] Prepared communications schema and starter content on the working branch only: 13 email templates and 12 automation rules, all automation rules disabled. Migration has **not** been applied to shared/production Neon.
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
