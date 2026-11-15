import type { Fact, Source } from './contracts.ts';

/** The user accepts NASA-sourced records without a separate manual review step. */
export function isOfficialNasaSource(source: Pick<Source, 'url'>): boolean {
  try {
    const url = new URL(source.url);
    return url.protocol === 'https:' && !url.username && !url.password &&
      (url.hostname === 'nasa.gov' || url.hostname.endsWith('.nasa.gov'));
  } catch { return false; }
}

export function hasNasaEvidence(fact: Pick<Fact, 'sourceIds'>, sources: readonly Source[]): boolean {
  return fact.sourceIds.length > 0 && fact.sourceIds.every((id) => {
    const source = sources.find((item) => item.id === id);
    return !!source && !!source.title.trim() && !!source.locator.trim() && isOfficialNasaSource(source);
  });
}

export function factIsAccepted(fact: Fact, sources: readonly Source[], allowPending = false): boolean {
  return fact.reviewStatus === 'approved' || hasNasaEvidence(fact, sources) || (allowPending && fact.reviewStatus === 'pending');
}
