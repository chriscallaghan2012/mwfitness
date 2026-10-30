/**
 * MWFitnessUK — self-hosted server (Express).
 *
 * Serves the built site + all API routes on one port:
 *   npm run build && PORT=8787 npm run server
 *
 * Loads .env automatically (DATABASE_URL, SMTP_*, STRIPE_*, PUBLIC_SITE_URL).
 * The catch-all route serves dist/index.html for every non-/api path, so all
 * SPA routes (/privacy, /cookies, /gdpr, /checkout, …) work without Vercel.
 */
import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sendContactEmail, validatePayload } from './api/_mailer.mjs';
import { saveWebsiteLead } from './api/_leads.mjs';
import { sendAutomaticTemplate } from './api/_communications.mjs';
import checkout from './api/create-checkout.mjs';
import sendPush from './api/send-push.mjs';
import testCommunication from './api/test-communication.mjs';
import communicationsSend from './api/communications-send.mjs';
import communicationsRules from './api/communications-rules.mjs';
import communicationsNotifications from './api/communications-notifications.mjs';
import unsubscribe from './api/unsubscribe.mjs';
import health from './api/health.mjs';
import plans from './api/plans.mjs';
import products from './api/products.mjs';
import checkoutStatus from './lib/checkout-status-handler.mjs';
import stripeWebhook from './lib/stripe-webhook-handler.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Stripe signature verification requires the untouched raw request body.
app.post('/api/stripe-webhook', express.raw({ type: 'application/json', limit: '1mb' }), stripeWebhook);

app.use(express.json({ limit: '64kb' }));
app.use(express.urlencoded({ extended: false, limit: '8kb' }));

app.get('/api/health', health);
app.get('/api/checkout-status', checkoutStatus);
app.get('/api/plans', plans);
app.get('/api/products', products);

app.post('/api/send-mail', async (req, res) => {
  try {
    const validated = validatePayload(req.body);
    const lead = await saveWebsiteLead(validated);
    let emailSent = false;
    try { await sendContactEmail(validated); emailSent = true; }
    catch (mailError) { console.error('MW Fitness lead saved; staff email notification failed:', mailError); }
    const templateKey = validated.kind === 'book-call' ? 'consultation-confirmation' : validated.kind === 'waitlist' ? 'app-waitlist-acknowledgement' : 'website-enquiry-acknowledgement';
    try { await sendAutomaticTemplate({ templateKey, lead: { ...validated, id: lead.id } }); }
    catch (automationError) { console.error('MW Fitness lead saved; automatic acknowledgement failed:', automationError); }
    res.json({ ok: true, leadId: lead.id, emailSent, notice: emailSent ? undefined : 'Your request has been received. Email notifications are temporarily unavailable.' });
  } catch (err) {
    const status = /Missing|valid|Please|too long/i.test(err.message || '') ? 400 : 500;
    res.status(status).json({ ok: false, error: status === 400 ? err.message : 'We could not save your request. Please try again in a moment.' });
  }
});

app.post('/api/create-checkout', checkout);

app.post('/api/send-push', sendPush);
app.post('/api/test-communication', testCommunication);
app.post('/api/communications-send', communicationsSend);
app.post('/api/communications-rules', communicationsRules);
app.post('/api/communications-notifications', communicationsNotifications);
app.all('/api/unsubscribe', unsubscribe);

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