const fs = require('node:fs');
const path = require('node:path');

const BRAND_LOGO_FILENAME = 'serhat_soruklu_s_dark_header.png';
const BRAND_LOGO_CID = 'serhat-soruklu-s-dark-header@serhatsoruklu.com';
const BRAND_LOGO_PATH = path.join(__dirname, '..', 'assets', 'brand', 'logo', BRAND_LOGO_FILENAME);
const BRAND_LOGO_CONTENT = fs.readFileSync(BRAND_LOGO_PATH);

function getEmailBrandAttachments() {
  return [
    {
      filename: BRAND_LOGO_FILENAME,
      content: Buffer.from(BRAND_LOGO_CONTENT),
      cid: BRAND_LOGO_CID,
      contentType: 'image/png',
      contentDisposition: 'inline'
    }
  ];
}

module.exports = {
  BRAND_LOGO_CID,
  BRAND_LOGO_FILENAME,
  BRAND_LOGO_PATH,
  getEmailBrandAttachments
};
