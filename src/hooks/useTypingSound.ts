import { useCallback, useEffect, useRef, useState } from "react";

export type SoundProfile = "soft" | "mechanical" | "typewriter";
type SoundKind = "keypress" | "space" | "backspace";
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
  const contextRef = useRef<AudioContext | null>(null);
  const noiseBufferRef = useRef<AudioBuffer | null>(null);
  const compressorRef = useRef<DynamicsCompressorNode | null>(null);

  useEffect(() => () => {
    const context = contextRef.current;
    if (context && context.state !== "closed") void context.close();
    contextRef.current = null;
    noiseBufferRef.current = null;
    compressorRef.current = null;
  }, []);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const update = useCallback((patch: Partial<SoundSettings>) => {
    setSettings((current) => ({ ...current, ...patch }));
  }, []);

  const play = useCallback((kind: SoundKind = "keypress") => {
    if (!settings.enabled || settings.volume === 0 || (kind === "backspace" && !settings.backspaceEnabled)) return;

    const AudioContextConstructor = window.AudioContext
      || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextConstructor) return;

    if (!contextRef.current) {
      try {
        contextRef.current = new AudioContextConstructor();
      } catch (error) {
        console.warn("Unable to initialize keyboard sound", error);
        return;
      }
    }

    const context = contextRef.current;
    if (context.state === "closed") return;
    if (context.state === "suspended") {
      void context.resume().catch((error: unknown) => console.warn("Unable to resume keyboard sound", error));
    }
    if (!compressorRef.current) {
      const compressor = context.createDynamicsCompressor();
      compressor.threshold.value = -18;
      compressor.knee.value = 12;
      compressor.ratio.value = 8;
      compressor.attack.value = 0.001;
      compressor.release.value = 0.06;
      compressor.connect(context.destination);
      compressorRef.current = compressor;
    }
    const compressor = compressorRef.current;
    if (!compressor) return;

    if (!noiseBufferRef.current) {
      const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * 0.035), context.sampleRate);
      const samples = buffer.getChannelData(0);
      for (let index = 0; index < samples.length; index += 1) {
        samples[index] = Math.random() * 2 - 1;
      }
      noiseBufferRef.current = buffer;
    }

    const now = context.currentTime;
    const duration = kind === "backspace" ? 0.03 : kind === "space" ? 0.026 : 0.022;
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    const source = context.createBufferSource();
    const variation = 0.94 + Math.random() * 0.12;
    const profileFrequency = settings.profile === "mechanical" ? 3100 : settings.profile === "typewriter" ? 1900 : 2500;

    source.buffer = noiseBufferRef.current;
    source.playbackRate.value = variation;
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(profileFrequency * variation, now);
    filter.Q.setValueAtTime(kind === "backspace" ? 0.8 : 1.15, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime((settings.volume / 100) * (kind === "space" ? 0.055 : 0.075), now + 0.0015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    source.connect(filter).connect(gain).connect(compressor);
    source.start(now);
    source.stop(now + duration);
  }, [settings]);

  return {
    ...settings,
    soundEnabled: settings.enabled,
    setSoundEnabled: (enabled: boolean) => update({ enabled }),
    setVolume: (volume: number) => update({ volume: Math.max(0, Math.min(100, volume)) }),
    setProfile: (profile: SoundProfile) => update({ profile }),
    setBackspaceEnabled: (backspaceEnabled: boolean) => update({ backspaceEnabled }),
    playKeypressSound: (kind: Exclude<SoundKind, "backspace"> = "keypress") => play(kind),
    playBackspaceSound: () => play("backspace"),
    playPreview: () => play("keypress"),
  };
}
