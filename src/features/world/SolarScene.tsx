// Tầng 1: sơ đồ hệ Mặt Trời (KHÔNG theo tỉ lệ), model và texture NASA.

import { useMemo, useRef } from 'react';
import type { ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import type { Group } from 'three';
import type { Artifact, ArtifactId } from '../../shared/contracts';
import type { Catalog } from '../../shared/app-types';
import { assetUrl, findAsset } from '../../shared/app-types';
import { FLAT_COLORS, TEXTURE_URLS } from './layout';
import type { ActiveTarget } from './layout';
import { SceneLabel } from './labels';
import { Globe } from './parts';
import { Atmosphere, PlanetVisual, SpacecraftVisual, SunVisual } from './PlanetVisuals';
import type { SetActive } from './parts';
import { SOLAR_MOONS } from './solar-system';
import type { InspectionTargets } from './solar-system';
import { Inspectable } from './InspectionTarget';
import { CERES_RADIUS, EROS_RADIUS, SPACECRAFT_RADII, isMovingMission, missionSceneTarget, sampleMissionMotion } from './scene-motion';
import type { MovingMissionId } from './scene-motion';
import { EARTH, MARS, MOON, SOLAR_PLANETS } from './solar-layout';

function onOrbit(radius: number, angle: number): [number, number, number] {
  return [radius * Math.cos(angle), 0, radius * Math.sin(angle)];
}

// Bán kính quỹ đạo và kích thước chỉ để dễ nhìn; camera đứng phía +Z.
const DECOR_PLANETS = SOLAR_PLANETS.filter((planet) => planet.id !== 'earth' && planet.id !== 'mars');

const PLANET_APPEARANCE: Record<string, { textureUrl?: string; modelUrl?: string; atmosphere?: string; tilt?: number; spin?: number }> = {
  Mercury: { modelUrl: '/assets/models/planet-mercury.glb' },
  Venus: { textureUrl: '/assets/textures/venus.jpg', atmosphere: '#edbd76', tilt: 0.04, spin: -0.025 },
  Jupiter: { textureUrl: '/assets/textures/jupiter.jpg', atmosphere: '#ddbc94', tilt: 0.05 },
  Saturn: { modelUrl: '/assets/models/planet-saturn.glb', textureUrl: '/assets/textures/saturn.jpg', tilt: 0.47 },
  Uranus: { atmosphere: '#9ce7eb', tilt: 1.7 },
  Neptune: { textureUrl: '/assets/textures/neptune.jpg', atmosphere: '#467bea', tilt: 0.49 },
};

// Illustrative animation speeds, in radians/second; no claim of real-time ephemerides.
// Move the entire group so labels and hit areas stay attached to their planet.
function OrbitingBody({ orbit, angle, speed, paused, height = 0, children }: {
  orbit: number;
  angle: number;
  speed: number;
  paused: boolean;
  height?: number;
  children: ReactNode;
}) {
  const group = useRef<Group>(null);
  const phase = useRef(angle);
  const initialPosition = useRef<[number, number, number]>([orbit * Math.cos(angle), height, orbit * Math.sin(angle)]);
  useFrame((_, delta) => {
    if (paused || !group.current) return;
    phase.current -= Math.min(delta, 0.05) * speed;
    group.current.position.set(orbit * Math.cos(phase.current), height, orbit * Math.sin(phase.current));
  }, -1);
  return <group ref={group} position={initialPosition.current}>{children}</group>;
}

/**
 * VỊ TRÍ MINH HỌA của các hiện vật deep-space trong sơ đồ: không phải tọa độ thật.
 * Đây là bảng duy nhất viết riêng theo ArtifactId; chỉ vẽ ID nào có trong catalog.
 * `where` nhắc lại sự thật bắt buộc trong CLAUDE.md (mục 4).
 */
function OrbitRing({ radius, highlighted = false }: { radius: number; highlighted?: boolean }) {
  const points = useMemo(() => Array.from({ length: 193 }, (_, index) =>
    onOrbit(radius, index / 192 * Math.PI * 2)), [radius]);
  return (
    <Line points={points} color={highlighted ? '#ffd77d' : '#5e82a1'} lineWidth={highlighted ? 1.5 : 1}
      transparent opacity={highlighted ? 0.55 : 0.32} depthWrite={false} raycast={() => {}} />
  );
}

function MissionObject({ artifact, catalog, paused, active, targets, onInspect, showLabel }: {
  artifact: Artifact;
  catalog: Catalog;
  paused: boolean;
  active: ActiveTarget | null;
  targets: InspectionTargets;
  onInspect: (id: string) => void;
  showLabel: boolean;
}) {
  const id = artifact.id as MovingMissionId;
  const anchor = useRef<Group>(null);
  const host = useRef<Group>(null);
  const ship = useRef<Group>(null);
  const elapsed = useRef(0);
  const asset = findAsset(catalog, artifact.modelAssetId);
  const targetId = missionSceneTarget(id);
  const radius = id === 'near-shoemaker' ? EROS_RADIUS : SPACECRAFT_RADII[id];
  const label = id === 'near-shoemaker' ? 'Eros' : id === 'dawn' ? 'Dawn' : id === 'kepler' ? 'Kepler' : id === 'pioneer-10' ? 'Pioneer 10' : 'Pioneer 11';
  const isActive = active?.id === artifact.id;
  useFrame((_, delta) => {
    if (!paused) elapsed.current += Math.min(delta, 0.05);
    const position = sampleMissionMotion(id, elapsed.current);
    anchor.current?.position.set(...position.anchor);
    if (host.current) host.current.rotation.y = position.hostRotation;
    ship.current?.position.set(...position.offset);
  }, -1);
  return (
    <group ref={anchor}>
      <group ref={host}>
        {id === 'dawn' && (
          <>
            <Inspectable id="ceres" radius={CERES_RADIUS} targets={targets} onInspect={onInspect}>
              <PlanetVisual radius={CERES_RADIUS} color="#8c8379" modelUrl="/assets/models/body-ceres.glb" spin={0.06} paused={paused} />
            </Inspectable>
            {showLabel && <SceneLabel position={[0, -CERES_RADIUS - 0.25, 0]} active={false}>
              <span>Ceres</span>
            </SceneLabel>}
          </>
        )}
        <group ref={ship}>
          <Inspectable id={targetId} radius={radius} targets={targets} onInspect={onInspect}>
            {/* NASA establishes NEAR's landing, but we have no registered surface pose.
                Show its real host; the separate artifact view retains the spacecraft GLB. */}
            {id === 'near-shoemaker'
              ? <PlanetVisual radius={radius} color="#8e8a83" modelUrl="/assets/models/body-eros.glb" spin={0} paused />
              : asset && <SpacecraftVisual radius={radius} url={assetUrl(asset)} />}
            <Halo radius={radius * 1.15} visible={isActive} />
          </Inspectable>
          {showLabel && <SceneLabel position={[0, radius + 0.22, 0]} active={isActive}>
            <span className="world-label__mission">{label}</span>
            {id === 'near-shoemaker' && <span className="world-label__hint">NEAR on surface</span>}
          </SceneLabel>}
        </group>
      </group>
    </group>
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
  active: ActiveTarget | null;
  setActive: SetActive;
  paused: boolean;
  targets: InspectionTargets;
  focusId: string | null;
  onInspect: (id: string) => void;
}

export function SolarScene({ catalog, active, paused, targets, focusId, onInspect }: SolarSceneProps) {
  const earthSpin = useRef<Group>(null);
  const marsSpin = useRef<Group>(null);
  const moonSpin = useRef<Group>(null);

  useFrame((_, delta) => {
    if (paused) return;
    if (earthSpin.current) earthSpin.current.rotation.y += delta * 0.12;
    if (marsSpin.current) marsSpin.current.rotation.y += delta * 0.1;
    if (moonSpin.current) moonSpin.current.rotation.y += delta * 0.5;
  });

  const deepSpace = catalog.artifacts.flatMap((artifact: Artifact) => {
    return artifact.body === 'deep-space' && isMovingMission(artifact.id) ? [artifact] : [];
  });
  const focusParent = focusId === 'moon' ? 'earth' : SOLAR_MOONS.find((moon) => moon.id === focusId)?.parent;
  const showLabel = (id: string) => !focusId || focusId === id || focusParent === id;

  const moonsFor = (parent: string) => (
    <group rotation-z={parent === 'uranus' ? 1.7 : 0}>
      {SOLAR_MOONS.filter((moon) => moon.parent === parent).map((moon) => (
        <OrbitingBody key={moon.id} orbit={moon.orbit} angle={moon.phase} speed={moon.speed} paused={paused}>
          <Inspectable id={moon.id} radius={moon.radius} targets={targets} onInspect={onInspect}>
            <PlanetVisual radius={moon.radius} color="#999187" modelUrl={moon.modelUrl} textureUrl={moon.textureUrl} spin={moon.speed} paused={paused} />
          </Inspectable>
        </OrbitingBody>
      ))}
    </group>
  );

  return (
    <group>
      <ambientLight intensity={0.24} />
      <hemisphereLight args={['#c4d8ff', '#16101f', 0.35]} />
      <pointLight position={[0, 0, 0]} color="#fff2d8" intensity={3.6} decay={0} />

      {/* Mặt Trời */}
      <Inspectable id="sun" radius={1.3} targets={targets} onInspect={onInspect}>
        <SunVisual paused={paused} />
      </Inspectable>
      {showLabel('sun') && <SceneLabel position={[0, 1.75, 0]} active={false}>
        <strong>Sun</strong>
      </SceneLabel>}

      {[{ name: 'earth', orbit: EARTH.orbit }, { name: 'mars', orbit: MARS.orbit }, ...DECOR_PLANETS].map((planet) => (
        <OrbitRing key={planet.name} radius={planet.orbit} highlighted={focusId === planet.name.toLowerCase() || focusParent === planet.name.toLowerCase()} />
      ))}

      {DECOR_PLANETS.map((planet) => (
        <OrbitingBody key={planet.name} {...planet} paused={paused}>
          <Inspectable id={planet.name.toLowerCase()} radius={planet.size} targets={targets} onInspect={onInspect}>
            <PlanetVisual radius={planet.size} color={planet.color} {...PLANET_APPEARANCE[planet.name]} paused={paused} />
          </Inspectable>
          {moonsFor(planet.name.toLowerCase())}
          {showLabel(planet.name.toLowerCase()) && <SceneLabel position={[0, planet.size + 0.32, 0]} active={false}>
            <span>{planet.name}</span>
          </SceneLabel>}
        </OrbitingBody>
      ))}

      {/* Trái Đất + Mặt Trăng */}
      <OrbitingBody {...EARTH} paused={paused}>
        <Inspectable id="earth" radius={EARTH.size} targets={targets} onInspect={onInspect}>
        <group ref={earthSpin}>
          <Globe radius={EARTH.size} textureUrl={TEXTURE_URLS.earth} flatColor={FLAT_COLORS.earth} />
        </group>
        <Atmosphere radius={EARTH.size} color="#409cff" strength={0.75} />
        </Inspectable>
        {showLabel('earth') && <SceneLabel position={[0, -EARTH.size - 0.4, 0]} active={false}>
          <span className="world-label__muted">Earth</span>
        </SceneLabel>}
        <OrbitingBody orbit={MOON.distance} angle={0.2} speed={0.5} height={0.25} paused={paused}>
          <Inspectable id="moon" radius={MOON.size} targets={targets} onInspect={onInspect}>
          <group ref={moonSpin}>
          <Globe radius={MOON.size} textureUrl={TEXTURE_URLS.moon} flatColor={FLAT_COLORS.moon} />
          </group>
          <Halo radius={MOON.size * 1.5} visible={active?.id === 'moon'} />
          </Inspectable>
          {(showLabel('moon') || focusId === 'earth') && <SceneLabel position={[0, MOON.size + 0.5, 0]} active={active?.id === 'moon'}>
            <strong>Moon</strong>
          </SceneLabel>}
        </OrbitingBody>
      </OrbitingBody>

      {/* Sao Hỏa */}
      <OrbitingBody {...MARS} paused={paused}>
        <Inspectable id="mars" radius={MARS.size} targets={targets} onInspect={onInspect}>
        <group ref={marsSpin}>
          <Globe radius={MARS.size} textureUrl={TEXTURE_URLS.mars} flatColor={FLAT_COLORS.mars} />
        </group>
        <Atmosphere radius={MARS.size} color="#db7841" strength={0.25} />
        <Halo radius={MARS.size * 1.35} visible={active?.id === 'mars'} />
        </Inspectable>
        {moonsFor('mars')}
        {showLabel('mars') && <SceneLabel position={[0, MARS.size + 0.55, 0]} active={active?.id === 'mars'}>
          <strong>Mars</strong>
        </SceneLabel>}
      </OrbitingBody>

      {/* Chấm deep-space: vị trí minh họa */}
      {deepSpace.map((artifact) => <MissionObject key={artifact.id} artifact={artifact} catalog={catalog} paused={paused}
        active={active} targets={targets} onInspect={onInspect}
        showLabel={!focusId || focusId === missionSceneTarget(artifact.id as MovingMissionId) || (artifact.id === 'dawn' && focusId === 'ceres')} />)}
    </group>
  );
}

/** Hiện vật deep-space có chấm trong sơ đồ hay không (danh sách nút dùng để ghi chú). */
export function hasIllustrativeSpot(id: ArtifactId): boolean {
  return isMovingMission(id);
}
