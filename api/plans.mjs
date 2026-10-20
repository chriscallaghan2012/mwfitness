import { neon } from '@neondatabase/serverless';

/** Public read-only pricing endpoint backed by the shared Neon database connection.
 * Only active public catalogue fields are returned; Stripe IDs and admin fields stay server-side.
 */
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const url = new URL(req.url || '/', 'https://mwfitnessuk.com');
  const kind = req.query?.kind || url.searchParams.get('kind');
  if (kind !== 'pt' && kind !== 'online') {
    return res.status(400).json({ error: 'Choose a valid pricing category.' });
  }
  if (!process.env.DATABASE_URL) {
    return res.status(503).json({ error: 'Pricing is temporarily unavailable.' });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    const rows = await sql`
      SELECT id, name, tag, price, original_price, badge, is_popular,
             description, features, cta_text, kind
      FROM public.plans
      WHERE active = true AND kind = ${kind}
      ORDER BY price ASC
    `;
    return res.status(200).json({
      plans: rows.map((row) => ({
        ...row,
        price: Number(row.price),
        original_price: row.original_price == null ? null : Number(row.original_price),
        is_popular: Boolean(row.is_popular),
        tag: row.tag ?? '',
        badge: row.badge ?? null,
        description: row.description ?? '',
        features: Array.isArray(row.features) ? row.features.filter((feature) => typeof feature === 'string') : [],
        cta_text: row.cta_text || 'Get started',
        kind,
      })),
    });
  } catch (error) {
    console.error('[MW Fitness] Public pricing query failed:', error instanceof Error ? error.message : 'Unknown Neon query error');
    return res.status(503).json({ error: 'Pricing is temporarily unavailable. Please contact Mike for current options.' });
  }
}
