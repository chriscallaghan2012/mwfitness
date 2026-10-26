import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import plansHandler from '../api/plans.mjs';
import productsHandler from '../api/products.mjs';

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

test('public pricing endpoint rejects unsupported methods and invalid categories', async () => {
  const oldUrl = process.env.DATABASE_URL;
  delete process.env.DATABASE_URL;
  try {
    const methodResponse = responseDouble();
    await plansHandler({ method: 'POST', query: {} } as never, methodResponse as never);
    assert.equal(methodResponse.statusCode, 405);
    assert.equal(methodResponse.headers.Allow, 'GET');

    const categoryResponse = responseDouble();
    await plansHandler({ method: 'GET', query: {} } as never, categoryResponse as never);
    assert.equal(categoryResponse.statusCode, 400);
  } finally {
    if (oldUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = oldUrl;
  }
});

test('public pricing and product endpoints fail closed when server database config is missing', async () => {
  const oldUrl = process.env.DATABASE_URL;
  delete process.env.DATABASE_URL;
  try {
    const pricingResponse = responseDouble();
    await plansHandler({ method: 'GET', query: { kind: 'pt' } } as never, pricingResponse as never);
    assert.equal(pricingResponse.statusCode, 503);

    const productResponse = responseDouble();
    await productsHandler({ method: 'GET', query: {} } as never, productResponse as never);
    assert.equal(productResponse.statusCode, 503);
  } finally {
    if (oldUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = oldUrl;
  }
});

test('local Express server mounts the public pricing and product handlers', () => {
  const server = readFileSync(join(process.cwd(), 'server.mjs'), 'utf8');
  assert.match(server, /app\.get\('\/api\/plans',\s*plans\)/);
  assert.match(server, /app\.get\('\/api\/products',\s*products\)/);
});
