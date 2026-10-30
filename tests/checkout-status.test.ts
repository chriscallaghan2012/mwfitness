import assert from 'node:assert/strict';
import { test } from 'node:test';
import handler from '../lib/checkout-status-handler.mjs';

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

const envKeys = ['VERCEL_ENV', 'NODE_ENV', 'STRIPE_SECRET_KEY', 'VITE_STRIPE_PUBLISHABLE_KEY'] as const;
async function withTestStripe(run: () => Promise<void>) {
  const previous = new Map(envKeys.map((key) => [key, process.env[key]]));
  try {
    process.env.VERCEL_ENV = 'preview';
    process.env.STRIPE_SECRET_KEY = 'sk_test_release_placeholder';
    process.env.VITE_STRIPE_PUBLISHABLE_KEY = 'pk_test_release_placeholder';
    await run();
  } finally {
    for (const [key, value] of previous) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

test('checkout status confirms paid state without exposing customer details', async () => {
  await withTestStripe(async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () => new Response(JSON.stringify({
      id: 'cs_test_release123',
      mode: 'payment',
      livemode: false,
      payment_status: 'paid',
      metadata: { plan_id: 'online-gold-8week', expected_amount_pence: '39999' },
      amount_total: 39999,
      currency: 'gbp',
      customer_details: { email: 'private@example.com' },
    }), { status: 200, headers: { 'Content-Type': 'application/json' } })) as typeof fetch;
    try {
      const response = responseDouble();
      await handler({ method: 'GET', query: { session_id: 'cs_test_release123' } } as never, response as never);
      assert.equal(response.statusCode, 200);
      assert.deepEqual(response.body, { ok: true, status: 'paid', planId: 'online-gold-8week', membership: 'pending_account_link' });
      assert.equal(JSON.stringify(response.body).includes('private@example.com'), false);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

test('checkout status flags a paid session with the wrong amount for manual review', async () => {
  await withTestStripe(async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () => new Response(JSON.stringify({
      id: 'cs_test_release123', mode: 'payment', livemode: false, payment_status: 'paid',
      metadata: { plan_id: 'online-gold-8week', expected_amount_pence: '39999' },
      amount_total: 29999, currency: 'gbp',
    }), { status: 200, headers: { 'Content-Type': 'application/json' } })) as typeof fetch;
    try {
      const response = responseDouble();
      await handler({ method: 'GET', query: { session_id: 'cs_test_release123' } } as never, response as never);
      assert.equal(response.statusCode, 200);
      assert.deepEqual(response.body, { ok: true, status: 'review', planId: 'online-gold-8week', membership: 'pending_account_link' });
    } finally { globalThis.fetch = originalFetch; }
  });
});

test('checkout status rejects a session from the wrong Stripe mode', async () => {
  await withTestStripe(async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () => new Response(JSON.stringify({
      id: 'cs_live_release123',
      mode: 'payment',
      livemode: true,
      payment_status: 'paid',
      metadata: { plan_id: 'online-gold-8week' },
    }), { status: 200, headers: { 'Content-Type': 'application/json' } })) as typeof fetch;
    try {
      const response = responseDouble();
      await handler({ method: 'GET', query: { session_id: 'cs_live_release123' } } as never, response as never);
      assert.equal(response.statusCode, 404);
      assert.doesNotMatch(JSON.stringify(response.body), /paid/i);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

test('checkout status rejects malformed session IDs without calling Stripe', async () => {
  await withTestStripe(async () => {
    const originalFetch = globalThis.fetch;
    let called = false;
    globalThis.fetch = (async () => { called = true; return new Response('{}', { status: 200 }); }) as typeof fetch;
    try {
      const response = responseDouble();
      await handler({ method: 'GET', query: { session_id: 'not-a-session' } } as never, response as never);
      assert.equal(response.statusCode, 400);
      assert.equal(called, false);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
