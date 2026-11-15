// Headless unit checks: Three.js objects and camera-controls with an in-memory
// event target. This does not control a browser or interact with the user's UI.
import assert from 'node:assert/strict';
import * as THREE from 'three';
import CameraControls from 'camera-controls';
import { highlightObject } from './hover-highlight.ts';
import { followTargetMotion, syncCursorViewport } from './camera-navigation.ts';

const shared = new THREE.MeshStandardMaterial({ color: '#577b93', emissive: '#010203' });
const geometry = new THREE.SphereGeometry(1);
const body = new THREE.Mesh(geometry, shared);
const otherBody = new THREE.Mesh(geometry, shared);
const root = new THREE.Group();
root.add(body);
const hitArea = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 }));
hitArea.userData.skipHoverHighlight = true;
root.add(hitArea);
const originalColor = shared.color.clone();
const originalEmissive = shared.emissive.clone();
const restore = highlightObject(root);
assert.notEqual(body.material, shared, 'Only the hovered instance gets cloned lighting');
assert.equal(otherBody.material, shared, 'Do not brighten another object sharing a NASA material');
assert.ok(body.material.emissive.b > originalEmissive.b);
assert.ok(shared.color.equals(originalColor) && shared.emissive.equals(originalEmissive));
assert.equal(body.geometry, geometry, 'Never change the scientific model geometry');
assert.equal(body.material.map, shared.map, 'Keep the original surface texture');
const clone = body.material;
let disposed = false;
clone.addEventListener('dispose', () => { disposed = true; });
restore();
assert.equal(body.material, shared, 'Pointer-out restores the exact original material');
assert.ok(disposed, 'Release temporary hover materials');
const cleanup = highlightObject(root);
const replacement = new THREE.MeshStandardMaterial();
body.material = replacement;
cleanup();
assert.equal(body.material, replacement, 'An asynchronously loaded texture must not be reverted');

// camera-controls needs DOMRect but not a real DOM for wheel geometry tests.
globalThis.DOMRect = class {
  constructor(x = 0, y = 0, width = 0, height = 0) { Object.assign(this, { x, y, width, height }); }
  get left() { return this.x; } get right() { return this.x + this.width; }
  get top() { return this.y; } get bottom() { return this.y + this.height; }
};
CameraControls.install({ THREE });
class CanvasStub extends EventTarget {
  style = {};
  ownerDocument = new EventTarget();
  constructor(width, height) { super(); this.rect = new DOMRect(30, 20, width, height); }
  getBoundingClientRect() { return this.rect; }
  setAttribute() {} removeAttribute() {}
}
for (const [width, height, offsetX, offsetY] of [[1200, 700, 0, 0], [1200, 700, 220, 0], [480, 800, 0, 190]]) {
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 900);
  camera.position.set(0, 5, 10);
  const canvas = new CanvasStub(width, height);
  const controls = new CameraControls(camera, canvas);
  controls.dollyToCursor = true;
  controls.update(1 / 60);
  camera.setViewOffset(width, height, offsetX, offsetY, width, height);
  syncCursorViewport(controls, camera, width, height);
  camera.updateMatrixWorld();
  const pointer = new THREE.Vector2(-0.55, 0.3);
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(pointer, camera);
  const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(camera.getWorldDirection(new THREE.Vector3()), controls.getTarget(new THREE.Vector3()));
  const anchor = raycaster.ray.intersectPlane(plane, new THREE.Vector3());
  assert.ok(anchor);
  const initialDistance = controls.distance;
  for (const deltaY of [-120, 120]) {
    const wheel = new Event('wheel', { cancelable: true });
    Object.assign(wheel, { clientX: 30 + (pointer.x + 1) * width / 2, clientY: 20 + (1 - pointer.y) * height / 2, deltaY, deltaMode: 0, ctrlKey: false });
    canvas.dispatchEvent(wheel);
    for (let frame = 0; frame < 180; frame++) controls.update(1 / 60);
    camera.updateMatrixWorld();
    const screen = anchor.clone().project(camera);
    const error = Math.hypot((screen.x - pointer.x) * width / 2, (screen.y - pointer.y) * height / 2);
    assert.ok(error < 1, `${width}x${height} offset ${offsetX},${offsetY}: cursor drift ${error}px`);
    if (deltaY < 0) assert.ok(controls.distance < initialDistance, 'Wheel-in must zoom in');
  }
  const framing = controls.getTarget(new THREE.Vector3());
  const previousBody = new THREE.Vector3();
  const currentBody = new THREE.Vector3(2, 0.2, -1);
  followTargetMotion(controls, previousBody, currentBody, new THREE.Vector3());
  const relativeTarget = controls.getTarget(new THREE.Vector3()).sub(currentBody);
  assert.ok(relativeTarget.distanceTo(framing) < 1e-8, 'Tracking a moving planet must retain the cursor-zoom framing');
  controls.dispose();
}
console.log('interaction.check: isolated hover lighting/restoration, cursor zoom in/out, panel offsets and moving-body framing passed');
