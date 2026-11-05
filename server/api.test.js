import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createMetaApiHandler } from './api.js';

async function withServer(handler, run) {
  const server = createServer((req, res) => handler(req, res, () => { res.statusCode = 404; res.end(); }));
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  try { await run(`http://127.0.0.1:${port}`); }
  finally { await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())); }
}

const post = (base, body, origin = 'http://localhost:3000') => fetch(`${base}/api/meta/ask`, { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

test('health reports missing configuration without exposing a credential', async () => {
  const handler = createMetaApiHandler({ env: {} });
  await withServer(handler, async (base) => {
    const response = await fetch(`${base}/health`);
    const body = await response.json();
    assert.equal(body.configured, false);
    assert.equal(body.model, 'muse-spark-1.3');
    assert.equal(JSON.stringify(body).includes('KEY'), false);
  });
});

test('missing key never calls Meta and returns a safe 503', async () => {
  let called = false;
  const handler = createMetaApiHandler({ env: {}, fetchImpl: async () => { called = true; } });
  await withServer(handler, async (base) => {
    const response = await post(base, { modelId: 'turtle', mode: 'explain', question: 'What is shown?' });
    assert.equal(response.status, 503);
    assert.equal(called, false);
  });
});

test('valid request uses the curated model context and safely extracts a mocked answer', async () => {
  let outbound;
  const handler = createMetaApiHandler({
    env: { MODEL_API_KEY: 'test-only', APP_ORIGINS: 'http://localhost:3000' },
    fetchImpl: async (url, options) => {
      outbound = { url, headers: options.headers, body: JSON.parse(options.body) };
      return new Response(JSON.stringify({ choices: [{ message: { content: 'A stylized shell-like dome.' } }] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    },
  });
  await withServer(handler, async (base) => {
    const response = await post(base, { modelId: 'turtle', mode: 'explain', question: 'What is shown?' });
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.answer, 'A stylized shell-like dome.');
    assert.equal(outbound.url, 'https://api.meta.ai/v1/chat/completions');
    assert.equal(outbound.headers.Authorization, 'Bearer test-only');
    assert.equal(outbound.body.model, 'muse-spark-1.3');
    assert.equal(outbound.body.store, false);
    assert.match(outbound.body.messages[0].content, /not.*medical scans/i);
  });
});

test('invalid mode and unapproved origins are rejected before calling Meta', async () => {
  let called = false;
  const handler = createMetaApiHandler({ env: { MODEL_API_KEY: 'test-only' }, fetchImpl: async () => { called = true; } });
  await withServer(handler, async (base) => {
    const badOrigin = await post(base, { modelId: 'turtle', mode: 'explain', question: 'Hi' }, 'https://evil.example');
    assert.equal(badOrigin.status, 403);
    const badMode = await post(base, { modelId: 'turtle', mode: 'tools', question: 'Hi' });
    assert.equal(badMode.status, 400);
    assert.equal(called, false);
  });
});
