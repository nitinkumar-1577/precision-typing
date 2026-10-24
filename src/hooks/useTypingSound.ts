import { useCallback, useEffect, useRef, useState } from "react";

export type SoundProfile = "soft" | "mechanical" | "typewriter";
const SETTINGS_KEY = "typing_sound_settings";

interface SoundSettings {
  enabled: boolean;
  volume: number;
  profile: SoundProfile;
  backspaceEnabled: boolean;
}

const defaults: SoundSettings = { enabled: true, volume: 35, profile: "soft", backspaceEnabled: true };

function readSettings(): SoundSettings {
  try {
    return { ...defaults, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}") };
  } catch {
    return defaults;
  }
}

export function useTypingSound() {
  const [settings, setSettings] = useState<SoundSettings>(readSettings);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const update = useCallback((patch: Partial<SoundSettings>) => {
    setSettings((current) => ({ ...current, ...patch }));
  }, []);

  const play = useCallback((kind: "keypress" | "backspace" = "keypress") => {
    if (!settings.enabled || settings.volume === 0 || (kind === "backspace" && !settings.backspaceEnabled)) return;
    try {
      const AudioContextConstructor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextConstructor) return;
      if (!audioContextRef.current) audioContextRef.current = new AudioContextConstructor();
      const context = audioContextRef.current;
      if (context.state === "suspended") void context.resume();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const now = context.currentTime;
      const frequency = kind === "backspace" ? 180 : settings.profile === "mechanical" ? 1100 : settings.profile === "typewriter" ? 650 : 800;
      oscillator.type = settings.profile === "typewriter" ? "triangle" : "sine";
      oscillator.frequency.setValueAtTime(frequency, now);
      gain.gain.setValueAtTime((settings.volume / 100) * 0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.05);
    } catch {
      // Audio failure must never interfere with typing.
    }
  }, [settings]);

  return {
    ...settings,
    soundEnabled: settings.enabled,
    setSoundEnabled: (enabled: boolean) => update({ enabled }),
    setVolume: (volume: number) => update({ volume: Math.max(0, Math.min(100, volume)) }),
    setProfile: (profile: SoundProfile) => update({ profile }),
    setBackspaceEnabled: (backspaceEnabled: boolean) => update({ backspaceEnabled }),
    playKeypressSound: () => play("keypress"),
    playBackspaceSound: () => play("backspace"),
    playPreview: () => play("keypress"),
  };
}
