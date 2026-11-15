// Một CameraControls cho cả ba tầng: chuyển cảnh ~1.5 giây và dịch khung nhìn để
// model nằm giữa vùng không bị panel của UI che.

import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { CameraControls, CameraControlsImpl } from '@react-three/drei';
import { Vector3 } from 'three';
import type { PerspectiveCamera } from 'three';
import type { ViewState } from '../../shared/contracts';
import { freeArea, poseFor } from './layout';
import type { InspectionTargets } from './solar-system';
import { followTargetMotion, syncCursorViewport } from './camera-navigation';

/** smoothTime của camera-controls; chuyển động lắng hẳn sau khoảng 3–4 lần giá trị này (~1.5 giây). */
const TRANSITION_SMOOTH_TIME = 0.42;
const DEPTH = { solar: 0, surface: 1, artifact: 2 } as const;

function keyOf(view: ViewState): string {
  if (view.level === 'surface') return `surface:${view.body}`;
  if (view.level === 'artifact') return `artifact:${view.artifactId}`;
  return 'solar';
}

export function CameraRig({ view, focusId, targets, flightId }: {
  view: ViewState;
  focusId: string | null;
  targets: InspectionTargets;
  flightId?: string;
}) {
  const controlsRef = useRef<CameraControlsImpl>(null);
  const previous = useRef<{ key: string | null; depth: number }>({ key: null, depth: 0 });
  const offset = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const width = useThree((state) => state.size.width);
  const height = useThree((state) => state.size.height);
  const level = view.level;
  const key = keyOf(view);
  const focusPosition = useRef(new Vector3());
  const previousFocus = useRef(new Vector3());
  const trackedTarget = useRef(new Vector3());
  const focused = level === 'solar' ? focusId : null;

  useEffect(() => {
    if (!focused) return;
    const controls = controlsRef.current;
    const target = targets.get(focused);
    if (!controls || !target) return;
    const center = target.object.getWorldPosition(focusPosition.current);
    previousFocus.current.copy(center);
    const distance = Math.max(target.radius * 4.5, 0.4);
    controls.minDistance = target.radius * 1.2;
    controls.maxDistance = 150;
    void controls.setLookAt(center.x + distance * 0.55, center.y + distance * 0.4, center.z + distance,
      center.x, center.y, center.z, true);
  }, [focused, targets]);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    if (flightId) {
      controls.stop();
      controls.minDistance = 0.02;
      controls.maxDistance = 2000;
      return; // UfoNavigator owns the eye/forward target throughout a flight.
    }
    if (focused) return;
    const pose = poseFor(level, width, height);
    const [x, y, z] = pose.position;

    controls.smoothTime = TRANSITION_SMOOTH_TIME;
    // Wheel/pinch may move the orbit center toward the pointer; dragging rotates.
    controls.mouseButtons.right = CameraControlsImpl.ACTION.NONE;
    controls.mouseButtons.middle = CameraControlsImpl.ACTION.DOLLY;
    controls.touches.two = CameraControlsImpl.ACTION.TOUCH_DOLLY;
    controls.touches.three = CameraControlsImpl.ACTION.NONE;
    // Allow close inspection while keeping the camera outside the displayed body.
    controls.minDistance = level === 'solar' ? 1.65 : level === 'surface' ? 2.08 : 1.15;
    controls.maxDistance = pose.distance * 3;

    if (previous.current.key !== key) {
      // Đi sâu vào: bắt đầu từ xa rồi tiến lại. Quay ra: bắt đầu gần rồi lùi ra.
      const first = previous.current.key === null;
      const factor = first ? 1.3 : DEPTH[level] > previous.current.depth ? 2.6 : 0.5;
      void controls.setLookAt(x * factor, y * factor, z * factor, 0, 0, 0, false);
      previous.current = { key, depth: DEPTH[level] };
    }
    void controls.setLookAt(x, y, z, 0, 0, 0, true);
  }, [key, level, width, height, focused, flightId]);

  useFrame((state, delta) => {
    if (flightId) return;
    if (focused) {
      const target = targets.get(focused);
      if (target && controlsRef.current) {
        const center = target.object.getWorldPosition(focusPosition.current);
        followTargetMotion(controlsRef.current, previousFocus.current, center, trackedTarget.current);
      }
    }
    const camera = state.camera as PerspectiveCamera;
    const area = freeArea(level, width, height);
    const target = { offsetX: area.offsetX / width, offsetY: area.offsetY / height };
    const current = offset.current;
    const ease = 1 - Math.exp(-delta * 4);
    const nextX = Math.abs(target.offsetX - current.x) < 0.0005 ? target.offsetX : current.x + (target.offsetX - current.x) * ease;
    const nextY = Math.abs(target.offsetY - current.y) < 0.0005 ? target.offsetY : current.y + (target.offsetY - current.y) * ease;
    if (nextX === current.x && nextY === current.y && width === current.width && height === current.height) return;
    offset.current = { x: nextX, y: nextY, width, height };
    if (nextX === 0 && nextY === 0) camera.clearViewOffset();
    else camera.setViewOffset(width, height, nextX * width, nextY * height, width, height);
    if (controlsRef.current) syncCursorViewport(controlsRef.current, camera, width, height);
  });

  return <CameraControls ref={controlsRef} makeDefault dollyToCursor enabled={!flightId} />;
}
