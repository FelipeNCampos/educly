import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { useSoundSettings } from "@/contexts/SoundSettingsContext";
import { useTranslation } from "react-i18next";

export const SoundControl = () => {
  const { t } = useTranslation();
  const { soundEnabled, volume, toggleSound, setVolume } = useSoundSettings();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground h-8 w-8 sm:h-9 sm:w-9"
          title={soundEnabled ? t('settings.soundOn') : t('settings.soundOff')}
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
          ) : (
            <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-4" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{t('settings.quizSounds')}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSound}
              className="h-8 px-2"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-primary" />
              ) : (
                <VolumeX className="w-4 h-4 text-muted-foreground" />
              )}
            </Button>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t('settings.volume')}</span>
              <span className="text-sm text-muted-foreground">{Math.round(volume * 100)}%</span>
            </div>
            <Slider
              value={[volume * 100]}
              onValueChange={(values) => setVolume(values[0] / 100)}
              max={100}
              step={5}
              disabled={!soundEnabled}
              className={!soundEnabled ? "opacity-50" : ""}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
