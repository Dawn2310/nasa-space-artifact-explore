// Tầng 2: quả cầu Mặt Trăng / sao Hỏa với marker đặt theo tọa độ của catalog.
// Marker là CON của nhóm globe nên quay cùng globe.

import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';
import type { Artifact, SceneCallbacks, SurfaceLocation } from '../../shared/contracts';
import type { Catalog } from '../../shared/app-types';
import {
  MARS_TEXTURE_LEFT_EDGE_LON_EAST_DEG,
  MOON_TEXTURE_LEFT_EDGE_LON_EAST_DEG,
  latLonToVec3,
  parseConvention,
} from './geo';
import { FLAT_COLORS, GLOBE_RADIUS, TEXTURE_URLS } from './layout';
import type { ActiveTarget } from './layout';
import { SceneLabel } from './labels';
import { Globe, Pickable } from './parts';
import type { SetActive } from './parts';

const KIND_LABEL: Record<SurfaceLocation['kind'], string> = {
  landing: 'Landing site',
  'final-resting': 'Final resting place',
  deployment: 'Deployment site',
};

/** Location dùng để vẽ marker, hoặc undefined nếu catalog không chỉ định. */
export function markerLocation(artifact: Artifact): SurfaceLocation | undefined {
  if (artifact.markerLocationIndex === null) return undefined;
  return artifact.locations[artifact.markerLocationIndex];
}

/** Dòng mô tả marker thể hiện loại vị trí nào (bắt buộc với Ingenuity: landing khác final-resting). */
export function describeLocation(location: SurfaceLocation): string {
  return `${KIND_LABEL[location.kind]}: ${location.label}`;
}

/** Góc quay quanh Y để một điểm cục bộ của globe hướng về phía camera. */
function facingAngle(local: [number, number, number], cameraX: number, cameraZ: number): number {
  return Math.atan2(cameraX, cameraZ) - Math.atan2(local[0], local[2]);
}

interface SurfaceSceneProps {
  body: 'moon' | 'mars';
  catalog: Catalog;
  callbacks: SceneCallbacks;
  active: ActiveTarget | null;
  setActive: SetActive;
}

export function SurfaceScene({ body, catalog, callbacks, active, setActive }: SurfaceSceneProps) {
  const globe = useRef<Group>(null);
  const leftEdge = body === 'mars' ? MARS_TEXTURE_LEFT_EDGE_LON_EAST_DEG : MOON_TEXTURE_LEFT_EDGE_LON_EAST_DEG;

  const markers = useMemo(
    () =>
      catalog.artifacts.flatMap((artifact) => {
        const location = artifact.body === body ? markerLocation(artifact) : undefined;
        if (!location) return [];
        if (import.meta.env.DEV && !parseConvention(location.convention).directionStated) {
          console.warn(`[world] ${artifact.id}: convention "${location.convention}" does not state east/west; assuming east-positive.`);
        }
        const position = latLonToVec3(location.latitudeDeg, location.longitudeDeg, GLOBE_RADIUS, location.convention, leftEdge);
        return [{ artifact, location, position }];
      }),
    [catalog, body, leftEdge],
  );

  // Mở cảnh với marker đầu tiên hướng về camera (camera đứng phía +Z).
  useLayoutEffect(() => {
    if (globe.current) globe.current.rotation.y = markers[0] ? facingAngle(markers[0].position, 0, 1) : 0;
  }, [body, markers]);

  useFrame((state, delta) => {
    const group = globe.current;
    if (!group) return;
    if (!active) {
      group.rotation.y += delta * 0.04;
      return;
    }
    // Trỏ chuột vào marker: đứng yên. Focus từ danh sách nút: quay marker đó ra trước.
    if (active.source !== 'list') return;
    const focused = markers.find((marker) => marker.artifact.id === active.id);
    if (!focused) return;
    const target = facingAngle(focused.position, state.camera.position.x, state.camera.position.z);
    const difference = Math.atan2(Math.sin(target - group.rotation.y), Math.cos(target - group.rotation.y));
    group.rotation.y += difference * (1 - Math.exp(-delta * 4));
  });

  return (
    <group>
      <ambientLight intensity={0.75} />
      <directionalLight position={[4, 3, 6]} intensity={1.6} />
      <directionalLight position={[-5, -2, -6]} intensity={0.5} />

      <group ref={globe}>
        <Globe radius={GLOBE_RADIUS} textureUrl={TEXTURE_URLS[body]} flatColor={FLAT_COLORS[body]} />
        {markers.map(({ artifact, location, position }) => {
          const isActive = active?.id === artifact.id;
          return (
            <group key={artifact.id} position={position}>
              <mesh scale={isActive ? 1.6 : 1}>
                <sphereGeometry args={[0.055, 16, 12]} />
                <meshBasicMaterial color={isActive ? '#ffffff' : '#ffc857'} />
              </mesh>
              <mesh visible={isActive}>
                <sphereGeometry args={[0.14, 16, 12]} />
                <meshBasicMaterial color="#ffc857" transparent opacity={0.35} depthWrite={false} />
              </mesh>
              <Pickable
                id={artifact.id}
                hitRadius={0.17}
                setActive={setActive}
                onPick={() => callbacks.onSelectArtifact(artifact.id)}
              />
              {isActive && (
                <SceneLabel position={[position[0] * 0.14, position[1] * 0.14 + 0.12, position[2] * 0.14]} active>
                  <strong>{artifact.name}</strong>
                  <span className="world-label__line">{artifact.displayYears}</span>
                  <span className="world-label__line world-label__muted">{describeLocation(location)}</span>
                </SceneLabel>
              )}
            </group>
          );
        })}
      </group>
    </group>
  );
}
