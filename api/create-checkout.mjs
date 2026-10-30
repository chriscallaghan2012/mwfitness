import { neon } from '@neondatabase/serverless';
import { createCheckoutSession, resolveCheckoutMode } from './_stripe.mjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
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
      priceId: checkoutMode.mode === 'stripe' && checkoutMode.livemode ? databasePriceId : undefined,
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
