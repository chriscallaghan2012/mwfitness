import { resolveCheckoutMode } from './_stripe.mjs';

const ACTIVE_ONLINE_PLAN_IDS = new Set([
  'online-4-week-once',
  'online-bronze-4week',
  'online-silver-8week',
  'online-gold-8week',
  'online-platinum-8week',
]);

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method not allowed' });
  res.setHeader('Cache-Control', 'no-store');

  const sessionId = typeof req.query?.session_id === 'string'
    ? req.query.session_id
    : new URL(req.url || '/api/checkout-status', 'https://mwfitnessuk.com').searchParams.get('session_id') || '';
  if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId)) {
    return res.status(400).json({ ok: false, error: 'A valid Checkout Session ID is required.' });
  }

  let configuration;
  try {
    configuration = resolveCheckoutMode();
    if (configuration.mode !== 'stripe') {
      return res.status(503).json({ ok: false, error: 'Payment status verification is not configured.' });
    }
  } catch {
    return res.status(503).json({ ok: false, error: 'Payment status verification is not configured.' });
  }

  try {
    const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${configuration.secretKey}` },
    });
    const session = await response.json();
    if (!response.ok) {
      return res.status(response.status === 404 ? 404 : 503).json({ ok: false, error: 'Payment status could not be verified.' });
    }
    if (session.id !== sessionId || session.mode !== 'payment' || session.livemode !== configuration.livemode) {
      return res.status(404).json({ ok: false, error: 'Payment status could not be verified.' });
    }
    const planId = typeof session.metadata?.plan_id === 'string' ? session.metadata.plan_id : '';
    if (!ACTIVE_ONLINE_PLAN_IDS.has(planId)) {
      return res.status(404).json({ ok: false, error: 'Payment status could not be verified.' });
    }

    const paid = session.payment_status === 'paid';
    const expectedAmount = Number(session.metadata?.expected_amount_pence);
    const amountMatches = Number.isInteger(expectedAmount) && session.amount_total === expectedAmount && session.currency === 'gbp';
    const status = !paid ? 'pending' : amountMatches ? 'paid' : 'review';
    return res.status(200).json({
      ok: true,
      status,
      planId,
      membership: 'pending_account_link',
    });
  } catch {
    return res.status(503).json({ ok: false, error: 'Payment status could not be verified.' });
  }
}
