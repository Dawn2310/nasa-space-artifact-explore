// Decorative 3D background. NASA sky map + an illustrative spiral particle cloud.
// Meteor streaks are a cinematic effect, not a simulation of atmospheric meteors.
import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { AdditiveBlending, BackSide, Color, NoColorSpace, Quaternion, Vector3 } from 'three';
import type { Group, Mesh, MeshBasicMaterial } from 'three';
import { usePlanetTexture } from './parts';
import { GALAXIES, METEOR_COUNT, meteorTiming } from './scene-motion';
import { makeSkyGeometry, SKY_ORIENTATION, skyFragment, skyVertex } from './sky-background';
import { useHdrSky } from './use-hdr-sky';
import BlackHoleBackdrop from './BlackHoleBackdrop';

function seededRandom(seed: number) {
  let value = seed;
  return () => {
    value = (Math.imul(value, 1664525) + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

const particleVertex = `
  attribute float aSize;
  varying vec3 vColor;
  void main() {
    vColor = color;
    vec4 p = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = clamp(aSize * (470.0 / max(1.0, -p.z)), 1.0, 5.0);
    gl_Position = projectionMatrix * p;
  }
`;
const particleFragment = `
  varying vec3 vColor;
  void main() {
    float r = length(gl_PointCoord - 0.5) * 2.0;
    float alpha = exp(-r * r * 4.5) * (1.0 - smoothstep(0.65, 1.0, r));
    gl_FragColor = vec4(vColor, alpha * 0.65);
    #include <colorspace_fragment>
  }
`;

function SpiralGalaxy({ config, animate }: { config: typeof GALAXIES[number]; animate: boolean }) {
  const stars = useRef<Group>(null);
  useFrame((_, delta) => {
    if (animate && stars.current) stars.current.rotation.z += Math.min(delta, 0.05) * config.speed;
  });
  const data = useMemo(() => {
    const random = seededRandom(config.seed);
    const count = config.count;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const core = new Color('#ffe9c3');
    const arms = new Color('#8fafff');
    const dust = new Color('#c882bf');
    const color = new Color();
    for (let i = 0; i < count; i++) {
      const radius = Math.pow(random(), 1.8) * 165;
      const angle = (i % 4) * Math.PI / 2 + radius * 0.043;
      const scatter = 3 + radius * 0.10;
      positions[i * 3] = Math.cos(angle) * radius + (random() - 0.5) * scatter;
      positions[i * 3 + 1] = Math.sin(angle) * radius + (random() - 0.5) * scatter;
      positions[i * 3 + 2] = (random() - 0.5) * (4 + 12 * Math.exp(-radius / 35));
      color.copy(core).lerp(i % 7 === 0 ? dust : arms, Math.min(1, radius / 85));
      color.multiplyScalar(0.65 + random() * 0.55);
      color.toArray(colors, i * 3);
      sizes[i] = 1 + random() * 2.5;
    }
    return { positions, colors, sizes };
  }, [config.seed, config.count]);
  return (
    <group position={[...config.position]} rotation={[...config.rotation]} scale={config.scale}>
      <group ref={stars}>
        <points raycast={() => {}} frustumCulled={false} renderOrder={-80}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[data.positions, 3]} />
            <bufferAttribute attach="attributes-color" args={[data.colors, 3]} />
            <bufferAttribute attach="attributes-aSize" args={[data.sizes, 1]} />
          </bufferGeometry>
          <shaderMaterial vertexShader={particleVertex} fragmentShader={particleFragment}
            vertexColors transparent depthWrite={false} blending={AdditiveBlending} toneMapped={false} />
        </points>
      </group>
    </group>
  );
}

const trailVertex = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const trailFragment = `
  varying vec2 vUv;
  uniform float opacity;
  void main() {
    float d = abs(vUv.y - 0.5);
    float across = exp(-d * d * 140.0) + 0.35 * exp(-d * d * 18.0);
    float tail = pow(vUv.x, 1.35);
    vec3 color = mix(vec3(0.3, 0.55, 1.0), vec3(1.0, 0.97, 0.88), vUv.x) * 1.8;
    gl_FragColor = vec4(color, min(1.0, across * tail * opacity));
    #include <colorspace_fragment>
  }
`;

function MeteorStreak({ index, animate }: { index: number; animate: boolean }) {
  const meteor = useRef<Group>(null);
  const head = useRef<Mesh>(null);
  const outerTrail = useRef<MeshBasicMaterial>(null);
  const coreTrail = useRef<MeshBasicMaterial>(null);
  const elapsed = useRef(0);
  const lastCycle = useRef(-1);
  const spawn = useRef(new Vector3());
  const direction = useRef(new Vector3());
  const orientation = useRef(new Quaternion());
  const uniforms = useMemo(() => ({ opacity: { value: 0 } }), []);
  const aspect = useThree((state) => state.size.width / Math.max(1, state.size.height));
  const angle = -0.22 - (index % 4) * 0.12;
  const length = 60 + (index % 4) * 12;
  useFrame(({ camera }, delta) => {
    const group = meteor.current;
    if (!group) return;
    if (!animate) { group.visible = false; return; }
    elapsed.current += Math.min(delta, 0.05);
    const timing = meteorTiming(index, elapsed.current);
    group.visible = timing.active;
    if (!group.visible) return;
    const span = Math.min(220, Math.max(100, aspect * 130));
    if (lastCycle.current !== timing.cycle) {
      lastCycle.current = timing.cycle;
      // Choose a visible starting point once. A streak then keeps its world-space
      // direction even if the viewer turns the camera during its flight.
      spawn.current.set(-span * 0.85, 108 - (index % 6) * 34, -270 - (index % 3) * 28)
        .applyQuaternion(camera.quaternion).add(camera.position);
      direction.current.set(Math.cos(angle), Math.sin(angle), 0.03).normalize().applyQuaternion(camera.quaternion);
      orientation.current.setFromAxisAngle(new Vector3(0, 0, 1), angle).premultiply(camera.quaternion);
      group.quaternion.copy(orientation.current);
    }
    group.position.copy(spawn.current).addScaledVector(direction.current, timing.progress * span * 1.9);
    uniforms.opacity.value = timing.opacity;
    if (outerTrail.current) outerTrail.current.opacity = timing.opacity * 0.65;
    if (coreTrail.current) coreTrail.current.opacity = timing.opacity;
    if (head.current) head.current.scale.setScalar(timing.opacity);
  });
  return (
    <group ref={meteor} visible={false}>
      {/* Tapered 3D cores stay visible from oblique camera angles as well. */}
      <mesh position={[-length / 2, 0, 0]} rotation-z={-Math.PI / 2} raycast={() => {}}>
        <cylinderGeometry args={[0.9, 0.015, length, 8]} />
        <meshBasicMaterial ref={outerTrail} color="#79cfff" transparent depthWrite={false}
          blending={AdditiveBlending} toneMapped={false} />
      </mesh>
      <mesh position={[-length * 0.42, 0, 0]} rotation-z={-Math.PI / 2} raycast={() => {}}>
        <cylinderGeometry args={[0.25, 0.008, length * 0.84, 8]} />
        <meshBasicMaterial ref={coreTrail} color="#fff5d9" transparent depthWrite={false}
          blending={AdditiveBlending} toneMapped={false} />
      </mesh>
      <mesh position={[-length / 2, 0, 0]} raycast={() => {}} renderOrder={-50}>
        <planeGeometry args={[length, 6]} />
        <shaderMaterial uniforms={uniforms} vertexShader={trailVertex} fragmentShader={trailFragment}
          transparent depthWrite={false} blending={AdditiveBlending} toneMapped={false} />
      </mesh>
      <mesh ref={head} raycast={() => {}}>
        <sphereGeometry args={[0.65, 12, 8]} />
        <meshBasicMaterial color="#fff3d6" toneMapped={false} />
      </mesh>
    </group>
  );
}

export function SpaceBackdrop({ animate }: { animate: boolean }) {
  const hdr = useHdrSky();
  const sky = usePlanetTexture(hdr ? null : '/assets/images/deep-star-map-galactic-8k.jpg', NoColorSpace);
  const photo = usePlanetTexture('/assets/images/milky-way-panorama.jpg', NoColorSpace);
  const dome = useRef<Mesh>(null);
  const geometry = useMemo(makeSkyGeometry, []);
  const uniforms = useMemo(() => ({ panorama: { value: photo }, stars: { value: sky }, hdrSky: { value: hdr }, hasHdr: { value: !!hdr } }), [photo, sky, hdr]);
  useFrame(({ camera }) => {
    if (dome.current) dome.current.position.copy(camera.position);
  });
  return (
    <>
      <mesh ref={dome} geometry={geometry} quaternion={SKY_ORIENTATION} raycast={() => {}} renderOrder={-100}>
        {photo && (sky || hdr)
          ? <shaderMaterial key={skyFragment} uniforms={uniforms} vertexShader={skyVertex} fragmentShader={skyFragment}
              side={BackSide} depthWrite={false} toneMapped={false} />
          : <meshBasicMaterial map={sky} color={sky ? '#40434a' : '#05070d'}
              side={BackSide} depthWrite={false} toneMapped={false} />}
      </mesh>
      {GALAXIES.map((config) => <SpiralGalaxy key={config.seed} config={config} animate={animate} />)}
      <BlackHoleBackdrop animate={animate} />
      {Array.from({ length: METEOR_COUNT }, (_, index) => <MeteorStreak key={index} index={index} animate={animate} />)}
    </>
  );
}
