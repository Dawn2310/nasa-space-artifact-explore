import type { Object3D } from 'three';
import { CERES_RADIUS, EROS_RADIUS } from './scene-motion.ts';

export interface InspectionTarget {
  object: Object3D;
  radius: number;
}
export type InspectionTargets = Map<string, InspectionTarget>;

export interface SolarBody {
  id: string;
  name: string;
  parent: string;
  radius: number;
  source: string;
}

export interface SolarMoon extends SolarBody {
  orbit: number;
  phase: number;
  speed: number;
  textureUrl?: string;
  modelUrl?: string;
}

// Selected moons, not a complete inventory. Sizes, spacing and speeds are for display.
// Parent relationships are from NASA; no live ephemerides or real-time positions are claimed.
export const SOLAR_MOONS: SolarMoon[] = [
  { id: 'phobos', name: 'Phobos', parent: 'mars', radius: 0.12, orbit: 1.1, phase: 0.5, speed: 0.6, modelUrl: '/assets/models/moon-phobos.glb', source: 'https://science.nasa.gov/mars/moons/phobos/' },
  { id: 'deimos', name: 'Deimos', parent: 'mars', radius: 0.09, orbit: 1.5, phase: 3, speed: 0.38, modelUrl: '/assets/models/moon-deimos.glb', source: 'https://science.nasa.gov/mars/moons/deimos/' },
  { id: 'io', name: 'Io', parent: 'jupiter', radius: 0.16, orbit: 1.65, phase: 0, speed: 0.55, source: 'https://science.nasa.gov/jupiter/moons/io/' },
  { id: 'europa', name: 'Europa', parent: 'jupiter', radius: 0.15, orbit: 2.05, phase: 1.8, speed: 0.42, source: 'https://science.nasa.gov/jupiter/moons/europa/' },
  { id: 'ganymede', name: 'Ganymede', parent: 'jupiter', radius: 0.22, orbit: 2.5, phase: 3.2, speed: 0.3, source: 'https://science.nasa.gov/jupiter/moons/ganymede/' },
  { id: 'callisto', name: 'Callisto', parent: 'jupiter', radius: 0.2, orbit: 3, phase: 5, speed: 0.21, source: 'https://science.nasa.gov/jupiter/moons/callisto/' },
  { id: 'enceladus', name: 'Enceladus', parent: 'saturn', radius: 0.13, orbit: 2.6, phase: 0.7, speed: 0.42, source: 'https://science.nasa.gov/saturn/moons/enceladus/' },
  { id: 'titan', name: 'Titan', parent: 'saturn', radius: 0.24, orbit: 3.3, phase: 3.5, speed: 0.2, source: 'https://science.nasa.gov/saturn/moons/titan/' },
  { id: 'miranda', name: 'Miranda', parent: 'uranus', radius: 0.12, orbit: 1.05, phase: 1.2, speed: 0.42, source: 'https://science.nasa.gov/uranus/moons/miranda/' },
  { id: 'titania', name: 'Titania', parent: 'uranus', radius: 0.16, orbit: 1.6, phase: 4, speed: 0.25, source: 'https://science.nasa.gov/uranus/moons/titania/' },
  { id: 'triton', name: 'Triton', parent: 'neptune', radius: 0.2, orbit: 1.3, phase: 2.1, speed: -0.3, source: 'https://science.nasa.gov/neptune/moons/triton/' },
].map((moon) => ({ ...moon, textureUrl: 'modelUrl' in moon ? undefined : `/assets/textures/${moon.id}.jpg` }));

export const SOLAR_BODIES: SolarBody[] = [
  { id: 'sun', name: 'Sun', parent: '', radius: 1.3, source: 'https://science.nasa.gov/sun/' },
  ...[
    ['mercury', 'Mercury', 0.22], ['venus', 'Venus', 0.4], ['earth', 'Earth', 0.72],
    ['mars', 'Mars', 0.68], ['jupiter', 'Jupiter', 1.1], ['saturn', 'Saturn', 0.92],
    ['uranus', 'Uranus', 0.6], ['neptune', 'Neptune', 0.58],
  ].map(([id, name, radius]) => ({ id: String(id), name: String(name), radius: Number(radius), parent: 'sun', source: `https://science.nasa.gov/${id}/` })),
  { id: 'moon', name: 'Moon', parent: 'earth', radius: 0.36, source: 'https://science.nasa.gov/moon/' },
  { id: 'eros', name: 'Eros', parent: 'sun', radius: EROS_RADIUS, source: 'https://science.nasa.gov/mission/near-shoemaker/' },
  { id: 'ceres', name: 'Ceres', parent: 'sun', radius: CERES_RADIUS, source: 'https://science.nasa.gov/dwarf-planets/ceres/' },
  ...SOLAR_MOONS,
];
