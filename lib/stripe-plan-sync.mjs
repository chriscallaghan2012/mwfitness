import { neon } from '@neondatabase/serverless';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PLAN_ID = /^[a-z0-9][a-z0-9-]{1,79}$/;
const STAFF_ROLES = new Set(['admin']);

function tokenFrom(req) {
  const value = req.headers?.authorization || req.headers?.Authorization;
  const match = typeof value === 'string' ? value.match(/^Bearer\s+(.+)$/i) : null;
  return match ? match[1] : '';
}

function tokenSub(token) {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8'));
    return typeof payload.sub === 'string' && UUID.test(payload.sub) ? payload.sub : '';
  } catch {
    return '';
  }
}

function parseBody(body) {
  if (body && typeof body === 'object' && !Buffer.isBuffer(body)) return body;
  if (typeof body === 'string') {
    try { return JSON.parse(body); } catch { return null; }
  }
  return null;
}

export function validatePlanPayload(body) {
  if (!body || typeof body !== 'object') return { error: 'Invalid plan payload.' };
  const id = typeof body.id === 'string' ? body.id.trim() : '';
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const kind = body.kind === 'online' ? 'online' : body.kind === 'pt' ? 'pt' : '';
  const price = Number(body.price);
  if (!PLAN_ID.test(id)) return { error: 'Plan ID must use lowercase letters, numbers and hyphens (2–80 characters).' };
  if (!name || name.length > 160) return { error: 'Enter a package name (maximum 160 characters).' };
  if (!kind) return { error: 'Choose a valid plan type.' };
  if (!Number.isFinite(price) || price < 0 || Math.round(price * 100) !== price * 100) return { error: 'Enter a valid price with no more than two decimal places.' };
  if (kind === 'online' && price <= 0) return { error: 'Online coaching plans must have a price greater than £0.' };
  const originalPrice = body.original_price == null || body.original_price === '' ? null : Number(body.original_price);
  if (originalPrice !== null && (!Number.isFinite(originalPrice) || originalPrice < 0 || Math.round(originalPrice * 100) !== originalPrice * 100)) {
    return { error: 'Original price must be a valid amount with no more than two decimal places.' };
  }
  const features = Array.isArray(body.features)
    ? body.features.filter((value) => typeof value === 'string').map((value) => value.trim()).filter(Boolean).slice(0, 50)
    : [];
  return {
    value: {
      id, name, kind, price, original_price: originalPrice,
      tag: typeof body.tag === 'string' ? body.tag.trim().slice(0, 160) || null : null,
      badge: typeof body.badge === 'string' ? body.badge.trim().slice(0, 100) || null : null,
      is_popular: body.is_popular === true,
      description: typeof body.description === 'string' ? body.description.trim().slice(0, 2000) : '',
      cta_text: typeof body.cta_text === 'string' ? body.cta_text.trim().slice(0, 100) : '',
      features,
      active: body.active === true,
    },
  };
}

async function verifyPlatformAdmin(token, userId) {
  const base = process.env.NEON_DATA_API_URL || process.env.VITE_NEON_DATA_API_URL;
  if (!base) throw Object.assign(new Error('Neon Data API is not configured.'), { statusCode: 503 });
  const url = new URL(base.replace(/\/$/, '') + '/profiles');
  url.searchParams.set('select', 'id,role');
  url.searchParams.set('id', 'eq.' + userId);
  url.searchParams.set('limit', '1');
  // The Neon Data API validates the bearer token; decoding JWT claims alone is not authentication.
  const response = await fetch(url, { headers: { Authorization: 'Bearer ' + token, Accept: 'application/json' } });
  if (!response.ok) throw Object.assign(new Error('Could not verify the staff session.'), { statusCode: 401 });
  const rows = await response.json();
  if (!Array.isArray(rows) || !rows[0] || !STAFF_ROLES.has(rows[0].role)) {
    throw Object.assign(new Error('Platform-admin access is required to sync coaching plans with Stripe.'), { statusCode: 403 });
  }
}

async function stripeRequest(secretKey, path, { method = 'GET', params, idempotencyKey } = {}) {
  const headers = { Authorization: 'Bearer ' + secretKey };
  const options = { method, headers };
  if (params) {
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
    options.body = params instanceof URLSearchParams ? params : new URLSearchParams(params);
  }
  if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;
  const response = await fetch('https://api.stripe.com/v1/' + path, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.error?.message || 'Stripe rejected the product sync request.';
    throw Object.assign(new Error(message), { statusCode: response.status === 429 ? 503 : 502 });
  }
  return data;
}

async function archiveStripePlan(secretKey, plan, planId) {
  let productId = typeof plan?.stripe_product_id === 'string' ? plan.stripe_product_id : '';
  let priceId = typeof plan?.stripe_price_id === 'string' ? plan.stripe_price_id : '';
  if (!productId && priceId) {
    const price = await stripeRequest(secretKey, 'prices/' + encodeURIComponent(priceId));
    productId = typeof price.product === 'string' ? price.product : price.product?.id || '';
  }
  if (priceId) {
    try {
      const current = await stripeRequest(secretKey, 'prices/' + encodeURIComponent(priceId));
      if (current.active) await stripeRequest(secretKey, 'prices/' + encodeURIComponent(priceId), { method: 'POST', params: { active: 'false' } });
    } catch (error) {
      // A missing price may be a stale mapping; keep going only for an explicit Stripe 404.
      if (error?.statusCode !== 404) throw error;
    }
  }
  if (productId) {
    await stripeRequest(secretKey, 'products/' + encodeURIComponent(productId), {
      method: 'POST',
      params: { active: 'false', 'metadata[plan_id]': planId },
    });
  }
}

async function syncStripePlan(secretKey, plan, previous) {
  const planId = plan.id;
  let productId = typeof previous?.stripe_product_id === 'string' ? previous.stripe_product_id : '';
  let currentPriceId = typeof previous?.stripe_price_id === 'string' ? previous.stripe_price_id : '';
  let currentPrice = null;

  if (!productId && currentPriceId) {
    currentPrice = await stripeRequest(secretKey, 'prices/' + encodeURIComponent(currentPriceId));
    productId = typeof currentPrice.product === 'string' ? currentPrice.product : currentPrice.product?.id || '';
    if (!productId) throw Object.assign(new Error('The existing Stripe Price is not linked to a valid Product. Check the Stripe mapping before saving.'), { statusCode: 409 });
  }

  if (productId) {
    await stripeRequest(secretKey, 'products/' + encodeURIComponent(productId), {
      method: 'POST',
      params: {
        name: plan.name,
        description: plan.description || '',
        active: String(plan.kind === 'online' && plan.active),
        'metadata[plan_id]': planId,
        'metadata[managed_by]': 'mwfitness-staff-hq',
      },
    });
  } else if (plan.kind === 'online') {
    const product = await stripeRequest(secretKey, 'products', {
      method: 'POST',
      params: {
        name: plan.name,
        description: plan.description || '',
        active: String(plan.active),
        'metadata[plan_id]': planId,
        'metadata[managed_by]': 'mwfitness-staff-hq',
      },
      idempotencyKey: 'mwfitness-plan-product-' + planId,
    });
    productId = product.id;
  }

  if (plan.kind !== 'online') {
    await archiveStripePlan(secretKey, { stripe_product_id: productId, stripe_price_id: currentPriceId }, planId);
    return { stripe_product_id: productId || previous?.stripe_product_id || null, stripe_price_id: currentPriceId || previous?.stripe_price_id || null };
  }

  const amount = Math.round(plan.price * 100);
  if (!currentPrice && currentPriceId) {
    currentPrice = await stripeRequest(secretKey, 'prices/' + encodeURIComponent(currentPriceId));
  }
  const needsNewPrice = !currentPriceId || !currentPrice || !currentPrice.active
    || currentPrice.currency !== 'gbp' || currentPrice.unit_amount !== amount;
  let priceId = currentPriceId;
  if (needsNewPrice) {
    const price = await stripeRequest(secretKey, 'prices', {
      method: 'POST',
      params: {
        product: productId,
        currency: 'gbp',
        unit_amount: String(amount),
        active: 'true',
        'metadata[plan_id]': planId,
        'metadata[managed_by]': 'mwfitness-staff-hq',
      },
      idempotencyKey: 'mwfitness-plan-price-' + planId + '-' + amount,
    });
    priceId = price.id;
    if (currentPriceId && currentPrice?.active) {
      await stripeRequest(secretKey, 'prices/' + encodeURIComponent(currentPriceId), { method: 'POST', params: { active: 'false' } });
    }
  }

  if (!plan.active) {
    if (priceId) await stripeRequest(secretKey, 'prices/' + encodeURIComponent(priceId), { method: 'POST', params: { active: 'false' } });
    await stripeRequest(secretKey, 'products/' + encodeURIComponent(productId), { method: 'POST', params: { active: 'false' } });
  } else {
    await stripeRequest(secretKey, 'products/' + encodeURIComponent(productId), {
      method: 'POST',
      params: { active: 'true', default_price: priceId },
    });
  }
  return { stripe_product_id: productId, stripe_price_id: priceId };
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed.' });
  }

  const token = tokenFrom(req);
  const userId = tokenSub(token);
  if (!userId) return res.status(401).json({ ok: false, error: 'A valid staff session is required.' });
  const body = parseBody(req.body);
  const parsed = validatePlanPayload(body?.plan);
  if (parsed.error) return res.status(400).json({ ok: false, error: parsed.error });
  const plan = parsed.value;
  const action = body?.action === 'archive' ? 'archive' : 'save';

  try {
    await verifyPlatformAdmin(token, userId);
    if (!process.env.DATABASE_URL) throw Object.assign(new Error('DATABASE_URL is not configured.'), { statusCode: 503 });
    const secretKey = process.env.STRIPE_SECRET_KEY;
    const publishableKey = process.env.VITE_STRIPE_PUBLISHABLE_KEY;
    const production = process.env.VERCEL_ENV ? process.env.VERCEL_ENV === 'production' : process.env.NODE_ENV === 'production';
    const expectedSecretPrefix = production ? ['sk_live_', 'rk_live_'] : ['sk_test_', 'rk_test_'];
    if (!secretKey || !publishableKey || !expectedSecretPrefix.some((prefix) => secretKey.startsWith(prefix))
      || !publishableKey.startsWith(production ? 'pk_live_' : 'pk_test_')) {
      throw Object.assign(new Error(production
        ? 'Live Stripe keys are missing or do not match production. Add the live secret and publishable keys to Vercel Production.'
        : 'Stripe plan sync is disabled in Preview until matching Stripe test keys are configured. Live keys are never used in Preview.'), { statusCode: 503 });
    }

    const sql = neon(process.env.DATABASE_URL);
    const existingRows = await sql`SELECT id, name, price, kind, active, stripe_product_id, stripe_price_id FROM public.plans WHERE id = ${plan.id} LIMIT 1`;
    const existing = existingRows[0] || null;
    if (body.action === 'archive' && !existing) return res.status(404).json({ ok: false, error: 'Plan was not found.' });
    if (body.action !== 'archive' && existing && body.isCreate === true) return res.status(409).json({ ok: false, error: 'That plan ID already exists. Refresh the list and edit the existing plan instead.' });
    if (body.action !== 'archive' && !existing && body.isCreate !== true) return res.status(404).json({ ok: false, error: 'Plan was not found. Refresh Staff HQ and try again.' });

    if (body.action === 'archive') {
      if (existing.kind === 'online') await archiveStripePlan(secretKey, existing, existing.id);
      const updated = await sql`UPDATE public.plans SET active = false, updated_at = now() WHERE id = ${existing.id} RETURNING id`;
      if (!updated.length) return res.status(409).json({ ok: false, error: 'Stripe was updated, but the plan could not be archived in Neon. Refresh and retry; do not create a duplicate plan.' });
      return res.status(200).json({ ok: true, action: 'archived', planId: existing.id, message: 'Plan archived. Existing payment history and Stripe records were retained.' });
    }

    const wasOnline = existing?.kind === 'online';
    let stripeMapping = {
      stripe_product_id: existing?.stripe_product_id || null,
      stripe_price_id: existing?.stripe_price_id || null,
    };
    if (plan.kind === 'online' || wasOnline) {
      stripeMapping = await syncStripePlan(secretKey, plan, existing);
    }

    let saved;
    if (existing) {
      saved = await sql`UPDATE public.plans SET
        name = ${plan.name}, tag = ${plan.tag}, price = ${plan.price}, original_price = ${plan.original_price},
        badge = ${plan.badge}, is_popular = ${plan.is_popular}, description = ${plan.description},
        features = ${JSON.stringify(plan.features)}::jsonb, cta_text = ${plan.cta_text}, kind = ${plan.kind},
        active = ${plan.active}, stripe_product_id = ${stripeMapping.stripe_product_id}, stripe_price_id = ${stripeMapping.stripe_price_id}
        WHERE id = ${plan.id} RETURNING id`;
    } else {
      saved = await sql`INSERT INTO public.plans
        (id,name,tag,price,original_price,badge,is_popular,description,features,cta_text,kind,active,stripe_product_id,stripe_price_id)
        VALUES (${plan.id},${plan.name},${plan.tag},${plan.price},${plan.original_price},${plan.badge},${plan.is_popular},${plan.description},${JSON.stringify(plan.features)}::jsonb,${plan.cta_text},${plan.kind},${plan.active},${stripeMapping.stripe_product_id},${stripeMapping.stripe_price_id}) RETURNING id`;
    }
    if (!saved.length) return res.status(409).json({ ok: false, error: 'Stripe sync finished but Neon did not save the plan. Refresh and retry; the operation is safe to retry.' });
    return res.status(200).json({
      ok: true,
      action: existing ? 'updated' : 'created',
      planId: plan.id,
      stripe: plan.kind === 'online' ? { synced: true, productId: stripeMapping.stripe_product_id, priceId: stripeMapping.stripe_price_id } : { synced: false, archived: wasOnline },
    });
  } catch (error) {
    const status = error?.statusCode || 503;
    console.error('[MW Fitness] Stripe plan sync failed:', error instanceof Error ? error.message : 'Unknown error');
    return res.status(status).json({ ok: false, error: error instanceof Error ? error.message : 'Stripe sync failed. No success was reported.' });
  }
}
