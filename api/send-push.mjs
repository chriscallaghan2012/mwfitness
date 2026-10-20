const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parseBody(body) {
  if (typeof body !== 'string') return body;
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
  } catch {
    return null;
  }
}

async function dataApiRequest(baseUrl, token, table, query, options = {}) {
  const url = new URL(`${baseUrl.replace(/\/$/, '')}/${table}`);
  for (const [key, value] of Object.entries(query ?? {})) url.searchParams.set(key, value);
  const response = await fetch(url, {
    method: options.method ?? 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.method === 'PATCH' ? { Prefer: 'return=minimal' } : {}),
    },
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`Neon Data API request failed (${response.status})${detail ? `: ${detail.slice(0, 180)}` : ''}`);
  }
  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });

  const token = bearerToken(req);
  if (!token) return res.status(401).json({ error: 'Authentication is required.' });

  const dataApiUrl = process.env.VITE_NEON_DATA_API_URL || process.env.NEON_DATA_API_URL;
  if (!dataApiUrl) return res.status(503).json({ error: 'Push delivery is not configured on the server.' });

  const body = parseBody(req.body);
  const messageIds = Array.isArray(body?.messageIds) ? [...new Set(body.messageIds)] : [];
  if (!messageIds.length || messageIds.length > 100 || messageIds.some((id) => typeof id !== 'string' || !UUID_PATTERN.test(id))) {
    return res.status(400).json({ error: 'Provide between 1 and 100 valid message IDs.' });
  }

  const userId = tokenSubject(token);
  if (!userId) return res.status(401).json({ error: 'The session token is invalid or expired.' });

  try {
    // The Data API validates the Neon JWT and RLS limits this lookup to the caller's profile.
    const profiles = await dataApiRequest(dataApiUrl, token, 'profiles', {
      select: 'id,role',
      id: `eq.${userId}`,
      limit: '1',
    });
    const profile = Array.isArray(profiles) ? profiles[0] : null;
    if (!profile) return res.status(401).json({ error: 'The session is invalid or the profile is unavailable.' });
    if (profile.role !== 'admin' && profile.role !== 'coach') {
      return res.status(403).json({ error: 'Coach or admin access is required.' });
    }

    const messages = await dataApiRequest(dataApiUrl, token, 'coach_messages', {
      select: 'id,athlete_profile_id,body',
      id: `in.(${messageIds.join(',')})`,
      sender_profile_id: `eq.${userId}`,
    });
    if (!Array.isArray(messages) || messages.length !== messageIds.length) {
      return res.status(403).json({ error: 'One or more messages are unavailable to this account.' });
    }

    const athleteIds = [...new Set(messages.map((message) => message.athlete_profile_id))];
    const tokenRows = athleteIds.length
      ? await dataApiRequest(dataApiUrl, token, 'device_push_tokens', {
          select: 'profile_id,expo_push_token',
          profile_id: `in.(${athleteIds.join(',')})`,
        })
      : [];

    const messageState = new Map(messages.map((message) => [message.id, { accepted: 0, failed: 0 }]));
    const pushQueue = [];
    for (const message of messages) {
      const tokens = (tokenRows ?? []).filter((row) => row.profile_id === message.athlete_profile_id);
      if (!tokens.length) {
        await dataApiRequest(dataApiUrl, token, 'coach_messages', { id: `eq.${message.id}` }, {
          method: 'PATCH', body: { delivery_status: 'no_device' },
        });
        continue;
      }
      for (const row of tokens) {
        const parts = String(message.body || '').split('\\n\\n');
        const hasCustomTitle = parts.length > 1;
        const notificationTitle = hasCustomTitle ? parts.shift().slice(0, 180) : 'New message from your coach';
        pushQueue.push({
          messageId: message.id,
          payload: {
            to: row.expo_push_token,
            title: notificationTitle,
            body: hasCustomTitle ? parts.join('\\n\\n') : message.body,
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
      await dataApiRequest(dataApiUrl, token, 'coach_messages', { id: `eq.${message.id}` }, {
        method: 'PATCH', body: { delivery_status: status },
      });
      if (status === 'accepted') accepted += 1;
      else if (status === 'failed') failed += 1;
      else noDevice += 1;
    }

    return res.status(200).json({ accepted, failed, noDevice });
  } catch {
    return res.status(500).json({ error: 'Push delivery could not be completed. Check Neon Data API configuration and row-level policies.' });
  }
}
