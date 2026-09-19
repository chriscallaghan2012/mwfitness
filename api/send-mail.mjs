/**
 * Vercel serverless function — POST /api/send-mail
 * Called by every contact form on the site (enquiry, book-a-call, waitlist, SHWAG).
 */
import { sendContactEmail } from './_mailer.mjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  let payload = req.body;
  if (typeof payload === 'string') {
    try {
      payload = JSON.parse(payload);
    } catch {
      return res.status(400).json({ ok: false, error: 'Invalid JSON body.' });
    }
  }

  try {
    const result = await sendContactEmail(payload);
    return res.status(200).json(result);
  } catch (err) {
    const status = /Missing|valid|Please|too long/i.test(err.message || '') ? 400 : 500;
    return res.status(status).json({ ok: false, error: err.message || 'Email could not be sent.' });
  }
}