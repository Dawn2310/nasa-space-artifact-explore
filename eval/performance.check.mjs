import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { renderPixelRatio, allowHdrSky } from '../src/shared/render-budget.ts';
import { createMissionNavigation } from '../src/shared/mission-navigation.ts';

const desktop = { width: 1440, devicePixelRatio: 2, hardwareConcurrency: 8, deviceMemory: 8 };
assert.equal(renderPixelRatio(desktop), 1.5);
assert.equal(renderPixelRatio({ ...desktop, width: 390, devicePixelRatio: 3 }), 1.25);
assert.equal(renderPixelRatio({ ...desktop, devicePixelRatio: 1 }), 1);
assert.equal(renderPixelRatio({ ...desktop, deviceMemory: 4 }), 1.25);
assert.equal(allowHdrSky(desktop), true);
assert.equal(allowHdrSky({ ...desktop, width: 390 }), false);
assert.equal(allowHdrSky({ ...desktop, deviceMemory: 4 }), false);
assert.equal(allowHdrSky({ ...desktop, hardwareConcurrency: 4 }), false);
assert.equal(allowHdrSky({ ...desktop, connection: { saveData: true } }), false);
assert.equal(allowHdrSky({ ...desktop, connection: { effectiveType: '3g' } }), false);

const parent = {}, stranger = {};
const missions = [{ id: 'insight' }, { id: 'viking-1' }];
let active = missions[0];
const actions = [];
const navigate = createMissionNavigation({
  origin: 'https://example.netlify.app', parent, missions, current: () => active,
  close: () => { actions.push('close'); active = null; },
  open: mission => { actions.push(mission.id); active = mission; },
});
const message = (id, overrides = {}) => ({ origin: 'https://example.netlify.app', source: parent,
  data: { type: 'nasa:open-mission', missionId: id }, ...overrides });
navigate(message('insight'));
assert.deepEqual(actions, [], 'Initial load sync must not restart the existing model/narration');
navigate(message('viking-1', { origin: 'https://elsewhere.example' }));
navigate(message('viking-1', { source: stranger }));
navigate(message('missing'));
navigate(message('viking-1', { data: null }));
assert.deepEqual(actions, [], 'Only a valid same-origin parent can switch missions');
navigate(message('viking-1'));
navigate(message('insight'));
assert.deepEqual(actions, ['close', 'viking-1', 'close', 'insight'], 'Navigate both ways inside the existing document');

const html = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
const urls = [...new Set([...html.matchAll(/(?:src|href)="(\/assets\/[^\"]+\.js)"/g)].map(match => match[1]))];
let raw = 0, gzip = 0;
for (const url of urls) {
  const data = readFileSync(new URL('../dist' + url, import.meta.url));
  raw += data.byteLength; gzip += gzipSync(data).byteLength;
}
// Before this change: 1,605 KiB raw / 427.6 KiB gzip in entry + module-preload JS.
assert.ok(raw < 1120 * 1024, `Initial JS exceeds the 1,120 KiB budget: ${raw / 1024}`);
console.log(`performance.check: navigation/duplicate guards and device budgets passed; initial JS ${Math.round(raw / 1024)} KiB raw / ${Math.round(gzip / 1024)} KiB gzip`);
console.log(`Original HDR deferred from startup: ${(statSync(new URL('../public/assets/images/starfield-gaia-2020.exr', import.meta.url)).size / 1048576).toFixed(2)} MiB`);
