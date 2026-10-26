import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

const root = process.cwd();

test('checkout mounts Stripe payment fields instead of fake disabled card inputs', () => {
  const screen = readFileSync(join(root, 'src', 'components', 'screens', 'CheckoutScreen.tsx'), 'utf8');
  assert.match(screen, /checkoutMountRef/);
  assert.match(screen, /Secure embedded Stripe payment/);
  assert.match(screen, /placeholder:text-zinc-400/);
  assert.doesNotMatch(screen, /placeholder="Card number"/);
  assert.doesNotMatch(screen, /placeholder="MM \/ YY"/);
  assert.doesNotMatch(screen, /placeholder="CVC"/);
});

test('server creates embedded Checkout sessions and never returns a hosted redirect URL', () => {
  const stripe = readFileSync(join(root, 'api', '_stripe.mjs'), 'utf8');
  assert.match(stripe, /ui_mode: 'embedded'/);
  assert.match(stripe, /return_url:/);
  assert.match(stripe, /return \{ clientSecret: data\.client_secret \}/);
  assert.doesNotMatch(stripe, /success_url:/);
  assert.doesNotMatch(stripe, /return \{ url: data\.url \}/);
});
