import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import mascoteEducy from "@/assets/mascote-educy.png";
import { ChevronRight, X } from "lucide-react";
import { useTranslation } from "react-i18next";

export interface TutorialStep {
  id: string;
  messageKey: string;
  targetId?: string;
  mascotPosition?: "left" | "right" | "top" | "bottom";
  allowClick?: boolean;
}

interface TutorialSpotlightProps {
  steps: TutorialStep[];
  storageKey: string;
  userId?: string; // <--- NOVO: ID do usuário (opcional, mas recomendado)
  onComplete?: () => void;
  onStepChange?: (stepIndex: number, step: TutorialStep) => void;
  isVisible?: boolean;
}

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export const TutorialSpotlight = ({
  steps,
  storageKey,
  userId, // Recebendo o ID
  onComplete,
  onStepChange,
  isVisible = true,
}: TutorialSpotlightProps) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [mascotStyle, setMascotStyle] = useState<React.CSSProperties>({});
  const [isMobile, setIsMobile] = useState(false);

  // Gera a chave única combinando o nome do tutorial e o ID do usuário
  // Ex: "tutorial_dashboard_user123" ou apenas "tutorial_dashboard" se não tiver ID
  const fullStorageKey = userId ? `tutorial_${storageKey}_${userId}` : `tutorial_${storageKey}`;

  // Estado para controlar se já foi completado
  const [hasCompleted, setHasCompleted] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(fullStorageKey) === "true";
    }
    return false;
  });

  // Efeito para re-verificar caso o userId mude (ex: login assíncrono)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isDone = localStorage.getItem(fullStorageKey) === "true";
      setHasCompleted(isDone);
    }
  }, [fullStorageKey]);

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isCentered = !step?.targetId;

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Block scroll when tutorial is visible AND not completed
  useEffect(() => {
    if (isVisible && !hasCompleted) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [isVisible, hasCompleted]);

  // Calculate target element position
  const updateTargetPosition = useCallback(() => {
    if (!step?.targetId) {
      setTargetRect(null);
      return;
    }

    const element = document.getElementById(step.targetId);
    if (!element) {
      console.warn(`[Tutorial] Target element "${step.targetId}" not found, skipping step`);
      setTargetRect(null);

      if (currentStep < steps.length - 1) {
        setTimeout(() => setCurrentStep((prev) => prev + 1), 100);
      }
      return;
    }

    element.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    setTimeout(() => {
      const rect = element.getBoundingClientRect();
      const padding = isMobile ? 6 : 16;

      setTargetRect({
        top: rect.top - padding,
        left: rect.left - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
      });
    }, 300);
  }, [step?.targetId, isMobile, currentStep, steps.length]);

  // Update target position on changes
  useEffect(() => {
    if (!isVisible || hasCompleted) return;

    updateTargetPosition();

    const handleResize = () => updateTargetPosition();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [currentStep, isVisible, updateTargetPosition, hasCompleted]);

  // Calculate mascot position
  useEffect(() => {
    if (hasCompleted) return;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (isMobile) {
      setMascotStyle({
        position: "fixed",
        bottom: "16px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "calc(100% - 32px)",
        maxWidth: "360px",
      });
      return;
    }

    if (!targetRect || isCentered) {
      setMascotStyle({
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      });
      return;
    }

    const mascotSize = 120;
    const bubbleWidth = 320;
    const gap = 16;
    const position = step?.mascotPosition || "right";

    let top = targetRect.top - window.scrollY;
    let left = targetRect.left;

    switch (position) {
      case "left":
        left = targetRect.left - mascotSize - bubbleWidth - gap;
        top = targetRect.top - window.scrollY + targetRect.height / 2 - mascotSize / 2;
        break;
      case "right":
        left = targetRect.left + targetRect.width + gap;
        top = targetRect.top - window.scrollY + targetRect.height / 2 - mascotSize / 2;
        break;
      case "top":
        left = targetRect.left + targetRect.width / 2 - mascotSize / 2;
        top = targetRect.top - window.scrollY - mascotSize - 200;
        break;
      case "bottom":
        left = targetRect.left + targetRect.width / 2 - mascotSize / 2;
        top = targetRect.top - window.scrollY + targetRect.height + gap;
        break;
    }

    const maxLeft = viewportWidth - mascotSize - bubbleWidth - 20;
    const maxTop = viewportHeight - mascotSize - 200;

    left = Math.max(20, Math.min(left, maxLeft));
    top = Math.max(20, Math.min(top, maxTop));

    setMascotStyle({
      position: "fixed",
      top: `${top}px`,
      left: `${left}px`,
    });
  }, [targetRect, step?.mascotPosition, isCentered, isMobile, hasCompleted]);

  // Notify parent of step change
  useEffect(() => {
    if (isVisible && step && !hasCompleted) {
      onStepChange?.(currentStep, step);
    }
  }, [currentStep, isVisible, step, onStepChange, hasCompleted]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    // Salva usando a chave completa (com ID)
    localStorage.setItem(fullStorageKey, "true");
    setHasCompleted(true);
    onComplete?.();
  };

  // Se não estiver visível, ou já completou, ou não tem userId (opcional, para evitar salvar undefined), não mostra
  if (!isVisible || hasCompleted || !step) return null;

  const message = t(step.messageKey);

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
      <div className="absolute inset-0 bg-black/75 pointer-events-auto" onClick={handleClose} />

      {targetRect && (
        <>
          <div
            className="fixed bg-transparent rounded-2xl pointer-events-none"
            style={{
              top: targetRect.top,
              left: targetRect.left,
              width: targetRect.width,
              height: targetRect.height,
              boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.75)",
              zIndex: 1,
            }}
          />

          <div
            className="fixed border-2 border-primary rounded-2xl pointer-events-none transition-all duration-300 ease-out"
            style={{
              top: targetRect.top,
              left: targetRect.left,
              width: targetRect.width,
              height: targetRect.height,
              boxShadow: "0 0 0 4px rgba(139, 92, 246, 0.3)",
              zIndex: 2,
            }}
          />
        </>
      )}

      {targetRect && step.allowClick && (
        <div
          className="fixed cursor-pointer rounded-2xl"
          style={{
            top: targetRect.top,
            left: targetRect.left,
            width: targetRect.width,
            height: targetRect.height,
            pointerEvents: "auto",
            zIndex: 3,
          }}
        />
      )}

      <div
        className="pointer-events-auto transition-all duration-300 ease-out"
        style={{
          ...mascotStyle,
          zIndex: 102,
        }}
      >
        <div
          className={`flex ${isMobile ? "flex-row items-end" : isCentered ? "flex-col items-center" : "flex-row items-start"} gap-2 sm:gap-3 max-w-full`}
        >
          <div className="relative flex-shrink-0">
            <img
              src={mascoteEducy}
              alt="Educy - Assistente"
              className={`object-contain drop-shadow-2xl ${isMobile ? "w-16 h-16" : "w-24 h-24 sm:w-32 sm:h-32"}`}
            />
          </div>

          <div
            className={`relative bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-2xl ${isMobile ? "flex-1 min-w-0 max-w-[calc(100%-80px)]" : "max-w-[280px] sm:max-w-[320px]"}`}
          >
            {!isMobile &&
              (isCentered ? (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[12px] border-b-white" />
              ) : (
                <div className="absolute top-8 -left-3 w-0 h-0 border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent border-r-[12px] border-r-white" />
              ))}

            <button
              onClick={handleClose}
              className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 p-1 text-gray-400 hover:text-gray-600 transition-colors z-10"
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            <p
              className={`text-gray-800 leading-relaxed mb-2 sm:mb-3 pr-4 sm:pr-5 ${isMobile ? "text-xs" : "text-sm sm:text-base"}`}
            >
              {message}
            </p>

            <div className="flex items-center justify-between gap-2 sm:gap-3">
              <div className="flex gap-1">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-colors ${
                      index === currentStep ? "bg-primary" : index < currentStep ? "bg-primary/50" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>

              <Button
                onClick={handleNext}
                size="sm"
                className={`gap-1 shrink-0 ${isMobile ? "text-xs px-2.5 py-1 h-7" : ""}`}
              >
                {isLastStep ? t("tutorial.finish") : t("tutorial.next")}
                {!isLastStep && <ChevronRight className={`${isMobile ? "w-3 h-3" : "w-4 h-4"}`} />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
