const { URLSearchParams } = require('node:url');

const {
  escapeHtml,
  normalizeSiteUrl,
  renderButton,
  renderEmailLayout,
  renderMessageHtml
} = require('./layout');

function renderField(label, value) {
  return `
    <tr>
      <td valign="top" width="112" style="width:112px;padding:12px 12px 12px 0;border-bottom:1px solid #eee9df;color:#6b7280;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:bold;line-height:20px;">
        ${escapeHtml(label)}
      </td>
      <td valign="top" style="padding:12px 0;border-bottom:1px solid #eee9df;color:#111827;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:21px;">
        ${value}
      </td>
    </tr>`;
}

function sanitizeMailtoAddress(email) {
  return String(email)
    .replace(/[\r\n<>"']/g, '')
    .trim();
}

function renderMailtoHref({ email, subject }) {
  const address = sanitizeMailtoAddress(email);
  const params = new URLSearchParams({
    subject
  });

  return `mailto:${address}?${params.toString()}`;
}

function renderContactNotificationEmail(data, options = {}) {
  const fullName = `${data.firstName} ${data.lastName}`;
  const siteUrl = normalizeSiteUrl(options.siteUrl);
  const replyHref = renderMailtoHref({
    email: data.email,
    subject: `Re: ${data.topic}`
  });
  const html = renderEmailLayout({
    eyebrow: 'SerhatSoruklu.com Contact',
    title: 'New contact message',
    preheader: `New contact message from ${fullName} about ${data.topic}.`,
    content: `
      <h1 style="margin:0;color:#111827;font-family:Arial,Helvetica,sans-serif;font-size:28px;font-weight:bold;line-height:34px;text-align:center;">
        New contact message
      </h1>
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="width:100%;margin-top:24px;border:1px solid #eee9df;border-radius:10px;background:#fbfaf7;border-collapse:separate;border-spacing:0;">
        <tr>
          <td style="padding:4px 20px 2px;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="width:100%;border-collapse:collapse;">
              ${renderField('Name', escapeHtml(fullName))}
              ${renderField('Email', `<a href="mailto:${escapeHtml(data.email)}" style="color:#8d6621;text-decoration:underline;">${escapeHtml(data.email)}</a>`)}
              ${renderField('Topic', escapeHtml(data.topic))}
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:18px 20px 20px;color:#111827;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:24px;">
            ${renderMessageHtml(data.message)}
          </td>
        </tr>
      </table>
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:26px auto 0;border-collapse:collapse;">
        <tr>
          <td style="padding:0 6px 10px;">${renderButton({ href: siteUrl, label: 'Open Website' })}</td>
          <td style="padding:0 6px 10px;">${renderButton({ href: replyHref, label: 'Reply to Sender', variant: 'secondary' })}</td>
        </tr>
      </table>`
  });
  const text = [
    'SerhatSoruklu.com Contact',
    '',
    'New contact message',
    '',
    `Name: ${fullName}`,
    `Email: ${data.email}`,
    `Topic: ${data.topic}`,
    '',
    data.message,
    '',
    `Open Website: ${siteUrl}`,
    `Reply to Sender: ${replyHref}`
  ].join('\n');

  return { html, text };
}

module.exports = {
  renderMailtoHref,
  renderContactNotificationEmail
};
