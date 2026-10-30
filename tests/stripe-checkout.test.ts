import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createCheckoutSession, resolveCheckoutMode } from '../api/_stripe.mjs';

const envKeys = [
  'VERCEL_ENV',
  'NODE_ENV',
  'PUBLIC_SITE_URL',
  'STRIPE_SECRET_KEY',
  'VITE_STRIPE_PUBLISHABLE_KEY',
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

test('Preview accepts restricted Stripe test API keys', async () => {
  await withCleanStripeEnv(async () => {
    process.env.STRIPE_SECRET_KEY = 'rk_test_release_placeholder';
    process.env.VITE_STRIPE_PUBLISHABLE_KEY = 'pk_test_release_placeholder';
    assert.deepEqual(resolveCheckoutMode(), {
      mode: 'stripe',
      publishableKey: 'pk_test_release_placeholder',
      secretKey: 'rk_test_release_placeholder',
      livemode: false,
    });
  });
});

test('Production accepts restricted Stripe live API keys', async () => {
  await withCleanStripeEnv(async () => {
    process.env.VERCEL_ENV = 'production';
    process.env.STRIPE_SECRET_KEY = 'rk_live_release_placeholder';
    process.env.VITE_STRIPE_PUBLISHABLE_KEY = 'pk_live_release_placeholder';
    assert.deepEqual(resolveCheckoutMode(), {
      mode: 'stripe',
      publishableKey: 'pk_live_release_placeholder',
      secretKey: 'rk_live_release_placeholder',
      livemode: true,
    });
  });
});

test('Stripe Checkout verifies the Price mode and creates a Checkout Elements session', async () => {
  await withCleanStripeEnv(async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_release_placeholder';
    process.env.VITE_STRIPE_PUBLISHABLE_KEY = 'pk_test_release_placeholder';
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
        return new Response(JSON.stringify({ id: 'price_testReleasePlaceholder', livemode: false, currency: 'gbp', unit_amount: 39999 }), {
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
        priceId: 'price_testReleasePlaceholder',
        customerEmail: 'release-test@example.com',
        customerName: 'Release Test',
        expectedAmount: 399.99,
      });
      assert.deepEqual(result, {
        mode: 'stripe',
        clientSecret: 'cs_test_release_secret',
        publishableKey: 'pk_test_release_placeholder',
      });
      assert.equal(requests.length, 2);
      assert.equal(requests[0].url, 'https://api.stripe.com/v1/prices/price_testReleasePlaceholder');
      assert.equal(requests[0].method, 'GET');
      assert.equal(requests[1].url, 'https://api.stripe.com/v1/checkout/sessions');
      assert.equal(requests[1].authorization, 'Bearer sk_test_release_placeholder');
      assert.equal(requests[1].body.get('mode'), 'payment');
      assert.equal(requests[1].body.get('ui_mode'), 'elements');
      assert.equal(requests[1].body.get('phone_number_collection[enabled]'), 'true');
      assert.equal(requests[1].body.has('branding_settings[background_color]'), false);
      assert.equal(requests[1].body.has('branding_settings[button_color]'), false);
      assert.equal(requests[1].body.get('line_items[0][price]'), 'price_testReleasePlaceholder');
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
    const originalFetch = globalThis.fetch;
    let sessionCreated = false;
    globalThis.fetch = (async (_input: string | URL | Request, init?: RequestInit) => {
      if ((init?.method ?? 'GET') === 'POST') sessionCreated = true;
      return new Response(JSON.stringify({ id: 'price_liveReleasePlaceholder', livemode: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }) as typeof fetch;
    try {
      await assert.rejects(
        () => createCheckoutSession({ planId: 'online-gold-8week', origin: 'https://preview.example.test', priceId: 'price_liveReleasePlaceholder', expectedAmount: 399.99 }),
        /does not match this environment/i,
      );
      assert.equal(sessionCreated, false);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

test('Stripe Checkout rejects an empty plan identifier before calling Stripe', async () => {
  await assert.rejects(
    () => createCheckoutSession({ planId: '', origin: 'https://mwfitnessuk.com' }),
    /Invalid coaching plan/,
  );
});

test('Stripe rejects a Price amount that differs from the active website plan', async () => {
  await withCleanStripeEnv(async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_release_placeholder';
    process.env.VITE_STRIPE_PUBLISHABLE_KEY = 'pk_test_release_placeholder';
    const originalFetch = globalThis.fetch;
    let sessionCreated = false;
    globalThis.fetch = (async (_input: string | URL | Request, init?: RequestInit) => {
      if ((init?.method ?? 'GET') === 'POST') sessionCreated = true;
      return new Response(JSON.stringify({ id: 'price_testReleasePlaceholder', livemode: false, currency: 'gbp', unit_amount: 10000 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }) as typeof fetch;
    try {
      await assert.rejects(
        () => createCheckoutSession({ planId: 'online-gold-8week', origin: 'https://preview.example.test', priceId: 'price_testReleasePlaceholder', expectedAmount: 99.99 }),
        /does not match the active website plan price/i,
      );
      assert.equal(sessionCreated, false);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
