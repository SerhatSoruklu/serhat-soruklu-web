const http = require('node:http');
const test = require('node:test');
const assert = require('node:assert/strict');

const { app, getAllowedOrigins, parseBoolean } = require('./server');
const { escapeHtml, renderApiLandingPage } = require('./templates/api-landing');

function listen() {
  return new Promise((resolve, reject) => {
    const server = http.createServer(app);

    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();

      if (!address || typeof address === 'string') {
        reject(new Error('Expected HTTP server address'));
        return;
      }

      resolve({ server, url: `http://127.0.0.1:${address.port}` });
    });
  });
}

test('parseBoolean accepts common enabled values', () => {
  assert.equal(parseBoolean('1'), true);
  assert.equal(parseBoolean('true'), true);
  assert.equal(parseBoolean('yes'), true);
  assert.equal(parseBoolean('false'), false);
});

test('getAllowedOrigins defaults to local frontend in development', () => {
  assert.deepEqual(getAllowedOrigins(), ['http://localhost:4200']);
});

test('escapeHtml escapes unsafe characters', () => {
  assert.equal(escapeHtml('<script>"x" & \'y\''), '&lt;script&gt;&quot;x&quot; &amp; &#39;y&#39;');
});

test('renderApiLandingPage injects an escaped environment label', () => {
  const html = renderApiLandingPage({ nodeEnv: '<production>' });

  assert.match(html, /Serhat Soruklu API/);
  assert.match(html, /&lt;production&gt;/);
  assert.doesNotMatch(html, /<production>/);
});

test('health endpoint returns service status', async (t) => {
  const { server, url } = await listen();
  t.after(() => new Promise((resolve) => server.close(resolve)));

  const response = await fetch(`${url}/api/health`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.service, 'serhatsoruklu-backend');
  assert.equal(body.environment, 'development');
  assert.equal(typeof body.timestamp, 'string');
});

test('unknown API routes return JSON 404', async (t) => {
  const { server, url } = await listen();
  t.after(() => new Promise((resolve) => server.close(resolve)));

  const response = await fetch(`${url}/api/missing`);
  const body = await response.json();

  assert.equal(response.status, 404);
  assert.deepEqual(body, {
    ok: false,
    error: 'API route not found'
  });
});
