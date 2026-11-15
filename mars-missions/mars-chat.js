// Small first-person storyteller chat for the open Mars machine.
// Same pipeline as the main app: the intro comes from narrative.ts (tied to NASA fact ids)
// and questions go to POST /api/chat (grounded on content/facts.json, mock mode labelled).
import { realCatalog } from '../src/shared/catalog.ts';
import { buildNarrative } from '../src/features/explorer/narrative.ts';
import { estimatedSpeechSeconds, SPEECH_VOLUME } from '../src/features/explorer/voice.ts';
import { pickVoice, voiceProfile } from './mars-voices.js';
import { openPassport, presentDiscoveryReward } from '../src/features/rewards/reward-ui.ts';
import { rewardBook, REWARD_CHANGED, REWARD_KEY } from '../src/features/rewards/rewards.ts';

const TIMEOUT_MS = 25_000;
const MAX_LENGTH = 500;
const HISTORY_TURNS = 8;
const fallbackQuestions = place => ['What was your job on ' + place + '?', 'What did you discover?', 'How did your mission end?'];

const sourceIds = new Set(realCatalog.sources.map(source => source.id));

/**
 * Shared by the Mars and Moon mission maps.
 * body: catalog body of the machines; place: how to name that world in text.
 * siteOf: the short place name shown in the signal line ("Signal from …").
 */
export function createChat({ body = 'mars', place = 'Mars', siteOf = mission => mission.site.split(' · ')[0], waitForReplay = false, speechEnabled = true } = {}) {
  const $ = id => document.getElementById(id);
  const log = $('chat-log');
  const form = $('chat-form');
  const input = $('chat-input');
  const send = $('chat-send');
  const suggestions = $('chat-suggestions');
  const launcher = $('chat-launcher');
  if (window.parent !== window && new URLSearchParams(location.search).has('externalChat')) launcher.style.display = 'none';
  const panel = $('chat-panel');
  let artifact = null;
  let history = [];
  let pending = false;
  let generation = 0;
  let introText = '';
  let introSpoken = false;
  let speaker = place;
  let homeSite = place;
  let storyComplete = false, replayComplete = true;
  let reward;
  const passport = document.createElement('button');
  passport.type = 'button'; passport.className = 'passport-button';
  passport.addEventListener('click', openPassport);
  const updatePassport = () => { passport.textContent = `✦ Passport ${rewardBook.read().length}/17`; };
  updatePassport();
  window.addEventListener(REWARD_CHANGED, updatePassport);
  window.addEventListener('storage', (event) => { if (event.key === REWARD_KEY) updatePassport(); });
  const finishDiscovery = () => {
    if (!artifact) return;
    hush(); hideNarration(); reward = presentDiscoveryReward(artifact.id);
  };
  const finish = document.createElement('button');
  finish.type = 'button'; finish.className = 'discovery-finish'; finish.textContent = 'Finish discovery ✦'; finish.hidden = true;
  finish.addEventListener('click', finishDiscovery);
  document.querySelector('.stage-actions')?.prepend(passport, finish);

  // Read-aloud voice with a per-character profile (mars-voices.js).
  // Speech starts from a click (opening a machine, the rocket, or sending), so browsers allow it.
  // In tour mode the parent cockpit owns speech. Even cancel() in this iframe
  // can interrupt that voice on browsers sharing a speech queue across frames.
  const synth = speechEnabled && 'speechSynthesis' in window ? window.speechSynthesis : null;
  const voiceButton = $('chat-voice');
  const narration = $('narration');
  const narrationText = $('narration-text');
  let voiceOn = Boolean(synth);
  let narrationTimer = 0;
  voiceButton.hidden = !synth;

  const statusText = $('chat-status-text');
  function setStatus(state) {
    panel.dataset.signal = state;
    statusText.textContent = state === 'receiving' ? 'Receiving signal…'
      : state === 'speaking' ? 'Transmitting from ' + homeSite : 'Signal from ' + homeSite;
  }

  function hideNarration() {
    clearTimeout(narrationTimer);
    narration.hidden = true;
  }

  // Each speak/hush takes a new ticket; a delayed speak only runs if no newer request came in.
  let speechTicket = 0;
  // Stop talking when this page goes away (an iframe that is removed or reloaded).
  window.addEventListener('pagehide', () => {
    speechTicket++;
    synth?.cancel();
  });

  function hush() {
    speechTicket++;
    synth?.cancel();
    launcher.classList.remove('is-speaking');
    if (!pending) setStatus('idle');
  }

  /** Speak `text` in this machine's voice. `done` runs when speech ends, fails or is off. */
  function speak(text, done = () => {}) {
    if (!synth || !voiceOn || !text) return done(false);
    synth.cancel();
    const ticket = ++speechTicket;
    const run = generation;
    const utterance = new SpeechSynthesisUtterance(text);
    const profile = voiceProfile(artifact?.id);
    const voice = pickVoice(artifact?.id, synth.getVoices());
    if (voice) utterance.voice = voice;
    utterance.lang = voice?.lang ?? 'en-US';
    utterance.rate = profile.rate;
    utterance.pitch = profile.pitch;
    utterance.volume = SPEECH_VOLUME;
    utterance.onstart = () => {
      launcher.classList.add('is-speaking');
      setStatus('speaking');
    };
    utterance.onend = utterance.onerror = event => {
      launcher.classList.remove('is-speaking');
      if (!pending) setStatus('idle');
      if (run === generation && ticket === speechTicket) done(event.type === 'end');
    };
    // Chrome can keep the old sentence going if speak() follows cancel() at once: wait a moment.
    setTimeout(() => {
      if (ticket === speechTicket) synth.speak(utterance);
    }, 90);
  }

  $('narration-stop').addEventListener('click', () => {
    hush();
    hideNarration();
  });

  voiceButton.addEventListener('click', () => {
    voiceOn = !voiceOn;
    voiceButton.setAttribute('aria-pressed', String(voiceOn));
    voiceButton.setAttribute('aria-label', voiceOn ? 'Turn voice off' : 'Read messages aloud');
    if (!voiceOn) {
      hush();
      hideNarration();
    }
  });

  function sourcesFor(evidence = []) {
    const ids = [...new Set(evidence.flatMap(item => item.sourceIds))];
    return ids.map(id => realCatalog.sources.find(source => source.id === id)).filter(Boolean).slice(0, 2);
  }

  function bubble(role, text, { mocked = false, evidence = [], note = '' } = {}) {
    const item = document.createElement('div');
    item.className = 'chat-msg chat-msg--' + role;
    const from = document.createElement('span');
    from.className = 'chat-msg__from';
    from.textContent = role === 'bot' ? speaker : 'You · Earth';
    item.append(from);
    const body = document.createElement('p');
    body.textContent = text;
    item.append(body);
    const sources = role === 'bot' ? sourcesFor(evidence) : [];
    if (mocked || note || sources.length) {
      const meta = document.createElement('p');
      meta.className = 'chat-meta';
      if (mocked) {
        const tag = document.createElement('span');
        tag.className = 'chat-tag';
        tag.textContent = 'Demo answer (no real AI yet)';
        meta.append(tag);
      }
      if (note) meta.append(note + ' ');
      for (const [i, source] of sources.entries()) {
        const link = document.createElement('a');
        link.href = source.url;
        link.target = '_blank';
        link.rel = 'noopener';
        const repeated = sources.some((other, j) => j !== i && other.publisher === source.publisher);
        link.className = 'chat-source';
        link.textContent = source.publisher + (repeated ? ' · ' + (i + 1) : '') + ' ↗';
        link.title = source.title;
        meta.append(link, ' ');
      }
      item.append(meta);
    }
    log.append(item);
    // Show the start of a new storyteller reply (long ones would otherwise open at their end).
    log.scrollTop = role === 'bot' ? item.offsetTop - 4 : log.scrollHeight;
    return item;
  }

  function setOpen(value) {
    panel.hidden = !value;
    launcher.setAttribute('aria-expanded', String(value));
    launcher.classList.toggle('is-open', value);
    if (value) {
      const first = log.firstElementChild;
      if (first && log.childElementCount === 1) log.scrollTop = 0;
      input.focus({ preventScroll: true });
      hideNarration();
      if (!introSpoken) {
        introSpoken = true;
        speak(introText);
      }
    } else {
      hush();
    }
  }

  launcher.addEventListener('click', () => setOpen(panel.hidden));
  $('chat-close').addEventListener('click', () => {
    setOpen(false);
    launcher.focus({ preventScroll: true });
  });
  panel.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    setOpen(false);
    launcher.focus({ preventScroll: true });
  });

  function setPending(value) {
    pending = value;
    launcher.classList.toggle('is-busy', value);
    setStatus(value ? 'receiving' : 'idle');
    send.disabled = value;
    input.disabled = value || !artifact;
    for (const chip of suggestions.children) chip.disabled = value;
  }

  async function ask(rawQuestion) {
    const question = rawQuestion.trim().slice(0, MAX_LENGTH);
    if (!question || pending || !artifact) return;
    const run = generation;
    const id = artifact.id;
    hush();
    bubble('user', question);
    input.value = '';
    setPending(true);
    const typing = bubble('bot', 'Receiving signal');
    typing.classList.add('chat-msg--typing');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    let answer;
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artifactId: id, message: question, history: history.slice(-HISTORY_TURNS) }),
        signal: controller.signal,
      });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      answer = await response.json();
      if (typeof answer?.answer !== 'string') throw new Error('Unexpected response');
    } catch (error) {
      answer = null;
      console.warn('[mars-chat]', error);
    } finally {
      clearTimeout(timer);
    }
    if (run !== generation) return; // another machine was opened meanwhile
    typing.remove();
    setPending(false);
    if (!answer || answer.status === 'unavailable') {
      bubble('bot', answer?.answer || 'My signal is weak right now. Please try again in a moment.', { mocked: answer?.mocked });
      return;
    }
    history.push({ role: 'user', content: question }, { role: 'assistant', content: answer.answer });
    bubble('bot', answer.answer, { mocked: answer.mocked, evidence: answer.evidence });
    if (!panel.hidden) speak(answer.answer);
    input.focus({ preventScroll: true });
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    ask(input.value);
  });

  return {
    open(missionId, mission) {
      storyComplete = false; replayComplete = !waitForReplay || !mission?.model;
      reward?.close(); finish.hidden = false;
      generation++;
      homeSite = mission ? siteOf(mission) : place;
      speaker = mission?.name ?? place;
      hideNarration();
      hush();
      const artifactId = mission?.artifactId ?? missionId;
      artifact = realCatalog.artifacts.find(item => item.id === artifactId && item.body === body) ?? null;
      history = [];
      log.replaceChildren();
      suggestions.replaceChildren();
      setPending(false);
      setOpen(false);
      launcher.hidden = false;
      if (!artifact) {
        bubble('bot', 'This machine has no storyteller yet.');
        return;
      }
      const [intro] = buildNarrative(artifact, realCatalog.facts, sourceIds);
      const evidence = intro.factIds.map(factId => ({
        factId, sourceIds: realCatalog.facts.find(fact => fact.id === factId)?.sourceIds ?? [],
      }));
      bubble('bot', intro.text, { evidence });
      introText = intro.text;
      introSpoken = false;
      const questions = artifact.suggestedQuestions.length ? artifact.suggestedQuestions : fallbackQuestions(place);
      for (const question of questions.slice(0, 3)) {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'chat-chip';
        chip.textContent = question;
        chip.addEventListener('click', () => ask(question));
        suggestions.append(chip);
      }
      const name = mission?.name ?? artifact.name.split(' (')[0].replace(/ (lander|helicopter)$/, '');
      input.placeholder = 'Send a question to ' + name + '…';
      $('chat-title').textContent = name;
      setStatus('idle');
    },
    /** Tell the first-person intro straight away, with the words shown as a speech bubble. */
    narrate() {
      if (!artifact || !introText) return;
      introSpoken = true;
      narrationText.textContent = introText;
      narration.hidden = false;
      clearTimeout(narrationTimer);
      const narrationRun = generation;
      const complete = () => {
        if (narrationRun !== generation) return;
        hideNarration(); storyComplete = true;
        if (replayComplete && !document.hidden) finishDiscovery();
      };
      const fallback = () => {
        // No voice (off, unsupported or blocked): keep the words up for about the time to read them.
        narrationTimer = setTimeout(complete, (estimatedSpeechSeconds(introText) + 2) * 1000);
      };
      const start = () => speak(introText, spoke => (spoke ? complete() : fallback()));
      // Some browsers fill the voice list a moment after load.
      if (synth && !synth.getVoices().length) {
        const run = generation;
        let started = false;
        const go = () => {
          if (started || run !== generation) return;
          started = true;
          start();
        };
        synth.addEventListener('voiceschanged', go, { once: true });
        setTimeout(go, 700);
      } else {
        start();
      }
    },
    finishReplay() {
      replayComplete = true;
      if (storyComplete && !document.hidden) finishDiscovery();
    },
    close() {
      reward?.close(); finish.hidden = true;
      generation++;
      hideNarration();
      hush();
      artifact = null;
      setPending(false);
      setOpen(false);
      launcher.hidden = true;
    },
  };
}
