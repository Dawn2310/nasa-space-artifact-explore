// Presentation state only. App remains the sole owner of navigation.
import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { ArtifactId } from './contracts';

export type CharacterPhase = 'idle' | 'speaking' | 'thinking';
interface Activity { artifactId: ArtifactId; phase: CharacterPhase }
const CharacterContext = createContext<{
  activity: Activity | null;
  setActivity: (activity: Activity | null) => void;
}>({ activity: null, setActivity: () => {} });

export function CharacterProvider({ children }: { children: ReactNode }) {
  const [activity, setActivity] = useState<Activity | null>(null);
  const value = useMemo(() => ({ activity, setActivity }), [activity]);
  return <CharacterContext.Provider value={value}>{children}</CharacterContext.Provider>;
}

export function useCharacterActivity() { return useContext(CharacterContext); }
