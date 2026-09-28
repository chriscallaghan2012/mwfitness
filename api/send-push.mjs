import { createClient } from '@supabase/supabase-js';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parseBody(body) {
  if (typeof body !== 'string') return body;
  try {
    return JSON.parse(body);
  } catch {
    return null;
  }
}

function bearerToken(req) {
  const header = req.headers?.authorization ?? req.headers?.Authorization;
  const match = typeof header === 'string' ? header.match(/^Bearer\s+(.+)$/i) : null;
  return match?.[1] ?? null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });

  const token = bearerToken(req);
  if (!token) return res.status(401).json({ error: 'Authentication is required.' });

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const publishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !publishableKey) return res.status(503).json({ error: 'Push delivery is not configured on the server.' });

  const body = parseBody(req.body);
  const messageIds = Array.isArray(body?.messageIds) ? [...new Set(body.messageIds)] : [];
  if (!messageIds.length || messageIds.length > 100 || messageIds.some((id) => typeof id !== 'string' || !UUID_PATTERN.test(id))) {
    return res.status(400).json({ error: 'Provide between 1 and 100 valid message IDs.' });
  }

  const staffClient = createClient(supabaseUrl, publishableKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  try {
    const { data: authData, error: authError } = await staffClient.auth.getUser(token);
    if (authError || !authData.user) return res.status(401).json({ error: 'The session is invalid or expired.' });

    const { data: profile, error: profileError } = await staffClient
      .from('profiles')
      .select('role')
      .eq('id', authData.user.id)
      .maybeSingle();
    if (profileError) return res.status(500).json({ error: 'Could not validate staff access.' });
    if (profile?.role !== 'admin' && profile?.role !== 'coach') return res.status(403).json({ error: 'Coach or admin access is required.' });

    const { data: messages, error: messageError } = await staffClient
      .from('coach_messages')
      .select('id,athlete_profile_id,body')
      .in('id', messageIds)
      .eq('sender_profile_id', authData.user.id);
    if (messageError) return res.status(500).json({ error: 'Could not load the saved messages.' });
    if (!messages || messages.length !== messageIds.length) return res.status(403).json({ error: 'One or more messages are unavailable to this account.' });

    const athleteIds = [...new Set(messages.map((message) => message.athlete_profile_id))];
    const { data: tokenRows, error: tokenError } = await staffClient
      .from('device_push_tokens')
      .select('profile_id,expo_push_token')
      .in('profile_id', athleteIds);
    if (tokenError) return res.status(500).json({ error: 'Could not load registered devices.' });

    const messageState = new Map(messages.map((message) => [message.id, { accepted: 0, failed: 0 }]));
    const pushQueue = [];
    for (const message of messages) {
      const tokens = (tokenRows ?? []).filter((row) => row.profile_id === message.athlete_profile_id);
      if (!tokens.length) {
        await staffClient.from('coach_messages').update({ delivery_status: 'no_device' }).eq('id', message.id);
        continue;
      }
      for (const row of tokens) {
        pushQueue.push({
          messageId: message.id,
          payload: {
            to: row.expo_push_token,
            title: 'New message from your coach',
            body: message.body,
            sound: 'default',
            channelId: 'coach-messages',
            data: { messageId: message.id },
          },
        });
      }
    }

    for (let offset = 0; offset < pushQueue.length; offset += 100) {
      const batch = pushQueue.slice(offset, offset + 100);
      try {
        const response = await fetch(EXPO_PUSH_URL, {
          method: 'POST',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify(batch.map((item) => item.payload)),
        });
        const result = await response.json();
        const tickets = Array.isArray(result?.data) ? result.data : [];
        batch.forEach((item, index) => {
          const state = messageState.get(item.messageId);
          if (!state) return;
          if (response.ok && tickets[index]?.status === 'ok') state.accepted += 1;
          else state.failed += 1;
        });
      } catch {
        batch.forEach((item) => {
          const state = messageState.get(item.messageId);
          if (state) state.failed += 1;
        });
      }
    }

    let accepted = 0;
    let failed = 0;
    let noDevice = 0;
    for (const message of messages) {
      const state = messageState.get(message.id);
      if (!state) continue;
      const status = state.accepted ? 'accepted' : state.failed ? 'failed' : 'no_device';
      await staffClient.from('coach_messages').update({ delivery_status: status }).eq('id', message.id);
      if (status === 'accepted') accepted += 1;
      else if (status === 'failed') failed += 1;
      else noDevice += 1;
    }

    return res.status(200).json({ accepted, failed, noDevice });
  } catch {
    return res.status(500).json({ error: 'Push delivery could not be completed.' });
  }
}