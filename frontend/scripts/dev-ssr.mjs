import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const frontendDirectory = join(scriptDirectory, '..');
const ngExecutable = process.platform === 'win32'
  ? join(frontendDirectory, 'node_modules', '.bin', 'ng.cmd')
  : join(frontendDirectory, 'node_modules', '.bin', 'ng');

const serveArguments = process.argv.slice(2);
const portOption = serveArguments.indexOf('--port');
const port = serveArguments.find(argument => argument.startsWith('--port='))?.split('=')[1]
  ?? (portOption >= 0 ? serveArguments[portOption + 1] : '4200');
const hasPrebundleOption = serveArguments.some(argument => argument.startsWith('--prebundle'));

// Parallel validation must not delete or rewrite a developer server's Vite cache.
if (port !== '4200' && !hasPrebundleOption) serveArguments.push('--prebundle=false');

const ng = spawn(ngExecutable, ['serve', ...serveArguments], {
  cwd: frontendDirectory,
  shell: false,
  stdio: 'inherit'
});

ng.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
