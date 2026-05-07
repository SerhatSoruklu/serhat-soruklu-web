const fs = require('fs');
const path = require('path');

const templatePath = path.join(__dirname, 'template.html');
const template = fs.readFileSync(templatePath, 'utf8');

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
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
  renderApiLandingPage
};
