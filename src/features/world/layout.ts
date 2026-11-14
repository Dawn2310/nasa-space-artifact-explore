// Bố cục dùng chung với agent ui-story và các tư thế camera của ba tầng.

import type { ArtifactId, ViewState } from '../../shared/contracts';

/** Từ bề rộng này trở lên, panel thẻ/chat của UI che ~440px bên phải ở tầng artifact. */
export const WIDE_BREAKPOINT_PX = 900;
export const UI_PANEL_WIDTH_PX = 440;
/** Dưới breakpoint, panel của UI che ~55% phía dưới. */
export const UI_PANEL_BOTTOM_FRACTION = 0.55;

export const CAMERA_FOV_DEG = 45;
const TAN_HALF_FOV = Math.tan((CAMERA_FOV_DEG / 2) * (Math.PI / 180));

export const GLOBE_RADIUS = 2;
/** Model được chuẩn hóa để nằm gọn trong cầu bán kính này. */
export const MODEL_RADIUS = 1;
/** Bán kính ngoài cùng của sơ đồ hệ Mặt Trời (chấm Pioneer). */
export const SOLAR_EXTENT = 22;

export type Level = ViewState['level'];

/** Đối tượng đang được trỏ/focus; `source` cho biết đến từ canvas hay từ danh sách nút. */
export interface ActiveTarget {
  id: 'moon' | 'mars' | ArtifactId;
  source: 'pointer' | 'list';
}

export interface CameraPose {
  position: [number, number, number];
  distance: number;
}

function along(direction: [number, number, number], distance: number): [number, number, number] {
  const length = Math.hypot(...direction);
  return [(direction[0] / length) * distance, (direction[1] / length) * distance, (direction[2] / length) * distance];
}

/**
 * Chỗ thanh trên cùng của UI chiếm (ƯỚC LƯỢNG từ ảnh chụp thử: ~62px khi rộng, ~140px khi
 * hẹp vì thanh xuống dòng) và chỗ dành cho chú thích + nhãn "Not to scale" ở đáy vùng trống.
 */
const TOP_INSET_PX = { wide: 64, narrow: 132 };
const BOTTOM_INSET_PX = 56;

/**
 * Vùng màn hình dành cho model ở tầng artifact (không bị panel/thanh của UI che), tính bằng
 * px; và độ dịch khung nhìn để tâm cảnh rơi vào tâm vùng đó. Các tầng khác: toàn màn hình.
 */
export function freeArea(level: Level, width: number, height: number) {
  if (level !== 'artifact') return { width, height, offsetX: 0, offsetY: 0 };
  const wide = width >= WIDE_BREAKPOINT_PX;
  const right = wide ? width - Math.min(UI_PANEL_WIDTH_PX, width * 0.6) : width;
  const top = wide ? TOP_INSET_PX.wide : Math.min(TOP_INSET_PX.narrow, height * 0.2);
  const bottom = (wide ? height : height * (1 - UI_PANEL_BOTTOM_FRACTION)) - BOTTOM_INSET_PX;
  const freeHeight = Math.max(80, bottom - top);
  return {
    width: right,
    height: freeHeight,
    // Dịch khung nhìn sang phải/xuống dưới => cảnh hiện lệch sang trái/lên trên.
    offsetX: width / 2 - right / 2,
    offsetY: height / 2 - (top + freeHeight / 2),
  };
}

/** Tư thế camera đích của mỗi tầng; mọi cảnh đặt tâm tại gốc tọa độ. */
export function poseFor(level: Level, width: number, height: number): CameraPose {
  const aspect = width / Math.max(1, height);
  if (level === 'solar') {
    const distance = Math.min(62, Math.max(40, SOLAR_EXTENT / (TAN_HALF_FOV * aspect)));
    const elevation = (38 * Math.PI) / 180;
    return { position: [0, distance * Math.sin(elevation), distance * Math.cos(elevation)], distance };
  }
  if (level === 'surface') {
    const distance = (GLOBE_RADIUS * 1.35) / (TAN_HALF_FOV * Math.min(1, aspect));
    return { position: along([0, 0.25, 1], distance), distance };
  }
  // Nửa chiều cao màn hình ứng với TAN_HALF_FOV; vùng trống chỉ chiếm một phần của nó.
  const free = freeArea(level, width, height);
  const fit = TAN_HALF_FOV * Math.min(free.height / height, free.width / height);
  const distance = (MODEL_RADIUS * 1.15) / fit;
  return { position: along([0.55, 0.35, 1], distance), distance };
}

export const TEXTURE_URLS = {
  earth: '/assets/textures/earth.jpg',
  mars: '/assets/textures/mars.jpg',
  /** CHƯA có file (xem content/assets.json › stillToDownload). Tải lỗi => globe xám phẳng. */
  moon: '/assets/textures/moon.jpg',
} as const;

export const FLAT_COLORS = {
  earth: '#3f6fb0',
  mars: '#b0653a',
  moon: '#8c8c8c',
} as const;
