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

## Deploy (Vercel)

The `dist/` folder is the static site and `api/` is auto-detected as serverless functions.
Configure `DATABASE_URL` (server-only) and, for email alerts, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_TO` as Vercel environment variables. The website's Neon migration `0005_website_leads.sql` is maintained in the companion mobile repository and applied to the dedicated MW Fitness database.

### Stripe checkout

Create two one-time Prices in Stripe for the online coaching offer, then add these environment variables locally and in Vercel:

```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PRICE_ONLINE_WEEKLY=price_...
STRIPE_PRICE_ONLINE_12_WEEK=price_...
PUBLIC_SITE_URL=https://your-domain.example
```

The online coaching page creates a Stripe Checkout session server-side. Keep `STRIPE_SECRET_KEY` server-only and never expose it through Vite/client environment variables.

> **Known gap:** checkout session creation is the only Stripe step implemented. No webhook provisions a membership, creates a payment record or activates an account, and no Stripe credentials are configured yet — do not promise automatic signup, activation or receipts from checkout.

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
