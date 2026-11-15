import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import type { FlightTelemetry } from './ufo-flight';

export default function FlightCockpit({ label, telemetry, onCancel }: {
  label: string; telemetry: RefObject<FlightTelemetry>; onCancel: () => void;
}) {
  const meter = useRef<HTMLProgressElement>(null);
  const status = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      const progress = telemetry.current.progress;
      if (meter.current) meter.current.value = progress;
      if (status.current) status.current.textContent = progress < 0.15 ? 'Leaving orbit' : progress < 0.78 ? 'Destination ahead' : 'Preparing to arrive';
      frame = requestAnimationFrame(update);
    };
    update();
    return () => cancelAnimationFrame(frame);
  }, [telemetry]);
  return <section className="flight-cabin" aria-label="Inside UFO Echo">
    <div className="flight-cabin__roof"><span>ECHO <small>FLIGHT DECK</small></span><b><i /> AUTONAV</b></div>
    <div className="flight-cabin__glass" aria-hidden="true"><i /><i /><i /><i /></div>
    <div className="flight-cabin__reticle" aria-hidden="true"><i /><span>DESTINATION LOCKED</span></div>
    <div className="flight-cabin__console">
      <div className="flight-cabin__gauge" aria-hidden="true"><span /><i /><b>✦</b></div>
      <div className="flight-cabin__destination" role="status"><small>EN ROUTE TO</small><strong>{label}</strong><span ref={status}>Leaving orbit</span><progress ref={meter} max={1} value={0} aria-label="Journey progress" /></div>
      <button type="button" onClick={onCancel}>Cancel flight</button>
    </div>
  </section>;
}
