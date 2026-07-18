const { BRAND_LOGO_CID } = require('../assets');
const { renderEmailFooter } = require('./footer');

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll('\'', '&#39;');
}

function normalizeSiteUrl(value) {
  const rawUrl = String(value || '').trim() || 'https://serhatsoruklu.com';

  try {
    const parsed = new URL(rawUrl);

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return 'https://serhatsoruklu.com';
    }

    parsed.hash = '';
    return parsed.toString().replace(/\/$/, '');
  } catch {
    return 'https://serhatsoruklu.com';
  }
}

function renderMessageHtml(message) {
  return escapeHtml(message).replaceAll('\n', '<br>');
}

function renderLogo() {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:0 auto;">
      <tr>
        <td align="center" valign="middle" width="48" height="48" style="width:48px;height:48px;">
          <img src="cid:${escapeHtml(BRAND_LOGO_CID)}" width="48" height="48" alt="Serhat Soruklu" style="display:block;width:48px;height:48px;border:0;border-radius:9px;outline:none;text-decoration:none;">
        </td>
      </tr>
    </table>`;
}

function renderEmailHeader({ eyebrow }) {
  return `
    <tr>
      <td align="center" style="padding:34px 32px 18px;">
        ${renderLogo()}
        <p style="margin:16px 0 0;color:#b8872f;font-family:'Courier New',Courier,monospace;font-size:12px;font-weight:bold;letter-spacing:2px;line-height:18px;text-align:center;text-transform:uppercase;">
          ${escapeHtml(eyebrow)}
        </p>
      </td>
    </tr>`;
}

function renderButton({ href, label, variant = 'primary' }) {
  const isSecondary = variant === 'secondary';
  const background = isSecondary ? '#ffffff' : '#111827';
  const border = isSecondary ? '#d9d3c8' : '#111827';
  const color = isSecondary ? '#111827' : '#ffffff';

  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:0 auto;">
      <tr>
        <td align="center" bgcolor="${background}" style="border:1px solid ${border};border-radius:8px;background:${background};">
          <a href="${escapeHtml(href)}" style="display:inline-block;padding:12px 18px;color:${color};font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;line-height:20px;text-align:center;text-decoration:none;border-radius:8px;">
            ${escapeHtml(label)}
          </a>
        </td>
      </tr>
    </table>`;
}

function renderEmailLayout({ eyebrow, title, preheader = '', content }) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light">
    <meta name="supported-color-schemes" content="light">
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;padding:0;background:#f6f4ee;color:#111827;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;line-height:1px;">
      ${escapeHtml(preheader)}
    </div>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="width:100%;background:#f6f4ee;border-collapse:collapse;">
      <tr>
        <td align="center" style="padding:28px 16px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="width:100%;max-width:620px;border-collapse:separate;border-spacing:0;">
            <tr>
              <td style="border:1px solid #e5e0d6;border-radius:14px;background:#ffffff;box-shadow:0 14px 34px rgba(17,24,39,0.08);overflow:hidden;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="width:100%;border-collapse:collapse;">
                  ${renderEmailHeader({ eyebrow })}
                  <tr>
                    <td style="padding:0 32px 34px;">
                      ${content}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            ${renderEmailFooter()}
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

module.exports = {
  escapeHtml,
  normalizeSiteUrl,
  renderButton,
  renderEmailLayout,
  renderMessageHtml
};
