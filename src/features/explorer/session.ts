// Chat session state. Kept in the Explorer shell (keyed by artifact id) so the
// conversation and the memory journal survive going Back and opening it again.

import type { ArtifactId, ChatRequest, ChatResponse } from '../../shared/contracts';

export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  /** Only for assistant messages. */
  status?: ChatResponse['status'];
  evidence?: ChatResponse['evidence'];
  mocked?: boolean;
  kind?: 'story';
  storyId?: string;
}

export interface ChatFailure {
  /** 'network' = the call threw/rejected. 'unavailable' = the server answered with status "unavailable". */
  kind: 'network' | 'unavailable';
  question: string;
  /** Text sent by the server for "unavailable", if any. */
  serverText: string;
  mocked: boolean;
}

export interface ChatSession {
  messages: ChatMessage[];
  pending: boolean;
  failure: ChatFailure | null;
  /** Fact ids cited in grounded answers, in the order they were unlocked. */
  unlockedFactIds: string[];
  farewellOpened: boolean;
  storyCursor: number;
}

export type Sessions = Partial<Record<ArtifactId, ChatSession>>;

export const EMPTY_SESSION: ChatSession = {
  messages: [],
  pending: false,
  failure: null,
  unlockedFactIds: [],
  farewellOpened: false,
  storyCursor: 0,
};

export const MAX_MESSAGE_LENGTH = 500; // the server cuts at 500 characters too
const MAX_HISTORY = 8; // the server keeps the last 8 turns

/** History to send with a NEW question: every finished turn so far. */
export function historyFor(messages: ChatMessage[]): ChatRequest['history'] {
  return messages.slice(-MAX_HISTORY).map((m) => ({ role: m.role, content: m.text }));
}

/** History to send when retrying: drop the last user message, it is sent again as `message`. */
export function historyForRetry(messages: ChatMessage[]): ChatRequest['history'] {
  const last = messages[messages.length - 1];
  const earlier = last && last.role === 'user' ? messages.slice(0, -1) : messages;
  return historyFor(earlier);
}

export function patchSession(
  sessions: Sessions,
  artifactId: ArtifactId,
  patch: (session: ChatSession) => ChatSession,
): Sessions {
  const previous = sessions[artifactId] ?? EMPTY_SESSION;
  const next = patch(previous);
  return next === previous ? sessions : { ...sessions, [artifactId]: next };
}
