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
import { sendContactEmail } from './api/_mailer.mjs';
import { createCheckoutSession } from './api/_stripe.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json({ limit: '64kb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'mwfitnessuk-mailer' });
});

app.post('/api/send-mail', async (req, res) => {
  try {
    const result = await sendContactEmail(req.body);
    res.json(result);
  } catch (err) {
    const status = /Missing|valid|Please|too long/i.test(err.message || '') ? 400 : 500;
    res.status(status).json({ ok: false, error: err.message || 'Email could not be sent.' });
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
});