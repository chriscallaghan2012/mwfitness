import communicationsSend from './communications-send.mjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed.' });
  const body = typeof req.body === 'string' ? (() => { try { return JSON.parse(req.body); } catch { return null; } })() : (req.body || {});
  if (!body || body.confirmTest !== true) return res.status(400).json({ ok: false, error: 'Explicit test-send confirmation is required.' });
  req.body = { ...body, action: 'test' };
  return communicationsSend(req, res);
}
