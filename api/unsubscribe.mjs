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
const page = (title, body) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} · MW Fitness</title></head><body style="margin:0;background:#121418;color:#f5f5f5;font:16px/1.6 system-ui;padding:48px 20px"><main style="max-width:560px;margin:auto"><p style="color:#ff5500;font-weight:700;letter-spacing:.15em">MW FITNESS</p>${body}</main></body></html>`;
export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).send('Method not allowed.');
  }
  const email = String(req.query?.email ?? req.body?.email ?? '').trim().toLowerCase();
  const token = String(req.query?.token ?? req.body?.token ?? '');
  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !validToken(email, token)) {
    return res.status(400).send('This unsubscribe link is invalid or has expired. Please contact MW Fitness for help.');
  }

  // GET must be read-only: mail security scanners often follow links automatically.
  // The explicit confirmation form submits the signed values by POST.
  if (req.method === 'GET') {
    const safeEmail = email.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    const safeToken = token.toLowerCase();
    return res.status(200).setHeader('Content-Type', 'text/html; charset=utf-8').send(page('Confirm unsubscribe', `<h1>Unsubscribe from marketing emails?</h1><p>Confirm that you no longer want MW Fitness marketing emails sent to <strong>${safeEmail}</strong>.</p><form method="post" action="/api/unsubscribe"><input type="hidden" name="email" value="${safeEmail}"><input type="hidden" name="token" value="${safeToken}"><button type="submit" style="background:#ff5500;color:#111;padding:12px 18px;border:0;border-radius:8px;font-weight:700;cursor:pointer">Confirm unsubscribe</button></form><p>Opening this page has not changed your preferences.</p>`));
  }

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
    return res.status(200).setHeader('Content-Type', 'text/html; charset=utf-8').send(page('You are unsubscribed', '<h1>You’re unsubscribed</h1><p>You will no longer receive MW Fitness marketing emails at this address. Essential service messages may still be sent where appropriate.</p>'));
  } catch {
    return res.status(503).send('We could not process your unsubscribe right now. Please try again later.');
  }
}
