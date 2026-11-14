import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import type { Artifact, Fact } from '../../shared/contracts';
import type { Catalog } from '../../shared/app-types';
import FactCard, { Postcard } from './FactCard';
import { MAX_MESSAGE_LENGTH } from './session';
import type { ChatMessage, ChatSession } from './session';
import { AI_CHARACTER_NOTE, formatIsoDate } from './storyText';

interface ChatPanelProps {
  catalog: Catalog;
  artifact: Artifact;
  session: ChatSession;
  onAsk: (question: string) => void;
  onRetry: () => void;
}

interface AnswerProps {
  catalog: Catalog;
  message: ChatMessage;
}

/** One answer from the character, with its labels and an openable list of the facts it used. */
function Answer({ catalog, message }: AnswerProps) {
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const evidence = message.evidence ?? [];
  const citedFacts: Fact[] = [];
  const missingFactIds: string[] = [];
  for (const item of evidence) {
    const fact = catalog.facts.find((f) => f.id === item.factId);
    if (fact) citedFacts.push(fact);
    else missingFactIds.push(item.factId);
  }
  const postcardFact = citedFacts.find((fact) => fact.imageAssetId !== null);

  return (
    <li className="xp-msg xp-msg--assistant">
      <div className="xp-tags">
        <span className="xp-tag xp-tag--ai">AI character</span>
        {message.mocked && <span className="xp-tag xp-tag--warn">Mocked answer (no real AI yet)</span>}
        {message.status === 'insufficient-evidence' && <span className="xp-tag">No fact card for that</span>}
      </div>
      <p className="xp-msg__text">{message.text}</p>
      {message.status === 'insufficient-evidence' && (
        <p className="xp-note">
          The character only answers from its fact cards. Try one of the suggested questions below.
        </p>
      )}
      {postcardFact && <Postcard catalog={catalog} imageAssetId={postcardFact.imageAssetId} />}
      {evidence.length > 0 && (
        <>
          <button
            type="button"
            className="xp-btn xp-btn--small"
            aria-expanded={sourcesOpen}
            onClick={() => setSourcesOpen((open) => !open)}
          >
            {sourcesOpen ? 'Hide sources' : `Sources (${evidence.length})`}
          </button>
          {sourcesOpen && (
            <div className="xp-facts">
              {citedFacts.map((fact) => (
                <FactCard key={fact.id} catalog={catalog} fact={fact} sourcesOpen />
              ))}
              {missingFactIds.map((factId) => (
                <p key={factId} className="xp-source xp-source--missing">
                  The answer points to fact "{factId}", but that fact is not in the loaded catalog.
                </p>
              ))}
            </div>
          )}
        </>
      )}
    </li>
  );
}

export default function ChatPanel({ catalog, artifact, session, onAsk, onRetry }: ChatPanelProps) {
  const [draft, setDraft] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const { messages, pending, failure } = session;
  const blocked = pending || failure !== null;

  // Keep the newest message in view.
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'nearest' });
  }, [messages.length, pending, failure]);

  function submit(event: FormEvent) {
    event.preventDefault();
    const question = draft.trim();
    if (!question || blocked) return;
    setDraft('');
    onAsk(question);
  }

  return (
    <div className="xp-chat">
      <p className="xp-note xp-chat__about">{AI_CHARACTER_NOTE}</p>
      {artifact.memoryCutoff && (
        <p className="xp-note">
          Locked memory: this character knows nothing after {formatIsoDate(artifact.memoryCutoff)}.
        </p>
      )}

      <ol className="xp-log" role="log" aria-live="polite" aria-label={`Conversation with the ${artifact.name} character`}>
        <li className="xp-msg xp-msg--assistant">
          <div className="xp-tags">
            <span className="xp-tag xp-tag--ai">AI character</span>
            <span className="xp-tag">Written greeting</span>
          </div>
          <p className="xp-msg__text">{artifact.intro}</p>
        </li>
        {messages.map((message, index) =>
          message.role === 'user' ? (
            <li key={index} className="xp-msg xp-msg--user">
              <span className="xp-visually-hidden">You asked: </span>
              <p className="xp-msg__text">{message.text}</p>
            </li>
          ) : (
            <Answer key={index} catalog={catalog} message={message} />
          ),
        )}
      </ol>

      {pending && (
        <p className="xp-status" role="status">
          Listening for a reply…
        </p>
      )}

      {failure && (
        <div className="xp-alert" role="alert">
          <p className="xp-text">
            <strong>{failure.kind === 'network' ? 'The signal dropped.' : 'The character cannot answer right now.'}</strong>{' '}
            {failure.kind === 'network'
              ? 'We could not reach the station computer. Check your connection and try again.'
              : failure.serverText || 'The station computer is not ready. Please try again in a moment.'}
          </p>
          {failure.mocked && (
            <p className="xp-tags">
              <span className="xp-tag xp-tag--warn">Mocked answer (no real AI yet)</span>
            </p>
          )}
          <p className="xp-note">Your question: "{failure.question}"</p>
          <button type="button" className="xp-btn xp-btn--primary" onClick={onRetry}>
            Retry
          </button>
        </div>
      )}
      <div ref={endRef} />

      {artifact.suggestedQuestions.length > 0 && (
        <div className="xp-suggest" role="group" aria-label="Suggested questions">
          <p className="xp-muted xp-suggest__label">Try asking:</p>
          {artifact.suggestedQuestions.map((question) => (
            <button
              key={question}
              type="button"
              className="xp-btn xp-btn--chip"
              disabled={blocked}
              onClick={() => onAsk(question)}
            >
              {question}
            </button>
          ))}
        </div>
      )}

      <form className="xp-ask" onSubmit={submit}>
        <label className="xp-ask__label" htmlFor={`xp-ask-${artifact.id}`}>
          Ask your own question
        </label>
        <div className="xp-ask__row">
          <input
            id={`xp-ask-${artifact.id}`}
            className="xp-input"
            type="text"
            autoComplete="off"
            maxLength={MAX_MESSAGE_LENGTH}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Type a question…"
          />
          <button type="submit" className="xp-btn xp-btn--primary" disabled={blocked || draft.trim() === ''}>
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
