// Echo is an explicitly pretend guide, not a NASA spacecraft or a physical trajectory.
import { useRef } from 'react';
import type { RefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Trail } from '@react-three/drei';
import type { CameraControlsImpl } from '@react-three/drei';
import { MathUtils, Vector3 } from 'three';
import type { Group } from 'three';
import type { SolarFlight } from '../../shared/app-types';
import type { InspectionTargets } from './solar-system';
import { SceneLabel } from './labels';
import { cockpitDock, sampleUfoFlight, ufoDock, UFO_FLIGHT_SECONDS } from './ufo-flight';
import type { FlightTelemetry } from './ufo-flight';
import EchoCraft from './EchoCraft';

export default function UfoNavigator({ flight, targets, position, telemetry, onArrival, reduced }: {
  flight?: SolarFlight; targets: InspectionTargets; position: RefObject<Vector3 | null>;
  telemetry: RefObject<FlightTelemetry>;
  onArrival: (id: string) => void; reduced: boolean;
}) {
  const anchor = useRef<Group>(null);
  const model = useRef<Group>(null);
  const run = useRef({ id: '', elapsed: 0, arrived: false, dockId: 'earth' });
  const start = useRef(new Vector3());
  const center = useRef(new Vector3());
  const dock = useRef(new Vector3());
  const next = useRef(new Vector3());
  const controls = useThree((state) => state.controls) as CameraControlsImpl | undefined;
  useFrame(({ camera, clock }, delta) => {
    if (!anchor.current) return;
    const targetId = flight?.targetId ?? run.current.dockId;
    const target = targets.get(targetId);
    if (!target) return; // registration/loading, not a guessed destination
    target.object.getWorldPosition(center.current);
    ufoDock(center.current, target.radius, dock.current);
    if (!position.current) position.current = dock.current.clone();
    if (flight && run.current.id !== flight.id) {
      start.current.copy(position.current);
      run.current = { id: flight.id, elapsed: 0, arrived: false, dockId: flight.targetId };
    }
    if (flight) cockpitDock(center.current, target.radius, start.current, dock.current);
    if (flight && !run.current.arrived) {
      run.current.elapsed += Math.min(delta, 0.05);
      const t = Math.min(1, run.current.elapsed / (reduced ? 0.25 : UFO_FLIGHT_SECONDS));
      sampleUfoFlight(start.current, dock.current, t, next.current);
      position.current.copy(next.current);
      telemetry.current = { progress: t, distance: next.current.distanceTo(center.current) };
      // The eye is inside Echo. Keep the moving destination ahead of the windshield.
      camera.clearViewOffset?.();
      if (controls) {
        void controls.setLookAt(next.current.x, next.current.y, next.current.z,
          center.current.x, center.current.y, center.current.z, false);
        controls.update(delta);
      } else {
        camera.position.copy(next.current); camera.lookAt(center.current);
      }
      if (t === 1) {
        run.current.arrived = true;
        onArrival(flight.id);
      }
    } else if (!run.current.id || run.current.arrived) position.current.copy(dock.current);
    anchor.current.position.copy(position.current);
    anchor.current.visible = !flight;
    // A readable locator scale for our fictional guide, independent of real model sizes.
    const scale = MathUtils.clamp(camera.position.distanceTo(position.current) * 0.017, 0.2, 2.4);
    anchor.current.scale.setScalar(scale);
    if (model.current) {
      model.current.rotation.y = clock.elapsedTime * (reduced ? 0 : 0.7);
      model.current.rotation.z = flight && !run.current.arrived ? -0.16 : 0;
      model.current.position.y = reduced ? 0 : Math.sin(clock.elapsedTime * 2.4) * 0.045;
    }
  });
  return <Trail width={0} length={12} decay={1.5} color="#80e9ff" attenuation={(t) => t * t}>
    <group ref={anchor} raycast={() => {}}>
      <group ref={model}>
        <EchoCraft flying={!!flight} />
      </group>
      {!flight && <SceneLabel position={[0, 0.72, 0]} active={false}><span className="world-label__echo">Echo</span></SceneLabel>}
    </group>
  </Trail>;
}
