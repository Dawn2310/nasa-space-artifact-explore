// NASA's original planet models, with lightweight presentation lighting and glow.
// GLB geometry, textures and materials are preserved; only display scale/rotation change.
import { Component, Suspense, useEffect, useMemo, useRef } from 'react';
import type { ReactNode } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Billboard } from '@react-three/drei';
import { AdditiveBlending, BackSide, Box3, Color, Vector3 } from 'three';
import type { Group } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Globe } from './parts';
import { cancelDisposal, configureLoader } from './ArtifactScene';

class PlanetBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: unknown) { console.warn('[planet] NASA model unavailable; using globe fallback.', error); }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

function NasaPlanet({ url, radius }: { url: string; radius: number }) {
  const gltf = useLoader(GLTFLoader, url, configureLoader);
  useEffect(() => { cancelDisposal(url); }, [url]);
  const { scene, scale, offset } = useMemo(() => {
    const scene = gltf.scene.clone(true);
    scene.updateMatrixWorld(true);
    // Saturn's rings are wider than the planet: normalize by the spherical body.
    const body = scene.getObjectByName('Saturn.001') ?? scene;
    const box = new Box3().setFromObject(body);
    const size = box.getSize(new Vector3());
    const center = box.getCenter(new Vector3());
    return {
      scene,
      scale: (radius * 2) / Math.max(size.x, size.y, size.z, 0.001),
      offset: center.multiplyScalar(-1),
    };
  }, [gltf, radius]);
  return <group scale={scale}><primitive object={scene} position={offset} dispose={null} /></group>;
}

/** Spacecraft use their actual model silhouette; no spherical marker fallback. */
export function SpacecraftVisual({ url, radius }: { url: string; radius: number }) {
  return (
    <PlanetBoundary fallback={null}>
      <Suspense fallback={null}><NasaPlanet url={url} radius={radius} /></Suspense>
    </PlanetBoundary>
  );
}

const atmosphereVertex = `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-viewPosition.xyz);
    gl_Position = projectionMatrix * viewPosition;
  }
`;

const atmosphereFragment = `
  uniform vec3 glowColor;
  uniform float strength;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float rim = pow(1.0 - abs(dot(normalize(vNormal), normalize(vView))), 3.0);
    gl_FragColor = vec4(glowColor, rim * strength);
  }
`;

export function Atmosphere({ radius, color, strength = 0.55 }: { radius: number; color: string; strength?: number }) {
  const uniforms = useMemo(() => ({ glowColor: { value: new Color(color) }, strength: { value: strength } }), [color, strength]);
  return (
    <mesh scale={1.075} raycast={() => {}}>
      <sphereGeometry args={[radius, 64, 40]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={atmosphereVertex}
        fragmentShader={atmosphereFragment}
        transparent side={BackSide} depthWrite={false} blending={AdditiveBlending}
      />
    </mesh>
  );
}

interface PlanetVisualProps {
  radius: number;
  color: string;
  textureUrl?: string;
  modelUrl?: string;
  atmosphere?: string;
  tilt?: number;
  spin?: number;
  paused: boolean;
}

export function PlanetVisual({ radius, color, textureUrl, modelUrl, atmosphere, tilt = 0, spin = 0.08, paused }: PlanetVisualProps) {
  const rotation = useRef<Group>(null);
  useFrame((_, delta) => {
    if (!paused && rotation.current) rotation.current.rotation.y += Math.min(delta, 0.05) * spin;
  });
  const fallback = <Globe radius={radius} textureUrl={textureUrl ?? null} flatColor={color} />;
  return (
    <group rotation-z={tilt}>
      <group ref={rotation}>
        {modelUrl ? (
          <PlanetBoundary fallback={fallback}>
            <Suspense fallback={fallback}><NasaPlanet url={modelUrl} radius={radius} /></Suspense>
          </PlanetBoundary>
        ) : fallback}
      </group>
      {atmosphere && <Atmosphere radius={radius} color={atmosphere} />}
    </group>
  );
}

const glowVertex = `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;

const glowFragment = `
  varying vec2 vUv;
  void main() {
    float r = length(vUv - 0.5) * 2.0;
    float alpha = exp(-r * 5.0) * (1.0 - smoothstep(0.7, 1.0, r));
    vec3 color = mix(vec3(1.0, 0.20, 0.015), vec3(1.0, 0.68, 0.20), exp(-r * 4.0));
    gl_FragColor = vec4(color, alpha * 0.8);
  }
`;

export function SunVisual({ paused }: { paused: boolean }) {
  return (
    <group>
      <PlanetVisual radius={1.3} color="#ffb23f" modelUrl="/assets/models/planet-sun.glb" spin={0.035} paused={paused} />
      <Billboard>
        <mesh raycast={() => {}}>
          <planeGeometry args={[11, 11]} />
          <shaderMaterial vertexShader={glowVertex} fragmentShader={glowFragment}
            transparent depthWrite={false} blending={AdditiveBlending} toneMapped={false} />
        </mesh>
      </Billboard>
      <Atmosphere radius={1.3} color="#ff992e" strength={0.85} />
    </group>
  );
}
