# Staff HQ demo mode & unified sidebar

**Updated:** 2026-10-21

## One layout, two data sources

Staff HQ (`/admin`) runs the **same components in demo and live mode**; only the data source differs.

- `src/lib/admin/adminDb.ts` — the switch. `setAdminDemoMode(true)` routes every staff query to the in-memory demo client; live mode returns the shared Neon client. `resetDemoDb()` rebuilds the seeded demo data (called on enter/exit demo).
- `src/lib/admin/demoDb.ts` — a small PostgREST-compatible query client covering exactly the surface the staff components use: `from().select()` (columns, embedded relations like `plans(name,price)`, `{ count: 'exact' }`), `.eq()`, `.order()`, `.limit()`, `.maybeSingle()`, and `.insert() / .update() / .delete()` with `.select()` chaining. Results use the familiar `{ data, error, count }` shape.
- `src/lib/admin/demoData.ts` — the seeded dataset: four fictional members (plus the coach profile) with ~8 weeks of history across profiles, plans, memberships, nutrition plans/templates/logs, workout templates/sessions, check-ins, progress logs, daily metrics, cardio, supplements, messages, progress photos, coaching programmes and assignments, website leads, videos and swag products. Dates are generated relative to "now", so the history always looks recent. Demo writes stay in browser memory for the session and **never touch Neon**.

Every admin component obtains its client with `const db = adminDb();` — components do not import `neon` directly for data (auth calls in `MessagesAdmin` still use `neon` and are bypassed in demo mode).

## Merged sidebar

Duplicated tabs were combined (15 → 10):

| Tab | Contains |
| --- | --- |
| Overview | KPIs, active-member coverage, published packages, quick actions (demo and live share it) |
| Members | User list + all-member recent activity; **Open profile** drills into the member workspace |
| Plans & memberships | Package catalogue + membership assignments |
| Nutrition | Meal templates + client nutrition plans |
| Training | Coaching programmes + workout templates/schedules |
| Videos | Coaching video library |
| Check-ins & progress | Weekly check-in review + weigh-in logs |
| Messages | Coach ↔ member conversations |
| Website leads | Website enquiry inbox |
| Notifications & email | Communications centre (sign-in required; gated in demo) |

## Member workspace (Client app data)

Opening a member from **Members** shows `ClientRecordsAdmin`, which now includes:

- Profile header (weights, tier, coach, active package, member since).
- **This week** strip: latest check-in, workouts done, avg calories/protein/steps, latest weight.
- **Weekly rollup**: the last eight weeks (Mon–Sun) of check-in status, sessions, avg kcal/protein/steps/water and weigh-ins.
- **Recent activity**: newest-first merged feed across every data set.
- **Assign to client**: package/membership, nutrition plan (from template), workout session and coaching programme — writing to the same tables the dedicated tabs use.
- Memberships, assigned nutrition plans, private progress photos and the nine per-data-set submission tables.
