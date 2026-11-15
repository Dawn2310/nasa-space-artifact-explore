import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import handler, { config } from '../netlify/functions/chat.mts';

// No provider requests: exercise the production adapter with the real mock pipeline.
process.env.LLM_PROVIDER = 'mock';
process.env.ALLOW_PENDING_FACTS = 'false';
const url = 'https://example.netlify.app/api/chat';
const request = body => new Request(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
const get = await handler(new Request(url));
assert.equal(get.status, 405);
assert.equal(get.headers.get('Allow'), 'POST');
assert.equal(get.headers.get('Cache-Control'), 'no-store');
assert.equal((await handler(request('{broken'))).status, 400);
assert.equal((await handler(request('{}'))).status, 400);
const { fixtures } = JSON.parse(readFileSync(new URL('./fixtures.json', import.meta.url)));
const fixture = fixtures.find(item => item.artifactId === 'opportunity');
const response = await handler(request(JSON.stringify({ artifactId: fixture.artifactId, message: fixture.question, history: [] })));
assert.equal(response.status, 200);
assert.match(response.headers.get('Content-Type'), /application\/json/);
const body = await response.json();
assert.equal(body.status, 'grounded');
assert.equal(body.mocked, true);
assert.ok(body.evidence.length > 0);
assert.equal(body.meta, undefined, 'Server diagnostics are not exposed');
assert.deepEqual(config, { path: '/api/chat' });
console.log('netlify-chat.check: method handling, invalid JSON, validation, grounded response, evidence and private diagnostics passed');
