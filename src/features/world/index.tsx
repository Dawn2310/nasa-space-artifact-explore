// World (agent world3d): ba tầng cảnh React Three Fiber: solar → surface → artifact.
// Nhận WorldProps từ App; KHÔNG giữ state điều hướng, chỉ gọi callbacks.
// State cục bộ ở đây chỉ là trạng thái hiển thị (đang trỏ vào đâu, model tải xong chưa).

import { Component, useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import type { Artifact, Asset } from '../../shared/contracts';
import { assetUrl, findArtifact, findAsset } from '../../shared/app-types';
import type { Catalog, WorldProps } from '../../shared/app-types';
import { ArtifactScene } from './ArtifactScene';
import { CameraRig } from './CameraRig';
import { LabelOverlay, LabelProjector } from './labels';
import { CAMERA_FOV_DEG, WIDE_BREAKPOINT_PX } from './layout';
import type { ActiveTarget } from './layout';
import type { SetActive } from './parts';
import { SolarScene, hasIllustrativeSpot } from './SolarScene';
import { SurfaceScene, describeLocation, markerLocation } from './SurfaceScene';
import './world.css';

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
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
}

function NavList({ view, catalog, callbacks, setActive, alwaysOpen }: NavListProps) {
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
        {photo('world-photo world-photo--thumb')}
        {modelAsset && (
          <p className="world-caption">
            <span className="world-caption__tag">3D model shown:</span> {modelAsset.represents}{' '}
            <span className="world-credit">Credit: {modelAsset.creatorCredit}</span>
          </p>
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

export default function World({ view, catalog, callbacks }: WorldProps) {
  const [webgl, setWebgl] = useState(detectWebGL);
  const [active, setActive] = useState<ActiveTarget | null>(null);
  const [loaded, setLoaded] = useState<{ url: string; status: 'ready' | 'failed' } | null>(null);

  const key = viewKey(view);
  const artifact = view.level === 'artifact' ? findArtifact(catalog, view.artifactId) : undefined;
  const { modelAsset, imageAsset } = artifactAssets(catalog, artifact);
  const modelUrl = modelAsset ? assetUrl(modelAsset) : null;

  // Đổi tầng: bỏ trạng thái trỏ/focus và trạng thái tải của cảnh cũ.
  useEffect(() => {
    setActive(null);
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

  const scaleNote =
    view.level === 'solar' ? 'Not to scale · Blue dots are illustrative positions, not real ones' : 'Not to scale';

  return (
    <div className={`world world--${view.level}${webgl ? '' : ' world--flat'}`}>
      {webgl && (
        <CanvasBoundary onFail={onCanvasFail}>
          <div className="world__canvas" aria-hidden="true">
            <Canvas camera={{ fov: CAMERA_FOV_DEG, near: 0.1, far: 900, position: [0, 32, 41] }} dpr={[1, 2]}>
              <color attach="background" args={['#05070d']} />
              <Stars radius={220} depth={60} count={2500} factor={5} fade speed={0} />
              <CameraRig view={view} />
              <LabelProjector />
              {view.level === 'solar' && (
                <SolarScene catalog={catalog} callbacks={callbacks} active={active} setActive={setActive} />
              )}
              {view.level === 'surface' && (
                <SurfaceScene
                  key={view.body}
                  body={view.body}
                  catalog={catalog}
                  callbacks={callbacks}
                  active={active}
                  setActive={setActive}
                />
              )}
              {view.level === 'artifact' && (
                <ArtifactScene modelUrl={status === 'failed' ? null : modelUrl} onReady={onReady} onError={onError} />
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

      <NavList key={view.level} view={view} catalog={catalog} callbacks={callbacks} setActive={setActive} alwaysOpen={!webgl} />

      {view.level === 'artifact' && (
        <ArtifactOverlay key={key} artifact={artifact} status={status} modelAsset={modelAsset} imageAsset={imageAsset} />
      )}

      <p className="world-scale-note">{scaleNote}</p>
    </div>
  );
}
