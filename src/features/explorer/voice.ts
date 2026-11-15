// Approximate timing: voices and pauses vary by browser/OS.
export const SPEECH_SPEED = 1.3;
export const SPEECH_RATE = 0.94 * SPEECH_SPEED;
export const SPEECH_PITCH = 1.02;
export const SPEECH_VOLUME = 0.85;
/** A click must stop an active performance, even if a draft is present. */
export function shuttleAction(speaking: boolean, draft: string): 'stop' | 'send' | 'replay' {
  return speaking ? 'stop' : draft.trim() ? 'send' : 'replay';
}
export function estimatedSpeechSeconds(text: string): number {
  // Scale the original estimate (160 words/minute at rate 1.08) with playback speed.
  return text.trim().split(/\s+/).filter(Boolean).length / (160 * SPEECH_RATE / 1.08) * 60;
}

interface VoiceOption { name: string; lang: string; default?: boolean }
/** Choose only from voices the visitor's browser actually provides. */
export function chooseFriendlyVoice<T extends VoiceOption>(voices: readonly T[]): T | undefined {
  const score = (voice: T) => {
    const name = voice.name.toLowerCase();
    return (voice.lang.toLowerCase().startsWith('en-us') ? 20 : 10) +
      (/natural|aria|jenny|samantha|sonia/.test(name) ? 50 : 0) +
      (/google.*english|zira/.test(name) ? 30 : 0) + (voice.default ? 1 : 0);
  };
  return voices.filter((voice) => /^en(?:-|_)/i.test(voice.lang) || voice.lang.toLowerCase() === 'en')
    .map((voice, index) => ({ voice, score: score(voice), index }))
    .sort((a, b) => b.score - a.score || a.index - b.index)[0]?.voice;
}
