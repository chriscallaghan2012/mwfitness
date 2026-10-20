import { createHmac } from 'node:crypto';
import { neon } from '@neondatabase/serverless';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
let db;
const sql = () => {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured.');
  db ||= neon(process.env.DATABASE_URL);
  return db;
};
const parse = (body) => {
  if (typeof body !== 'string') return body || {};
  try { return JSON.parse(body); } catch { return null; }
};
const escapeHtml = (value) => String(value == null ? '' : value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const render = (source, vars, html = false) => String(source || '').replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (_m, key) => html ? escapeHtml(vars[key] == null ? '' : vars[key]) : String(vars[key] == null ? '' : vars[key]));
const bearer = (req) => {
  const value = req.headers && (req.headers.authorization || req.headers.Authorization);
  const match = typeof value === 'string' ? value.match(/^Bearer\s+(.+)$/i) : null;
  return match ? match[1] : null;
};
const subject = (token) => {
  try {
    const p = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8'));
    return typeof p.sub === 'string' && UUID.test(p.sub) ? p.sub : null;
  } catch { return null; }
};
async function staffFor(token, id) {
  const base = process.env.NEON_DATA_API_URL || process.env.VITE_NEON_DATA_API_URL;
  if (!base) throw new Error('Neon Data API is not configured.');
  const url = new URL(base.replace(/\/$/, '') + '/profiles');
  url.searchParams.set('select', 'id,email,full_name,role');
  url.searchParams.set('id', 'eq.' + id);
  url.searchParams.set('limit', '1');
  const response = await fetch(url, { headers: { Authorization: 'Bearer ' + token, Accept: 'application/json' } });
  if (!response.ok) throw new Error('Could not verify the staff session.');
  const rows = await response.json();
  const profile = Array.isArray(rows) ? rows[0] : null;
  if (!profile || !['admin', 'coach'].includes(profile.role)) {
    const error = new Error('Admin or coach access is required.');
    error.statusCode = 403;
    throw error;
  }
  return profile;
}
async function resendEmail({ to, subject: title, html, text, key }) {
  if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY is not configured.');
  const from = process.env.RESEND_FROM_EMAIL;
  if (!from) throw new Error('RESEND_FROM_EMAIL must be set to a verified sender.');
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + process.env.RESEND_API_KEY, 'Content-Type': 'application/json', 'Idempotency-Key': key },
    body: JSON.stringify({ from, to: [to], subject: title, html, text })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || data.error || 'Resend rejected the message.');
  return data.id || '';
}
function unsubscribeUrl(email) {
  const secret = process.env.COMMUNICATIONS_UNSUBSCRIBE_SECRET;
  const base = process.env.PUBLIC_SITE_URL || '';
  if (!secret || !base) return '';
  const token = createHmac('sha256', secret).update(String(email).trim().toLowerCase()).digest('hex');
  return base.replace(/\/$/, '') + '/api/unsubscribe?email=' + encodeURIComponent(email) + '&token=' + token;
}
function branded(subject, preheader, body, unsubscribe) {
  const footer = unsubscribe ? '<p><a href="' + escapeHtml(unsubscribe) + '">Unsubscribe from marketing emails</a></p>' : '';
  return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + escapeHtml(subject) + '</title></head><body style="margin:0;background:#f1f2f4;font:15px/1.65 Arial,sans-serif;color:#20242a"><div style="display:none;max-height:0;overflow:hidden">' + escapeHtml(preheader || subject) + '</div><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px"><table role="presentation" width="600" style="max-width:600px;width:100%;background:#fff;border-radius:14px;overflow:hidden"><tr><td style="height:6px;background:#ff5500"></td></tr><tr><td style="padding:24px;background:#121418;color:#fff;font-size:22px;font-weight:bold">MW FITNESS <span style="color:#ff5500">UK</span></td></tr><tr><td style="padding:30px">' + body + '</td></tr><tr><td style="padding:20px 30px;background:#f8f8f8;color:#686d76;font-size:12px">MW Fitness UK · Online coaching and nutrition support.' + footer + '</td></tr></table></td></tr></table></body></html>';
}
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed.' });
  const token = bearer(req);
  const userId = token ? subject(token) : null;
  if (!userId) return res.status(401).json({ ok: false, error: 'A valid staff session is required.' });
  const body = parse(req.body);
  if (!body || typeof body !== 'object') return res.status(400).json({ ok: false, error: 'Invalid request body.' });
  try {
    const staff = await staffFor(token, userId);
    const database = sql();
    const templateKey = String(body.templateKey || '').trim();
    if (!/^[a-z0-9][a-z0-9-]{1,80}$/.test(templateKey)) return res.status(400).json({ ok: false, error: 'Choose a valid email template.' });
    const t = await database.query('select template_key,name,channel,category,subject,preheader,html_body,text_body,enabled,version from public.communication_templates where template_key=$1 limit 1', [templateKey]);
    const template = t.rows && t.rows[0];
    if (!template || !template.enabled || template.channel !== 'email') return res.status(400).json({ ok: false, error: 'The selected template is missing, disabled or not an email template.' });
    const audience = String(body.audience || 'individual');
    const isPreview = body.action === 'preview';
    const isTest = body.action === 'test';
    const isSend = body.action === 'send';
    if (!isPreview && !isTest && !isSend) return res.status(400).json({ ok: false, error: 'Choose preview, test or send.' });
    let recipients = [];
    if (isTest) {
      if (body.confirmTest !== true || !EMAIL.test(String(staff.email || ''))) return res.status(400).json({ ok: false, error: 'Confirm a test send and ensure your staff profile has a valid email.' });
      recipients = [{ id: staff.id, email: staff.email, full_name: staff.full_name || 'MW Fitness team' }];
    } else if (audience === 'individual') {
      const email = String(body.recipientEmail || '').trim().toLowerCase();
      const profileId = String(body.profileId || '');
      if (profileId && UUID.test(profileId)) {
        const p = await database.query('select id,email,full_name from public.profiles where id=$1 limit 1', [profileId]);
        if (p.rows && p.rows[0] && EMAIL.test(String(p.rows[0].email || ''))) recipients = [p.rows[0]];
      } else if (EMAIL.test(email)) {
        recipients = [{ id: null, email, full_name: String(body.recipientName || 'there').slice(0, 120) }];
      }
      if (!recipients.length) return res.status(400).json({ ok: false, error: 'Choose a member or enter a valid individual email address.' });
    } else if (audience === 'members' || audience === 'consented-marketing') {
      if (template.category === 'marketing' && audience !== 'consented-marketing') return res.status(400).json({ ok: false, error: 'Marketing templates may only target consented marketing subscribers.' });
      const p = await database.query(
        audience === 'consented-marketing'
          ? "select p.id,p.email,p.full_name from public.profiles p join public.communication_marketing_preferences m on lower(m.email)=lower(p.email) where p.role='athlete' and m.marketing_email_consent=true and m.unsubscribed_at is null and coalesce(m.suppression_reason,'')='' and p.email is not null order by p.id limit 251"
          : "select id,email,full_name from public.profiles where role='athlete' and email is not null order by id limit 251"
      );
      recipients = (p.rows || []).filter((row) => EMAIL.test(String(row.email || '')));
      if (recipients.length > 250) return res.status(400).json({ ok: false, error: 'This audience has more than 250 recipients. Narrow the audience and send in smaller reviewed batches.' });
    } else {
      return res.status(400).json({ ok: false, error: 'Choose an individual, member or consented-marketing audience.' });
    }
    if (template.category === 'marketing' && audience === 'individual' && !isTest) {
      const pref = await database.query('select marketing_email_consent,unsubscribed_at,suppression_reason from public.communication_marketing_preferences where lower(email)=lower($1) limit 1', [recipients[0].email]);
      const row = pref.rows && pref.rows[0];
      if (!row || !row.marketing_email_consent || row.unsubscribed_at || row.suppression_reason) return res.status(403).json({ ok: false, error: 'This address has no active marketing consent or is suppressed.' });
    }
    if (isPreview) return res.status(200).json({ ok: true, preview: true, recipientCount: recipients.length, template: { subject: template.subject, preheader: template.preheader, html: template.html_body, text: template.text_body } });
    if (isSend && (body.confirmSend !== true || Number(body.confirmCount) !== recipients.length)) return res.status(400).json({ ok: false, error: 'Send confirmation must include the exact current recipient count.' });
    if (isSend && recipients.length > 250) return res.status(400).json({ ok: false, error: 'Recipient limit exceeded.' });
    const eventRows = await database.query(
      'insert into public.communication_events (source,channel,category,template_key,template_version,subject,body_snapshot,audience_snapshot,status,created_by) values ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9,$10) returning id',
      [isTest ? 'system' : 'manual', 'email', template.category, template.template_key, template.version, template.subject, template.text_body, JSON.stringify({ audience, recipientCount: recipients.length, test: isTest }), 'processing', userId]
    );
    const eventId = eventRows.rows && eventRows.rows[0] && eventRows.rows[0].id;
    if (!eventId) throw new Error('Could not create the communications audit record.');
    let accepted = 0;
    let failed = 0;
    const failures = [];
    for (const recipient of recipients) {
      const email = String(recipient.email).trim().toLowerCase();
      const idem = String(eventId) + ':' + email;
      const insert = await database.query(
        'insert into public.communication_deliveries (event_id,recipient_profile_id,recipient_email,recipient_name,status,provider,idempotency_key) values ($1,$2,$3,$4,$5,$6,$7) on conflict (idempotency_key) do nothing returning id',
        [eventId, recipient.id || null, email, recipient.full_name || '', 'queued', 'resend', idem]
      );
      if (!insert.rows || !insert.rows.length) continue;
      const unsub = template.category === 'marketing' ? unsubscribeUrl(email) : '';
      const vars = { name: recipient.full_name || 'there', email, headline: template.name, body: template.text_body, subject: template.subject, preheader: template.preheader, app_url: process.env.PUBLIC_SITE_URL || '', admin_url: (process.env.PUBLIC_SITE_URL || '') + '/admin', unsubscribe_url: unsub, programme_name: '', workout_name: '', workout_time: '' };
      const htmlBody = render(template.html_body, vars, true);
      const textBody = render(template.text_body, vars) + (unsub ? '\n\nUnsubscribe: ' + unsub : '');
      try {
        const messageId = await resendEmail({ to: email, subject: render(template.subject, vars), html: branded(render(template.subject, vars), render(template.preheader, vars), htmlBody, unsub), text: textBody, key: idem });
        await database.query("update public.communication_deliveries set status='accepted',provider_message_id=$2,attempts=1,updated_at=now() where idempotency_key=$1", [idem, messageId]);
        accepted++;
      } catch (error) {
        failed++;
        const message = error instanceof Error ? error.message : 'Unknown Resend error';
        failures.push({ email, error: message.slice(0, 240) });
        await database.query("update public.communication_deliveries set status='failed',error_message=$2,attempts=1,updated_at=now() where idempotency_key=$1", [idem, message.slice(0, 1000)]);
      }
    }
    await database.query("update public.communication_events set status=$2,completed_at=now() where id=$1", [eventId, failed === 0 ? 'accepted' : accepted === 0 ? 'failed' : 'partial']);
    return res.status(failed ? 207 : 200).json({ ok: failed === 0, eventId, recipientCount: recipients.length, accepted, failed, failures: failures.slice(0, 10), note: isTest ? 'Test was sent only to the signed-in staff email.' : 'Accepted means Resend accepted the message; final delivery depends on provider events.' });
  } catch (error) {
    const status = error && error.statusCode ? error.statusCode : 500;
    return res.status(status).json({ ok: false, error: status === 500 ? (error instanceof Error ? error.message : 'Communications request failed.') : error.message });
  }
}
