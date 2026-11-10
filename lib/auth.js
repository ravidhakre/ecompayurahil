'use strict';

const crypto = require('node:crypto');
const { db } = require('./db');
const { cookieHeader, getCookie, safeEqual, randomToken } = require('./util');

const COOKIE_NAME = 'ag_admin';
const SESSION_HOURS = 12;
const SECRET = process.env.ARTGURU_SECRET || process.env.SESSION_SECRET || 'art-guru-local-secret-please-change';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ArtGuru@2026';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@artguru.in';

function sign(payload) {
  const data = Buffer.from(payload).toString('base64url');
  const sig = crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
  return `${data}.${sig}`;
}

function unsign(token) {
  if (!token || !token.includes('.')) return null;
  const [data, sig] = token.split('.');
  const expected = crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
  if (!safeEqual(sig, expected)) return null;
  try {
    return JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}

function createSession(res) {
  const payload = {
    sub: 'admin',
    email: ADMIN_EMAIL,
    iat: Date.now(),
    exp: Date.now() + SESSION_HOURS * 3600 * 1000,
    nonce: randomToken(8),
  };
  const token = sign(JSON.stringify(payload));
  res.setHeader(
    'Set-Cookie',
    cookieHeader(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'Lax',
      maxAge: SESSION_HOURS * 3600,
      secure: process.env.NODE_ENV === 'production',
    })
  );
  return payload;
}

function clearSession(res) {
  res.setHeader('Set-Cookie', cookieHeader(COOKIE_NAME, '', { maxAge: 0, httpOnly: true, sameSite: 'Lax' }));
}

function getSession(req) {
  const token = getCookie(req, COOKIE_NAME);
  const payload = unsign(token);
  if (!payload || payload.sub !== 'admin' || !payload.exp || payload.exp < Date.now()) return null;
  return payload;
}

function requireAdmin(req, res) {
  const session = getSession(req);
  if (!session) {
    res.writeHead(401, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: false, error: 'Please sign in to continue.' }));
    return null;
  }
  return session;
}

function checkPassword(password) {
  return safeEqual(String(password || ''), ADMIN_PASSWORD);
}

function loginRateLimited(ip) {
  const since = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  const row = db
    .prepare('SELECT COUNT(*) AS c FROM admin_logins WHERE ip = ? AND success = 0 AND created_at > ?')
    .get(ip, since);
  return Number(row.c) >= 8;
}

function recordLogin(ip, success) {
  db.prepare('INSERT INTO admin_logins (ip, success, created_at) VALUES (?, ?, ?)').run(
    String(ip || ''),
    success ? 1 : 0,
    new Date().toISOString()
  );
  // keep table small
  db.prepare('DELETE FROM admin_logins WHERE created_at < ?').run(new Date(Date.now() - 30 * 86400000).toISOString());
}

function receiptKey(orderNo) {
  return crypto.createHmac('sha256', SECRET).update(`receipt:${orderNo}`).digest('base64url').slice(0, 24);
}

module.exports = {
  COOKIE_NAME,
  ADMIN_EMAIL,
  createSession,
  clearSession,
  getSession,
  requireAdmin,
  checkPassword,
  loginRateLimited,
  recordLogin,
  receiptKey,
};
