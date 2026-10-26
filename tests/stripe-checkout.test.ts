import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createCheckoutSession, resolveCheckoutMode } from '../api/_stripe.mjs';

const envKeys = [
  'VERCEL_ENV',
  'NODE_ENV',
  'PUBLIC_SITE_URL',
  'STRIPE_SECRET_KEY',
  'VITE_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_PRICE_ONLINE_WEEKLY',
  'STRIPE_PRICE_ONLINE_12_WEEK',
  'STRIPE_PRICE_ONLINE_4_WEEK_ONCE',
  'STRIPE_PRICE_ONLINE_BRONZE_4WEEK',
  'STRIPE_PRICE_ONLINE_SILVER_8WEEK',
  'STRIPE_PRICE_ONLINE_GOLD_8WEEK',
  'STRIPE_PRICE_ONLINE_PLATINUM_8WEEK',
] as const;

async function withCleanStripeEnv(run: () => Promise<void>) {
  const previous = new Map(envKeys.map((key) => [key, process.env[key]]));
  try {
    for (const key of envKeys) delete process.env[key];
    process.env.VERCEL_ENV = 'preview';
    await run();
  } finally {
    for (const [key, value] of previous) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

test('Preview falls back to an explicit mock when both Stripe keys are absent', async () => {
  await withCleanStripeEnv(async () => {
    process.env.STRIPE_PRICE_ONLINE_GOLD_8WEEK = 'price_configured_without_keys';
    assert.deepEqual(resolveCheckoutMode(), { mode: 'mock' });
    const result = await createCheckoutSession({ planId: 'online-gold-8week' });
    assert.deepEqual(result, { mode: 'mock' });
  });
});

test('Production without Stripe configuration fails closed instead of using mock checkout', async () => {
  await withCleanStripeEnv(async () => {
    process.env.VERCEL_ENV = 'production';
    assert.throws(() => resolveCheckoutMode(), /not configured for production/i);
    await assert.rejects(
      () => createCheckoutSession({ planId: 'online-gold-8week' }),
      /not configured for production/i,
    );
  });
});

test('Stripe Checkout verifies the Price mode and creates an embedded session', async () => {
  await withCleanStripeEnv(async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_release_placeholder';
    process.env.VITE_STRIPE_PUBLISHABLE_KEY = 'pk_test_release_placeholder';
    process.env.STRIPE_PRICE_ONLINE_GOLD_8WEEK = 'price_test_release_placeholder';
    process.env.PUBLIC_SITE_URL = 'https://preview.example.test';
    const originalFetch = globalThis.fetch;
    const requests: Array<{ url: string; method: string; authorization: string | null; body: URLSearchParams }> = [];
    globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
      const url = String(input);
      const method = init?.method ?? 'GET';
      requests.push({
        url,
        method,
        authorization: new Headers(init?.headers).get('Authorization'),
        body: new URLSearchParams(String(init?.body ?? '')),
      });
      if (method === 'GET') {
        return new Response(JSON.stringify({ id: 'price_test_release_placeholder', livemode: false, currency: 'gbp', unit_amount: 9999 }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ id: 'cs_test_release', client_secret: 'cs_test_release_secret' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }) as typeof fetch;

    try {
      const result = await createCheckoutSession({
        planId: 'online-gold-8week',
        origin: 'https://preview.example.test',
        customerEmail: 'release-test@example.com',
        customerName: 'Release Test',
        expectedAmount: 99.99,
      });
      assert.deepEqual(result, {
        mode: 'stripe',
        clientSecret: 'cs_test_release_secret',
        publishableKey: 'pk_test_release_placeholder',
      });
      assert.equal(requests.length, 2);
      assert.equal(requests[0].url, 'https://api.stripe.com/v1/prices/price_test_release_placeholder');
      assert.equal(requests[0].method, 'GET');
      assert.equal(requests[1].url, 'https://api.stripe.com/v1/checkout/sessions');
      assert.equal(requests[1].authorization, 'Bearer sk_test_release_placeholder');
      assert.equal(requests[1].body.get('mode'), 'payment');
      assert.equal(requests[1].body.get('ui_mode'), 'embedded');
      assert.equal(requests[1].body.get('phone_number_collection[enabled]'), 'true');
      assert.equal(requests[1].body.get('line_items[0][price]'), 'price_test_release_placeholder');
      assert.match(requests[1].body.get('return_url') ?? '', /^https:\/\/preview\.example\.test\/checkout\?/);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

test('Stripe rejects a Price ID from the wrong mode', async () => {
  await withCleanStripeEnv(async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_release_placeholder';
    process.env.VITE_STRIPE_PUBLISHABLE_KEY = 'pk_test_release_placeholder';
    process.env.STRIPE_PRICE_ONLINE_GOLD_8WEEK = 'price_live_release_placeholder';
    const originalFetch = globalThis.fetch;
    let sessionCreated = false;
    globalThis.fetch = (async (_input: string | URL | Request, init?: RequestInit) => {
      if ((init?.method ?? 'GET') === 'POST') sessionCreated = true;
      return new Response(JSON.stringify({ id: 'price_live_release_placeholder', livemode: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }) as typeof fetch;
    try {
      await assert.rejects(
        () => createCheckoutSession({ planId: 'online-gold-8week', origin: 'https://preview.example.test' }),
        /does not match this environment/i,
      );
      assert.equal(sessionCreated, false);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

test('Stripe Checkout rejects an unknown coaching plan before calling Stripe', async () => {
  await assert.rejects(
    () => createCheckoutSession({ planId: 'not-a-real-plan', origin: 'https://mwfitnessuk.com' }),
    /Invalid coaching plan/,
  );
});

test('Stripe rejects a Price amount that differs from the active website plan', async () => {
  await withCleanStripeEnv(async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_release_placeholder';
    process.env.VITE_STRIPE_PUBLISHABLE_KEY = 'pk_test_release_placeholder';
    process.env.STRIPE_PRICE_ONLINE_GOLD_8WEEK = 'price_test_release_placeholder';
    const originalFetch = globalThis.fetch;
    let sessionCreated = false;
    globalThis.fetch = (async (_input: string | URL | Request, init?: RequestInit) => {
      if ((init?.method ?? 'GET') === 'POST') sessionCreated = true;
      return new Response(JSON.stringify({ id: 'price_test_release_placeholder', livemode: false, currency: 'gbp', unit_amount: 10000 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }) as typeof fetch;
    try {
      await assert.rejects(
        () => createCheckoutSession({ planId: 'online-gold-8week', origin: 'https://preview.example.test', expectedAmount: 99.99 }),
        /does not match the active website plan price/i,
      );
      assert.equal(sessionCreated, false);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
