// Mảnh ghép dùng chung của các cảnh: texture hành tinh, quả cầu, vùng bấm.

import { useEffect, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { ThreeEvent } from '@react-three/fiber';
import { SRGBColorSpace, TextureLoader } from 'three';
import type { Texture } from 'three';
import type { ActiveTarget } from './layout';

export type SetActive = Dispatch<SetStateAction<ActiveTarget | null>>;

/**
 * Tải texture bản đồ; trả null khi đang tải hoặc khi file không có/không đọc được
 * (khi đó quả cầu giữ màu phẳng). Giải phóng texture khi rời cảnh.
 */
export function usePlanetTexture(url: string | null): Texture | null {
  const [texture, setTexture] = useState<Texture | null>(null);

  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    let loaded: Texture | null = null;
    new TextureLoader().load(
      url,
      (result) => {
        if (cancelled) {
          result.dispose();
          return;
        }
        result.colorSpace = SRGBColorSpace;
        result.anisotropy = 4;
        loaded = result;
        setTexture(result);
      },
      undefined,
      () => {
        // Không có file (ví dụ moon.jpg): giữ màu phẳng, không thay bằng ảnh khác.
      },
    );
    return () => {
      cancelled = true;
      loaded?.dispose();
      setTexture(null);
    };
  }, [url]);

  return texture;
}

export function Globe({ radius, textureUrl, flatColor }: { radius: number; textureUrl: string | null; flatColor: string }) {
  const texture = usePlanetTexture(textureUrl);
  return (
    <mesh>
      <sphereGeometry args={[radius, 64, 40]} />
      {/* key đổi để shader biên dịch lại khi texture xuất hiện */}
      <meshStandardMaterial
        key={texture ? 'textured' : 'flat'}
        map={texture}
        color={texture ? '#ffffff' : flatColor}
        roughness={1}
        metalness={0}
      />
    </mesh>
  );
}

interface PickableProps {
  id: ActiveTarget['id'];
  hitRadius: number;
  setActive: SetActive;
  onPick: () => void;
}

/** Vùng bấm vô hình, rộng hơn hình vẽ để dễ chạm; chặn sự kiện lan sang vật phía sau. */
export function Pickable({ id, hitRadius, setActive, onPick }: PickableProps) {
  useEffect(
    () => () => {
      document.body.style.cursor = '';
    },
    [],
  );

  return (
    <mesh
      onClick={(event: ThreeEvent<MouseEvent>) => {
        event.stopPropagation();
        if (event.delta > 6) return; // đang kéo xoay camera, không phải bấm
        onPick();
      }}
      onPointerOver={(event: ThreeEvent<PointerEvent>) => {
        event.stopPropagation();
        setActive({ id, source: 'pointer' });
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setActive((current) => (current?.id === id && current.source === 'pointer' ? null : current));
        document.body.style.cursor = '';
      }}
    >
      <sphereGeometry args={[hitRadius, 16, 12]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}
