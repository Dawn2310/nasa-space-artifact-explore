import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { Group } from 'three';
import type { InspectionTargets } from './solar-system';
import { Atmosphere } from './PlanetVisuals';
import { highlightObject } from './hover-highlight';

export function Inspectable({ id, radius, targets, onInspect, children }: {
  id: string;
  radius: number;
  targets: InspectionTargets;
  onInspect: (id: string) => void;
  children: ReactNode;
}) {
  const root = useRef<Group | null>(null);
  const [hovered, setHovered] = useState(false);
  const register = useCallback((object: Group | null) => {
    root.current = object;
    if (object) targets.set(id, { object, radius });
    else targets.delete(id);
  }, [id, radius, targets]);
  useEffect(() => {
    if (hovered && root.current) return highlightObject(root.current);
  }, [hovered, children]);
  useEffect(() => () => { document.body.style.cursor = ''; }, []);
  return (
    <group ref={register} onPointerOver={(event) => {
      event.stopPropagation();
      setHovered(true);
      document.body.style.cursor = 'zoom-in';
    }} onPointerOut={() => { setHovered(false); document.body.style.cursor = ''; }} onClick={(event) => {
      event.stopPropagation();
      if (event.delta <= 6) onInspect(id);
    }}>
      {children}
      <mesh userData={{ skipHoverHighlight: true }}>
        <sphereGeometry args={[Math.max(radius * 1.08, 0.18), 24, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {hovered && <group>
        <Atmosphere radius={radius} color="#b4eaff" strength={0.5} />
      </group>}
    </group>
  );
}
