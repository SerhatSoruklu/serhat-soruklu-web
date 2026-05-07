import { rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const frontendDirectory = join(scriptDirectory, '..');
const angularCacheDirectory = join(frontendDirectory, '.angular', 'cache');
const ngExecutable = process.platform === 'win32'
  ? join(frontendDirectory, 'node_modules', '.bin', 'ng.cmd')
  : join(frontendDirectory, 'node_modules', '.bin', 'ng');

rmSync(angularCacheDirectory, { force: true, recursive: true });

const ng = spawn(ngExecutable, ['serve', ...process.argv.slice(2)], {
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
