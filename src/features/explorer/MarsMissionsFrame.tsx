// Tầng surface dùng bản đồ nhiệm vụ Three.js thuần, nhúng bằng iframe cùng origin:
// - Sao Hỏa: mars-missions/, 8 thiết bị dùng chung cho khám phá và UFO.
// - Mặt Trăng: moon-missions/ (từ Nasa_Space_Apps_Challenge-moon), 4 thiết bị.
// Mỗi trang tự lo mô hình 3D, hoạt cảnh và chat kể chuyện ngôi thứ nhất (tên lửa chibi, POST /api/chat).
// Trong Legacy Voyage (tour): ?tour=1 ẩn giao diện riêng của trang, ?mission=<id> mở thẳng thiết bị.

import { useEffect, useRef } from 'react';
import type { VoyageTour } from '../../shared/app-types';

const PAGES = {
  mars: { src: '/mars-missions/', title: 'Mars mission map: eight machines left on Mars' },
  moon: { src: '/moon-missions/', title: 'Moon mission map: four machines left on the Moon' },
} as const;

interface FrameProps { body: 'moon' | 'mars'; tour?: VoyageTour; initialMissionId?: string }

export default function MarsMissionsFrame(props: FrameProps) {
  return <MissionFrame key={`${props.body}-${Boolean(props.tour)}`} {...props} />;
}

function MissionFrame({ body, tour, initialMissionId }: FrameProps) {
  const page = PAGES[body];
  const query = new URLSearchParams();
  query.set('externalChat', '1');
  if (tour) query.set('tour', '1');
  const mission = tour?.mission ?? initialMissionId;
  if (mission) query.set('mission', mission);
  // Keep one document/WebGL context per world and mode. Later stops use messages,
  // preserving decoded GLBs, textures, terrain and the native model cache.
  const src = useRef(page.src + (query.size ? '?' + query.toString() : ''));
  const frame = useRef<HTMLIFrameElement>(null);
  const ready = useRef(false);
  const desiredMission = useRef(mission);
  desiredMission.current = mission;
  const sync = () => {
    if (ready.current && desiredMission.current) frame.current?.contentWindow?.postMessage({ type: 'nasa:open-mission', missionId: desiredMission.current }, window.location.origin);
  };
  useEffect(sync, [mission]);
  return <iframe ref={frame} className="xp-mars-missions" src={src.current} title={page.title} allow="fullscreen"
    onLoad={() => { ready.current = true; sync(); }} />;
}
