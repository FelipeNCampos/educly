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
    <div className="py-8 flex justify-center w-full overflow-x-hidden">
      <div className="relative w-full max-w-[400px]" style={{ height: `${svgHeight}px` }}>
        <svg
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          viewBox={`0 0 ${VIEWBOX_WIDTH} ${svgHeight}`}
          preserveAspectRatio="xMidYMin meet"
        >
          {/* Caminho Base - Cinza Escuro Discord */}
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
            stroke="#4e5058"
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* Caminho Concluído - Verde Sólido (SEM LED) */}
          {completedModules.length > 0 && (
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
              stroke="#23a55a"
              strokeWidth="6"
              strokeLinecap="round"
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
              className="absolute w-24 sm:w-28 flex flex-col items-center z-10"
              style={{
                top: `${START_Y_OFFSET + index * ROW_HEIGHT}px`,
                left: "50%",
                marginLeft: isLeft ? "-115px" : "15px",
              }}
            >
              {isCompleted && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex gap-0.5 z-20">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400 -mt-0.5" />
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                </div>
              )}

              {/* BOTAO DA MEDALHA - CORES FIXAS PARA DISCORD DARK */}
              <button
                onClick={() => !isLocked && onModuleClick(module.moduleNumber, module.hasContent)}
                disabled={isLocked}
                className={cn(
                  "w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-200 relative border-4",
                  isLocked
                    ? "bg-[#2b2d31] border-[#1e1f22] text-[#4e5058]" 
                    : isCompleted
                      ? "bg-[#23a55a] border-white text-white shadow-md"
                      : isCurrent
                        ? "bg-[#5865f2] border-white text-white ring-4 ring-[#5865f2]/20 scale-110 z-20"
                        : "bg-[#35373c] border-[#4e5058] text-white hover:scale-105"
                )}
              >
                <div className="flex items-center justify-center">
                  {isCompleted ? (
                    <Check className="w-6 h-6 stroke-[4]" />
                  ) : isLocked ? (
                    <Lock className="w-5 h-5 opacity-40" />
                  ) : (
                    <span className="text-lg font-black">{module.moduleNumber}</span>
                  )}
                </div>
              </button>

              <div
                className={cn(
                  "mt-4 w-32 sm:w-36 text-center p-2 rounded-xl transition-all duration-300",
                  isLocked ? "opacity-40" : "opacity-100",
                  isCurrent 
                    ? "bg-[#2b2d31] border-2 border-[#5865f2] shadow-xl" 
                    : "bg-[#2b2d31] border border-white/5"
                )}
              >
                <p className="text-[9px] font-black text-[#b5bac1] uppercase tracking-tighter">
                  {t("freelancer.module")} {module.moduleNumber}
                </p>
                <p className="text-[11px] font-bold text-white leading-tight line-clamp-2">
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
