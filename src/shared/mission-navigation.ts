interface Mission { id: string }

/** Only the embedding page on this origin can navigate a persistent mission frame. */
export function createMissionNavigation<T extends Mission>({ origin, parent, missions, current, close, open }: {
  origin: string; parent: unknown; missions: readonly T[];
  current: () => T | null; close: () => void; open: (mission: T) => void;
}) {
  return (event: Pick<MessageEvent, 'origin' | 'source' | 'data'>) => {
    if (event.origin !== origin || event.source !== parent || event.data?.type !== 'nasa:open-mission') return;
    const mission = missions.find(item => item.id === event.data.missionId);
    if (!mission || current()?.id === mission.id) return;
    if (current()) close();
    open(mission);
  };
}
