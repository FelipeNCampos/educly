import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export interface GradualTextDisplayRef {
  /** Returns true if there's a next part, false if already at last part */
  goToNextPart: () => boolean;
  /** Check if currently showing the last part */
  isLastPart: () => boolean;
  /** Get current part index */
  getCurrentPartIndex: () => number;
  /** Get total parts count */
  getTotalParts: () => number;
}

interface GradualTextDisplayProps {
  content: string;
  isActive?: boolean;
}

/**
 * Splits text content into smaller, digestible parts and reveals them gradually.
 * This prevents overwhelming users with walls of text.
 * 
 * Use the ref to control navigation from parent component.
 */
export const GradualTextDisplay = forwardRef<GradualTextDisplayRef, GradualTextDisplayProps>(
  ({ content, isActive = true }, ref) => {
    const { t } = useTranslation();
    const [currentPartIndex, setCurrentPartIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [displayedPart, setDisplayedPart] = useState(0);
    
    // Ref for the container
    const containerRef = useRef<HTMLDivElement>(null);

    // Split content into parts by paragraphs, targeting ~400 chars per part
    const parts = splitIntoParts(content, 400);
    const totalParts = parts.length;
    const hasMultipleParts = totalParts > 1;

    // Reset when content changes
    useEffect(() => {
      setCurrentPartIndex(0);
      setDisplayedPart(0);
      setIsTransitioning(false);
    }, [content]);

    // Handle transition animation
    useEffect(() => {
      if (currentPartIndex !== displayedPart && !isTransitioning) {
        setIsTransitioning(true);
        // Wait for exit animation, then show new part
        setTimeout(() => {
          setDisplayedPart(currentPartIndex);
          setIsTransitioning(false);
        }, 250);
      }
    }, [currentPartIndex, displayedPart, isTransitioning]);

    // Scroll container into view when part changes - position at very top
    useEffect(() => {
      if (containerRef.current && currentPartIndex > 0) {
        setTimeout(() => {
          const element = containerRef.current;
          if (element) {
            const rect = element.getBoundingClientRect();
            const absoluteTop = window.scrollY + rect.top;
            // Position near very top of viewport (80px from top)
            window.scrollTo({
              top: absoluteTop - 80,
              behavior: "smooth"
            });
          }
        }, 100);
      }
    }, [displayedPart]);

    // Expose navigation methods to parent
    useImperativeHandle(ref, () => ({
      goToNextPart: () => {
        if (currentPartIndex < totalParts - 1) {
          setCurrentPartIndex(prev => prev + 1);
          return true; // Had more parts
        }
        return false; // Was already at last part
      },
      isLastPart: () => currentPartIndex >= totalParts - 1,
      getCurrentPartIndex: () => currentPartIndex,
      getTotalParts: () => totalParts,
    }), [currentPartIndex, totalParts]);

    // Render text with markdown-like formatting (**bold**)
    const renderFormattedText = (text: string) => {
      return text.split("\n").map((line, i) => (
        <p 
          key={i} 
          className="text-foreground/80 text-base md:text-lg leading-relaxed mb-4 last:mb-0"
        >
          {line.split(/(\*\*.*?\*\*)/g).map((part, j) =>
            part.startsWith("**") ? (
              <strong key={j} className="font-semibold text-primary">
                {part.slice(2, -2)}
              </strong>
            ) : (
              part
            )
          )}
        </p>
      ));
    };

    // If single part, render directly without gradual reveal
    if (!hasMultipleParts) {
      return (
        <div className="prose prose-lg max-w-none animate-fade-in">
          {renderFormattedText(content)}
        </div>
      );
    }

    return (
      <div ref={containerRef} className="space-y-4">
        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">
            {t("lesson.textParts.part", "Parte")} {currentPartIndex + 1} {t("lesson.textParts.of", "de")} {totalParts}
          </span>
          {/* Progress dots */}
          <div className="flex items-center gap-1.5">
            {parts.map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  idx === currentPartIndex
                    ? "bg-primary scale-125" 
                    : idx < currentPartIndex
                    ? "bg-primary/50"
                    : "bg-muted-foreground/30"
                )}
              />
            ))}
          </div>
        </div>

        {/* Current part with exit/enter animation */}
        <div className="relative overflow-hidden min-h-[120px]">
          <div 
            key={displayedPart}
            className={cn(
              "prose prose-lg max-w-none transition-all duration-300 ease-out",
              isTransitioning
                ? "opacity-0 -translate-x-8 scale-[0.98]" 
                : "opacity-100 translate-x-0 scale-100 animate-in fade-in slide-in-from-right-6 duration-300"
            )}
          >
            {renderFormattedText(parts[displayedPart])}
          </div>
        </div>
      </div>
    );
  }
);

GradualTextDisplay.displayName = "GradualTextDisplay";

/**
 * Splits content into parts by paragraphs, respecting a target character limit.
 * Tries to keep paragraphs together when possible.
 */
function splitIntoParts(content: string, targetChars: number): string[] {
  const paragraphs = content.split("\n\n").filter(p => p.trim());
  
  // If content is short enough, return as single part
  if (content.length <= targetChars * 1.3) {
    return [content];
  }

  const parts: string[] = [];
  let currentPart = "";

  for (const paragraph of paragraphs) {
    // If adding this paragraph would exceed target significantly, start new part
    if (currentPart.length > 0 && currentPart.length + paragraph.length > targetChars * 1.5) {
      parts.push(currentPart.trim());
      currentPart = paragraph;
    } else {
      currentPart += (currentPart ? "\n\n" : "") + paragraph;
    }
  }

  // Don't forget the last part
  if (currentPart.trim()) {
    parts.push(currentPart.trim());
  }

  // If we only got one part, try splitting by single newlines
  if (parts.length === 1 && content.length > targetChars * 1.5) {
    const lines = content.split("\n").filter(l => l.trim());
    const newParts: string[] = [];
    let newCurrentPart = "";

    for (const line of lines) {
      if (newCurrentPart.length > 0 && newCurrentPart.length + line.length > targetChars) {
        newParts.push(newCurrentPart.trim());
        newCurrentPart = line;
      } else {
        newCurrentPart += (newCurrentPart ? "\n" : "") + line;
      }
    }

    if (newCurrentPart.trim()) {
      newParts.push(newCurrentPart.trim());
    }

    return newParts.length > 1 ? newParts : parts;
  }

  return parts;
}

export default GradualTextDisplay;
