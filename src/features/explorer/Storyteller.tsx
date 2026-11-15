import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import type { Artifact } from '../../shared/contracts';
import type { Catalog } from '../../shared/app-types';
import { hasNasaEvidence } from '../../shared/fact-policy';
import { useCharacterActivity } from '../../shared/character-activity';
import { SourceList } from './FactCard';
import { characterName, INTRODUCTION_ID } from './narrative';
import ShuttleMascot from './ShuttleMascot';
import { chooseFriendlyVoice, estimatedSpeechSeconds, shuttleAction, SPEECH_PITCH, SPEECH_RATE, SPEECH_VOLUME } from './voice';
import { MAX_MESSAGE_LENGTH } from './session';
import type { ChatMessage, ChatSession } from './session';
import { presentDiscoveryReward } from '../rewards/reward-ui';
import { rewardBook } from '../rewards/rewards';
import { useRewardProgress } from '../rewards/PassportButton';

function MessageSources({ catalog, message, onOpen }: { catalog: Catalog; message: ChatMessage; onOpen: () => void }) {
  const facts = (message.evidence ?? []).flatMap((entry) => {
    const fact = catalog.facts.find((item) => item.id === entry.factId);
    return fact ? [fact] : [];
  });
  if (!facts.length) return null;
  return <details className="xp-dialogue__sources" onToggle={(event) => { if (event.currentTarget.open) onOpen(); }}>
    <summary>Sources</summary>
    {facts.map((fact) => <div key={fact.id} className="xp-dialogue__source-fact">
      <p>{fact.text}</p>
      {fact.reviewStatus === 'pending' && !hasNasaEvidence(fact, catalog.sources) && <small>Awaiting review</small>}
      <SourceList catalog={catalog} sourceIds={fact.sourceIds} />
    </div>)}
  </details>;
}

export default function Storyteller({ catalog, artifact, session, onAsk, onRetry, onStory }: {
  catalog: Catalog; artifact: Artifact; session: ChatSession;
  onAsk: (question: string) => void; onRetry: () => void; onStory: (expectedCursor: number) => void;
}) {
  const { setActivity } = useCharacterActivity();
  const [reduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [presenting, setPresenting] = useState(false);
  const [draft, setDraft] = useState('');
  const [voice, setVoice] = useState(() => typeof window.speechSynthesis !== 'undefined');
  const [voicing, setVoicing] = useState(false);
  const [replay, setReplay] = useState(0);
  const [voices, setVoices] = useState(() => window.speechSynthesis?.getVoices() ?? []);
  const [voiceError, setVoiceError] = useState('');
  const log = useRef<HTMLOListElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const follow = useRef(true);
  const stopped = useRef(false);
  const presentationTimer = useRef<number | undefined>(undefined);
  const introduced = session.messages.some((message) => message.storyId === INTRODUCTION_ID);
  const last = session.messages.at(-1);
  const text = last?.role === 'assistant' ? last.text : '';
  const speechAvailable = typeof window.speechSynthesis !== 'undefined';
  const selectedVoice = useMemo(() => chooseFriendlyVoice(voices), [voices]);
  const phase = session.pending ? 'thinking' : (presenting || voicing) ? 'speaking' : 'idle';
  const name = characterName(artifact);
  useRewardProgress();
  const reward = useRef<ReturnType<typeof presentDiscoveryReward> | undefined>(undefined);
  useEffect(() => () => reward.current?.close(), []);
  const blocked = session.pending || !!session.failure;
  const action = shuttleAction(phase === 'speaking', draft);
  const shuttleLabel = action === 'stop' ? 'Stop speaking' : action === 'send' ? 'Send question' : `Hear ${name} again`;

  useEffect(() => { heading.current?.focus(); }, []);
  useEffect(() => { if (!introduced && !session.pending) onStory(0); }, [introduced, session.pending, onStory]);

  useEffect(() => {
    if (!text) { setPresenting(false); return; }
    stopped.current = false;
    setPresenting(true);
    presentationTimer.current = window.setTimeout(() => setPresenting(false), estimatedSpeechSeconds(text) * 1000);
    return () => window.clearTimeout(presentationTimer.current);
  }, [text, session.messages.length, replay]);

  useEffect(() => {
    if (!speechAvailable) return;
    const update = () => setVoices(window.speechSynthesis.getVoices());
    window.speechSynthesis.addEventListener('voiceschanged', update);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', update);
  }, [speechAvailable]);

  useEffect(() => {
    setActivity({ artifactId: artifact.id, phase });
    return () => setActivity(null);
  }, [artifact.id, phase, setActivity]);

  useEffect(() => {
    if (follow.current && log.current) log.current.scrollTop = log.current.scrollHeight;
  }, [session.messages.length, session.pending, session.failure]);

  useEffect(() => {
    if (stopped.current || !voice || !speechAvailable || !text || session.pending) { setVoicing(false); return; }
    const synth = window.speechSynthesis;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.lang = selectedVoice?.lang ?? 'en-US';
    utterance.rate = SPEECH_RATE;
    utterance.pitch = SPEECH_PITCH;
    utterance.volume = SPEECH_VOLUME;
    utterance.onend = () => { stopped.current = true; setVoicing(false); setPresenting(false); window.clearTimeout(presentationTimer.current); };
    utterance.onerror = (event) => {
      setVoicing(false);
      if (event.error !== 'canceled' && event.error !== 'interrupted') {
        setVoiceError(event.error === 'not-allowed' ? 'Tap the shuttle to hear my story.' : 'Voice is unavailable here. You can keep reading.');
        setVoice(false);
      }
    };
    setVoicing(true);
    synth.speak(utterance);
    return () => { utterance.onend = null; utterance.onerror = null; synth.cancel(); };
  }, [voice, speechAvailable, text, session.messages.length, session.pending, replay, selectedVoice]);

  useEffect(() => {
    const hide = () => {
      if (document.hidden) {
        stopped.current = true;
        window.clearTimeout(presentationTimer.current);
        setPresenting(false);
        if (speechAvailable) window.speechSynthesis.cancel();
        setVoicing(false);
      }
    };
    document.addEventListener('visibilitychange', hide);
    return () => document.removeEventListener('visibilitychange', hide);
  }, [speechAvailable]);

  function pause() {
    stopped.current = true;
    window.clearTimeout(presentationTimer.current);
    setPresenting(false);
    if (speechAvailable) window.speechSynthesis.cancel();
    setVoicing(false);
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    sendQuestion();
  }
  function sendQuestion() {
    const question = draft.trim();
    if (!question || blocked) return;
    pause();
    follow.current = true;
    setDraft('');
    onAsk(question);
  }

  return <section className={`xp-panel xp-dialogue xp-dialogue--${phase}`} aria-labelledby="xp-panel-title">
    <svg className="xp-cosmos" viewBox="0 0 440 600" preserveAspectRatio="xMidYMin slice" aria-hidden="true">
      <g className="xp-cosmos__orbits" fill="none" stroke="currentColor">
        <ellipse cx="300" cy="158" rx="154" ry="56" transform="rotate(-28 300 158)" />
        <ellipse cx="300" cy="158" rx="184" ry="76" transform="rotate(-28 300 158)" strokeDasharray="2 10" />
        <circle cx="300" cy="158" r="58" />
        <path d="m30 325 42-29 36 15 42-60m-42 60 27 46 54-14" />
      </g>
      <g className="xp-cosmos__stars" fill="currentColor">
        <circle cx="30" cy="325" r="2" /><circle cx="72" cy="296" r="3" /><circle cx="108" cy="311" r="2" />
        <circle cx="150" cy="251" r="2" /><circle cx="135" cy="357" r="2" /><circle cx="189" cy="343" r="3" />
        <path d="m55 120 2-7 2 7 7 2-7 2-2 7-2-7-7-2zm305 290 2-7 2 7 7 2-7 2-2 7-2-7-7-2z" />
      </g>
    </svg>
    <header className="xp-dialogue__head">
      <span className="xp-dialogue__emblem" aria-hidden="true">
        <svg viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="12" /><ellipse cx="24" cy="24" rx="23" ry="7" transform="rotate(-32 24 24)" /><path d="m23 17 3 6 6 1-5 4 1 6-5-3-5 3 1-6-4-4 6-1z" /></svg>
      </span>
      <div className="xp-dialogue__identity">
        <span className="xp-dialogue__eyebrow">A voice from the cosmos</span>
        <h2 id="xp-panel-title" tabIndex={-1} ref={heading}>{name}</h2>
        <p role="status"><i className={`xp-dialogue__signal xp-dialogue__signal--${phase}`} />
          {phase === 'thinking' ? 'Let’s find out!' : phase === 'speaking' ? 'Ready for a little adventure?' : 'Your turn, explorer!'}</p>
      </div>
      <button type="button" className="xp-dialogue__voice" aria-pressed={voice}
        aria-label={voice ? 'Turn voice off' : 'Read messages aloud'} disabled={!speechAvailable}
        onClick={() => { setVoiceError(''); if (voice) pause(); else if (text) setReplay((value) => value + 1); setVoice((value) => !value); }}>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" /><path d={voice ? 'M17 8a7 7 0 0 1 0 8m3-11a11 11 0 0 1 0 14' : 'm17 9 5 6m0-6-5 6'} /></svg>
      </button>
    </header>

    <ol className="xp-log xp-dialogue__log" ref={log} role="log" aria-live="polite" aria-label={`Conversation with ${name}`}
      onScroll={(event) => {
        const element = event.currentTarget;
        follow.current = element.scrollHeight - element.scrollTop - element.clientHeight < 65;
      }}>
      {session.messages.map((message, index) => {
        return <li key={index} className={`xp-msg xp-msg--${message.role}${message.role === 'assistant' ? ' xp-msg--smoke' : ''}`}>
          <span className="xp-msg__sender"><span aria-hidden="true">{message.role === 'user' ? '↗' : '✦'}</span> {message.role === 'user' ? 'You, explorer' : name}</span>
          <p className="xp-msg__text">{message.text}</p>
          {message.role === 'assistant' && <MessageSources catalog={catalog} message={message} onOpen={pause} />}
        </li>;
      })}
      {session.pending && <li className="xp-dialogue__thinking" role="status">Thinking<span aria-hidden="true">…</span></li>}
      {session.failure && <li className="xp-dialogue__error" role="alert">
        <p>{session.failure.kind === 'network' ? 'The connection dropped. Your question is still here.' : session.failure.serverText || 'I cannot reach my records right now.'}</p>
        <button type="button" onClick={onRetry}>Try again</button>
      </li>}
    </ol>

    <footer className="xp-dialogue__footer">
      <form className="xp-ask" onSubmit={submit}>
        <label className="xp-visually-hidden" htmlFor={`xp-ask-${artifact.id}`}>Ask {name} a question</label>
        <div className="xp-ask__row">
          <input id={`xp-ask-${artifact.id}`} className="xp-input" type="text" autoComplete="off"
            value={draft} maxLength={MAX_MESSAGE_LENGTH} onFocus={pause} onChange={(event) => setDraft(event.target.value)}
            placeholder={`Ask ${name} a question…`} />
          <button type="button" className={`xp-shuttle-button${phase === 'speaking' && !reduced ? ' is-speaking' : ''}`} disabled={blocked}
            aria-label={shuttleLabel}
            title={shuttleLabel}
            onClick={() => {
              if (action === 'stop') pause();
              else if (action === 'send') sendQuestion();
              else {
                setVoiceError(speechAvailable ? '' : 'Voice is unavailable in this browser. My story is right here to read.');
                setVoice(speechAvailable);
                setReplay((value) => value + 1);
              }
            }}>
            <ShuttleMascot speaking={phase === 'speaking' && !reduced} />
            {phase === 'speaking' && <span className="xp-shuttle-button__stop" aria-hidden="true">■</span>}
          </button>
        </div>
      </form>
      {voiceError && <p className="xp-note" role="status">{voiceError}</p>}
      {introduced && <button type="button" className="discovery-finish" onClick={() => {
        pause(); reward.current = presentDiscoveryReward(artifact.id);
      }} disabled={rewardBook.read().some((badge) => badge.id === artifact.id)}>
        {rewardBook.read().some((badge) => badge.id === artifact.id) ? '✦ Discovery badge collected' : 'Finish discovery · collect your badge ✦'}
      </button>}
    </footer>
  </section>;
}
