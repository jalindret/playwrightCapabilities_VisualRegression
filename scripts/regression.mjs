import { spawnSync } from 'node:child_process';
// A deliberate failing run: use the normal report to inspect expected/actual/diff.
const result = spawnSync(process.execPath, ['scripts/run.mjs', '--grep', 'inventory page', '--project=chromium-desktop'], {
  stdio: 'inherit', env: { ...process.env, VISUAL_REGRESSION: '1' },
});
process.exit(result.status ?? 1);
