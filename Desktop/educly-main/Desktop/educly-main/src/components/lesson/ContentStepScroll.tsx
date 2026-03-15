import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import { useState, useEffect, useRef } from "react";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContentStepScrollProps {
  title: string;
  content: string;
  imageUrl?: string | null;
  aiToolSlug?: string;
  onContinue: () => void;
  isActive: boolean;
}

export const ContentStepScroll = ({ title, content, imageUrl, onContinue, isActive }: ContentStepScrollProps) => {
  const { t } = useTranslation();
  const [currentPart, setCurrentPart] = useState(0);
  const [isRevealing, setIsRevealing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const partsContainerRef = useRef<HTMLDivElement>(null);

  // Dividir o conteúdo em partes (máximo 500 caracteres por parte)
  const splitContentIntoParts = (text: string, maxChars = 500) => {
    const parts: string[] = [];
    let currentPart = "";
    const paragraphs = text.split("\n");

    for (const paragraph of paragraphs) {
      if ((currentPart + paragraph).length <= maxChars) {
        currentPart += (currentPart ? "\n" : "") + paragraph;
      } else {
        if (currentPart) parts.push(currentPart);
        currentPart = paragraph;
      }
    }

    if (currentPart) parts.push(currentPart);
    return parts;
  };

  const parts = splitContentIntoParts(content);
  const isLastPart = currentPart >= parts.length - 1;
  const isFirstPart = currentPart === 0;

  // Reset quando o conteúdo muda
  useEffect(() => {
    setCurrentPart(0);
  }, [content]);

  const revealNextPart = () => {
    if (currentPart < parts.length - 1) {
      setIsRevealing(true);

      // Anima a transição
      setTimeout(() => {
        setCurrentPart((prev) => prev + 1);

        // Scroll suave para o novo conteúdo
        setTimeout(() => {
          if (contentRef.current) {
            contentRef.current.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
          setIsRevealing(false);
        }, 300);
      }, 300);
    } else {
      // Última parte - vai para próximo step
      onContinue();
    }
  };

  const revealPreviousPart = () => {
    if (currentPart > 0) {
      setIsRevealing(true);
      setCurrentPart((prev) => prev - 1);

      setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
        setIsRevealing(false);
      }, 300);
    }
  };

  return (
    <div className="bg-background space-y-6" ref={partsContainerRef}>
      {/* Title - mantém fixo durante as partes */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm pb-4 pt-2 border-b border-border/50">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-tight">{title}</h1>

        {/* Progress indicator - Parts */}
        {parts.length > 1 && (
          <div className="flex items-center gap-3 mt-2">
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500 ease-out"
                style={{ width: `${((currentPart + 1) / parts.length) * 100}%` }}
              />
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              Parte {currentPart + 1} de {parts.length}
            </span>
          </div>
        )}
      </div>

      {/* Text content container with staggered reveal */}
      <div
        ref={contentRef}
        className={cn(
          "space-y-6 transition-all duration-500 ease-out",
          isRevealing ? "opacity-40 scale-[0.98]" : "opacity-100 scale-100",
        )}
      >
        {/* Renderiza todas as partes até a atual */}
        {parts.slice(0, currentPart + 1).map((part, index) => {
          const isCurrent = index === currentPart;
          const isPrevious = index < currentPart;

          return (
            <div
              key={index}
              className={cn(
                "transition-all duration-500",
                isCurrent ? "animate-in slide-in-from-bottom-4 fade-in" : isPrevious ? "opacity-70" : "opacity-0",
              )}
              style={{
                animationDelay: isCurrent ? `${index * 100}ms` : "0ms",
              }}
            >
              {/* Indicador visual da parte (exceto primeira) */}
              {index > 0 && (
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-xs font-semibold text-primary uppercase tracking-wide">Continuação...</span>
                </div>
              )}

              {/* Conteúdo da parte */}
              <div
                className={cn(
                  "prose prose-lg max-w-none text-foreground/85 leading-relaxed rounded-xl p-4",
                  isCurrent ? "bg-card/50 border border-primary/20 shadow-sm" : "bg-transparent",
                )}
              >
                <ReactMarkdown>{part.replace(/\\n/g, "\n").replace(/\\"/g, '"')}</ReactMarkdown>
              </div>
            </div>
          );
        })}

        {/* Image aparece apenas na última parte */}
        {imageUrl && isLastPart && (
          <div className="rounded-xl overflow-hidden shadow-sm border border-border animate-in fade-in slide-in-from-bottom-4 duration-500">
            <img src={imageUrl} alt={title} className="w-full h-auto object-cover" />
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      {isActive && (
        <div className="sticky bottom-0 bg-background/80 backdrop-blur-sm pt-4 border-t border-border/50 space-y-3">
          {/* Previous part button (só aparece se não for primeira parte) */}
          {!isFirstPart && (
            <Button
              onClick={revealPreviousPart}
              variant="outline"
              className="w-full h-11 text-sm font-medium rounded-xl"
              disabled={isRevealing}
            >
              <ChevronUp className="w-4 h-4 mr-2" />
              {t("lesson.previousPart") || "Ver parte anterior"}
            </Button>
          )}

          {/* Next/Continue button */}
          <Button
            onClick={revealNextPart}
            className={cn(
              "w-full h-14 text-base sm:text-lg font-semibold rounded-xl relative overflow-hidden group transition-all duration-300",
              isLastPart
                ? "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30"
                : "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70",
            )}
            size="lg"
            disabled={isRevealing}
          >
            {/* Animated background effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />

            {/* Button content */}
            <div className="relative flex items-center justify-center gap-2">
              {isLastPart ? (
                <>
                  <span>{t("common.continue")}</span>
                  <ChevronDown className="w-5 h-5 animate-bounce" />
                </>
              ) : (
                <>
                  <span>{t("lesson.nextPart") || "Próxima parte"}</span>
                  <ChevronDown className={cn("w-5 h-5", isRevealing ? "animate-pulse" : "animate-bounce")} />
                </>
              )}
            </div>
          </Button>

          {/* Instructions */}
          {!isLastPart && (
            <p className="text-center text-xs text-muted-foreground">
              {t("lesson.partsHint") || `Clique para continuar lendo (${currentPart + 1}/${parts.length})`}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
