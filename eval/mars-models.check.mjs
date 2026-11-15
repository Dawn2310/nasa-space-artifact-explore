import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { Box3, PerspectiveCamera, Vector3 } from 'three';
import { loadModelHeadless } from './load-model-headless.mjs';
import { loadMissionModel, fitModel } from '../mars-missions/mars-models.js';
import { articulateSojourner } from '../mars-missions/mars-sojourner.js';
import { createLanderOperation } from '../mars-missions/mars-lander-operations.js';
import { missions, modelDimensions } from '../mars-missions/mars-missions-data.js';
import { createReplay } from '../mars-missions/mars-mission-replay.js';

const asset = name => new URL(name === 'sojourner-dan.glb' ? '../public/assets/models/' + name : '../public/mars-assets/' + name, import.meta.url);
const loader = { loadAsync: loadModelHeadless };
function triangles(object) {
  let count = 0; object.traverse(part => { if (part.isMesh) count += (part.geometry.index?.count ?? part.geometry.attributes.position.count) / 3; }); return count;
}
function finite(object) {
  object.updateWorldMatrix(true, true);
  object.traverse(part => assert.ok(part.matrixWorld.elements.every(Number.isFinite), 'Finite transform: ' + part.name));
}
const registered = JSON.parse(readFileSync(new URL('../content/assets.json', import.meta.url))).assets.find(item => item.id === 'model-sojourner-dan');
const sojournerBytes = readFileSync(asset('sojourner-dan.glb'));
assert.equal(sojournerBytes.length, registered.fileSizeBytes);
assert.equal(createHash('sha256').update(sojournerBytes).digest('hex'), registered.sha256, 'Supplied source bytes match the recorded source checksum');
const original = await loadModelHeadless(asset('sojourner-dan.glb'));
const faceCount = triangles(original.scene);
const articulated = articulateSojourner(original.scene);
assert.equal(triangles(articulated), faceCount, 'Splitting the wheels preserves every original triangle');
let wheelCount = 0;
articulated.traverse(part => { if (/^suspension_.*_wheel$/.test(part.name)) { wheelCount++; assert.ok(triangles(part) > 0); } });
assert.equal(wheelCount, 6, 'All six Sojourner wheels are articulated');

for (const filename of Object.keys(modelDimensions)) {
  const loaded = await loadMissionModel(loader, asset, filename);
  const model = fitModel(loaded.scene, filename, modelDimensions[filename]);
  finite(model);
  const box = new Box3().setFromObject(model, true);
  assert.ok(box.min.y < .001 && box.min.y > -.1, filename + ': feet/wheels stay on ground');
  if (filename === 'sojourner-dan.glb') {
    const size = box.getSize(new Vector3());
    assert.ok(Math.abs(Math.max(size.x, size.z) - .63) < 1e-5, 'Sojourner uses the catalog length and uniform proportions');
  }
  if (filename === 'insight-deployed.glb') {
    const payloads = ['SEIS', 'WTS', 'HP3_v3d_baked'].map(name => model.getObjectByName(name));
    assert.ok(payloads.every(Boolean), 'InSight carries all three original science payloads');
    const scales = payloads.map(part => part.scale.clone());
    const operation = createLanderOperation(model, { id: 'insight', model: filename }, () => 0);
    assert.ok(operation, 'Arm and deployment hierarchy matches the supplied models');
    operation.prepare(2);
    for (let step = 0; step <= 90; step++) { operation.update(step / 90); finite(model); }
    for (const [i, part] of payloads.entries()) {
      const point = part.getWorldPosition(new Vector3());
      assert.ok(Math.abs(point.x - (i === 2 ? .43 : -.60)) < .01, part.name + ': final deployment X');
      assert.ok(Math.abs(point.z - (i === 2 ? 1.29 : 1.37)) < .01, part.name + ': final deployment Z');
      assert.ok(part.scale.distanceTo(scales[i]) < 1e-8, 'NASA payload proportions remain unchanged');
    }
    model.traverse(part => {
      if (part.isMesh && part.geometry.attributes.position.usage === 35048) {
        assert.ok(part.geometry.attributes.position.array.every(Number.isFinite), 'Tether geometry remains finite during deployment');
      }
    });
    operation.reset(); operation.dispose(); finite(model);
  }
  if (filename === 'viking.glb') {
    const operation = createLanderOperation(model, { id: 'viking-1', model: filename }, () => 0);
    assert.ok(operation, 'Original Viking sampler remains articulated');
    operation.update(.5); operation.reset(); finite(model);
  }
  // Exercise the actual replay against real model hierarchies using an in-memory
  // DOM shell. This is a logic/geometry test, not browser or visual automation.
  const elements = new Map();
  globalThis.document = { getElementById(id) {
    if (!elements.has(id)) elements.set(id, { textContent: '', disabled: false, hidden: false, addEventListener() {}, setAttribute() {}, replaceChildren() {} });
    return elements.get(id);
  } };
  const camera = new PerspectiveCamera(43, 16 / 9, .02, 160);
  camera.position.set(4.3, 2.4, 5.1);
  const controls = { target: new Vector3(), addEventListener() {} };
  let completed = 0;
  const replay = createReplay(camera, controls, false, { update() {}, hide() {} }, () => completed++);
  const replayModel = fitModel(loaded.scene, filename, modelDimensions[filename]);
  replay.open(missions.find(mission => mission.model === filename));
  replay.setTerrain(() => 0); replay.attach(replayModel);
  const begun = performance.now(); replay.autoplay();
  for (let time = 0; time <= 40000; time += 100) {
    replay.animate(begun + time); finite(replayModel);
    assert.ok(camera.position.toArray().every(Number.isFinite), 'Replay camera remains finite');
    assert.ok(camera.position.y > 0, 'Detail camera remains above the scene floor');
  }
  assert.equal(completed, 1, 'Completion is reported once, after all real replay stages');
  replay.reset(); replay.close();
  console.log('Geometry/assembly passed: ' + filename);
}
console.log('mars-models.check: real GLB parsing/Draco, Sojourner topology + six wheels, InSight IK/three payloads/tethers/reset and Viking sampler passed');
