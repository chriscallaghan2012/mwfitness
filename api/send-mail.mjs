/**
 * Vercel serverless function — POST /api/send-mail
 * Save each enquiry to the shared Neon database, then send an email notification.
 */
import { sendContactEmail, validatePayload } from './_mailer.mjs';
import { saveWebsiteLead } from './_leads.mjs';

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

  let lead;
  try {
    const validated = validatePayload(payload);
    lead = await saveWebsiteLead(validated);

    // Email is an alert, not the source of truth. A temporary SMTP outage must
    // not discard a successfully saved enquiry or tell the visitor to resubmit.
    try {
      await sendContactEmail(validated);
      return res.status(200).json({ ok: true, leadId: lead.id, emailSent: true });
    } catch (mailError) {
      console.error('MW Fitness lead saved; email notification failed:', mailError);
      return res.status(200).json({
        ok: true,
        leadId: lead.id,
        emailSent: false,
        notice: 'Your request has been received. Email notifications are temporarily unavailable.',
      });
    }
  } catch (err) {
    const status = /Missing|valid|Please|too long/i.test(err.message || '') ? 400 : 500;
    return res.status(status).json({
      ok: false,
      error: status === 400 ? err.message : 'We could not save your request. Please try again in a moment.',
    });
  }
}
