# MW Fitness Cross-Platform Release Readiness

**As of:** 2026-10-30  
**Decision:** NO-GO for a complete production release. Local checks are now green, but live Staff HQ/member workflows, physical-device behavior, and production release sign-off remain unverified.  
**Scope:** Website, Staff HQ, Neon migrations, Expo mobile app, and branded assets.

## Executive Summary

The website and mobile release documents did not record a completed end-to-end release pass. This audit confirms that the two migrations' expected changes exist on separate Neon child branches, not on production. The production database remains unchanged by this audit. No production migration, merge, deployment, payment, or publishing action was taken.

The mobile app now packages its root `logo.png` through a reproducible asset generator, uses that image in the app header, and configures a generated Android notification icon. Website compilation/build and the mobile tests/export pass locally after fixing several release-blocking defects. Those results do not prove live Staff HQ permissions, cross-account isolation, mobile-to-Staff-HQ persistence, or physical-device notification behavior.

## What Was Implemented

- Mobile branding generation now uses `MW-FITNESS-APP-MOBILE/logo.png` as the required source for the app icon, splash, Android adaptive/monochrome icons, notification icon, and favicon. The Expo header uses the bundled local logo instead of a remote URL. Black backgrounds match the supplied logo.
- The root `logo.png` is currently untracked in the mobile worktree. A fresh CI/EAS checkout requires the file to be included in the repository; the existing user deletion of `logo.jpg` was left untouched.
- The mobile crypto helper is typed to its actual `Uint8Array` use; the schema-contract helper ignores source comments so a cardio comment no longer causes a false calendar-column failure.
- The SHWAG URL validation regex was corrected, the Staff HQ push path now reads the session's `token` property, and checkout helper imports from the `lib/` handlers now resolve to `api/_stripe.mjs`.
- Stripe checkout fixtures now use valid Price ID shapes and assert the current Neon-backed Price ID contract for both Preview and Production. Checkout copy now identifies the embedded Stripe payment form.

## Neon Findings

The Neon project was independently queried read-only. Project `MW Fitness` is `fancy-voice-84165533`; branch `br-crimson-pine-zajxyrc0` is named `production`, and is the primary/default branch. Database `mwfitness` is present and ready.

Production state observed:

- `public.stripe_payment_records` does not exist. `public.is_platform_admin()` does exist.
- `public.swag_products` exists and has the unique `slug` index required by `ON CONFLICT (slug)`.
- The four current active products are Classic SHWAG T-Shirt, SHWAG Hoodie, SHWAG Gym Bag, and SHWAG Water Bottle. All are `enquiry_only` with stored price `0.00`.
- No public table with `migration` in its name was found; there is no repository-visible database migration journal in the public schema.

The migration outputs were found on two separate child branches:

| Migration | Child branch | Observed state |
|---|---|---|
| `20261026_stripe_payment_records.sql` | `br-weathered-snow-za0o8b65` (`mcp-migration-2026-10-30T16-32-46`) | Ledger table exists; RLS is enabled; `anon` cannot SELECT; `authenticated` can SELECT but cannot INSERT/UPDATE/DELETE; policy allows SELECT only through `is_platform_admin()`. |
| `20261030_shwag_range_products.sql` | `br-plain-forest-zaao4eph` (`mcp-migration-2026-10-30T16-33-49`) | Three active requested products at placeholder GBP 50, all `enquiry_only`; three old products inactive. |

The changes on those child branches match the respective migration outputs. The likely source of “the migrations did not work” is that the migration workflow created child branches rather than applying the changes to the production branch. Production still lacks the ledger and still has the old SHWAG catalogue. The exact command/error that was seen was not captured, so this audit cannot identify any separate client-side error message. Do not merge either branch or rerun a production migration without explicit approval and a reviewed recovery plan.

The child branches were forked from production and may contain production-derived member data. Do not use them for write testing unless their data is first confirmed safe/anonymized. The SQL issued during this audit was read-only.

## Verified Local Checks

| Repository | Check | Result |
|---|---|---|
| Website | `npm test` | 52 passed, 0 failed, 2 skipped. The skips require `RELEASE_TEST_DATABASE_URL`; production `DATABASE_URL` is intentionally not used. |
| Website | `npm run lint` | Passed (`tsc --noEmit`). |
| Website | `npm run build` | Passed. Vite reports upstream Zod comment notices and a large-chunk warning. |
| Mobile | `npm test` | 5 passed, 0 failed. |
| Mobile | `npx tsc --noEmit` | Passed. |
| Mobile | `npm run lint` | 0 errors, 24 existing warnings. |
| Mobile | `npx expo config --type public --json` | Passed; generated icon/splash/notification paths resolve. |
| Mobile | `npx expo export --platform android` | Passed; Android bundle includes the root `logo.png`. |

## Status by Area

| Area | Status | Evidence / remaining work |
|---|---|---|
| Website public routes and APIs | Partially verified | Unit/API tests and local build pass. Production HTTP/browser smoke checks against the exact deployed commit remain open. |
| Staff HQ CRUD | Demo-only automated coverage | `admin-demo-db.test.ts` tests the in-memory demo client. Live UI CRUD, refresh persistence, role boundaries, and RLS were not exercised. |
| Member isolation and private photos | Open | No two-account live test or private-photo authorization test was run. |
| Mobile live-data paths | Implemented, not end-to-end verified | Neon/Auth helpers exist for multiple domains, but schema-contract tests do not prove authenticated live reads/writes. Mobile-to-Staff-HQ round-trips remain open. |
| Mobile Goals | Not live/persisted | `GoalsScreen` uses sample values; target edits remain screen-local. Production `profiles.goal_weight` exists, but Goals does not load/save it. |
| Preview/test data isolation | Blocked | EAS development/preview profiles currently list the same Neon endpoint pair as production. Do not run test writes until a separate anonymized/seeded branch and credentials are configured. |
| SHWAG production catalogue | Not migrated | Production still has the four old zero-price enquiry-only products. The new range exists only on its child branch; GBP 50 remains placeholder pricing requiring owner approval. |
| Payment ledger and paid membership | Blocked | Production table is absent. Checkout remains gated; webhook/account linking/membership activation/refund behavior is not a release-ready paid workflow. |
| Native mobile release | Open | Android JavaScript export passed; fresh native build/install, iOS review, physical-device auth, push delivery, and visual icon/splash checks remain open. |

## Staff HQ End-to-End Evidence

The existing release checklist and runbook do **not** show Staff HQ live end-to-end testing as complete. The automated CRUD test only covers demo data. Before sign-off, use a dedicated isolated/anonymized Neon environment and dedicated staff plus two member accounts to verify:

1. Supported Staff HQ create/edit/delete actions persist after refresh and are restricted by staff role.
2. Member A cannot read or change Member B's profile, messages, progress, nutrition, workout, or private-photo records.
3. Mobile check-ins, weigh-ins, cardio, nutrition, workout completion, and messages persist and appear in Staff HQ after reload/relogin.
4. Demo writes never reach Neon, and live errors never silently fall back to sample data.
5. Push permission, token registration, delivery, tap navigation, and failure states work on a physical device if push is in release scope.

## Release Gates Still Open

- Run the skipped website Neon integration tests only against a dedicated test database/branch, never the production URL.
- Run the complete Staff HQ/mobile round-trip and authorization tests above, capturing date, tester, candidate commit/build, environment, and redacted evidence.
- Verify the exact deployed website commit with browser/API smoke tests and a fresh mobile native build on supported physical devices.
- Decide/implement persistence for Goals before presenting those values as live; currently they are explicitly sample-only.
- Confirm whether Preview can be isolated from production Neon and align EAS/Vercel configuration before any Preview writes.
- Review migration outputs and product pricing. Production application is a separately approved database change; current evidence does not authorize applying migrations or merging branches.
- Record payment webhook signing, ledger, account-linking, refund, and membership lifecycle evidence before enabling paid checkout.
- Complete final owner/security/mobile/payment sign-off and record GO / NO-GO / accepted risks in the release checklist.

## Related Documents

- [End-to-end release checklist](END_TO_END_RELEASE_CHECKLIST.md)
- [Live release audit and go-live plan](LIVE_RELEASE_AUDIT_AND_GO_LIVE_PLAN.md)
- [Release test runbook](RELEASE_TEST_RUNBOOK.md)
- [Mobile release readiness](../../MW-FITNESS-APP-MOBILE/docs/FINAL_RELEASE_READINESS_2026-10-30.md)
- [SHWAG catalogue update](SHWAG_CATALOGUE_UPDATE.md)