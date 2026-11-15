// Run with Node 24. Deterministic content/API checks; never calls a real provider.
import assert from 'node:assert/strict';
import catalog from '../content/catalog.json' with { type: 'json' };
import facts from '../content/facts.json' with { type: 'json' };
import sources from '../content/sources.json' with { type: 'json' };
import { appendNarrative, buildNarrative, INTRODUCTION_ID } from '../src/features/explorer/narrative.ts';
import { chooseFriendlyVoice, estimatedSpeechSeconds, shuttleAction, SPEECH_PITCH, SPEECH_RATE, SPEECH_SPEED } from '../src/features/explorer/voice.ts';
import { EMPTY_SESSION, historyForRetry } from '../src/features/explorer/session.ts';
import { handleChat } from '../server/chat.ts';
import { getPersona } from '../server/personas.ts';
import { missingNumbers, numberTokens } from '../server/text.ts';

const sourceIds = new Set(sources.map((source) => source.id));
assert.equal(shuttleAction(true, ''), 'stop', 'Clicking a speaking shuttle must stop, never replay');
assert.equal(shuttleAction(true, 'My question'), 'stop', 'Stop takes priority over a draft');
assert.equal(shuttleAction(false, 'My question'), 'send');
assert.equal(shuttleAction(false, '  '), 'replay');
const byId = new Map(facts.map((fact) => [fact.id, fact]));
for (const artifact of catalog.artifacts) {
  assert.equal(artifact.mode, 'chat', `${artifact.id} must support questions`);
  assert.ok(getPersona(artifact.id));
  const chapters = buildNarrative(artifact, facts, sourceIds);
  assert.equal(chapters.length, 1, `${artifact.id}: deliver exactly one introduction`);
  assert.equal(chapters[0].id, INTRODUCTION_ID);
  const seconds = estimatedSpeechSeconds(chapters[0].text);
  assert.ok(seconds >= 14 / SPEECH_SPEED && seconds <= 19 / SPEECH_SPEED, `${artifact.id}: estimated ${seconds}s, expected a short introduction at ${SPEECH_SPEED}x speed`);
  assert.ok(!chapters[0].text.includes('\n'), 'Opening is one short paragraph');
  assert.ok(chapters.every((chapter) => /\b(I|I'm|my|me)\b/i.test(chapter.text)), `${artifact.id}: use first person throughout`);
  assert.match(chapters.at(-1).text, /remember/i, `${artifact.id}: close on its legacy`);
  for (const chapter of chapters) {
    assert.ok(chapter.factIds.length);
    const evidence = chapter.factIds.map((id) => byId.get(id));
    assert.ok(evidence.every((fact) => fact?.artifactId === artifact.id));
    assert.ok(evidence.every((fact) => !artifact.memoryCutoff || !fact.date || fact.date <= artifact.memoryCutoff));
    assert.deepEqual(missingNumbers(chapter.text, numberTokens(evidence.map((fact) => fact.text).join(' '))), [], `${artifact.id}/${chapter.id}: unsupported number`);
  }
  // Removing source records or future-dated facts must remove their chapters.
  assert.equal(buildNarrative(artifact, facts, new Set()).length, 1);
  const future = { ...facts.find((fact) => fact.artifactId === artifact.id), id: 'future', date: '9999-01-01', tags: ['launch'] };
  if (artifact.memoryCutoff) assert.equal(buildNarrative(artifact, [future], sourceIds).length, 1);
  let thread = appendNarrative(EMPTY_SESSION, 0, chapters, facts);
  assert.equal(thread.messages.length, 1);
  assert.equal(appendNarrative(thread, 0, chapters, facts), thread, 'Duplicate mount must not repeat the introduction');
  assert.equal(appendNarrative(thread, 1, chapters, facts), thread, 'Never emit a second unsolicited message');
  const pending = { ...thread, pending: true };
  assert.equal(appendNarrative(pending, 1, chapters, facts), pending, 'Never interrupt a pending answer with a story');
  const question = { role: 'user', text: 'What did you do?' };
  thread = { ...thread, messages: [...thread.messages, question] };
  assert.equal(historyForRetry(thread.messages).at(-1).role, 'assistant', 'Retry must retain narration but omit the retried question');
  thread = appendNarrative(thread, 1, chapters, facts);
  assert.equal(thread.messages[1].role, 'user');
  assert.equal(thread.messages.length, 2, 'After the introduction, wait for the child to ask');
  assert.equal(thread.messages[0].evidence[0].factId, chapters[0].factIds[0]);
  const oldThread = { ...EMPTY_SESSION, storyCursor: 3, messages: [
    {role: 'assistant', text: 'Old chapter', kind: 'story'}, question,
  ] };
  const migrated = appendNarrative(oldThread, 0, chapters, facts);
  assert.equal(migrated.messages.length, 2, 'Replace old multi-part scripts with one opening');
  assert.equal(migrated.messages[0].storyId, INTRODUCTION_ID);
  assert.equal(migrated.messages[1], question, 'Preserve the visitor\'s own conversation');
  assert.equal(EMPTY_SESSION.messages.length, 0, 'Do not mutate the shared empty session');
  const response = await handleChat({ artifactId: artifact.id, message: 'What was your mission?', history: [] }, { LLM_PROVIDER: 'mock', ALLOW_PENDING_FACTS: 'true' });
  assert.equal(response.status, 200, `${artifact.id}: API should accept chat`);
  if (response.body.status === 'grounded') {
    assert.ok(response.body.evidence.every((entry) => byId.get(entry.factId)?.artifactId === artifact.id));
  }
  // A controlled model response exercises selection/verifier for every new
  // persona, independently of the deliberately limited keyword mock.
  const allowed = facts.find((fact) => fact.artifactId === artifact.id &&
    (!artifact.memoryCutoff || !fact.date || fact.date <= artifact.memoryCutoff));
  const checked = await handleChat({ artifactId: artifact.id, message: 'Read a mission record.' },
    { LLM_PROVIDER: 'mock', ALLOW_PENDING_FACTS: 'true' }, {
      llm: async () => ({ ok: true, provider: 'mock', mocked: true,
        text: JSON.stringify({ answer: allowed.text, factIds: [allowed.id], answerable: true, refusalReason: null }) }),
    });
  assert.equal(checked.body.status, 'grounded', `${artifact.id}: valid evidence rejected`);
  assert.deepEqual(checked.body.evidence[0].factId, allowed.id);
}

const dawn = catalog.artifacts.find((artifact) => artifact.id === 'dawn');
assert.equal(buildNarrative(dawn, facts, sourceIds).length, 1);
assert.ok(SPEECH_RATE > 1 && SPEECH_RATE <= 1.4 && SPEECH_PITCH >= 0.95 && SPEECH_PITCH <= 1.1, 'Faster narration keeps a natural pitch');
const availableVoices = [{name: 'Default', lang: 'vi-VN'}, {name: 'David', lang: 'en-US', default: true}, {name: 'Aria Natural', lang: 'en-US'}];
assert.equal(chooseFriendlyVoice(availableVoices), availableVoices[2]);
assert.equal(chooseFriendlyVoice([]), undefined);
assert.equal(chooseFriendlyVoice([availableVoices[0]]), undefined, 'Do not assign a voice of the wrong language');
for (const question of ['How did your ion thrusters work?', 'When did you reach Ceres?', 'Tell me about Vesta and Ceres.']) {
  const result = await handleChat({ artifactId: 'dawn', message: question, history: [] }, { LLM_PROVIDER: 'mock', ALLOW_PENDING_FACTS: 'true' });
  assert.equal(result.body.status, 'grounded', `${question}: ${JSON.stringify(result)}`);
  assert.ok(result.body.evidence.length);
}
const strict = await handleChat({ artifactId: 'dawn', message: 'When did you reach Ceres?' }, { LLM_PROVIDER: 'mock' });
assert.equal(strict.body.status, 'grounded', 'NASA records must work by default without a manual review switch');
const later = await handleChat({ artifactId: 'dawn', message: 'What happened in 2025?' }, { LLM_PROVIDER: 'mock', ALLOW_PENDING_FACTS: 'true' });
assert.equal(later.body.status, 'insufficient-evidence');
assert.equal(later.meta.refusalReason, 'after-cutoff');
assert.equal(getPersona('not-a-real-artifact'), undefined);
console.log('storyteller.check: all 17 narratives/API routes, Dawn questions, evidence, review gate and cutoff passed');
