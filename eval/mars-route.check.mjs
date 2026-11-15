import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { missions, modelDimensions } from '../mars-missions/mars-missions-data.js';
import { machinesOf, machinePlan, worldPlan } from '../src/features/voyage/script.ts';
import { terrainSites } from '../mars-missions/mars-site-terrain.js';

const catalog = JSON.parse(readFileSync(new URL('../content/catalog.json', import.meta.url)));
const assets = JSON.parse(readFileSync(new URL('../content/assets.json', import.meta.url))).assets;
const facts = JSON.parse(readFileSync(new URL('../content/facts.json', import.meta.url)));
const expected = catalog.artifacts.filter(a => a.body === 'mars').map(a => a.id).sort();
assert.equal(expected.length, 8);
assert.equal(catalog.artifacts.find(a => a.body === 'mars').id, 'insight', 'Demo: InSight leads Mars lists');
assert.equal(missions[0].id, 'insight', 'Demo: InSight leads the native Mars mission list');
assert.equal(machinesOf('mars')[0].artifactId, 'insight', 'Demo: InSight leads the flight chooser');
assert.equal(worldPlan('mars').stops.find(stop => stop.artifactId)?.artifactId, 'insight', 'Demo: visit InSight first after boarding');
assert.equal(machinePlan('insight').stops[0].lines[0].speaker, 'insight', 'InSight speaks first on entry, without waiting for an Echo introduction');
assert.deepEqual(missions.map(m => m.id).sort(), expected, 'Direct Mars map must include every catalog machine');
assert.deepEqual(machinesOf('mars').map(m => m.artifactId).sort(), expected, 'UFO route must offer the same machines');
for (const mission of missions) {
  const hop = machinePlan(mission.id);
  assert.equal(hop.stops[0].scene.mission, mission.id, 'UFO opens the same detail, not the globe or another rover');
  assert.ok(worldPlan('mars').stops.some(stop => stop.scene.mission === mission.id));
  if (mission.model) {
    const modelPath = mission.model === 'sojourner-dan.glb' ? '../public/assets/models/' : '../public/mars-assets/';
    assert.ok(existsSync(new URL(modelPath + mission.model, import.meta.url)));
    assert.ok(modelDimensions[mission.model]?.meters > 0);
    assert.ok(terrainSites[mission.id]);
  } else {
    const artifact = catalog.artifacts.find(a => a.id === mission.id);
    const image = assets.find(a => a.id === artifact.imageAssetId);
    assert.ok(image && existsSync(new URL('../public/assets/' + image.localPath, import.meta.url)));
  }
  for (const line of hop.stops[0].lines) for (const factId of line.factIds) {
    assert.ok(facts.some(f => f.id === factId), 'Story fact exists: ' + factId);
  }
}
const sojourner = missions.find(m => m.id === 'sojourner');
assert.equal(sojourner.model, 'sojourner-dan.glb');
assert.equal(sojourner.viewer, undefined, 'No external white-background viewer remains in the Sojourner route');
assert.equal(new URL(sojourner.modelLicense).hostname, 'creativecommons.org');
assert.match(sojourner.credit, /not NASA/);
assert.equal(missions.find(m => m.id === 'phoenix').model, null, 'Do not invent or substitute a Phoenix model');
console.log('mars-route.check: all 8 Mars machines match catalog/direct/UFO routes; model files, terrain, photos and story facts valid');
