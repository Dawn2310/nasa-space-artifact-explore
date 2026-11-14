// Vercel Node serverless function: POST /api/chat. Thin wrapper around server/chat.ts.
// No Vercel feature beyond the free tier. The minimal request/response shapes are declared
// here so the project needs no @vercel/node dependency.
// NOT yet tested on Vercel (no deploy has been made).

import { handleChat } from '../server/chat.ts';

interface ApiRequest {
  method?: string;
  /** Parsed by Vercel's Node helpers for JSON requests; the getter throws on invalid JSON. */
  body?: unknown;
}

interface ApiResponse {
  status(code: number): ApiResponse;
  setHeader(name: string, value: string): unknown;
  json(body: unknown): unknown;
}

export default async function handler(req: ApiRequest, res: ApiResponse): Promise<void> {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  let body: unknown;
  try {
    body = req.body;
    if (typeof body === 'string') body = JSON.parse(body);
    else if (body instanceof Uint8Array) body = JSON.parse(new TextDecoder().decode(body));
  } catch {
    res.status(400).json({ error: 'Invalid JSON' });
    return;
  }

  try {
    const result = await handleChat(body, process.env);
    // result.meta is server-side diagnostics and is deliberately not sent.
    res.status(result.status).json(result.body);
  } catch (error) {
    console.error('[api/chat]', error instanceof Error ? error.message : error);
    res.status(500).json({ error: 'Chat service failed' });
  }
}
