import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeProductRows } from '../api/products.mjs';

test('normalizes rows returned by the Neon serverless query function', () => {
  const products = normalizeProductRows([
    {
      id: 'product-1',
      slug: 'classic-shirt',
      name: 'Classic SHWAG T-Shirt',
      price: '0.00',
      compare_at_price: null,
      sizes: ['S', 'M', 'L'],
    },
  ]);

  assert.equal(products.length, 1);
  assert.equal(products[0].name, 'Classic SHWAG T-Shirt');
  assert.equal(products[0].price, 0);
  assert.equal(products[0].compare_at_price, null);
  assert.deepEqual(products[0].sizes, ['S', 'M', 'L']);
});

test('normalizes missing optional sizes to an empty array', () => {
  const [product] = normalizeProductRows([{ id: 'product-2', price: '12.50' }]);
  assert.deepEqual(product.sizes, []);
  assert.equal(product.price, 12.5);
});

test('returns an empty catalogue only when the query result is not an array or has no rows', () => {
  assert.deepEqual(normalizeProductRows([]), []);
  assert.deepEqual(normalizeProductRows(undefined), []);
  assert.deepEqual(normalizeProductRows({ rows: [{ id: 'product-3' }] }), []);
});
