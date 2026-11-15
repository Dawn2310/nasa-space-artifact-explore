import assert from 'node:assert/strict';
import { PerspectiveCamera, Vector3 } from 'three';
import { EARTH, MOON, SOLAR_EXTENT, SOLAR_PLANETS } from './solar-layout.ts';
import { SOLAR_MOONS } from './solar-system.ts';
import { CERES_RADIUS, DAWN_LOCAL_ORBIT, EROS_RADIUS, MISSION_MOTION, SPACECRAFT_RADII } from './scene-motion.ts';
import { CAMERA_FOV_DEG, poseFor } from './layout.ts';
import { cockpitDock, sampleUfoFlight, ufoDock } from './ufo-flight.ts';

const envelope = (planet) => Math.max(planet.size * (planet.id === 'saturn' ? 2.5 : 1.12),
  planet.id === 'earth' ? MOON.distance + MOON.size : 0,
  ...SOLAR_MOONS.filter((moon) => moon.parent === planet.id).map((moon) => moon.orbit + moon.radius));
for (let i = 1; i < SOLAR_PLANETS.length; i++) {
  const inner = SOLAR_PLANETS[i - 1], outer = SOLAR_PLANETS[i];
  assert.ok(outer.orbit - inner.orbit > envelope(inner) + envelope(outer) + 0.4,
    `${inner.name}/${outer.name}: whole moon/ring systems must not intersect at any orbital phase`);
}
assert.ok(SOLAR_PLANETS[0].orbit > 1.3 + SOLAR_PLANETS[0].size + 0.4);
for (const [id, radius] of [['near-shoemaker', EROS_RADIUS], ['dawn', Math.max(CERES_RADIUS, DAWN_LOCAL_ORBIT + SPACECRAFT_RADII.dawn)]]) {
  for (const planet of SOLAR_PLANETS) {
    assert.ok(Math.abs(MISSION_MOTION[id].orbit - planet.orbit) > radius + envelope(planet) + 0.3, `${id}/${planet.id}: host system clearance`);
  }
}
assert.ok(1.6 - (0.25 + MOON.size) > SPACECRAFT_RADII.kepler, 'Kepler display plane stays clear of the Earth/Moon system');
for (const [width, height] of [[1536, 730], [984, 632], [390, 760]]) {
  const pose = poseFor('solar', width, height);
  const camera = new PerspectiveCamera(CAMERA_FOV_DEG, width / height, 0.01, 900);
  camera.position.set(...pose.position); camera.lookAt(0, 0, 0); camera.updateMatrixWorld();
  for (let angle = 0; angle < Math.PI * 2; angle += 0.03) {
    const p = new Vector3(SOLAR_EXTENT * Math.cos(angle), 0, SOLAR_EXTENT * Math.sin(angle)).project(camera);
    assert.ok(Math.abs(p.x) < 1 && Math.abs(p.y) < 1, `${width}x${height}: all orbital lanes fit the overview`);
  }
}
const start = new Vector3(EARTH.orbit, 3, 0);
const dock = ufoDock(new Vector3(-12, 0, -5), 0.7, new Vector3());
assert.ok(sampleUfoFlight(start, dock, 0, new Vector3()).distanceTo(start) < 1e-8);
assert.ok(sampleUfoFlight(start, dock, 1, new Vector3()).distanceTo(dock) < 1e-8);
assert.ok(sampleUfoFlight(start, dock, 0.5, new Vector3()).y > 8, 'UFO flight clears the busy orbital plane');
const movingDock = dock.clone().add(new Vector3(1, 0, 1));
assert.ok(sampleUfoFlight(start, movingDock, 1, new Vector3()).distanceTo(movingDock) < 1e-8, 'Arrival follows the moving object, not its old position');
for (const radius of [.08, .36, .68, 1.1]) {
  const center = new Vector3(12, .6, 3);
  const dock = cockpitDock(center, radius, start, new Vector3());
  assert.ok(dock.distanceTo(center) > radius * 2, 'Cabin eye stays outside destination geometry');
  assert.ok(Math.hypot(dock.x - center.x, dock.z - center.z) > 0.5, 'Forward view avoids a vertical-camera singularity');
  const camera = new PerspectiveCamera(CAMERA_FOV_DEG, 16 / 9, .01, 1600);
  for (const t of [0, .25, .5, .75, 1]) {
    sampleUfoFlight(start, dock, t, camera.position); camera.lookAt(center); camera.updateMatrixWorld();
    const target = center.clone().project(camera);
    assert.ok(Math.abs(target.x) < 1e-7 && Math.abs(target.y) < 1e-7, 'Moving destination stays centered through the cockpit windshield');
  }
}
console.log('solar-layout.check: planet/moon/ring clearances, asteroid systems, overview framing and moving UFO arrival passed');
