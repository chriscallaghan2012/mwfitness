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
