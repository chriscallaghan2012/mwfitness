import { neon } from '@neondatabase/serverless';

let database;
function getDatabase() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured.');
  database ||= neon(process.env.DATABASE_URL);
  return database;
}

export async function createCheckoutSession({ planId, origin, customerEmail, customerName }) {
  if (typeof planId !== 'string' || !/^[a-z0-9][a-z0-9-]*$/.test(planId)) {
    throw new Error('Invalid coaching plan.');
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const baseUrl = origin || process.env.PUBLIC_SITE_URL;
  if (!secretKey) throw new Error('Stripe secret key is not configured.');
  if (!baseUrl || !/^https:\/\//i.test(baseUrl)) throw new Error('The public site URL is not configured.');

  const result = await getDatabase().query(
    'select id, stripe_price_id from public.plans where id = $1 and kind = $2 and active = true limit 1',
    [planId, 'online'],
  );
  const plan = result.rows?.[0];
  if (!plan) throw new Error('Invalid coaching plan.');
  if (!plan.stripe_price_id) throw new Error('This coaching plan is not connected to a live Stripe price yet.');

  const params = new URLSearchParams({
    mode: 'payment',
    'line_items[0][price]': String(plan.stripe_price_id),
    'line_items[0][quantity]': '1',
    success_url: `${baseUrl.replace(/\/$/, '')}/#online-coaching?checkout=success`,
    cancel_url: `${baseUrl.replace(/\/$/, '')}/#online-coaching?checkout=cancelled`,
    'metadata[plan_id]': planId,
  });
  if (customerEmail) params.set('customer_email', customerEmail);
  if (customerName) params.set('metadata[customer_name]', customerName);

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
