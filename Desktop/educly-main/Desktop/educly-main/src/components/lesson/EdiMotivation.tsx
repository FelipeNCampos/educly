import { useState, useEffect, useMemo, useCallback } from "react";
import { X, Sparkles, Flame, Trophy, Target, Zap, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import mascoteEdi from "@/assets/mascote-educy.png";

interface EdiMotivationProps {
  /** Tipo de motivação */
  type: "almost_done" | "halfway" | "great_job" | "keep_going" | "final_stretch" | "encouragement";
  /** Mensagem personalizada (opcional, usa default baseado no type) */
  message?: string;
  /** Callback quando fechado */
  onClose?: () => void;
  /** Auto-fecha após X segundos (0 = não fecha auto) */
  autoCloseSeconds?: number;
  /** Mostra no canto ou centralizado */
  position?: "center" | "bottom-right" | "bottom-left";
}

const motivationConfig = {
  almost_done: {
    icon: Trophy,
    color: "from-yellow-400 to-orange-500",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-300",
  },
  halfway: {
    icon: Target,
    color: "from-blue-400 to-indigo-500",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-300",
  },
  great_job: {
    icon: Sparkles,
    color: "from-green-400 to-emerald-500",
    bgColor: "bg-green-50",
    borderColor: "border-green-300",
  },
  keep_going: {
    icon: Flame,
    color: "from-orange-400 to-red-500",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-300",
  },
  final_stretch: {
    icon: Zap,
    color: "from-purple-400 to-pink-500",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-300",
  },
  encouragement: {
    icon: Heart,
    color: "from-pink-400 to-rose-500",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-300",
  },
};

export const EdiMotivation = ({
  type,
  message,
  onClose,
  autoCloseSeconds = 5,
  position = "center",
}: EdiMotivationProps) => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  const config = motivationConfig[type];
  const Icon = config.icon;

  // Mensagens default por tipo (fallback when no custom message)
  const defaultMessages: Record<string, string> = {
    almost_done: t("lesson.ediMotivation.almostDone") || "Falta pouco! 🎯 Você está quase lá!",
    halfway: t("lesson.ediMotivation.halfway") || "Metade concluída! 💪 Continue assim!",
    great_job: t("lesson.ediMotivation.greatJob") || "Excelente trabalho! ✨ Você está arrasando!",
    keep_going: t("lesson.ediMotivation.keepGoing") || "Não desista agora! 🔥 Você consegue!",
    final_stretch: t("lesson.ediMotivation.finalStretch") || "Reta final! ⚡ Mais um pouquinho!",
    encouragement: t("lesson.ediMotivation.encouragement") || "Eu acredito em você! 💖 Vamos juntos!",
  };

  // Use custom message if provided, otherwise use default
  const displayMessage = message || defaultMessages[type];

  const handleClose = () => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  };

  // Auto-close
  useEffect(() => {
    if (autoCloseSeconds > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoCloseSeconds * 1000);
      return () => clearTimeout(timer);
    }
  }, [autoCloseSeconds]);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "fixed z-50 animate-in fade-in duration-300",
        isAnimatingOut && "animate-out fade-out duration-300",
        position === "center" && "inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm",
        position === "bottom-right" && "bottom-6 right-6",
        position === "bottom-left" && "bottom-6 left-6"
      )}
      onClick={position === "center" ? handleClose : undefined}
    >
      <div
        className={cn(
          "relative max-w-sm w-full mx-4 rounded-2xl border-2 shadow-xl overflow-hidden",
          config.bgColor,
          config.borderColor,
          "animate-in zoom-in-95 slide-in-from-bottom-4 duration-500",
          isAnimatingOut && "animate-out zoom-out-95 slide-out-to-bottom-4"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gradient header */}
        <div className={cn("h-2 bg-gradient-to-r", config.color)} />

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-black/10 transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        {/* Content */}
        <div className="p-5 flex items-start gap-4">
          {/* Edi mascot */}
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-lg bg-white">
              <img
                src={mascoteEdi}
                alt="EDI"
                className="w-full h-full object-contain"
              />
            </div>
            {/* Icon badge */}
            <div
              className={cn(
                "absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center bg-gradient-to-br shadow-md",
                config.color
              )}
            >
              <Icon className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* Message */}
          <div className="flex-1 pt-1">
            <p className="text-lg font-bold text-foreground leading-snug">
              {displayMessage}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              — EDI, {t("lesson.ediMotivation.yourAssistant") || "seu assistente"}
            </p>
          </div>
        </div>

        {/* Decorative sparkles */}
        <div className="absolute top-4 left-4 opacity-20">
          <Sparkles className="w-5 h-5 text-primary animate-pulse" />
        </div>
      </div>
    </div>
  );
};

/**
 * Hook para controlar quando mostrar o Edi motivacional durante a lição
 * @param currentStep - Current step index (1-based)
 * @param totalSteps - Total number of steps
 * @param dayNumber - Current day number for personalized messages
 */
export const useEdiMotivation = (
  currentStep: number, 
  totalSteps: number,
  dayNumber: number = 1
) => {
  const { t } = useTranslation();
  const [shownTypes, setShownTypes] = useState<Set<string>>(new Set());
  const [activeMotivation, setActiveMotivation] = useState<{
    type: EdiMotivationProps["type"];
    show: boolean;
    customMessage?: string;
  } | null>(null);

  const progress = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;

  // Get random phrase from translated array
  const getRandomPhrase = useCallback((type: "almostDone" | "halfway" | "finalStretch"): string => {
    const phrases = t(`lesson.ediMotivation.phrases.${type}`, { returnObjects: true });
    
    if (Array.isArray(phrases) && phrases.length > 0) {
      const randomIndex = Math.floor(Math.random() * phrases.length);
      return phrases[randomIndex];
    }
    
    // Fallback phrases if translation not available
    const fallbackPhrases: Record<string, string[]> = {
      almostDone: [
        "Não desista, continue!",
        "Você está indo muito bem!",
        "Falta pouquinho, você consegue!",
        "Você está arrasando!",
        "Continue firme!"
      ],
      halfway: [
        "Você está mandando bem!",
        "Excelente progresso!",
        "Você é demais!",
        "Continue assim!",
        "Ótimo trabalho até aqui!"
      ],
      finalStretch: [
        "O final está próximo!",
        "Você já chegou tão longe!",
        "Última etapa, vai com tudo!",
        "Finalize com chave de ouro!",
        "Quase na linha de chegada!"
      ]
    };
    
    const fallback = fallbackPhrases[type] || [];
    const randomIndex = Math.floor(Math.random() * fallback.length);
    return fallback[randomIndex] || "";
  }, [t]);

  // Generate personalized message with day number and random phrase
  const generateCustomMessage = useCallback((type: EdiMotivationProps["type"]): string => {
    const phraseType = type === "almost_done" ? "almostDone" 
      : type === "final_stretch" ? "finalStretch" 
      : "halfway";
    
    const phrase = getRandomPhrase(phraseType);
    
    const templateKey = type === "almost_done" ? "almostDoneDay"
      : type === "final_stretch" ? "finalStretchDay"
      : "halfwayDay";
    
    const template = t(`lesson.ediMotivation.${templateKey}`, { 
      day: dayNumber,
      phrase: phrase,
      defaultValue: `Dia ${dayNumber}! ${phrase}`
    });
    
    return template;
  }, [t, dayNumber, getRandomPhrase]);

  useEffect(() => {
    // Metade concluída (45-55%)
    if (progress >= 45 && progress < 55 && !shownTypes.has("halfway")) {
      setShownTypes(prev => new Set([...prev, "halfway"]));
      const customMessage = generateCustomMessage("halfway");
      setActiveMotivation({ type: "halfway", show: true, customMessage });
      return;
    }

    // Falta pouco (75-85%)
    if (progress >= 75 && progress < 85 && !shownTypes.has("almost_done")) {
      setShownTypes(prev => new Set([...prev, "almost_done"]));
      const customMessage = generateCustomMessage("almost_done");
      setActiveMotivation({ type: "almost_done", show: true, customMessage });
      return;
    }

    // Reta final (90%+)
    if (progress >= 90 && progress < 100 && !shownTypes.has("final_stretch")) {
      setShownTypes(prev => new Set([...prev, "final_stretch"]));
      const customMessage = generateCustomMessage("final_stretch");
      setActiveMotivation({ type: "final_stretch", show: true, customMessage });
      return;
    }
  }, [progress, shownTypes, generateCustomMessage]);

  const closeMotivation = () => {
    setActiveMotivation(null);
  };

  const triggerMotivation = (type: EdiMotivationProps["type"]) => {
    const customMessage = generateCustomMessage(type);
    setActiveMotivation({ type, show: true, customMessage });
  };

  return {
    activeMotivation,
    closeMotivation,
    triggerMotivation,
    progress,
  };
};
