import { BufferAttribute, Quaternion, SphereGeometry, Vector3 } from 'three';

// Mellinger's all-sky photo uses Hammer-Aitoff, not a rectangular sphere map.
// Map longitude/latitude into the photographed ellipse, avoiding its black corners.
export function panoramaUv(longitude: number, latitude: number): [number, number] {
  const cosLatitude = Math.cos(latitude);
  const denominator = Math.sqrt(1 + cosLatitude * Math.cos(longitude / 2));
  return [
    0.5 + 0.5 * cosLatitude * Math.sin(longitude / 2) / denominator,
    0.5 + 0.5 * Math.sin(latitude) / denominator,
  ];
}

export function makeSkyGeometry() {
  const geometry = new SphereGeometry(650, 192, 96);
  const uv = geometry.getAttribute('uv');
  const panorama = new Float32Array(uv.count * 2);
  for (let i = 0; i < uv.count; i++) {
    const [u, v] = panoramaUv((uv.getX(i) - 0.5) * Math.PI * 2, (uv.getY(i) - 0.5) * Math.PI);
    panorama[i * 2] = u;
    panorama[i * 2 + 1] = v;
  }
  geometry.setAttribute('panoramaUv', new BufferAttribute(panorama, 2));
  return geometry;
}

// Fixed world orientation: the dust lane crosses the overview diagonally.
// Translation follows the camera so distant stars have no nearby-object parallax.
const direction = new Vector3(-0.4, -0.474, -0.899).normalize();
export const SKY_ORIENTATION = new Quaternion().setFromAxisAngle(direction, -0.36)
  .multiply(new Quaternion().setFromUnitVectors(new Vector3(1, 0, 0), direction));

export const skyVertex = `
  attribute vec2 panoramaUv;
  varying vec2 vSkyUv;
  varying vec2 vPanoramaUv;
  void main() {
    vSkyUv = uv;
    vPanoramaUv = panoramaUv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const skyFragment = `
  uniform sampler2D panorama;
  uniform sampler2D stars;
  uniform sampler2D hdrSky;
  uniform bool hasHdr;
  varying vec2 vSkyUv;
  varying vec2 vPanoramaUv;
  void main() {
    // Input JPEGs are sampled as raw sRGB and decoded once, explicitly.
    vec3 photo = sRGBTransferEOTF(texture2D(panorama, vPanoramaUv)).rgb;
    vec3 catalog = hasHdr ? vec3(0.0) : sRGBTransferEOTF(texture2D(stars, vSkyUv)).rgb;
    // Keep real photographic dust/color; add only the sharp catalog stars.
    // Both inputs are in galactic coordinates. No random stars or noise layers.
    vec3 dust = max(photo - vec3(0.025), vec3(0.0)) * (hasHdr ? 0.055 : 0.16);
    vec3 detail = max(catalog - vec3(0.08), vec3(0.0)) * 0.48;
    vec3 hdr = hasHdr ? max(texture2D(hdrSky,vSkyUv).rgb,vec3(0.0)) : vec3(0.0);
    vec3 film = vec3(1.0)-exp(-hdr*0.8);
    gl_FragColor = vec4(dust + detail + film, 1.0);
    #include <colorspace_fragment>
  }
`;
