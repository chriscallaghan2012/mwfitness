import { neon } from '@neondatabase/serverless';
import { resolveCheckoutMode } from './_stripe.mjs';

function emailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function checkoutStatus() {
  try {
    const configuration = resolveCheckoutMode();
    if (configuration.mode === 'mock') return 'mock';
    const hasPlanPriceSource = Boolean(process.env.DATABASE_URL);
    const hasSiteUrl = Boolean(process.env.PUBLIC_SITE_URL || process.env.VERCEL_URL);
    const hasWebhook = Boolean(process.env.STRIPE_WEBHOOK_SECRET);
    const ledgerEnabled = process.env.STRIPE_PAYMENT_LEDGER_ENABLED === 'true';
    return hasPlanPriceSource && hasSiteUrl && hasWebhook && ledgerEnabled ? 'configured' : 'misconfigured';
  } catch {
    return 'misconfigured';
  }
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
    checkout: checkoutStatus(),
  };
  const ok = database === 'connected';
  res.status(ok ? 200 : 503).json({
    ok,
    service: 'mwfitnessuk',
    checks,
    checkedAt: new Date().toISOString(),
  });
}
