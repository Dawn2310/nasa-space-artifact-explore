// Character voices, shared by the Legacy Voyage cockpit (React) and the Mars/Moon mission maps
// (mars-missions/mars-voices.js re-exports this). Picked only from voices the visitor's browser
// has: Edge "Natural" online voices, Windows desktop voices, Chrome's Google voices, macOS voices.
// Pitch/rate give each character a feel; the facts it speaks never change.
import { chooseFriendlyVoice, SPEECH_PITCH, SPEECH_RATE, SPEECH_SPEED } from '../explorer/voice';

export interface VoiceProfile { pitch: number; rate: number; prefer: RegExp[] }

export const VOICE_PROFILES: Record<string, VoiceProfile> = {
  // The UFO's guide: warm and clear, the "teacher" voice of the voyage.
  echo: { pitch: 1.04, rate: 0.98, prefer: [/\bEmma\b/, /\bAria\b/, /\bJenny\b/, /Google UK English Female/, /\bSamantha\b/, /\bZira\b/] },

  // ---- Mars ----
  // Small, quick, playful helicopter: bright young voice, a little faster.
  ingenuity: { pitch: 1.25, rate: 1.06, prefer: [/\bAna\b/, /\bAva\b/, /\bAria\b/, /\bJenny\b/, /Google US English/, /\bZira\b/, /\bSamantha\b/] },
  // Brave, warm explorer rover ("Oppy").
  opportunity: { pitch: 1.08, rate: 0.98, prefer: [/\bJenny\b/, /\bMichelle\b/, /\bEmma\b/, /\bAria\b/, /Google US English/, /\bZira\b/, /\bSamantha\b/] },
  // Opportunity's twin: same cheer, a different (British) voice so the twins sound apart.
  spirit: { pitch: 1.1, rate: 1.0, prefer: [/\bSonia\b/, /\bLibby\b/, /\bMaisie\b/, /Google UK English Female/, /\bHazel\b/, /\bMoira\b/, /\bTessa\b/, /\bKaren\b/] },
  // Calm, patient listener for marsquakes.
  insight: { pitch: 0.95, rate: 0.92, prefer: [/\bAndrew\b/, /\bChristopher\b/, /\bBrian\b/, /\bGuy\b/, /\bMark\b/, /Google US English/, /\bAlex\b/] },
  // The 1976 pioneer: deeper and slower, like a wise grandparent.
  'viking-1': { pitch: 0.82, rate: 0.88, prefer: [/\bDavis\b/, /\bRoger\b/, /\bGuy\b/, /\bSteffan\b/, /\bDavid\b/, /Google UK English Male/, /\bFred\b/, /\bDaniel\b/] },
  // Viking 1's sibling: also low and steady, but a different voice.
  'viking-2': { pitch: 0.86, rate: 0.9, prefer: [/\bRyan\b/, /\bThomas\b/, /\bEric\b/, /\bChristopher\b/, /Google UK English Male/, /\bGeorge\b/, /\bDaniel\b/, /\bMark\b/] },
  // The first Mars rover: tiny and proud.
  sojourner: { pitch: 1.2, rate: 1.04, prefer: [/\bAna\b/, /\bMaisie\b/, /\bAva\b/, /Google US English/, /\bZira\b/, /\bSamantha\b/] },
  // Arctic digger: crisp and curious.
  phoenix: { pitch: 1.06, rate: 0.98, prefer: [/\bMichelle\b/, /\bLibby\b/, /\bAria\b/, /Google UK English Female/, /\bKaren\b/, /\bZira\b/] },

  // ---- Moon ----
  // Apollo 11's Eagle: steady, historic, a little proud.
  'apollo-11-eagle-descent-stage': { pitch: 0.95, rate: 0.94, prefer: [/\bGuy\b/, /\bChristopher\b/, /\bBrian\b/, /\bAndrew\b/, /Google US English/, /\bDavid\b/, /\bAlex\b/] },
  // Apollo 15's Moon buggy: adventurous road-trip energy.
  'apollo-15-lrv': { pitch: 1.05, rate: 1.04, prefer: [/\bEric\b/, /\bBrian\b/, /\bSteffan\b/, /\bRoger\b/, /\bMark\b/, /Google US English/, /\bTom\b/] },
  // Apollo 12 ALSEP: a calm, precise science station.
  'apollo-12-alsep': { pitch: 1.0, rate: 0.93, prefer: [/\bMichelle\b/, /\bAria\b/, /\bLibby\b/, /\bEmma\b/, /Google UK English Female/, /\bZira\b/, /\bKaren\b/] },
  // Surveyor 3: a small, curious robot scout from 1967.
  'surveyor-3': { pitch: 1.15, rate: 1.0, prefer: [/\bAva\b/, /\bEmma\b/, /\bMaisie\b/, /\bJenny\b/, /Google US English/, /\bZira\b/, /\bSamantha\b/] },

  // ---- Deep space ----
  'pioneer-10': { pitch: 0.9, rate: 0.92, prefer: [/\bRoger\b/, /\bDavis\b/, /\bGuy\b/, /Google UK English Male/, /\bDavid\b/, /\bDaniel\b/] },
  'near-shoemaker': { pitch: 1.0, rate: 1.0, prefer: [/\bBrian\b/, /\bEric\b/, /\bChristopher\b/, /Google US English/, /\bMark\b/, /\bAlex\b/] },
  dawn: { pitch: 1.08, rate: 0.98, prefer: [/\bAria\b/, /\bSonia\b/, /\bEmma\b/, /Google UK English Female/, /\bSamantha\b/, /\bZira\b/] },
  kepler: { pitch: 0.98, rate: 0.95, prefer: [/\bAndrew\b/, /\bThomas\b/, /\bChristopher\b/, /Google UK English Male/, /\bDaniel\b/, /\bDavid\b/] },
};

const DEFAULT_PROFILE: VoiceProfile = { pitch: SPEECH_PITCH, rate: SPEECH_RATE, prefer: [] };

export function voiceProfile(id: string | null | undefined): VoiceProfile {
  const profile = id ? VOICE_PROFILES[id] : undefined;
  return profile ? { ...profile, rate: profile.rate * SPEECH_SPEED } : DEFAULT_PROFILE;
}

/** The first preferred English voice that exists (natural/online voices first), else the app's default pick. */
export function pickVoice<T extends { name: string; lang: string; default?: boolean }>(id: string | null | undefined, voices: readonly T[]): T | undefined {
  const english = voices.filter((voice) => /^en(?:-|_|$)/i.test(voice.lang));
  for (const pattern of voiceProfile(id).prefer) {
    const matches = english.filter((voice) => pattern.test(voice.name));
    if (matches.length) return matches.find((voice) => /natural|online/i.test(voice.name)) ?? matches[0];
  }
  return chooseFriendlyVoice(voices);
}
