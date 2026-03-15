import { Star, Lock, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";

interface FreelancerModule {
  id: string;
  moduleNumber: number;
  title: string;
  description: string;
  icon: string;
  totalSteps: number;
  hasContent: boolean;
}

interface FreelancerCandyCrushPathProps {
  modules: FreelancerModule[];
  moduleProgress: Record<number, { stepIndex: number; completed: boolean }>;
  onModuleClick: (moduleNumber: number, hasContent: boolean) => void;
}

export const FreelancerCandyCrushPath = ({
  modules,
  moduleProgress,
  onModuleClick,
}: FreelancerCandyCrushPathProps) => {
  const { t } = useTranslation();
  const currentModuleRef = useRef<HTMLDivElement>(null);

  const isModuleUnlocked = (moduleNumber: number): boolean => {
    if (moduleNumber === 1) return true;
    const previousModule = moduleProgress[moduleNumber - 1];
    return previousModule?.completed === true;
  };

  const isModuleCompleted = (moduleNumber: number): boolean => {
    return moduleProgress[moduleNumber]?.completed === true;
  };

  const ROW_HEIGHT = 160;
  const START_Y_OFFSET = 60;
  const VIEWBOX_WIDTH = 400;
  const CENTER_X = VIEWBOX_WIDTH / 2;
  const OFFSET_X = 80;

  const completedModules = modules.filter((m) => isModuleCompleted(m.moduleNumber));
  const currentModuleNumber = modules.find(
    (m) => isModuleUnlocked(m.moduleNumber) && !isModuleCompleted(m.moduleNumber)
  )?.moduleNumber || 1;

  const svgHeight = modules.length * ROW_HEIGHT + START_Y_OFFSET + 100;

  // Confetti on new completion
  const prevCompletedCount = useRef(completedModules.length);
  const [recentlyCompleted, setRecentlyCompleted] = useState<number | null>(null);

  useEffect(() => {
    if (completedModules.length > prevCompletedCount.current) {
      const lastCompleted = completedModules[completedModules.length - 1];
      setRecentlyCompleted(lastCompleted?.moduleNumber || null);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.4 },
        colors: ["#22c55e", "#6366f1", "#fbbf24"],
      });
      setTimeout(() => setRecentlyCompleted(null), 2000);
    }
    prevCompletedCount.current = completedModules.length;
  }, [completedModules.length]);

  // Auto-scroll to current module
  useEffect(() => {
    if (currentModuleRef.current) {
      setTimeout(() => {
        currentModuleRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 500);
    }
  }, [currentModuleNumber]);

  // Build path data helper
  const buildPathData = (count: number) =>
    modules
      .slice(0, count)
      .map((_, i) => {
        if (i >= count - 1) return "";
        const startY = START_Y_OFFSET + i * ROW_HEIGHT + 40;
        const endY = START_Y_OFFSET + (i + 1) * ROW_HEIGHT + 40;
        const isEven = i % 2 === 0;
        const startX = isEven ? CENTER_X - OFFSET_X : CENTER_X + OFFSET_X;
        const endX = isEven ? CENTER_X + OFFSET_X : CENTER_X - OFFSET_X;
        return `M ${startX} ${startY} C ${startX} ${startY + 80}, ${endX} ${endY - 80}, ${endX} ${endY}`;
      })
      .join(" ");

  return (
    <div className="py-8 flex justify-center w-full overflow-x-hidden">
      <div className="relative w-full max-w-[400px]" style={{ height: `${svgHeight}px` }}>
        <svg
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          viewBox={`0 0 ${VIEWBOX_WIDTH} ${svgHeight}`}
          preserveAspectRatio="xMidYMin meet"
        >
          {/* Base path */}
          <path
            d={buildPathData(modules.length)}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="6"
            strokeLinecap="round"
            opacity="0.3"
          />

          {/* Completed path — solid green */}
          {completedModules.length > 0 && (
            <path
              d={buildPathData(completedModules.length + 1)}
              fill="none"
              stroke="#22c55e"
              strokeWidth="6"
              strokeLinecap="round"
              opacity="1"
            />
          )}

          {/* LED flow on completed path */}
          {completedModules.length > 0 && (
            <path
              d={buildPathData(completedModules.length + 1)}
              fill="none"
              stroke="#4ade80"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray="10 20"
              className="animate-led-flow drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]"
            />
          )}
        </svg>

        {modules.map((module, index) => {
          const isCompleted = isModuleCompleted(module.moduleNumber);
          const isCurrent = module.moduleNumber === currentModuleNumber;
          const isLocked = !isModuleUnlocked(module.moduleNumber);
          const isLeft = index % 2 === 0;

          return (
            <div
              key={module.id}
              ref={isCurrent ? currentModuleRef : null}
              className={cn(
                "absolute w-28 flex flex-col items-center z-10",
                recentlyCompleted === module.moduleNumber && "animate-completion-burst"
              )}
              style={{
                top: `${START_Y_OFFSET + index * ROW_HEIGHT}px`,
                left: "50%",
                marginLeft: isLeft ? `-${OFFSET_X + 56}px` : `${OFFSET_X - 56}px`,
              }}
            >
              {/* Stars for completed */}
              {isCompleted && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex gap-0.5 z-20">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400 -mt-0.5" />
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                </div>
              )}

              {/* Circle button */}
              <button
                onClick={() => !isLocked && onModuleClick(module.moduleNumber, module.hasContent)}
                disabled={isLocked}
                className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 relative border-4",
                  isLocked
                    ? "bg-muted border-border cursor-not-allowed opacity-50"
                    : isCompleted
                      ? "bg-[#22c55e] border-[#16a34a] text-white shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                      : isCurrent
                        ? "bg-primary border-primary text-primary-foreground shadow-lg ring-4 ring-primary/20 scale-110 z-20"
                        : "bg-card border-border hover:border-primary/50"
                )}
              >
                <div className="w-8 h-8 flex items-center justify-center">
                  {isCompleted ? (
                    <Check className="w-6 h-6 stroke-[4]" />
                  ) : isLocked ? (
                    <Lock className="w-5 h-5" />
                  ) : (
                    <span className="font-black text-lg">{module.moduleNumber}</span>
                  )}
                </div>
              </button>

              {/* Label */}
              <div
                className={cn(
                  "mt-3 w-32 text-center bg-card border px-2 py-2 rounded-xl shadow-md transition-all",
                  isLocked ? "opacity-40" : "opacity-100",
                  isCurrent
                    ? "border-primary shadow-xl"
                    : "border-border"
                )}
              >
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  {t("freelancer.module", "Módulo")} {module.moduleNumber}
                </p>
                <p className="text-xs font-bold text-foreground leading-tight line-clamp-2">
                  {module.title}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
