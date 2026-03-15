import { useRef, useEffect } from "react";
import { Check, Lock, Play } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StepProgress {
  stepNumber: number;
  status: "completed" | "current" | "locked";
}

interface FreelancerStepsBarProps {
  steps: StepProgress[];
  currentStep: number;
  onStepClick: (step: number) => void;
}

export const FreelancerStepsBar = ({ steps, currentStep, onStepClick }: FreelancerStepsBarProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to center current step
  useEffect(() => {
    if (scrollRef.current) {
      const currentStepElement = document.getElementById(`step-bar-node-${currentStep}`);
      if (currentStepElement) {
        const container = scrollRef.current;
        const scrollLeft = currentStepElement.offsetLeft - container.offsetWidth / 2 + currentStepElement.offsetWidth / 2;
        container.scrollTo({ left: scrollLeft, behavior: "smooth" });
      }
    }
  }, [currentStep]);

  return (
    <div className="w-full relative py-4 overflow-visible">
      {/* Side shadows to indicate scroll */}
      <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

      <div
        ref={scrollRef}
        className="flex items-center gap-3 overflow-x-auto overflow-y-visible px-6 pt-2 pb-4 no-scrollbar snap-x scroll-pl-6"
      >
        {steps.map((step) => {
          const isCurrent = step.stepNumber === currentStep;
          const isCompleted = step.status === "completed";
          const isLocked = step.status === "locked";

          return (
            <div
              key={step.stepNumber}
              id={`step-bar-node-${step.stepNumber}`}
              className="flex flex-col items-center gap-1.5 flex-shrink-0 snap-center"
            >
              <button
                onClick={() => !isLocked && onStepClick(step.stepNumber)}
                disabled={isLocked}
                className={cn(
                  "rounded-full flex items-center justify-center transition-all duration-200 relative hover:scale-110",
                  isCurrent
                    ? "w-10 h-10 bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 scale-110 z-10 ring-2 ring-emerald-400/30"
                    : "w-8 h-8",

                  isCompleted && !isCurrent
                    ? "bg-emerald-500 text-white shadow-md hover:shadow-lg"
                    : "",

                  isLocked
                    ? "bg-muted/50 text-muted-foreground/40 border border-border cursor-not-allowed hover:scale-100"
                    : "",
                )}
              >
                {isCurrent && <Play className="w-4 h-4 fill-current ml-0.5" />}
                {isCompleted && !isCurrent && <Check className="w-4 h-4 stroke-[3]" />}
                {isLocked && <Lock className="w-3 h-3" />}
                
                {isCurrent && (
                  <span className="absolute inset-0 rounded-full animate-ping bg-emerald-500/20" />
                )}
              </button>

              <span
                className={cn(
                  "text-[9px] font-semibold uppercase tracking-wide",
                  isCurrent ? "text-emerald-600" : "text-muted-foreground",
                )}
              >
                {step.stepNumber}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
