import { useRef, useEffect } from 'react';
import { Check, Lock, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressBar28DaysProps {
  totalDays: number;
  completedDays: number[];
  currentDay: number;
  onDayClick: (day: number) => void;
  isUnlocked: (day: number) => boolean;
}

export const ProgressBar28Days = ({
  totalDays,
  completedDays,
  currentDay,
  onDayClick,
  isUnlocked,
}: ProgressBar28DaysProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentDayRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (currentDayRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const button = currentDayRef.current;
      const containerWidth = container.offsetWidth;
      const buttonLeft = button.offsetLeft;
      const buttonWidth = button.offsetWidth;
      
      container.scrollTo({
        left: buttonLeft - containerWidth / 2 + buttonWidth / 2,
        behavior: 'smooth',
      });
    }
  }, [currentDay]);

  const getDayStatus = (day: number): 'completed' | 'current' | 'unlocked' | 'locked' => {
    if (completedDays.includes(day)) return 'completed';
    if (day === currentDay) return 'current';
    if (isUnlocked(day)) return 'unlocked';
    return 'locked';
  };

  return (
    <div className="relative">
      {/* Gradient fades on edges */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
      
      {/* Scrollable container */}
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide py-2 px-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {Array.from({ length: totalDays }, (_, i) => i + 1).map((day) => {
          const status = getDayStatus(day);
          const isCompleted = status === 'completed';
          const isCurrent = status === 'current';
          const isLocked = status === 'locked';

          return (
            <button
              key={day}
              ref={isCurrent ? currentDayRef : null}
              onClick={() => !isLocked && onDayClick(day)}
              disabled={isLocked}
              className={cn(
                'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300',
                isCompleted && 'bg-primary text-primary-foreground shadow-lg shadow-primary/30',
                isCurrent && 'bg-primary text-primary-foreground ring-4 ring-primary/30 scale-110 shadow-xl shadow-primary/40',
                !isCompleted && !isCurrent && !isLocked && 'bg-muted text-muted-foreground hover:bg-primary/20',
                isLocked && 'bg-muted/50 text-muted-foreground/50 cursor-not-allowed'
              )}
            >
              {isCompleted ? (
                <Check className="w-4 h-4" />
              ) : isCurrent ? (
                <Star className="w-4 h-4" />
              ) : isLocked ? (
                <Lock className="w-3 h-3" />
              ) : (
                `D${day}`
              )}
            </button>
          );
        })}
      </div>
      
      {/* Progress line */}
      <div className="px-4 mt-1">
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500"
            style={{ width: `${(completedDays.length / totalDays) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};
