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

### Dark Stripe Checkout Elements and dynamic Staff HQ plans

The website automatically loads Stripe Checkout Elements when a customer opens an active package. Stripe's Contact Details and Payment Elements collect contact, card and billing details in a dark appearance matched to the MW Fitness palette; the website does not handle or store card numbers/CVCs. This integration loads Stripe.js's Dahlia release and pins only Checkout Session API requests to `2026-03-25.dahlia`, which Stripe requires for Checkout Elements. This is a technical API/SDK version, not a paid account upgrade, and does not change the account-wide API version. The customer confirms payment using the site's secure payment button, and Stripe handles any required authentication and return flow.

**Neon is the source of truth for coaching plans.** Staff HQ → Plans creates/edits/activates/archives online coaching plans and synchronises the corresponding Stripe Product/Price server-side. Each plan stores `stripe_product_id` and `stripe_price_id` in `public.plans`. When a price changes, Stripe creates a new immutable Price, Neon is updated to the new Price ID, and the previous Price is deactivated. Archiving a plan preserves its history and prevents new purchases.

Do **not** create package-specific Stripe Price environment variables. The application reads the current Price ID from Neon and verifies the Stripe mode, GBP currency and amount against the active plan before creating Checkout. SHWAG products remain catalogue/enquiry-only; Stripe product sync for SHWAG is not part of the current scope because it has no checkout/sales flow.

Required environment variables:
- `STRIPE_SECRET_KEY` — server-only secret or restricted key. It needs permission to create Checkout Sessions and read/write Stripe Products and Prices for Staff HQ plan sync.
- `VITE_STRIPE_PUBLISHABLE_KEY` — publishable key for the matching Stripe mode.
- `STRIPE_WEBHOOK_SECRET` — signing secret for the configured webhook endpoint. Required for verified payment processing, not product/price syncing.
- `STRIPE_PAYMENT_LEDGER_ENABLED` — keep disabled until the payment-ledger migration, signed webhook and lifecycle tests have been reviewed and approved.
- `PUBLIC_SITE_URL` — canonical website origin for checkout return URLs.

Production must use matching live keys. Preview/Development must use matching test keys; live keys outside Production fail closed. **Preview plan syncing is blocked by default** because Preview shares the production Neon database. To test it safely, first give Preview its own Neon Auth endpoint, Data API endpoint and `DATABASE_URL`, add matching Stripe test keys, then set `STRIPE_PLAN_SYNC_PREVIEW_ENABLED=true` and `STRIPE_PLAN_SYNC_PREVIEW_DATABASE_ISOLATED=true` on Preview only.

**Current release gate:** Stripe keys are present in Vercel Production. The latest metadata-only environment inventory did not list `STRIPE_WEBHOOK_SECRET`; the ledger flag is targeted at Production and Preview. Secret values were not decrypted. The Stripe webhook endpoint and payment ledger are not yet signed off, and automatic paid membership provisioning/refunds are not complete. Do not enable paid membership access until those gates are verified.

The website's payment-ledger migration is `db/migrations/20261026_stripe_payment_records.sql`. It is prepared but must not be applied to production without explicit approval. A successful product/price sync is not evidence that payment processing or membership activation is ready.

## Content & staff controls

- **Plans and pricing** are read from the shared Neon `plans` table and edited in Staff login → Plans; active plans are shown on the public home, packages and online-coaching pages.
- **Website enquiries** are stored in Neon and managed in Staff login → Website leads.
- **Training operations** (customers, memberships, nutrition, workouts, check-ins, progress and coach messages) are managed in Staff login and shared with the Expo app.
- Brand copy, reviews, contact details, static page sections and SHWAG catalogue are still authored in `src/data/mockData.ts` and the screen components. They are not yet a full database-driven CMS; central website content controls are a next implementation stage.

## Shared Neon backend

The website staff panel and the mobile app use the same dedicated Neon project, **MW Fitness**, with Neon Auth and the Neon Data API.

Set the Neon endpoint variables in Vercel for Production and Preview; use your local `.env` for development. Preview currently shares the production database, so use care with all writes:

```bash
VITE_NEON_AUTH_URL=https://<branch-endpoint>/mwfitness/auth
VITE_NEON_DATA_API_URL=https://<branch-endpoint>/mwfitness/rest/v1
DATABASE_URL=<server-only pooled Neon PostgreSQL connection string>
```

Only the two `VITE_NEON_*` endpoint URLs are browser-visible. Keep `DATABASE_URL` server-only and never prefix it with `VITE_`.

The shared schema and ordered migration files are maintained in `MW-FITNESS-APP-MOBILE/neon/migrations/`, with website-owned dated migrations in `db/migrations/` (mobile nutrition live, communications centre, staff admin allowlist, SHWAG products, coaching videos). Migration files in either repository are not proof of deployment: verify the applied migrations, RLS policies and grants on the intended Neon branch before relying on them. The mobile README lists the recommended combined order for a fresh branch. The push endpoint authenticates using the caller's Neon JWT and relies on PostgreSQL row-level security; it does not require a privileged database key.

The first coach/admin must be created in Neon Auth and promoted to `admin` in `public.profiles` by an authorized database administrator. Do not use sample credentials for real accounts.
