import assert from 'node:assert/strict';
import { test } from 'node:test';
import stripePlanSync, { validatePlanPayload } from '../lib/stripe-plan-sync.mjs';

test('plan validation supports new dynamic online plan IDs without a Price ID env mapping', () => {
  const result = validatePlanPayload({
    id: 'online-custom-coaching-16-week',
    name: 'Custom Coaching',
    kind: 'online',
    price: 525.5,
    active: true,
    features: ['Weekly check-in', '', 'Nutrition plan'],
  });
  assert.equal(result.error, undefined);
  assert.equal(result.value.id, 'online-custom-coaching-16-week');
  assert.equal(result.value.price, 525.5);
  assert.deepEqual(result.value.features, ['Weekly check-in', 'Nutrition plan']);
});

test('online plans cannot be saved with a zero or invalid amount', () => {
  assert.match(String(validatePlanPayload({ id: 'free-plan', name: 'Free', kind: 'online', price: 0 }).error), /greater than £0/);
  assert.match(String(validatePlanPayload({ id: 'broken-plan', name: 'Broken', kind: 'online', price: 12.345 }).error), /two decimal places/);
});

test('plan sync rejects unauthenticated requests before contacting Neon or Stripe', async () => {
  const res = {
    code: 200,
    payload: null as unknown,
    headers: {} as Record<string, string>,
    setHeader(name: string, value: string) { this.headers[name] = value; },
    status(code: number) { this.code = code; return this; },
    json(payload: unknown) { this.payload = payload; return this; },
  };
  await stripePlanSync({ method: 'POST', headers: {}, body: { action: 'save', plan: { id: 'online-custom', name: 'Custom', kind: 'online', price: 50 } } } as never, res as never);
  assert.equal(res.code, 401);
  assert.match(String((res.payload as { error?: string }).error), /staff session/i);
});

test('plan sync refuses Preview because it currently shares the production Neon database', async () => {
  const envKeys = ['VERCEL_ENV', 'NODE_ENV', 'DATABASE_URL', 'NEON_DATA_API_URL', 'VITE_NEON_DATA_API_URL', 'STRIPE_SECRET_KEY', 'VITE_STRIPE_PUBLISHABLE_KEY', 'STRIPE_PLAN_SYNC_PREVIEW_ENABLED', 'STRIPE_PLAN_SYNC_PREVIEW_DATABASE_ISOLATED'] as const;
  const previous = new Map(envKeys.map((key) => [key, process.env[key]]));
  const originalFetch = globalThis.fetch;
  try {
    process.env.VERCEL_ENV = 'preview';
    process.env.DATABASE_URL = 'postgresql://placeholder.invalid/not-used';
    process.env.NEON_DATA_API_URL = 'https://neon-data-api.example.test';
    process.env.STRIPE_SECRET_KEY = 'sk_test_release_placeholder';
    process.env.VITE_STRIPE_PUBLISHABLE_KEY = 'pk_test_release_placeholder';
    const userId = '123e4567-e89b-42d3-a456-426614174000';
    const token = 'header.' + Buffer.from(JSON.stringify({ sub: userId })).toString('base64url') + '.signature';
    let stripeCalled = false;
    globalThis.fetch = (async (input: string | URL | Request) => {
      if (String(input).startsWith('https://api.stripe.com/')) stripeCalled = true;
      return new Response(JSON.stringify([{ id: userId, role: 'admin' }]), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }) as typeof fetch;
    const response = {
      code: 200,
      payload: null as unknown,
      headers: {} as Record<string, string>,
      setHeader(name: string, value: string) { this.headers[name] = value; },
      status(code: number) { this.code = code; return this; },
      json(payload: unknown) { this.payload = payload; return this; },
    };
    await stripePlanSync({
      method: 'POST',
      headers: { authorization: 'Bearer ' + token },
      body: { action: 'save', isCreate: true, plan: { id: 'online-custom', name: 'Custom', kind: 'online', price: 50, active: true } },
    } as never, response as never);
    assert.equal(response.code, 503);
    assert.match(String((response.payload as { error?: string }).error), /blocked outside Production/i);
    assert.equal(stripeCalled, false);
  } finally {
    globalThis.fetch = originalFetch;
    for (const [key, value] of previous) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});
