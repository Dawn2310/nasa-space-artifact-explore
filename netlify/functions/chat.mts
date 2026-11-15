// Netlify's web Request/Response adapter; shares the same grounded chat pipeline.
import { handleChat } from '../../server/chat.ts';

export const config = { path: '/api/chat' };

export default async function handler(request: Request): Promise<Response> {
  const headers = { 'Cache-Control': 'no-store' };
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405, headers: { ...headers, Allow: 'POST' } });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400, headers });
  }

  try {
    const result = await handleChat(body, { ...process.env, LLM_PROVIDER: process.env.LLM_PROVIDER ?? 'mock' });
    // Server diagnostics stay on the server; return only the public response.
    return Response.json(result.body, { status: result.status, headers });
  } catch (error) {
    console.error('[netlify/chat]', error instanceof Error ? error.message : 'Chat service failed');
    return Response.json({ error: 'Chat service failed' }, { status: 500, headers });
  }
}
