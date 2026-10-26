# MWFitnessUK — website

Online coaching website for Michael Whitworth. React + Vite + Tailwind v4, with a shared Neon backend for staff management, pricing and website enquiries.

## Pages

- **Home** — welcome, online coaching overview, packages at a glance, reviews
- **Packages** — full breakdown, prices and comparison table
- **Get In Touch** — enquiry form + contact details
- **App &amp; SHWAG** — app waitlist and SHWAG merch

## Run locally

Requires Node.js.

```bash
npm install

# Terminal 1 — email API (port 8787)
cp .env.example .env   # add your SMTP details first
npm run server

# Terminal 2 — website (port 3000, proxies /api to :8787)
npm run dev
```

The local API needs the dedicated MW Fitness `DATABASE_URL` to save enquiries. SMTP is an optional notification channel: if SMTP is unavailable, a successfully saved enquiry still appears in the staff inbox.

## Email backend

Every contact CTA on the site (navbar, hero, packages, app waitlist, SHWAG orders) posts the **real submitted data** to `/api/send-mail`. The server validates it and saves the enquiry to `public.website_leads` in the dedicated MW Fitness Neon database before attempting the on-brand email notification. Leads can then be reviewed and moved through new, contacted, qualified, converted or closed in **Staff login → Website leads**. Email is an alert, not the source of truth.

- `api/_templates.mjs` — the email templates (edit here to change what lands in your inbox)
- `api/_leads.mjs` — server-only Neon persistence for contact forms
- `src/components/admin/LeadsAdmin.tsx` — staff inbox for live enquiries
- `api/_mailer.mjs` — validation + Nodemailer transport (SMTP via env)
- `api/send-mail.mjs` — Vercel serverless function (used on production)
- `server.mjs` — local Express server exposing the same endpoint (also serves `dist/` on :8787)

### SMTP setup (`.env`)

Gmail is easiest — use your Gmail address plus an **App Password** (Google Account → Security → 2-Step Verification → App passwords):

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=YOUR_GMAIL@gmail.com
SMTP_PASS=YOUR_16_CHAR_APP_PASSWORD
MAIL_TO=mwfitnessukonline@gmail.com        # where enquiries are delivered
```

## Deploy (self-hosted)

The site is designed to run from a single Node process — no Vercel required:

```bash
npm ci
npm run build                 # produces dist/
cp .env.example .env          # add DATABASE_URL, SMTP_*, STRIPE_*, PUBLIC_SITE_URL
PORT=8787 npm run server      # serves the site + all /api routes on one port
```

`server.mjs` loads `.env` automatically, serves the built `dist/` folder, exposes every `/api/*` route (contact/leads, plans, checkout, push, communications, unsubscribe, health), and has a catch-all that returns `index.html` for all other paths — so `/privacy`, `/cookies`, `/gdpr` and `/checkout` deep links work out of the box.

Production notes:
- Put a reverse proxy (Caddy/Nginx) in front for HTTPS and set `PUBLIC_SITE_URL` to the public origin (Stripe return URLs use it).
- Keep the process supervisor of your choice in charge (systemd unit, pm2, Docker, etc.) and set `PORT` as needed.
- `DATABASE_URL` stays server-side only. Never expose it to the browser build.

### Deploy (Vercel, alternative)

The `dist/` folder is the static site and `api/` is auto-detected as serverless functions; `vercel.json` provides the SPA rewrites that `server.mjs` handles natively when self-hosting.
Configure `DATABASE_URL` (server-only) and, for email alerts, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_TO` as Vercel environment variables. The website's Neon migration `0005_website_leads.sql` is maintained in the companion mobile repository and applied to the dedicated MW Fitness database.

### Embedded Stripe Checkout

The website creates an **embedded Stripe Checkout Session server-side**. Stripe's secure payment form appears inside the website, while Stripe itself collects card and billing details; the website never receives or stores card numbers or CVCs.

Add these environment variables locally and in Vercel:

```dotenv
VITE_STRIPE_PUBLISHABLE_KEY=REPLACE_WITH_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY=REPLACE_WITH_STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET=REPLACE_WITH_STRIPE_WEBHOOK_SIGNING_SECRET
STRIPE_PAYMENT_LEDGER_ENABLED=false
STRIPE_PRICE_ONLINE_WEEKLY=price_REPLACE_WITH_PRICE_ID
STRIPE_PRICE_ONLINE_12_WEEK=price_REPLACE_WITH_PRICE_ID
STRIPE_PRICE_ONLINE_4_WEEK_ONCE=price_REPLACE_WITH_PRICE_ID
STRIPE_PRICE_ONLINE_BRONZE_4WEEK=price_REPLACE_WITH_PRICE_ID
STRIPE_PRICE_ONLINE_SILVER_8WEEK=price_REPLACE_WITH_PRICE_ID
STRIPE_PRICE_ONLINE_GOLD_8WEEK=price_REPLACE_WITH_PRICE_ID
STRIPE_PRICE_ONLINE_PLATINUM_8WEEK=price_REPLACE_WITH_PRICE_ID
PUBLIC_SITE_URL=https://mwfitnessuk.com
```

**Vercel environment setup**
- **Production:** set `VITE_STRIPE_PUBLISHABLE_KEY` to the Stripe live publishable key (`pk_live_…`), `STRIPE_SECRET_KEY` to the live secret key (`sk_live_…`), and every active `STRIPE_PRICE_…` value to the corresponding live-mode Price ID from the same Stripe account. Missing keys fail closed; production never falls back to mock checkout.
- **Preview and Development:** when Stripe is configured, use matching test-mode publishable keys (`pk_test_…`), secret keys (`sk_test_…`) and test-mode Price IDs. Live keys are rejected outside Production.
- **Preview/Development without keys:** if both Stripe keys are absent, checkout presents an explicitly labelled mock simulation—even if Price IDs were added. It creates no Stripe session, takes no payment and activates no membership. If only one key is set or keys use the wrong mode, checkout fails closed instead of silently mocking.
- **Payment safety gate:** real checkout also requires `STRIPE_WEBHOOK_SECRET` and `STRIPE_PAYMENT_LEDGER_ENABLED=true`. Keep the flag false until the `stripe_payment_records` migration is applied to the same Neon branch, the matching signed webhook is configured, and test events are confirmed in the ledger. This gate prevents taking payments before the receipt ledger is ready.
- Before real checkout, the API verifies the selected plan is still active and is an online coaching plan in Neon. It retrieves the selected Stripe Price, checks its `livemode` flag against the environment's key mode, and checks that the Stripe amount/currency match the active plan price before creating a Checkout Session.
- The publishable key is allowed in browser code; keep the secret key server-side only. Never use a `VITE_` prefix for the secret key or commit real credentials.
- Configure Stripe webhook endpoint `/api/stripe-webhook` for `checkout.session.completed`, `checkout.session.async_payment_succeeded`, and `charge.refunded`. Use the endpoint's signing secret in `STRIPE_WEBHOOK_SECRET`; test and live endpoints have different signing secrets.
- `/api/checkout-status` verifies a returned Checkout Session directly with Stripe and does not expose customer details. A paid status still says account linking/membership activation is pending; the webhook ledger deliberately does not grant access automatically.
- Stripe keys and Price IDs must come from Stripe's dashboard. Placeholder values do not activate payments.

**Current audited Vercel state:** `PUBLIC_SITE_URL` is configured, but no Stripe key or Price ID variables were present in the environment-variable listing. Preview can use mock checkout until test credentials exist; Production checkout remains unavailable until live credentials and Price IDs are configured. No fake credentials were created.

**Important payment lifecycle gap:** a signed webhook and payment ledger are being prepared on a follow-up branch, but its migration is not applied and the endpoint is not deployed/configured. Even after ledger verification, the webhook records a paid purchase as pending account linking/manual review; it does not grant membership access automatically. Do not enable real checkout until the ledger migration, webhook and idempotent account-linking/provisioning flow have been reviewed and verified.

## Content & staff controls

- **Plans and pricing** are read from the shared Neon `plans` table and edited in Staff login → Plans; active plans are shown on the public home, packages and online-coaching pages.
- **Website enquiries** are stored in Neon and managed in Staff login → Website leads.
- **Training operations** (customers, memberships, nutrition, workouts, check-ins, progress and coach messages) are managed in Staff login and shared with the Expo app.
- Brand copy, reviews, contact details, static page sections and SHWAG catalogue are still authored in `src/data/mockData.ts` and the screen components. They are not yet a full database-driven CMS; central website content controls are a next implementation stage.

## Shared Neon backend

The website staff panel and the mobile app use the same dedicated Neon project, **MW Fitness**, with Neon Auth and the Neon Data API.

Set these environment variables in Vercel for Production, Preview and Development:

```bash
VITE_NEON_AUTH_URL=https://<branch-endpoint>/mwfitness/auth
VITE_NEON_DATA_API_URL=https://<branch-endpoint>/mwfitness/rest/v1
DATABASE_URL=<server-only pooled Neon PostgreSQL connection string>
```

Only the two `VITE_NEON_*` endpoint URLs are browser-visible. Keep `DATABASE_URL` server-only and never prefix it with `VITE_`.

The shared schema and ordered migration files are maintained in `MW-FITNESS-APP-MOBILE/neon/migrations/`, with website-owned dated migrations in `db/migrations/` (mobile nutrition live, communications centre, staff admin allowlist, SHWAG products, coaching videos). Migration files in either repository are not proof of deployment: verify the applied migrations, RLS policies and grants on the intended Neon branch before relying on them. The mobile README lists the recommended combined order for a fresh branch. The push endpoint authenticates using the caller's Neon JWT and relies on PostgreSQL row-level security; it does not require a privileged database key.

The first coach/admin must be created in Neon Auth and promoted to `admin` in `public.profiles` by an authorized database administrator. Do not use sample credentials for real accounts.
