export type IntroVoiceState = 'ready' | 'playing' | 'unavailable';

interface IntroNarrationOptions {
  text: string;
  synth?: Pick<SpeechSynthesis, 'speak' | 'cancel'>;
  makeUtterance: (text: string) => SpeechSynthesisUtterance;
  onState: (state: IntroVoiceState) => void;
  beforeSpeak?: () => void;
  startTimeoutMs?: number;
}

/** Own only this greeting; blocked autoplay can retry from a user gesture. */
export function createIntroNarration({ text, synth, makeUtterance, onState, beforeSpeak, startTimeoutMs = 4000 }: IntroNarrationOptions) {
  let current: SpeechSynthesisUtterance | undefined;
  let watchdog: ReturnType<typeof setTimeout> | undefined;
  let autoPending = true;
  let disposed = false;

  function cancel() {
    clearTimeout(watchdog);
    if (!current) return;
    current.onstart = current.onend = current.onerror = null;
    current = undefined;
    synth?.cancel();
  }

  function start(automatic: boolean) {
    if (disposed || (automatic && (!autoPending || current))) return;
    if (!automatic) autoPending = false;
    cancel();
    if (!synth) { autoPending = false; onState('unavailable'); return; }
    try {
      beforeSpeak?.();
      const utterance = makeUtterance(text);
      current = utterance;
      const finish = (state: IntroVoiceState) => {
        if (current !== utterance || disposed) return;
        clearTimeout(watchdog);
        current = undefined;
        onState(state);
      };
      utterance.onstart = () => {
        if (current !== utterance || disposed) return;
        autoPending = false;
        clearTimeout(watchdog);
        onState('playing');
      };
      utterance.onend = () => finish('ready');
      utterance.onerror = (event) => finish(event.error === 'synthesis-unavailable' ? 'unavailable' : 'ready');
      onState('playing');
      // Some engines silently drop speech before the first interaction.
      watchdog = setTimeout(() => {
        if (current !== utterance || disposed) return;
        cancel();
        onState('ready');
      }, startTimeoutMs);
      synth.speak(utterance);
    } catch {
      cancel();
      onState('ready');
    }
  }

  if (!synth) onState('unavailable');
  return {
    play: () => start(false),
    tryAutoPlay: () => start(true),
    stop() { autoPending = false; cancel(); if (!disposed) onState(synth ? 'ready' : 'unavailable'); },
    dispose() { disposed = true; autoPending = false; cancel(); },
  };
}
