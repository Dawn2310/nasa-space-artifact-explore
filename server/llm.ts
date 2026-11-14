// LLM adapter. Reads LLM_PROVIDER (mock | anthropic | openai | gemini), LLM_API_KEY and the
// optional LLM_MODEL from the env object it is given. Plain fetch, no SDKs. 20 s timeout.
//
// STATUS: only "mock" has been run. The team has no API key yet, so the anthropic / openai / gemini
// branches are written from the public API shapes and are UNTESTED. The default model names
// below may need to be changed with LLM_MODEL.

import { mockGenerate } from './mock-llm.ts';
import type { MockInput, MockRoute } from './mock-llm.ts';

export type Env = Record<string, string | undefined>;

export type Provider = 'mock' | 'anthropic' | 'openai' | 'gemini';

export interface LlmRequest {
  system: string;
  user: string;
  /** Structured copy of the same inputs, used only by the mock. */
  mock: MockInput;
}

export type LlmResult =
  | { ok: true; text: string; provider: Provider; mocked: boolean; mockRoute?: MockRoute }
  | { ok: false; error: string; provider: Provider | 'unknown'; mocked: boolean };

export const LLM_TIMEOUT_MS = 20_000;
const MAX_OUTPUT_TOKENS = 500;

export const DEFAULT_MODELS: Record<Exclude<Provider, 'mock'>, string> = {
  anthropic: 'claude-haiku-5-5',
  openai: 'gpt-5-mini', // untested default; override with LLM_MODEL
  gemini: 'gemini-2.5-flash', // untested default; override with LLM_MODEL
};

export function resolveProvider(env: Env): Provider | 'unknown' {
  const raw = (env.LLM_PROVIDER ?? '').trim().toLowerCase();
  if (raw === '' || raw === 'mock') return 'mock';
  if (raw === 'anthropic' || raw === 'openai' || raw === 'gemini') return raw;
  return 'unknown';
}

export function isMockProvider(env: Env): boolean {
  return resolveProvider(env) === 'mock';
}

async function postJson(url: string, headers: Record<string, string>, body: unknown): Promise<unknown> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(LLM_TIMEOUT_MS),
  });
  if (!response.ok) {
    // The provider's error body is not passed on: it never reaches the client.
    throw new Error(`provider returned HTTP ${response.status}`);
  }
  return (await response.json()) as unknown;
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};
}

async function callAnthropic(req: LlmRequest, key: string, model: string): Promise<string> {
  const data = asRecord(
    await postJson(
      'https://api.anthropic.com/v1/messages',
      { 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      {
        model,
        max_tokens: MAX_OUTPUT_TOKENS,
        system: req.system,
        messages: [{ role: 'user', content: req.user }],
      },
    ),
  );
  const blocks = Array.isArray(data.content) ? data.content : [];
  const text = blocks
    .map((b) => asRecord(b))
    .filter((b) => b.type === 'text' && typeof b.text === 'string')
    .map((b) => b.text as string)
    .join('');
  if (!text) throw new Error('provider returned no text');
  return text;
}

async function callOpenAi(req: LlmRequest, key: string, model: string): Promise<string> {
  const data = asRecord(
    await postJson(
      'https://api.openai.com/v1/chat/completions',
      { authorization: `Bearer ${key}` },
      {
        model,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: req.system },
          { role: 'user', content: req.user },
        ],
      },
    ),
  );
  const choices = Array.isArray(data.choices) ? data.choices : [];
  const content = asRecord(asRecord(choices[0]).message).content;
  if (typeof content !== 'string' || !content) throw new Error('provider returned no text');
  return content;
}

async function callGemini(req: LlmRequest, key: string, model: string): Promise<string> {
  const data = asRecord(
    await postJson(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      { 'x-goog-api-key': key },
      {
        systemInstruction: { parts: [{ text: req.system }] },
        contents: [{ role: 'user', parts: [{ text: req.user }] }],
        generationConfig: { responseMimeType: 'application/json', maxOutputTokens: 1024 },
      },
    ),
  );
  const candidates = Array.isArray(data.candidates) ? data.candidates : [];
  const parts = asRecord(asRecord(candidates[0]).content).parts;
  const text = (Array.isArray(parts) ? parts : [])
    .map((p) => asRecord(p).text)
    .filter((t): t is string => typeof t === 'string')
    .join('');
  if (!text) throw new Error('provider returned no text');
  return text;
}

/** Never throws. Any failure (no key, unknown provider, network, timeout, bad reply) -> ok: false. */
export async function callLlm(req: LlmRequest, env: Env): Promise<LlmResult> {
  const provider = resolveProvider(env);

  if (provider === 'mock') {
    const out = mockGenerate(req.mock);
    return { ok: true, text: out.text, provider, mocked: true, mockRoute: out.route };
  }
  if (provider === 'unknown') {
    return { ok: false, error: 'unknown LLM_PROVIDER', provider, mocked: false };
  }

  const key = (env.LLM_API_KEY ?? '').trim();
  if (!key) return { ok: false, error: 'LLM_API_KEY is not set', provider, mocked: false };
  const model = (env.LLM_MODEL ?? '').trim() || DEFAULT_MODELS[provider];

  try {
    const text =
      provider === 'anthropic'
        ? await callAnthropic(req, key, model)
        : provider === 'openai'
          ? await callOpenAi(req, key, model)
          : await callGemini(req, key, model);
    return { ok: true, text, provider, mocked: false };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error';
    return { ok: false, error: message, provider, mocked: false };
  }
}
