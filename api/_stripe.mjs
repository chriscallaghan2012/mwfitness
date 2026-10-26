const PLAN_PRICE_ENV = {
  'online-weekly': 'STRIPE_PRICE_ONLINE_WEEKLY',
  'online-12-week': 'STRIPE_PRICE_ONLINE_12_WEEK',
  'online-4-week-once': 'STRIPE_PRICE_ONLINE_4_WEEK_ONCE',
  'online-bronze-4week': 'STRIPE_PRICE_ONLINE_BRONZE_4WEEK',
  'online-silver-8week': 'STRIPE_PRICE_ONLINE_SILVER_8WEEK',
  'online-gold-8week': 'STRIPE_PRICE_ONLINE_GOLD_8WEEK',
  'online-platinum-8week': 'STRIPE_PRICE_ONLINE_PLATINUM_8WEEK',
};

function isProductionEnvironment() {
  if (process.env.VERCEL_ENV) return process.env.VERCEL_ENV === 'production';
  return process.env.NODE_ENV === 'production';
}

/**
 * Production must be explicitly configured for live payments. Non-production
 * environments may use an explicit mock when neither Stripe key is configured.
 * Partial key pairs and wrong-mode keys always fail closed.
 */
export function resolveCheckoutMode() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const publishableKey = process.env.VITE_STRIPE_PUBLISHABLE_KEY;
  const production = isProductionEnvironment();

  // Without either key, Preview/Development stay usable as a labelled mock,
  // even if someone has added Price IDs but has not obtained test credentials.
  if (!secretKey && !publishableKey && !production) return { mode: 'mock' };
  if (!secretKey && !publishableKey && production) {
    throw new Error('Live Stripe is not configured for production.');
  }

  if (!secretKey || !publishableKey) {
    throw new Error('Stripe configuration is incomplete: both the secret and publishable keys are required.');
  }

  const expectedSecretPrefix = production ? 'sk_live_' : 'sk_test_';
  const expectedPublishablePrefix = production ? 'pk_live_' : 'pk_test_';
  if (!secretKey.startsWith(expectedSecretPrefix) || !publishableKey.startsWith(expectedPublishablePrefix)) {
    throw new Error(production
      ? 'Production requires matching live Stripe keys.'
      : 'Preview and development require matching Stripe test keys. Live keys are not allowed here.');
  }

  return { mode: 'stripe', publishableKey, secretKey, livemode: production };
}

export async function createCheckoutSession({ planId, origin, customerEmail, customerName, expectedAmount }) {
  const priceEnv = PLAN_PRICE_ENV[planId];
  if (!priceEnv) throw new Error('Invalid coaching plan.');

  const configuration = resolveCheckoutMode();
  if (configuration.mode === 'mock') return { mode: 'mock' };

  const { secretKey, publishableKey, livemode } = configuration;
  const priceId = process.env[priceEnv];
  if (!priceId) throw new Error(`Stripe is configured, but no Price ID is set for this plan (${priceEnv}).`);

  if (!/^price_[A-Za-z0-9]+$/.test(priceId)) {
    throw new Error(`The configured Price ID for this plan (${priceEnv}) is invalid.`);
  }

  const baseUrl = origin || process.env.PUBLIC_SITE_URL;
  if (!baseUrl || !/^https:\/\//i.test(baseUrl)) throw new Error('The public site URL is not configured.');

  // Retrieve the price first so a test key can never be paired with a live
  // Price ID (or vice versa). Stripe's Price object explicitly reports livemode.
  const priceResponse = await fetch(`https://api.stripe.com/v1/prices/${encodeURIComponent(priceId)}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${secretKey}` },
  });
  const price = await priceResponse.json();
  if (!priceResponse.ok) throw new Error(price?.error?.message || 'Stripe could not verify the configured Price ID.');
  if (price.livemode !== livemode) {
    throw new Error('The configured Stripe Price ID does not match this environment’s key mode.');
  }
  if (!Number.isFinite(expectedAmount) || expectedAmount < 0) {
    throw new Error('The active website plan price could not be verified.');
  }
  if (price.currency !== 'gbp' || price.unit_amount !== Math.round(expectedAmount * 100)) {
    throw new Error('The configured Stripe Price amount does not match the active website plan price.');
  }

  const params = new URLSearchParams({
    mode: 'payment',
    ui_mode: 'embedded',
    'line_items[0][price]': priceId,
    'line_items[0][quantity]': '1',
    return_url: `${baseUrl}/checkout?checkout=complete&plan=${encodeURIComponent(planId)}&session_id={CHECKOUT_SESSION_ID}`,
    redirect_on_completion: 'if_required',
    billing_address_collection: 'auto',
    'phone_number_collection[enabled]': 'true',
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
  if (!data.client_secret) throw new Error('Stripe did not return an embedded checkout client secret.');
  return { mode: 'stripe', clientSecret: data.client_secret, publishableKey };
}
