import { Color } from 'three';
import type { Material, Mesh, Object3D } from 'three';

/** Temporary display lighting; never mutate the shared NASA model materials. */
export function highlightObject(root: Object3D): () => void {
  const restore: (() => void)[] = [];
  const glow = new Color('#fff4df').multiplyScalar(0.035);
  root.traverse((object) => {
    const mesh = object as Mesh;
    if (!mesh.isMesh || !mesh.visible || mesh.userData.skipHoverHighlight) return;
    const original = mesh.material;
    const materials = Array.isArray(original) ? original : [original];
    if (materials.every((material) => !('color' in material) && !('emissive' in material))) return;
    const brighten = (material: Material) => {
      const copy = material.clone();
      if ('color' in copy && copy.color instanceof Color) copy.color.multiplyScalar(1.18);
      if ('emissive' in copy && copy.emissive instanceof Color) {
        copy.emissive.add(glow);
        if ('emissiveIntensity' in copy && typeof copy.emissiveIntensity === 'number') {
          copy.emissiveIntensity = Math.max(copy.emissiveIntensity, 0.8);
        }
      }
      return copy;
    };
    const highlighted = Array.isArray(original) ? original.map(brighten) : brighten(original);
    mesh.material = highlighted;
    restore.push(() => {
      // A texture or GLB may finish loading while the pointer is over the object.
      if (mesh.material === highlighted) mesh.material = original;
      for (const material of Array.isArray(highlighted) ? highlighted : [highlighted]) material.dispose();
    });
  });
  return () => restore.forEach((reset) => reset());
}
