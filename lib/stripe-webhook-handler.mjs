import { createHmac, timingSafeEqual } from 'node:crypto';
import { neon } from '@neondatabase/serverless';
import { resolveCheckoutMode } from './_stripe.mjs';

export const config = { api: { bodyParser: false } };

export function verifyStripeSignature(rawBody, signatureHeader, secret, nowSeconds = Math.floor(Date.now() / 1000)) {
  if (!Buffer.isBuffer(rawBody) || !signatureHeader || !secret) return false;
  const parts = signatureHeader.split(',').map((part) => part.trim().split('='));
  const timestamp = Number(parts.find(([key]) => key === 't')?.[1]);
  const signatures = parts.filter(([key]) => key === 'v1').map(([, value]) => value);
  if (!Number.isInteger(timestamp) || Math.abs(nowSeconds - timestamp) > 300 || !signatures.length) return false;
  const expected = createHmac('sha256', secret).update(String(timestamp)).update('.').update(rawBody).digest();
  return signatures.some((signature) => {
    if (!/^[a-f0-9]{64}$/i.test(signature)) return false;
    const received = Buffer.from(signature, 'hex');
    return received.length === expected.length && timingSafeEqual(received, expected);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });
  res.setHeader('Cache-Control', 'no-store');
  // Do not process live or test events until the payment ledger migration and
  // webhook acceptance tests have been explicitly enabled for this environment.
  if (process.env.STRIPE_PAYMENT_LEDGER_ENABLED !== 'true') {
    return res.status(503).json({ ok: false, error: 'Stripe payment ledger is not enabled.' });
  }
  if (!process.env.STRIPE_WEBHOOK_SECRET || !process.env.DATABASE_URL) {
    return res.status(503).json({ ok: false, error: 'Stripe webhook is not configured.' });
  }
  try {
    const config = resolveCheckoutMode();
    if (config.mode !== 'stripe') return res.status(503).json({ ok: false, error: 'Stripe webhook is not configured.' });
    let rawBody;
    if (Buffer.isBuffer(req.body)) rawBody = req.body;
    else if (typeof req.body === 'string') rawBody = Buffer.from(req.body);
    else if (req.body !== undefined && req.body !== null) throw new Error('Raw request body is unavailable.');
    else {
      const chunks = [];
      for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      rawBody = Buffer.concat(chunks);
    }
    const signature = req.headers?.['stripe-signature'];
    if (!verifyStripeSignature(rawBody, typeof signature === 'string' ? signature : '', process.env.STRIPE_WEBHOOK_SECRET)) {
      return res.status(400).json({ ok: false, error: 'Invalid Stripe webhook signature.' });
    }
    const event = JSON.parse(rawBody.toString('utf8'));
    return await recordStripeEvent(event, res, config.livemode);
  } catch (error) {
    console.error('[MW Fitness] Stripe webhook processing failed:', error instanceof Error ? error.message : 'Unknown error');
    return res.status(500).json({ ok: false, error: 'Stripe event could not be recorded. Stripe will retry.' });
  }
}

async function recordStripeEvent(event, res, expectedLivemode) {
  if (!event || typeof event.id !== 'string' || typeof event.type !== 'string' || !event.data?.object) {
    return res.status(400).json({ ok: false, error: 'Invalid Stripe webhook event.' });
  }
  const sql = neon(process.env.DATABASE_URL);
  if (event.type === 'charge.refunded') {
    if (event.livemode !== expectedLivemode) return res.status(400).json({ ok: false, error: 'Stripe event mode does not match this environment.' });
    const charge = event.data.object;
    const paymentIntentId = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id;
    if (!paymentIntentId) return res.status(200).json({ received: true, ignored: true });
    const amount = Number(charge.amount);
    const refunded = Number(charge.amount_refunded);
    const full = Number.isFinite(amount) && Number.isFinite(refunded) && amount > 0 && refunded >= amount;
    const reason = full ? null : 'Partial or unverified refund requires staff review.';
    const rows = await sql`UPDATE public.stripe_payment_records
      SET membership_status = ${full ? 'refunded' : 'manual_review'},
          review_reason = ${reason}, stripe_event_id = ${event.id},
          stripe_event_type = ${event.type}, updated_at = now()
      WHERE stripe_payment_intent_id = ${paymentIntentId} RETURNING id`;
    if (!rows.length) return res.status(500).json({ ok: false, error: 'Payment record not ready for refund reconciliation.' });
    return res.status(200).json({ received: true, reconciled: true });
  }
  if (event.type !== 'checkout.session.completed' && event.type !== 'checkout.session.async_payment_succeeded') {
    return res.status(200).json({ received: true, ignored: true });
  }
  const session = event.data.object;
  if (session.mode !== 'payment' || session.payment_status !== 'paid') return res.status(200).json({ received: true, ignored: true });
  const sessionId = typeof session.id === 'string' ? session.id : '';
  if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId)) return res.status(400).json({ ok: false, error: 'Invalid Checkout Session identifier.' });
  const planId = typeof session.metadata?.plan_id === 'string' ? session.metadata.plan_id : 'unknown';
  const email = typeof (session.customer_details?.email || session.customer_email) === 'string' ? (session.customer_details?.email || session.customer_email).trim().toLowerCase() || null : null;
  const name = typeof (session.customer_details?.name || session.metadata?.customer_name) === 'string' ? (session.customer_details?.name || session.metadata?.customer_name).trim() || null : null;
  const amountTotal = Number.isInteger(session.amount_total) ? session.amount_total : null;
  const currency = typeof session.currency === 'string' ? session.currency.toLowerCase() : 'unknown';
  const expectedAmount = Number(session.metadata?.expected_amount_pence);
  const live = process.env.VERCEL_ENV ? process.env.VERCEL_ENV === 'production' : process.env.NODE_ENV === 'production';
  const reasons = [];
  const knownPlans = await sql`SELECT id, kind FROM public.plans WHERE id = ${planId} LIMIT 1`;
  if (!knownPlans[0] || knownPlans[0].kind !== 'online') reasons.push('Unknown coaching plan identifier.');
  if (!email) reasons.push('No customer email was returned by Stripe.');
  if (amountTotal === null || !Number.isInteger(expectedAmount) || amountTotal !== expectedAmount) reasons.push('Paid amount does not match checkout metadata.');
  if (currency !== 'gbp') reasons.push('Payment currency is not GBP.');
  if (session.livemode !== live || event.livemode !== live || expectedLivemode !== live) reasons.push('Stripe event live/test mode does not match the deployed environment.');
  const reviewReason = reasons.length ? reasons.join(' ') : null;
  const status = reviewReason ? 'manual_review' : 'pending_account_link';
  const paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id || null;
  const paidAt = Number.isFinite(event.created) ? new Date(event.created * 1000).toISOString() : null;
  await sql`INSERT INTO public.stripe_payment_records (
      stripe_session_id, stripe_event_id, stripe_event_type, stripe_payment_intent_id,
      plan_id, customer_email, customer_name, amount_total, currency, payment_status,
      membership_status, livemode, review_reason, paid_at, updated_at
    ) VALUES (
      ${sessionId}, ${event.id}, ${event.type}, ${paymentIntentId},
      ${planId}, ${email}, ${name}, ${amountTotal}, ${currency}, 'paid',
      ${status}, ${Boolean(session.livemode)}, ${reviewReason}, ${paidAt}, now()
    )
    ON CONFLICT (stripe_session_id) DO UPDATE SET
      stripe_event_id = EXCLUDED.stripe_event_id,
      stripe_event_type = EXCLUDED.stripe_event_type,
      stripe_payment_intent_id = EXCLUDED.stripe_payment_intent_id,
      plan_id = EXCLUDED.plan_id,
      customer_email = EXCLUDED.customer_email,
      customer_name = EXCLUDED.customer_name,
      amount_total = EXCLUDED.amount_total,
      currency = EXCLUDED.currency,
      payment_status = 'paid',
      membership_status = CASE WHEN stripe_payment_records.membership_status IN ('provisioned', 'refunded')
        THEN stripe_payment_records.membership_status ELSE EXCLUDED.membership_status END,
      livemode = EXCLUDED.livemode,
      review_reason = CASE WHEN stripe_payment_records.membership_status IN ('provisioned', 'refunded')
        THEN stripe_payment_records.review_reason ELSE EXCLUDED.review_reason END,
      paid_at = COALESCE(stripe_payment_records.paid_at, EXCLUDED.paid_at),
      updated_at = now()`;
  return res.status(200).json({ received: true, recorded: true, membership: 'not_activated' });
}
