/**
 * MWFitnessUK — local email API server.
 *
 * Run alongside `npm run dev` (two terminals):
 *   Terminal 1: npm run server   → http://localhost:8787/api/send-mail
 *   Terminal 2: npm run dev      → http://localhost:3000 (proxies /api to :8787)
 *
 * Also serves the built `dist/` on port 8787 for a quick prod check:
 *   npm run build && PORT=8787 npm run server
 */
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sendContactEmail, validatePayload } from './api/_mailer.mjs';
import { saveWebsiteLead } from './api/_leads.mjs';
import { createCheckoutSession } from './api/_stripe.mjs';
import sendPush from './api/send-push.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json({ limit: '64kb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'mwfitnessuk-mailer' });
});

app.post('/api/send-mail', async (req, res) => {
  try {
    const validated = validatePayload(req.body);
    const lead = await saveWebsiteLead(validated);
    try {
      await sendContactEmail(validated);
      res.json({ ok: true, leadId: lead.id, emailSent: true });
    } catch (mailError) {
      console.error('MW Fitness lead saved; email notification failed:', mailError);
      res.json({ ok: true, leadId: lead.id, emailSent: false, notice: 'Your request has been received. Email notifications are temporarily unavailable.' });
    }
  } catch (err) {
    const status = /Missing|valid|Please|too long/i.test(err.message || '') ? 400 : 500;
    res.status(status).json({ ok: false, error: status === 400 ? err.message : 'We could not save your request. Please try again in a moment.' });
  }
});

app.post('/api/create-checkout', async (req, res) => {
  try {
    const origin = req.headers.origin || `${req.protocol}://${req.get('host')}`;
    const result = await createCheckoutSession({ planId: req.body?.planId, origin });
    res.json(result);
  } catch (err) {
    const status = /Invalid|not configured|public site/i.test(err.message || '') ? 400 : 500;
    res.status(status).json({ ok: false, error: err.message || 'Checkout could not be started.' });
  }
});

app.post('/api/send-push', sendPush);

// Serve the built site (optional, for a full local prod check).
const dist = path.join(__dirname, 'dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get(/^\/(?!api\/).*/, (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

const PORT = Number(process.env.PORT || 8787);
app.listen(PORT, () => {
  console.log(`MWFitnessUK email API running on http://localhost:${PORT}`);
  console.log('POST /api/send-mail  ·  GET /api/health');
  console.log('POST /api/create-checkout');
  console.log('POST /api/send-push');
});