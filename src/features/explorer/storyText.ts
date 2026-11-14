// Story text and wording owned by the ui-story agent.
// RULE: nothing in this file states a mission fact (no dates, numbers, places,
// discoveries). Facts come only from the catalog. The only per-artifact tables
// here are (1) the model honesty notes required by CLAUDE.md "Tài nguyên" and
// (2) written farewells for chat characters, copied from prompts/personas/*.md.

import type { Artifact, ArtifactId, SurfaceLocation } from '../../shared/contracts';

export const APP_TITLE = 'Night Shift: Space Artifact Explorer';
export const DISCLAIMER = 'Student project. Not affiliated with or endorsed by NASA.';

export const BODY_NAMES: Record<'moon' | 'mars', string> = {
  moon: 'Moon',
  mars: 'Mars',
};

/** What a map marker means, in plain words. */
export const LOCATION_KIND_WORDS: Record<SurfaceLocation['kind'], { title: string; meaning: string }> = {
  landing: {
    title: 'Landing site',
    meaning: 'the place where it first touched down',
  },
  'final-resting': {
    title: 'Final resting place',
    meaning: 'the place where it stopped for good',
  },
  deployment: {
    title: 'Deployment site',
    meaning: 'the place where it was set down to start its work',
  },
};

/**
 * Honesty notes for 3D models that are not an exact model of the artifact.
 * Shown together with the model asset's own `represents` text from the catalog.
 * Keyed by artifact id because the catalog has no field for this.
 */
export const SHARED_MODEL_NOTES: Partial<Record<ArtifactId, string>> = {
  spirit: 'Heads up: the 3D model shown is Opportunity, the twin rover of Spirit. It is not a model of Spirit itself.',
  'viking-2':
    'Heads up: the 3D model shown is the shared Viking lander design used for both Viking landers. It is not a model of this exact lander.',
  'pioneer-11': 'Heads up: the 3D model shown is Pioneer 10, the sister craft of Pioneer 11. It is not a model of Pioneer 11 itself.',
  'apollo-11-eagle-descent-stage':
    'Heads up: the 3D model shows the whole Lunar Module. Only the descent stage (the lower part) is still on the Moon.',
};

export const NO_MODEL_NOTE =
  'There is no official NASA 3D model of this craft in our kit, so we do not show one. We never build a pretend model.';

export const DEEP_SPACE_NOTE =
  'This craft is not on the Moon or Mars. Its dot on the solar system map is illustrative: it does not show a real position or distance.';

export const AI_CHARACTER_NOTE =
  'You are talking to an AI character. It is a storyteller for a real machine. It is not the real spacecraft, and it does not think or feel. Its answers are built from the fact cards and their sources.';

export const CARD_ONLY_NOTE = 'Story card only. This craft has no chat.';

/** Written farewells for chat characters (see prompts/personas/<id>.md). No facts inside. */
const FAREWELLS: Partial<Record<ArtifactId, string>> = {
  opportunity:
    'Operator, my part of the story is saved now. Thank you for staying up to listen. Other machines carry on the work that I started, and you can follow them. Keep asking good questions. Opportunity character, signing off.',
  'surveyor-3':
    'Station, this is the Surveyor 3 character with a last message. You wrote my memories down, and that keeps them useful. I was built to help others make the trip after me. Now it is your turn to explore. Signing off.',
  'viking-1':
    'Operator, my log is complete. Thank you for reading it with care. Every careful question you ask is the same kind of work I was sent to do. Check your sources, stay curious, and look up at Mars for me. Viking 1 character, signing off.',
};

export function farewellFor(artifact: Artifact): string {
  return (
    FAREWELLS[artifact.id] ??
    `Operator, my memories are saved in your journal now. Thank you for listening on the night shift. Keep exploring, and keep checking the sources. ${artifact.name} character, signing off.`
  );
}

/** Number of recorded memories that unlocks the farewell by itself. */
export function farewellThreshold(totalFacts: number): number {
  return Math.max(1, Math.min(3, totalFacts));
}

/** "2018-06-10" -> "June 10, 2018". Returns the raw text if it is not an ISO date. */
export function formatIsoDate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!match) return iso;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(date);
}
