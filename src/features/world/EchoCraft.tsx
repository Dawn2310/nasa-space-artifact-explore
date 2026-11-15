// Original fictional guide: machined titanium, panel seams and three engine pods.
import { useEffect, useMemo, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { DataTexture, PMREMGenerator, RepeatWrapping, RGBAFormat, Vector2 } from 'three';
import type { Texture } from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export default function EchoCraft({ flying }: { flying: boolean }) {
  const renderer = useThree((state) => state.gl);
  const [reflection, setReflection] = useState<Texture | null>(null);
  const grain = useMemo(() => {
    const bytes = new Uint8Array(128 * 32 * 4);
    for (let y = 0; y < 32; y++) for (let x = 0; x < 128; x++) {
      const i = (y * 128 + x) * 4;
      const value = 155 + Math.round(24 * Math.sin(y * 12.7) + 8 * Math.sin(x * 1.9 + y * 4.3));
      bytes[i] = bytes[i + 1] = bytes[i + 2] = value; bytes[i + 3] = 255;
    }
    const texture = new DataTexture(bytes, 128, 32, RGBAFormat);
    texture.wrapS = texture.wrapT = RepeatWrapping;
    texture.repeat.set(4, 2); texture.needsUpdate = true;
    return texture;
  }, []);
  const profile = useMemo(() => [[0.08, -0.13], [0.27, -0.12], [0.5, -0.07], [0.6, 0], [0.55, 0.055], [0.37, 0.13], [0.25, 0.15]]
    .map(([x, y]) => new Vector2(x, y)), []);
  useEffect(() => {
    const room = new RoomEnvironment();
    const generator = new PMREMGenerator(renderer);
    const target = generator.fromScene(room, 0.08);
    setReflection(target.texture);
    room.dispose(); generator.dispose();
    return () => target.dispose();
  }, [renderer]);
  useEffect(() => () => grain.dispose(), [grain]);
  const metal = { envMap: reflection, envMapIntensity: 0.85, metalness: 0.94, roughness: 0.65, roughnessMap: grain, bumpMap: grain, bumpScale: 0.0015 };
  return <group>
    <mesh raycast={() => {}}><latheGeometry args={[profile, 72]} /><meshStandardMaterial {...metal} color="#899397" /></mesh>
    <mesh position-y={0.145} scale={[1, 0.7, 1]} raycast={() => {}}>
      <sphereGeometry args={[0.25, 40, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial color="#0a202b" metalness={0.65} roughness={0.17} envMap={reflection} envMapIntensity={1.25} />
    </mesh>
    {[{ radius: 0.25, y: 0.145, width: 0.018 }, { radius: 0.595, y: 0, width: 0.012 }, { radius: 0.46, y: -0.09, width: 0.013 }].map(({ radius, y, width }) =>
      <mesh key={radius} position-y={y} rotation-x={Math.PI / 2} raycast={() => {}}>
        <torusGeometry args={[radius, width, 8, 72]} /><meshStandardMaterial {...metal} color="#333b3f" />
      </mesh>)}
    {Array.from({ length: 16 }, (_, i) => {
      const angle = i * Math.PI / 8;
      return <group key={i} rotation-y={angle}>
        <mesh position={[0.5, 0.075, 0]} raycast={() => {}}><cylinderGeometry args={[0.011, 0.011, 0.012, 6]} /><meshStandardMaterial {...metal} color="#c1c3b9" /></mesh>
        <mesh position={[0.4, 0.115, 0]} rotation-z={-0.27} raycast={() => {}}><boxGeometry args={[0.17, 0.004, 0.005]} /><meshStandardMaterial color="#343d40" roughness={0.8} /></mesh>
        {i % 2 === 0 && <mesh position={[0.566, -0.005, 0]} raycast={() => {}}><boxGeometry args={[0.014, 0.025, 0.065]} /><meshStandardMaterial color="#72c5d6" emissive={i % 4 ? '#dc9c4f' : '#69c9e3'} emissiveIntensity={0.85} metalness={0.4} roughness={0.35} /></mesh>}
      </group>;
    })}
    {[0, 1, 2].map((i) => <group key={i} rotation-y={i * Math.PI * 2 / 3}>
      <group position={[0.23, -0.135, 0]}>
        <mesh raycast={() => {}}><cylinderGeometry args={[0.07, 0.085, 0.085, 20]} /><meshStandardMaterial {...metal} color="#353e43" /></mesh>
        <mesh position-y={-0.05} rotation-x={Math.PI / 2} raycast={() => {}}><torusGeometry args={[0.057, 0.009, 8, 24]} /><meshBasicMaterial color="#79def2" toneMapped={false} /></mesh>
        <mesh position-y={flying ? -0.12 : -0.07} rotation-x={Math.PI} raycast={() => {}}>
          <coneGeometry args={[0.045, flying ? 0.15 : 0.045, 16]} /><meshBasicMaterial color="#74ceec" transparent opacity={flying ? 0.65 : 0.22} depthWrite={false} />
        </mesh>
      </group>
    </group>)}
  </group>;
}
