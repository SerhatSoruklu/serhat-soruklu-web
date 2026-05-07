const fs = require('node:fs');
const path = require('node:path');

const templatePath = path.join(__dirname, 'template.html');
const template = fs.readFileSync(templatePath, 'utf8');

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderApiLandingPage({ nodeEnv }) {
  return template.replace('{{NODE_ENV}}', escapeHtml(nodeEnv));
}

function createApiLandingHandlers({ faviconPath, logoPath, nodeEnv }) {
  return {
    serveFavicon(_req, res) {
      res.sendFile(faviconPath);
    },

    serveLogo(_req, res) {
      res.sendFile(logoPath);
    },

    serveLandingPage(_req, res) {
      res.type('html').send(renderApiLandingPage({ nodeEnv }));
    }
  };
}

module.exports = {
  createApiLandingHandlers,
  escapeHtml,
  renderApiLandingPage
};
