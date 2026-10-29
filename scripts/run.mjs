import { createServer } from 'vite';
import { spawn } from 'node:child_process';

// Own the server directly so Windows does not need to kill a shell process tree.
let server;
try {
  if (!process.env.BASE_URL) {
    server = await createServer({ configFile: 'vite.config.ts', server: { host: '127.0.0.1' } });
    await server.listen();
  }
  const child = spawn(process.execPath, ['node_modules/@playwright/test/cli.js', 'test', ...process.argv.slice(2)], {
    stdio: 'inherit', env: { ...process.env, VISUAL_SERVER_MANAGED: '1' },
  });
  process.exitCode = await new Promise((resolve, reject) => {
    child.once('error', reject);
    child.once('exit', code => resolve(code ?? 1));
  });
} finally {
  await server?.close();
}
