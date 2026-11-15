// World (agent world3d): ba tầng cảnh React Three Fiber: solar → surface → artifact.
// Nhận WorldProps từ App; KHÔNG giữ state điều hướng, chỉ gọi callbacks.
// State cục bộ ở đây chỉ là trạng thái hiển thị (đang trỏ vào đâu, model tải xong chưa).

import { Component, useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import type { Artifact, Asset } from '../../shared/contracts';
import { assetUrl, findArtifact, findAsset } from '../../shared/app-types';
import type { Catalog, SolarFlight, WorldProps } from '../../shared/app-types';
import type { Vector3 } from 'three';
import UfoNavigator from './UfoNavigator';
import FlightCockpit from './FlightCockpit';
import { ArtifactScene } from './ArtifactScene';
import { CameraRig } from './CameraRig';
import { LabelOverlay, LabelProjector } from './labels';
import { CAMERA_FOV_DEG, WIDE_BREAKPOINT_PX } from './layout';
import type { ActiveTarget } from './layout';
import type { SetActive } from './parts';
import { SolarScene, hasIllustrativeSpot } from './SolarScene';
import { describeLocation, markerLocation } from './SurfaceScene';
import { SOLAR_BODIES } from './solar-system';
import type { InspectionTargets } from './solar-system';
import { SpaceBackdrop } from './SpaceBackdrop';
import { MISSION_MOTION, isMovingMission } from './scene-motion';
import './world.css';
import { useCharacterActivity } from '../../shared/character-activity';
import { SHARED_MODEL_NOTES } from '../explorer/storyText';
import { renderPixelRatio } from '../../shared/render-budget';

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
    const supported = Boolean(context);
    context?.getExtension('WEBGL_lose_context')?.loseContext();
    return supported;
  } catch {
    return false;
  }
}

/** Canvas hỏng lúc chạy (mất WebGL, lỗi shader...) => chuyển sang giao diện 2D. */
class CanvasBoundary extends Component<{ onFail: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.warn('[world] 3D canvas failed; switching to the 2D list.', error);
    this.props.onFail();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function countLabel(catalog: Catalog, body: 'moon' | 'mars'): string {
  const total = catalog.artifacts.filter((artifact) => artifact.body === body).length;
  return `${total} ${total === 1 ? 'artifact' : 'artifacts'}`;
}

function isPicture(asset: Asset | undefined): asset is Asset {
  return asset !== undefined && (asset.format === 'jpg' || asset.format === 'png');
}

// ---------------------------------------------------------------------------
// Danh sách nút: bản thay thế bàn phím/chạm cho marker, và là giao diện 2D khi không có WebGL.
// ---------------------------------------------------------------------------

interface NavListProps extends Pick<WorldProps, 'view' | 'catalog' | 'callbacks'> {
  setActive: SetActive;
  alwaysOpen: boolean;
  onInspect?: (id: string) => void;
}

function NavList({ view, catalog, callbacks, setActive, alwaysOpen, onInspect }: NavListProps) {
  const [open, setOpen] = useState(() => alwaysOpen || window.innerWidth >= WIDE_BREAKPOINT_PX);
  if (view.level === 'artifact') return null;

  const highlight = (id: ActiveTarget['id']) => ({
    onFocus: () => setActive({ id, source: 'list' }),
    onMouseEnter: () => setActive({ id, source: 'list' }),
    onBlur: () => setActive((current) => (current?.id === id ? null : current)),
    onMouseLeave: () => setActive((current) => (current?.id === id && current.source === 'list' ? null : current)),
  });

  const artifactButton = (artifact: Artifact, detail: string) => (
    <li key={artifact.id}>
      <button type="button" className="world-nav__button" {...highlight(artifact.id)} onClick={() => callbacks.onSelectArtifact(artifact.id)}>
        <span className="world-nav__name">{artifact.name}</span>
        <span className="world-nav__detail">{artifact.displayYears}</span>
        <span className="world-nav__detail">{detail}</span>
      </button>
    </li>
  );

  let title: string;
  let items: ReactNode;
  if (view.level === 'solar') {
    const deepSpace = catalog.artifacts.filter((artifact) => artifact.body === 'deep-space');
    title = `Places and spacecraft (${deepSpace.length + 2})`;
    items = (
      <>
        {(['moon', 'mars'] as const).map((body) => (
          <li key={body}>
            <button type="button" className="world-nav__button" {...highlight(body)} onClick={() => callbacks.onSelectBody(body)}>
              <span className="world-nav__name">{body === 'moon' ? 'Moon' : 'Mars'}</span>
              <span className="world-nav__detail">{countLabel(catalog, body)} to visit</span>
            </button>
          </li>
        ))}
        {deepSpace.map((artifact) =>
          artifactButton(artifact, hasIllustrativeSpot(artifact.id) ? 'Deep space · illustrative position' : 'Deep space'),
        )}
      </>
    );
  } else {
    const onBody = catalog.artifacts.filter((artifact) => artifact.body === view.body);
    title = `Artifacts on ${view.body === 'moon' ? 'the Moon' : 'Mars'} (${onBody.length})`;
    items = onBody.map((artifact) => {
      const location = markerLocation(artifact);
      return artifactButton(artifact, location ? describeLocation(location) : 'Position not in the catalogue yet');
    });
  }

  return (
    <nav className="world-nav" aria-label={title}>
      <details open={alwaysOpen || open} onToggle={(event) => setOpen(event.currentTarget.open)}>
        <summary className="world-nav__summary">{title}</summary>
        <ul className="world-nav__list">{items}</ul>
        {view.level === 'solar' && onInspect && (
          <details className="world-nav__inspection">
            <summary className="world-nav__summary">Planets and moons</summary>
            <ul className="world-nav__list">
              {SOLAR_BODIES.map((body) => (
                <li key={body.id}>
                  <button type="button" className="world-nav__button" onClick={() => onInspect(body.id)}>
                    <span className="world-nav__name">{body.name}</span>
                    <span className="world-nav__detail">View in 3D</span>
                  </button>
                </li>
              ))}
              {catalog.artifacts.filter((item) => item.body === 'deep-space').map((item) => (
                <li key={item.id}>
                  <button type="button" className="world-nav__button" onClick={() => onInspect(item.id)}>
                    <span className="world-nav__name">{item.name}</span>
                    <span className="world-nav__detail">Hear my story</span>
                  </button>
                </li>
              ))}
            </ul>
          </details>
        )}
      </details>
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Lớp HTML của tầng artifact: trạng thái tải, chú thích `represents`, ảnh thay thế.
// ---------------------------------------------------------------------------

type ModelStatus = 'loading' | 'ready' | 'no-model' | 'failed' | 'no-webgl';

const FALLBACK_REASON: Record<Exclude<ModelStatus, 'loading' | 'ready'>, string> = {
  'no-model': 'No official 3D model',
  failed: 'The 3D model could not load',
  'no-webgl': '3D view is not available on this device',
};

interface ArtifactOverlayProps {
  artifact: Artifact | undefined;
  status: ModelStatus;
  modelAsset: Asset | undefined;
  imageAsset: Asset | undefined;
}

function ArtifactOverlay({ artifact, status, modelAsset, imageAsset }: ArtifactOverlayProps) {
  const [brokenImage, setBrokenImage] = useState<string | null>(null);
  const image = imageAsset && brokenImage !== imageAsset.id ? imageAsset : undefined;

  if (!artifact) {
    return (
      <div className="world-free">
        <div className="world-panel" role="status">
          This artifact is not in the catalogue.
        </div>
      </div>
    );
  }

  const photo = (className: string) =>
    image && (
      <figure className={className}>
        <img src={assetUrl(image)} alt={image.represents} onError={() => setBrokenImage(image.id)} />
        <figcaption>
          {image.represents} <span className="world-credit">Credit: {image.creatorCredit}</span>
        </figcaption>
      </figure>
    );

  if (status === 'loading' || status === 'ready') {
    return (
      <div className="world-free">
        {status === 'loading' && (
          <div className="world-panel world-panel--small" role="status">
            Loading 3D model…
          </div>
        )}
        {modelAsset && (
          <div className="world-caption world-character-credit">
            {SHARED_MODEL_NOTES[artifact.id] && <p>{SHARED_MODEL_NOTES[artifact.id]}</p>}
            <details>
              <summary>Model & credits</summary>
              <p>{modelAsset.represents} · {artifact.displayYears}</p>
              <p>{modelAsset.creatorCredit}</p>
              <a href={modelAsset.sourceUrl} target="_blank" rel="noreferrer">Model source</a>
            </details>
          </div>
        )}
      </div>
    );
  }

  const reason = FALLBACK_REASON[status];
  return (
    <div className="world-free">
      {image ? (
        <>
          {photo('world-photo world-photo--main')}
          <p className="world-caption" role="status">
            {reason}: showing a photo instead.
          </p>
        </>
      ) : (
        <div className="world-panel" role="status">
          {reason}: photo coming
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------

function viewKey(view: WorldProps['view']): string {
  if (view.level === 'surface') return `surface:${view.body}`;
  if (view.level === 'artifact') return `artifact:${view.artifactId}`;
  return 'solar';
}

function artifactAssets(catalog: Catalog, artifact: Artifact | undefined) {
  const declaredModel = artifact ? findAsset(catalog, artifact.modelAssetId) : undefined;
  const modelAsset = declaredModel?.format === 'glb' ? declaredModel : undefined;
  const artifactImage = artifact ? findAsset(catalog, artifact.imageAssetId) : undefined;
  const modelFallback = findAsset(catalog, declaredModel?.fallbackAssetId ?? null);
  const imageAsset = isPicture(artifactImage) ? artifactImage : isPicture(modelFallback) ? modelFallback : undefined;
  return { modelAsset, imageAsset };
}

export default function World({ view, catalog, callbacks, tour, flight, onFlightArrival, onFlightCancel }: WorldProps) {
  const { activity } = useCharacterActivity();
  const [webgl, setWebgl] = useState(detectWebGL);
  const [visible, setVisible] = useState(() => !document.hidden);
  const [pixelRatio] = useState(() => renderPixelRatio({ width: window.innerWidth, devicePixelRatio: window.devicePixelRatio,
    deviceMemory: (navigator as Navigator & { deviceMemory?: number }).deviceMemory }));
  useEffect(() => {
    const visibility = () => setVisible(!document.hidden);
    document.addEventListener('visibilitychange', visibility);
    return () => document.removeEventListener('visibilitychange', visibility);
  }, []);
  const [orbitsPaused] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [active, setActive] = useState<ActiveTarget | null>(null);
  const [loaded, setLoaded] = useState<{ url: string; status: 'ready' | 'failed' } | null>(null);
  const [ownFocusId, setFocusId] = useState<string | null>(null);
  const [localFlight, setLocalFlight] = useState<SolarFlight | undefined>(undefined);
  const flightSequence = useRef(0);
  const ufoPosition = useRef<Vector3 | null>(null);
  const flightTelemetry = useRef({ progress: 0, distance: 0 });
  const activeFlight = flight ?? localFlight;
  useEffect(() => { flightTelemetry.current = { progress: 0, distance: 0 }; }, [activeFlight?.id]);
  // Legacy Voyage điều khiển camera solar (tour.focus); ngoài chuyến bay thì người xem tự chọn.
  const focusId = activeFlight ? null : tour ? (tour.focus ?? null) : ownFocusId;
  const targets = useRef<InspectionTargets>(new Map()).current;
  const inspect = (id: string) => {
    if (activeFlight || tour) return;
    const craft = catalog.artifacts.find((item) => item.id === id && item.body === 'deep-space');
    if (craft) callbacks.onSelectArtifact(craft.id);
    else setLocalFlight({ id: `inspect-${++flightSequence.current}`, targetId: id, label: SOLAR_BODIES.find((body) => body.id === id)?.name ?? id });
  };
  const flightArrived = (id: string) => {
    if (flight?.id === id) onFlightArrival?.(id);
    else if (localFlight?.id === id) { setFocusId(localFlight.targetId); setLocalFlight(undefined); }
  };
  useEffect(() => {
    if (flight) { setLocalFlight(undefined); setFocusId(null); }
  }, [flight?.id]);
  useEffect(() => {
    if (!flight || webgl) return;
    const timer = window.setTimeout(() => onFlightArrival?.(flight.id), 350);
    return () => window.clearTimeout(timer);
  }, [flight, webgl, onFlightArrival]);
  const focusBody = SOLAR_BODIES.find((body) => body.id === focusId);
  const focusCraft = catalog.artifacts.find((item) => item.id === focusId);
  const children = SOLAR_BODIES.filter((body) => body.parent === focusId);

  const key = viewKey(view);
  const artifact = view.level === 'artifact' ? findArtifact(catalog, view.artifactId) : undefined;
  const { modelAsset, imageAsset } = artifactAssets(catalog, artifact);
  const modelUrl = modelAsset ? assetUrl(modelAsset) : null;

  // Đổi tầng: bỏ trạng thái trỏ/focus và trạng thái tải của cảnh cũ.
  useEffect(() => {
    setActive(null);
    setFocusId(null);
    return () => setLoaded(null);
  }, [key]);

  const onReady = useCallback(() => {
    if (modelUrl) setLoaded({ url: modelUrl, status: 'ready' });
  }, [modelUrl]);
  const onError = useCallback(() => {
    if (modelUrl) setLoaded({ url: modelUrl, status: 'failed' });
  }, [modelUrl]);
  const onCanvasFail = useCallback(() => setWebgl(false), []);

  let status: ModelStatus;
  if (!artifact?.modelAssetId) status = 'no-model';
  else if (!modelUrl) status = 'failed'; // catalog trỏ tới asset không tồn tại hoặc không phải GLB
  else if (!webgl) status = 'no-webgl';
  else status = loaded?.url === modelUrl ? loaded.status : 'loading';

  // surface:mars và surface:moon do bản đồ nhiệm vụ (iframe trong Explorer) đảm nhận: không vẽ canvas/danh sách ở đây.
  if (view.level === 'surface' || (view.level === 'artifact' && artifact?.body === 'mars')) return <div className="world world--surface" />;

  // Theo yêu cầu người dùng: bỏ dòng ghi chú ở tầng solar; tầng artifact vẫn giữ "Not to scale".
  const scaleNote = view.level === 'solar' ? null : 'Not to scale';

  return (
    <div className={`world world--${view.level}${webgl ? '' : ' world--flat'}`}>
      {webgl && (
        <CanvasBoundary onFail={onCanvasFail}>
          <div className="world__canvas" aria-hidden="true">
            <Canvas camera={{ fov: CAMERA_FOV_DEG, near: 0.01, far: 1600, position: [0, 32, 41] }} dpr={pixelRatio} frameloop={visible ? 'always' : 'never'}>
              <SpaceBackdrop animate={!orbitsPaused} />
              <CameraRig view={view} focusId={focusId} targets={targets} flightId={activeFlight?.id} />
              <LabelProjector />
              {view.level === 'solar' && (
                <SolarScene catalog={catalog} active={active} setActive={setActive} paused={orbitsPaused}
                  targets={targets} focusId={activeFlight?.targetId ?? focusId} onInspect={inspect} />
              )}
              {view.level === 'solar' && <UfoNavigator flight={activeFlight} targets={targets} position={ufoPosition} telemetry={flightTelemetry} onArrival={flightArrived} reduced={orbitsPaused} />}
              {view.level === 'artifact' && (
                <ArtifactScene modelUrl={status === 'failed' ? null : modelUrl} onReady={onReady} onError={onError}
                  phase={activity?.artifactId === view.artifactId ? activity.phase : 'idle'} />
              )}
            </Canvas>
          </div>
          <LabelOverlay />
        </CanvasBoundary>
      )}

      {!webgl && view.level !== 'artifact' && (
        <p className="world-flat-note" role="status">
          3D view is not available on this device. Use the list to explore.
        </p>
      )}

      {!tour && !activeFlight && !(view.level === 'solar' && focusId) && (
        <NavList key={view.level} view={view} catalog={catalog} callbacks={callbacks} setActive={setActive} alwaysOpen={!webgl}
          onInspect={webgl ? inspect : undefined} />
      )}

      {!tour && !activeFlight && webgl && view.level === 'solar' && focusId && (
        <div className="world-focusbar" role="region" aria-label="Selected object">
          <button type="button" onClick={() => setFocusId(null)}>Back to Solar system</button>
          <strong>{focusBody?.name ?? focusCraft?.name}</strong>
          {focusCraft && isMovingMission(focusCraft.id) && <span>{MISSION_MOTION[focusCraft.id].description}</span>}
          {focusId === 'eros' && <>
            <span>Asteroid Eros · NEAR Shoemaker landed here in 2001.</span>
            <a href={focusBody?.source} target="_blank" rel="noreferrer">NASA source</a>
            <button type="button" onClick={() => callbacks.onSelectArtifact('near-shoemaker')}>Meet NEAR Shoemaker</button>
          </>}
          {focusId === 'ceres' && <>
            <span>Dwarf planet Ceres · Dawn orbits this world.</span>
            <a href={focusBody?.source} target="_blank" rel="noreferrer">NASA source</a>
            <button type="button" onClick={() => callbacks.onSelectArtifact('dawn')}>Meet Dawn</button>
          </>}
          {focusCraft && isMovingMission(focusCraft.id) && (
            <a href={MISSION_MOTION[focusCraft.id].source} target="_blank" rel="noreferrer">NASA source</a>
          )}
          {(focusId === 'moon' || focusId === 'mars') && (
            <button type="button" onClick={() => callbacks.onSelectBody(focusId)}>Explore artifacts</button>
          )}
          {focusCraft && (
            <button type="button" onClick={() => callbacks.onSelectArtifact(focusCraft.id)}>Hear my story</button>
          )}
          {children.length > 0 && focusId !== 'sun' && (
            <div className="world-focusbar__moons" aria-label="Selected moons">
              {children.map((body) => <button key={body.id} type="button" onClick={() => setFocusId(body.id)}>{body.name}</button>)}
            </div>
          )}
          {focusCraft?.id === 'pioneer-11' && <span>Shared model: Pioneer 10</span>}
        </div>
      )}

      {activeFlight && <FlightCockpit key={activeFlight.id} label={activeFlight.label} telemetry={flightTelemetry} onCancel={() => flight ? onFlightCancel?.() : setLocalFlight(undefined)} />}
      {view.level === 'solar' && (
        <a className="world-sky-credit" href="https://svs.gsfc.nasa.gov/4851/" target="_blank" rel="noreferrer" title="NASA/Gaia HDR sky; optical photo © A. Mellinger. Black hole: NASA/GSFC/J. Schnittman, SVS 13326.">
          Sky · NASA / GSFC · Photo © A. Mellinger
        </a>
      )}

      {view.level === 'artifact' && (
        <ArtifactOverlay key={key} artifact={artifact} status={status} modelAsset={modelAsset} imageAsset={imageAsset} />
      )}

      {scaleNote && <p className="world-scale-note">{scaleNote}</p>}
    </div>
  );
}
