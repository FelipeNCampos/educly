import { useEffect, useRef, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSoundSettings } from "@/contexts/SoundSettingsContext";
import medalSound from "@/assets/sounds/medal-earned.mp3";

export const useMedalNotification = () => {
  const { toast } = useToast();
  const { soundEnabled, volume } = useSoundSettings();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(medalSound);
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const playMedalSound = useCallback(() => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // Ignore autoplay errors
      });
    }
  }, [soundEnabled, volume]);

  const showMedalNotification = useCallback(
    (medalName: string, medalDescription: string) => {
      playMedalSound();
      toast({
        title: `🏅 Nova Medalha Conquistada!`,
        description: `${medalName}: ${medalDescription}`,
        duration: 5000,
      });
    },
    [playMedalSound, toast]
  );

  return { showMedalNotification, playMedalSound };
};
