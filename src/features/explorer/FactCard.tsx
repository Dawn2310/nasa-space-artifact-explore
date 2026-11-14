import { useState } from 'react';
import type { Fact } from '../../shared/contracts';
import { assetUrl, findAsset, findSource } from '../../shared/app-types';
import type { Catalog } from '../../shared/app-types';
import { formatIsoDate } from './storyText';

interface SourceListProps {
  catalog: Catalog;
  sourceIds: string[];
}

/** Title, publisher, link and locator for each source id. Missing records are said out loud, never guessed. */
export function SourceList({ catalog, sourceIds }: SourceListProps) {
  if (sourceIds.length === 0) {
    return <p className="xp-source xp-source--missing">No source is listed for this yet.</p>;
  }
  return (
    <ul className="xp-sources">
      {sourceIds.map((sourceId) => {
        const source = findSource(catalog, sourceId);
        if (!source) {
          return (
            <li key={sourceId} className="xp-source xp-source--missing">
              Source record "{sourceId}" is missing from the catalog.
            </li>
          );
        }
        return (
          <li key={sourceId} className="xp-source">
            <span className="xp-source__title">{source.title}</span>
            <span className="xp-source__meta">Published by: {source.publisher}</span>
            <span className="xp-source__meta">Where to look on the page: {source.locator}</span>
            <span className="xp-source__meta">We read it on: {formatIsoDate(source.accessedAt)}</span>
            <a className="xp-link" href={source.url} target="_blank" rel="noopener noreferrer">
              Open source page<span className="xp-visually-hidden"> ({source.title}, opens in a new tab)</span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}

interface PostcardProps {
  catalog: Catalog;
  imageAssetId: string | null;
}

/** A picture asset (jpg/png) with its credit. Renders nothing when there is no usable picture. */
export function Postcard({ catalog, imageAssetId }: PostcardProps) {
  const [failed, setFailed] = useState(false);
  const asset = findAsset(catalog, imageAssetId);
  if (!asset || (asset.format !== 'jpg' && asset.format !== 'png')) return null;
  if (failed) {
    return <p className="xp-note">The picture for this card could not be loaded.</p>;
  }
  return (
    <figure className="xp-postcard">
      <img src={assetUrl(asset)} alt={asset.represents} loading="lazy" onError={() => setFailed(true)} />
      <figcaption>
        {asset.represents} Credit: {asset.creatorCredit}
      </figcaption>
    </figure>
  );
}

interface FactCardProps {
  catalog: Catalog;
  fact: Fact;
  /** Start with the source list open (used when the child pressed "Sources"). */
  sourcesOpen?: boolean;
}

export default function FactCard({ catalog, fact, sourcesOpen = false }: FactCardProps) {
  return (
    <article className="xp-fact">
      <p className="xp-fact__text">{fact.text}</p>
      <div className="xp-tags">
        {fact.date && <span className="xp-tag">Date: {formatIsoDate(fact.date)}</span>}
        {fact.reviewStatus === 'pending' && <span className="xp-tag xp-tag--warn">Awaiting review</span>}
      </div>
      <Postcard catalog={catalog} imageAssetId={fact.imageAssetId} />
      <details className="xp-details" open={sourcesOpen || undefined}>
        <summary>
          {fact.sourceIds.length > 1 ? `Sources (${fact.sourceIds.length})` : 'Source'}
          <span className="xp-visually-hidden"> for this fact</span>
        </summary>
        <SourceList catalog={catalog} sourceIds={fact.sourceIds} />
      </details>
    </article>
  );
}
