import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createCheckoutSession } from '../api/_stripe.mjs';

test('Stripe Checkout creates an embedded session using server-only configuration', async () => {
  const envKeys = [
    'STRIPE_SECRET_KEY',
    'STRIPE_PRICE_ONLINE_GOLD_8WEEK',
  ] as const;
  const previous = new Map(envKeys.map((key) => [key, process.env[key]]));
  const originalFetch = globalThis.fetch;
  let captured: { url: string; authorization: string | null; body: URLSearchParams } | undefined;

  process.env.STRIPE_SECRET_KEY = 'sk_test_release_placeholder';
  process.env.STRIPE_PRICE_ONLINE_GOLD_8WEEK = 'price_test_release_placeholder';
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    captured = {
      url: String(input),
      authorization: new Headers(init?.headers).get('Authorization'),
      body: new URLSearchParams(String(init?.body ?? '')),
    };
    return new Response(JSON.stringify({ id: 'cs_test_release', client_secret: 'cs_test_release_secret' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }) as typeof fetch;

  try {
    const result = await createCheckoutSession({
      planId: 'online-gold-8week',
      origin: 'https://mwfitnessuk.com',
      customerEmail: 'release-test@example.com',
      customerName: 'Release Test',
    });
    assert.equal(result.clientSecret, 'cs_test_release_secret');
    assert.equal(captured?.url, 'https://api.stripe.com/v1/checkout/sessions');
    assert.equal(captured?.authorization, 'Bearer sk_test_release_placeholder');
    assert.equal(captured?.body.get('mode'), 'payment');
    assert.equal(captured?.body.get('ui_mode'), 'embedded');
    assert.equal(captured?.body.get('phone_number_collection[enabled]'), 'true');
    assert.equal(captured?.body.get('line_items[0][price]'), 'price_test_release_placeholder');
    assert.match(captured?.body.get('return_url') ?? '', /^https:\/\/mwfitnessuk\.com\/checkout\?/);
  } finally {
    globalThis.fetch = originalFetch;
    for (const [key, value] of previous) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});

test('Stripe Checkout rejects an unknown coaching plan before calling Stripe', async () => {
  await assert.rejects(
    () => createCheckoutSession({ planId: 'not-a-real-plan', origin: 'https://mwfitnessuk.com' }),
    /Invalid coaching plan/,
  );
});
