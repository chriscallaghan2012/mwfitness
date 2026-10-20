import { createHmac } from 'node:crypto';
import { neon } from '@neondatabase/serverless';

let db;
const getSql = () => {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured.');
  db ||= neon(process.env.DATABASE_URL);
  return db;
};
const esc = (v) => String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const fill = (src, vars, html = false) => String(src || '').replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (_m, k) => html ? esc(vars[k]) : String(vars[k] == null ? '' : vars[k]));
const unsub = (email) => {
  if (!process.env.COMMUNICATIONS_UNSUBSCRIBE_SECRET || !process.env.PUBLIC_SITE_URL) return '';
  const token = createHmac('sha256', process.env.COMMUNICATIONS_UNSUBSCRIBE_SECRET).update(String(email).trim().toLowerCase()).digest('hex');
  return process.env.PUBLIC_SITE_URL.replace(/\/$/, '') + '/api/unsubscribe?email=' + encodeURIComponent(email) + '&token=' + token;
};
const wrap = (subject, preheader, html) => '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + esc(subject) + '</title></head><body style="margin:0;background:#f1f2f4;font:15px/1.65 Arial,sans-serif;color:#20242a"><div style="display:none;max-height:0;overflow:hidden">' + esc(preheader || subject) + '</div><table role="presentation" width="100%"><tr><td align="center" style="padding:24px 12px"><table role="presentation" width="600" style="max-width:600px;width:100%;background:#fff"><tr><td style="height:6px;background:#ff5500"></td></tr><tr><td style="padding:24px;background:#121418;color:#fff;font-size:22px;font-weight:bold">MW FITNESS <span style="color:#ff5500">UK</span></td></tr><tr><td style="padding:30px">' + html + '</td></tr><tr><td style="padding:20px 30px;background:#f8f8f8;color:#686d76;font-size:12px">MW Fitness UK · Online coaching and nutrition support.</td></tr></table></td></tr></table></body></html>';

export async function sendAutomaticTemplate({ templateKey, lead }) {
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) return { sent: false, reason: 'Resend API key and verified sender are not configured.' };
  const email = String(lead.email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { sent: false, reason: 'No valid recipient email.' };
  const database = getSql();
  const idem = 'website-lead:' + String(lead.id) + ':' + templateKey;
  const existing = await database.query('select id,status from public.communication_deliveries where idempotency_key=$1 limit 1', [idem]);
  if (existing.rows && existing.rows[0]) return { sent: existing.rows[0].status === 'accepted' || existing.rows[0].status === 'delivered', duplicate: true };
  const result = await database.query('select t.template_key,t.name,t.category,t.subject,t.preheader,t.html_body,t.text_body,t.enabled,t.version,r.enabled as rule_enabled from public.communication_templates t join public.communication_automation_rules r on r.template_key=t.template_key where t.template_key=$1 and t.channel=$2 limit 1', [templateKey, 'email']);
  const template = result.rows && result.rows[0];
  if (!template || !template.enabled || !template.rule_enabled) return { sent: false, reason: 'Automation template or matching rule is disabled.' };
  const variables = {
    name: lead.name || 'there', email, interest: lead.interest || '', message: lead.message || '',
    subject: template.subject, preheader: template.preheader, headline: template.name,
    admin_url: (process.env.PUBLIC_SITE_URL || '') + '/admin', app_url: process.env.PUBLIC_SITE_URL || '',
    unsubscribe_url: template.category === 'marketing' ? unsub(email) : '',
    cta_url: process.env.PUBLIC_SITE_URL || '', cta_label: 'Open MW Fitness', body: lead.message || '',
  };
  const subject = fill(template.subject, variables);
  const html = wrap(subject, fill(template.preheader, variables), fill(template.html_body, variables, true));
  const text = fill(template.text_body, variables) + (variables.unsubscribe_url ? '\n\nUnsubscribe: ' + variables.unsubscribe_url : '');
  const eventRows = await database.query('insert into public.communication_events (event_key,source,channel,category,template_key,template_version,subject,body_snapshot,audience_snapshot,status) values ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10) returning id', [idem, 'automation', 'email', template.category, template.template_key, template.version, subject, text, JSON.stringify({ email, kind: lead.kind }), 'processing']);
  const eventId = eventRows.rows && eventRows.rows[0] && eventRows.rows[0].id;
  if (!eventId) throw new Error('Could not record automatic email event.');
  const deliveryRows = await database.query('insert into public.communication_deliveries (event_id,recipient_email,recipient_name,status,provider,idempotency_key) values ($1,$2,$3,$4,$5,$6) on conflict (idempotency_key) do nothing returning id', [eventId, email, lead.name || '', 'queued', 'resend', idem]);
  if (!deliveryRows.rows || !deliveryRows.rows[0]) return { sent: false, duplicate: true };
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + process.env.RESEND_API_KEY, 'Content-Type': 'application/json', 'Idempotency-Key': idem },
      body: JSON.stringify({ from: process.env.RESEND_FROM_EMAIL, to: [email], reply_to: process.env.MAIL_TO || undefined, subject, html, text }),
    });
    const provider = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(provider.message || provider.error || 'Resend rejected the automatic email.');
    await database.query("update public.communication_deliveries set status='accepted',provider_message_id=$2,attempts=1,updated_at=now() where idempotency_key=$1", [idem, provider.id || '']);
    await database.query("update public.communication_events set status='accepted',completed_at=now() where id=$1", [eventId]);
    return { sent: true, messageId: provider.id || '' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown Resend error';
    await database.query("update public.communication_deliveries set status='failed',error_message=$2,attempts=1,updated_at=now() where idempotency_key=$1", [idem, message.slice(0,1000)]);
    await database.query("update public.communication_events set status='failed',completed_at=now() where id=$1", [eventId]);
    throw error;
  }
}
