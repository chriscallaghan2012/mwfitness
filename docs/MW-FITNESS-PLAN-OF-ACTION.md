# MW Fitness — plan of action and test gates

This checklist tracks work across `mwfitness` (website / Staff HQ) and `MW-FITNESS-APP-MOBILE` (Expo app). Local testing and branch pushes only until Mike explicitly approves otherwise. Do not deploy, merge to main, run workflows/build submissions, or change the shared Neon database without approval.

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
- [x] Membership assignment/removal and workout/session loading now report backend errors instead of silently leaving stale tables.
- [x] Nutrition date changes now show the selected day as loading until that date's log resolves; failed daily-log saves show a connection error and reliably clear the saving state.
- [x] Android changes are on `work/mwfitness-android-bulk-fixes-2026-10`; website changes are intended for `work/mwfitness-bulk-fixes-2026-10`. No main merge or deployment.

## Must pass before any release
1. **Website pricing** — use the local/staging browser console to capture the actual Neon query error; verify `VITE_NEON_AUTH_URL` and `VITE_NEON_DATA_API_URL` are present in the intended environment, and verify active `plans` rows plus anonymous SELECT/RLS/grants for public pricing. Do not hard-code a price fallback or mask missing live prices with demo values.
2. **Staff HQ access** — test real coach and admin accounts; confirm non-staff accounts are rejected; review RLS policies for every staff-read and write table. Keep demo mode browser-local and ensure it cannot write to Neon.
3. **Staff HQ CRUD** — exercise create/edit/delete/assign flows for users, plans, memberships, nutrition, workouts, programmes, videos, check-ins, progress, messages, leads, and member activity. Verify validation, loading, empty, missing-schema, permission-denied, retry, and save-failure states.
4. **Shared backend** — verify migration history and schema in a disposable Neon branch first. Never apply migrations to the shared production database as part of this task. Validate the nutrition tables/log unique key and the member activity tables/policies.
5. **Android startup crash** — reproduce on the user's installed test build or local emulator; collect the actual native/JS crash output before changing startup code. Check splash/font loading, Neon config/session bootstrap, and navigation initialization; don't infer the cause from the splash screen alone.
6. **Android app data contract** — verify nutrition plans, meals/foods, daily logs, workout templates/sessions, check-ins, progress photos/history, daily metrics, cardio, supplements, and coach messages round-trip between the app and Staff HQ under owner/staff RLS.
7. **Build quality** — run website build/typecheck/lint and Expo lint/typecheck/local Android build; record exact pass/fail output. GitHub branch pushes are not evidence that builds passed.
8. **Google Play** — internal testing only after local launch, login, pricing, and backend gates pass. Do not publish production.

## Progress update — remaining tracks
- [ ] Run website TypeScript/build/lint and Android Expo lint/typecheck locally; this environment has GitHub source access but no verified repository checkout/build output.
- [ ] Verify the pricing query's actual runtime error from browser console and environment; logging has been added, but the underlying cause is not yet confirmed.
- [ ] Capture the Android launch crash trace from the installed test APK/device. Startup diagnostic handling exists, but the crash is not claimed fixed without the actual error.
- [ ] Continue Staff HQ CRUD and authorization/RLS audit against disposable test data, including all save/delete paths; recent hardening covers user, membership, progress/check-in and workout loading paths, but is not a complete permission audit.
- [ ] Access control: product intent is one coach/operator with staff access and trainee accounts. The routine user editor no longer changes roles. Still verify that new sign-ups default to trainee access and deployed RLS prevents trainees from reading or writing other clients' records; do not apply the documented draft trigger to shared production without testing the deployed auth mapping.

## Known blocked items / not claimed complete
- Pricing's underlying environment/database cause is not yet observable from repository source alone; browser console + intended Vercel/local env and Neon permissions must be checked.
- The reported immediate Android launch crash requires a real crash trace to diagnose.
- Video storage/upload, video-to-programme assignment, programme schema, and verified server-side Neon Auth account deletion need schema/API/security review before implementation or use.
- No production database changes, merges to `main`, Vercel deployments, EAS builds, or Play submissions have been performed.
