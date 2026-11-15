import assert from 'node:assert/strict';
import { setTimeout as wait } from 'node:timers/promises';
import { createIntroNarration } from '../src/features/voyage/intro-narration.ts';

function fixture(extra = {}) {
  const spoken = [], states = [];
  let canceled = 0;
  const synth = { speak(utterance) { spoken.push(utterance); }, cancel() { canceled++; } };
  const player = createIntroNarration({
    text: 'Welcome back, astronaut!', synth,
    makeUtterance: text => ({ text }), onState: state => states.push(state), ...extra,
  });
  return { player, spoken, states, get canceled() { return canceled; } };
}

const greeting = fixture();
greeting.player.tryAutoPlay();
assert.equal(greeting.spoken[0].text, 'Welcome back, astronaut!');
greeting.player.tryAutoPlay();
assert.equal(greeting.spoken.length, 1, 'A gesture cannot queue a second copy of pending speech');
greeting.spoken[0].onstart();
greeting.spoken[0].onend();
assert.equal(greeting.states.at(-1), 'ready');
greeting.player.tryAutoPlay();
assert.equal(greeting.spoken.length, 1, 'Completed greetings do not restart on unrelated clicks');
greeting.player.play();
assert.equal(greeting.spoken.length, 2, 'Listen replays after completion');
const lateStart = greeting.spoken[1].onstart;
greeting.player.stop();
lateStart();
assert.equal(greeting.states.at(-1), 'ready', 'Late events cannot revive stopped audio');
assert.equal(greeting.canceled, 1);
greeting.player.tryAutoPlay();
assert.equal(greeting.spoken.length, 2, 'Stop also suppresses the scheduled auto attempt');
greeting.player.dispose();

const blocked = fixture();
blocked.player.tryAutoPlay();
blocked.spoken[0].onerror({ error: 'not-allowed' });
assert.equal(blocked.states.at(-1), 'ready');
blocked.player.tryAutoPlay();
assert.equal(blocked.spoken.length, 2, 'Autoplay rejection can retry from a real gesture');
blocked.spoken[1].onstart();
blocked.player.dispose();
assert.equal(blocked.canceled, 1, 'Leaving the intro cancels speech');
blocked.player.play();
assert.equal(blocked.spoken.length, 2, 'A disposed greeting cannot resume after navigation');

const silent = fixture({ startTimeoutMs: 5 });
silent.player.tryAutoPlay();
await wait(20);
assert.equal(silent.states.at(-1), 'ready', 'A silently dropped utterance restores Listen');
assert.equal(silent.canceled, 1);
silent.player.play();
assert.equal(silent.spoken.length, 2);
silent.player.dispose();

const unavailable = fixture({ synth: undefined });
assert.equal(unavailable.states.at(-1), 'unavailable');
unavailable.player.play();
assert.equal(unavailable.spoken.length, 0);
unavailable.player.dispose();
console.log('intro-narration.check: autoplay, gesture retry, replay, stop, silent-engine timeout, navigation cleanup and unsupported speech passed');
