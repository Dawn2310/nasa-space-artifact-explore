// Kiểm tra latLonToVec3 bằng node thuần (Node >= 22.18 tự bỏ kiểu TypeScript):
//   node src/features/world/geo.check.mjs
import assert from 'node:assert/strict';
import {
  MARS_TEXTURE_LEFT_EDGE_LON_EAST_DEG as MARS_EDGE,
  latLonToTexturePixel,
  latLonToVec3,
  parseConvention,
  toEastLongitudeDeg,
} from './geo.ts';

const EAST_360 = 'planetocentric, east-positive, 0-360';
const near = (a, b, eps = 1e-6) => assert.ok(Math.abs(a - b) < eps, `${a} != ${b}`);
const nearVec = (a, b, eps = 1e-6) => a.forEach((v, i) => near(v, b[i], eps));

// Tái tạo đỉnh của THREE.SphereGeometry tại (u, v) để chứng minh marker trùng điểm ảnh texture.
function sphereGeometryVertex(u, v, r) {
  const phi = u * 2 * Math.PI;
  const theta = v * Math.PI;
  return [-r * Math.cos(phi) * Math.sin(theta), r * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta)];
}

// 1. parseConvention
assert.equal(parseConvention(EAST_360).eastPositive, true);
assert.equal(parseConvention(EAST_360).range, '0-360');
assert.equal(parseConvention('planetographic, west-positive, 0-360').eastPositive, false);
assert.equal(parseConvention('MOCK approx; planetocentric, east-positive, -180..180').range, '-180-180');
assert.equal(parseConvention('positive east, ±180').eastPositive, true);
assert.equal(parseConvention('unknown').directionStated, false);

// 2. Chuẩn hóa kinh độ
near(toEastLongitudeDeg(226.2, EAST_360), -133.8);
near(toEastLongitudeDeg(133.8, 'planetographic, west-positive, 0-360'), -133.8);
near(toEastLongitudeDeg(-23.4, 'east-positive, -180..180'), -23.4);

// 3. Các hướng chính (mép trái ảnh = -180 => kinh độ 0 nằm ở +X, 90°E ở -Z)
nearVec(latLonToVec3(0, 0, 1, EAST_360, -180), [1, 0, 0]);
nearVec(latLonToVec3(0, 90, 1, EAST_360, -180), [0, 0, -1]);
nearVec(latLonToVec3(0, 180, 1, EAST_360, -180), [-1, 0, 0]);
nearVec(latLonToVec3(0, 270, 1, EAST_360, -180), [0, 0, 1]);
nearVec(latLonToVec3(90, 123, 1, EAST_360, -180), [0, 1, 0]);

// 4. Olympus Mons: 18.65°N, 226.2°E
const R = 2;
const olympus = latLonToVec3(18.65, 226.2, R, EAST_360, MARS_EDGE);
near(Math.hypot(...olympus), R);
near(olympus[1], R * Math.sin((18.65 * Math.PI) / 180));
// Cùng điểm, ba cách viết quy ước phải ra cùng một vector.
nearVec(latLonToVec3(18.65, -133.8, R, 'east-positive, -180..180', MARS_EDGE), olympus);
nearVec(latLonToVec3(18.65, 133.8, R, 'planetographic, west-positive, 0-360', MARS_EDGE), olympus);
// Marker trùng đúng đỉnh cầu mang điểm ảnh đó của texture.
const [px, py] = latLonToTexturePixel(18.65, 226.2, EAST_360, MARS_EDGE, 1440, 720);
nearVec(sphereGeometryVertex(px / 1440, py / 720, R), olympus);
// Điểm ảnh dự đoán khớp chỗ nhìn thấy miệng núi lửa trong mars.jpg (x≈185, y≈285), sai số đọc ±15 px.
assert.ok(Math.abs(px - 185) < 15 && Math.abs(py - 285) < 15, `Olympus pixel ${px},${py}`);

// 5. Điểm ở bán cầu bị che: đối cực của Olympus Mons (18.65°S, 46.2°E)
const antipode = latLonToVec3(-18.65, 46.2, R, EAST_360, MARS_EDGE);
nearVec(antipode, olympus.map((v) => -v));
// Camera nhìn thẳng vào Olympus Mons => tích vô hướng âm nghĩa là điểm kia bị globe che.
const dot = olympus[0] * antipode[0] + olympus[1] * antipode[1] + olympus[2] * antipode[2];
assert.ok(dot < 0);
// Hellas (42°S, 70°E) cũng ở bán cầu khác với Olympus Mons.
const hellas = latLonToVec3(-42, 70, R, EAST_360, MARS_EDGE);
assert.ok(olympus[0] * hellas[0] + olympus[1] * hellas[1] + olympus[2] * hellas[2] < 0);
const [hx, hy] = latLonToTexturePixel(-42, 70, EAST_360, MARS_EDGE, 1440, 720);
assert.ok(Math.abs(hx - 990) < 25 && Math.abs(hy - 525) < 25, `Hellas pixel ${hx},${hy}`);

// 6. Quay globe quanh trục Y: marker (con của globe) quay theo, vẫn nằm trên mặt cầu.
const theta = 1.1;
const rotated = [
  olympus[0] * Math.cos(theta) + olympus[2] * Math.sin(theta),
  olympus[1],
  -olympus[0] * Math.sin(theta) + olympus[2] * Math.cos(theta),
];
near(Math.hypot(...rotated), R);

console.log('geo.check: all assertions passed');
console.log(`Olympus Mons -> pixel (${px.toFixed(1)}, ${py.toFixed(1)}), vec3 [${olympus.map((v) => v.toFixed(3)).join(', ')}]`);
console.log(`Hellas       -> pixel (${hx.toFixed(1)}, ${hy.toFixed(1)})`);
