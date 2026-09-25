const PLAN_PRICE_ENV = {
  'online-weekly': 'STRIPE_PRICE_ONLINE_WEEKLY',
  'online-12-week': 'STRIPE_PRICE_ONLINE_12_WEEK',
};

export async function createCheckoutSession({ planId, origin }) {
  const priceEnv = PLAN_PRICE_ENV[planId];
  if (!priceEnv) throw new Error('Invalid coaching plan.');

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env[priceEnv];
  if (!secretKey || !priceId) throw new Error('Stripe checkout is not configured yet.');

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