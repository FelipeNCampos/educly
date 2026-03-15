import { Lock, CheckCircle, Play, ChevronRight, BookOpen, Target, Zap, Trophy, Lightbulb, Rocket, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from 'react-i18next';

interface DayCardProps {
  dayNumber: number;
  title: string;
  description: string;
  status: 'locked' | 'available' | 'completed';
  onClick: () => void;
}

const getDayIcon = (dayNumber: number) => {
  const icons = [
    BookOpen, BookOpen, BookOpen, BookOpen,
    Lightbulb, Lightbulb, Star,
    Target, Target, Target, Target, Target, Zap, Trophy,
    Rocket, Rocket, Rocket, Rocket, Rocket, Rocket, Trophy,
    Star, Star, Star, Star, Star, Trophy, Trophy,
  ];
  return icons[Math.min(dayNumber - 1, icons.length - 1)] || BookOpen;
};

export const DayCard = ({
  dayNumber,
  title,
  description,
  status,
  onClick
}: DayCardProps) => {
  const { t } = useTranslation();
  const Icon = getDayIcon(dayNumber);

  return (
    <button
      onClick={onClick}
      disabled={status === 'locked'}
      className={cn(
        "w-full p-4 rounded-xl border transition-all duration-200 text-left",
        "flex items-center gap-4",
        status === 'completed' && "bg-primary/5 border-primary/20 hover:bg-primary/10",
        status === 'available' && "bg-card border-primary/40 hover:border-primary shadow-sm hover:shadow-md",
        status === 'locked' && "bg-muted/30 border-border/50 opacity-60 cursor-not-allowed"
      )}
    >
      {/* Day number with icon */}
      <div
        className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all",
          status === 'completed' && "bg-primary text-primary-foreground",
          status === 'available' && "bg-primary/20 text-primary",
          status === 'locked' && "bg-muted text-muted-foreground"
        )}
      >
        {status === 'completed' ? (
          <CheckCircle className="w-5 h-5" />
        ) : status === 'locked' ? (
          <Lock className="w-4 h-4" />
        ) : (
          <Icon className="w-5 h-5" />
        )}
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={cn(
            "text-xs font-semibold uppercase tracking-wide",
            status === 'completed' && "text-primary",
            status === 'available' && "text-primary",
            status === 'locked' && "text-muted-foreground"
          )}>
            {t('trail.dayLabel', 'Dia')} {dayNumber}
          </span>
          {status === 'completed' && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">
              {t('lesson.completed')}
            </span>
          )}
          {status === 'available' && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary animate-pulse">
              {t('lesson.startNow')}
            </span>
          )}
        </div>
        <h3 className={cn(
          "font-semibold text-sm truncate",
          status === 'locked' && "text-muted-foreground"
        )}>
          {title}
        </h3>
        <p className={cn(
          "text-xs truncate mt-0.5",
          status === 'locked' ? "text-muted-foreground/60" : "text-muted-foreground"
        )}>
          {description}
        </p>
      </div>
      
      {/* Arrow */}
      <div className="flex-shrink-0">
        {status === 'locked' ? (
          <Lock className="w-4 h-4 text-muted-foreground/50" />
        ) : (
          <ChevronRight className={cn(
            "w-5 h-5",
            status === 'completed' ? "text-primary/60" : "text-primary"
          )} />
        )}
      </div>
    </button>
  );
};
