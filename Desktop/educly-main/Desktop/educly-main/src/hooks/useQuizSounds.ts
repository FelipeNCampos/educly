import { useCallback, useEffect, useRef } from "react";
import { useSoundSettings } from "@/contexts/SoundSettingsContext";
import correctSoundUrl from "@/assets/sounds/acerto.mp3";
import incorrectSoundUrl from "@/assets/sounds/negative.mp3";
import continueSoundUrl from "@/assets/sounds/continue.mp3";

// Pre-loaded audio elements to avoid delay
let correctAudioPreloaded: HTMLAudioElement | null = null;
let incorrectAudioPreloaded: HTMLAudioElement | null = null;
let continueAudioPreloaded: HTMLAudioElement | null = null;

// Preload sounds on module load
if (typeof window !== 'undefined') {
  correctAudioPreloaded = new Audio(correctSoundUrl);
  correctAudioPreloaded.preload = 'auto';
  correctAudioPreloaded.load();
  
  incorrectAudioPreloaded = new Audio(incorrectSoundUrl);
  incorrectAudioPreloaded.preload = 'auto';
  incorrectAudioPreloaded.load();
  
  continueAudioPreloaded = new Audio(continueSoundUrl);
  continueAudioPreloaded.preload = 'auto';
  continueAudioPreloaded.load();
}

export const useQuizSounds = () => {
  const { soundEnabled, volume } = useSoundSettings();
  
  // Keep refs to reuse audio elements
  const correctAudioRef = useRef<HTMLAudioElement | null>(null);
  const incorrectAudioRef = useRef<HTMLAudioElement | null>(null);
  const continueAudioRef = useRef<HTMLAudioElement | null>(null);
  
  // Initialize audio refs
  useEffect(() => {
    if (!correctAudioRef.current) {
      correctAudioRef.current = new Audio(correctSoundUrl);
      correctAudioRef.current.preload = 'auto';
    }
    if (!incorrectAudioRef.current) {
      incorrectAudioRef.current = new Audio(incorrectSoundUrl);
      incorrectAudioRef.current.preload = 'auto';
    }
    if (!continueAudioRef.current) {
      continueAudioRef.current = new Audio(continueSoundUrl);
      continueAudioRef.current.preload = 'auto';
    }
  }, []);

  const playCorrect = useCallback(() => {
    if (!soundEnabled) return;
    
    const audio = correctAudioRef.current || correctAudioPreloaded;
    if (audio) {
      audio.currentTime = 0;
      audio.volume = volume;
      audio.play().catch(() => {});
    }
  }, [soundEnabled, volume]);

  const playIncorrect = useCallback(() => {
    if (!soundEnabled) return;
    
    const audio = incorrectAudioRef.current || incorrectAudioPreloaded;
    if (audio) {
      audio.currentTime = 0;
      audio.volume = volume;
      audio.play().catch(() => {});
    }
  }, [soundEnabled, volume]);

  const playContinue = useCallback(() => {
    if (!soundEnabled) return;
    
    const audio = continueAudioRef.current || continueAudioPreloaded;
    if (audio) {
      audio.currentTime = 0;
      // Volume normal (100% do volume configurado)
      audio.volume = volume;
      audio.play().catch(() => {});
    }
  }, [soundEnabled, volume]);

  return { playCorrect, playIncorrect, playContinue };
};
