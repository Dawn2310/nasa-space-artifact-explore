import { useEffect, useState } from 'react';
import { BADGES, REWARD_CHANGED, REWARD_KEY, REWARD_OVERLAY, rewardBook } from './rewards';
import { openPassport, rewardDialogOpen } from './reward-ui';

export function useRewardProgress() {
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const update = () => setRevision((value) => value + 1);
    const storage = (event: StorageEvent) => { if (event.key === REWARD_KEY) update(); };
    window.addEventListener(REWARD_CHANGED, update); window.addEventListener(REWARD_OVERLAY, update); window.addEventListener('storage', storage);
    return () => { window.removeEventListener(REWARD_CHANGED, update); window.removeEventListener(REWARD_OVERLAY, update); window.removeEventListener('storage', storage); };
  }, []);
  void revision;
  return { earned: rewardBook.read(), overlayOpen: rewardDialogOpen() };
}
export default function PassportButton() {
  const { earned } = useRewardProgress();
  return <button type="button" className="passport-button" onClick={openPassport} aria-label={`Mission passport: ${earned.length} of ${Object.keys(BADGES).length} badges`}>
    <span aria-hidden="true">✦</span> Passport <small>{earned.length}/17</small>
  </button>;
}
