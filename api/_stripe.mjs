const PLAN_PRICE_ENV = {
  'online-weekly': 'STRIPE_PRICE_ONLINE_WEEKLY',
  'online-12-week': 'STRIPE_PRICE_ONLINE_12_WEEK',
  'online-4-week-once': 'STRIPE_PRICE_ONLINE_4_WEEK_ONCE',
  'online-bronze-4week': 'STRIPE_PRICE_ONLINE_BRONZE_4WEEK',
  'online-silver-8week': 'STRIPE_PRICE_ONLINE_SILVER_8WEEK',
  'online-gold-8week': 'STRIPE_PRICE_ONLINE_GOLD_8WEEK',
  'online-platinum-8week': 'STRIPE_PRICE_ONLINE_PLATINUM_8WEEK',
};

export async function createCheckoutSession({ planId, origin, customerEmail, customerName }) {
  const priceEnv = PLAN_PRICE_ENV[planId];
  if (!priceEnv) throw new Error('Invalid coaching plan.');

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env[priceEnv];
  if (!secretKey) throw new Error('Stripe keys are not present on the server (STRIPE_SECRET_KEY is missing). Payments are not live yet.');
  if (!priceId) throw new Error(`Stripe keys are present, but no price ID is configured for this plan yet (${priceEnv}).`);

  const baseUrl = origin || process.env.PUBLIC_SITE_URL;
  if (!baseUrl) throw new Error('The public site URL is not configured.');

  const params = new URLSearchParams({
    mode: 'payment',
    'line_items[0][price]': priceId,
    'line_items[0][quantity]': '1',
    success_url: `${baseUrl}/#online-coaching?checkout=success`,
    cancel_url: `${baseUrl}/#online-coaching?checkout=cancelled`,
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