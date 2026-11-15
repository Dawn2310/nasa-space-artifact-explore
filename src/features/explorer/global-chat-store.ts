import type { ArtifactId } from '../../shared/contracts.ts';
import type { ChatAdapter } from '../../shared/app-types.ts';
import { EMPTY_SESSION, MAX_MESSAGE_LENGTH, historyFor, historyForRetry, patchSession } from './session.ts';
import type { ChatSession, Sessions } from './session.ts';

/** Root-level conversations survive closing the panel and changing worlds. */
export function createGlobalChatStore(chat: ChatAdapter) {
  let sessions: Sessions = {};
  const listeners = new Set<() => void>();
  const update = (id: ArtifactId, patch: (session: ChatSession) => ChatSession) => {
    sessions = patchSession(sessions, id, patch);
    listeners.forEach(listener => listener());
  };
  async function ask(id: ArtifactId, raw: string, retry = false) {
    const previous = sessions[id] ?? EMPTY_SESSION;
    const question = raw.trim().slice(0, MAX_MESSAGE_LENGTH);
    if (!question || previous.pending) return;
    const history = retry ? historyForRetry(previous.messages) : historyFor(previous.messages);
    update(id, session => ({ ...session, pending: true, failure: null,
      messages: retry ? session.messages : [...session.messages, { role: 'user', text: question }] }));
    try {
      const response = await chat({ artifactId: id, message: question, history });
      update(id, session => response.status === 'unavailable'
        ? { ...session, pending: false, failure: { kind: 'unavailable', question, serverText: response.answer, mocked: response.mocked } }
        : { ...session, pending: false, failure: null, messages: [...session.messages, {
          role: 'assistant', text: response.answer, evidence: response.evidence, status: response.status, mocked: response.mocked,
        }] });
    } catch {
      update(id, session => ({ ...session, pending: false, failure: { kind: 'network', question, serverText: '', mocked: false } }));
    }
  }
  return {
    getSnapshot: () => sessions,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    ask,
    retry(id: ArtifactId) { const failure = sessions[id]?.failure; if (failure) return ask(id, failure.question, true); },
  };
}
