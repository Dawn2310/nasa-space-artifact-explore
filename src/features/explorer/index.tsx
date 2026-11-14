// PLACEHOLDER của Lead — agent ui-story thay file này bằng ExplorerShell thật.
// Giữ nguyên: default export nhận ExplorerProps, điều hướng chỉ qua callbacks.

import { findArtifact } from '../../shared/app-types';
import type { ExplorerProps } from '../../shared/app-types';

export default function Explorer({ view, catalog, callbacks }: ExplorerProps) {
  const artifact = view.level === 'artifact' ? findArtifact(catalog, view.artifactId) : undefined;
  return (
    <div className="explorer-placeholder">
      <header className="explorer-placeholder__bar">
        <strong>Night Shift: Space Artifact Explorer</strong>
        {view.level !== 'solar' && <button onClick={callbacks.onBack}>Back</button>}
      </header>
      {artifact && (
        <section className="explorer-placeholder__card">
          <h2>{artifact.name}</h2>
          <p>{artifact.displayYears}</p>
          <p>{artifact.intro}</p>
        </section>
      )}
    </div>
  );
}
