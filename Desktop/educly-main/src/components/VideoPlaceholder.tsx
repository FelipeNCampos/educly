import { Lock } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';

export const VideoPlaceholder = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="glass neon-border rounded-lg p-8 flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden">
      {/* Neon glow background effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#6B4EFF]/5 via-transparent to-[#3B66FF]/5 animate-pulse-slow" />
      
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#6B4EFF]/20 to-[#3B66FF]/20 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(107,78,255,0.3)]">
          <Lock className="w-10 h-10 text-[#6B4EFF] animate-glow-pulse" />
        </div>
        
        <p className="text-white text-center text-xl font-semibold mb-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
          {t('video.lockedTitle')}
        </p>
        
        <p className="text-muted-foreground text-center text-sm mb-6 max-w-md">
          {t('video.lockedMessage')}
        </p>
        
        <Button
          onClick={() => navigate("/trilha/chatgpt")}
          className="bg-gradient-to-r from-[#8A2BFF] via-[#6B4EFF] to-[#3B66FF] hover:shadow-[0_0_25px_rgba(107,78,255,0.6)] transition-all duration-300"
        >
          {t('video.unlockButton')}
        </Button>
      </div>
    </div>
  );
};
