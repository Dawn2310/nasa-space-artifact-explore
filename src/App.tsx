// Lead/Integrator: App là NƠI DUY NHẤT giữ ViewState. World (3D) và Explorer (UI)
// chỉ nhận state + callbacks; không bên nào có hệ điều hướng riêng.

import { useCallback, useMemo, useRef, useState } from 'react';
import type { ArtifactId, SceneCallbacks, ViewState } from './shared/contracts';
import { findArtifact, returnTargetFor } from './shared/app-types';
import type { Catalog, ChatAdapter } from './shared/app-types';
import { realCatalog } from './shared/catalog';
import { apiChatAdapter } from './shared/chat-adapter';
import World from './features/world';
import Explorer from './features/explorer';
import GlobalChat from './features/explorer/GlobalChat';
import { CharacterProvider } from './shared/character-activity';
import Voyage, { hushEverywhere, VoyageIntro, VoyageLauncher } from './features/voyage/Voyage';
import type { VoyagePlan, VoyageScene } from './features/voyage/script';
import type { SolarFlight, VoyageTour } from './shared/app-types';
import { isMovingMission, missionSceneTarget } from './features/world/scene-motion';

type Arrival = { kind: 'view'; view: ViewState } | { kind: 'voyage'; plan: VoyagePlan; stop: number } | { kind: 'home' };
function voyageTarget(scene: VoyageScene): string {
  const target = scene.kind === 'map' ? scene.body : scene.focus ?? 'earth';
  const artifactId = target as ArtifactId;
  return isMovingMission(artifactId) ? missionSceneTarget(artifactId) : target;
}

// Catalog thật từ content/*.json. Chat gọi POST /api/chat: Vercel function khi deploy,
// middleware trong vite.config.ts khi `npm run dev`. LLM_PROVIDER=mock thì server tự gắn mocked=true.
const catalog: Catalog = realCatalog;
const chat: ChatAdapter = apiChatAdapter;

/** Legacy Voyage: mỗi điểm dừng quy ra một ViewState bình thường (không thêm level mới). */
function sceneView(scene: VoyageScene): ViewState {
  return scene.kind === 'solar' ? { level: 'solar' } : { level: 'surface', body: scene.body };
}

export default function App() {
  const [view, setView] = useState<ViewState>({ level: 'solar' });
  // Chuyến bay Legacy Voyage đang chạy (một thế giới hoặc một thiết bị) + điểm dừng; null = tự khám phá.
  const [voyage, setVoyage] = useState<{ plan: VoyagePlan; stop: number } | null>(null);
  // Mở web: Echo xuất hiện và dẫn vào câu chuyện. 'plan' = người xem muốn tự chọn chuyến bay.
  const [intro, setIntro] = useState<'open' | 'plan' | 'closed'>('open');
  const sequence = useRef(0);
  const [transfer, setTransfer] = useState<{ flight: SolarFlight; arrival: Arrival } | null>(null);
  const stop = voyage === null ? null : voyage.plan.stops[voyage.stop];
  const shownView = transfer ? { level: 'solar' as const } : stop ? sceneView(stop.scene) : view;
  const tour = useMemo<VoyageTour | undefined>(() => {
    if (transfer) return {};
    if (!stop) return undefined;
    return stop.scene.kind === 'solar' ? { focus: stop.scene.focus ? voyageTarget(stop.scene) : undefined } : { mission: stop.scene.mission };
  }, [stop, transfer]);
  const beginTransfer = useCallback((targetId: string, arrival: Arrival) => {
    hushEverywhere();
    const label = catalog.artifacts.find((item) => item.id === targetId)?.name ?? targetId.replace(/^./, (letter) => letter.toUpperCase());
    setTransfer({ flight: { id: `flight-${++sequence.current}`, targetId, label }, arrival });
  }, []);
  const arrive = useCallback((id: string) => {
    if (!transfer || transfer.flight.id !== id) return;
    const next = transfer.arrival;
    if (next.kind === 'voyage') setVoyage({ plan: next.plan, stop: next.stop });
    else if (next.kind === 'view') { setVoyage(null); setView(next.view); }
    else { setVoyage(null); setView({ level: 'solar' }); }
    setTransfer(null);
  }, [transfer]);
  const goStop = useCallback((index: number) => {
    if (!voyage || transfer) return;
    const next = Math.max(0, Math.min(voyage.plan.stops.length - 1, index));
    const target = voyageTarget(voyage.plan.stops[next].scene);
    if (target === voyageTarget(voyage.plan.stops[voyage.stop].scene)) setVoyage({ ...voyage, stop: next });
    else beginTransfer(target, { kind: 'voyage', plan: voyage.plan, stop: next });
  }, [voyage, transfer, beginTransfer]);
  const startPlan = useCallback((plan: VoyagePlan) => {
    beginTransfer(voyageTarget(plan.stops[0].scene), { kind: 'voyage', plan, stop: 0 });
  }, [beginTransfer]);
  const exitVoyage = useCallback(() => {
    beginTransfer('earth', { kind: 'home' });
  }, [beginTransfer]);

  const onSelectBody = useCallback((body: 'moon' | 'mars') => {
    if (view.level === 'solar') beginTransfer(body, { kind: 'view', view: { level: 'surface', body } });
    else setView({ level: 'surface', body });
  }, [view.level, beginTransfer]);

  const onSelectArtifact = useCallback((artifactId: ArtifactId) => {
    const artifact = findArtifact(catalog, artifactId);
    if (!artifact) return; // ID không có trong catalog: bỏ qua, không đoán
    const next: ViewState = { level: 'artifact', artifactId, returnTo: returnTargetFor(artifact) };
    const target = artifact.body === 'deep-space' ? (isMovingMission(artifact.id) ? missionSceneTarget(artifact.id) : artifact.id) : artifact.body;
    if (view.level === 'solar') beginTransfer(target, { kind: 'view', view: next });
    else setView(next);
  }, [view.level, beginTransfer]);

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
    <CharacterProvider><div className="app">
      <div className="app__world">
        <World view={shownView} catalog={catalog} callbacks={callbacks} tour={tour} flight={transfer?.flight} onFlightArrival={arrive} onFlightCancel={() => setTransfer(null)} />
      </div>
      <div className="app__explorer">
        <Explorer view={shownView} catalog={catalog} chat={chat} callbacks={callbacks} tour={tour} />
      </div>
      {voyage !== null ? (
        <Voyage key={voyage.plan.id} catalog={catalog} plan={voyage.plan} stopIndex={voyage.stop} onGo={goStop} onExit={exitVoyage} onNextChapter={startPlan} travelling={!!transfer} />
      ) : (
        !transfer && view.level === 'solar' && (intro === 'open' ? (
          <VoyageIntro onStart={(plan) => { setIntro('closed'); startPlan(plan); }} onChoose={() => setIntro('plan')} onSkip={() => setIntro('closed')} />
        ) : (
          <VoyageLauncher key={intro} startOpen={intro === 'plan'} onStart={(plan) => { setIntro('closed'); startPlan(plan); }} />
        ))
      )}
      <GlobalChat catalog={catalog} chat={chat} activeArtifactId={stop?.artifactId ?? (view.level === 'artifact' ? view.artifactId : undefined)} />
    </div></CharacterProvider>
  );
}
