// Tầng 1: sơ đồ hệ Mặt Trời (KHÔNG theo tỉ lệ). Không tải model GLB nào ở tầng này.

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { DoubleSide } from 'three';
import type { Group } from 'three';
import type { Artifact, ArtifactId, SceneCallbacks } from '../../shared/contracts';
import type { Catalog } from '../../shared/app-types';
import { FLAT_COLORS, TEXTURE_URLS } from './layout';
import type { ActiveTarget } from './layout';
import { SceneLabel } from './labels';
import { Globe, Pickable } from './parts';
import type { SetActive } from './parts';

function onOrbit(radius: number, angle: number): [number, number, number] {
  return [radius * Math.cos(angle), 0, radius * Math.sin(angle)];
}

// Bán kính quỹ đạo và kích thước chỉ để dễ nhìn; camera đứng phía +Z.
const EARTH = { orbit: 5.4, angle: 2.0, size: 0.72 };
const MARS = { orbit: 7.4, angle: 1.05, size: 0.68 };
const MOON = { distance: 1.7, size: 0.36 };

const DECOR_PLANETS = [
  { name: 'Mercury', orbit: 2.6, angle: 2.4, size: 0.22, color: '#9a8f85' },
  { name: 'Venus', orbit: 3.8, angle: 4.1, size: 0.4, color: '#d9b26a' },
  { name: 'Jupiter', orbit: 11.5, angle: 5.5, size: 1.1, color: '#c9a47a' },
  { name: 'Saturn', orbit: 14.5, angle: 2.7, size: 0.92, color: '#d8c48f' },
  { name: 'Uranus', orbit: 17, angle: 0.8, size: 0.6, color: '#9fd6dc' },
  { name: 'Neptune', orbit: 19, angle: 4.0, size: 0.58, color: '#4a6fd6' },
] as const;

/**
 * VỊ TRÍ MINH HỌA của các hiện vật deep-space trong sơ đồ: không phải tọa độ thật.
 * Đây là bảng duy nhất viết riêng theo ArtifactId; chỉ vẽ ID nào có trong catalog.
 * `where` nhắc lại sự thật bắt buộc trong CLAUDE.md (mục 4).
 */
const ILLUSTRATIVE_DEEP_SPACE: Partial<Record<ArtifactId, { orbit: number; angle: number; where: string }>> = {
  kepler: { orbit: EARTH.orbit, angle: 2.75, where: 'Orbits the Sun, trailing behind Earth' },
  'near-shoemaker': { orbit: 6.4, angle: 0.25, where: 'Resting on the asteroid Eros' },
  dawn: { orbit: 9.4, angle: 1.65, where: 'In orbit around the dwarf planet Ceres' },
  'pioneer-10': { orbit: 21.5, angle: 4.9, where: 'Leaving the solar system' },
  'pioneer-11': { orbit: 21.5, angle: 3.45, where: 'Leaving the solar system' },
};

function OrbitRing({ radius }: { radius: number }) {
  return (
    <mesh rotation-x={-Math.PI / 2}>
      <ringGeometry args={[radius - 0.012, radius + 0.012, 160]} />
      <meshBasicMaterial color="#8caadc" transparent opacity={0.22} side={DoubleSide} depthWrite={false} />
    </mesh>
  );
}

function Halo({ radius, visible }: { radius: number; visible: boolean }) {
  return (
    <mesh visible={visible}>
      <sphereGeometry args={[radius, 24, 16]} />
      <meshBasicMaterial color="#ffc857" transparent opacity={0.28} depthWrite={false} />
    </mesh>
  );
}

interface SolarSceneProps {
  catalog: Catalog;
  callbacks: SceneCallbacks;
  active: ActiveTarget | null;
  setActive: SetActive;
}

export function SolarScene({ catalog, callbacks, active, setActive }: SolarSceneProps) {
  const earthSpin = useRef<Group>(null);
  const marsSpin = useRef<Group>(null);

  useFrame((_, delta) => {
    if (earthSpin.current) earthSpin.current.rotation.y += delta * 0.12;
    if (marsSpin.current) marsSpin.current.rotation.y += delta * 0.1;
  });

  const count = (body: 'moon' | 'mars') => {
    const total = catalog.artifacts.filter((a) => a.body === body).length;
    return `${total} ${total === 1 ? 'artifact' : 'artifacts'}`;
  };
  const deepSpace = catalog.artifacts.flatMap((artifact: Artifact) => {
    const spot = artifact.body === 'deep-space' ? ILLUSTRATIVE_DEEP_SPACE[artifact.id] : undefined;
    return spot ? [{ artifact, spot }] : [];
  });

  return (
    <group>
      <ambientLight intensity={0.7} />
      <pointLight position={[0, 0, 0]} intensity={3} decay={0} />

      {/* Mặt Trời */}
      <mesh>
        <sphereGeometry args={[1.3, 48, 32]} />
        <meshBasicMaterial color="#ffcf5a" />
      </mesh>

      {[EARTH.orbit, MARS.orbit, ...DECOR_PLANETS.map((p) => p.orbit)].map((radius) => (
        <OrbitRing key={radius} radius={radius} />
      ))}

      {DECOR_PLANETS.map((planet) => (
        <group key={planet.name} position={onOrbit(planet.orbit, planet.angle)}>
          <mesh>
            <sphereGeometry args={[planet.size, 32, 20]} />
            <meshStandardMaterial color={planet.color} roughness={1} />
          </mesh>
          {planet.name === 'Saturn' && (
            <mesh rotation-x={-Math.PI / 2.3}>
              <ringGeometry args={[planet.size * 1.3, planet.size * 2, 64]} />
              <meshBasicMaterial color="#cdbb8a" transparent opacity={0.6} side={DoubleSide} />
            </mesh>
          )}
          <SceneLabel position={[0, planet.size + 0.45, 0]} active={false}>
            <span className="world-label__muted">{planet.name}</span>
          </SceneLabel>
        </group>
      ))}

      {/* Trái Đất + Mặt Trăng */}
      <group position={onOrbit(EARTH.orbit, EARTH.angle)}>
        <group ref={earthSpin}>
          <Globe radius={EARTH.size} textureUrl={TEXTURE_URLS.earth} flatColor={FLAT_COLORS.earth} />
        </group>
        <SceneLabel position={[0, -EARTH.size - 0.4, 0]} active={false}>
          <span className="world-label__muted">Earth</span>
        </SceneLabel>
        <group position={[MOON.distance, 0.25, 0.35]}>
          {/* Xám phẳng cho tới khi có textures/moon.jpg; không dùng ảnh đĩa Mặt Trăng. */}
          <Globe radius={MOON.size} textureUrl={TEXTURE_URLS.moon} flatColor={FLAT_COLORS.moon} />
          <Halo radius={MOON.size * 1.5} visible={active?.id === 'moon'} />
          <Pickable id="moon" hitRadius={0.75} setActive={setActive} onPick={() => callbacks.onSelectBody('moon')} />
          <SceneLabel position={[0, MOON.size + 0.5, 0]} active={active?.id === 'moon'}>
            <strong>Moon</strong>
            {active?.id === 'moon' && <span className="world-label__line">{count('moon')} · tap to visit</span>}
          </SceneLabel>
        </group>
      </group>

      {/* Sao Hỏa */}
      <group position={onOrbit(MARS.orbit, MARS.angle)}>
        <group ref={marsSpin}>
          <Globe radius={MARS.size} textureUrl={TEXTURE_URLS.mars} flatColor={FLAT_COLORS.mars} />
        </group>
        <Halo radius={MARS.size * 1.35} visible={active?.id === 'mars'} />
        <Pickable id="mars" hitRadius={1.15} setActive={setActive} onPick={() => callbacks.onSelectBody('mars')} />
        <SceneLabel position={[0, MARS.size + 0.55, 0]} active={active?.id === 'mars'}>
          <strong>Mars</strong>
          {active?.id === 'mars' && <span className="world-label__line">{count('mars')} · tap to visit</span>}
        </SceneLabel>
      </group>

      {/* Chấm deep-space: vị trí minh họa */}
      {deepSpace.map(({ artifact, spot }) => {
        const isActive = active?.id === artifact.id;
        const [x, , z] = onOrbit(spot.orbit, spot.angle);
        return (
          <group key={artifact.id} position={[x, 0.6, z]}>
            <mesh scale={isActive ? 1.5 : 1}>
              <sphereGeometry args={[0.27, 16, 12]} />
              <meshBasicMaterial color="#7fd4ff" />
            </mesh>
            <Halo radius={0.55} visible={isActive} />
            <Pickable id={artifact.id} hitRadius={0.85} setActive={setActive} onPick={() => callbacks.onSelectArtifact(artifact.id)} />
            <SceneLabel position={[0, 0.75, 0]} active={isActive}>
              <strong>{artifact.name}</strong>
              {isActive && <span className="world-label__line">{artifact.displayYears}</span>}
              {isActive && <span className="world-label__line">{spot.where}</span>}
              <span className="world-label__line world-label__muted">illustrative position</span>
            </SceneLabel>
          </group>
        );
      })}
    </group>
  );
}

/** Hiện vật deep-space có chấm trong sơ đồ hay không (danh sách nút dùng để ghi chú). */
export function hasIllustrativeSpot(id: ArtifactId): boolean {
  return ILLUSTRATIVE_DEEP_SPACE[id] !== undefined;
}
