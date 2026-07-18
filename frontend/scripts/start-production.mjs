process.env.NODE_ENV = 'production';
process.env.SSR_START = 'true';

try {
  await import(new URL('../dist/frontend/server/server.mjs', import.meta.url).href);
} catch (error) {
  const errorName = error instanceof Error ? error.name : 'UnknownError';
  console.error('[frontend] production SSR failed to start', { errorName });
  process.exitCode = 1;
}
