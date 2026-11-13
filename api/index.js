// Vercel serverless entrypoint.
// The entire Arts Book app (storefront + API + admin) is served by the single
// handler exported from server.js. Vercel routes every request here.
const { handleRequest } = require('../server.js');

module.exports = async function handler(req, res) {
  try {
    await handleRequest(req, res);
  } catch (error) {
    console.error('[vercel]', error);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end('Internal server error');
    } else {
      res.end();
    }
  }
};
