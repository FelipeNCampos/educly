import { ChevronRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from 'react-i18next';

interface ActiveChallengeCardProps {
  challengeName: string;
  currentDay: number;
  totalDays: number;
  aiToolName: string;
  dayTitle?: string;
  aiToolIcon: React.ReactNode;
  themeColor: string;
  onContinue: () => void;
  onViewAll: () => void;
}

export const ActiveChallengeCard = ({
  challengeName,
  currentDay,
  totalDays,
  aiToolName,
  dayTitle,
  aiToolIcon,
  themeColor,
  onContinue,
  onViewAll
}: ActiveChallengeCardProps) => {
  const { t } = useTranslation();
  const progress = Math.round((currentDay / totalDays) * 100);

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* AI Tool Icon */}
          <div 
            className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${themeColor}20` }}
          >
            <div style={{ color: themeColor }}>
              {aiToolIcon}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              {t('challenge.aiDomination')}
            </span>
            <h3 className="text-lg font-bold text-foreground truncate">
              {aiToolName}
            </h3>
            <p className="text-sm text-muted-foreground truncate">
              {dayTitle || challengeName}
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">{t('challenge.day')} {currentDay} {t('common.of')} {totalDays}</span>
            <span className="font-medium text-foreground">{progress}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{ 
                width: `${progress}%`,
                backgroundColor: themeColor 
              }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onViewAll}
            className="flex-1"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            {t('challenge.viewTrail')}
          </Button>
          <Button
            size="sm"
            onClick={onContinue}
            className="flex-1"
            style={{ backgroundColor: themeColor }}
          >
            {t('common.continue')}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};
