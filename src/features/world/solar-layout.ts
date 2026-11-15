// Display units, not astronomical distances. Each lane includes its moons/rings.
export const SOLAR_PLANETS = [
  { id: 'mercury', name: 'Mercury', orbit: 3, angle: 2.4, size: 0.22, color: '#9a8f85', speed: 0.28 },
  { id: 'venus', name: 'Venus', orbit: 4.8, angle: 4.1, size: 0.4, color: '#d9b26a', speed: 0.2 },
  { id: 'earth', name: 'Earth', orbit: 8, angle: 2, size: 0.72, color: '#669fd9', speed: 0.14 },
  { id: 'mars', name: 'Mars', orbit: 12.7, angle: 1.05, size: 0.68, color: '#bb7040', speed: 0.11 },
  { id: 'jupiter', name: 'Jupiter', orbit: 20.5, angle: 5.5, size: 1.1, color: '#c9a47a', speed: 0.065 },
  { id: 'saturn', name: 'Saturn', orbit: 29.5, angle: 2.7, size: 0.92, color: '#d8c48f', speed: 0.05 },
  { id: 'uranus', name: 'Uranus', orbit: 38, angle: 0.8, size: 0.6, color: '#9fd6dc', speed: 0.038 },
  { id: 'neptune', name: 'Neptune', orbit: 44.5, angle: 4, size: 0.58, color: '#4a6fd6', speed: 0.03 },
] as const;
export const EARTH = SOLAR_PLANETS[2];
export const MARS = SOLAR_PLANETS[3];
export const MOON = { distance: 1.7, size: 0.36 };
export const SOLAR_EXTENT = 52;
