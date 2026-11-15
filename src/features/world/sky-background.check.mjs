// Check the actual sky geometry's photographic projection, not browser pixels.
import assert from 'node:assert/strict';
import { makeSkyGeometry, panoramaUv } from './sky-background.ts';

const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-7, `${actual} != ${expected}`);
const [coreU, coreV] = panoramaUv(0, 0);
near(coreU, 0.5); near(coreV, 0.5);
for (const sign of [-1, 1]) {
  const pole = panoramaUv(0, sign * Math.PI / 2);
  near(pole[0], 0.5); near(pole[1], sign > 0 ? 1 : 0);
  const edge = panoramaUv(sign * Math.PI, 0);
  near(edge[0], sign > 0 ? 1 : 0); near(edge[1], 0.5);
}

// Independently invert Hammer coordinates to check longitude/latitude round trips.
for (let longitude = -Math.PI; longitude <= Math.PI; longitude += 0.13) {
  for (let latitude = -1.5; latitude <= 1.5; latitude += 0.09) {
    const [u, v] = panoramaUv(longitude, latitude);
    const x = (u - 0.5) * 4 * Math.SQRT2;
    const y = (v - 0.5) * 2 * Math.SQRT2;
    const z = Math.sqrt(Math.max(0, 1 - x * x / 16 - y * y / 4));
    near(2 * Math.atan2(z * x, 2 * (2 * z * z - 1)), longitude);
    near(Math.asin(z * y), latitude);
  }
}
const geometry = makeSkyGeometry();
const photo = geometry.getAttribute('panoramaUv');
assert.equal(photo.count, geometry.getAttribute('position').count);
for (let i = 0; i < photo.count; i++) {
  const x = photo.getX(i) * 2 - 1;
  const y = photo.getY(i) * 2 - 1;
  assert.ok(Number.isFinite(x) && Number.isFinite(y));
  assert.ok(x * x + y * y <= 1.000001, 'Do not sample the image\'s black corners or copyright caption as sky');
}
geometry.dispose();
console.log('sky-background.check: photographic projection round trips, poles/seam and all sky vertices passed');
