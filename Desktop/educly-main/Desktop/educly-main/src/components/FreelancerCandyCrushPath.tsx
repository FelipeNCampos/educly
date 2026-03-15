import { Star, Lock, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

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

  const isModuleUnlocked = (moduleNumber: number): boolean => {
    if (moduleNumber === 1) return true;
    const previousModule = moduleProgress[moduleNumber - 1];
    return previousModule?.completed === true;
  };

  const isModuleCompleted = (moduleNumber: number): boolean => {
    return moduleProgress[moduleNumber]?.completed === true;
  };

  // Constants matching the 28-day challenge exactly
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

  return (
    <div className="py-8">
      <div className="flex justify-center w-full">
        <div className="relative flex justify-center w-full overflow-hidden">
          {/* Fixed width container like 28-day challenge */}
          <div className="relative w-[400px] min-w-[400px]" style={{ height: `${svgHeight}px` }}>
            <svg
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
              viewBox={`0 0 ${VIEWBOX_WIDTH} ${svgHeight}`}
            >
              {/* Base trail - muted gray - ALWAYS VISIBLE */}
              <path
                d={modules
                  .map((_, i) => {
                    if (i === modules.length - 1) return "";
                    const startY = START_Y_OFFSET + i * ROW_HEIGHT + 40;
                    const endY = START_Y_OFFSET + (i + 1) * ROW_HEIGHT + 40;
                    const isEven = i % 2 === 0;
                    const startX = isEven ? CENTER_X - OFFSET_X : CENTER_X + OFFSET_X;
                    const endX = isEven ? CENTER_X + OFFSET_X : CENTER_X - OFFSET_X;
                    return `M ${startX} ${startY} C ${startX} ${startY + 80}, ${endX} ${endY - 80}, ${endX} ${endY}`;
                  })
                  .join(" ")}
                fill="none"
                stroke="#d1d5db"
                strokeWidth="6"
                strokeLinecap="round"
              />

              {/* Completed trail - green solid - only for completed modules */}
              {completedModules.length > 0 && (
                <>
                  <path
                    d={modules
                      .slice(0, completedModules.length + 1)
                      .map((_, i) => {
                        if (i >= completedModules.length) return "";
                        const startY = START_Y_OFFSET + i * ROW_HEIGHT + 40;
                        const endY = START_Y_OFFSET + (i + 1) * ROW_HEIGHT + 40;
                        const isEven = i % 2 === 0;
                        const startX = isEven ? CENTER_X - OFFSET_X : CENTER_X + OFFSET_X;
                        const endX = isEven ? CENTER_X + OFFSET_X : CENTER_X - OFFSET_X;
                        return `M ${startX} ${startY} C ${startX} ${startY + 80}, ${endX} ${endY - 80}, ${endX} ${endY}`;
                      })
                      .join(" ")}
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />

                  {/* LED animation overlay on completed trail */}
                  <path
                    d={modules
                      .slice(0, completedModules.length + 1)
                      .map((_, i) => {
                        if (i >= completedModules.length) return "";
                        const startY = START_Y_OFFSET + i * ROW_HEIGHT + 40;
                        const endY = START_Y_OFFSET + (i + 1) * ROW_HEIGHT + 40;
                        const isEven = i % 2 === 0;
                        const startX = isEven ? CENTER_X - OFFSET_X : CENTER_X + OFFSET_X;
                        const endX = isEven ? CENTER_X + OFFSET_X : CENTER_X - OFFSET_X;
                        return `M ${startX} ${startY} C ${startX} ${startY + 80}, ${endX} ${endY - 80}, ${endX} ${endY}`;
                      })
                      .join(" ")}
                    fill="none"
                    stroke="#4ade80"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray="8 24"
                    className="animate-led-flow"
                  />
                </>
              )}
            </svg>

            {/* Module nodes - positioned absolutely like 28-day challenge */}
            {modules.map((module, index) => {
              const isCompleted = isModuleCompleted(module.moduleNumber);
              const isCurrent = module.moduleNumber === currentModuleNumber;
              const isLocked = !isModuleUnlocked(module.moduleNumber);
              const isLeft = index % 2 === 0;

              return (
                <div
                  key={module.id}
                  className="absolute w-28 flex flex-col items-center z-10"
                  style={{
                    top: `${START_Y_OFFSET + index * ROW_HEIGHT}px`,
                    left: "50%",
                    marginLeft: isLeft ? `-${OFFSET_X + 56}px` : `${OFFSET_X - 56}px`,
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  {/* Stars for completed modules */}
                  {isCompleted && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex gap-0.5 z-20">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400 -mt-0.5" />
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    </div>
                  )}

                  {/* Module button */}
                  <button
                    onClick={() => !isLocked && onModuleClick(module.moduleNumber, module.hasContent)}
                    disabled={isLocked}
                    className={cn(
                      "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 relative",
                      "border-2",
                      isLocked
                        ? "bg-muted border-border cursor-not-allowed opacity-50"
                        : isCompleted
                          ? "bg-success border-success text-white shadow-sm"
                          : isCurrent
                            ? "bg-success border-success text-white shadow-md ring-4 ring-success/20"
                            : "bg-card border-border hover:border-success/50 text-foreground",
                    )}
                  >
                    <div className="w-8 h-8 flex items-center justify-center">
                      {isCompleted ? (
                        <Check className="w-5 h-5 stroke-[3]" />
                      ) : isLocked ? (
                        <Lock className="w-5 h-5 opacity-50" />
                      ) : isCurrent ? (
                        <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                      ) : (
                        <span className="text-lg font-bold">{module.moduleNumber}</span>
                      )}
                    </div>
                  </button>

                  {/* Label below the node */}
                  <div
                    className={cn(
                      "mt-2 w-32 text-center bg-card/80 backdrop-blur-sm border border-border/50 px-2 py-1.5 rounded-lg shadow-sm transition-all duration-200",
                      isCurrent || isCompleted
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-2",
                    )}
                  >
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                      {t("freelancer.module", "Módulo")} {module.moduleNumber}
                    </p>
                    <p className="text-xs font-medium text-foreground leading-tight line-clamp-2">
                      {module.title}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
