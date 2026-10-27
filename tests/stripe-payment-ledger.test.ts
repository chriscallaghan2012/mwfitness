import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

const root = process.cwd();

test('payment ledger migration limits reads to platform admins and prevents browser writes', () => {
  const migration = readFileSync(join(root, 'db', 'migrations', '20261026_stripe_payment_records.sql'), 'utf8');
  assert.match(migration, /stripe_session_id text NOT NULL UNIQUE/i);
  assert.match(migration, /ALTER TABLE public\.stripe_payment_records ENABLE ROW LEVEL SECURITY/i);
  assert.match(migration, /REVOKE ALL ON TABLE public\.stripe_payment_records FROM anon/i);
  assert.match(migration, /GRANT SELECT ON TABLE public\.stripe_payment_records TO authenticated/i);
  assert.match(migration, /USING \(public\.is_platform_admin\(\)\)/i);
  assert.doesNotMatch(migration, /GRANT (INSERT|UPDATE|DELETE|ALL).*stripe_payment_records TO authenticated/i);
});

test('real Stripe checkout stays blocked until the signed payment ledger is enabled', () => {
  const checkout = readFileSync(join(root, 'api', 'create-checkout.mjs'), 'utf8');
  const health = readFileSync(join(root, 'api', 'health.mjs'), 'utf8');
  assert.match(checkout, /STRIPE_PAYMENT_LEDGER_ENABLED !== 'true'/);
  assert.match(checkout, /!process\.env\.STRIPE_WEBHOOK_SECRET/);
  assert.match(health, /STRIPE_PAYMENT_LEDGER_ENABLED === 'true'/);
  assert.match(health, /STRIPE_WEBHOOK_SECRET/);
});

test('webhook stores paid sessions idempotently without granting membership', () => {
  const webhook = readFileSync(join(root, 'api', 'stripe-webhook.mjs'), 'utf8');
  assert.match(webhook, /verifyStripeSignature/);
  assert.match(webhook, /Math\.abs\(nowSeconds - timestamp\) > 300/);
  assert.match(webhook, /ON CONFLICT \(stripe_session_id\) DO UPDATE/);
  assert.match(webhook, /pending_account_link/);
  assert.match(webhook, /membership: 'not_activated'/);
  assert.match(webhook, /Partial or unverified refund requires staff review/);
});

test('Staff HQ exposes a read-only payment ledger and never reads it in demo mode', () => {
  const screen = readFileSync(join(root, 'src', 'components', 'admin', 'PaymentsAdmin.tsx'), 'utf8');
  const admin = readFileSync(join(root, 'src', 'components', 'admin', 'AdminScreen.tsx'), 'utf8');
  assert.match(screen, /isDemoMode\(\)/);
  assert.match(screen, /stripe_payment_records/);
  assert.match(screen, /does not grant coaching access automatically/);
  assert.match(admin, /<PaymentsAdmin \/>/);
});


test('Stripe webhook passes the resolved environment mode to the event recorder', () => {
  const webhook = readFileSync(join(root, 'api', 'stripe-webhook.mjs'), 'utf8');
  assert.match(webhook, /const config = resolveCheckoutMode\(\)/);
  assert.match(webhook, /recordStripeEvent\(event, res, config\.livemode\)/);
  assert.doesNotMatch(webhook, /recordStripeEvent\(event, res, configuration\.livemode\)/);
});

test('self-hosted server preserves raw Stripe webhook bytes and exposes payment status', () => {
  const server = readFileSync(join(root, 'server.mjs'), 'utf8');
  const rawWebhookRoute = server.indexOf("app.post('/api/stripe-webhook', express.raw(");
  const jsonParser = server.indexOf('app.use(express.json(');
  assert.notEqual(rawWebhookRoute, -1, 'self-hosted Stripe webhook route must exist');
  assert.ok(rawWebhookRoute < jsonParser, 'raw-body webhook route must be registered before JSON parsing');
  assert.match(server, /app.get\('\/api\/checkout-status', checkoutStatus\)/);
});
