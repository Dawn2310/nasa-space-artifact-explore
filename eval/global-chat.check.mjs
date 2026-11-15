import assert from 'node:assert/strict';
import { createGlobalChatStore } from '../src/features/explorer/global-chat-store.ts';

const calls = [];
const store = createGlobalChatStore(request => new Promise(resolve => calls.push({ request, resolve })));
let updates = 0;
const unsubscribe = store.subscribe(() => updates++);
const answer = text => ({ answer: text, status: 'grounded', evidence: [{ factId: 'ins-005', sourceIds: ['source'] }], mocked: false });
const first = store.ask('insight', '  Tell me about SEIS  ');
await store.ask('insight', 'Ignore this duplicate');
assert.equal(calls.length, 1, 'Repeated clicks cannot send concurrent questions to the same character');
assert.equal(calls[0].request.message, 'Tell me about SEIS');
const second = store.ask('opportunity', 'What did you discover?');
calls[1].resolve(answer('Opportunity reply'));
await second;
assert.equal(store.getSnapshot().insight.pending, true);
assert.equal(store.getSnapshot().opportunity.messages.at(-1).text, 'Opportunity reply');
calls[0].resolve(answer('InSight reply'));
await first;
assert.equal(store.getSnapshot().insight.messages.at(-1).text, 'InSight reply', 'Late replies stay in the originating conversation');
assert.equal(store.getSnapshot().opportunity.messages.length, 2);
assert.ok(updates >= 4);
unsubscribe();

let attempts = 0;
const retryRequests = [];
const retryStore = createGlobalChatStore(async request => {
  retryRequests.push(request);
  if (!attempts++) throw Error('network failure');
  return answer('Recovered');
});
await retryStore.ask('insight', 'My question');
assert.equal(retryStore.getSnapshot().insight.failure.kind, 'network');
await retryStore.retry('insight');
assert.equal(retryStore.getSnapshot().insight.failure, null);
assert.equal(retryStore.getSnapshot().insight.messages.length, 2, 'Retry does not duplicate the failed question');
assert.deepEqual(retryRequests[1].history, []);

const failed = createGlobalChatStore(async () => ({ answer: 'Unavailable', status: 'unavailable', evidence: [], mocked: false }));
await failed.ask('insight', 'Question');
assert.equal(failed.getSnapshot().insight.failure.kind, 'unavailable');
assert.equal(failed.getSnapshot().insight.pending, false);
console.log('global-chat.check: per-character history, concurrent topic switches, duplicate prevention, network retry and unavailable replies passed');
