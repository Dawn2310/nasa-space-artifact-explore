// Decorative chibi UI mascot, not a replacement for any NASA spacecraft model.
import { useId } from 'react';

export default function ShuttleMascot({ speaking }: { speaking: boolean }) {
  const id = useId().replace(/:/g, '');
  return <span className={`xp-shuttle${speaking ? ' is-speaking' : ''}`} aria-hidden="true">
    <span className="xp-shuttle__smoke"><i /><i /><i /><i /></span>
    <span className="xp-shuttle__flight">
      <svg viewBox="0 0 100 120" role="presentation">
        <defs>
          <linearGradient id={`${id}-shuttle-body`} x1="0" x2="1"><stop stopColor="#e0f7ff" /><stop offset=".6" stopColor="#ffffff" /><stop offset="1" stopColor="#9bcadd" /></linearGradient>
          <linearGradient id={`${id}-shuttle-wing`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#9de7f1" /><stop offset="1" stopColor="#3484ac" /></linearGradient>
        </defs>
        <ellipse cx="50" cy="111" rx="23" ry="4" fill="#a1e4f5" opacity=".12" />
        <g className="xp-shuttle__flame"><path d="M39 91Q33 109 50 119Q67 109 61 91Z" fill="#ff9765" /><path d="M44 92Q40 106 50 113Q60 106 56 92Z" fill="#ffe9a2" /></g>
        <path d="M32 55 9 83Q5 91 13 91L38 84ZM68 55 91 83Q95 91 87 91L62 84Z" fill={`url(#${id}-shuttle-wing)`} stroke="#1d526d" strokeWidth="2" />
        <path d="M37 85 28 101 46 96M63 85 72 101 54 96" fill="#8ecddd" stroke="#1d526d" strokeWidth="2" strokeLinejoin="round" />
        <path d="M50 7C32 17 29 45 30 68L35 92Q50 101 65 92L70 68C71 45 68 17 50 7Z" fill={`url(#${id}-shuttle-body)`} stroke="#315d75" strokeWidth="2" />
        <path d="M50 7C44 11 40 17 37 25Q50 19 63 25C60 17 56 11 50 7Z" fill="#b4d8e8" />
        <path d="M36 34Q50 26 64 34L65 50Q50 58 35 50Z" fill="#173c58" stroke="#8bd9ec" strokeWidth="2" />
        <ellipse className="xp-shuttle__eye" cx="42" cy="42" rx="3" ry="4" fill="#c9f8ff" /><ellipse className="xp-shuttle__eye" cx="58" cy="42" rx="3" ry="4" fill="#c9f8ff" />
        <path d="M45 49Q50 53 55 49" fill="none" stroke="#a4ecf5" strokeWidth="1.5" strokeLinecap="round" />
        <ellipse cx="36" cy="57" rx="4" ry="2.5" fill="#f4adb2" opacity=".65" /><ellipse cx="64" cy="57" rx="4" ry="2.5" fill="#f4adb2" opacity=".65" />
        <path d="M50 61v24" stroke="#aac8d6" strokeWidth="1.5" strokeDasharray="3 3" />
        <path d="m50 65 2 5 5 1-4 3 1 5-4-3-4 3 1-5-4-3 5-1Z" fill="#ffc857" />
        <path d="M38 91Q50 96 62 91" fill="none" stroke="#284c64" strokeWidth="4" strokeLinecap="round" />
      </svg>
    </span>
  </span>;
}
