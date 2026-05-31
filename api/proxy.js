/**
 * Vercel Serverless Proxy — Pipeline Admin → Backend
 * 
 * Frontend (HTTPS) → Vercel Proxy → Backend (HTTP)
 * Mixed content problem solve karta hai.
 */

const BACKEND = 'http://18.213.66.136:8000';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Extract path after /api/
  const path = req.url.replace(/^\/api\//, '');
  const targetUrl = `${BACKEND}/api/${path}`;

  try {
    const headers = { 'Content-Type': 'application/json' };
    const options = { method: req.method, headers };

    if (req.method !== 'GET' && req.body) {
      options.body = JSON.stringify(req.body);
    }

    const response = await fetch(targetUrl, options);
    const text = await response.text();

    // Try to parse as JSON, return as-is if fails
    try {
      const json = JSON.parse(text);
      return res.status(response.status).json(json);
    } catch {
      return res.status(response.status).send(text);
    }
  } catch (error) {
    console.error('Proxy error:', error.message);
    return res.status(502).json({
      success: false,
      error: 'Backend unreachable',
      detail: error.message,
      backend: BACKEND
    });
  }
}
