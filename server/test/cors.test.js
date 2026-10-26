import test from 'node:test';
import assert from 'node:assert/strict';
import app, { getAllowedOrigins, isOriginAllowed } from '../app.js';

test('CORS: getAllowedOrigins includes both known production origins and local dev', () => {
  const origins = getAllowedOrigins();
  assert.ok(origins.includes('https://imovies-two-delta.vercel.app'));
  assert.ok(origins.includes('https://imovies-9uwd3ztpc-adnanpandhana9-cells-projects.vercel.app'));
  assert.ok(origins.includes('http://localhost:5173'));
});

test('CORS: getAllowedOrigins parses comma-separated origins from CLIENT_URL and normalizes slashes', () => {
  const prevEnv = process.env.CLIENT_URL;
  try {
    process.env.CLIENT_URL = 'https://custom-preview.vercel.app/ , https://another-domain.com///';
    const origins = getAllowedOrigins();
    assert.ok(origins.includes('https://custom-preview.vercel.app'));
    assert.ok(origins.includes('https://another-domain.com'));
  } finally {
    process.env.CLIENT_URL = prevEnv;
  }
});

test('CORS: isOriginAllowed permits no-origin, both production origins, and rejects unapproved origin', () => {
  // No origin (curl, server-to-server, mobile app)
  assert.equal(isOriginAllowed(null), true);
  assert.equal(isOriginAllowed(undefined), true);
  assert.equal(isOriginAllowed(''), true);

  // Both production origins (with or without trailing slash)
  assert.equal(isOriginAllowed('https://imovies-two-delta.vercel.app'), true);
  assert.equal(isOriginAllowed('https://imovies-two-delta.vercel.app/'), true);
  assert.equal(isOriginAllowed('https://imovies-9uwd3ztpc-adnanpandhana9-cells-projects.vercel.app'), true);
  assert.equal(isOriginAllowed('https://imovies-9uwd3ztpc-adnanpandhana9-cells-projects.vercel.app/'), true);

  // Localhost development origin
  assert.equal(isOriginAllowed('http://localhost:5173'), true);

  // Unapproved origin
  assert.equal(isOriginAllowed('https://malicious-site.com'), false);
  assert.equal(isOriginAllowed('https://imovies-fake.vercel.app'), false);
});

test('CORS HTTP: GET /api/health returns correct CORS headers for allowed production origin 1', async () => {
  const server = app.listen(0);
  try {
    const { port } = server.address();
    const origin = 'https://imovies-two-delta.vercel.app';
    const res = await fetch(`http://127.0.0.1:${port}/api/health`, {
      method: 'GET',
      headers: { Origin: origin },
    });

    assert.ok([200, 503].includes(res.status));
    assert.equal(res.headers.get('access-control-allow-origin'), origin);
    assert.equal(res.headers.get('access-control-allow-credentials'), 'true');
    assert.equal(res.headers.get('cross-origin-resource-policy'), 'cross-origin');
  } finally {
    server.close();
  }
});

test('CORS HTTP: GET /api/health returns correct CORS headers for allowed production origin 2', async () => {
  const server = app.listen(0);
  try {
    const { port } = server.address();
    const origin = 'https://imovies-9uwd3ztpc-adnanpandhana9-cells-projects.vercel.app';
    const res = await fetch(`http://127.0.0.1:${port}/api/health`, {
      method: 'GET',
      headers: { Origin: origin },
    });

    assert.ok([200, 503].includes(res.status));
    assert.equal(res.headers.get('access-control-allow-origin'), origin);
    assert.equal(res.headers.get('access-control-allow-credentials'), 'true');
    assert.equal(res.headers.get('cross-origin-resource-policy'), 'cross-origin');
  } finally {
    server.close();
  }
});

test('CORS HTTP: OPTIONS preflight returns status 204 with methods, headers, and credentials', async () => {
  const server = app.listen(0);
  try {
    const { port } = server.address();
    const origin = 'https://imovies-9uwd3ztpc-adnanpandhana9-cells-projects.vercel.app';
    const res = await fetch(`http://127.0.0.1:${port}/api/movies`, {
      method: 'OPTIONS',
      headers: {
        Origin: origin,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type,Authorization',
      },
    });

    assert.equal(res.status, 204);
    assert.equal(res.headers.get('access-control-allow-origin'), origin);
    assert.equal(res.headers.get('access-control-allow-credentials'), 'true');
    const allowMethods = res.headers.get('access-control-allow-methods') || '';
    assert.ok(allowMethods.includes('GET'));
    assert.ok(allowMethods.includes('POST'));
    assert.ok(allowMethods.includes('OPTIONS'));
    const allowHeaders = res.headers.get('access-control-allow-headers') || '';
    assert.ok(allowHeaders.toLowerCase().includes('content-type'));
    assert.ok(allowHeaders.toLowerCase().includes('authorization'));
  } finally {
    server.close();
  }
});

test('CORS HTTP: Unapproved origin does not receive Access-Control-Allow-Origin header', async () => {
  const server = app.listen(0);
  try {
    const { port } = server.address();
    const unapprovedOrigin = 'https://malicious-attacker.com';

    // GET request
    const getRes = await fetch(`http://127.0.0.1:${port}/api/health`, {
      method: 'GET',
      headers: { Origin: unapprovedOrigin },
    });
    assert.equal(getRes.headers.get('access-control-allow-origin'), null);

    // OPTIONS preflight
    const optRes = await fetch(`http://127.0.0.1:${port}/api/movies`, {
      method: 'OPTIONS',
      headers: {
        Origin: unapprovedOrigin,
        'Access-Control-Request-Method': 'GET',
      },
    });
    assert.equal(optRes.headers.get('access-control-allow-origin'), null);
  } finally {
    server.close();
  }
});
