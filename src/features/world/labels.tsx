// Nhãn trong cảnh. Nội dung nhãn khai báo BÊN TRONG Canvas (cạnh vật nó mô tả) nhưng
// được vẽ thành HTML ở lớp phủ BÊN NGOÀI Canvas; mỗi khung hình chiếu điểm neo 3D
// ra tọa độ màn hình. (Không dùng <Html> của drei: với React 19 + StrictMode nó ném
// lỗi removeChild khi gỡ nhãn: world3d đã thấy lỗi đó khi chạy thử.)

import { useEffect, useId, useRef, useSyncExternalStore } from 'react';
import type { ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import type { Group, Object3D } from 'three';

interface LabelEntry {
  node: ReactNode;
  active: boolean;
  anchor: Object3D;
}

const entries = new Map<string, LabelEntry>();
const elements = new Map<string, HTMLElement>();
const listeners = new Set<() => void>();
let version = 0;

function emit() {
  version += 1;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Đặt trong Canvas: một điểm neo tại `position` (tọa độ cục bộ của nhóm cha) kèm nội dung nhãn. */
export function SceneLabel({
  position,
  active,
  children,
}: {
  position: [number, number, number];
  active: boolean;
  children: ReactNode;
}) {
  const anchor = useRef<Group>(null);
  const id = useId();

  useEffect(() => {
    if (!anchor.current) return;
    entries.set(id, { node: children, active, anchor: anchor.current });
    emit();
  });

  useEffect(
    () => () => {
      entries.delete(id);
      emit();
    },
    [id],
  );

  return <group ref={anchor} position={position} />;
}

const projected = new Vector3();

/** Đặt trong Canvas (một lần): cập nhật vị trí màn hình của mọi nhãn ở mỗi khung hình. */
export function LabelProjector() {
  useFrame(({ camera, size }) => {
    for (const [id, entry] of entries) {
      const element = elements.get(id);
      if (!element) continue;
      entry.anchor.getWorldPosition(projected).project(camera);
      if (projected.z > 1 || projected.z < -1) {
        element.style.opacity = '0';
        continue;
      }
      const x = (projected.x * 0.5 + 0.5) * size.width;
      const y = (-projected.y * 0.5 + 0.5) * size.height;
      element.style.opacity = '1';
      element.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -100%)`;
    }
  });
  return null;
}

/** Đặt NGOÀI Canvas: lớp phủ HTML chứa các nhãn. Không nhận chuột để không che vùng bấm. */
export function LabelOverlay() {
  useSyncExternalStore(subscribe, () => version);
  return (
    <div className="world-labels" aria-hidden="true">
      {[...entries].map(([id, entry]) => (
        <div
          key={id}
          ref={(element) => {
            if (element) elements.set(id, element);
            else elements.delete(id);
          }}
          className={entry.active ? 'world-label world-label--active' : 'world-label'}
          style={{ opacity: 0 }}
        >
          {entry.node}
        </div>
      ))}
    </div>
  );
}
