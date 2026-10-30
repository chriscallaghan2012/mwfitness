import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

const root = process.cwd();

test('checkout mounts Stripe payment fields instead of fake disabled card inputs', () => {
  const screen = readFileSync(join(root, 'src', 'components', 'screens', 'CheckoutScreen.tsx'), 'utf8');
  assert.match(screen, /checkoutMountRef/);
  assert.match(screen, /Secure embedded Stripe payment/);
  assert.match(screen, /Preview mock checkout/);
  assert.match(screen, /No payment has been taken/);
  assert.match(screen, /no paid membership or account access has been activated/);
  assert.match(screen, /placeholder:text-zinc-400/);
  assert.ok(screen.includes(String.raw`if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))`));
  assert.match(screen, /createEmbeddedCheckoutPage\(\{ fetchClientSecret:/);
  assert.doesNotMatch(screen, /placeholder="Card number"/);
  assert.doesNotMatch(screen, /placeholder="MM \/ YY"/);
  assert.doesNotMatch(screen, /placeholder="CVC"/);
});

test('server creates embedded Checkout sessions and never returns a hosted redirect URL', () => {
  const stripe = readFileSync(join(root, 'api', '_stripe.mjs'), 'utf8');
  assert.match(stripe, /ui_mode: 'embedded_page'/);
  assert.match(stripe, /return_url:/);
  assert.match(stripe, /return \{ mode: 'stripe', clientSecret: data\.client_secret, publishableKey \}/);
  assert.doesNotMatch(stripe, /success_url:/);
  assert.doesNotMatch(stripe, /return \{ url: data\.url \}/);
});

test('checkout API distinguishes mock preview mode from real Stripe mode', () => {
  const client = readFileSync(join(root, 'src', 'lib', 'stripe.ts'), 'utf8');
  const server = readFileSync(join(root, 'api', '_stripe.mjs'), 'utf8');
  assert.match(client, /data\?\.mode === 'mock'/);
  assert.match(server, /if \(!secretKey && !publishableKey && !production\)/);
  assert.match(server, /if \(!secretKey && !publishableKey && production\)/);
  assert.match(server, /Preview and development require matching Stripe test keys/);
  assert.match(server, /price\.livemode !== livemode/);
});

test('checkout URL preserves selected package for direct visits and refreshes', () => {
  const app = readFileSync(join(root, 'src', 'App.tsx'), 'utf8');
  assert.match(app, /pushState\(\{\}, '', `\/checkout\?plan=\$\{encodeURIComponent\(plan\.id\)\}`\)/);
  assert.match(app, /const planId = params\.get\('plan'\)/);
});
