import assert from 'node:assert/strict';
import { test } from 'node:test';
import checkoutHandler from '../api/create-checkout.mjs';
import healthHandler from '../api/health.mjs';

function responseDouble() {
  return {
    statusCode: 200,
    body: undefined as unknown,
    headers: {} as Record<string, string>,
    setHeader(name: string, value: string) { this.headers[name] = value; return this; },
    status(code: number) { this.statusCode = code; return this; },
    json(body: unknown) { this.body = body; return this; },
  };
}

const envKeys = [
  'VERCEL_ENV',
  'NODE_ENV',
  'STRIPE_SECRET_KEY',
  'VITE_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_PAYMENT_LEDGER_ENABLED',
  'STRIPE_PRICE_ONLINE_GOLD_8WEEK',
  'PUBLIC_SITE_URL',
  'DATABASE_URL',
] as const;

async function withCleanEnv(run: () => Promise<void>) {
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

test('Preview checkout API returns explicit mock mode without Stripe keys or a site URL', async () => {
  await withCleanEnv(async () => {
    const response = responseDouble();
    await checkoutHandler({
      method: 'POST',
      body: { planId: 'online-gold-8week', customerName: 'Preview Test', customerEmail: 'preview-test@example.com' },
    } as never, response as never);
    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.body, { mode: 'mock' });
  });
});

test('Production checkout API fails closed when live Stripe keys are missing', async () => {
  await withCleanEnv(async () => {
    process.env.VERCEL_ENV = 'production';
    const response = responseDouble();
    await checkoutHandler({ method: 'POST', body: { planId: 'online-gold-8week' } } as never, response as never);
    assert.equal(response.statusCode, 503);
    assert.match(JSON.stringify(response.body), /temporarily unavailable/i);
    assert.doesNotMatch(JSON.stringify(response.body), /mock/i);
  });
});

test('Preview checkout API rejects live credentials rather than falling back to mock', async () => {
  await withCleanEnv(async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_live_release_placeholder';
    process.env.VITE_STRIPE_PUBLISHABLE_KEY = 'pk_live_release_placeholder';
    const response = responseDouble();
    await checkoutHandler({ method: 'POST', body: { planId: 'online-gold-8week' } } as never, response as never);
    assert.equal(response.statusCode, 503);
    assert.doesNotMatch(JSON.stringify(response.body), /mock/i);
  });
});

test('Preview health endpoint reports mock checkout without exposing configuration', async () => {
  await withCleanEnv(async () => {
    const response = responseDouble();
    await healthHandler({ method: 'GET' } as never, response as never);
    assert.equal(response.statusCode, 503, 'database health can be unavailable independently of checkout mode');
    const payload = response.body as { checks?: Record<string, string> };
    assert.equal(payload.checks?.checkout, 'mock');
    assert.equal(JSON.stringify(payload).includes('STRIPE_SECRET_KEY'), false);
    assert.equal(JSON.stringify(payload).includes('pk_test_'), false);
  });
});

test('Configured Stripe checkout fails closed without the database used to verify the active plan', async () => {
  await withCleanEnv(async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_release_placeholder';
    process.env.VITE_STRIPE_PUBLISHABLE_KEY = 'pk_test_release_placeholder';
    const response = responseDouble();
    await checkoutHandler({ method: 'POST', body: { planId: 'online-gold-8week' } } as never, response as never);
    assert.equal(response.statusCode, 503);
    assert.doesNotMatch(JSON.stringify(response.body), /mock/i);
  });
});

test('Checkout API rejects a missing plan ID before attempting any checkout', async () => {
  await withCleanEnv(async () => {
    const response = responseDouble();
    await checkoutHandler({ method: 'POST', body: { customerEmail: 'test@example.com' } } as never, response as never);
    assert.equal(response.statusCode, 400);
    assert.match(JSON.stringify(response.body), /valid coaching plan/i);
  });
});
