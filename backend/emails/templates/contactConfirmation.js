const {
  escapeHtml,
  normalizeSiteUrl,
  renderButton,
  renderEmailLayout
} = require('./layout');

function renderContactConfirmationEmail(data, options = {}) {
  const siteUrl = normalizeSiteUrl(options.siteUrl);
  const bodyCopy = 'Your message has been received. I will review it directly and reply if there is a useful next step. Replies may come through my authenticated workspace mail path.';
  const html = renderEmailLayout({
    eyebrow: 'Message received',
    title: `Thanks, ${data.firstName}.`,
    preheader: 'Your message was received by SerhatSoruklu.com.',
    content: `
      <h1 style="margin:0;color:#111827;font-family:Arial,Helvetica,sans-serif;font-size:28px;font-weight:bold;line-height:34px;text-align:center;">
        Thanks, ${escapeHtml(data.firstName)}.
      </h1>
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="width:100%;margin-top:24px;border:1px solid #eee9df;border-radius:10px;background:#fbfaf7;border-collapse:separate;border-spacing:0;">
        <tr>
          <td style="padding:22px 22px 18px;color:#374151;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:24px;text-align:left;">
            <p style="margin:0 0 18px;">${escapeHtml(bodyCopy)}</p>
            <p style="margin:0;color:#6b7280;font-size:14px;line-height:22px;">Topic: <strong style="color:#111827;">${escapeHtml(data.topic)}</strong></p>
          </td>
        </tr>
      </table>
      <div style="height:26px;line-height:26px;">&nbsp;</div>
      ${renderButton({ href: siteUrl, label: 'Visit SerhatSoruklu.com' })}`
  });
  const text = [
    'Message received',
    '',
    `Thanks, ${data.firstName}.`,
    '',
    bodyCopy,
    '',
    `Topic: ${data.topic}`,
    '',
    `Visit SerhatSoruklu.com: ${siteUrl}`
  ].join('\n');

  return { html, text };
}

module.exports = {
  renderContactConfirmationEmail
};
