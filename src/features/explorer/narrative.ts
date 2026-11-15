// One upbeat introduction per object, approximately 15 seconds aloud.
// Mission claims remain attached to existing NASA facts, never invented dialogue.
import type { Artifact, ArtifactId, Fact } from '../../shared/contracts.ts';
import type { ChatSession } from './session.ts';

export interface StoryChapter { id: string; title: string; text: string; factIds: string[] }
type Introduction = [text: string, ...factIds: string[]];
export const INTRODUCTION_ID = 'short-intro-v1';

const INTRODUCTIONS: Record<ArtifactId, Introduction> = {
  'surveyor-3': ["Hey, explorer! I'm Surveyor 3, a scout on the Moon. My pictures and soil tests helped prepare the way for Apollo astronauts. Remember me when you look up: even a little scout can help a giant adventure begin!", 'sv3-002', 'sv3-004', 'sv3-035'],
  'apollo-11-eagle-descent-stage': ["Hi, explorer! I'm Eagle's descent stage, the part of Apollo 11 that stayed on the Moon. I helped the astronauts land, then became their launch platform. Remember me: sometimes helping others lift off is a wonderful adventure of its own!", 'a11-001', 'a11-004', 'a11-005'],
  'apollo-15-lrv': ["Hey, explorer! I'm Apollo 15's Moon rover. David Scott and Jim Irwin drove me across the lunar surface, exploring farther from their lander. Remember my little wheels when you dream big: a small ride can open up a bigger world!", 'lrv-001', 'lrv-002'],
  'apollo-12-alsep': ["Hello, explorer! I'm Apollo 12 ALSEP, a team of instruments on the Moon. I sent measurements home so people could keep learning about this world. Remember me: you don't have to travel far to help a great adventure grow!", 'als-002'],
  sojourner: ["Hey, explorer! I'm Sojourner, the first robotic rover delivered to Mars. Small wheels, big adventure! I rolled down Pathfinder's ramp and onto another world. Remember my little tracks: you don't have to be big to help exploration take a giant step!", 'soj-001', 'soj-004', 'soj-005'],
  spirit: ["Hey, explorer! I'm Spirit, a rover on Mars. Even my broken wheel uncovered a clue that ancient Mars was much wetter! Remember me for that discovery: an unexpected turn can become the beginning of a wonderful new question.", 'spi-003', 'spi-005'],
  opportunity: ["Hi, explorer! I'm Opportunity, a rover that searched Mars for clues to ancient water. I found them in the rocks! Remember my journey when you spot something ordinary: look a little closer, and you might discover a story waiting inside.", 'opp-025', 'opp-039', 'opp-040'],
  'viking-1': ["Hello, explorer! I'm the Viking 1 lander. I sent pictures from Mars and scooped its soil into my laboratory. Remember me as an explorer who looked closely and checked carefully. Your next great adventure can start with a thoughtful question!", 'vk1-018', 'vk1-033'],
  'viking-2': ["Hey, explorer! I'm the Viking 2 lander, working from Utopia Planitia on Mars. My fellow Viking lander and I studied the materials that make this world. Remember me: patient work and curious questions can help us understand somewhere wonderfully new!", 'vk2-003', 'vk2-006'],
  phoenix: ["Hey, explorer! I'm Phoenix, a lander in the Martian arctic. My robotic arm dug into the soil and helped confirm water-ice beneath the surface. Remember my discovery when you explore: sometimes an amazing clue is hiding just under your feet!", 'phx-002', 'phx-006'],
  insight: ["Hi, explorer! I'm InSight. I went to Mars to study its deep interior, carrying an instrument to measure marsquakes. Remember my mission when you wonder what lies beneath a familiar surface. A curious question can take your imagination somewhere extraordinary!", 'ins-001', 'ins-005'],
  ingenuity: ["Hey, explorer! I'm Ingenuity, the little helicopter that made the first powered, controlled flight on another planet. I was meant for a few tests, but completed 72 flights! Remember my little rotors when you dream of trying something wonderfully new.", 'ing-002', 'ing-003', 'ing-004'],
  dawn: ["Hey, explorer! I'm Dawn. I orbited Vesta and Ceres, and my pictures helped people investigate Ceres' mysterious bright patches. Remember me as the explorer of two worlds! Come closer, stay curious, and imagine the discoveries your own questions could begin.", 'dwn-001', 'dwn-004', 'dwn-005', 'dwn-009'],
  'near-shoemaker': ["Hey, explorer! I'm NEAR Shoemaker. I became the first spacecraft to orbit an asteroid, then landed on Eros! Remember my journey when you see a small space rock: even a little world can hold a big adventure worth exploring.", 'nea-004', 'nea-006'],
  'pioneer-10': ["Hi, explorer! I'm Pioneer 10. I was the first spacecraft through the asteroid belt and past Jupiter. Now my path leads out of the solar system. Remember me as a pioneer, and let your curiosity lead you toward new horizons!", 'p10-002', 'p10-008'],
  'pioneer-11': ["Hey, explorer! I'm Pioneer 11, the first spacecraft to fly past Saturn. I discovered its narrow F ring, too! Remember my journey when you look toward those distant planets. There's a whole universe of questions for curious explorers like you.", 'p11-004', 'p11-005'],
  kepler: ["Hey, explorer! I'm Kepler, a telescope that searched for planets around distant stars. My legacy includes more than 2,600 discoveries! Remember me when you look up: that tiny light might have a whole new world waiting to be explored.", 'kep-001', 'kep-008'],
};

export function characterName(artifact: Artifact): string { return artifact.name.split(' (')[0]; }

export function buildNarrative(artifact: Artifact, facts: Fact[], sourceIds: Set<string>): StoryChapter[] {
  const available = new Set(facts.filter((fact) => fact.artifactId === artifact.id &&
    (!artifact.memoryCutoff || !fact.date || fact.date <= artifact.memoryCutoff) &&
    fact.sourceIds.length > 0 && fact.sourceIds.every((id) => sourceIds.has(id))).map((fact) => fact.id));
  const [text, ...factIds] = INTRODUCTIONS[artifact.id];
  const supported = factIds.every((id) => available.has(id));
  return [{ id: INTRODUCTION_ID, title: '',
    text: supported ? text : `Hey, explorer! I'm ${characterName(artifact)}. Every adventure starts with a curious question. Come take a closer look, ask me about my mission, and let's explore the story behind this little piece of space history together!`,
    factIds: supported ? factIds : [],
  }];
}

/** Deliver the introduction once. Afterwards, only a visitor's question adds replies. */
export function appendNarrative(session: ChatSession, expectedCursor: number, story: StoryChapter[], facts: Fact[]): ChatSession {
  if (session.pending || expectedCursor !== 0) return session;
  const introduction = story[0];
  if (!introduction || session.messages.some((message) => message.storyId === introduction.id)) return session;
  const message = { role: 'assistant' as const, text: introduction.text, kind: 'story' as const, storyId: introduction.id,
    evidence: introduction.factIds.map((factId) => ({ factId, sourceIds: facts.find((fact) => fact.id === factId)!.sourceIds })),
  };
  // Replace the earlier multi-part script during hot reload, preserving real questions.
  return { ...session, storyCursor: 1, messages: [message, ...session.messages.filter((item) => item.kind !== 'story')] };
}
