import { useTranslation } from 'react-i18next';

interface JourneyCardProps {
  completedPhases: number;
  totalPhases: number;
  startedTrails: number;
  totalTrails: number;
}

export const JourneyCard = ({ 
  completedPhases, 
  totalPhases, 
  startedTrails, 
  totalTrails 
}: JourneyCardProps) => {
  const { t } = useTranslation();
  const progressPercentage = Math.round((completedPhases / totalPhases) * 100);

  return (
    <div className="bg-card rounded-2xl border border-border p-6 shadow-card">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        {t('dashboard.myJourney')}
      </h3>
      
      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">{t('dashboard.overallProgress')}</span>
          <span className="font-medium text-foreground">{progressPercentage}%</span>
        </div>
        <div className="h-2.5 bg-surface rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-500 animate-progress"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-surface rounded-xl">
          <p className="text-2xl font-bold text-foreground">{startedTrails}</p>
          <p className="text-xs text-muted-foreground">{t('dashboard.trailsStarted')}</p>
        </div>
        <div className="text-center p-3 bg-surface rounded-xl">
          <p className="text-2xl font-bold text-foreground">{completedPhases}</p>
          <p className="text-xs text-muted-foreground">{t('dashboard.daysCompleted')}</p>
        </div>
      </div>
    </div>
  );
};
