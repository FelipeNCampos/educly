import { Trophy, Lock, ExternalLink } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CertificateProgressCardProps {
  challengeName: string;
  challengeId: string;
  challengeSlug: string;
  completedDays: number;
  totalDays: number;
  themeColor: string;
}

export const CertificateProgressCard = ({
  challengeName,
  challengeId,
  challengeSlug,
  completedDays,
  totalDays,
  themeColor
}: CertificateProgressCardProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const progress = Math.round((completedDays / totalDays) * 100);
  const isComplete = completedDays >= totalDays;

  // Check if certificate exists
  const { data: certificate } = useQuery({
    queryKey: ['user-certificate', challengeSlug],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
        .from('user_certificates')
        .select('id')
        .eq('user_id', user.id)
        .eq('tool_slug', challengeSlug)
        .maybeSingle();
      
      return data;
    },
    enabled: isComplete
  });

  const handleViewCertificate = () => {
    if (certificate?.id) {
      navigate(`/certificado/${certificate.id}`);
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      {/* Certificate Icon */}
      <div className="flex justify-center mb-4">
        <div 
          className={`
            w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500
            ${isComplete 
              ? 'bg-success/20 text-success animate-pulse' 
              : 'bg-muted text-muted-foreground'
            }
          `}
        >
          {isComplete ? (
            <Trophy className="w-10 h-10" />
          ) : (
            <Lock className="w-8 h-8" />
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-center font-semibold text-foreground mb-1">
        {isComplete ? t('certificate.obtained') : t('certificate.getCertificate')}
      </h3>
      <p className="text-center text-sm text-muted-foreground mb-4">
        {challengeName}
      </p>

      {/* Progress */}
      <div className="mb-2">
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-500"
            style={{ 
              width: `${progress}%`,
              backgroundColor: isComplete ? 'hsl(var(--success))' : themeColor
            }}
          />
        </div>
      </div>
      <p className="text-center text-xs text-muted-foreground">
        {t('certificate.daysCompleted', { completed: completedDays, total: totalDays, percent: progress })}
      </p>

      {/* Certificate Button or Motivational Message */}
      <div className="mt-4">
        {isComplete && certificate ? (
          <Button 
            onClick={handleViewCertificate}
            className="w-full bg-success hover:bg-success/90"
          >
            <Trophy className="w-4 h-4 mr-2" />
            {t('certificate.viewCertificate')}
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-center text-muted-foreground">
              {isComplete 
                ? `🎉 ${t('certificate.congratulations')}`
                : progress >= 75 
                  ? `🔥 ${t('certificate.almostThere')}`
                  : progress >= 50
                    ? `💪 ${t('certificate.onTheRightPath')}`
                    : progress >= 25
                      ? `🚀 ${t('certificate.goodStart')}`
                      : `✨ ${t('certificate.startJourney')}`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
