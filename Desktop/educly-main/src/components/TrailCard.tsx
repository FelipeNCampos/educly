import { LucideIcon, ChevronRight } from "lucide-react";
import { useTranslation } from 'react-i18next';

interface TrailCardProps {
  name: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  themeColor: string;
  onClick: () => void;
  delay: number;
  currentDay?: number;
  totalDays?: number;
}

export const TrailCard = ({ 
  name, 
  description, 
  icon: Icon, 
  themeColor,
  onClick, 
  delay,
  currentDay = 0,
  totalDays = 28
}: TrailCardProps) => {
  const { t } = useTranslation();
  const isStarted = currentDay > 0;
  const progressPercentage = (currentDay / totalDays) * 100;

  return (
    <div
      className="
        bg-card rounded-2xl border border-border
        p-5 cursor-pointer
        shadow-card card-hover
        opacity-0 animate-fade-in-up
      "
      style={{
        animationDelay: `${delay * 0.05}s`,
        animationFillMode: 'forwards'
      }}
      onClick={onClick}
    >
      {/* Header with icon and arrow */}
      <div className="flex items-start justify-between mb-3">
        <div 
          className="p-3 rounded-xl"
          style={{
            backgroundColor: `${themeColor}15`,
          }}
        >
          <Icon 
            className="w-6 h-6" 
            style={{ color: themeColor }}
          />
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </div>
      
      {/* Title */}
      <h3 className="text-lg font-semibold text-foreground mb-1">
        {name}
      </h3>
      
      {/* Description */}
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {description}
      </p>

      {/* Progress or Start indicator */}
      {isStarted ? (
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-muted-foreground">
              {t('trailCard.day')} {currentDay}/{totalDays}
            </span>
            <span className="font-medium text-foreground">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <div className="h-1.5 bg-surface rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-300"
              style={{ 
                width: `${progressPercentage}%`,
                backgroundColor: themeColor
              }}
            />
          </div>
        </div>
      ) : (
        <div 
          className="text-center py-2 rounded-xl text-sm font-medium transition-colors"
          style={{
            backgroundColor: `${themeColor}10`,
            color: themeColor
          }}
        >
          {t('trailCard.startButton')}
        </div>
      )}
    </div>
  );
};
