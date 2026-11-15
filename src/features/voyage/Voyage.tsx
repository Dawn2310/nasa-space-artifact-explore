// Legacy Voyage cockpit (Lead). The visitor is an astronaut in the pretend UFO "Echo".
// A flight is one world (Moon, Mars or deep space) or a one-stop hop to a single machine.
// App owns the active plan + stop (and turns it into a ViewState); this component shows the
// cockpit, speaks the lines with character voices and asks App to move with onGo / onExit.

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { Catalog } from '../../shared/app-types';
import { assetUrl, findArtifact, findAsset } from '../../shared/app-types';
import { estimatedSpeechSeconds, SPEECH_VOLUME } from '../explorer/voice';
import { CHAPTERS, machinePlan, machinesOf, nextChapter, worldPlan } from './script';
import type { ChapterId } from './script';
import type { VoyageLine, VoyagePlan, VoyageScene, VoyageStop } from './script';
import { pickVoice, voiceProfile } from './voices';
import './voyage.css';
import ChapterEmblem from './ChapterEmblem';
import { createIntroNarration } from './intro-narration';
import type { IntroVoiceState } from './intro-narration';
import { presentDiscoveryReward, openPassport } from '../rewards/reward-ui';
import { useRewardProgress } from '../rewards/PassportButton';

const WARP_MS = 1500;
const AUTOPILOT_PAUSE_MS = 1800;
/** Pause after cancel() before speak(): Chrome can otherwise keep the old sentence playing. */
const SPEAK_GAP_MS = 120;

export function sceneKey(scene: VoyageScene): string {
  return scene.kind === 'solar' ? 'solar' : 'map:' + scene.body;
}

/** Silence every voice on the page: this window and the same-origin mission maps (iframes). */
export function hushEverywhere() {
  try { window.speechSynthesis?.cancel(); } catch { /* no speech engine */ }
  for (const frame of Array.from(document.querySelectorAll('iframe'))) {
    try { frame.contentWindow?.speechSynthesis?.cancel(); } catch { /* not same-origin */ }
  }
}

function speakerName(catalog: Catalog, line: VoyageLine): string {
  if (line.speaker === 'echo') return 'Echo · your ship’s guide';
  const artifact = findArtifact(catalog, line.speaker);
  return artifact ? artifact.name.split(' (')[0] : line.speaker;
}

function UfoIcon({ className }: { className?: string }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg className={className} viewBox="0 0 64 40" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-hull`} x1="0" x2="0" y1="0" y2="1"><stop stopColor="#747d80" /><stop offset=".35" stopColor="#c1c4bd" /><stop offset=".55" stopColor="#727c7f" /><stop offset=".7" stopColor="#343f45" /><stop offset="1" stopColor="#7b8587" /></linearGradient>
        <radialGradient id={`${id}-dome`} cx=".3" cy=".15" r=".9"><stop stopColor="#65838a" /><stop offset=".35" stopColor="#18333e" /><stop offset="1" stopColor="#07141e" /></radialGradient>
      </defs>
      <ellipse cx="32" cy="22" rx="29" ry="8.5" fill={`url(#${id}-hull)`} stroke="#657174" strokeWidth=".8" />
      <path d="M20 18c0-7 5.5-12 12-12s12 5 12 12" fill={`url(#${id}-dome)`} stroke="#8a9899" strokeWidth="1" />
      <ellipse cx="32" cy="18" rx="13" ry="2.8" fill="none" stroke="#39484d" strokeWidth="1.3" />
      <path d="m10 20 8 1m2 7 3-5m9 7v-6m12 4-3-5m13-3-8 1" stroke="#3f4d52" strokeWidth=".7" />
      {[14, 25, 39, 50].map((x, i) => <rect key={x} x={x - 1.5} y={i === 0 || i === 3 ? 23 : 26} width="3" height="1.5" rx=".5" fill={i % 2 ? '#82cbd9' : '#deb374'} />)}
      <path d="M24 29v4m16-4v4" stroke="#4a5a60" strokeWidth="4" />
      <path d="M24 33v3m16-3v3" stroke="#78d8ec" strokeWidth="1.7" opacity=".75" />
    </svg>
  );
}

const DONE_KEY = 'echo-chapters-done';

/** Chapters the visitor has finished (kept in this browser only, so Echo can continue the story). */
export function finishedChapters(): ChapterId[] {
  try {
    const saved: unknown = JSON.parse(window.localStorage.getItem(DONE_KEY) ?? '[]');
    return Array.isArray(saved) ? CHAPTERS.map((item) => item.id).filter((id) => saved.includes(id)) : [];
  } catch {
    return [];
  }
}

export function markChapterFinished(chapter: ChapterId) {
  try {
    window.localStorage.setItem(DONE_KEY, JSON.stringify([...new Set([...finishedChapters(), chapter])]));
  } catch { /* private mode: the story still works, it just restarts at chapter 1 */ }
}

/**
 * Opening scene: Echo flies in as soon as the site opens and sets up the story
 * ("Abandoned but not Forgotten"), then leads the visitor into the next unfinished chapter.
 */
export function VoyageIntro({ onStart, onChoose, onSkip }: {
  onStart: (plan: VoyagePlan) => void;
  onChoose: () => void;
  onSkip: () => void;
}) {
  const done = useMemo(finishedChapters, []);
  const next = CHAPTERS.find((item) => !done.includes(item.id)) ?? CHAPTERS[0];
  const returning = done.length > 0;
  const allDone = done.length === CHAPTERS.length;
  const title = returning ? 'Welcome back, astronaut!' : 'Hi, astronaut! I’m Echo.';
  const introduction = allDone
    ? 'You have flown the whole story. The machines are still out there, quiet but not forgotten. Want to fly it again, or explore on your own?'
    : returning
      ? `Our story is not finished. Last time we collected the Legacy Sparks of ${done.map((id) => CHAPTERS.find((item) => item.id === id)!.place).join(' and ')}. Ready for the next chapter?`
      : 'Space machines were left behind, but their stories live on. Hop into my UFO and discover what made them special!';
  const [voiceState, setVoiceState] = useState<IntroVoiceState>('ready');
  const narration = useRef<ReturnType<typeof createIntroNarration> | null>(null);
  useEffect(() => {
    const synth = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window ? window.speechSynthesis : undefined;
    const player = createIntroNarration({
      text: `${title} ${introduction}`,
      synth,
      beforeSpeak: hushEverywhere,
      onState: setVoiceState,
      makeUtterance(text) {
        const utterance = new SpeechSynthesisUtterance(text);
        const profile = voiceProfile('echo');
        const voice = pickVoice('echo', synth?.getVoices() ?? []);
        if (voice) utterance.voice = voice;
        utterance.lang = voice?.lang ?? 'en-US';
        utterance.rate = profile.rate;
        utterance.pitch = profile.pitch;
        utterance.volume = SPEECH_VOLUME;
        return utterance;
      },
    });
    narration.current = player;
    const timer = window.setTimeout(player.tryAutoPlay, 1600);
    const unlock = (event: PointerEvent) => {
      // Navigation and the explicit voice control handle their own clicks.
      if (event.target instanceof Element && event.target.closest('button, a, input')) return;
      player.tryAutoPlay();
    };
    window.addEventListener('pointerdown', unlock);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('pointerdown', unlock);
      player.dispose();
      narration.current = null;
    };
  }, [title, introduction]);
  const leave = (action: () => void) => { narration.current?.stop(); action(); };
  return (
    <section className="vy-intro" role="dialog" aria-labelledby="vy-intro-title">
      <div className="vy-intro__ship" aria-hidden="true"><UfoIcon className="vy-intro__ufo" /><span className="vy-intro__beam" /></div>
      <div className="vy-intro__card">
        <div className="vy-intro__heading">
          <p className="vy-intro__kicker">Abandoned, but not forgotten</p>
          <button type="button" className="vy-intro__voice" disabled={voiceState === 'unavailable'}
            onClick={() => voiceState === 'playing' ? narration.current?.stop() : narration.current?.play()}
            aria-label={voiceState === 'playing' ? 'Stop introduction' : voiceState === 'unavailable' ? 'Voice unavailable in this browser' : 'Listen to Echo’s introduction'}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <path d="M4 9v6h4l5 4V5L8 9H4Z" />
              {voiceState === 'playing' ? <path d="m17 9 5 6m0-6-5 6" /> : <path d="M16 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14" />}
            </svg>
            {voiceState === 'playing' ? 'Stop' : voiceState === 'unavailable' ? 'No voice' : 'Listen'}
          </button>
        </div>
        <h1 id="vy-intro-title">{title}</h1>
        <p className="vy-intro__text">{introduction}</p>
        <ol className="vy-intro__path" aria-label="The story in three chapters">
          {CHAPTERS.map((chapter) => (
            <li key={chapter.id} className={`vy-intro__chapter vy-intro__chapter--${chapter.id}${done.includes(chapter.id) ? ' is-done' : ''}${chapter.id === next.id && !allDone ? ' is-next' : ''}`}>
              <ChapterEmblem chapter={chapter.id} completed={done.includes(chapter.id)} />
              <strong>{chapter.place}</strong>
              <span>{chapter.title}</span>
              <small>{machinesOf(chapter.id).length} machines</small>
            </li>
          ))}
        </ol>
        <div className="vy-intro__actions">
          <button type="button" className="vy-intro__go" onClick={() => leave(() => onStart(worldPlan(allDone ? CHAPTERS[0].id : next.id)))}>
            {allDone ? 'Fly the story again ▶' : returning ? `Continue: ${next.place} ▶` : 'Start the story ▶'}
          </button>
          <button type="button" className="vy-intro__alt" onClick={() => leave(onChoose)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="5" cy="18" r="2" /><circle cx="19" cy="6" r="2" /><path d="M7 18h7a4 4 0 0 0 0-8h-4a4 4 0 0 1 0-8h7" /></svg>
            <span>Choose a flight</span>
          </button>
          <button type="button" className="vy-intro__alt" onClick={() => leave(onSkip)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="m16 8-2.5 5.5L8 16l2.5-5.5L16 8Z" /></svg>
            <span>Explore on my own</span>
          </button>
        </div>
        <p className="vy-intro__note">Echo and the UFO are make-believe guides. The machines and facts are real NASA history.</p>
      </div>
    </section>
  );
}

/** "Board the UFO" on the solar map: opens the flight plan (three world flights or one machine). */
export function VoyageLauncher({ onStart, startOpen = false }: { onStart: (plan: VoyagePlan) => void; startOpen?: boolean }) {
  const [open, setOpen] = useState(startOpen);
  return (
    <>
      {open && (
        <section className="vy-plan" role="dialog" aria-label="Choose your flight">
          <header className="vy-plan__head">
            <h2>Choose your flight</h2>
            <button type="button" className="vy-plan__close" onClick={() => setOpen(false)} aria-label="Close">×</button>
          </header>
          <div className="vy-plan__worlds">
            {CHAPTERS.map((chapter) => {
              const plan = worldPlan(chapter.id);
              const machines = machinesOf(chapter.id);
              return (
                <article key={chapter.id} className={`vy-plan__world vy-plan__world--${chapter.id}`}>
                  <button type="button" className="vy-plan__fly" onClick={() => onStart(plan)}>
                    <span className="vy-plan__place">{chapter.place}</span>
                    <span className="vy-plan__title">{chapter.title}</span>
                    <span className="vy-plan__blurb">{chapter.blurb} · {machines.length} machines</span>
                  </button>
                  <div className="vy-plan__hops" aria-label={`Visit one machine: ${chapter.place}`}>
                    {machines.map((stop) => (
                      <button key={stop.id} type="button" onClick={() => { const hop = machinePlan(stop.id); if (hop) onStart(hop); }}>
                        {stop.label}{stop.year ? <small> {stop.year}</small> : null}
                      </button>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
      <button type="button" className="vy-launch" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        <UfoIcon className="vy-launch__ufo" />
        <span className="vy-launch__text">
          <strong>Board the UFO</strong>
          <span>Fly to the Moon, Mars or deep space, or visit one machine</span>
        </span>
      </button>
    </>
  );
}

interface VoyageProps {
  catalog: Catalog;
  plan: VoyagePlan;
  stopIndex: number;
  onGo: (index: number) => void;
  onExit: () => void;
  /** Continue the story with the next chapter's flight (only offered at the end of a world flight). */
  onNextChapter?: (plan: VoyagePlan) => void;
  travelling?: boolean;
}

const WARP_STREAKS = Array.from({ length: 46 }, (_, i) => ({
  angle: (i * 137.508) % 360,
  delay: ((i * 53) % 40) / 100,
  length: 18 + ((i * 29) % 30),
}));

export default function Voyage({ catalog, plan, stopIndex, onGo, onExit, onNextChapter, travelling = false }: VoyageProps) {
  const stops = plan.stops;
  const stop: VoyageStop = stops[stopIndex];
  const chapter = CHAPTERS.find((item) => item.id === plan.chapter)!;
  const sparkStops = useMemo(() => stops.filter((item) => item.spark), [stops]);
  const isLast = stopIndex === stops.length - 1;
  // At the end of a world flight Echo offers the next chapter, so the three flights read as one story.
  const upNextId = stop.home ? nextChapter(plan.chapter) : undefined;
  const upNext = CHAPTERS.find((item) => item.id === upNextId);
  useEffect(() => {
    if (stop.home) markChapterFinished(plan.chapter);
  }, [stop.home, plan.chapter]);
  const [revealed, setRevealed] = useState(0);
  const [speaking, setSpeaking] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const { earned, overlayOpen } = useRewardProgress();
  // Warp when the new stop is in another world. Decided while rendering (the "previous prop in
  // state" pattern), so it stays correct when React runs effects twice in development.
  const [prevStop, setPrevStop] = useState(stopIndex);
  const [warping, setWarping] = useState<string | null>(null);
  if (prevStop !== stopIndex) {
    const changed = sceneKey(stops[prevStop].scene) !== sceneKey(stop.scene);
    setPrevStop(stopIndex);
    setWarping(changed ? (stop.scene.kind === 'solar' ? 'open space' : chapter.place) : null);
  }
  const [autopilot, setAutopilot] = useState(false);
  const synth = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
  const [voiceOn, setVoiceOn] = useState(Boolean(synth));
  const voiceRef = useRef(voiceOn);
  // One "run" per stop (or replay). Anything from an older run must not speak or move on.
  const run = useRef(0);
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    for (const id of timers.current) window.clearTimeout(id);
    timers.current = [];
  };
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));

  // Speak one line in its character's voice; only one voice is ever playing.
  const say = useCallback((line: VoyageLine, token: number, next: () => void) => {
    const fallback = () => later(() => token === run.current && next(), (estimatedSpeechSeconds(line.text) + 1.2) * 1000);
    hushEverywhere();
    if (!synth || !voiceRef.current) return fallback();
    const utterance = new SpeechSynthesisUtterance(line.text);
    const profile = voiceProfile(line.speaker);
    const voice = pickVoice(line.speaker, synth.getVoices());
    if (voice) utterance.voice = voice;
    utterance.lang = voice?.lang ?? 'en-US';
    utterance.rate = profile.rate;
    utterance.pitch = profile.pitch;
    utterance.volume = SPEECH_VOLUME;
    let finished = false;
    const finish = (spoke: boolean) => {
      if (finished || token !== run.current) return;
      finished = true;
      if (spoke) later(next, 450);
      else fallback();
    };
    utterance.onend = () => finish(true);
    // Blocked or unsupported voice: keep the story going at reading speed.
    utterance.onerror = (event) => {
      if (event.error !== 'interrupted' && event.error !== 'canceled') finish(false);
    };
    later(() => {
      if (token !== run.current) return;
      synth.speak(utterance);
    }, SPEAK_GAP_MS);
  }, [synth]);

  const playFrom = useCallback((token: number, i: number) => {
    if (token !== run.current) return;
    if (i >= stop.lines.length) {
      setSpeaking(null);
      setDone(true);
      return;
    }
    setRevealed(i + 1);
    setSpeaking(i);
    say(stop.lines[i], token, () => playFrom(token, i + 1));
  }, [say, stop]);

  // Each new stop: warp if we change world, then reveal and speak the lines one by one.
  useEffect(() => {
    const token = ++run.current;
    clearTimers();
    hushEverywhere();
    setRevealed(0);
    setSpeaking(null);
    setDone(false);
    if (travelling) return () => clearTimers();
    // Demo entry: InSight introduces itself as soon as its slide opens.
    // Keep only say()'s short engine cancel/speak gap, with no warp or pre-roll.
    if (stop.artifactId === 'insight') {
      setWarping(null);
      playFrom(token, 0);
      return () => clearTimers();
    }
    later(() => {
      if (token !== run.current) return;
      setWarping(null);
      playFrom(token, 0);
    }, warping ? WARP_MS : 350);
    return () => clearTimers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stopIndex, plan.id, travelling]);

  // Autopilot: move on by itself once the stop has finished talking.
  useEffect(() => {
    if (!done || travelling || !stop.spark || !stop.artifactId) return;
    let offer: ReturnType<typeof presentDiscoveryReward> | undefined;
    const timer = window.setTimeout(() => { offer = presentDiscoveryReward(stop.artifactId!); }, 0);
    return () => { window.clearTimeout(timer); offer?.close(); };
  }, [done, travelling, stop.id, stop.spark, stop.artifactId]);

  useEffect(() => {
    if (travelling || overlayOpen || !autopilot || !done || isLast) return;
    const id = window.setTimeout(() => onGo(stopIndex + 1), AUTOPILOT_PAUSE_MS);
    return () => window.clearTimeout(id);
  }, [autopilot, done, isLast, stopIndex, onGo, travelling, overlayOpen]);

  // Stop talking when the cockpit closes.
  useEffect(() => () => {
    run.current++;
    clearTimers();
    hushEverywhere();
  }, []);

  const toggleVoice = () => {
    voiceRef.current = !voiceOn;
    if (voiceOn) {
      hushEverywhere();
      setSpeaking(null);
      if (speaking !== null) {
        const token = ++run.current;
        clearTimers();
        const lineIndex = speaking;
        later(() => { if (token === run.current) playFrom(token, lineIndex + 1); }, estimatedSpeechSeconds(stop.lines[lineIndex].text) * 1000);
      }
    }
    setVoiceOn(!voiceOn);
  };

  const replay = () => {
    const token = ++run.current;
    clearTimers();
    setDone(false);
    playFrom(token, 0);
  };

  const artifact = stop.artifactId ? findArtifact(catalog, stop.artifactId) : undefined;
  const photo = stop.photo && artifact ? findAsset(catalog, artifact.imageAssetId) : undefined;
  const sparkIndex = sparkStops.findIndex((item) => item.id === stop.id);
  const collected = sparkStops.filter((item) => earned.some((badge) => badge.id === item.artifactId));
  const isHop = plan.id.startsWith('hop:');

  const sources = useMemo(() => {
    const ids = new Set(stop.lines.slice(0, revealed).flatMap((line) => line.factIds));
    const sourceIds = [...new Set(catalog.facts.filter((fact) => ids.has(fact.id)).flatMap((fact) => fact.sourceIds))];
    return sourceIds.map((id) => catalog.sources.find((source) => source.id === id)).filter((source) => source !== undefined).slice(0, 3);
  }, [catalog, stop, revealed]);

  if (travelling) return null;
  return (
    <div className={`vy${warping ? ' vy--warping' : ''}`} role="region" aria-label="Legacy Voyage cockpit">
      <div className="vy-window" aria-hidden="true">
        <span className="vy-window__corner vy-window__corner--tl" /><span className="vy-window__corner vy-window__corner--tr" />
        <span className="vy-window__corner vy-window__corner--bl" /><span className="vy-window__corner vy-window__corner--br" />
      </div>

      {warping && (
        <div className="vy-warp" aria-hidden="true">
          {WARP_STREAKS.map((streak, i) => (
            <i key={i} style={{ '--a': `${streak.angle}deg`, animationDelay: `${streak.delay}s`, width: `${streak.length}vmax` } as CSSProperties} />
          ))}
          <p>Warping to {warping}…</p>
        </div>
      )}

      <header className="vy-top">
        <div className="vy-brand">
          <UfoIcon className="vy-brand__ufo" />
          <div>
            <p className="vy-brand__ship">UFO Echo · {isHop ? 'Quick hop' : 'Legacy Voyage'}</p>
            <p className="vy-brand__chapter">{plan.title}</p>
          </div>
        </div>
        {stops.length > 1 ? (
          <ol className="vy-route" aria-label="Flight route">
            {stops.map((item, i) => (
              <li key={item.id} className={`vy-route__stop vy-route__stop--${plan.chapter}${i === stopIndex ? ' is-here' : ''}${i < stopIndex ? ' is-past' : ''}`}>
                <button type="button" onClick={() => onGo(i)} aria-current={i === stopIndex ? 'step' : undefined}
                  title={item.label + (item.year ? ' · ' + item.year : '')} aria-label={'Fly to ' + item.label}>
                  {i === stopIndex && <UfoIcon className="vy-route__ufo" />}
                </button>
                <span className="vy-route__label">{item.label}</span>
              </li>
            ))}
          </ol>
        ) : <span className="vy-route" />}
        <button type="button" className="vy-exit" onClick={onExit}>Leave the UFO</button>
      </header>

      <section className="vy-console" aria-live="polite">
        <div className="vy-console__screen">
          {photo ? (
            <figure className="vy-photo">
              <img src={assetUrl(photo)} alt={photo.represents} />
              <figcaption>NASA photo · {photo.creatorCredit}</figcaption>
            </figure>
          ) : (
            <div className="vy-radar" aria-hidden="true"><span /><i /></div>
          )}
          <p className="vy-console__place">{stop.label}{stop.year ? ' · ' + stop.year : ''}</p>
          <p className="vy-console__chapter">{chapter.place}</p>
        </div>

        <div className="vy-talk">
          {stop.lines.slice(0, revealed).map((line, i) => (
            <div key={i} className={`vy-line${line.speaker === 'echo' ? ' vy-line--echo' : ' vy-line--machine'}${speaking === i ? ' is-speaking' : ''}`}>
              <span className="vy-line__who">{speakerName(catalog, line)}</span>
              <p>{line.text}</p>
            </div>
          ))}
          {revealed === 0 && <p className="vy-talk__wait">{warping ? 'Hold on tight…' : 'Incoming transmission…'}</p>}
          {sources.length > 0 && (
            <p className="vy-sources">
              {sources.map((source) => (
                <a key={source.id} href={source.url} target="_blank" rel="noreferrer" title={source.title}>{source.publisher} ↗</a>
              ))}
            </p>
          )}
        </div>

        <div className="vy-controls">
          <div className="vy-controls__row">
            <button type="button" className="vy-btn" onClick={() => onGo(stopIndex - 1)} disabled={stopIndex === 0} aria-label="Previous stop">◀</button>
            {isLast && upNext && onNextChapter ? (
              <button type="button" className={`vy-btn vy-btn--go${done ? ' is-ready' : ''}`} onClick={() => onNextChapter(worldPlan(upNext.id))}>
                Next chapter: {upNext.place} ▶
              </button>
            ) : isLast ? (
              <button type="button" className={`vy-btn vy-btn--go${done ? ' is-ready' : ''}`} onClick={onExit}>Land the UFO</button>
            ) : (
              <button type="button" className={`vy-btn vy-btn--go${done ? ' is-ready' : ''}`} onClick={() => onGo(stopIndex + 1)}>
                {stopIndex === 0 ? 'Take off ▶' : 'Next stop ▶'}
              </button>
            )}
          </div>
          <div className="vy-controls__row">
            <button type="button" className="vy-btn vy-btn--small" onClick={replay} aria-label="Hear this stop again">↺ Again</button>
            {stops.length > 1 && (
              <button type="button" className={`vy-btn vy-btn--small${autopilot ? ' is-on' : ''}`} aria-pressed={autopilot} onClick={() => setAutopilot((value) => !value)}>Autopilot</button>
            )}
            {synth && (
              <button type="button" className={`vy-btn vy-btn--small${voiceOn ? ' is-on' : ''}`} aria-pressed={voiceOn} onClick={toggleVoice}>
                {voiceOn ? 'Voice on' : 'Voice off'}
              </button>
            )}
          </div>
          {sparkStops.length > 0 && (
            <div className="vy-sparks" aria-label={`Legacy Sparks collected: ${collected.length} of ${sparkStops.length}`}>
              <button type="button" className="passport-button" onClick={openPassport}>✦ {collected.length}/{sparkStops.length} badges · Passport</button>
              <span className="vy-sparks__dots">
                {sparkStops.map((item, i) => <i key={item.id} className={collected.includes(item) ? 'is-lit' : i === sparkIndex ? 'is-next' : ''} />)}
              </span>
            </div>
          )}
        </div>
      </section>

      {stop.spark && done && !overlayOpen && (
        <p key={stop.id} className="vy-toast" role="status">
          <span>✦ Legacy Spark</span> {stop.spark}
        </p>
      )}

      {stop.home && done && (
        <section className="vy-wall" aria-label="Your Legacy Sparks">
          <h2>Your Legacy Sparks · {chapter.place}</h2>
          <ol>
            {collected.map((item) => (
              <li key={item.id}>
                <strong>{item.label}{item.year ? ` · ${item.year}` : ''}</strong>
                <span>{item.spark}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <p className="vy-note">Echo and the UFO are make-believe guides. The machines, dates and facts are real NASA history; the machine voices are AI storytellers, not the real spacecraft.</p>
    </div>
  );
}
