import { useEffect, useState } from 'react';
import { LinearFilter, LinearMipmapLinearFilter } from 'three';
import type { DataTexture } from 'three';
import { allowHdrSky } from '../../shared/render-budget';

/** Start with the photographic NASA sky; defer the 39 MiB HDR enhancement. */
export function useHdrSky() {
  const [texture, setTexture] = useState<DataTexture | null>(null);
  useEffect(() => {
    const device = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean; effectiveType?: string } };
    if (!allowHdrSky({ width: window.innerWidth, hardwareConcurrency: navigator.hardwareConcurrency,
      deviceMemory: device.deviceMemory, connection: device.connection })) return;
    let active = true;
    let started = false;
    let timer = 0;
    let idle = 0;
    let loaded: DataTexture | null = null;
    const load = async () => {
      if (!active || started || document.hidden) return;
      started = true;
      try {
        const { EXRLoader } = await import('three/examples/jsm/loaders/EXRLoader.js');
        if (!active) return;
        new EXRLoader().load('/assets/images/starfield-gaia-2020.exr', (result) => {
          if (!active) { result.dispose(); return; }
          result.minFilter = LinearMipmapLinearFilter;
          result.magFilter = LinearFilter;
          result.generateMipmaps = true;
          result.anisotropy = 4;
          result.needsUpdate = true;
          loaded = result;
          setTexture(result);
        }, undefined, () => { /* Keep the bundled photographic sky on failure. */ });
      } catch { /* Optional enhancement: keep the photographic sky. */ }
    };
    const schedule = () => {
      window.clearTimeout(timer);
      if (idle && 'cancelIdleCallback' in window) window.cancelIdleCallback(idle);
      if (!active || started || document.hidden) return;
      timer = window.setTimeout(() => {
        if ('requestIdleCallback' in window) idle = window.requestIdleCallback(() => void load(), { timeout: 15000 });
        else void load();
      }, 12000);
    };
    if (document.readyState === 'complete') schedule();
    else window.addEventListener('load', schedule, { once: true });
    document.addEventListener('visibilitychange', schedule);
    return () => {
      active = false;
      window.clearTimeout(timer);
      if (idle && 'cancelIdleCallback' in window) window.cancelIdleCallback(idle);
      window.removeEventListener('load', schedule);
      document.removeEventListener('visibilitychange', schedule);
      loaded?.dispose();
    };
  }, []);
  return texture;
}
