import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { test } from 'node:test';
import handler, { verifyStripeSignature } from '../lib/stripe-webhook-handler.mjs';

function signatureFor(body: Buffer, secret: string, timestamp: number) {
  const digest = createHmac('sha256', secret).update(String(timestamp)).update('.').update(body).digest('hex');
  return `t=${timestamp},v1=${digest}`;
}

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

test('Stripe webhook signature verification accepts a valid, recent signature', () => {
  const body = Buffer.from('{"id":"evt_test","type":"ignored"}');
  const secret = 'whsec_release_test_secret';
  const timestamp = 1_800_000_000;
  assert.equal(verifyStripeSignature(body, signatureFor(body, secret, timestamp), secret, timestamp), true);
});

test('Stripe webhook signature verification rejects altered bodies and stale signatures', () => {
  const body = Buffer.from('{"id":"evt_test","type":"ignored"}');
  const altered = Buffer.from('{"id":"evt_other","type":"ignored"}');
  const secret = 'whsec_release_test_secret';
  const timestamp = 1_800_000_000;
  const signature = signatureFor(body, secret, timestamp);
  assert.equal(verifyStripeSignature(altered, signature, secret, timestamp), false);
  assert.equal(verifyStripeSignature(body, signature, secret, timestamp + 301), false);
  assert.equal(verifyStripeSignature(body, 't=not-a-number,v1=bad', secret, timestamp), false);
});

test('Stripe webhook rejects an invalid signature before attempting database work', async () => {
  const envKeys = ['VERCEL_ENV', 'NODE_ENV', 'STRIPE_SECRET_KEY', 'VITE_STRIPE_PUBLISHABLE_KEY', 'STRIPE_WEBHOOK_SECRET', 'DATABASE_URL'] as const;
  const previous = new Map(envKeys.map((key) => [key, process.env[key]]));
  try {
    process.env.VERCEL_ENV = 'preview';
    process.env.STRIPE_SECRET_KEY = 'sk_test_release_placeholder';
    process.env.VITE_STRIPE_PUBLISHABLE_KEY = 'pk_test_release_placeholder';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_release_test_secret';
    process.env.DATABASE_URL = 'postgresql://invalid:invalid@127.0.0.1:5432/not_used';
    const response = responseDouble();
    await handler({
      method: 'POST',
      body: Buffer.from('{"id":"evt_test","type":"checkout.session.completed","data":{"object":{}}}'),
      headers: { 'stripe-signature': 't=1800000000,v1=invalid' },
    } as never, response as never);
    assert.equal(response.statusCode, 400);
    assert.match(JSON.stringify(response.body), /signature/i);
  } finally {
    for (const [key, value] of previous) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});
