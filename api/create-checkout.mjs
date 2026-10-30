import { neon } from '@neondatabase/serverless';
import { createCheckoutSession, resolveCheckoutMode } from './_stripe.mjs';
import checkoutStatus from '../lib/checkout-status-handler.mjs';
import stripeWebhook from '../lib/stripe-webhook-handler.mjs';
import stripePlanSync from '../lib/stripe-plan-sync.mjs';

// Share the existing checkout function for the status and webhook routes so the
// Hobby deployment stays within Vercel's serverless-function limit.
export const config = { api: { bodyParser: false } };

async function getRawBody(req) {
  if (Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === 'string') return Buffer.from(req.body);
  if (req.body !== undefined && req.body !== null) return Buffer.from(JSON.stringify(req.body));
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  const route = typeof req.query?.route === 'string'
    ? req.query.route
    : new URL(req.url || '/api/create-checkout', 'https://mwfitnessuk.com').searchParams.get('route');
  if (route === 'status') return checkoutStatus(req, res);
  if (route === 'plan-sync') return stripePlanSync(req, res);
  if (route === 'webhook') {
    req.body = await getRawBody(req);
    return stripeWebhook(req, res);
  }

  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  try {
    let body = req.body;
    if (body === undefined || body === null || Buffer.isBuffer(body)) {
      const raw = Buffer.isBuffer(body) ? body : await getRawBody(req);
      body = raw.length ? JSON.parse(raw.toString('utf8')) : {};
    } else if (typeof body === 'string') {
      body = JSON.parse(body);
    }
    const planId = typeof body?.planId === 'string' ? body.planId.trim() : '';
    if (!planId) return res.status(400).json({ ok: false, error: 'Choose a valid coaching plan.' });

    const checkoutMode = resolveCheckoutMode();
    let expectedAmount;
    let databasePriceId;
    if (checkoutMode.mode === 'stripe') {
      // Keep real payments disabled until the ledger migration and signed webhook are configured.
      if (process.env.STRIPE_PAYMENT_LEDGER_ENABLED !== 'true' || !process.env.STRIPE_WEBHOOK_SECRET) {
        return res.status(503).json({ ok: false, error: 'Online checkout is temporarily unavailable. Please contact MW Fitness.' });
      }
      if (!process.env.DATABASE_URL) {
        return res.status(503).json({ ok: false, error: 'Online checkout is temporarily unavailable. Please contact MW Fitness.' });
      }
      // Never trust a client-provided amount or allow checkout for hidden/inactive plans.
      const sql = neon(process.env.DATABASE_URL);
      const plans = await sql`SELECT id, price, stripe_price_id, kind, active FROM public.plans WHERE id = ${planId} LIMIT 1`;
      const plan = plans[0];
      if (!plan || plan.kind !== 'online' || plan.active !== true) {
        return res.status(400).json({ ok: false, error: 'Choose an available online coaching package.' });
      }
      expectedAmount = Number(plan.price);
      databasePriceId = typeof plan.stripe_price_id === 'string' ? plan.stripe_price_id : undefined;
      if (checkoutMode.livemode && (typeof plan.stripe_price_id !== 'string' || !plan.stripe_price_id.startsWith('price_'))) {
        return res.status(503).json({ ok: false, error: 'Online checkout is temporarily unavailable. Please contact MW Fitness.' });
      }
      if (!Number.isFinite(expectedAmount) || expectedAmount < 0) {
        return res.status(503).json({ ok: false, error: 'Online checkout is temporarily unavailable. Please contact MW Fitness.' });
      }
    }

    // Use the canonical server-configured site URL, never a caller-controlled Origin header.
    // Mock checkout does not need a site URL; Stripe mode validates it server-side.
    const origin = process.env.PUBLIC_SITE_URL;
    const result = await createCheckoutSession({
      planId,
      origin,
      expectedAmount,
      priceId: checkoutMode.mode === 'stripe' ? databasePriceId : undefined,
      customerEmail: typeof body?.customerEmail === 'string' ? body.customerEmail.trim().slice(0, 254) : undefined,
      customerName: typeof body?.customerName === 'string' ? body.customerName.trim().slice(0, 100) : undefined,
    });
    return res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (/Invalid coaching plan/i.test(message)) {
      return res.status(400).json({ ok: false, error: 'Choose a valid coaching plan.' });
    }
    console.error('[MW Fitness] Stripe checkout session creation failed:', message || 'Unknown error');
    return res.status(503).json({ ok: false, error: 'Online checkout is temporarily unavailable. Please contact MW Fitness.' });
  }
}
