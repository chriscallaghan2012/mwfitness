const escapeHtml = (value) => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function brandedEmail({ subject = '', preheader = '', bodyHtml = '', preview = false, unsubscribeUrl = '' } = {}) {
  const safePreheader = escapeHtml(preheader || subject);
  const footerAction = unsubscribeUrl
    ? `<p style="margin:16px 0 0"><a href="${escapeHtml(unsubscribeUrl)}" style="color:#6b7280;text-decoration:underline">Unsubscribe from marketing emails</a></p>`
    : '';
  const previewNote = preview
    ? '<p style="margin:0 0 20px;padding:10px 12px;border-radius:8px;background:#fff3e8;color:#8a3b00;font-size:12px">TEST PREVIEW — sent only to the signed-in staff member.</p>'
    : '';
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background:#f1f2f4;font-family:Arial,Helvetica,sans-serif;color:#20242a">
<div style="display:none!important;visibility:hidden;opacity:0;height:0;width:0;overflow:hidden">${safePreheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f2f4"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#fff;border-radius:16px;overflow:hidden">
<tr><td style="height:7px;background:#ff5500;font-size:0;line-height:0">&nbsp;</td></tr>
<tr><td style="padding:26px 30px;background:#121418">
<p style="margin:0;color:#ff6b26;font-size:22px;font-weight:800;letter-spacing:-.4px">MW FITNESS<span style="color:#f5f5f5"> UK</span></p>
<p style="margin:8px 0 0;color:#b7bbc3;font-size:12px;letter-spacing:1.6px;text-transform:uppercase">Training · Nutrition · Coaching</p>
</td></tr>
<tr><td style="padding:30px;line-height:1.65;font-size:15px;color:#343941">${previewNote}${bodyHtml}</td></tr>
<tr><td style="padding:22px 30px;background:#f8f8f8;border-top:1px solid #e5e7eb;color:#6b7280;font-size:12px;line-height:1.6">
<strong style="color:#343941">MW Fitness UK</strong><br>Personal training, online coaching and nutrition support.
${footerAction}
<p style="margin:14px 0 0">You are receiving this message because you contacted MW Fitness or have a member relationship with us.</p>
</td></tr>
</table></td></tr></table></body></html>`;
}
