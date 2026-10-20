import { createHmac, timingSafeEqual } from 'node:crypto';
import { neon } from '@neondatabase/serverless';

let sqlClient;
const getSql = () => {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured.');
  sqlClient ??= neon(process.env.DATABASE_URL);
  return sqlClient;
};
const makeToken = (email) => createHmac('sha256', process.env.COMMUNICATIONS_UNSUBSCRIBE_SECRET).update(String(email).trim().toLowerCase()).digest('hex');
function validToken(email, token) {
  if (!process.env.COMMUNICATIONS_UNSUBSCRIBE_SECRET || !email || !token || !/^[a-f0-9]{64}$/i.test(token)) return false;
  const expected = Buffer.from(makeToken(email), 'hex');
  const actual = Buffer.from(token, 'hex');
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
export default async function handler(req, res) {
  const email = String(req.query?.email ?? req.body?.email ?? '').trim().toLowerCase();
  const token = String(req.query?.token ?? req.body?.token ?? '');
  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !validToken(email, token)) {
    return res.status(400).send('This unsubscribe link is invalid or has expired. Please contact MW Fitness for help.');
  }
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).send('Method not allowed.');
  try {
    const sql = getSql();
    await sql`
      insert into public.communication_marketing_preferences
        (email, marketing_email_consent, unsubscribed_at, suppression_reason, updated_at)
      values (${email}, false, now(), 'unsubscribe', now())
      on conflict (email) do update set
        marketing_email_consent = false,
        unsubscribed_at = now(),
        suppression_reason = 'unsubscribe',
        updated_at = now()
    `;
    if (req.method === 'GET') {
      return res.status(200).setHeader('Content-Type', 'text/html; charset=utf-8').send('<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Unsubscribed · MW Fitness</title></head><body style="margin:0;background:#121418;color:#f5f5f5;font:16px system-ui;padding:48px 20px"><main style="max-width:560px;margin:auto"><p style="color:#ff5500;font-weight:700">MW FITNESS</p><h1>You’re unsubscribed</h1><p>You will no longer receive MW Fitness marketing emails at this address. Essential service messages may still be sent where appropriate.</p></main></body></html>');
    }
    return res.status(200).json({ ok: true, unsubscribed: true });
  } catch {
    return res.status(503).send('We could not process your unsubscribe right now. Please try again later.');
  }
}
