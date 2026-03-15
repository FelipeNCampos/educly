import { useRef, useEffect } from "react";
import { Check, Lock, Play } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StepProgress {
    stepNumber: number;
    status: "completed" | "current" | "locked" | "unlocked";
}

interface FreelancerStepsBarProps {
    steps: StepProgress[];
    currentStep: number;
    onStepClick: (step: number) => void;
}

export const FreelancerStepsBar = ({ steps, currentStep, onStepClick }: FreelancerStepsBarProps) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            const currentElement = document.getElementById(`step-bar-node-${currentStep}`);
            if (currentElement) {
                const container = scrollRef.current;
                // Lógica de scroll ajustada para garantir visibilidade no mobile
                const scrollLeft = currentElement.offsetLeft - container.offsetWidth / 2 + currentElement.offsetWidth / 2;
                container.scrollTo({ left: scrollLeft, behavior: "smooth" });
            }
        }
    }, [currentStep]);

    return (
        <div className="w-full relative">
            {/* Container de scroll com padding generoso (py-6) para não cortar o efeito pulsante */}
            <div
                ref={scrollRef}
                className="w-full overflow-x-auto overflow-y-visible py-6 px-4 no-scrollbar snap-x"
            >
                {/* Wrapper interno que garante centralização se houver poucos itens, e scroll seguro se houver muitos */}
                <div className="flex items-center justify-center min-w-full gap-4">
                    {steps.map((step) => {
                        const isCurrent = step.stepNumber === currentStep;
                        const isCompleted = step.status === "completed";
                        const isLocked = step.status === "locked";

                        return (
                            <div
                                key={step.stepNumber}
                                id={`step-bar-node-${step.stepNumber}`}
                                className="flex flex-col items-center gap-2 flex-shrink-0 snap-center group"
                            >
                                <button
                                    onClick={() => !isLocked && onStepClick(step.stepNumber)}
                                    disabled={isLocked}
                                    className={cn(
                                        "rounded-full flex items-center justify-center transition-all duration-300 relative",

                                        // ESTADO ATUAL (Pulsante)
                                        // scale-105: levemente maior, mas sem exageros
                                        isCurrent
                                            ? "w-12 h-12 bg-primary text-primary-foreground shadow-md shadow-primary/25 scale-105 z-10 ring-2 ring-primary/20"
                                            : "w-10 h-10 hover:scale-105",

                                        // ESTADO COMPLETADO
                                        isCompleted && !isCurrent
                                            ? "bg-green-500 text-white shadow-sm hover:shadow-md hover:bg-green-600"
                                            : "",

                                        // ESTADO BLOQUEADO
                                        isLocked
                                            ? "bg-gray-100 text-gray-300 border border-gray-200 cursor-not-allowed"
                                            : "",

                                        // ESTADO DISPONÍVEL
                                        !isCompleted && !isCurrent && !isLocked
                                            ? "bg-white border border-gray-200 text-gray-700 hover:border-primary/50 hover:text-primary"
                                            : "",
                                    )}
                                >
                                    {isCurrent && <Play className="w-5 h-5 fill-current ml-0.5" />}
                                    {isCompleted && !isCurrent && <Check className="w-5 h-5 stroke-[3]" />}
                                    {isLocked && <Lock className="w-4 h-4" />}

                                    {/* Efeito Pulsante (Ping) contido dentro do padding do container pai */}
                                    {isCurrent && (
                                        <span className="absolute inset-0 rounded-full animate-ping bg-primary/20" />
                                    )}
                                </button>

                                <span
                                    className={cn(
                                        "text-[10px] font-bold uppercase tracking-wider transition-colors",
                                        isCurrent ? "text-primary" : "text-gray-400 group-hover:text-gray-600",
                                    )}
                                >
                  {/* Alterado de M para D conforme solicitado */}
                                    D{step.stepNumber}
                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};