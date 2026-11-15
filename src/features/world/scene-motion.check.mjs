// Regression checks for mission relationships, not true distances or ephemerides.
// Run: node src/features/world/scene-motion.check.mjs
import assert from 'node:assert/strict';
import { PerspectiveCamera, Vector3 } from 'three';
import { BLACK_HOLES, CERES_RADIUS, DAWN_LOCAL_ORBIT, EROS_RADIUS, GALAXIES, MISSION_MOTION, METEOR_COUNT, SPACECRAFT_RADII, meteorTiming, missionSceneTarget, sampleMissionMotion } from './scene-motion.ts';
import { SOLAR_BODIES } from './solar-system.ts';
import { CAMERA_FOV_DEG, poseFor } from './layout.ts';

const radius = ([x, , z]) => Math.hypot(x, z);
const distance = (a, b) => Math.hypot(...a.map((value, i) => value - b[i]));
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-8, `${a} != ${b}`);

const planets = SOLAR_BODIES.filter((body) => body.parent === 'sun' && !['eros', 'ceres'].includes(body.id));
assert.equal(planets.length, 8, 'Keep all eight major planets available');
for (const [id, radius] of Object.entries(SPACECRAFT_RADII)) {
  assert.ok(planets.every((planet) => radius < planet.radius), `${id}: spacecraft must be smaller than every planet`);
}
assert.ok(EROS_RADIUS < Math.min(...planets.map((planet) => planet.radius)));
assert.ok(DAWN_LOCAL_ORBIT > CERES_RADIUS + SPACECRAFT_RADII.dawn, 'Dawn must remain outside Ceres');
assert.equal(missionSceneTarget('near-shoemaker'), 'eros', 'Selecting the asteroid must inspect Eros, not impersonate NEAR');
assert.equal(SOLAR_BODIES.find((body) => body.id === missionSceneTarget('near-shoemaker'))?.name, 'Eros');
for (const id of ['dawn', 'kepler', 'pioneer-10', 'pioneer-11']) assert.equal(missionSceneTarget(id), id);

const kepler0 = sampleMissionMotion('kepler', 0);
const kepler20 = sampleMissionMotion('kepler', 20);
near(radius(kepler0.anchor), radius(kepler20.anchor));
assert.ok(distance(kepler0.anchor, kepler20.anchor) > 1, 'Kepler must orbit, not stay fixed');
assert.ok(MISSION_MOTION.kepler.speed < 0.14, 'Kepler must drift behind Earth, not stay locked to it');
assert.equal(MISSION_MOTION.kepler.kind, 'solar-orbit', 'Kepler is not an Earth satellite');

const dawn0 = sampleMissionMotion('dawn', 0);
const dawn20 = sampleMissionMotion('dawn', 20);
near(radius(dawn0.offset), radius(dawn20.offset));
assert.ok(distance(dawn0.offset, dawn20.offset) > 0.1, 'Dawn must orbit its host body');
assert.ok(distance(dawn0.anchor, dawn20.anchor) > 1, 'Ceres carries Dawn around the Sun');

const near0 = sampleMissionMotion('near-shoemaker', 0);
const near20 = sampleMissionMotion('near-shoemaker', 20);
assert.deepEqual(near0.offset, near20.offset, 'Landed NEAR must remain fixed relative to Eros');
assert.ok(distance(near0.anchor, near20.anchor) > 1, 'Eros itself must continue moving');
assert.notEqual(near0.hostRotation, near20.hostRotation, 'The Eros host itself must rotate');
assert.deepEqual(near0.offset, [0, 0, 0], 'Do not invent a landing pose on the Eros mesh');

// At the overview camera the galaxy centers occupy opposite diagonal corners.
// They stay in world space, so turning the camera must change their screen positions.
const overview = poseFor('solar', 1536, 730);
const camera = new PerspectiveCamera(CAMERA_FOV_DEG, 1536 / 730, 0.01, 900);
camera.position.set(...overview.position);
camera.lookAt(0, 0, 0);
camera.updateMatrixWorld();
const centers = GALAXIES.map(({ position }) => new Vector3(...position).project(camera));
assert.ok(centers[0].x < 0 && centers[0].y > 0);
assert.ok(centers[1].x > 0 && centers[1].y < 0);
const visible = ({ x, y, z }) => Math.abs(x) < 1 && Math.abs(y) < 1 && z > -1 && z < 1;
assert.ok(centers.slice(0, 2).every(visible));
assert.ok(centers.slice(2).every((p) => !visible(p)), 'Additional galaxies should be discovered around the back, not crowd the first view');
assert.ok(GALAXIES[1].scale < GALAXIES[0].scale);
camera.lookAt(12, 0, 0);
camera.updateMatrixWorld();
assert.ok(Math.abs(new Vector3(...GALAXIES[0].position).project(camera).x - centers[0].x) > 0.1,
  'The background must not be attached to the camera');

// Check actual perspective visibility around a complete orbit, not just coordinates.
assert.equal(GALAXIES.length, 4, 'Keep the scene sparse: four galaxies total');
assert.equal(BLACK_HOLES.length, 2, 'Keep only two black-hole visualizations');
const scenery = [...GALAXIES, ...BLACK_HOLES];
const discovered = new Set();
for (let degrees = 0; degrees < 360; degrees += 15) {
  const angle = degrees * Math.PI / 180;
  camera.position.set(overview.position[2] * Math.sin(angle), overview.position[1], overview.position[2] * Math.cos(angle));
  camera.lookAt(0, 0, 0); camera.updateMatrixWorld();
  scenery.forEach((object, i) => {
    assert.ok(new Vector3(...object.position).length() > 400, 'Scenery remains far outside the planet lanes');
    if (visible(new Vector3(...object.position).project(camera))) discovered.add(i);
  });
}
assert.equal(discovered.size, scenery.length, 'Every galaxy and black hole must be visible somewhere along the 360-degree orbit');

for (const id of ['pioneer-10', 'pioneer-11']) {
  const first = sampleMissionMotion(id, 0).anchor;
  const later = sampleMissionMotion(id, 90).anchor;
  assert.ok(radius(later) > radius(first), `${id} must head outward`);
  near(Math.atan2(first[2], first[0]), Math.atan2(later[2], later[0]));
  assert.equal(MISSION_MOTION[id].kind, 'outbound');
}

let activeTotal = 0;
let frames = 0;
let maxActive = 0;
for (let t = 6; t < 60; t += 0.05) {
  let active = 0;
  for (let i = 0; i < METEOR_COUNT; i++) {
    const state = meteorTiming(i, t);
    assert.ok(state.opacity >= 0 && state.opacity <= 1);
    assert.ok(state.progress >= 0 && state.progress <= 1);
    active += Number(state.active);
  }
  activeTotal += active;
  frames++;
  maxActive = Math.max(maxActive, active);
}
assert.ok(activeTotal / frames >= 1.5, 'Meteor shower should remain clearly visible, not mostly empty');
assert.ok(maxActive >= 3, 'Multiple meteor trails should overlap during the shower');
assert.equal(meteorTiming(0, 0).active, false);
assert.equal(meteorTiming(0, 0.5).active, true);
assert.ok(meteorTiming(0, 7).cycle > meteorTiming(0, 0.5).cycle);

console.log(`scene-motion.check: all assertions passed; meteors average ${(activeTotal / frames).toFixed(2)}, peak ${maxActive}`);
