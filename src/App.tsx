// Lead/Integrator: App là NƠI DUY NHẤT giữ ViewState. World (3D) và Explorer (UI)
// chỉ nhận state + callbacks; không bên nào có hệ điều hướng riêng.

import { useCallback, useMemo, useState } from 'react';
import type { ArtifactId, SceneCallbacks, ViewState } from './shared/contracts';
import { findArtifact, returnTargetFor } from './shared/app-types';
import type { Catalog, ChatAdapter } from './shared/app-types';
import { realCatalog } from './shared/catalog';
import { apiChatAdapter } from './shared/chat-adapter';
import World from './features/world';
import Explorer from './features/explorer';

// Catalog thật từ content/*.json. Chat gọi POST /api/chat: Vercel function khi deploy,
// middleware trong vite.config.ts khi `npm run dev`. LLM_PROVIDER=mock thì server tự gắn mocked=true.
const catalog: Catalog = realCatalog;
const chat: ChatAdapter = apiChatAdapter;

export default function App() {
  const [view, setView] = useState<ViewState>({ level: 'solar' });

  const onSelectBody = useCallback((body: 'moon' | 'mars') => {
    setView({ level: 'surface', body });
  }, []);

  const onSelectArtifact = useCallback((artifactId: ArtifactId) => {
    const artifact = findArtifact(catalog, artifactId);
    if (!artifact) return; // ID không có trong catalog: bỏ qua, không đoán
    setView({ level: 'artifact', artifactId, returnTo: returnTargetFor(artifact) });
  }, []);

  const onBack = useCallback(() => {
    setView((current) => {
      if (current.level === 'artifact') return current.returnTo;
      if (current.level === 'surface') return { level: 'solar' };
      return current;
    });
  }, []);

  const callbacks = useMemo<SceneCallbacks>(
    () => ({ onSelectBody, onSelectArtifact, onBack }),
    [onSelectBody, onSelectArtifact, onBack],
  );

  return (
    <div className="app">
      <div className="app__world">
        <World view={view} catalog={catalog} callbacks={callbacks} />
      </div>
      <div className="app__explorer">
        <Explorer view={view} catalog={catalog} chat={chat} callbacks={callbacks} />
      </div>
    </div>
  );
}
