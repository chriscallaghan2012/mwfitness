import 'dotenv/config';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { neon } from '@neondatabase/serverless';
import { test } from 'node:test';
import plansHandler from '../api/plans.mjs';
import productsHandler from '../api/products.mjs';

// This suite deliberately requires a separate Neon test branch URL.
// It never falls back to DATABASE_URL, which may point at production.
const testDatabaseUrl = process.env.RELEASE_TEST_DATABASE_URL;
const skipReason = testDatabaseUrl
  ? false
  : 'Set RELEASE_TEST_DATABASE_URL to a disposable Neon test branch; production DATABASE_URL is never used.';

test('disposable Neon branch supports real insert/read/update/delete round-trip', { skip: skipReason }, async () => {
  assert.notEqual(testDatabaseUrl, process.env.DATABASE_URL, 'release integration tests must not use the production DATABASE_URL');
  if (process.env.DATABASE_URL) {
    assert.notEqual(
      new URL(testDatabaseUrl!).hostname,
      new URL(process.env.DATABASE_URL).hostname,
      'release integration tests must use a different Neon branch endpoint from production',
    );
  }
  const sql = neon(testDatabaseUrl!);
  await sql`CREATE TABLE IF NOT EXISTS mwfitness_release_test_records (
    id text PRIMARY KEY,
    label text NOT NULL,
    updated_at timestamptz NOT NULL DEFAULT now()
  )`;

  const id = randomUUID();
  try {
    const inserted = await sql`INSERT INTO mwfitness_release_test_records (id, label)
      VALUES (${id}, 'created')
      RETURNING id, label`;
    assert.equal(inserted.length, 1);
    assert.equal(inserted[0].label, 'created');

    const read = await sql`SELECT id, label FROM mwfitness_release_test_records WHERE id = ${id}`;
    assert.equal(read.length, 1);
    assert.equal(read[0].label, 'created');

    const updated = await sql`UPDATE mwfitness_release_test_records
      SET label = 'updated', updated_at = now()
      WHERE id = ${id}
      RETURNING id, label`;
    assert.equal(updated.length, 1);
    assert.equal(updated[0].label, 'updated');

    const deleted = await sql`DELETE FROM mwfitness_release_test_records WHERE id = ${id} RETURNING id`;
    assert.equal(deleted.length, 1);
    const afterDelete = await sql`SELECT id FROM mwfitness_release_test_records WHERE id = ${id}`;
    assert.equal(afterDelete.length, 0);
  } finally {
    await sql`DELETE FROM mwfitness_release_test_records WHERE id = ${id}`;
  }
});


function responseDouble() {
  return {
    statusCode: 200,
    headers: {} as Record<string, string>,
    body: undefined as unknown,
    setHeader(name: string, value: string) { this.headers[name] = value; return this; },
    status(code: number) { this.statusCode = code; return this; },
    json(body: unknown) { this.body = body; return this; },
  };
}

test('public pricing and product APIs read real rows from the disposable Neon branch', { skip: skipReason }, async () => {
  const previousDatabaseUrl = process.env.DATABASE_URL;
  process.env.DATABASE_URL = testDatabaseUrl!;
  try {
    const pricingResponse = responseDouble();
    await plansHandler({ method: 'GET', query: { kind: 'online' }, url: '/api/plans?kind=online' } as never, pricingResponse as never);
    assert.equal(pricingResponse.statusCode, 200);
    const pricing = pricingResponse.body as { plans?: Array<Record<string, unknown>> };
    assert.ok(Array.isArray(pricing.plans) && pricing.plans.length > 0, 'test branch should have active online coaching plans');
    for (const plan of pricing.plans ?? []) {
      assert.equal(plan.kind, 'online');
      assert.equal(typeof plan.id, 'string');
      assert.equal(typeof plan.name, 'string');
      assert.equal(typeof plan.price, 'number');
      assert.ok(!('stripe_price_id' in plan), 'public pricing must not expose Stripe Price IDs');
    }

    const productsResponse = responseDouble();
    await productsHandler({ method: 'GET', query: {}, url: '/api/products' } as never, productsResponse as never);
    assert.equal(productsResponse.statusCode, 200);
    const products = productsResponse.body as { products?: Array<Record<string, unknown>> };
    assert.ok(Array.isArray(products.products), 'product endpoint should return a products array');
    for (const product of products.products ?? []) {
      assert.equal(typeof product.id, 'string');
      assert.equal(typeof product.name, 'string');
      assert.equal(typeof product.price, 'number');
      assert.ok(!('stripe_price_id' in product), 'public products must not expose payment identifiers');
    }
  } finally {
    if (previousDatabaseUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = previousDatabaseUrl;
  }
});
