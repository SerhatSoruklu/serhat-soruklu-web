const crypto = require('node:crypto');
const express = require('express');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');
const { getEmailBrandAttachments } = require('./emails/assets');
const { escapeHtml } = require('./emails/templates/layout');
const { renderContactConfirmationEmail } = require('./emails/templates/contactConfirmation');
const { renderContactNotificationEmail } = require('./emails/templates/contactNotification');

const CONTACT_TOPICS = [
  'Systems architecture',
  'Product engineering',
  'Infrastructure / deployment',
  'Coupyn',
  'ChatPDM',
  'Collaboration',
  'Other'
];
const CONTACT_TO_DEFAULT = 'mail@serhatsoruklu.com';
const SMTP_USER_DEFAULT = 'admin@coupyn.com';
const SERHAT_SITE_URL_DEFAULT = 'https://serhatsoruklu.com';
const CONTACT_MAIL_TIMEOUT_MS_DEFAULT = 5_000;
const CONTACT_MAIL_TIMEOUT_MS_MAX = 6_000;
const CONTACT_RATE_LIMIT_WINDOW_MS_DEFAULT = 60 * 60 * 1000;
const CONTACT_RATE_LIMIT_MAX_DEFAULT = 5;
const CONTACT_IDEMPOTENCY_TTL_MS_DEFAULT = 15 * 60 * 1000;
const CONTACT_IDEMPOTENCY_MAX_ENTRIES_DEFAULT = 1_000;
const SMTP_VERIFY_TIMEOUT_MS_DEFAULT = 5_000;
const SMTP_VERIFY_TIMEOUT_MS_MAX = 10_000;
const IDEMPOTENCY_KEY_PATTERN = /^[A-Za-z0-9._:-]{8,128}$/u;
const ENABLED_BOOLEAN_VALUES = new Set(['1', 'true', 'yes', 'on']);
const DISABLED_BOOLEAN_VALUES = new Set(['0', 'false', 'no', 'off']);
const FIELD_LIMITS = {
  firstName: { min: 2, max: 60 },
  lastName: { min: 2, max: 60 },
  email: { max: 160 },
  message: { min: 20, max: 2000 }
};

function parseBoolean(value) {
  return ENABLED_BOOLEAN_VALUES.has(String(value).trim().toLowerCase());
}

function isValidBooleanSetting(value) {
  const normalizedValue = String(value).trim().toLowerCase();

  return ENABLED_BOOLEAN_VALUES.has(normalizedValue) || DISABLED_BOOLEAN_VALUES.has(normalizedValue);
}

function parseBoundedInteger(value, fallback, minimum, maximum) {
  const parsed = Number(value);

  if (!Number.isSafeInteger(parsed) || parsed < minimum) {
    return fallback;
  }

  return Math.min(parsed, maximum);
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function normalizeShortText(value) {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
}

function normalizeEmail(value) {
  return normalizeShortText(value).toLowerCase();
}

function normalizeMessage(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function hasHoneypotValue(payload) {
  return ['website', 'company', 'url'].some((field) => normalizeShortText(payload[field]).length > 0);
}

function isValidSingleMailbox(email) {
  if (typeof email !== 'string' || email.length === 0 || email.length > FIELD_LIMITS.email.max) {
    return false;
  }

  if (/[,<>\r\n\s]/u.test(email) || email.startsWith('.') || email.endsWith('.') || email.includes('..')) {
    return false;
  }

  const parts = email.split('@');

  if (parts.length !== 2) {
    return false;
  }

  const [localPart, domain] = parts;

  if (localPart.length === 0 || localPart.length > 64 || domain.length === 0 || domain.length > 253) {
    return false;
  }

  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    return false;
  }

  if (!/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+$/u.test(localPart)) {
    return false;
  }

  const labels = domain.split('.');

  if (labels.length < 2) {
    return false;
  }

  return labels.every((label) => (
    label.length > 0
    && label.length <= 63
    && /^[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?$/u.test(label)
  ));
}

function countLinks(value) {
  return (value.match(/https?:\/\/|www\./giu) || []).length;
}

function isSpamLikeMessage(message) {
  const compact = message.replace(/\s/g, '').toLowerCase();

  if (/(.)\1{24,}/u.test(compact)) {
    return true;
  }

  if (message.length >= 80 && new Set(compact).size <= 6) {
    return true;
  }

  if (countLinks(message) > 5) {
    return true;
  }

  const words = message.toLowerCase().match(/[a-z0-9]{3,}/gu) || [];

  if (words.length < 20) {
    return false;
  }

  const counts = new Map();
  let highestCount = 0;

  for (const word of words) {
    const nextCount = (counts.get(word) || 0) + 1;
    counts.set(word, nextCount);
    highestCount = Math.max(highestCount, nextCount);
  }

  return highestCount / words.length > 0.65;
}

function addLengthError(errors, field, label, value, limits) {
  if (!value) {
    errors[field] = `${label} is required.`;
    return;
  }

  if (value.length < limits.min) {
    errors[field] = `${label} must be at least ${limits.min} characters.`;
    return;
  }

  if (value.length > limits.max) {
    errors[field] = `${label} must be ${limits.max} characters or fewer.`;
  }
}

function validateContactPayload(payload) {
  if (!isPlainObject(payload)) {
    return {
      data: null,
      errors: {
        form: 'Expected a JSON object.'
      },
      honeypot: false,
      submissionId: null
    };
  }

  if (hasHoneypotValue(payload)) {
    return {
      data: null,
      errors: null,
      honeypot: true,
      submissionId: null
    };
  }

  const data = {
    firstName: normalizeShortText(payload.firstName),
    lastName: normalizeShortText(payload.lastName),
    email: normalizeEmail(payload.email),
    topic: normalizeShortText(payload.topic),
    message: normalizeMessage(payload.message)
  };
  const errors = {};
  let submissionId = null;

  if (Object.hasOwn(payload, 'submissionId')) {
    if (typeof payload.submissionId === 'string') {
      submissionId = payload.submissionId.trim();
    } else {
      errors.submissionId = 'Submission identifier is invalid.';
    }
  }

  addLengthError(errors, 'firstName', 'First name', data.firstName, FIELD_LIMITS.firstName);
  addLengthError(errors, 'lastName', 'Last name', data.lastName, FIELD_LIMITS.lastName);

  if (!data.email) {
    errors.email = 'Email is required.';
  } else if (data.email.length > FIELD_LIMITS.email.max) {
    errors.email = `Email must be ${FIELD_LIMITS.email.max} characters or fewer.`;
  } else if (!isValidSingleMailbox(data.email)) {
    errors.email = 'Enter one valid email address.';
  }

  if (!data.topic) {
    errors.topic = 'Topic is required.';
  } else if (!CONTACT_TOPICS.includes(data.topic)) {
    errors.topic = 'Choose a valid topic.';
  }

  addLengthError(errors, 'message', 'Message', data.message, FIELD_LIMITS.message);

  if (!errors.message && isSpamLikeMessage(data.message)) {
    errors.message = 'Message looks automated. Please write a normal short note.';
  }

  if (submissionId !== null && !IDEMPOTENCY_KEY_PATTERN.test(submissionId)) {
    errors.submissionId = 'Submission identifier is invalid.';
  }

  return {
    data,
    errors: Object.keys(errors).length > 0 ? errors : null,
    honeypot: false,
    submissionId
  };
}

function formatAddress(label, email) {
  const safeLabel = String(label).replace(/[\r\n"]/g, '').trim();
  const safeEmail = String(email).replace(/[\r\n<>]/g, '').trim();

  return `${safeLabel} <${safeEmail}>`;
}

function getMailConfig(env = process.env) {
  const internalTo = env.CONTACT_INTERNAL_TO || CONTACT_TO_DEFAULT;
  const replyTo = env.CONTACT_REPLY_TO || CONTACT_TO_DEFAULT;
  const smtpUser = env.SMTP_USER || SMTP_USER_DEFAULT;
  const siteUrl = env.SERHAT_SITE_URL || SERHAT_SITE_URL_DEFAULT;

  return {
    internalTo,
    replyTo,
    smtpUser,
    siteUrl,
    notificationFrom: formatAddress('SerhatSoruklu.com Contact', smtpUser),
    confirmationFrom: formatAddress('Serhat Soruklu', smtpUser)
  };
}

function buildInternalEmail(data, env = process.env) {
  const config = getMailConfig(env);
  const fullName = `${data.firstName} ${data.lastName}`;
  const { html, text } = renderContactNotificationEmail(data, {
    siteUrl: config.siteUrl
  });

  return {
    from: config.notificationFrom,
    to: config.internalTo,
    replyTo: data.email,
    subject: `New contact: ${data.topic} - ${fullName}`,
    text,
    html,
    attachments: getEmailBrandAttachments()
  };
}

function buildConfirmationEmail(data, env = process.env) {
  const config = getMailConfig(env);
  const { html, text } = renderContactConfirmationEmail(data, {
    siteUrl: config.siteUrl
  });

  return {
    from: config.confirmationFrom,
    to: data.email,
    replyTo: config.replyTo,
    subject: 'Message received - SerhatSoruklu.com',
    text,
    html,
    attachments: getEmailBrandAttachments()
  };
}

function buildContactEmails(data, env = process.env) {
  return {
    internal: buildInternalEmail(data, env),
    confirmation: buildConfirmationEmail(data, env)
  };
}

function isValidHostname(hostname) {
  if (typeof hostname !== 'string' || hostname.length === 0 || hostname.length > 253 || /[\s/:]/u.test(hostname)) {
    return false;
  }

  return hostname.split('.').every((label) => (
    label.length > 0
    && label.length <= 63
    && /^[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?$/u.test(label)
  ));
}

function validateMailConfiguration(env = process.env) {
  const reasons = [];
  const smtpPort = Number(env.SMTP_PORT || 587);
  const booleanSettings = [
    ['SMTP_SECURE', 'smtp_secure_invalid'],
    ['SMTP_REQUIRE_TLS', 'smtp_require_tls_invalid'],
    ['SMTP_TLS_REJECT_UNAUTHORIZED', 'smtp_tls_validation_invalid'],
    ['SMTP_VERIFY_ON_START', 'smtp_verify_on_start_invalid']
  ];

  if (!isValidHostname(env.SMTP_HOST)) {
    reasons.push('smtp_host_invalid');
  }

  if (!Number.isSafeInteger(smtpPort) || smtpPort < 1 || smtpPort > 65_535) {
    reasons.push('smtp_port_invalid');
  }

  for (const [name, reason] of booleanSettings) {
    if (env[name] !== undefined && !isValidBooleanSetting(env[name])) {
      reasons.push(reason);
    }
  }

  if (!isValidSingleMailbox(normalizeEmail(env.SMTP_USER))) {
    reasons.push('smtp_user_invalid');
  }

  if (typeof env.SMTP_PASS !== 'string' || env.SMTP_PASS.length === 0) {
    reasons.push('smtp_password_missing');
  }

  if (!isValidSingleMailbox(normalizeEmail(env.CONTACT_INTERNAL_TO))) {
    reasons.push('contact_internal_recipient_invalid');
  }

  if (!isValidSingleMailbox(normalizeEmail(env.CONTACT_REPLY_TO))) {
    reasons.push('contact_reply_recipient_invalid');
  }

  if (env.SERHAT_SITE_URL) {
    try {
      const siteUrl = new URL(env.SERHAT_SITE_URL);

      if (!['http:', 'https:'].includes(siteUrl.protocol)) {
        reasons.push('site_url_invalid');
      }
    } catch {
      reasons.push('site_url_invalid');
    }
  }

  return {
    ok: reasons.length === 0,
    reasons
  };
}

function getMailTimeoutMs(env = process.env, fallback = CONTACT_MAIL_TIMEOUT_MS_DEFAULT) {
  return parseBoundedInteger(
    env.CONTACT_MAIL_TIMEOUT_MS,
    fallback,
    250,
    CONTACT_MAIL_TIMEOUT_MS_MAX
  );
}

function createSmtpMailer(env = process.env) {
  if (!validateMailConfiguration(env).ok) {
    return null;
  }

  const timeoutMs = getMailTimeoutMs(env);

  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: Number(env.SMTP_PORT) || 587,
    secure: parseBoolean(env.SMTP_SECURE),
    requireTLS: parseBoolean(env.SMTP_REQUIRE_TLS),
    name: env.SMTP_NAME || undefined,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS
    },
    connectionTimeout: timeoutMs,
    greetingTimeout: timeoutMs,
    socketTimeout: timeoutMs,
    disableFileAccess: true,
    disableUrlAccess: true,
    tls: {
      rejectUnauthorized: env.SMTP_TLS_REJECT_UNAUTHORIZED === undefined
        ? true
        : parseBoolean(env.SMTP_TLS_REJECT_UNAUTHORIZED)
    }
  });
}

async function runWithTimeout(operation, timeoutMs, timeoutCode, timeoutMessage) {
  let timeoutId;
  const timeoutPromise = new Promise((_resolve, reject) => {
    timeoutId = setTimeout(() => {
      const error = new Error(timeoutMessage);
      error.code = timeoutCode;
      reject(error);
    }, timeoutMs);
  });

  try {
    return await Promise.race([Promise.resolve().then(operation), timeoutPromise]);
  } finally {
    clearTimeout(timeoutId);
  }
}

function safeErrorCode(error, fallback) {
  return typeof error?.code === 'string' && /^[A-Z0-9_]+$/u.test(error.code)
    ? error.code
    : fallback;
}

function isDefinitivePreDeliveryFailure(error) {
  const errorCode = safeErrorCode(error, '');
  const command = typeof error?.command === 'string'
    ? error.command.trim().toUpperCase()
    : '';

  // These failures happen before SMTP DATA can be accepted. Socket timeouts,
  // resets, and generic provider errors are deliberately excluded because a
  // server may have accepted DATA but lost the final acknowledgement.
  if (['ETIMEDOUT', 'ESOCKET', 'ECONNECTION'].includes(errorCode)) {
    return false;
  }

  return (
    ['EAUTH', 'EDNS', 'ENOTFOUND', 'ECONNREFUSED'].includes(errorCode) ||
    (errorCode === 'EENVELOPE' && command !== 'DATA') ||
    ['AUTH', 'MAIL FROM', 'RCPT TO'].includes(command)
  );
}

async function sendContactEmails(data, mailer, env = process.env, options = {}) {
  if (!mailer || typeof mailer.sendMail !== 'function') {
    return {
      deliveryStatus: 'not_configured',
      internalDelivered: false,
      confirmationDelivered: false,
      failureCode: 'CONTACT_DELIVERY_NOT_CONFIGURED'
    };
  }

  const emails = buildContactEmails(data, env);
  let internalDelivered = options.internalDelivered === true;

  if (!internalDelivered) {
    try {
      // Do not wrap sendMail in Promise.race. Nodemailer's transport-level
      // connection, greeting, and socket deadlines are cancellable at the
      // transport layer; an outer timer would leave SMTP work running after
      // reporting a retryable failure and could duplicate the internal email.
      await mailer.sendMail(emails.internal);
      internalDelivered = true;
    } catch (error) {
      if (!isDefinitivePreDeliveryFailure(error)) {
        return {
          deliveryStatus: 'unknown',
          internalDelivered: false,
          internalDeliveryUnknown: true,
          confirmationDelivered: false,
          failureCode: safeErrorCode(error, 'CONTACT_INTERNAL_DELIVERY_UNKNOWN')
        };
      }

      return {
        deliveryStatus: 'not_delivered',
        internalDelivered: false,
        internalDeliveryUnknown: false,
        confirmationDelivered: false,
        failureCode: safeErrorCode(error, 'CONTACT_INTERNAL_DELIVERY_FAILED')
      };
    }
  }

  try {
    await mailer.sendMail(emails.confirmation);

    return {
      deliveryStatus: 'complete',
      internalDelivered: true,
      confirmationDelivered: true,
      failureCode: null
    };
  } catch (error) {
    return {
      deliveryStatus: 'internal_delivered',
      internalDelivered: true,
      confirmationDelivered: false,
      failureCode: safeErrorCode(error, 'CONTACT_CONFIRMATION_DELIVERY_FAILED')
    };
  }
}

function hashValue(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function createSubmissionFingerprint(data) {
  return hashValue(JSON.stringify([
    data.firstName,
    data.lastName,
    data.email,
    data.topic,
    data.message
  ]));
}

function resolveSubmissionIdentity(req, validationResult) {
  const headerKey = req.get('Idempotency-Key')?.trim() || null;
  const bodyKey = validationResult.submissionId;

  if (headerKey !== null && !IDEMPOTENCY_KEY_PATTERN.test(headerKey)) {
    return {
      error: 'Submission identifier is invalid.'
    };
  }

  if (headerKey !== null && bodyKey !== null && headerKey !== bodyKey) {
    return {
      error: 'Submission identifiers do not match.'
    };
  }

  const fingerprint = createSubmissionFingerprint(validationResult.data);
  const submissionId = headerKey || bodyKey || `auto-${fingerprint.slice(0, 32)}`;

  return {
    fingerprint,
    submissionId
  };
}

function createIdempotencyStore(options = {}) {
  const ttlMs = parseBoundedInteger(
    options.ttlMs,
    CONTACT_IDEMPOTENCY_TTL_MS_DEFAULT,
    1,
    24 * 60 * 60 * 1000
  );
  const maxEntries = parseBoundedInteger(
    options.maxEntries,
    CONTACT_IDEMPOTENCY_MAX_ENTRIES_DEFAULT,
    1,
    100_000
  );
  const now = typeof options.now === 'function' ? options.now : Date.now;
  const entries = new Map();

  function prune() {
    const timestamp = now();

    for (const [key, entry] of entries) {
      if (!entry.promise && entry.expiresAt <= timestamp) {
        entries.delete(key);
      }
    }
  }

  function makeCapacity() {
    return entries.size < maxEntries;
  }

  async function execute({ submissionId, fingerprint, operation }) {
    prune();
    let entry = entries.get(submissionId);

    if (entry && entry.fingerprint !== fingerprint) {
      return { kind: 'conflict', result: null };
    }

    if (['complete', 'unknown'].includes(entry?.result?.deliveryStatus)) {
      return { kind: 'replay', result: entry.result };
    }

    if (entry?.promise) {
      return entry.promise;
    }

    if (!entry) {
      if (!makeCapacity()) {
        return { kind: 'capacity', result: null };
      }

      entry = {
        expiresAt: now() + ttlMs,
        fingerprint,
        promise: null,
        result: null
      };
      entries.set(submissionId, entry);
    }

    const previousResult = entry.result;
    const promise = (async () => {
      const result = await operation(previousResult);
      entry.result = result;
      entry.expiresAt = now() + ttlMs;
      entry.promise = null;

      return {
        kind: previousResult ? 'retry' : 'new',
        result
      };
    })().catch((error) => {
      entry.promise = null;
      throw error;
    });

    entry.promise = promise;
    return promise;
  }

  return {
    execute,
    prune,
    size: () => entries.size
  };
}

function createContactRateLimiter(env = process.env, options = {}) {
  return rateLimit({
    windowMs: options.windowMs || parseBoundedInteger(
      env.CONTACT_RATE_LIMIT_WINDOW_MS,
      CONTACT_RATE_LIMIT_WINDOW_MS_DEFAULT,
      1_000,
      24 * 60 * 60 * 1000
    ),
    max: options.max || parseBoundedInteger(
      env.CONTACT_RATE_LIMIT_MAX,
      CONTACT_RATE_LIMIT_MAX_DEFAULT,
      1,
      100
    ),
    standardHeaders: true,
    legacyHeaders: false,
    handler(_req, res) {
      res.status(429).json({
        ok: false,
        success: false,
        code: 'RATE_LIMITED',
        message: 'Too many contact attempts. Please try again later.'
      });
    }
  });
}

function sendDeliveryResponse(res, submissionId, result) {
  res.set('Idempotency-Key', submissionId);

  if (result.deliveryStatus === 'complete') {
    res.status(200).json({
      ok: true,
      success: true,
      code: 'CONTACT_DELIVERED',
      deliveryStatus: result.deliveryStatus,
      internalDelivered: true,
      confirmationDelivered: true,
      submissionId,
      message: 'Message received.'
    });
    return;
  }

  if (result.deliveryStatus === 'internal_delivered') {
    res.status(202).json({
      ok: true,
      success: true,
      code: 'PARTIAL_DELIVERY',
      deliveryStatus: result.deliveryStatus,
      internalDelivered: true,
      confirmationDelivered: false,
      submissionId,
      message: 'Your message was received, but we could not send a confirmation email.'
    });
    return;
  }

  if (result.deliveryStatus === 'unknown') {
    res.status(202).json({
      ok: true,
      success: true,
      code: 'CONTACT_DELIVERY_UNKNOWN',
      deliveryStatus: result.deliveryStatus,
      internalDelivered: false,
      internalDeliveryUnknown: true,
      confirmationDelivered: false,
      submissionId,
      message: 'Delivery status is uncertain. Please do not resend this message.'
    });
    return;
  }

  if (result.deliveryStatus === 'not_configured') {
    res.status(503).json({
      ok: false,
      success: false,
      code: 'CONTACT_DELIVERY_NOT_CONFIGURED',
      deliveryStatus: result.deliveryStatus,
      internalDelivered: false,
      confirmationDelivered: false,
      submissionId,
      error: 'Contact delivery is temporarily unavailable.'
    });
    return;
  }

  res.status(502).json({
    ok: false,
    success: false,
    code: 'CONTACT_DELIVERY_FAILED',
    deliveryStatus: 'not_delivered',
    internalDelivered: false,
    confirmationDelivered: false,
    submissionId,
    error: 'We could not deliver your message. Please try again later.'
  });
}

function createContactRouter(options = {}) {
  const router = express.Router();
  const env = options.env || process.env;
  const mailer = options.mailer === undefined ? createSmtpMailer(env) : options.mailer;
  const idempotencyStore = options.idempotencyStore || createIdempotencyStore({
    ttlMs: env.CONTACT_IDEMPOTENCY_TTL_MS,
    maxEntries: env.CONTACT_IDEMPOTENCY_MAX_ENTRIES
  });
  const contactRateLimiter = createContactRateLimiter(env, options.rateLimit);
  const logger = options.logger || console;

  router.post('/contact', contactRateLimiter, async (req, res, next) => {
    const result = validateContactPayload(req.body);

    if (result.honeypot) {
      res.status(202).json({
        ok: true,
        success: true,
        message: 'Message received.'
      });
      return;
    }

    if (result.errors) {
      res.status(400).json({
        ok: false,
        success: false,
        code: 'VALIDATION_FAILED',
        error: 'Validation failed.',
        errors: result.errors
      });
      return;
    }

    const identity = resolveSubmissionIdentity(req, result);

    if (identity.error) {
      res.status(400).json({
        ok: false,
        success: false,
        code: 'INVALID_IDEMPOTENCY_KEY',
        error: identity.error
      });
      return;
    }

    try {
      const execution = await idempotencyStore.execute({
        fingerprint: identity.fingerprint,
        submissionId: identity.submissionId,
        operation: (previousResult) => sendContactEmails(result.data, mailer, env, {
          internalDelivered: previousResult?.internalDelivered === true
        })
      });

      if (execution.kind === 'conflict') {
        res.status(409).json({
          ok: false,
          success: false,
          code: 'IDEMPOTENCY_CONFLICT',
          error: 'The submission identifier was already used for different content.'
        });
        return;
      }

      if (execution.kind === 'capacity') {
        res.status(503).json({
          ok: false,
          success: false,
          code: 'IDEMPOTENCY_CAPACITY_REACHED',
          error: 'Contact delivery is temporarily busy. Please try again later.'
        });
        return;
      }

      if (execution.result.deliveryStatus !== 'complete') {
        logger.warn?.(`[contact] delivery_status=${execution.result.deliveryStatus}`);
      }

      sendDeliveryResponse(res, identity.submissionId, execution.result);
    } catch (error) {
      next(error);
    }
  });

  return router;
}

function createContactReadiness(options = {}) {
  const env = options.env || process.env;
  const mailer = options.mailer === undefined ? createSmtpMailer(env) : options.mailer;
  const nodeEnv = options.nodeEnv || env.NODE_ENV || 'development';
  const logger = options.logger || console;
  const configuration = validateMailConfiguration(env);
  const verifyOnStart = options.verifyOnStart === undefined
    ? (env.SMTP_VERIFY_ON_START === undefined
        ? nodeEnv === 'production'
        : parseBoolean(env.SMTP_VERIFY_ON_START))
    : options.verifyOnStart;
  const verifyTimeoutMs = parseBoundedInteger(
    options.verifyTimeoutMs || env.SMTP_VERIFY_TIMEOUT_MS,
    SMTP_VERIFY_TIMEOUT_MS_DEFAULT,
    250,
    SMTP_VERIFY_TIMEOUT_MS_MAX
  );
  let initializationPromise = null;
  let status;

  if (!configuration.ok) {
    status = {
      ready: false,
      reason: 'smtp_configuration_invalid',
      verification: 'not_started'
    };
  } else if (verifyOnStart) {
    status = {
      ready: false,
      reason: 'smtp_verification_pending',
      verification: 'pending'
    };
  } else {
    status = {
      ready: true,
      reason: 'smtp_configuration_valid',
      verification: 'skipped'
    };
  }

  async function initialize() {
    if (initializationPromise) {
      return initializationPromise;
    }

    initializationPromise = (async () => {
      if (!configuration.ok) {
        logger.warn?.(`[readiness] status=not_ready reason=smtp_configuration_invalid fields=${configuration.reasons.join(',')}`);
        return status;
      }

      if (!verifyOnStart) {
        logger.info?.('[readiness] status=ready smtp_verification=skipped');
        return status;
      }

      if (!mailer || typeof mailer.verify !== 'function') {
        status = {
          ready: false,
          reason: 'smtp_verification_unavailable',
          verification: 'failed'
        };
        logger.warn?.('[readiness] status=not_ready reason=smtp_verification_unavailable');
        return status;
      }

      try {
        await runWithTimeout(
          () => mailer.verify(),
          verifyTimeoutMs,
          'SMTP_VERIFY_TIMEOUT',
          'SMTP verification timed out.'
        );
        status = {
          ready: true,
          reason: 'smtp_verified',
          verification: 'passed'
        };
        logger.info?.('[readiness] status=ready smtp_verification=passed');
      } catch (error) {
        if (error.code === 'SMTP_VERIFY_TIMEOUT' && typeof mailer.close === 'function') {
          mailer.close();
        }

        status = {
          ready: false,
          reason: 'smtp_verification_failed',
          verification: 'failed'
        };
        logger.warn?.('[readiness] status=not_ready reason=smtp_verification_failed');
      }

      return status;
    })();

    return initializationPromise;
  }

  return {
    getStatus: () => ({ ...status }),
    initialize,
    mailer
  };
}

module.exports = {
  CONTACT_TOPICS,
  buildContactEmails,
  createContactRateLimiter,
  createContactReadiness,
  createContactRouter,
  createIdempotencyStore,
  createSmtpMailer,
  createSubmissionFingerprint,
  escapeHtml,
  getMailTimeoutMs,
  isSpamLikeMessage,
  isValidSingleMailbox,
  sendContactEmails,
  validateContactPayload,
  validateMailConfiguration
};
