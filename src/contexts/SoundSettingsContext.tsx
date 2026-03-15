import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface SoundSettings {
  soundEnabled: boolean;
  volume: number;
}

interface SoundSettingsContextType {
  soundEnabled: boolean;
  volume: number;
  setSoundEnabled: (enabled: boolean) => void;
  setVolume: (volume: number) => void;
  toggleSound: () => void;
}

const SoundSettingsContext = createContext<SoundSettingsContextType | undefined>(undefined);

const STORAGE_KEY = "iacademy_sound_settings";

const defaultSettings: SoundSettings = {
  soundEnabled: true,
  volume: 0.5,
};

export const SoundSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [soundEnabled, setSoundEnabledState] = useState(defaultSettings.soundEnabled);
  const [volume, setVolumeState] = useState(defaultSettings.volume);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as SoundSettings;
        setSoundEnabledState(parsed.soundEnabled ?? defaultSettings.soundEnabled);
        setVolumeState(parsed.volume ?? defaultSettings.volume);
      }
    } catch {
      // Use defaults if parsing fails
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    const settings: SoundSettings = { soundEnabled, volume };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [soundEnabled, volume]);

  const setSoundEnabled = (enabled: boolean) => {
    setSoundEnabledState(enabled);
  };

  const setVolume = (newVolume: number) => {
    setVolumeState(Math.max(0, Math.min(1, newVolume)));
  };

  const toggleSound = () => {
    setSoundEnabledState(prev => !prev);
  };

  return (
    <SoundSettingsContext.Provider
      value={{
        soundEnabled,
        volume,
        setSoundEnabled,
        setVolume,
        toggleSound,
      }}
    >
      {children}
    </SoundSettingsContext.Provider>
  );
};

export const useSoundSettings = () => {
  const context = useContext(SoundSettingsContext);
  if (context === undefined) {
    throw new Error("useSoundSettings must be used within a SoundSettingsProvider");
  }
  return context;
};
