import { defineConfig, loadEnv } from 'vite';
import type { Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Dev only: phục vụ POST /api/chat ngay trong `npm run dev` bằng chính pipeline của
 * server/chat.ts (handleChat), để không cần `vercel dev`. Trên Vercel, api/chat.ts lo việc này.
 * Env (LLM_PROVIDER, LLM_API_KEY, ...) đọc từ .env phía server, không lọt vào bundle client.
 */
function devChatApi(mode: string): Plugin {
  return {
    name: 'dev-chat-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/chat', (req, res) => {
        const send = (status: number, body: unknown) => {
          res.statusCode = status;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify(body));
        };
        if (req.method !== 'POST') return send(405, { error: 'Method not allowed' });

        let raw = '';
        req.on('data', (chunk: Buffer) => {
          raw += chunk.toString('utf8');
          if (raw.length > 100_000) req.destroy();
        });
        req.on('end', async () => {
          try {
            let body: unknown;
            try {
              body = JSON.parse(raw);
            } catch {
              return send(400, { error: 'Invalid JSON' });
            }
            const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env };
            const mod = (await server.ssrLoadModule('/server/chat.ts')) as {
              handleChat: (body: unknown, env: Record<string, string | undefined>) => Promise<{ status: number; body: unknown }>;
            };
            const result = await mod.handleChat(body, env);
            send(result.status, result.body);
          } catch (error) {
            console.error('[dev-chat-api]', error);
            send(500, { error: 'Chat service failed' });
          }
        });
      });
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), devChatApi(mode)],
  server: {
    port: 5173,
  },
  build: {
    chunkSizeWarningLimit: 1500,
  },
}));
