import type { ArtifactId } from '../../shared/contracts.ts';

export const REWARD_KEY = 'nasa-explorer:passport:v1';
export const REWARD_CHANGED = 'explorer:passport-changed';
export const REWARD_OVERLAY = 'explorer:passport-overlay';
export const BADGES: Record<ArtifactId, { title: string; symbol: string }> = {
  'surveyor-3': { title: 'Moon Scout', symbol: '☾' },
  'apollo-11-eagle-descent-stage': { title: 'Giant Leap', symbol: '☾' },
  'apollo-15-lrv': { title: 'Lunar Trailblazer', symbol: '☾' },
  'apollo-12-alsep': { title: 'Moon Listener', symbol: '☾' },
  sojourner: { title: 'Small Wheels, Big Dreams', symbol: '✦' },
  spirit: { title: 'Curiosity Finds a Way', symbol: '✦' },
  opportunity: { title: 'Water Detective', symbol: '✦' },
  'viking-1': { title: 'First Look', symbol: '✦' },
  'viking-2': { title: 'Patient Explorer', symbol: '✦' },
  phoenix: { title: 'Hidden Ice', symbol: '✦' },
  insight: { title: 'Deep Listener', symbol: '✦' },
  ingenuity: { title: 'Dare to Fly', symbol: '✦' },
  dawn: { title: 'Two Worlds, One Journey', symbol: '✧' },
  'near-shoemaker': { title: 'Little World, Big Adventure', symbol: '✧' },
  'pioneer-10': { title: 'Beyond the Horizon', symbol: '✧' },
  'pioneer-11': { title: 'Ring Explorer', symbol: '✧' },
  kepler: { title: 'World Finder', symbol: '✧' },
};
export interface EarnedBadge { id: ArtifactId; earnedAt: string; }
type Store = Pick<Storage, 'getItem' | 'setItem'>;
function isId(id: unknown): id is ArtifactId { return typeof id === 'string' && Object.hasOwn(BADGES, id); }

/** Corrupt/blocked browser storage must never prevent a child from exploring. */
export function createRewardBook(storage?: Store) {
  const session = new Map<ArtifactId, EarnedBadge>();
  function read(): EarnedBadge[] {
    const all = new Map<ArtifactId, EarnedBadge>();
    try {
      const parsed: unknown = JSON.parse(storage?.getItem(REWARD_KEY) ?? '[]');
      if (Array.isArray(parsed)) for (const row of parsed) {
        if (row && isId(row.id) && typeof row.earnedAt === 'string' && Number.isFinite(Date.parse(row.earnedAt))) all.set(row.id, { id: row.id, earnedAt: row.earnedAt });
      }
    } catch { /* Keep this visit's rewards when storage is unavailable. */ }
    for (const [id, badge] of session) all.set(id, badge);
    return [...all.values()];
  }
  return {
    read,
    claim(id: ArtifactId, earnedAt = new Date().toISOString()) {
      if (!isId(id)) return { added: false, persisted: false };
      if (read().some((row) => row.id === id)) return { added: false, persisted: true };
      session.set(id, { id, earnedAt });
      let persisted = false;
      try { if (storage) { storage.setItem(REWARD_KEY, JSON.stringify(read())); persisted = true; } } catch { /* Session collection still works. */ }
      return { added: true, persisted };
    },
  };
}
let browserStore: Store | undefined;
try { if (typeof window !== 'undefined') browserStore = window.localStorage; } catch { /* private/blocked storage */ }
export const rewardBook = createRewardBook(browserStore);
