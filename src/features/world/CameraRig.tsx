// Một CameraControls cho cả ba tầng: chuyển cảnh ~1.5 giây và dịch khung nhìn để
// model nằm giữa vùng không bị panel của UI che.

import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { CameraControls, CameraControlsImpl } from '@react-three/drei';
import type { PerspectiveCamera } from 'three';
import type { ViewState } from '../../shared/contracts';
import { freeArea, poseFor } from './layout';

/** smoothTime của camera-controls; chuyển động lắng hẳn sau khoảng 3–4 lần giá trị này (~1.5 giây). */
const TRANSITION_SMOOTH_TIME = 0.42;
const DEPTH = { solar: 0, surface: 1, artifact: 2 } as const;

function keyOf(view: ViewState): string {
  if (view.level === 'surface') return `surface:${view.body}`;
  if (view.level === 'artifact') return `artifact:${view.artifactId}`;
  return 'solar';
}

export function CameraRig({ view }: { view: ViewState }) {
  const controlsRef = useRef<CameraControlsImpl>(null);
  const previous = useRef<{ key: string | null; depth: number }>({ key: null, depth: 0 });
  const offset = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const width = useThree((state) => state.size.width);
  const height = useThree((state) => state.size.height);
  const level = view.level;
  const key = keyOf(view);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    const pose = poseFor(level, width, height);
    const [x, y, z] = pose.position;

    controls.smoothTime = TRANSITION_SMOOTH_TIME;
    // Không cho kéo lệch tâm: mọi cảnh xoay quanh gốc tọa độ.
    controls.mouseButtons.right = CameraControlsImpl.ACTION.NONE;
    controls.mouseButtons.middle = CameraControlsImpl.ACTION.DOLLY;
    controls.touches.two = CameraControlsImpl.ACTION.TOUCH_DOLLY;
    controls.touches.three = CameraControlsImpl.ACTION.NONE;
    controls.minDistance = pose.distance * 0.45;
    controls.maxDistance = pose.distance * 3;

    if (previous.current.key !== key) {
      // Đi sâu vào: bắt đầu từ xa rồi tiến lại. Quay ra: bắt đầu gần rồi lùi ra.
      const first = previous.current.key === null;
      const factor = first ? 1.3 : DEPTH[level] > previous.current.depth ? 2.6 : 0.5;
      void controls.setLookAt(x * factor, y * factor, z * factor, 0, 0, 0, false);
      previous.current = { key, depth: DEPTH[level] };
    }
    void controls.setLookAt(x, y, z, 0, 0, 0, true);
  }, [key, level, width, height]);

  useFrame((state, delta) => {
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
  });

  return <CameraControls ref={controlsRef} makeDefault />;
}
