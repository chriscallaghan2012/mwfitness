# MWFitnessUK — website

Friendly personal training &amp; online coaching site for Michael Whitworth. React + Vite + Tailwind v4, with a Nodemailer-based contact/email backend.

## Pages

- **Home** — welcome, about Mike, what's available, packages at a glance, reviews
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

Without SMTP details in `.env`, forms validate and show a clear "not configured" message instead of sending — add the details and they'll deliver.

## Email backend

Every contact CTA on the site (navbar, hero, packages, app waitlist, SHWAG orders) opens one contact form that POSTs the **real submitted data** to `/api/send-mail`, which emails an on-brand HTML template to you.

- `api/_templates.mjs` — the email templates (edit here to change what lands in your inbox)
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
MAIL_TO=mikeptonline@gmail.com        # where enquiries are delivered
```

## Deploy (Vercel)

The `dist/` folder is the static site and `api/` is auto-detected as serverless functions.
Add `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_TO` as Vercel environment variables.

### Stripe checkout

Create two one-time Prices in Stripe for the online coaching offer, then add these environment variables locally and in Vercel:

```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PRICE_ONLINE_WEEKLY=price_...
STRIPE_PRICE_ONLINE_12_WEEK=price_...
PUBLIC_SITE_URL=https://your-domain.example
```

The online coaching page creates a Stripe Checkout session server-side. Keep `STRIPE_SECRET_KEY` server-only and never expose it through Vite/client environment variables.

## Content

All real site data lives in `src/data/siteData.ts` — packages, pricing, contact details, reviews, app features and SHWAG info. Add real SHWAG products to the `SHWAG_PRODUCTS` array.

## Shared Neon backend

The website staff panel and the mobile app use the same dedicated Neon project, **MW Fitness**, with Neon Auth and the Neon Data API.

Set these environment variables in Vercel for Production, Preview and Development:

```bash
VITE_NEON_AUTH_URL=https://<branch-endpoint>/mwfitness/auth
VITE_NEON_DATA_API_URL=https://<branch-endpoint>/mwfitness/rest/v1
DATABASE_URL=<server-only pooled Neon PostgreSQL connection string>
```

Only the two `VITE_NEON_*` endpoint URLs are browser-visible. Keep `DATABASE_URL` server-only and never prefix it with `VITE_`.

The shared schema and ordered migration files are maintained in `MW-FITNESS-APP-MOBILE/neon/migrations/`. The production Neon branch currently has migrations 0001–0004 applied. The push endpoint authenticates using the caller's Neon JWT and relies on PostgreSQL row-level security; it does not require a Supabase service-role key.

The first coach/admin must be created in Neon Auth and promoted to `admin` in `public.profiles` by an authorized database administrator. Do not use sample credentials for real accounts.
