import type { ArtifactId } from '../../shared/contracts.ts';

// Display coordinates and animation speeds, NOT ephemerides or true distances.
// Fixed world-space centers/axes; only the stars within each decorative galaxy rotate.
// These are illustrative galaxies, not a reconstruction of the Milky Way from outside.
export const GALAXIES = [
  { position: [-170, -210, -420], rotation: [0.05, -0.45, -0.5], scale: 1.2, speed: 0.025, seed: 98271, count: 6200 },
  { position: [185, -335, -280], rotation: [0.3, 0.4, 0.55], scale: 0.58, speed: -0.035, seed: 73129, count: 3400 },
  // Smaller discoveries behind the initial view, revealed as the viewer orbits.
  { position: [-390, -290, 245], rotation: [0.28, 0.48, -0.36], scale: 0.62, speed: 0.021, seed: 45193, count: 2800 },
  { position: [340, -240, 320], rotation: [-0.2, -0.38, 0.72], scale: 0.48, speed: -0.028, seed: 62817, count: 2200 },
] as const;

// Distant decorative NASA visualizations, not objects inside the solar system.
// Just two, with the second outside the initial view; both share one video.
export const BLACK_HOLES = [
  { position: [110, -155, -470], size: 110, roll: 0 },
  { position: [-460, -220, 80], size: 88, roll: -0.22 },
] as const;

export const MISSION_MOTION = {
  kepler: { orbit: 8.8, angle: 2.75, speed: 0.1373, kind: 'solar-orbit', description: 'Orbiting the Sun; drifting behind Earth', source: 'https://science.nasa.gov/resource/keplers-orbit/' },
  dawn: { orbit: 16, angle: 1.65, speed: 0.075, kind: 'host-orbit', description: 'Orbiting Ceres; Ceres orbits the Sun', source: 'https://www.nasa.gov/news-release/nasas-dawn-mission-to-asteroid-belt-comes-to-end/' },
  'near-shoemaker': { orbit: 10.6, angle: 0.25, speed: 0.095, kind: 'landed', description: 'Resting on Eros; moves with the asteroid', source: 'https://science.nasa.gov/mission/near-shoemaker/' },
  'pioneer-10': { orbit: 50, angle: 4.9, speed: 0.06, kind: 'outbound', description: 'Coasting outward on a solar-escape trajectory', source: 'https://science.nasa.gov/mission/pioneer-10/' },
  'pioneer-11': { orbit: 50, angle: 3.45, speed: 0.06, kind: 'outbound', description: 'Coasting outward on a solar-escape trajectory', source: 'https://science.nasa.gov/mission/pioneer-11/' },
} as const;

export type MovingMissionId = keyof typeof MISSION_MOTION;
export function isMovingMission(id: ArtifactId): id is MovingMissionId { return id in MISSION_MOTION; }

// Display sizes only: even the smallest planet must remain larger than a spacecraft.
export const SPACECRAFT_RADII = { kepler: 0.10, dawn: 0.08, 'near-shoemaker': 0.08, 'pioneer-10': 0.11, 'pioneer-11': 0.11 } as const;
export const CERES_RADIUS = 0.20;
export const EROS_RADIUS = 0.16;
export const DAWN_LOCAL_ORBIT = 0.55;
// Eros is the body visible in the overview, not the spacecraft resting on it.
export function missionSceneTarget(id: MovingMissionId): string {
  return id === 'near-shoemaker' ? 'eros' : id;
}

export function sampleMissionMotion(id: MovingMissionId, seconds: number) {
  const motion = MISSION_MOTION[id];
  const radius = motion.orbit + (motion.kind === 'outbound' ? motion.speed * seconds : 0);
  const phase = motion.angle - (motion.kind === 'outbound' ? 0 : motion.speed * seconds);
  const anchor: [number, number, number] = [radius * Math.cos(phase), id === 'kepler' ? 1.6 : 0.6, radius * Math.sin(phase)];
  const offset: [number, number, number] = id === 'dawn'
    ? [DAWN_LOCAL_ORBIT * Math.cos(seconds * 0.6), 0, DAWN_LOCAL_ORBIT * Math.sin(seconds * 0.6)]
    : [0, 0, 0]; // NEAR is represented by its host Eros, not a guessed landing pose.
  return { anchor, offset, hostRotation: id === 'near-shoemaker' ? seconds * 0.08 : 0 };
}

export const METEOR_COUNT = 9;
export function meteorTiming(index: number, elapsed: number) {
  const delay = 0.25 + index * 0.55;
  const period = 6.5 + (index % 4) * 1.2;
  const duration = 1.6 + (index % 3) * 0.25;
  const phase = elapsed - delay;
  const cycle = phase < 0 ? -1 : Math.floor(phase / period);
  const local = phase < 0 ? -1 : phase % period;
  const active = local >= 0 && local < duration;
  const progress = active ? local / duration : 0;
  const opacity = active ? Math.min(1, progress * 14) * Math.min(1, (1 - progress) * 9) : 0;
  return { active, progress, opacity, cycle };
}
