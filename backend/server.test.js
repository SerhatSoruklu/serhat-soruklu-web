const http = require('node:http');
const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const nodemailer = require('nodemailer');

const {
  app,
  createBackendApp,
  createGracefulShutdown,
  getAllowedOrigins,
  getTrustProxySetting,
  parseBoolean
} = require('./server');
const {
  CONTACT_TOPICS,
  buildContactEmails,
  createContactReadiness,
  createContactRouter,
  createIdempotencyStore,
  createSmtpMailer,
  getMailTimeoutMs,
  isValidSingleMailbox,
  sendContactEmails,
  validateContactPayload,
  validateMailConfiguration
} = require('./contact');
const {
  BRAND_LOGO_CID,
  BRAND_LOGO_FILENAME
} = require('./emails/assets');
const { escapeHtml, renderApiLandingPage } = require('./templates/api-landing');

const silentLogger = {
  error() {},
  info() {},
  warn() {}
};

function listenApp(expressApp) {
  return new Promise((resolve, reject) => {
    const server = http.createServer(expressApp);

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

function listen() {
  return listenApp(app);
}

function createContactTestApp(options = {}) {
  const testApp = express();

  testApp.use(express.json({ limit: '20kb' }));
  testApp.use('/api', createContactRouter({
    logger: silentLogger,
    ...options
  }));
  testApp.use((error, _req, res, _next) => {
    res.status(error.statusCode || 500).json({
      ok: false,
      success: false,
      error: 'Test server error'
    });
  });

  return testApp;
}

function validContactPayload(overrides = {}) {
  return {
    firstName: 'Serhat',
    lastName: 'Soruklu',
    email: 'reader@example.com',
    topic: CONTACT_TOPICS[0],
    message: 'Hello, I would like to discuss a systems architecture project with clear boundaries.',
    ...overrides
  };
}

function validMailEnv(overrides = {}) {
  return {
    NODE_ENV: 'production',
    SMTP_HOST: 'smtp.example.com',
    SMTP_PORT: '587',
    SMTP_SECURE: 'false',
    SMTP_REQUIRE_TLS: 'true',
    SMTP_USER: 'sender@example.com',
    SMTP_PASS: 'test-only-placeholder',
    CONTACT_INTERNAL_TO: 'inbox@example.com',
    CONTACT_REPLY_TO: 'reply@example.com',
    SERHAT_SITE_URL: 'https://example.com',
    ...overrides
  };
}

async function postJson(url, payload, headers = {}) {
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: JSON.stringify(payload)
  });
}

test('parseBoolean accepts only common enabled values', () => {
  assert.equal(parseBoolean('1'), true);
  assert.equal(parseBoolean('true'), true);
  assert.equal(parseBoolean('yes'), true);
  assert.equal(parseBoolean('false'), false);
  assert.equal(parseBoolean('unexpected'), false);
});

test('origin defaults are explicit for development and production', () => {
  assert.deepEqual(getAllowedOrigins({}, 'development'), ['http://localhost:4200']);
  assert.deepEqual(getAllowedOrigins({}, 'production'), [
    'https://serhatsoruklu.com',
    'https://www.serhatsoruklu.com'
  ]);
  assert.deepEqual(getAllowedOrigins({
    CORS_ORIGINS: 'https://one.example, https://two.example'
  }, 'production'), [
    'https://serhatsoruklu.com',
    'https://www.serhatsoruklu.com',
    'https://one.example',
    'https://two.example'
  ]);
});

test('trust proxy configuration accepts only a bounded hop count', () => {
  assert.equal(getTrustProxySetting({}), false);
  assert.equal(getTrustProxySetting({ TRUST_PROXY: 'false' }), false);
  assert.equal(getTrustProxySetting({ TRUST_PROXY: 'true' }), 1);
  assert.equal(getTrustProxySetting({ TRUST_PROXY: '2' }), 2);
  assert.equal(getTrustProxySetting({ TRUST_PROXY: '100' }), false);
  assert.equal(getTrustProxySetting({ TRUST_PROXY: 'loopback' }), false);
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

test('health endpoint is lightweight and does not expose environment details', async (t) => {
  const { server, url } = await listen();
  t.after(() => new Promise((resolve) => server.close(resolve)));

  const response = await fetch(`${url}/api/health`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.success, true);
  assert.equal(body.service, 'serhatsoruklu-backend');
  assert.equal(body.status, 'alive');
  assert.equal(typeof body.timestamp, 'string');
  assert.equal(body.environment, undefined);
  assert.equal(response.headers.get('x-powered-by'), null);
  assert.ok(response.headers.get('x-request-id'));
  assert.equal(response.headers.get('cache-control'), 'no-store');
});

test('readiness fails safely when SMTP configuration is absent', async (t) => {
  const runtime = createBackendApp({
    env: { NODE_ENV: 'production' },
    logger: silentLogger,
    mailer: null,
    nodeEnv: 'production'
  });
  const { server, url } = await listenApp(runtime.app);
  t.after(() => new Promise((resolve) => server.close(resolve)));

  await runtime.readiness.initialize();
  const response = await fetch(`${url}/api/ready`);
  const body = await response.json();

  assert.equal(response.status, 503);
  assert.equal(body.ok, false);
  assert.equal(body.status, 'not_ready');
  assert.deepEqual(body.checks.contactDelivery, {
    ready: false,
    reason: 'smtp_configuration_invalid',
    verification: 'not_started'
  });
  assert.doesNotMatch(JSON.stringify(body), /password|test-only-placeholder/i);
});

test('readiness verifies a mocked transporter once and then remains ready', async (t) => {
  let verifyCalls = 0;
  const runtime = createBackendApp({
    env: validMailEnv(),
    logger: silentLogger,
    mailer: {
      async verify() {
        verifyCalls += 1;
      }
    },
    nodeEnv: 'production',
    verifyOnStart: true
  });

  await Promise.all([
    runtime.readiness.initialize(),
    runtime.readiness.initialize()
  ]);

  const { server, url } = await listenApp(runtime.app);
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const response = await fetch(`${url}/api/ready`);
  const body = await response.json();

  assert.equal(verifyCalls, 1);
  assert.equal(response.status, 200);
  assert.equal(body.status, 'ready');
  assert.deepEqual(body.checks.contactDelivery, {
    ready: true,
    reason: 'smtp_verified',
    verification: 'passed'
  });
});

test('readiness reports a redacted failure when mocked SMTP verification fails', async () => {
  const readiness = createContactReadiness({
    env: validMailEnv(),
    logger: silentLogger,
    mailer: {
      async verify() {
        throw new Error('provider detail that must not be returned');
      }
    },
    nodeEnv: 'production',
    verifyOnStart: true
  });

  await readiness.initialize();

  assert.deepEqual(readiness.getStatus(), {
    ready: false,
    reason: 'smtp_verification_failed',
    verification: 'failed'
  });
  assert.doesNotMatch(JSON.stringify(readiness.getStatus()), /provider detail/i);
});

test('readiness bounds a stalled mocked verification and closes its transport', async () => {
  let closeCalls = 0;
  const readiness = createContactReadiness({
    env: validMailEnv(),
    logger: silentLogger,
    mailer: {
      close() {
        closeCalls += 1;
      },
      verify() {
        return new Promise(() => {});
      }
    },
    nodeEnv: 'production',
    verifyOnStart: true,
    verifyTimeoutMs: 250
  });
  const started = Date.now();

  await readiness.initialize();

  assert.ok(Date.now() - started < 1_000);
  assert.equal(closeCalls, 1);
  assert.deepEqual(readiness.getStatus(), {
    ready: false,
    reason: 'smtp_verification_failed',
    verification: 'failed'
  });
});

test('unknown API routes return JSON 404', async (t) => {
  const { server, url } = await listen();
  t.after(() => new Promise((resolve) => server.close(resolve)));

  const response = await fetch(`${url}/api/missing`);
  const body = await response.json();

  assert.equal(response.status, 404);
  assert.deepEqual(body, {
    ok: false,
    success: false,
    error: 'API route not found'
  });
});

test('malformed JSON receives a generic error without echoing request content', async (t) => {
  const { server, url } = await listen();
  t.after(() => new Promise((resolve) => server.close(resolve)));

  const response = await fetch(`${url}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{"secret":"do-not-echo",}'
  });
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.error, 'Invalid JSON request body');
  assert.doesNotMatch(JSON.stringify(body), /do-not-echo/);
});

test('production CORS permits apex and www while rejecting other origins', async (t) => {
  const runtime = createBackendApp({
    env: { NODE_ENV: 'production' },
    logger: silentLogger,
    mailer: null,
    nodeEnv: 'production'
  });
  const { server, url } = await listenApp(runtime.app);
  t.after(() => new Promise((resolve) => server.close(resolve)));

  for (const origin of ['https://serhatsoruklu.com', 'https://www.serhatsoruklu.com']) {
    const response = await fetch(`${url}/api/health`, {
      headers: { Origin: origin }
    });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('access-control-allow-origin'), origin);
  }

  const rejected = await fetch(`${url}/api/health`, {
    headers: { Origin: 'https://attacker.example' }
  });
  assert.equal(rejected.status, 403);
  assert.equal((await rejected.json()).error, 'Request origin is not allowed');
});

test('validateContactPayload normalizes valid contact data', () => {
  const message = '  First line with trailing spaces.  \r\n\r\n\r\n\r\n  Second indented line.  ';
  const result = validateContactPayload(validContactPayload({
    firstName: '  Ada  ',
    lastName: '  Lovelace  ',
    email: '  ADA@example.COM  ',
    message
  }));

  assert.equal(result.errors, null);
  assert.equal(result.honeypot, false);
  assert.equal(result.data.firstName, 'Ada');
  assert.equal(result.data.lastName, 'Lovelace');
  assert.equal(result.data.email, 'ada@example.com');
  assert.equal(
    result.data.message,
    'First line with trailing spaces.  \r\n\r\n\r\n\r\n  Second indented line.',
    'Only outer message whitespace should be trimmed.',
  );
});

test('single-mailbox validation rejects wrappers, recipient lists, CRLF, and malformed domains', () => {
  const invalidAddresses = [
    'victim@example.com,other@example.com',
    '<victim@example.com>',
    'Person <victim@example.com>',
    'victim@example.com\r\nBcc:other@example.com',
    'victim@example',
    'victim@-example.com',
    'victim@example..com',
    '.victim@example.com',
    'victim.@example.com',
    'victim..name@example.com'
  ];

  assert.equal(isValidSingleMailbox('person+tag@example.co.uk'), true);

  for (const email of invalidAddresses) {
    assert.equal(isValidSingleMailbox(email), false, email);
    const result = validateContactPayload(validContactPayload({ email }));
    assert.equal(result.errors.email, 'Enter one valid email address.');
  }

  const arrayAddress = validateContactPayload(validContactPayload({
    email: ['victim@example.com', 'other@example.com']
  }));
  assert.equal(arrayAddress.errors.email, 'Email is required.');

  const invalidSubmissionId = validateContactPayload(validContactPayload({
    submissionId: ['not', 'a', 'string']
  }));
  assert.equal(invalidSubmissionId.errors.submissionId, 'Submission identifier is invalid.');
});

test('validateContactPayload rejects invalid and spam-like payloads', () => {
  const invalid = validateContactPayload({
    firstName: 'A',
    lastName: '',
    email: 'not-an-email',
    topic: 'Unsupported',
    message: 'short'
  });

  assert.deepEqual(Object.keys(invalid.errors).sort(), ['email', 'firstName', 'lastName', 'message', 'topic']);

  const spam = validateContactPayload(validContactPayload({
    message: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
  }));

  assert.equal(spam.errors.message, 'Message looks automated. Please write a normal short note.');
});

test('mail configuration validation returns reason codes without secret values', () => {
  assert.deepEqual(validateMailConfiguration(validMailEnv()), {
    ok: true,
    reasons: []
  });

  const invalid = validateMailConfiguration({
    SMTP_PASS: 'private-value-that-must-not-appear'
  });
  assert.equal(invalid.ok, false);
  assert.ok(invalid.reasons.includes('smtp_host_invalid'));
  assert.ok(invalid.reasons.includes('smtp_user_invalid'));
  assert.ok(invalid.reasons.includes('contact_internal_recipient_invalid'));
  assert.doesNotMatch(JSON.stringify(invalid), /private-value/);

  const invalidBooleans = validateMailConfiguration(validMailEnv({
    SMTP_REQUIRE_TLS: 'tru',
    SMTP_SECURE: 'sometimes',
    SMTP_TLS_REJECT_UNAUTHORIZED: '',
    SMTP_VERIFY_ON_START: 'enabled'
  }));
  assert.equal(invalidBooleans.ok, false);
  assert.ok(invalidBooleans.reasons.includes('smtp_require_tls_invalid'));
  assert.ok(invalidBooleans.reasons.includes('smtp_secure_invalid'));
  assert.ok(invalidBooleans.reasons.includes('smtp_tls_validation_invalid'));
  assert.ok(invalidBooleans.reasons.includes('smtp_verify_on_start_invalid'));
});

test('mail timeout defaults to five seconds and is capped at six seconds', () => {
  assert.equal(getMailTimeoutMs({}), 5_000);
  assert.equal(getMailTimeoutMs({ CONTACT_MAIL_TIMEOUT_MS: '4000' }), 4_000);
  assert.equal(getMailTimeoutMs({ CONTACT_MAIL_TIMEOUT_MS: '60000' }), 6_000);
  assert.equal(getMailTimeoutMs({ CONTACT_MAIL_TIMEOUT_MS: 'invalid' }), 5_000);
});

test('buildContactEmails uses authenticated SMTP sender and safe reply-to flow', () => {
  const payload = validContactPayload({
    firstName: '<Serhat>',
    lastName: 'Soruklu',
    email: 'person@example.com',
    topic: 'Coupyn',
    message: 'This message contains <strong>HTML</strong> and <script>alert(1)</script> that must be escaped.'
  });
  const emails = buildContactEmails(payload, {
    SMTP_USER: 'admin@coupyn.com',
    CONTACT_INTERNAL_TO: 'mail@serhatsoruklu.com',
    CONTACT_REPLY_TO: 'mail@serhatsoruklu.com',
    SERHAT_SITE_URL: 'http://localhost:4200'
  });

  assert.equal(emails.internal.from, 'SerhatSoruklu.com Contact <admin@coupyn.com>');
  assert.equal(emails.internal.to, 'mail@serhatsoruklu.com');
  assert.equal(emails.internal.replyTo, 'person@example.com');
  assert.equal(emails.confirmation.from, 'Serhat Soruklu <admin@coupyn.com>');
  assert.equal(emails.confirmation.to, 'person@example.com');
  assert.equal(emails.confirmation.replyTo, 'mail@serhatsoruklu.com');
  assert.equal(emails.confirmation.subject, 'Message received - SerhatSoruklu.com');
  assert.match(emails.internal.subject, /New contact: Coupyn - <Serhat> Soruklu/);
  assert.match(emails.internal.html, /background:#f6f4ee/);
  assert.match(emails.internal.html, new RegExp(`src="cid:${BRAND_LOGO_CID}"`));
  assert.match(emails.confirmation.html, new RegExp(`src="cid:${BRAND_LOGO_CID}"`));
  assert.equal(emails.internal.attachments.length, 1);
  assert.equal(emails.internal.attachments[0].filename, BRAND_LOGO_FILENAME);
  assert.equal(emails.internal.attachments[0].path, undefined);
  assert.equal(emails.internal.attachments[0].cid, BRAND_LOGO_CID);
  assert.equal(emails.internal.attachments[0].contentType, 'image/png');
  assert.equal(emails.internal.attachments[0].contentDisposition, 'inline');
  assert.ok(Buffer.isBuffer(emails.internal.attachments[0].content));
  assert.ok(emails.internal.attachments[0].content.length > 0);
  assert.deepEqual(emails.confirmation.attachments, emails.internal.attachments);
  assert.match(emails.internal.html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.doesNotMatch(emails.internal.html, /<script>alert\(1\)<\/script>/);
});

test('real Nodemailer serialization embeds both CID logos with file access disabled', async () => {
  const mailer = nodemailer.createTransport({
    streamTransport: true,
    buffer: true,
    disableFileAccess: true,
    disableUrlAccess: true
  });
  const emails = buildContactEmails(validContactPayload(), validMailEnv());

  for (const email of [emails.internal, emails.confirmation]) {
    const info = await mailer.sendMail(email);
    const serializedMessage = info.message.toString('utf8');

    assert.match(serializedMessage, /Content-Type: image\/png/i);
    assert.match(serializedMessage, new RegExp(`Content-ID: <${BRAND_LOGO_CID}>`, 'i'));
    assert.doesNotMatch(serializedMessage, /EFILEACCESS|File access rejected/i);
  }
});

test('contact endpoint returns the explicit full-delivery contract', async (t) => {
  const sentMessages = [];
  const contactApp = createContactTestApp({
    env: validMailEnv(),
    mailer: {
      async sendMail(message) {
        sentMessages.push(message);
      }
    }
  });
  const { server, url } = await listenApp(contactApp);
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const submissionId = 'submission-full-0001';
  const response = await postJson(`${url}/api/contact`, {
    ...validContactPayload(),
    submissionId
  }, {
    'Idempotency-Key': submissionId
  });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(body, {
    ok: true,
    success: true,
    code: 'CONTACT_DELIVERED',
    deliveryStatus: 'complete',
    internalDelivered: true,
    confirmationDelivered: true,
    submissionId,
    message: 'Message received.'
  });
  assert.equal(response.headers.get('idempotency-key'), submissionId);
  assert.equal(sentMessages.length, 2);
  assert.equal(sentMessages[0].to, 'inbox@example.com');
  assert.equal(sentMessages[1].to, 'reader@example.com');
});

test('idempotent API retry replays success without sending duplicate mail', async (t) => {
  let sendCount = 0;
  const contactApp = createContactTestApp({
    env: validMailEnv(),
    mailer: {
      async sendMail() {
        sendCount += 1;
      }
    }
  });
  const { server, url } = await listenApp(contactApp);
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const submissionId = 'submission-retry-0001';
  const payload = { ...validContactPayload(), submissionId };

  const first = await postJson(`${url}/api/contact`, payload, { 'Idempotency-Key': submissionId });
  const second = await postJson(`${url}/api/contact`, payload, { 'Idempotency-Key': submissionId });

  assert.equal(first.status, 200);
  assert.equal(second.status, 200);
  assert.equal((await second.json()).code, 'CONTACT_DELIVERED');
  assert.equal(sendCount, 2);
});

test('fallback payload fingerprint also prevents duplicate sends for legacy clients', async (t) => {
  let sendCount = 0;
  const contactApp = createContactTestApp({
    env: validMailEnv(),
    mailer: {
      async sendMail() {
        sendCount += 1;
      }
    }
  });
  const { server, url } = await listenApp(contactApp);
  t.after(() => new Promise((resolve) => server.close(resolve)));

  const first = await postJson(`${url}/api/contact`, validContactPayload());
  const firstBody = await first.json();
  const second = await postJson(`${url}/api/contact`, validContactPayload());
  const secondBody = await second.json();

  assert.equal(first.status, 200);
  assert.equal(second.status, 200);
  assert.match(firstBody.submissionId, /^auto-[a-f0-9]{32}$/u);
  assert.equal(secondBody.submissionId, firstBody.submissionId);
  assert.equal(sendCount, 2);
});

test('reuse of an idempotency key with different content returns conflict', async (t) => {
  let sendCount = 0;
  const contactApp = createContactTestApp({
    env: validMailEnv(),
    mailer: {
      async sendMail() {
        sendCount += 1;
      }
    }
  });
  const { server, url } = await listenApp(contactApp);
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const submissionId = 'submission-conflict-0001';

  await postJson(`${url}/api/contact`, {
    ...validContactPayload(),
    submissionId
  });
  const conflict = await postJson(`${url}/api/contact`, {
    ...validContactPayload({ message: 'This is different valid content for the same submission identifier.' }),
    submissionId
  });
  const body = await conflict.json();

  assert.equal(conflict.status, 409);
  assert.equal(body.code, 'IDEMPOTENCY_CONFLICT');
  assert.equal(sendCount, 2);
});

test('concurrent duplicate requests share one delivery operation', async (t) => {
  let sendCount = 0;
  const contactApp = createContactTestApp({
    env: validMailEnv(),
    mailer: {
      async sendMail() {
        sendCount += 1;
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
    }
  });
  const { server, url } = await listenApp(contactApp);
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const submissionId = 'submission-concurrent-0001';
  const payload = { ...validContactPayload(), submissionId };

  const [first, second] = await Promise.all([
    postJson(`${url}/api/contact`, payload),
    postJson(`${url}/api/contact`, payload)
  ]);

  assert.equal(first.status, 200);
  assert.equal(second.status, 200);
  assert.equal(sendCount, 2);
});

test('partial delivery is explicit and retry sends only the missing confirmation', async (t) => {
  let internalSends = 0;
  let confirmationSends = 0;
  const contactApp = createContactTestApp({
    env: validMailEnv(),
    mailer: {
      async sendMail(message) {
        if (message.to === 'inbox@example.com') {
          internalSends += 1;
          return;
        }

        confirmationSends += 1;
        if (confirmationSends === 1) {
          throw new Error('mocked confirmation failure');
        }
      }
    }
  });
  const { server, url } = await listenApp(contactApp);
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const submissionId = 'submission-partial-0001';
  const payload = { ...validContactPayload(), submissionId };

  const partial = await postJson(`${url}/api/contact`, payload);
  const partialBody = await partial.json();
  const retry = await postJson(`${url}/api/contact`, payload);
  const retryBody = await retry.json();
  const replay = await postJson(`${url}/api/contact`, payload);

  assert.equal(partial.status, 202);
  assert.deepEqual(partialBody, {
    ok: true,
    success: true,
    code: 'PARTIAL_DELIVERY',
    deliveryStatus: 'internal_delivered',
    internalDelivered: true,
    confirmationDelivered: false,
    submissionId,
    message: 'Your message was received, but we could not send a confirmation email.'
  });
  assert.equal(retry.status, 200);
  assert.equal(retryBody.code, 'CONTACT_DELIVERED');
  assert.equal(replay.status, 200);
  assert.equal(internalSends, 1);
  assert.equal(confirmationSends, 2);
});

test('partial-delivery attempts are counted and eventually rate limited', async (t) => {
  let internalSends = 0;
  let confirmationSends = 0;
  const contactApp = createContactTestApp({
    env: validMailEnv(),
    mailer: {
      async sendMail(message) {
        if (message.to === 'inbox@example.com') {
          internalSends += 1;
          return;
        }

        confirmationSends += 1;
        throw new Error('mocked confirmation failure');
      }
    }
  });
  const { server, url } = await listenApp(contactApp);
  t.after(() => new Promise((resolve) => server.close(resolve)));

  for (let index = 0; index < 5; index += 1) {
    const response = await postJson(`${url}/api/contact`, validContactPayload({
      email: `reader-${index}@example.com`
    }));
    assert.equal(response.status, 202);
    assert.equal((await response.json()).code, 'PARTIAL_DELIVERY');
  }

  const limitedResponse = await postJson(`${url}/api/contact`, validContactPayload({
    email: 'sixth@example.com'
  }));
  const limitedBody = await limitedResponse.json();

  assert.equal(limitedResponse.status, 429);
  assert.deepEqual(limitedBody, {
    ok: false,
    success: false,
    code: 'RATE_LIMITED',
    message: 'Too many contact attempts. Please try again later.'
  });
  assert.equal(internalSends, 5);
  assert.equal(confirmationSends, 5);
});

test('all endpoint attempts count toward the contact rate limit', async (t) => {
  const contactApp = createContactTestApp({
    mailer: { async sendMail() {} }
  });
  const { server, url } = await listenApp(contactApp);
  t.after(() => new Promise((resolve) => server.close(resolve)));

  for (let index = 0; index < 5; index += 1) {
    const response = await postJson(`${url}/api/contact`, validContactPayload({
      email: 'bad',
      message: 'too short'
    }));
    assert.equal(response.status, 400);
  }

  const limited = await postJson(`${url}/api/contact`, validContactPayload({
    email: 'bad',
    message: 'too short'
  }));
  assert.equal(limited.status, 429);
});

test('contact endpoint accepts honeypot submissions without sending mail', async (t) => {
  let sendCount = 0;
  const contactApp = createContactTestApp({
    mailer: {
      async sendMail() {
        sendCount += 1;
      }
    }
  });
  const { server, url } = await listenApp(contactApp);
  t.after(() => new Promise((resolve) => server.close(resolve)));

  const response = await postJson(`${url}/api/contact`, validContactPayload({
    website: 'https://bot.example'
  }));

  assert.equal(response.status, 202);
  assert.equal((await response.json()).success, true);
  assert.equal(sendCount, 0);
});

test('unconfigured contact delivery returns explicit 503 state', async (t) => {
  const contactApp = createContactTestApp({ mailer: null });
  const { server, url } = await listenApp(contactApp);
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const response = await postJson(`${url}/api/contact`, validContactPayload());
  const body = await response.json();

  assert.equal(response.status, 503);
  assert.equal(body.code, 'CONTACT_DELIVERY_NOT_CONFIGURED');
  assert.equal(body.deliveryStatus, 'not_configured');
  assert.equal(body.internalDelivered, false);
});

test('internal delivery failure returns explicit safe not-delivered state', async (t) => {
  const contactApp = createContactTestApp({
    env: validMailEnv(),
    mailer: {
      async sendMail() {
        const error = new Error('smtp password leaked in stack');
        error.code = 'EAUTH';
        error.command = 'AUTH';
        throw error;
      }
    }
  });
  const { server, url } = await listenApp(contactApp);
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const response = await postJson(`${url}/api/contact`, validContactPayload());
  const body = await response.json();

  assert.equal(response.status, 502);
  assert.equal(body.code, 'CONTACT_DELIVERY_FAILED');
  assert.equal(body.deliveryStatus, 'not_delivered');
  assert.equal(body.internalDelivered, false);
  assert.doesNotMatch(JSON.stringify(body), /smtp password|stack/i);
});

test('SMTP mailer applies bounded transport timeouts without an uncancelled outer race', () => {
  const mailer = createSmtpMailer(validMailEnv({
    CONTACT_MAIL_TIMEOUT_MS: '60000'
  }));

  assert.equal(mailer.options.connectionTimeout, 6_000);
  assert.equal(mailer.options.greetingTimeout, 6_000);
  assert.equal(mailer.options.socketTimeout, 6_000);
  mailer.close();
});

test('SMTP mailer applies every accepted TLS verification boolean consistently', () => {
  for (const setting of ['false', '0', 'no', 'off', ' false ']) {
    const mailer = createSmtpMailer(validMailEnv({
      SMTP_TLS_REJECT_UNAUTHORIZED: setting
    }));
    assert.equal(mailer.options.tls.rejectUnauthorized, false);
    mailer.close();
  }

  for (const setting of ['true', '1', 'yes', 'on', ' true ']) {
    const mailer = createSmtpMailer(validMailEnv({
      SMTP_TLS_REJECT_UNAUTHORIZED: setting
    }));
    assert.equal(mailer.options.tls.rejectUnauthorized, true);
    mailer.close();
  }
});

test('sendContactEmails exposes a redacted transport timeout state', async () => {
  const timeoutError = new Error('provider details must stay private');
  timeoutError.code = 'ETIMEDOUT';
  timeoutError.command = 'CONN';
  const result = await sendContactEmails(validContactPayload(), {
    async sendMail() {
      throw timeoutError;
    }
  });

  assert.deepEqual(result, {
    deliveryStatus: 'unknown',
    internalDelivered: false,
    internalDeliveryUnknown: true,
    confirmationDelivered: false,
    failureCode: 'ETIMEDOUT'
  });
});

test('ambiguous SMTP failure is terminal and idempotent retries never resend internal mail', async (t) => {
  let sendCount = 0;
  const contactApp = createContactTestApp({
    env: validMailEnv(),
    mailer: {
      async sendMail() {
        sendCount += 1;
        const error = new Error('provider acknowledgement was not received');
        error.code = 'ETIMEDOUT';
        throw error;
      }
    }
  });
  const { server, url } = await listenApp(contactApp);
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const submissionId = 'submission-ambiguous-smtp-0001';
  const payload = { ...validContactPayload(), submissionId };
  const first = await postJson(`${url}/api/contact`, payload, {
    'Idempotency-Key': submissionId
  });
  const firstBody = await first.json();
  const retry = await postJson(`${url}/api/contact`, payload, {
    'Idempotency-Key': submissionId
  });
  const retryBody = await retry.json();

  assert.equal(first.status, 202);
  assert.equal(retry.status, 202);
  assert.deepEqual(firstBody, retryBody);
  assert.equal(firstBody.code, 'CONTACT_DELIVERY_UNKNOWN');
  assert.equal(firstBody.deliveryStatus, 'unknown');
  assert.equal(firstBody.internalDeliveryUnknown, true);
  assert.match(firstBody.message, /do not resend/i);
  assert.equal(sendCount, 1);
});

test('late SMTP completion stays in flight so retries cannot duplicate internal mail', async (t) => {
  let releaseInternal;
  let internalSends = 0;
  let confirmationSends = 0;
  const internalPending = new Promise((resolve) => {
    releaseInternal = resolve;
  });
  const contactApp = createContactTestApp({
    env: validMailEnv(),
    mailer: {
      async sendMail(message) {
        if (message.to === 'inbox@example.com') {
          internalSends += 1;
          await internalPending;
          return;
        }

        confirmationSends += 1;
      }
    }
  });
  const { server, url } = await listenApp(contactApp);
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const submissionId = 'submission-late-smtp-0001';
  const payload = { ...validContactPayload(), submissionId };
  const firstRequest = postJson(`${url}/api/contact`, payload, {
    'Idempotency-Key': submissionId
  });

  while (internalSends === 0) {
    await new Promise((resolve) => setImmediate(resolve));
  }

  const retryRequest = postJson(`${url}/api/contact`, payload, {
    'Idempotency-Key': submissionId
  });
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(internalSends, 1);

  releaseInternal();
  const [first, retry] = await Promise.all([firstRequest, retryRequest]);

  assert.equal(first.status, 200);
  assert.equal(retry.status, 200);
  assert.equal(internalSends, 1);
  assert.equal(confirmationSends, 1);
});

test('idempotency store applies TTL pruning and a hard entry bound', async () => {
  let timestamp = 0;
  const store = createIdempotencyStore({
    maxEntries: 2,
    now: () => timestamp,
    ttlMs: 1_000
  });
  const operation = async () => ({ deliveryStatus: 'complete' });

  await store.execute({ fingerprint: 'a', operation, submissionId: 'submission-a' });
  await store.execute({ fingerprint: 'b', operation, submissionId: 'submission-b' });
  const capacity = await store.execute({
    fingerprint: 'c',
    operation,
    submissionId: 'submission-c'
  });
  assert.deepEqual(capacity, { kind: 'capacity', result: null });
  assert.equal(store.size(), 2);

  timestamp = 1_001;
  store.prune();
  assert.equal(store.size(), 0);
});

test('graceful shutdown stops HTTP acceptance and disconnects MongoDB once', async () => {
  const calls = [];
  const fakeServer = {
    listening: true,
    close(callback) {
      calls.push('http-close');
      this.listening = false;
      callback();
    },
    closeIdleConnections() {
      calls.push('http-idle-close');
    }
  };
  const fakeMongoose = {
    connection: { readyState: 1 },
    async disconnect() {
      calls.push('mongo-disconnect');
      this.connection.readyState = 0;
    }
  };
  const fakeMailer = {
    async close() {
      calls.push('mailer-close');
    }
  };
  const shutdown = createGracefulShutdown({
    logger: silentLogger,
    mailer: fakeMailer,
    mongooseClient: fakeMongoose,
    server: fakeServer,
    timeoutMs: 500
  });

  const [first, second] = await Promise.all([shutdown('SIGTERM'), shutdown('SIGINT')]);

  assert.equal(first, true);
  assert.equal(second, true);
  assert.equal(calls.filter((call) => call === 'http-close').length, 1);
  assert.equal(calls.filter((call) => call === 'mongo-disconnect').length, 1);
  assert.ok(calls.includes('http-idle-close'));
  assert.deepEqual(calls, [
    'http-idle-close',
    'http-close',
    'mailer-close',
    'mongo-disconnect'
  ]);
});
