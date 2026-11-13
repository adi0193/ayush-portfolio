// Production-style single process: the API also serves the built PWA from web/dist.
// Run `npm run build` first. Open http://localhost:8080
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const webDist = resolve('web/dist');
const api = resolve('server/dist/index.js');
if (!existsSync(api) || !existsSync(webDist)) {
  console.error('Build output missing. Run: npm run build');
  process.exit(1);
}
const p = spawn(process.execPath, ['--env-file-if-exists=server/.env', api], {
  stdio: 'inherit',
  env: { ...process.env, WEB_DIST: process.env.WEB_DIST ?? webDist },
});
p.on('exit', (code) => process.exit(code ?? 0));
