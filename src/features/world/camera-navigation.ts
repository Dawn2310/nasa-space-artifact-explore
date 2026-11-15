import type CameraControls from 'camera-controls';
import type { PerspectiveCamera, Vector3 } from 'three';

/** Match the cursor calculation to the projection shifted around the chat panel. */
export function syncCursorViewport(controls: CameraControls, camera: PerspectiveCamera, width: number, height: number) {
  const view = camera.view;
  controls.setViewport(view?.enabled ? -view.offsetX : 0, view?.enabled ? view.offsetY : 0, width, height);
}

/** Carry the user's framing with a moving body, preserving a cursor-zoom offset. */
export function followTargetMotion(controls: CameraControls, previous: Vector3, current: Vector3, scratch: Vector3) {
  if (current.equals(previous)) return;
  controls.getTarget(scratch).add(current).sub(previous);
  void controls.moveTo(scratch.x, scratch.y, scratch.z, false);
  previous.copy(current);
}
