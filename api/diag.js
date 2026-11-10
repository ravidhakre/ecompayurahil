module.exports = function handler(req, res) {
  try {
    const info = {
      ok: true,
      node: process.version,
      vercel: !!process.env.VERCEL,
      cwd: process.cwd(),
      env_keys: Object.keys(process.env).filter(k => k.startsWith('VERCEL') || k === 'NODE_ENV'),
    };
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.statusCode = 200;
    res.end(JSON.stringify(info));
  } catch (e) {
    res.statusCode = 500;
    res.end(String(e));
  }
};
