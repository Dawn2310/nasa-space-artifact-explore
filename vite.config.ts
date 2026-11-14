import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // `vercel dev` serves /api itself; with plain `vite` the client falls back to the mock adapter.
    port: 5173,
  },
  build: {
    chunkSizeWarningLimit: 1500,
  },
});
