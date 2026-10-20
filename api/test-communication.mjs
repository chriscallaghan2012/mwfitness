import { neon } from '@neondatabase/serverless';
import nodemailer from 'nodemailer';
import { brandedEmail } from './_email-layout.mjs';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
let sqlClient;
const getSql = () => {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured.');
  sqlClient ??= neon(process.env.DATABASE_URL);
  return sqlClient;
};
function parseBody(body) {
  if (typeof body !== 'string') return body ?? {};
  try { return JSON.parse(body); } catch { return null; }
}
function bearerToken(req) {
  const header = req.headers?.authorization ?? req.headers?.Authorization;
  const match = typeof header === 'string' ? header.match(/^Bearer\s+(.+)$/i) : null;
  return match?.[1] ?? null;
}
function tokenSubject(token) {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8'));
    return typeof payload.sub === 'string' && UUID_PATTERN.test(payload.sub) ? payload.sub : null;
  } catch { return null; }
}
async function verifyStaff(token, userId) {
  const baseUrl = process.env.NEON_DATA_API_URL || process.env.VITE_NEON_DATA_API_URL;
  if (!baseUrl) throw new Error('Neon Data API is not configured.');
  const url = new URL(`${baseUrl.replace(/\/$/, '')}/profiles`);
  url.searchParams.set('select', 'id,email,full_name,role');
  url.searchParams.set('id', `eq.${userId}`);
  url.searchParams.set('limit', '1');
  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } });
  if (!response.ok) throw new Error('Could not verify the staff session.');
  const rows = await response.json();
  const profile = Array.isArray(rows) ? rows[0] : null;
  if (!profile) throw new Error('The staff profile is unavailable.');
  if (!['admin', 'coach'].includes(profile.role)) {
    const error = new Error('Admin or coach access is required.');
    error.statusCode = 403;
    throw error;
  }
  if (!profile.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) throw new Error('The staff account needs a valid email address for a test send.');
  return profile;
}
const escapeHtml = (value) => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
function render(template, variables) {
  const replace = (source) => String(source ?? '').replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (_match, key) => escapeHtml(variables[key] ?? ''));
  return { subject: replace(template.subject), html: replace(template.html_body), text: replace(template.text_body) };
}
function mailer() {
  const missing = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'].filter((key) => !process.env[key]);
  if (missing.length) throw new Error(`Email provider is not configured (${missing.join(', ')}).`);
  const port = Number(process.env.SMTP_PORT);
  return {
    transporter: nodemailer.createTransport({ host: process.env.SMTP_HOST, port, secure: port === 465, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } }),
    from: process.env.MAIL_FROM || `MWFitnessUK <${process.env.SMTP_USER}>`,
  };
}
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed.' });
  const token = bearerToken(req);
  const userId = token ? tokenSubject(token) : null;
  if (!userId) return res.status(401).json({ ok: false, error: 'A valid staff session is required.' });
  const body = parseBody(req.body);
  if (!body || typeof body !== 'object' || body.confirmTest !== true) return res.status(400).json({ ok: false, error: 'Explicit test-send confirmation is required.' });
  const templateKey = typeof body.templateKey === 'string' ? body.templateKey.trim() : '';
  if (!/^[a-z0-9][a-z0-9-]{1,80}$/.test(templateKey)) return res.status(400).json({ ok: false, error: 'Choose a valid template.' });
  let eventId = null;
  try {
    const staff = await verifyStaff(token, userId);
    const sql = getSql();
    const rows = await sql`
      select template_key, name, channel, category, subject, preheader, html_body, text_body, enabled, version
      from public.communication_templates where template_key = ${templateKey} limit 1
    `;
    const template = rows[0];
    if (!template || !template.enabled || template.channel !== 'email') return res.status(400).json({ ok: false, error: 'The selected template is missing, disabled or not an email template.' });
    const rendered = render(template, {
      name: staff.full_name || 'MW Fitness team',
      email: staff.email,
      subject: template.subject,
      preheader: template.preheader,
      headline: template.name,
      body: 'This is a test preview sent only to your own staff email address.',
      cta_label: 'Open MW Fitness',
      cta_url: process.env.PUBLIC_SITE_URL || '',
      app_url: process.env.PUBLIC_SITE_URL || '',
      admin_url: process.env.PUBLIC_SITE_URL || '',
      unsubscribe_url: '[unsubscribe URL is added for approved live marketing sends]',
      plan_name: 'Example plan',
      renewal_date: 'Example date',
      programme_name: 'Example programme',
      workout_name: 'Example workout',
      workout_time: 'Example time',
      billing_url: process.env.PUBLIC_SITE_URL || '',
    });
    const [event] = await sql`
      insert into public.communication_events
        (source, channel, category, template_key, template_version, subject, body_snapshot, audience_snapshot, status, created_by)
      values
        ('system', 'email', 'internal', ${template.template_key}, ${template.version}, ${rendered.subject},
         ${rendered.text}, ${JSON.stringify({ audience: 'staff-self-test', email: staff.email })}::jsonb,
         'processing', ${userId})
      returning id
    `;
    eventId = event.id;
    const [delivery] = await sql`
      insert into public.communication_deliveries
        (event_id, recipient_profile_id, recipient_email, recipient_name, status, provider, attempts, idempotency_key)
      values
        (${eventId}, ${userId}, ${staff.email}, ${staff.full_name || ''}, 'queued', 'smtp', 0, ${`test:${eventId}:${userId}`})
      returning id
    `;
    const { transporter, from } = mailer();
    const info = await transporter.sendMail({
      from, to: staff.email, subject: `[TEST] ${rendered.subject}`.slice(0, 180),
      html: brandedEmail({ subject: rendered.subject, preheader: template.preheader, bodyHtml: rendered.html, preview: true }), text: rendered.text,
      headers: { 'X-MWFitness-Test': 'true', 'X-MWFitness-Event-ID': String(eventId) },
    });
    await sql`
      update public.communication_deliveries set status = 'accepted',
        provider_message_id = ${String(info.messageId || '').slice(0, 500)},
        attempts = attempts + 1, updated_at = now() where id = ${delivery.id}
    `;
    await sql`update public.communication_events set status = 'accepted', completed_at = now() where id = ${eventId}`;
    return res.status(200).json({ ok: true, eventId, recipient: staff.email, note: 'SMTP accepted the test email for the signed-in staff member only. Inbox delivery is not guaranteed.' });
  } catch (error) {
    if (eventId) {
      try {
        const sql = getSql();
        await sql`update public.communication_events set status = 'failed', completed_at = now() where id = ${eventId}`;
      } catch { /* keep original error */ }
    }
    const status = Number.isInteger(error?.statusCode) ? error.statusCode : /DATABASE_URL|not configured|SMTP|Email provider/i.test(error?.message || '') ? 503 : 500;
    return res.status(status).json({ ok: false, error: status === 403 ? error.message : status === 503 ? error.message : 'Test email failed. Check staff access, migration and server mail configuration.' });
  }
}
