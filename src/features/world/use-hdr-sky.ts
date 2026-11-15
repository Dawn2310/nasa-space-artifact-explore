import { useEffect, useState } from 'react';
import { LinearFilter, LinearMipmapLinearFilter } from 'three';
import type { DataTexture } from 'three';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';

/** Load the original NASA/Gaia linear HDR sky without blocking the interactive scene. */
export function useHdrSky() {
  const [texture, setTexture] = useState<DataTexture | null>(null);
  useEffect(() => {
    let active = true;
    let loaded: DataTexture | null = null;
    new EXRLoader().load('/assets/images/starfield-gaia-2020.exr', (result) => {
      if (!active) { result.dispose(); return; }
      result.minFilter = LinearMipmapLinearFilter;
      result.magFilter = LinearFilter;
      result.generateMipmaps = true;
      result.anisotropy = 4;
      result.needsUpdate = true;
      loaded = result;
      setTexture(result);
    }, undefined, () => { /* The bundled 8K JPEG stays available as a fallback. */ });
    return () => { active = false; loaded?.dispose(); };
  }, []);
  return texture;
}
