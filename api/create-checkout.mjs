import { createCheckoutSession } from './_stripe.mjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const origin = req.headers.origin || process.env.PUBLIC_SITE_URL;
    const result = await createCheckoutSession({
      planId: body?.planId,
      origin,
      customerEmail: typeof body?.customerEmail === 'string' ? body.customerEmail.trim() : undefined,
      customerName: typeof body?.customerName === 'string' ? body.customerName.trim() : undefined,
    });
    return res.status(200).json(result);
  } catch (error) {
    const status = /Invalid|not configured|public site|keys are not present|no price ID/i.test(error.message || '') ? 400 : 500;
    return res.status(status).json({ ok: false, error: error.message || 'Checkout could not be started.' });
  }
}