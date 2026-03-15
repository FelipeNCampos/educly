import { useRef, useEffect } from "react";
import { Check, Lock, Play } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DayProgress {
  dayNumber: number;
  status: "completed" | "current" | "locked" | "unlocked";
}

interface DaysProgressBarProps {
  days: DayProgress[];
  currentDay: number;
  onDayClick: (day: number) => void;
}

export const DaysProgressBar = ({ days, currentDay, onDayClick }: DaysProgressBarProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll automático para centralizar o botão roxo (dia atual)
  useEffect(() => {
    if (scrollRef.current) {
      const currentDayElement = document.getElementById(`day-bar-node-${currentDay}`);
      if (currentDayElement) {
        const container = scrollRef.current;
        const scrollLeft = currentDayElement.offsetLeft - container.offsetWidth / 2 + currentDayElement.offsetWidth / 2;
        container.scrollTo({ left: scrollLeft, behavior: "smooth" });
      }
    }
  }, [currentDay]);

  return (
    <div className="w-full relative py-4 overflow-visible">
      {/* Sombras laterais para indicar scroll */}
      <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

      <div
        ref={scrollRef}
        className="flex items-center gap-4 overflow-x-auto overflow-y-visible px-6 pt-2 pb-4 no-scrollbar snap-x scroll-pl-6"
      >
        {days.map((day) => {
          const isCurrent = day.dayNumber === currentDay;
          const isCompleted = day.status === "completed";
          const isLocked = day.status === "locked";

          return (
            <div
              key={day.dayNumber}
              id={`day-bar-node-${day.dayNumber}`}
              className="flex flex-col items-center gap-2 flex-shrink-0 snap-center"
            >
              <button
                onClick={() => !isLocked && onDayClick(day.dayNumber)}
                disabled={isLocked}
                className={cn(
                  "rounded-full flex items-center justify-center transition-all duration-200 relative hover:scale-110",
                  isCurrent
                    ? "w-12 h-12 bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-110 z-10 ring-2 ring-primary/20"
                    : "w-10 h-10",

                  isCompleted && !isCurrent
                    ? "bg-success text-success-foreground shadow-md hover:shadow-lg"
                    : "",

                  isLocked
                    ? "bg-muted/50 text-muted-foreground/40 border border-border cursor-not-allowed hover:scale-100"
                    : "",
                    
                  !isCompleted && !isCurrent && !isLocked
                    ? "bg-card border border-border hover:border-primary/40 hover:shadow-md"
                    : "",
                )}
              >
                {isCurrent && <Play className="w-5 h-5 fill-current ml-0.5" />}
                {isCompleted && !isCurrent && <Check className="w-5 h-5 stroke-[3]" />}
                {isLocked && <Lock className="w-4 h-4" />}
                
                {isCurrent && (
                  <span className="absolute inset-0 rounded-full animate-ping bg-primary/20" />
                )}
              </button>

              <span
                className={cn(
                  "text-[10px] font-semibold uppercase tracking-wide",
                  isCurrent ? "text-primary" : "text-muted-foreground",
                )}
              >
                D{day.dayNumber}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
