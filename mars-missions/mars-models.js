import * as THREE from 'three';
import { articulateSojourner } from './mars-sojourner.js';

export async function loadMissionModel(loader, asset, filename) {
    if (filename === 'sojourner-dan.glb') {
      const { scene } = await loader.loadAsync(asset(filename));
      return { scene: articulateSojourner(scene) };
    }
    if (filename !== 'insight-deployed.glb') return loader.loadAsync(asset(filename));
    const [deployed, instruments] = await Promise.all([
      loader.loadAsync(asset(filename)),
      loader.loadAsync(asset('insight.glb')),
    ]);
    // Strip the fixed payloads, solar arrays and arm baked into the body.
    // The named arm and panel hierarchies supply the moving parts.
    const body = deployed.scene.getObjectByName('InSight_Deployed');
    for (const mesh of body.children.filter(child => child.isMesh && !child.name.startsWith('arm_'))) {
      if (mesh.material.name === 'InSIGHT_AO_08') {
        mesh.removeFromParent();
        continue;
      }
      const geometry = mesh.geometry;
      const positions = geometry.getAttribute('position');
      const index = geometry.getIndex();
      const kept = [];
      const count = index?.count ?? positions.count;
      const armTrim = ['InSIGHT_tex_01', 'InSIGHT_tex_02'].includes(mesh.material.name);
      const hasBakedTethers = mesh.material.name === 'InSIGHT_tex_02' && positions.count === 4811;
      const onFixedArm = vertex => {
        const x = positions.getX(vertex);
        return x >= -.62 && x <= -.22 && positions.getY(vertex) > .53 && positions.getZ(vertex) > .85;
      };
      for (let i = 0; i < count; i += 3) {
        const a = index ? index.getX(i) : i;
        const b = index ? index.getX(i + 1) : i + 1;
        const c = index ? index.getX(i + 2) : i + 2;
        // These two connected vertex ranges in the NASA Deployed GLB are the
        // baked tethers. The deployment animation supplies their replacements.
        if (hasBakedTethers && ((a >= 1890 && a <= 2255) || (a >= 3403 && a <= 3890))) continue;
        const outermostX = Math.max(Math.abs(positions.getX(a)), Math.abs(positions.getX(b)), Math.abs(positions.getX(c)));
        if (outermostX <= 1.4 && Math.max(positions.getZ(a), positions.getZ(b), positions.getZ(c)) <= 1.5
          && !(armTrim && (onFixedArm(a) || onFixedArm(b) || onFixedArm(c)))) {
          kept.push(a, b, c);
        }
      }
      if (kept.length !== count) {
        geometry.setIndex(kept);
        geometry.boundingBox = null;
        geometry.boundingSphere = null;
      }
    }
    // Both NASA assets use the same axes and deck origin. Copy only the
    // science payload, keeping the Deployed body, solar arrays and robot arm.
    for (const name of ['SEIS', 'WTS', 'HP3_v3d_baked']) {
      const instrument = instruments.scene.getObjectByName(name);
      if (!instrument) throw new Error('Missing InSight instrument: ' + name);
      deployed.scene.add(instrument.clone(true));
    }
    return deployed;
  }

export function fitModel(scene, filename, { meters, framing }) {
  const object = scene.clone(true);
  object.traverse(part => {
    if (!part.isMesh) return;
    part.castShadow = true;
    part.receiveShadow = true;
  });
  const box = new THREE.Box3().setFromObject(object, true);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  let referenceSpan = Math.max(size.x, size.z);
  if (filename === 'mer-articulated.glb') referenceSpan = size.x;
  if (filename === 'ingenuity.glb') {
    const rotor = object.getObjectByName('rotors_01');
    const shaft = rotor.getWorldPosition(new THREE.Vector3());
    const vertex = new THREE.Vector3();
    let radius = 0;
    rotor.traverse(part => {
      if (!part.isMesh) return;
      const positions = part.geometry.getAttribute('position');
      for (let i = 0; i < positions.count; i++) {
        vertex.fromBufferAttribute(positions, i).applyMatrix4(part.matrixWorld);
        radius = Math.max(radius, Math.hypot(vertex.x - shaft.x, vertex.z - shaft.z));
      }
    });
    referenceSpan = radius * 2;
  }
  if (filename === 'insight-deployed.glb') {
    const arrays = new THREE.Box3().setFromObject(object.getObjectByName('panel_l_root'), true);
    arrays.expandByObject(object.getObjectByName('panel_r_root'), true);
    referenceSpan = arrays.max.x - arrays.min.x;
  }
  const scale = meters / referenceSpan;
  const wrapper = new THREE.Group();
  object.position.sub(new THREE.Vector3(center.x, box.min.y, center.z));
  wrapper.scale.setScalar(scale);
  wrapper.position.y = -.075;
  wrapper.userData.focusHeight = size.y * scale * .46;
  wrapper.userData.framing = framing ?? Math.max(.64, meters / 3);
  wrapper.add(object);
  return wrapper;
}
