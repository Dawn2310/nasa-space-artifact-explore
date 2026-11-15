import { useState } from 'react';
import type { Artifact, SceneCallbacks, ViewState } from '../../shared/contracts';
import type { Catalog } from '../../shared/app-types';
import { BODY_NAMES } from './storyText';

interface GuidanceProps {
  view: Exclude<ViewState, { level: 'artifact' }>;
  catalog: Catalog;
  callbacks: SceneCallbacks;
}

// Lead (Mốc ghép 1): thu gọn mặc định. Danh sách của world3d (góc dưới trái) là danh sách chính
// vì nó còn highlight và quay globe; danh sách này mở ra sẽ che vùng phải của cảnh 3D.
function startsOpen(): boolean {
  return false;
}

function signals(count: number): string {
  return count === 1 ? '1 signal' : `${count} signals`;
}

interface ArtifactButtonProps {
  artifact: Artifact;
  onOpen: SceneCallbacks['onSelectArtifact'];
}

function ArtifactButton({ artifact, onOpen }: ArtifactButtonProps) {
  return (
    <li>
      <button type="button" className="xp-btn xp-btn--row" onClick={() => onOpen(artifact.id)}>
        <span className="xp-row__name">{artifact.name}</span>
        <span className="xp-row__meta">
          {artifact.displayYears} · {artifact.mode === 'chat' ? 'Chat + story card' : 'Story card'}
        </span>
      </button>
    </li>
  );
}

/** Light guidance at the solar and surface levels: a mission briefing and a keyboard list of what can be opened. */
export default function Guidance({ view, catalog, callbacks }: GuidanceProps) {
  const [open, setOpen] = useState(startsOpen);
  const [hidden, setHidden] = useState(true);
  const listId = 'xp-guide-list';

  const onBody = (body: 'moon' | 'mars') => catalog.artifacts.filter((a) => a.body === body);
  const deepSpace = catalog.artifacts.filter((a) => a.body === 'deep-space');
  const here = view.level === 'surface' ? onBody(view.body) : [];

  return (
    <aside className={`xp-guide${hidden ? ' xp-guide--hidden' : ''}`} aria-label="Mission briefing">
      <div className="xp-guide__header">
        {!hidden && <p className="xp-guide__eyebrow">Mission briefing</p>}
        <button
          type="button"
          className="xp-btn xp-guide__visibility"
          aria-expanded={!hidden}
          aria-controls="xp-guide-body"
          onClick={() => setHidden((value) => !value)}
        >
          {hidden ? 'Show briefing' : 'Hide'}
        </button>
      </div>
      <div id="xp-guide-body" className="xp-guide__body" hidden={hidden}>
        {view.level === 'solar' ? (
          <p className="xp-text">
            Welcome to the night shift, operator. Our station is picking up faint signals from quiet NASA machines.
            Pick the Moon or Mars on the map, or use the list, and wake up their stories.
          </p>
        ) : (
          <p className="xp-text">
            You are looking at {view.body === 'moon' ? 'the Moon' : 'Mars'}. Tap a marker on the globe, or pick a
            machine from the list, to hear its story.
          </p>
        )}

        <button
          type="button"
          className="xp-btn xp-guide__toggle"
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? 'Hide signal list' : 'Show signal list'}
        </button>

        {open && (
          <div id={listId} className="xp-guide__list">
            {view.level === 'solar' && (
              <>
                <h2 className="xp-h3">Worlds</h2>
                <ul className="xp-rows">
                  {(['moon', 'mars'] as const).map((body) => (
                    <li key={body}>
                      <button type="button" className="xp-btn xp-btn--row" onClick={() => callbacks.onSelectBody(body)}>
                        <span className="xp-row__name">{BODY_NAMES[body]}</span>
                        <span className="xp-row__meta">{signals(onBody(body).length)}</span>
                      </button>
                    </li>
                  ))}
                </ul>

                <h2 className="xp-h3">Deep space</h2>
                {deepSpace.length === 0 ? (
                  <p className="xp-note">No deep-space signals are loaded yet.</p>
                ) : (
                  <>
                    <p className="xp-note">
                      These craft are not on the Moon or Mars. Their dots on the map are illustrative, not real
                      positions.
                    </p>
                    <ul className="xp-rows">
                      {deepSpace.map((artifact) => (
                        <ArtifactButton key={artifact.id} artifact={artifact} onOpen={callbacks.onSelectArtifact} />
                      ))}
                    </ul>
                  </>
                )}
              </>
            )}

            {view.level === 'surface' && (
              <>
                <h2 className="xp-h3">
                  Signals on {view.body === 'moon' ? 'the Moon' : 'Mars'} ({here.length})
                </h2>
                {here.length === 0 ? (
                  <p className="xp-note">No signals are loaded for this world yet.</p>
                ) : (
                  <ul className="xp-rows">
                    {here.map((artifact) => (
                      <ArtifactButton key={artifact.id} artifact={artifact} onOpen={callbacks.onSelectArtifact} />
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
