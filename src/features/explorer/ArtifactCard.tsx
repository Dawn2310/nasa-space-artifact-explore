import type { Artifact } from '../../shared/contracts';
import { factsFor, findAsset } from '../../shared/app-types';
import type { Catalog } from '../../shared/app-types';
import FactCard, { Postcard, SourceList } from './FactCard';
import {
  CARD_ONLY_NOTE,
  DEEP_SPACE_NOTE,
  LOCATION_KIND_WORDS,
  NO_MODEL_NOTE,
  SHARED_MODEL_NOTES,
  formatIsoDate,
} from './storyText';

interface ArtifactCardProps {
  catalog: Catalog;
  artifact: Artifact;
}

/** The story card: picture, character intro, where it is, what the 3D view shows, fact cards with sources. */
export default function ArtifactCard({ catalog, artifact }: ArtifactCardProps) {
  const facts = factsFor(catalog, artifact.id);
  const modelAsset = findAsset(catalog, artifact.modelAssetId);
  const sharedModelNote = SHARED_MODEL_NOTES[artifact.id];
  const markerIndex = artifact.markerLocationIndex;

  return (
    <div className="xp-card">
      <Postcard catalog={catalog} imageAssetId={artifact.imageAssetId} />

      <section className="xp-block xp-intro" aria-label="Character introduction">
        <div className="xp-tags">
          <span className="xp-tag xp-tag--ai">AI character</span>
          {artifact.mode === 'card' && <span className="xp-tag">{CARD_ONLY_NOTE}</span>}
        </div>
        <p className="xp-intro__text">{artifact.intro}</p>
        <p className="xp-note">
          These words are a written character voice, not a real message from the spacecraft. The facts below come
          from the listed sources.
        </p>
      </section>

      <section className="xp-block" aria-label="Where it is">
        <h3 className="xp-h3">Where is it?</h3>
        {artifact.body === 'deep-space' && <p className="xp-text">{DEEP_SPACE_NOTE}</p>}
        {artifact.body !== 'deep-space' && artifact.locations.length === 0 && (
          <p className="xp-text">No position is loaded for this craft yet, so we do not show one.</p>
        )}
        {artifact.locations.length > 0 && (
          <ul className="xp-locations">
            {artifact.locations.map((location, index) => {
              const words = LOCATION_KIND_WORDS[location.kind];
              const isMarker = index === markerIndex;
              return (
                <li key={`${location.kind}-${index}`} className="xp-location">
                  <p className="xp-text">
                    <strong>{words.title}</strong>: {location.label}. This is {words.meaning}.
                  </p>
                  {isMarker && (
                    <p className="xp-tags">
                      <span className="xp-tag xp-tag--accent">
                        The map marker shows this spot ({words.title.toLowerCase()})
                      </span>
                    </p>
                  )}
                  <details className="xp-details">
                    <summary>
                      Coordinates and source<span className="xp-visually-hidden"> for {words.title.toLowerCase()}</span>
                    </summary>
                    <p className="xp-text">
                      Latitude {location.latitudeDeg}°, longitude {location.longitudeDeg}°
                      <br />
                      <span className="xp-muted">How the source writes it: {location.convention}</span>
                    </p>
                    <SourceList catalog={catalog} sourceIds={location.sourceIds} />
                  </details>
                </li>
              );
            })}
          </ul>
        )}
        {artifact.locations.length > 0 && markerIndex === null && (
          <p className="xp-note">No map marker is drawn for this craft.</p>
        )}
      </section>

      <section className="xp-block" aria-label="About the 3D view">
        <h3 className="xp-h3">What the 3D view shows</h3>
        {artifact.modelAssetId === null && <p className="xp-text">{NO_MODEL_NOTE}</p>}
        {artifact.modelAssetId !== null && !modelAsset && (
          <p className="xp-text">The 3D model record for this craft is missing from the catalog.</p>
        )}
        {modelAsset && (
          <>
            <p className="xp-text">
              <strong>Model shown:</strong> {modelAsset.represents}
            </p>
            {sharedModelNote && <p className="xp-callout">{sharedModelNote}</p>}
            <p className="xp-note">
              Model credit: {modelAsset.creatorCredit}.{' '}
              <a className="xp-link xp-link--inline" href={modelAsset.sourceUrl} target="_blank" rel="noopener noreferrer">
                Model source<span className="xp-visually-hidden"> (opens in a new tab)</span>
              </a>
            </p>
          </>
        )}
      </section>

      {artifact.memoryCutoff && (
        <section className="xp-block" aria-label="Memory lock">
          <h3 className="xp-h3">Locked memory</h3>
          <p className="xp-text">
            This character's memory ends on {formatIsoDate(artifact.memoryCutoff)}. It does not know what happened
            after that day.
          </p>
        </section>
      )}

      <section className="xp-block" aria-label="Fact cards">
        <h3 className="xp-h3">Fact cards ({facts.length})</h3>
        {facts.length === 0 && <p className="xp-text">No fact cards are loaded for this craft yet.</p>}
        <div className="xp-facts">
          {facts.map((fact) => (
            <FactCard key={fact.id} catalog={catalog} fact={fact} />
          ))}
        </div>
      </section>
    </div>
  );
}
