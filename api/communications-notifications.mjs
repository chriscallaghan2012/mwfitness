import { neon } from '@neondatabase/serverless';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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
const tokenFrom = (req) => {
  const value = req.headers && (req.headers.authorization || req.headers.Authorization);
  const match = typeof value === 'string' ? value.match(/^Bearer\s+(.+)$/i) : null;
  return match ? match[1] : '';
};
const tokenSub = (token) => {
  try {
    const p = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8'));
    return typeof p.sub === 'string' && UUID.test(p.sub) ? p.sub : '';
  } catch { return ''; }
};
async function verifyStaff(token, id) {
  const base = process.env.NEON_DATA_API_URL || process.env.VITE_NEON_DATA_API_URL;
  if (!base) throw new Error('Neon Data API is not configured.');
  const url = new URL(base.replace(/\/$/, '') + '/profiles');
  url.searchParams.set('select', 'id,role');
  url.searchParams.set('id', 'eq.' + id);
  url.searchParams.set('limit', '1');
  const response = await fetch(url, { headers: { Authorization: 'Bearer ' + token, Accept: 'application/json' } });
  if (!response.ok) throw new Error('Could not verify the staff session.');
  const rows = await response.json();
  if (!Array.isArray(rows) || !rows[0] || !['admin', 'coach'].includes(rows[0].role)) {
    const error = new Error('Admin or coach access is required.');
    error.statusCode = 403;
    throw error;
  }
}
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed.' });
  const token = tokenFrom(req);
  const userId = tokenSub(token);
  if (!userId) return res.status(401).json({ ok: false, error: 'A valid staff session is required.' });
  const body = parse(req.body);
  if (!body || typeof body !== 'object') return res.status(400).json({ ok: false, error: 'Invalid request body.' });
  const action = body.action;
  const channel = body.channel;
  const audience = body.audience || 'individual';
  const title = String(body.title || '').trim();
  const message = String(body.message || '').trim();
  if (!['preview', 'send'].includes(action)) return res.status(400).json({ ok: false, error: 'Choose preview or send.' });
  if (!['push', 'in_app'].includes(channel)) return res.status(400).json({ ok: false, error: 'Choose push or in-app notification.' });
  if (!title || title.length > 180 || !message || message.length > 2000) return res.status(400).json({ ok: false, error: 'Add a title (max 180 characters) and message (max 2,000 characters).' });
  try {
    await verifyStaff(token, userId);
    const database = getSql();
    let recipients = [];
    if (audience === 'individual') {
      const email = String(body.recipientEmail || '').trim().toLowerCase();
      if (!EMAIL.test(email)) return res.status(400).json({ ok: false, error: 'Enter the email address of an existing member.' });
      const result = await database.query("select id,email,full_name from public.profiles where lower(email)=lower($1) and role='athlete' limit 1", [email]);
      recipients = result.rows || [];
    } else if (audience === 'members') {
      const result = await database.query("select id,email,full_name from public.profiles where role='athlete' and email is not null order by id limit 101");
      recipients = (result.rows || []).filter((row) => EMAIL.test(String(row.email || '')));
      if (recipients.length > 100) return res.status(400).json({ ok: false, error: 'This notification audience exceeds 100 members. Narrow the audience and send in smaller reviewed batches.' });
    } else {
      return res.status(400).json({ ok: false, error: 'Choose an individual member or all members.' });
    }
    if (!recipients.length) return res.status(400).json({ ok: false, error: 'No eligible member was found for this audience.' });
    if (action === 'preview') return res.status(200).json({ ok: true, recipientCount: recipients.length });
    if (body.confirmSend !== true || Number(body.confirmCount) !== recipients.length) return res.status(400).json({ ok: false, error: 'Confirm the exact current recipient count before sending.' });
    const eventRows = await database.query('insert into public.communication_events (source,channel,category,subject,body_snapshot,audience_snapshot,status,created_by) values ($1,$2,$3,$4,$5,$6::jsonb,$7,$8) returning id', ['manual', channel, 'service', title, message, JSON.stringify({ audience, recipientCount: recipients.length }), 'processing', userId]);
    const eventId = eventRows.rows && eventRows.rows[0] && eventRows.rows[0].id;
    if (!eventId) throw new Error('Could not create the notification audit record.');
    let accepted = 0;
    let failed = 0;
    let noDevice = 0;
    const errors = [];
    for (const recipient of recipients) {
      const bodyText = title + '\n\n' + message;
      const key = String(eventId) + ':' + String(recipient.id);
      const delivery = await database.query('insert into public.communication_deliveries (event_id,recipient_profile_id,recipient_email,recipient_name,status,provider,idempotency_key) values ($1,$2,$3,$4,$5,$6,$7) on conflict (idempotency_key) do nothing returning id', [eventId, recipient.id, recipient.email || '', recipient.full_name || '', channel === 'in_app' ? 'accepted' : 'queued', channel === 'push' ? 'expo' : 'in_app', key]);
      if (!delivery.rows || !delivery.rows[0]) continue;
      const inserted = await database.query('insert into public.coach_messages (athlete_profile_id,sender_profile_id,body) values ($1,$2,$3) returning id', [recipient.id, userId, bodyText]);
      const messageId = inserted.rows && inserted.rows[0] && inserted.rows[0].id;
      if (!messageId) {
        failed++;
        await database.query("update public.communication_deliveries set status='failed',error_message='Message could not be saved',updated_at=now() where idempotency_key=$1", [key]);
        continue;
      }
      if (channel === 'in_app') { await database.query("update public.coach_messages set delivery_status='accepted' where id=$1", [messageId]); accepted++; continue; }
      try {
        const base = String(process.env.PUBLIC_SITE_URL || '').replace(/\/$/, '');
        if (!base) throw new Error('PUBLIC_SITE_URL is not configured for push delivery.');
        const response = await fetch(base + '/api/send-push', { method: 'POST', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }, body: JSON.stringify({ messageIds: [messageId] }) });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.error || 'Push delivery failed.');
        if (Number(result.accepted) > 0) {
          accepted++;
          await database.query("update public.communication_deliveries set status='accepted',attempts=1,updated_at=now() where idempotency_key=$1", [key]);
        } else if (Number(result.noDevice) > 0) {
          noDevice++;
          await database.query("update public.communication_deliveries set status='no_device',attempts=1,error_message='No registered push device',updated_at=now() where idempotency_key=$1", [key]);
        } else {
          failed++;
          await database.query("update public.communication_deliveries set status='failed',attempts=1,error_message=$2,updated_at=now() where idempotency_key=$1", [key, String(result.error || 'Push provider did not accept the notification').slice(0,1000)]);
        }
      } catch (e) {
        failed++;
        await database.query("update public.communication_deliveries set status='failed',attempts=1,error_message=$2,updated_at=now() where idempotency_key=$1", [key, (e instanceof Error ? e.message : 'Push delivery failed').slice(0,1000)]);
        errors.push({ email: recipient.email, error: e instanceof Error ? e.message : 'Push delivery failed' });
      }
    }
    const status = failed === 0 && noDevice === 0 ? 'accepted' : accepted === 0 && failed > 0 ? 'failed' : 'partial';
    await database.query('update public.communication_events set status=$2,completed_at=now() where id=$1', [eventId, status]);
    return res.status(failed ? 207 : 200).json({ ok: failed === 0, eventId, recipientCount: recipients.length, accepted, failed, noDevice, errors: errors.slice(0, 10), note: channel === 'in_app' ? 'Saved to member coach inboxes.' : 'Push acceptance depends on each member having a registered device token.' });
  } catch (error) {
    const status = error && error.statusCode ? error.statusCode : 503;
    return res.status(status).json({ ok: false, error: error instanceof Error ? error.message : 'Could not send notifications.' });
  }
}
