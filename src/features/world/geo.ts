// Toán tọa độ thuần (không import gì) để node chạy kiểm tra trực tiếp: xem geo.check.mjs.
//
// Quy ước hình học của THREE.SphereGeometry (three r187), với u = cột ảnh / chiều rộng:
//   x = -r·cos(lat)·cos(2πu),  y = r·sin(lat),  z = r·cos(lat)·sin(2πu)
// Ảnh equirectangular có mép trái ở kinh độ Đông `leftEdgeLonEastDeg` thì
//   u = ((lonEast - leftEdgeLonEastDeg) mod 360) / 360.

/**
 * Kinh độ (Đông dương, độ) nằm ở MÉP TRÁI của public/assets/textures/mars.jpg.
 * -180 nghĩa là ảnh có tâm ở kinh độ 0° (mép trái/phải = 180°).
 *
 * Bằng chứng (world3d nhìn ảnh 1440x720 bằng mắt, chưa kiểm trong trình duyệt):
 *  - Olympus Mons (18.65°N, 226.2°E): miệng núi lửa tròn thấy ở khoảng x≈185, y≈285;
 *    với mép trái = -180 công thức cho x=184.8, y=285.4.
 *  - Hellas (≈42°S, 70°E): vùng bầu dục sáng ở x≈990, y≈525; công thức cho x=1000, y=528.
 *  - Syrtis Major (≈8°N, 67°E): vệt tối ở x≈950–1040, y≈260–400; công thức cho x=988, y=328.
 *  - Valles Marineris (≈14°S, 270–330°E): khe nứt chạy x≈330–500, y≈380–420; công thức cho x=360–600, y=416.
 * Sai số đọc ảnh ước chừng ±15 px ≈ ±4° kinh độ. Đây là hằng số DUY NHẤT cần sửa nếu lệch.
 */
export const MARS_TEXTURE_LEFT_EDGE_LON_EAST_DEG = -180;

/**
 * textures/moon.jpg: bản đồ LROC từ NASA SVS CGI Moon Kit 4720, tâm ở kinh độ 0°
 * theo mô tả của NASA. Mép ảnh ở -180°/+180°; giữ cùng phép chiếu equirectangular.
 */
export const MOON_TEXTURE_LEFT_EDGE_LON_EAST_DEG = -180;

export interface ParsedConvention {
  /** true: kinh độ tăng về phía Đông. */
  eastPositive: boolean;
  /** Dải kinh độ mà nguồn dùng; null nếu chuỗi không nói. */
  range: '0-360' | '-180-180' | null;
  /** false khi chuỗi không nói rõ Đông/Tây: đang dùng mặc định Đông dương. */
  directionStated: boolean;
}

/** Đọc chuỗi quy ước của nguồn, ví dụ "planetocentric, east-positive, 0-360". */
export function parseConvention(convention: string): ParsedConvention {
  const text = convention.toLowerCase();
  const west =
    /west(?:ward)?[\s-]*(?:positive|longitude)/.test(text) || /positive[\s-]*(?:to[\s-]*the[\s-]*)?west/.test(text);
  const east =
    /east(?:ward)?[\s-]*(?:positive|longitude)/.test(text) || /positive[\s-]*(?:to[\s-]*the[\s-]*)?east/.test(text);
  let range: ParsedConvention['range'] = null;
  if (/(?:^|[^\d])0\s*(?:-|–|to|\.\.)\s*360/.test(text)) range = '0-360';
  else if (/[-−–]\s*180|±\s*180|\+\/-\s*180/.test(text)) range = '-180-180';
  return {
    eastPositive: west && !east ? false : true,
    range,
    directionStated: west !== east,
  };
}

/** Đưa kinh độ của nguồn về Đông dương trong [-180, 180). */
export function toEastLongitudeDeg(longitudeDeg: number, convention: string): number {
  const { eastPositive } = parseConvention(convention);
  const east = eastPositive ? longitudeDeg : -longitudeDeg;
  return ((((east + 180) % 360) + 360) % 360) - 180;
}

/**
 * Hàm DUY NHẤT đổi (vĩ độ, kinh độ) của nguồn thành vị trí trên cầu, trong hệ tọa độ
 * cục bộ của mesh THREE.SphereGeometry (marker là con của globe nên quay cùng globe).
 *
 * Vĩ độ dùng nguyên giá trị nguồn: chênh lệch planetographic/planetocentric trên sao Hỏa
 * tối đa khoảng 0.3°, nhỏ hơn kích thước marker, nên không quy đổi.
 */
export function latLonToVec3(
  latitudeDeg: number,
  longitudeDeg: number,
  radius: number,
  convention: string,
  leftEdgeLonEastDeg: number = -180,
): [number, number, number] {
  const lonEast = toEastLongitudeDeg(longitudeDeg, convention);
  const u = ((((lonEast - leftEdgeLonEastDeg) % 360) + 360) % 360) / 360;
  const phi = u * 2 * Math.PI;
  const lat = (latitudeDeg * Math.PI) / 180;
  const x = -radius * Math.cos(lat) * Math.cos(phi);
  const y = radius * Math.sin(lat);
  const z = radius * Math.cos(lat) * Math.sin(phi);
  return [x, y, z];
}

/** Điểm ảnh (cột, hàng) của một tọa độ trên ảnh equirectangular: dùng để đối chiếu texture. */
export function latLonToTexturePixel(
  latitudeDeg: number,
  longitudeDeg: number,
  convention: string,
  leftEdgeLonEastDeg: number,
  imageWidth: number,
  imageHeight: number,
): [number, number] {
  const lonEast = toEastLongitudeDeg(longitudeDeg, convention);
  const u = ((((lonEast - leftEdgeLonEastDeg) % 360) + 360) % 360) / 360;
  const v = (90 - latitudeDeg) / 180;
  return [u * imageWidth, v * imageHeight];
}
