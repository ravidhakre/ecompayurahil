// Standalone diagnostics (no dependency on server.js / db) so Vercel can report
// boot/runtime issues even when the main app fails to load.
module.exports = async function handler(req, res) {
  const os = require('node:os');
  const fs = require('node:fs');
  const path = require('node:path');
  const info = {
    ok: true,
    node: process.version,
    vercel: Boolean(process.env.VERCEL),
    region: process.env.VERCEL_REGION || null,
    cwd: process.cwd(),
    dirname: __dirname,
  };
  try { info.sqlite = require('node:sqlite') ? 'available' : 'missing'; } catch (e) { info.sqlite = 'ERR: ' + e.message; }
  try { fs.writeFileSync(path.join(os.tmpdir(), 'ag-diag-test'), 'ok'); info.tmp = 'writable'; } catch (e) { info.tmp = 'ERR: ' + e.message; }
  try { info.files = fs.readdirSync(path.join(__dirname, '..')).slice(0, 20); } catch (e) { info.files = 'ERR: ' + e.message; }
  try { info.lib = fs.readdirSync(path.join(__dirname, '..', 'lib')); } catch (e) { info.lib = 'ERR: ' + e.message; }
  try { info.views = fs.readdirSync(path.join(__dirname, '..', 'views')); } catch (e) { info.views = 'ERR: ' + e.message; }
  // Try loading db module in isolation
  try {
    const dbmod = require('../lib/db');
    info.dbModule = 'loaded';
    info.dbInitError = dbmod.dbInitError ? String(dbmod.dbInitError.message || dbmod.dbInitError) : null;
    info.seeded = dbmod.seeded;
  } catch (e) {
    info.dbModule = 'ERR: ' + e.message;
    info.dbStack = (e.stack || '').split('\n').slice(0, 6);
  }
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.statusCode = 200;
  res.end(JSON.stringify(info, null, 2));
};
