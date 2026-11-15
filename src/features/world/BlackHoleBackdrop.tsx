import { useEffect, useMemo, useState } from 'react';
import { DoubleSide, NoColorSpace, Quaternion, Vector3, VideoTexture } from 'three';
import { usePlanetTexture } from './parts';
import { SceneLabel } from './labels';
import { BLACK_HOLES } from './scene-motion';

// A distant NASA visualization, not a black hole placed inside the solar system.
const vertex = `varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;
const fragment = `
  uniform sampler2D image; varying vec2 vUv;
  void main(){
    vec3 c=sRGBTransferEOTF(texture2D(image,vUv)).rgb;
    float light=max(c.r,max(c.g,c.b));
    float shadow=1.0-smoothstep(0.082,0.095,length(vUv-0.5));
    float edge=smoothstep(0.0,0.035,min(min(vUv.x,vUv.y),min(1.0-vUv.x,1.0-vUv.y)));
    float alpha=max(shadow,smoothstep(0.001,0.015,light))*edge;
    gl_FragColor=vec4(c*1.15,alpha);
    #include <colorspace_fragment>
  }
`;

function BlackHoleImage({ config, uniforms }: {
  config: typeof BLACK_HOLES[number];
  uniforms: { image: { value: ReturnType<typeof usePlanetTexture> } };
}) {
  // Point inward once, in world space. Do not turn the image with the camera.
  const orientation = useMemo(() => new Quaternion()
    .setFromUnitVectors(new Vector3(0, 0, 1), new Vector3(...config.position).negate().normalize())
    .multiply(new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), config.roll)), [config]);
  return <group position={[...config.position]} quaternion={orientation}>
    {uniforms.image.value && <mesh raycast={() => {}} renderOrder={-60}>
      <planeGeometry args={[config.size, config.size]} />
      <shaderMaterial uniforms={uniforms} vertexShader={vertex} fragmentShader={fragment}
        transparent side={DoubleSide} depthWrite={false} toneMapped={false} />
    </mesh>}
    <SceneLabel position={[0, -config.size * 0.31, 0]} active={false}>
      <span className="world-label__mission">Distant black hole</span>
    </SceneLabel>
  </group>;
}

export default function BlackHoleBackdrop({ animate }: { animate: boolean }) {
  const poster = usePlanetTexture('/assets/images/black-hole-nasa.jpg', NoColorSpace);
  const [movie, setMovie] = useState<VideoTexture | null>(null);
  useEffect(() => {
    if (!animate) return;
    let active = true;
    const video = document.createElement('video');
    video.muted = true; video.loop = true; video.playsInline = true; video.preload = 'auto';
    video.playbackRate = 0.65;
    const texture = new VideoTexture(video);
    texture.colorSpace = NoColorSpace;
    const ready = () => { if (active) setMovie(texture); };
    const visibility = () => { if (document.hidden) video.pause(); else void video.play().catch(() => {}); };
    video.addEventListener('loadeddata', ready);
    document.addEventListener('visibilitychange', visibility);
    video.src = '/assets/video/black-hole-nasa.webm';
    void video.play().catch(() => {});
    return () => {
      active = false;
      document.removeEventListener('visibilitychange', visibility);
      video.removeEventListener('loadeddata', ready);
      video.pause(); video.removeAttribute('src'); video.load();
      texture.dispose(); setMovie(null);
    };
  }, [animate]);
  const map = movie ?? poster;
  const uniforms = useMemo(() => ({ image: { value: map } }), [map]);
  return <>{BLACK_HOLES.map((config, index) => <BlackHoleImage key={index} config={config} uniforms={uniforms} />)}</>;
}
