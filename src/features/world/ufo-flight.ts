import { Vector3 } from 'three';

export const UFO_FLIGHT_SECONDS = 3;
export interface FlightTelemetry { progress: number; distance: number; }
/** Ease into a moving destination above the orbital plane, avoiding the Sun. */
export function sampleUfoFlight(start: Vector3, dock: Vector3, progress: number, out: Vector3): Vector3 {
  const t = Math.max(0, Math.min(1, progress));
  const eased = t * t * t * (t * (t * 6 - 15) + 10);
  out.lerpVectors(start, dock, eased);
  out.y += Math.sin(Math.PI * t) * Math.max(8, start.distanceTo(dock) * 0.26);
  return out;
}

export function ufoDock(center: Vector3, radius: number, out: Vector3): Vector3 {
  out.copy(center);
  out.y += radius + 3;
  return out;
}

/** Stop outside the destination, on the arrival side, with a readable forward view. */
export function cockpitDock(center: Vector3, radius: number, departure: Vector3, out: Vector3): Vector3 {
  out.subVectors(departure, center); out.y = 0;
  if (out.lengthSq() < 0.0001) out.set(0, 0, 1);
  out.normalize().multiplyScalar(Math.max(0.7, radius * 4.2));
  out.y = Math.max(0.25, radius * 1.35);
  return out.add(center);
}
