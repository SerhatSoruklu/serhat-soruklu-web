const { startServer } = require('./server');

startServer({ registerSignalHandlers: true }).catch((error) => {
  const code =
    typeof error?.code === 'string' && /^[A-Z0-9_]{1,50}$/u.test(error.code)
      ? error.code
      : 'STARTUP_ERROR';

  console.error(`[backend] event=startup_failed code=${code}`);
  process.exit(1);
});
