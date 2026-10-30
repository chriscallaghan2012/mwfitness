import { neon } from '@neondatabase/serverless';

export function normalizeProductRows(rows) {
  if (!Array.isArray(rows)) return [];
  return rows.map((row) => ({
    ...row,
    price: Number(row.price),
    compare_at_price: row.compare_at_price == null ? null : Number(row.compare_at_price),
    sizes: Array.isArray(row.sizes) ? row.sizes : [],
  }));
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed.' });
  }
  if (!process.env.DATABASE_URL) return res.status(503).json({ error: 'Product catalogue is temporarily unavailable.' });
  try {
    const sql = neon(process.env.DATABASE_URL);
    // Neon serverless returns rows as an array by default. Do not read rows.rows
    // unless fullResults: true is explicitly enabled.
    const rows = await sql.query("select id,slug,name,description,category,price,compare_at_price,image_url,product_url,sizes,stock_status from public.swag_products where active=true order by sort_order,name");
    return res.status(200).json({ products: normalizeProductRows(rows) });
  } catch (error) {
    console.error('[MW Fitness] Swag catalogue query failed:', error instanceof Error ? error.message : 'Unknown Neon query error');
    return res.status(503).json({ error: 'Product catalogue is not available yet. Please try again later.' });
  }
}
