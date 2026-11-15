// Tầng surface dùng bản đồ nhiệm vụ Three.js thuần, nhúng bằng iframe cùng origin:
// - Sao Hỏa: mars-missions/, 8 thiết bị dùng chung cho khám phá và UFO.
// - Mặt Trăng: moon-missions/ (từ Nasa_Space_Apps_Challenge-moon), 4 thiết bị.
// Mỗi trang tự lo mô hình 3D, hoạt cảnh và chat kể chuyện ngôi thứ nhất (tên lửa chibi, POST /api/chat).
// Trong Legacy Voyage (tour): ?tour=1 ẩn giao diện riêng của trang, ?mission=<id> mở thẳng thiết bị.

import type { VoyageTour } from '../../shared/app-types';

const PAGES = {
  mars: { src: '/mars-missions/', title: 'Mars mission map: eight machines left on Mars' },
  moon: { src: '/moon-missions/', title: 'Moon mission map: four machines left on the Moon' },
} as const;

export default function MarsMissionsFrame({ body, tour, initialMissionId }: { body: 'moon' | 'mars'; tour?: VoyageTour; initialMissionId?: string }) {
  const page = PAGES[body];
  const query = new URLSearchParams();
  query.set('externalChat', '1');
  if (tour) query.set('tour', '1');
  const mission = tour?.mission ?? initialMissionId;
  if (mission) query.set('mission', mission);
  const src = page.src + (query.size ? '?' + query.toString() : '');
  return <iframe key={body} className="xp-mars-missions" src={src} title={page.title} allow="fullscreen" />;
}
