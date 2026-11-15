import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { ArtifactId } from '../../shared/contracts';
import type { Catalog, ChatAdapter } from '../../shared/app-types';
import { EMPTY_SESSION, MAX_MESSAGE_LENGTH } from './session';
import { SourceList } from './FactCard';
import ShuttleMascot from './ShuttleMascot';
import { createGlobalChatStore } from './global-chat-store';
import './global-chat.css';

export default function GlobalChat({ catalog, chat, activeArtifactId, voyageActive = false }: {
  catalog: Catalog; chat: ChatAdapter; activeArtifactId?: ArtifactId; voyageActive?: boolean;
}) {
  const [store] = useState(() => createGlobalChatStore(chat));
  const sessions = useSyncExternalStore(store.subscribe, store.getSnapshot);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<ArtifactId>(activeArtifactId ?? 'insight');
  const [drafts, setDrafts] = useState<Partial<Record<ArtifactId, string>>>({});
  const input = useRef<HTMLInputElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const log = useRef<HTMLOListElement>(null);
  const artifact = catalog.artifacts.find(item => item.id === selected)!;
  const session = sessions[selected] ?? EMPTY_SESSION;
  const name = artifact.name.split(' (')[0];
  const draft = drafts[selected] ?? '';

  useEffect(() => { if (activeArtifactId) setSelected(activeArtifactId); }, [activeArtifactId]);
  useEffect(() => {
    const selectMission = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.data?.type !== 'nasa:mission-selected') return;
      if (!Array.from(document.querySelectorAll('iframe')).some(frame => frame.contentWindow === event.source)) return;
      const id = event.data.artifactId;
      if (catalog.artifacts.some(item => item.id === id)) setSelected(id);
    };
    window.addEventListener('message', selectMission);
    return () => window.removeEventListener('message', selectMission);
  }, [catalog]);
  useEffect(() => {
    if (!open) return;
    input.current?.focus({ preventScroll: true });
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpen(false); launcher.current?.focus(); }
    };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, [open]);
  useEffect(() => {
    if (open && log.current) log.current.scrollTop = log.current.scrollHeight;
  }, [open, selected, session.messages.length, session.pending]);

  function send(question: string) {
    if (!question.trim() || session.pending) return;
    setDrafts(current => ({ ...current, [selected]: '' }));
    void store.ask(selected, question);
  }

  return <div className={`global-chat${voyageActive ? ' global-chat--voyage' : ''}`}>
    {open && <section className="global-chat__panel" id="global-space-chat" role="dialog" aria-label="Space chat" aria-modal="false">
      <header className="global-chat__head">
        <div><small>SPACE CHAT</small><h2>Talk to an explorer</h2></div>
        <button type="button" onClick={() => { setOpen(false); launcher.current?.focus(); }} aria-label="Close space chat">×</button>
      </header>
      <label className="global-chat__select">Your space friend
        <select value={selected} onChange={event => setSelected(event.target.value as ArtifactId)}>
          {(['moon', 'mars', 'deep-space'] as const).map(body => <optgroup key={body} label={body === 'moon' ? 'The Moon' : body === 'mars' ? 'Mars' : 'Deep space'}>
            {catalog.artifacts.filter(item => item.body === body).map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
          </optgroup>)}
        </select>
      </label>
      <ol className="global-chat__log" ref={log} role="log" aria-live="polite" aria-label={`Conversation with ${name}`}>
        <li className="global-chat__message"><small>{name}</small><p>Hi, explorer! What would you like to know about my mission?</p></li>
        {session.messages.map((message, index) => <li key={index} className={`global-chat__message${message.role === 'user' ? ' is-user' : ''}`}>
          <small>{message.role === 'user' ? 'You' : name}{message.mocked ? ' · Demo reply' : ''}</small>
          <p>{message.text}</p>
          {!!message.evidence?.length && <details><summary>Sources</summary>
            {message.evidence.map(evidence => <div key={evidence.factId} className="global-chat__source">
              <p>{catalog.facts.find(fact => fact.id === evidence.factId)?.text}</p>
              <SourceList catalog={catalog} sourceIds={evidence.sourceIds} />
            </div>)}
          </details>}
        </li>)}
        {session.pending && <li className="global-chat__status" role="status">Receiving a signal…</li>}
        {session.failure && <li className="global-chat__status" role="alert">The signal dropped. <button type="button" onClick={() => void store.retry(selected)}>Try again</button></li>}
      </ol>
      {!session.messages.length && <div className="global-chat__suggestions">
        {['What was your mission?', 'What did you discover?'].map(question => <button type="button" key={question} disabled={session.pending} onClick={() => send(question)}>{question}</button>)}
      </div>}
      <form className="global-chat__form" onSubmit={event => { event.preventDefault(); send(draft); }}>
        <input ref={input} aria-label={`Ask ${name} a question`} placeholder={`Ask ${name}…`} value={draft} maxLength={MAX_MESSAGE_LENGTH}
          onChange={event => setDrafts(current => ({ ...current, [selected]: event.target.value }))} />
        <button type="submit" disabled={session.pending || !draft.trim()} aria-label="Send question">↑</button>
      </form>
    </section>}
    <button type="button" className="global-chat__launcher" ref={launcher} aria-label={open ? 'Close space chat' : 'Open space chat'} aria-expanded={open} aria-controls="global-space-chat" onClick={() => setOpen(value => !value)}>
      {open ? <span aria-hidden="true">×</span> : <><ShuttleMascot speaking={false} /><span>Chat</span></>}
    </button>
  </div>;
}
