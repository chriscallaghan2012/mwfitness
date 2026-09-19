/**
 * MWFitnessUK — email templates.
 * Every enquiry type has a friendly, on-brand HTML template + a plain-text fallback.
 * Edit here to change what lands in Mike's inbox.
 */

export const KINDS = ['enquiry', 'book-call', 'waitlist', 'shwag'];

const KIND_LABEL = {
  enquiry: 'New website enquiry',
  'book-call': 'Free chat / book a call request',
  waitlist: 'App waitlist sign-up',
  shwag: 'SHWAG order request',
};

const esc = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

function row(label, value) {
  if (!value || String(value).trim() === '' || value === 'None') return '';
  return (
    '<tr>' +
      `<td style="padding:12px 16px;color:#848991;font-size:13px;font-weight:600;border-bottom:1px solid #eee">${esc(label)}</td>` +
      `<td style="padding:12px 16px;color:#1d2126;font-size:15px;border-bottom:1px solid #eee">${esc(value)}</td>` +
    '</tr>'
  );
}

function layout(title, intro, bodyRows, note, ctaLabel, ctaUrl) {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#faf7f2">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf7f2">
      <tr><td align="center" style="padding:32px 0">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden">
          <tr>
            <td style="background:#ff5500;padding:24px 32px">
              <div style="color:#ffffff;font-size:24px;font-weight:800;letter-spacing:-0.5px">MWFitness<span style="opacity:.85">UK</span></div>
              <div style="color:#ffffff;opacity:.9;font-size:13px;margin-top:6px">${esc(title)}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px">
              <h1 style="margin:0 0 14px;font-size:22px;color:#1d2126">${esc(intro)}</h1>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
                ${bodyRows}
              </table>
              ${note ? `<p style="margin:18px 0 0;font-size:14px;color:#454a52;line-height:1.55">${note}</p>` : ''}
              ${
                ctaLabel && ctaUrl
                  ? `<a href="${esc(ctaUrl)}" style="display:inline-block;margin-top:20px;background:#ff5500;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:12px 26px;border-radius:999px">${esc(ctaLabel)}</a>`
                  : ''
              }
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #eee;color:#848991;font-size:12px;line-height:1.6">
              MWFitnessUK — Pure Gym Hazel Grove, Stockport<br />
              mikeptonline@gmail.com · @michael_whitworth85
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

function buildPlain(kind, data) {
  const rows = [];
  if (data.name) rows.push(`Name: ${data.name}`);
  if (data.email) rows.push(`Email: ${data.email}`);
  if (data.phone) rows.push(`Phone: ${data.phone}`);
  if (data.interest) rows.push(`Interest: ${data.interest}`);
  if (data.goal) rows.push(`Main goal: ${data.goal}`);
  if (data.times && data.times.length) rows.push(`Preferred times: ${data.times.join(', ')}`);
  if (data.message) rows.push(`\nMessage:\n${data.message}`);
  if (data.page) rows.push(`\nSent from: ${data.page}`);
  return `${KIND_LABEL[kind] || 'MWFitnessUK contact'}\n\n${rows.join('\n')}`;
}

export function renderEmail(kind, data) {
  const d = data || {};
  const name = d.name || 'Someone';
  const rows = [
    row('Name', d.name),
    row('Email', d.email),
    row('Phone', d.phone || 'Not provided'),
    row('Interested in', d.interest),
    row('Main goal', d.goal),
    row('Preferred times', d.times && d.times.length ? d.times.join(', ') : ''),
    row('Message', d.message),
    row('Sent from', d.page),
  ].join('');

  const subjects = {
    enquiry: `New website enquiry — ${name}`,
    'book-call': `Free chat request — ${name}`,
    waitlist: `App waitlist sign-up — ${name || 'no name'}`,
    shwag: `SHWAG order request — ${name}`,
  };

  const notes = {
    enquiry:
      'Reply to this enquiry directly from your email app — the sender is on the "Reply" address above.',
    'book-call':
      'Get in touch to arrange the free chat. The sender picked these preferred times above.',
    waitlist:
      'Let them know the moment the app is ready. One friendly email is plenty.',
    shwag:
      'Confirm what they\'re after and the latest prices — they\'ll get 10% off as a MWFitnessUK enquiry.',
  };

  const intros = {
    enquiry: 'A new enquiry has come in through the website.',
    'book-call': 'Someone wants a free chat about training.',
    waitlist: 'Someone has joined the MWFitnessUK app waitlist.',
    shwag: 'Someone is interested in ordering SHWAG merch.',
  };

  const replyHref = d.email ? `mailto:${esc(d.email)}${d.subject ? '?subject=' + esc(d.subject) : ''}` : '';

  return {
    subject: subjects[kind] || 'MWFitnessUK contact',
    text: buildPlain(kind, d),
    html: layout(
      KIND_LABEL[kind] || 'MWFitnessUK contact',
      intros[kind] || 'A new message has come in through the website.',
      rows,
      notes[kind],
      'Reply to them',
      replyHref
    ),
  };
}