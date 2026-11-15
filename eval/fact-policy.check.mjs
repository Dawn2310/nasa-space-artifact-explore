import assert from 'node:assert/strict';
import facts from '../content/facts.json' with { type: 'json' };
import sources from '../content/sources.json' with { type: 'json' };
import { factIsAccepted, hasNasaEvidence, isOfficialNasaSource } from '../src/shared/fact-policy.ts';
import { handleChat } from '../server/chat.ts';
assert.ok(facts.every((fact) => hasNasaEvidence(fact, sources)), 'All current mission records need complete NASA citations');
assert.ok(facts.every((fact) => factIsAccepted(fact, sources)), 'NASA facts work without a manual-review switch');
for (const url of ['https://nasa.gov.evil.example/a', 'https://evilnasa.gov/a', 'http://science.nasa.gov/a', 'https://user:pass@science.nasa.gov/a', 'not a URL']) {
  assert.equal(isOfficialNasaSource({ url }), false, url);
}
assert.equal(isOfficialNasaSource({ url: 'https://www.jpl.nasa.gov/mission/' }), true);
assert.equal(hasNasaEvidence({ sourceIds: [] }, sources), false);
assert.equal(hasNasaEvidence({ sourceIds: ['missing-source'] }, sources), false);
const untrusted = [{ ...sources[0], url: 'https://example.org/story' }];
const pending = { ...facts[0], reviewStatus: 'pending', sourceIds: [untrusted[0].id] };
assert.equal(factIsAccepted(pending, untrusted), false);
const answer = await handleChat({ artifactId: 'dawn', message: 'When did you reach Ceres?' }, { LLM_PROVIDER: 'mock', ALLOW_PENDING_FACTS: 'false' });
assert.equal(answer.body.status, 'grounded');
assert.equal(answer.meta.factMode, 'approved+nasa');
assert.ok(answer.body.evidence.length);
const future = await handleChat({ artifactId: 'dawn', message: 'What happened in 2025?' }, { LLM_PROVIDER: 'mock' });
assert.equal(future.body.status, 'insufficient-evidence');
assert.equal(future.meta.refusalReason, 'after-cutoff');
console.log(`fact-policy.check: ${facts.length} NASA-sourced facts available by default; missing/spoofed sources rejected; cutoff preserved`);
