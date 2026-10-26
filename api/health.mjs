import { neon } from '@neondatabase/serverless';

function emailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function checkoutConfigured() {
  return Boolean(
    process.env.VITE_STRIPE_PUBLISHABLE_KEY &&
    process.env.STRIPE_SECRET_KEY &&
    process.env.STRIPE_PRICE_ONLINE_WEEKLY &&
    process.env.STRIPE_PRICE_ONLINE_12_WEEK &&
    process.env.STRIPE_PRICE_ONLINE_4_WEEK_ONCE &&
    process.env.STRIPE_PRICE_ONLINE_BRONZE_4WEEK &&
    process.env.STRIPE_PRICE_ONLINE_SILVER_8WEEK &&
    process.env.STRIPE_PRICE_ONLINE_GOLD_8WEEK &&
    process.env.STRIPE_PRICE_ONLINE_PLATINUM_8WEEK &&
    (process.env.PUBLIC_SITE_URL || process.env.VERCEL_URL)
  );
}

/**
 * Public, non-sensitive service health endpoint.
 * It reports capability status only; it never returns credentials or connection URLs.
 */
export default async function health(_req, res) {
  res.setHeader('Cache-Control', 'no-store');
  let database = 'not_configured';
  if (process.env.DATABASE_URL) {
    try {
      const sql = neon(process.env.DATABASE_URL);
      await sql`select 1 as healthy`;
      database = 'connected';
    } catch {
      database = 'unavailable';
    }
  }

  const checks = {
    database,
    email: emailConfigured() ? 'configured' : 'not_configured',
    checkout: checkoutConfigured() ? 'configured' : 'not_configured',
  };
  const ok = database === 'connected';
  res.status(ok ? 200 : 503).json({
    ok,
    service: 'mwfitnessuk',
    checks,
    checkedAt: new Date().toISOString(),
  });
}
