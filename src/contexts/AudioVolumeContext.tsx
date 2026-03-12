import React, { createContext, useState, useContext, useEffect, useCallback, ReactNode } from "react";

const STORAGE_KEY = "schulhub-audio-volume";
const DEFAULT_VOLUME = 0.7;

const getStoredVolume = (): number => {
  if (typeof window === "undefined") return DEFAULT_VOLUME;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === null) return DEFAULT_VOLUME;
  const n = parseFloat(stored);
  if (!Number.isFinite(n) || n < 0 || n > 1) return DEFAULT_VOLUME;
  return n;
};

interface AudioVolumeContextType {
  volume: number;
  setVolume: (value: number) => void;
}

const AudioVolumeContext = createContext<AudioVolumeContextType | undefined>(undefined);

export const AudioVolumeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [volume, setVolumeState] = useState<number>(getStoredVolume);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(volume));
  }, [volume]);

  const setVolume = useCallback((value: number) => {
    const v = Math.max(0, Math.min(1, value));
    setVolumeState(v);
  }, []);

  return (
    <AudioVolumeContext.Provider value={{ volume, setVolume }}>
      {children}
    </AudioVolumeContext.Provider>
  );
};

export const useAudioVolume = (): AudioVolumeContextType => {
  const ctx = useContext(AudioVolumeContext);
  if (ctx === undefined) throw new Error("useAudioVolume must be used within AudioVolumeProvider");
  return ctx;
};
