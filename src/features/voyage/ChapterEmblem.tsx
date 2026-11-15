import { useId } from 'react';
import type { ChapterId } from './script';

/** Decorative chapter art, not NASA insignia or a scientific planet rendering. */
export default function ChapterEmblem({ chapter, completed }: { chapter: ChapterId; completed: boolean }) {
  const id = useId().replace(/:/g, '');
  const name = chapter === 'moon' ? 'The Moon' : chapter === 'mars' ? 'Mars' : 'Deep space';
  return <span className={`vy-chapter-emblem vy-chapter-emblem--${chapter}`} role="img" aria-label={`${name}${completed ? ', completed' : ', ready to explore'}`}>
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <defs>
        <radialGradient id={`${id}-moon`} cx=".3" cy=".25" r=".8"><stop stopColor="#f4f5df" /><stop offset=".52" stopColor="#c9d4df" /><stop offset="1" stopColor="#61748d" /></radialGradient>
        <radialGradient id={`${id}-mars`} cx=".28" cy=".25" r=".85"><stop stopColor="#ffd0a0" /><stop offset=".5" stopColor="#db8058" /><stop offset="1" stopColor="#72372c" /></radialGradient>
        <radialGradient id={`${id}-deep`} cx=".3" cy=".25" r=".9"><stop stopColor="#e4dcff" /><stop offset=".4" stopColor="#a69bdf" /><stop offset="1" stopColor="#483970" /></radialGradient>
        <clipPath id={`${id}-disc`}><circle cx="24" cy="24" r="16" /></clipPath>
      </defs>
      {chapter === 'moon' && <>
        <circle cx="24" cy="24" r="17.5" fill="none" stroke="#b8d9e9" strokeOpacity=".2" />
        <circle cx="24" cy="24" r="16" fill={`url(#${id}-moon)`} />
        <g clipPath={`url(#${id}-disc)`} fill="#6d7e94" fillOpacity=".3" stroke="#f5f7ee" strokeOpacity=".35" strokeWidth=".8">
          <circle cx="17" cy="17" r="4" /><circle cx="28" cy="27" r="5.5" /><circle cx="15" cy="31" r="2.6" /><circle cx="32" cy="13" r="2.7" /><circle cx="36" cy="33" r="3.2" /><circle cx="23" cy="10" r="1.3" />
        </g>
      </>}
      {chapter === 'mars' && <>
        <circle cx="24" cy="24" r="17.5" fill="none" stroke="#edb58b" strokeOpacity=".2" />
        <circle cx="24" cy="24" r="16" fill={`url(#${id}-mars)`} />
        <g clipPath={`url(#${id}-disc)`}>
          <path d="m10 20 8-3 5 4 9-2 7 5-11 3-7-2-8 4m11 2 6 2 3 6" fill="none" stroke="#8f4c3c" strokeWidth="3" strokeOpacity=".5" strokeLinecap="round" />
          <path d="M17 9q7-5 14 0l-4 3-6-1Z" fill="#f8e2ca" fillOpacity=".8" />
          <circle cx="17" cy="29" r="2.5" fill="#9b553c" fillOpacity=".45" />
        </g>
      </>}
      {chapter === 'deep' && <>
        <ellipse cx="24" cy="25" rx="22" ry="7" transform="rotate(-30 24 25)" fill="none" stroke="#b8a4f3" strokeOpacity=".5" strokeWidth="1" />
        <circle cx="24" cy="24" r="11" fill={`url(#${id}-deep)`} />
        <path d="M5 32c5 1 11-1 20-6s14-9 15-13" fill="none" stroke="#e4d6ff" strokeWidth="2" strokeLinecap="round" />
        <path d="m38 3 1.2 3.8L43 8l-3.8 1.2L38 13l-1.2-3.8L33 8l3.8-1.2Z" fill="#e3d4ff" />
        <circle cx="8" cy="12" r="1.2" fill="#a5c3f2" /><circle cx="36" cy="38" r="1.4" fill="#bdade7" />
      </>}
    </svg>
    {completed && <span className="vy-chapter-emblem__check"><svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m4 8 2.5 2.5L12 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></span>}
  </span>;
}
