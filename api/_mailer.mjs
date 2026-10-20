/**
 * MWFitnessUK — shared email sender used by BOTH the local Express server
 * and the Vercel serverless function (api/send-mail.mjs).
 *
 * Configure via environment variables (see .env.example):
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_TO
 *
 * SMTP_USER is the Gmail address the mail is sent FROM (use a Google App Password,
 * not your normal password). MAIL_TO defaults to mwfitnessukonline@gmail.com.
 */

import nodemailer from 'nodemailer';
import { KINDS, renderEmail } from './_templates.mjs';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validatePayload(payload) {
  const p = payload || {};

  if (!p.kind || !KINDS.includes(p.kind)) {
    throw new Error('Missing or invalid "kind". Expected one of: ' + KINDS.join(', '));
  }
  if (!p.name || String(p.name).trim().length < 2) {
    throw new Error('Please add your name.');
  }
  if (!p.email || !EMAIL_RE.test(String(p.email))) {
    throw new Error('Please add a valid email address.');
  }
  if (p.message && String(p.message).length > 4000) {
    throw new Error('Message is too long (max 4000 characters).');
  }

  return {
    kind: p.kind,
    name: String(p.name).trim().slice(0, 120),
    email: String(p.email).trim().slice(0, 200).toLowerCase(),
    phone: p.phone ? String(p.phone).trim().slice(0, 60) : '',
    interest: p.interest ? String(p.interest).trim().slice(0, 120) : '',
    goal: p.goal ? String(p.goal).trim().slice(0, 200) : '',
    times: Array.isArray(p.times) ? p.times.map((t) => String(t).trim()).filter(Boolean).slice(0, 8) : [],
    message: p.message ? String(p.message).trim().slice(0, 4000) : '',
    page: p.page ? String(p.page).trim().slice(0, 120) : '',
  };
}

export function smtpConfig() {
  const missing = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'].filter(
    (k) => !process.env[k]
  );
  if (missing.length > 0) {
    throw new Error('Email backend is not configured. Missing env vars: ' + missing.join(', ') + '. Copy .env.example to .env and add your SMTP details.');
  }
  return {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: String(process.env.SMTP_PORT).trim() === '465',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  };
}

export async function sendContactEmail(payload) {
  const data = validatePayload(payload);
  const mail = renderEmail(data.kind, data);

  const to = process.env.MAIL_TO || 'mwfitnessukonline@gmail.com';
  if (process.env.RESEND_API_KEY) {
    const from = process.env.RESEND_FROM_EMAIL || process.env.MAIL_FROM;
    if (!from) throw new Error('RESEND_FROM_EMAIL must be set to a verified sender.');
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + process.env.RESEND_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: data.email,
        subject: mail.subject,
        text: mail.text,
        html: mail.html,
      }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.message || result.error || 'Resend rejected the website enquiry email.');
    return { ok: true, to, subject: mail.subject, info: result.id || 'accepted-by-resend', provider: 'resend' };
  }

  const { host, port, secure, auth } = smtpConfig();

  const transporter = nodemailer.createTransport({ host, port, secure, auth });
  const info = await transporter.sendMail({
    from: `"MWFitnessUK Website" <${auth.user}>`,
    to,
    replyTo: `"${data.name}" <${data.email}>`,
    subject: mail.subject,
    text: mail.text,
    html: mail.html,
  });

  return {
    ok: true,
    to,
    subject: mail.subject,
    info: info?.messageId || 'sent',
  };
}