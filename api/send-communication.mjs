import { neon } from '@neondatabase/serverless';
import nodemailer from 'nodemailer';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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
  return profile;
}
const escapeHtml = (value) => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
function renderTemplate(template, variables) {
  const replace = (source) => String(source ?? '').replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (_match, key) => escapeHtml(variables[key] ?? ''));
  return { subject: replace(template.subject), html: replace(template.html_body), text: replace(template.text_body) };
}
function getTransport() {
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
  if (!token) return res.status(401).json({ ok: false, error: 'Authentication is required.' });
  const userId = tokenSubject(token);
  if (!userId) return res.status(401).json({ ok: false, error: 'The session token is invalid or expired.' });
  const body = parseBody(req.body);
  if (!body || typeof body !== 'object') return res.status(400).json({ ok: false, error: 'Invalid JSON body.' });
  if (body.confirmSend !== true) return res.status(400).json({ ok: false, error: 'Explicit send confirmation is required.' });
  const templateKey = typeof body.templateKey === 'string' ? body.templateKey.trim() : '';
  const audience = body.audience === 'all-members' ? 'all-members' : '';
  if (!/^[a-z0-9][a-z0-9-]{1,80}$/.test(templateKey) || !audience) {
    return res.status(400).json({ ok: false, error: 'Choose a valid template and supported audience.' });
  }

  let eventId;
  try {
    const staff = await verifyStaff(token, userId);
    const sql = getSql();
    const templates = await sql`
      select id, template_key, name, channel, category, subject, preheader, html_body, text_body, enabled, version
      from public.communication_templates where template_key = ${templateKey} limit 1
    `;
    const template = templates[0];
    if (!template || !template.enabled || template.channel !== 'email') {
      return res.status(400).json({ ok: false, error: 'This email template is missing, disabled, or not an email template.' });
    }
    // Marketing delivery is deliberately blocked until signed unsubscribe links and the public
    // suppression endpoint are available; a consent flag alone is not a complete opt-out system.
    if (template.category === 'marketing') {
      return res.status(409).json({ ok: false, error: 'Marketing broadcasts remain locked until unsubscribe and suppression handling are deployed and tested.' });
    }
    if (!['transactional', 'service', 'internal'].includes(template.category)) {
      return res.status(400).json({ ok: false, error: 'Unsupported email category.' });
    }
    const recipients = await sql`
      select id as profile_id, email, coalesce(full_name, '') as full_name
      from public.profiles
      where role = 'athlete' and email is not null and trim(email) <> ''
      order by id
      limit 500
    `;
    const validRecipients = recipients.filter((row) => EMAIL_RE.test(String(row.email ?? '')));
    if (!validRecipients.length) return res.status(409).json({ ok: false, error: 'No eligible member email addresses were found.' });
    if (recipients.length >= 500) return res.status(409).json({ ok: false, error: 'Audience cap reached. Narrow the audience before sending.' });

    const [event] = await sql`
      insert into public.communication_events
        (source, channel, category, template_key, template_version, subject, body_snapshot, audience_snapshot, status, created_by)
      values
        ('manual', 'email', ${template.category}, ${template.template_key}, ${template.version},
         ${String(body.subject || template.subject).slice(0, 180)}, ${String(body.body || template.text_body).slice(0, 5000)},
         ${JSON.stringify({ audience, requested: validRecipients.length })}::jsonb, 'processing', ${userId})
      returning id
    `;
    eventId = event.id;
    const { transporter, from } = getTransport();
    let accepted = 0;
    let failed = 0;
    for (const recipient of validRecipients) {
      const idempotencyKey = `${eventId}:${recipient.profile_id}`;
      const [delivery] = await sql`
        insert into public.communication_deliveries
          (event_id, recipient_profile_id, recipient_email, recipient_name, status, provider, attempts, idempotency_key)
        values
          (${eventId}, ${recipient.profile_id}, ${recipient.email}, ${recipient.full_name}, 'queued', 'smtp', 0, ${idempotencyKey})
        on conflict (idempotency_key) do nothing
        returning id
      `;
      if (!delivery) continue;
      try {
        const rendered = renderTemplate({
          ...template,
          subject: body.subject || template.subject,
          html_body: body.htmlBody || template.html_body,
          text_body: body.body || template.text_body,
        }, {
          name: recipient.full_name || 'there',
          email: recipient.email,
          subject: String(body.subject || template.subject).slice(0, 180),
          preheader: template.preheader,
          headline: String(body.subject || template.name).slice(0, 180),
          body: String(body.body || template.text_body).slice(0, 5000),
          cta_label: 'Open MW Fitness',
          cta_url: process.env.PUBLIC_SITE_URL || 'https://mwfitness.co.uk',
          app_url: process.env.PUBLIC_SITE_URL || 'https://mwfitness.co.uk',
          admin_url: process.env.PUBLIC_SITE_URL || 'https://mwfitness.co.uk',
        });
        const info = await transporter.sendMail({
          from,
          to: recipient.email,
          subject: rendered.subject.slice(0, 180),
          html: rendered.html,
          text: rendered.text,
          headers: { 'X-MWFitness-Event-ID': String(eventId) },
        });
        await sql`
          update public.communication_deliveries
          set status = 'accepted', provider_message_id = ${String(info.messageId || '').slice(0, 500)},
              attempts = attempts + 1, updated_at = now()
          where id = ${delivery.id}
        `;
        accepted += 1;
      } catch (sendError) {
        await sql`
          update public.communication_deliveries
          set status = 'failed', error_code = 'smtp_send_failed',
              error_message = ${String(sendError?.message || 'SMTP send failed').slice(0, 500)},
              attempts = attempts + 1, updated_at = now()
          where id = ${delivery.id}
        `;
        failed += 1;
      }
    }
    const status = failed === 0 ? 'accepted' : accepted === 0 ? 'failed' : 'partial';
    await sql`update public.communication_events set status = ${status}, completed_at = now() where id = ${eventId}`;
    return res.status(failed ? 207 : 200).json({ ok: failed === 0, eventId, attempted: validRecipients.length, accepted, failed, note: 'Accepted means SMTP accepted the message; it does not confirm inbox delivery.' });
  } catch (error) {
    if (eventId) {
      try {
        const sql = getSql();
        await sql`update public.communication_events set status = 'failed', completed_at = now() where id = ${eventId}`;
      } catch { /* retain the original error */ }
    }
    const status = Number.isInteger(error?.statusCode) ? error.statusCode : /DATABASE_URL|not configured|SMTP|Email provider/i.test(error?.message || '') ? 503 : 500;
    return res.status(status).json({ ok: false, error: status === 403 ? error.message : status === 503 ? error.message : 'Communication dispatch failed. Check server configuration and the communications migration.' });
  }
}
