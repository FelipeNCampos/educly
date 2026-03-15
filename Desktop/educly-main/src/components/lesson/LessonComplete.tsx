import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Trophy, Sparkles, Award, Star, PartyPopper } from "lucide-react";
import confetti from 'canvas-confetti';
import { useTranslation } from 'react-i18next';
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useUserLevel, XP_REWARDS } from "@/hooks/useUserLevel";

interface LessonCompleteProps {
  dayTitle: string;
  aiToolName: string;
  dayNumber: number;
  totalDays: number;
  challengeId?: string;
  challengeSlug?: string;
  learningSummary?: string[];
  onFinish: () => void;
  onNextDay?: () => void;
  hasNextDay?: boolean;
}

export const LessonComplete = ({
  dayTitle,
  aiToolName,
  dayNumber,
  totalDays,
  challengeId,
  challengeSlug,
  learningSummary,
  onFinish,
  onNextDay,
  hasNextDay
}: LessonCompleteProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [certificateId, setCertificateId] = useState<string | null>(null);
  const [isGeneratingCertificate, setIsGeneratingCertificate] = useState(false);
  const [showStars, setShowStars] = useState(false);
  const { addXP } = useUserLevel();
  const [xpAwarded, setXpAwarded] = useState(false);

  const isLastDay = dayNumber >= totalDays;

  // Award XP for completing lesson
  useEffect(() => {
    if (!xpAwarded) {
      setXpAwarded(true);
      const xpAmount = isLastDay ? XP_REWARDS.DAY_COMPLETE + XP_REWARDS.MODULE_COMPLETE : XP_REWARDS.DAY_COMPLETE;
      const reason = isLastDay 
        ? `Desafio completo! 🏆 Dia ${dayNumber}/${totalDays}` 
        : `Lição completada! 📚 Dia ${dayNumber}/${totalDays}`;
      addXP(xpAmount, reason);
    }
  }, [xpAwarded, isLastDay, dayNumber, totalDays, addXP]);

  useEffect(() => {
    // Trigger celebration confetti - THIS IS WHERE CONFETTI SHOULD BE
    const fireCelebration = () => {
      // Initial burst
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#22c55e']
      });

      // Side cannons
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#6366f1', '#8b5cf6', '#ec4899']
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#10b981', '#f59e0b', '#22c55e']
        });
      }, 200);
    };

    fireCelebration();

    // For last day, extended celebration
    if (isLastDay) {
      const duration = 5000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      
      setTimeout(() => frame(), 500);
    } else {
      // Regular day celebration - continuous for 3 seconds
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b']
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }

    // Show animated stars
    setShowStars(true);

    // Generate certificate if last day
    if (isLastDay && challengeId) {
      generateCertificate();
    }
  }, [isLastDay, challengeId]);

  const generateCertificate = async () => {
    if (!challengeId) return;

    setIsGeneratingCertificate(true);

    try {
      // Get user profile for name
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle();

      const fullName = profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Student';

      // Call the database function to generate certificate
      const { data, error } = await supabase.rpc('generate_challenge_certificate', {
        p_challenge_id: challengeId,
        p_user_full_name: fullName
      });

      if (data) {
        setCertificateId(data);
      }
    } catch (error) {
      console.error('Error generating certificate:', error);
    } finally {
      setIsGeneratingCertificate(false);
    }
  };

  const handleViewCertificate = () => {
    if (certificateId) {
      navigate(`/certificado/${certificateId}`);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 animate-fade-in relative overflow-hidden">
      {/* Floating celebration elements */}
      {showStars && (
        <>
          <Star className="absolute top-[10%] left-[10%] w-6 h-6 text-warning animate-bounce opacity-80" style={{ animationDelay: '0s', animationDuration: '2s' }} />
          <Star className="absolute top-[15%] right-[15%] w-8 h-8 text-primary animate-bounce opacity-70" style={{ animationDelay: '0.3s', animationDuration: '2.5s' }} />
          <Star className="absolute top-[25%] left-[20%] w-5 h-5 text-success animate-bounce opacity-60" style={{ animationDelay: '0.6s', animationDuration: '2.2s' }} />
          <Star className="absolute top-[20%] right-[25%] w-7 h-7 text-warning animate-bounce opacity-75" style={{ animationDelay: '0.9s', animationDuration: '2.8s' }} />
          <Sparkles className="absolute bottom-[20%] left-[15%] w-6 h-6 text-primary animate-pulse opacity-70" style={{ animationDelay: '0.2s' }} />
          <Sparkles className="absolute bottom-[25%] right-[20%] w-5 h-5 text-success animate-pulse opacity-60" style={{ animationDelay: '0.5s' }} />
          <PartyPopper className="absolute top-[30%] left-[8%] w-8 h-8 text-warning animate-bounce opacity-80" style={{ animationDelay: '0.4s', animationDuration: '3s' }} />
          <PartyPopper className="absolute top-[35%] right-[10%] w-7 h-7 text-primary animate-bounce opacity-70" style={{ animationDelay: '0.7s', animationDuration: '2.7s' }} />
        </>
      )}

      <div className="text-center space-y-6 max-w-md relative z-10">
        {/* Hexagon Success Badge - Canva style */}
        {isLastDay ? (
          <div className="relative mx-auto w-32 h-32">
            <div className="absolute inset-0 bg-warning/20 rounded-full animate-ping" />
            <svg viewBox="0 0 100 100" className="w-32 h-32 mx-auto drop-shadow-lg animate-scale-in">
              <defs>
                <linearGradient id="hexGradientGold" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
              <polygon 
                points="50,2 95,25 95,75 50,98 5,75 5,25" 
                fill="url(#hexGradientGold)"
              />
              <polygon 
                points="50,10 87,28 87,72 50,90 13,72 13,28" 
                fill="none"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="2"
              />
              <polygon 
                points="50,18 79,32 79,68 50,82 21,68 21,32" 
                fill="rgba(255,255,255,0.1)"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Award className="w-12 h-12 text-white" />
            </div>
            <Sparkles className="absolute -top-3 -right-3 w-10 h-10 text-warning animate-bounce" />
            <Star className="absolute -top-2 -left-2 w-8 h-8 text-success animate-pulse" />
          </div>
        ) : (
          <div className="relative mx-auto w-28 h-28">
            {/* Hexagon shape - Canva/Duolingo style */}
            <svg viewBox="0 0 100 100" className="w-28 h-28 mx-auto drop-shadow-lg animate-scale-in">
              <defs>
                <linearGradient id="hexGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22c55e" />
                  <stop offset="100%" stopColor="#16a34a" />
                </linearGradient>
              </defs>
              {/* Outer glow layers */}
              <polygon 
                points="50,2 95,25 95,75 50,98 5,75 5,25" 
                fill="#dcfce7"
                className="animate-pulse"
              />
              <polygon 
                points="50,8 89,28 89,72 50,92 11,72 11,28" 
                fill="#bbf7d0"
              />
              {/* Main hexagon */}
              <polygon 
                points="50,14 83,31 83,69 50,86 17,69 17,31" 
                fill="url(#hexGradient)"
              />
            </svg>
            {/* Check icon centered */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Check className="w-10 h-10 text-white stroke-[3]" />
            </div>
            {/* Celebration sparkles */}
            <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-warning animate-bounce" />
          </div>
        )}

        {/* Main message - Clean and bold */}
        <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            {isLastDay 
              ? `${t('lessonComplete.challengeComplete')}` 
              : `${t('challenge.day')} ${dayNumber} ${t('lessonComplete.complete')}!`
            }
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground">
            {isLastDay 
              ? t('lessonComplete.completedAllDays', { total: totalDays })
              : t('lessonComplete.keepPracticing', { tool: aiToolName })
            }
          </p>
        </div>

        {/* Certificate status for last day */}
        {isLastDay && (
          <div className="bg-gradient-to-r from-warning/20 to-success/20 border border-warning/30 rounded-xl p-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Award className="w-6 h-6 text-warning" />
              <h3 className="font-bold text-foreground">{t('lessonComplete.certificateReady')}</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {isGeneratingCertificate 
                ? t('certificate.generating')
                : t('lessonComplete.certificateGenerated')
              }
            </p>
          </div>
        )}

        {/* Action buttons - Full width, prominent */}
        <div className="space-y-3 pt-4 w-full animate-fade-in" style={{ animationDelay: '0.5s' }}>
          {isLastDay && certificateId && (
            <Button 
              onClick={handleViewCertificate}
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-warning to-success hover:opacity-90 rounded-xl"
              size="lg"
            >
              <Award className="w-5 h-5 mr-2" />
              {t('certificate.viewCertificate')}
            </Button>
          )}
          
          <Button 
            onClick={hasNextDay && !isLastDay ? onNextDay : onFinish}
            className="w-full h-14 text-lg font-semibold rounded-xl"
            size="lg"
          >
            {t('common.continue')}
          </Button>
        </div>
      </div>
    </div>
  );
};
