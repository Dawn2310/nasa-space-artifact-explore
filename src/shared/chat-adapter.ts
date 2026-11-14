// Chat adapter thật: gọi POST /api/chat (Vercel function). Cùng kiểu ChatAdapter với mock.
// Không chứa khóa API nào: khóa chỉ nằm trong env của server.

import type { ChatRequest, ChatResponse } from './contracts';
import type { ChatAdapter } from './app-types';

const CLIENT_TIMEOUT_MS = 25_000; // server tự timeout LLM ở 20s

function isChatResponse(value: unknown): value is ChatResponse {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.answer === 'string' &&
    Array.isArray(v.evidence) &&
    (v.status === 'grounded' || v.status === 'insufficient-evidence' || v.status === 'unavailable') &&
    typeof v.mocked === 'boolean'
  );
}

/**
 * Ném lỗi khi mạng hỏng, hết giờ, HTTP không 2xx hoặc thân trả về sai hợp đồng,
 * để UI hiện trạng thái lỗi + nút thử lại.
 */
export const apiChatAdapter: ChatAdapter = async (request: ChatRequest): Promise<ChatResponse> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CLIENT_TIMEOUT_MS);
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Chat service returned HTTP ${response.status}`);
    const body: unknown = await response.json();
    if (!isChatResponse(body)) throw new Error('Chat service returned an unexpected response');
    return body;
  } finally {
    clearTimeout(timer);
  }
};
