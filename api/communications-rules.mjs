import { neon } from '@neondatabase/serverless';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const supported = new Set(['website-enquiry-acknowledgement', 'consultation-confirmation', 'app-waitlist-acknowledgement']);
let db;
const getSql = () => {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured.');
  db ||= neon(process.env.DATABASE_URL);
  return db;
};
const parse = (body) => {
  if (typeof body !== 'string') return body || {};
  try { return JSON.parse(body); } catch { return null; }
};
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed.' });
  const header = req.headers && (req.headers.authorization || req.headers.Authorization);
  const match = typeof header === 'string' ? header.match(/^Bearer\s+(.+)$/i) : null;
  const token = match ? match[1] : '';
  let userId = '';
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8'));
    if (typeof payload.sub === 'string' && UUID.test(payload.sub)) userId = payload.sub;
  } catch {}
  if (!userId) return res.status(401).json({ ok: false, error: 'A valid staff session is required.' });
  const body = parse(req.body);
  if (!body || typeof body !== 'object' || typeof body.enabled !== 'boolean') return res.status(400).json({ ok: false, error: 'Choose whether to enable or disable the rule.' });
  const ruleKey = String(body.ruleKey || '');
  if (!supported.has(ruleKey)) return res.status(400).json({ ok: false, error: 'This trigger is not yet connected to a verified event handler and cannot be enabled.' });
  try {
    const base = process.env.NEON_DATA_API_URL || process.env.VITE_NEON_DATA_API_URL;
    if (!base) throw new Error('Neon Data API is not configured.');
    const url = new URL(base.replace(/\/$/, '') + '/profiles');
    url.searchParams.set('select', 'id,role');
    url.searchParams.set('id', 'eq.' + userId);
    url.searchParams.set('limit', '1');
    const response = await fetch(url, { headers: { Authorization: 'Bearer ' + token, Accept: 'application/json' } });
    if (!response.ok) throw new Error('Could not verify the staff session.');
    const rows = await response.json();
    if (!Array.isArray(rows) || !rows[0] || !['admin', 'coach'].includes(rows[0].role)) return res.status(403).json({ ok: false, error: 'Admin or coach access is required.' });
    const result = await getSql().query('update public.communication_automation_rules set enabled=$2,updated_by=$3,updated_at=now() where rule_key=$1 returning id,rule_key,enabled,updated_at', [ruleKey, body.enabled, userId]);
    if (!result.rows || !result.rows[0]) return res.status(404).json({ ok: false, error: 'Automation rule was not found. Check that the communications migration is applied.' });
    return res.status(200).json({ ok: true, rule: result.rows[0], note: 'This switch controls a website-form trigger only. Other app/scheduled triggers remain disabled until their event handlers are wired and tested.' });
  } catch (error) {
    return res.status(503).json({ ok: false, error: error instanceof Error ? error.message : 'Could not update the automation rule.' });
  }
}
