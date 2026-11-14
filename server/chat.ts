// The single grounded chat service, configured by artifactId. Framework-neutral:
// api/chat.ts (Vercel) and the Vite dev middleware both call handleChat().
//
// Pipeline: validate -> select facts -> build prompt -> LLM (or mock) -> verify -> respond.
// Evidence source ids come from content/facts.json + content/sources.json, never from model output.

import catalogJson from '../content/catalog.json' with { type: 'json' };
import factsJson from '../content/facts.json' with { type: 'json' };
import sourcesJson from '../content/sources.json' with { type: 'json' };
import type { Artifact, ChatResponse, Fact, Source } from '../src/shared/contracts.ts';
import { callLlm, isMockProvider } from './llm.ts';
import type { Env } from './llm.ts';
import type { MockRoute } from './mock-llm.ts';
import { getPersona, refusalText, UNAVAILABLE_ANSWER } from './personas.ts';
import type { Persona, RefusalReason } from './personas.ts';
import { buildSystemPrompt, buildUserPrompt } from './prompt.ts';
import { missingNumbers, numberTokens, stripNames } from './text.ts';

export const MAX_MESSAGE_CHARS = 500;
export const MAX_HISTORY_TURNS = 8;
const MAX_ANSWER_CHARS = 700;

const ARTIFACTS = (catalogJson as unknown as { artifacts: Artifact[] }).artifacts;
const FACTS = factsJson as unknown as Fact[];
const SOURCE_IDS = new Set((sourcesJson as unknown as Source[]).map((s) => s.id));

export interface ChatMeta {
  /** Which facts were allowed: "approved-only" (default) or "approved+pending" (ALLOW_PENDING_FACTS=true). */
  factMode: 'approved-only' | 'approved+pending';
  /** Number of facts sent to the model after selection. */
  factsOffered: number;
  /** Why a prepared refusal was returned, if it was. */
  refusalReason?: RefusalReason;
  /** Set when the model's reply was rejected by the server checks. */
  verifyFailure?: string;
  /** Mock only: how the mock chose its facts. */
  mockRoute?: MockRoute;
  /** Set when the LLM call failed. Never sent to the client. */
  llmError?: string;
}

export interface ChatResult {
  status: number;
  body: ChatResponse | { error: string };
  /** Server-side diagnostics for logs and the eval. api/chat.ts does not send this to the client. */
  meta?: ChatMeta;
}

interface ValidRequest {
  artifact: Artifact;
  persona: Persona;
  message: string;
  history: { role: 'user' | 'assistant'; content: string }[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validate(body: unknown): ValidRequest | { error: string } {
  if (!isRecord(body)) return { error: 'Request body must be a JSON object.' };

  const artifactId = body.artifactId;
  if (typeof artifactId !== 'string') return { error: 'artifactId is required.' };
  const artifact = ARTIFACTS.find((a) => a.id === artifactId);
  if (!artifact) return { error: 'Unknown artifactId.' };
  const persona = getPersona(artifact.id);
  if (artifact.mode !== 'chat' || !persona) return { error: 'This artifact has no chat character.' };

  if (typeof body.message !== 'string') return { error: 'message must be a string.' };
  const message = body.message.trim().slice(0, MAX_MESSAGE_CHARS).trim();
  if (message.length === 0) return { error: 'message is empty.' };

  let history: ValidRequest['history'] = [];
  if (body.history !== undefined && body.history !== null) {
    if (!Array.isArray(body.history)) return { error: 'history must be an array.' };
    for (const turn of body.history) {
      if (!isRecord(turn) || (turn.role !== 'user' && turn.role !== 'assistant') || typeof turn.content !== 'string') {
        return { error: 'history entries must be { role: "user" | "assistant", content: string }.' };
      }
      history.push({ role: turn.role, content: turn.content.trim().slice(0, MAX_MESSAGE_CHARS) });
    }
    history = history.slice(-MAX_HISTORY_TURNS);
  }
  return { artifact, persona, message, history };
}

export function allowPendingFacts(env: Env): boolean {
  return (env.ALLOW_PENDING_FACTS ?? '').trim().toLowerCase() === 'true';
}

/**
 * Facts the character may use: same artifact, review status allowed, not dated after memoryCutoff,
 * and with at least one source id that exists in sources.json.
 * ISO dates (YYYY-MM-DD) compare correctly as strings. A fact dated ON the cutoff day is kept.
 */
export function selectFacts(artifact: Artifact, allowPending: boolean): Fact[] {
  return FACTS.filter((fact) => {
    if (fact.artifactId !== artifact.id) return false;
    if (fact.reviewStatus !== 'approved' && !(allowPending && fact.reviewStatus === 'pending')) return false;
    if (artifact.memoryCutoff && fact.date && fact.date > artifact.memoryCutoff) return false;
    if (!Array.isArray(fact.sourceIds) || !fact.sourceIds.some((id) => SOURCE_IDS.has(id))) return false;
    return true;
  });
}

interface ModelReply {
  answer: string;
  factIds: string[];
  answerable: boolean;
  refusalReason: RefusalReason;
}

function parseModelReply(text: string): ModelReply | null {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
  if (!isRecord(parsed)) return null;
  if (typeof parsed.answer !== 'string' || typeof parsed.answerable !== 'boolean') return null;
  if (!Array.isArray(parsed.factIds) || !parsed.factIds.every((id) => typeof id === 'string')) return null;
  const reason = parsed.refusalReason;
  return {
    answer: parsed.answer.trim(),
    factIds: [...new Set(parsed.factIds as string[])],
    answerable: parsed.answerable,
    refusalReason: reason === 'after-cutoff' || reason === 'off-topic' ? reason : 'not-in-facts',
  };
}

const CONSCIOUSNESS_CLAIM =
  /\bI (really |truly )?(feel|felt|am alive|was alive|am conscious|was scared|was afraid|was lonely|miss|missed)\b/i;

/** Returns the reason the reply must be rejected, or null when it passes. */
function verifyReply(reply: ModelReply, allowed: Map<string, Fact>, persona: Persona): string | null {
  if (reply.answer.length === 0) return 'empty answer';
  if (reply.answer.length > MAX_ANSWER_CHARS) return 'answer too long';
  if (reply.factIds.length === 0) return 'no fact cited';
  for (const id of reply.factIds) {
    if (!allowed.has(id)) return `cited fact not in the offered set: ${id.slice(0, 40)}`;
  }
  const citedText = reply.factIds.map((id) => allowed.get(id)!.text).join(' ');
  const missing = missingNumbers(stripNames(reply.answer, persona.selfNames), numberTokens(citedText));
  if (missing.length > 0) return `number not in cited facts: ${missing.join(', ')}`;
  if (/https?:\/\/|www\./i.test(reply.answer)) return 'answer contains a URL';
  if (CONSCIOUSNESS_CLAIM.test(reply.answer)) return 'answer claims feelings or consciousness';
  return null;
}

function refusal(
  req: ValidRequest,
  reason: RefusalReason,
  mocked: boolean,
  meta: ChatMeta,
): ChatResult {
  // Without a cutoff date the "after-cutoff" line cannot be used; refusalText falls back.
  const effective: RefusalReason = reason === 'after-cutoff' && !req.artifact.memoryCutoff ? 'not-in-facts' : reason;
  return {
    status: 200,
    body: {
      answer: refusalText(req.persona, effective, req.artifact.memoryCutoff),
      evidence: [],
      status: 'insufficient-evidence',
      mocked,
    },
    meta: { ...meta, refusalReason: effective },
  };
}

export interface ChatOptions {
  /** Test seam: replaces the LLM call (used by eval/run.ts to feed bad model replies to the verifier). */
  llm?: typeof callLlm;
}

export async function handleChat(body: unknown, env: Env, options: ChatOptions = {}): Promise<ChatResult> {
  const valid = validate(body);
  if ('error' in valid) return { status: 400, body: { error: valid.error } };

  const mocked = isMockProvider(env);
  const pending = allowPendingFacts(env);
  const facts = selectFacts(valid.artifact, pending);
  const meta: ChatMeta = {
    factMode: pending ? 'approved+pending' : 'approved-only',
    factsOffered: facts.length,
  };

  // Nothing the character is allowed to say: refuse without calling any model.
  if (facts.length === 0) return refusal(valid, 'not-in-facts', mocked, meta);

  const offered = facts.map((f) => ({ id: f.id, text: f.text }));
  const llm = await (options.llm ?? callLlm)(
    {
      system: buildSystemPrompt(valid.persona, valid.artifact.memoryCutoff),
      user: buildUserPrompt(offered, valid.history, valid.message),
      mock: {
        persona: valid.persona,
        memoryCutoff: valid.artifact.memoryCutoff,
        facts: offered,
        message: valid.message,
      },
    },
    env,
  );

  if (!llm.ok) {
    // HTTP 200 on purpose: the client adapter treats non-2xx as a network error and would
    // drop this body. The "unavailable" status tells the UI what happened.
    return {
      status: 200,
      body: { answer: UNAVAILABLE_ANSWER, evidence: [], status: 'unavailable', mocked: llm.mocked },
      meta: { ...meta, llmError: llm.error },
    };
  }
  if (llm.mockRoute) meta.mockRoute = llm.mockRoute;

  const reply = parseModelReply(llm.text);
  if (!reply) return refusal(valid, 'not-in-facts', llm.mocked, { ...meta, verifyFailure: 'reply is not the expected JSON' });
  if (!reply.answerable) return refusal(valid, reply.refusalReason, llm.mocked, meta);

  const allowed = new Map(facts.map((f) => [f.id, f]));
  const failure = verifyReply(reply, allowed, valid.persona);
  if (failure) return refusal(valid, 'not-in-facts', llm.mocked, { ...meta, verifyFailure: failure });

  const evidence = reply.factIds.map((id) => ({
    factId: id,
    sourceIds: allowed.get(id)!.sourceIds.filter((sourceId) => SOURCE_IDS.has(sourceId)),
  }));

  return {
    status: 200,
    body: { answer: reply.answer, evidence, status: 'grounded', mocked: llm.mocked },
    meta,
  };
}
