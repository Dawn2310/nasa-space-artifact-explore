// PLACEHOLDER của Lead — agent world3d thay file này bằng cảnh React Three Fiber.
// Giữ nguyên: default export nhận WorldProps, không tự giữ state điều hướng.

import type { WorldProps } from '../../shared/app-types';

export default function World({ view, catalog, callbacks }: WorldProps) {
  return (
    <div className="world-placeholder">
      <p className="world-placeholder__tag">3D scene placeholder · Not to scale</p>
      {view.level === 'solar' && (
        <div className="world-placeholder__row">
          <button onClick={() => callbacks.onSelectBody('moon')}>Moon</button>
          <button onClick={() => callbacks.onSelectBody('mars')}>Mars</button>
          {catalog.artifacts
            .filter((a) => a.body === 'deep-space')
            .map((a) => (
              <button key={a.id} onClick={() => callbacks.onSelectArtifact(a.id)}>
                {a.name} (illustrative position)
              </button>
            ))}
        </div>
      )}
      {view.level === 'surface' && (
        <div className="world-placeholder__row">
          {catalog.artifacts
            .filter((a) => a.body === view.body)
            .map((a) => (
              <button key={a.id} onClick={() => callbacks.onSelectArtifact(a.id)}>
                {a.name}
              </button>
            ))}
        </div>
      )}
      {view.level === 'artifact' && <p>Artifact viewer: {view.artifactId}</p>}
    </div>
  );
}
