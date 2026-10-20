import { neon } from '@neondatabase/serverless';

export async function createCheckoutSession({ planId, origin }) {
  if (!planId || typeof planId !== 'string') throw new Error('Choose a valid coaching plan.');

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error('Stripe checkout is not configured yet.');
  if (!process.env.DATABASE_URL) throw new Error('Online coaching pricing is not configured yet.');

  const sql = neon(process.env.DATABASE_URL);
  const rows = await sql`
    SELECT id, name, price, description
    FROM public.plans
    WHERE id = ${planId} AND kind = 'online' AND active = true
    LIMIT 1
  `;
  const plan = rows[0];
  if (!plan) throw new Error('This coaching plan is no longer available.');

  const amount = Math.round(Number(plan.price) * 100);
  if (!Number.isSafeInteger(amount) || amount < 0) throw new Error('The selected plan has an invalid price.');

  const baseUrl = origin || process.env.PUBLIC_SITE_URL;
  if (!baseUrl) throw new Error('The public site URL is not configured.');

  const params = new URLSearchParams({
    mode: 'payment',
    'line_items[0][price_data][currency]': 'gbp',
    'line_items[0][price_data][unit_amount]': String(amount),
    'line_items[0][price_data][product_data][name]': plan.name,
    'line_items[0][quantity]': '1',
    success_url: `${baseUrl}/online-coaching?checkout=success`,
    cancel_url: `${baseUrl}/online-coaching?checkout=cancelled`,
    'metadata[plan_id]': plan.id,
  });
  if (plan.description) params.set('line_items[0][price_data][product_data][description]', plan.description);

  const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || 'Stripe could not create checkout.');
  return { url: data.url };
}
