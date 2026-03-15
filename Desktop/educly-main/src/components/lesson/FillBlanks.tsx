import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useQuizSounds } from "@/hooks/useQuizSounds";
import { useTranslation } from "react-i18next";
import { Check, PenLine, RotateCcw, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { shuffleArray } from "@/lib/utils";

interface FillBlanksProps {
  title: string;
  sentence: string; // Use ___ or [BLANK] for blanks
  answers?: string[]; // Correct answers in order
  correctAnswers?: string[]; // Alias for answers (compatibility)
  options: string[]; // All available options (including wrong ones)
  explanation?: string;
  onComplete: () => void;
}

export const FillBlanks = ({ 
  title, 
  sentence, 
  answers, 
  correctAnswers,
  options, 
  explanation,
  onComplete 
}: FillBlanksProps) => {
  const { t } = useTranslation();
  const { playCorrect, playIncorrect } = useQuizSounds();
  
  // Support both [BLANK] and ___ markers
  const normalizedSentence = sentence.replace(/\[BLANK\]/g, '___');
  const blanks = normalizedSentence.split('___');
  
  // Support both answers and correctAnswers props
  const actualAnswers = answers || correctAnswers || [];
  const numBlanks = blanks.length - 1;
  
  const [filledAnswers, setFilledAnswers] = useState<(string | null)[]>(
    Array(numBlanks).fill(null)
  );
  const [usedOptions, setUsedOptions] = useState<Set<string>>(new Set());
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [activeBlank, setActiveBlank] = useState<number | null>(0);
  
  const shuffledOptions = useMemo(() => shuffleArray([...options]), [options]);
  
  const handleOptionClick = (option: string) => {
    if (showResult || activeBlank === null || usedOptions.has(option)) return;
    
    const newFilledAnswers = [...filledAnswers];
    
    // If the blank already has an answer, remove it from used
    if (newFilledAnswers[activeBlank]) {
      const newUsed = new Set(usedOptions);
      newUsed.delete(newFilledAnswers[activeBlank]!);
      setUsedOptions(newUsed);
    }
    
    newFilledAnswers[activeBlank] = option;
    setFilledAnswers(newFilledAnswers);
    
    const newUsed = new Set(usedOptions);
    newUsed.add(option);
    setUsedOptions(newUsed);
    
    // Move to next empty blank
    const nextEmpty = newFilledAnswers.findIndex((a, i) => i > activeBlank && a === null);
    if (nextEmpty !== -1) {
      setActiveBlank(nextEmpty);
    } else {
      const firstEmpty = newFilledAnswers.findIndex(a => a === null);
      setActiveBlank(firstEmpty !== -1 ? firstEmpty : null);
    }
  };
  
  const handleBlankClick = (index: number) => {
    if (showResult) return;
    
    const currentAnswer = filledAnswers[index];
    if (currentAnswer) {
      // Remove the answer
      const newFilledAnswers = [...filledAnswers];
      newFilledAnswers[index] = null;
      setFilledAnswers(newFilledAnswers);
      
      const newUsed = new Set(usedOptions);
      newUsed.delete(currentAnswer);
      setUsedOptions(newUsed);
    }
    
    setActiveBlank(index);
  };
  
  const handleCheck = () => {
    const allCorrect = filledAnswers.every((answer, index) => 
      answer === actualAnswers[index]
    );
    
    setIsCorrect(allCorrect);
    setShowResult(true);
    
    if (allCorrect) {
      playCorrect();
    } else {
      playIncorrect();
    }
  };
  
  const handleReset = () => {
    setFilledAnswers(Array(numBlanks).fill(null));
    setUsedOptions(new Set());
    setShowResult(false);
    setIsCorrect(false);
    setActiveBlank(0);
  };
  
  const allFilled = filledAnswers.every(a => a !== null);
  
  return (
    <div className="bg-card rounded-xl p-4 sm:p-6 border border-border">
      <div className="flex items-center gap-2 mb-2">
        <PenLine className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-bold text-foreground">{title}</h3>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">
        {t('lesson.fillBlanks.instructions', 'Complete a frase clicando nas palavras corretas!')}
      </p>
      
      {/* Sentence with blanks */}
      <div className="p-4 bg-muted/30 rounded-lg mb-4">
        <p className="text-base sm:text-lg leading-relaxed">
          {blanks.map((part, index) => (
            <span key={index}>
              {part}
              {index < blanks.length - 1 && (
                <button
                  onClick={() => handleBlankClick(index)}
                  disabled={showResult}
                  className={cn(
                    "inline-flex items-center justify-center min-w-[80px] mx-1 px-3 py-1",
                    "rounded-lg border-2 border-dashed transition-all",
                    "text-sm font-medium",
                    showResult
                      ? filledAnswers[index] === actualAnswers[index]
                        ? "bg-success/20 border-success text-success"
                        : "bg-destructive/20 border-destructive text-destructive"
                      : activeBlank === index
                      ? "bg-primary/20 border-primary text-primary"
                      : filledAnswers[index]
                      ? "bg-muted border-border text-foreground hover:border-primary/50"
                      : "bg-muted/50 border-muted-foreground/30 text-muted-foreground"
                  )}
                >
                  {filledAnswers[index] || '___'}
                </button>
              )}
            </span>
          ))}
        </p>
      </div>
      
      {/* Options */}
      {!showResult && (
        <div className="flex flex-wrap gap-2 mb-4">
          {shuffledOptions.map((option) => (
            <button
              key={option}
              onClick={() => handleOptionClick(option)}
              disabled={usedOptions.has(option)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                "border border-border",
                usedOptions.has(option)
                  ? "bg-muted/30 text-muted-foreground/50 cursor-not-allowed"
                  : "bg-card hover:bg-primary/10 hover:border-primary text-foreground"
              )}
            >
              {option}
            </button>
          ))}
        </div>
      )}
      
      {/* Result */}
      {showResult && (
        <div className={cn(
          "p-4 rounded-lg mb-4",
          isCorrect ? "bg-success/10" : "bg-destructive/10"
        )}>
          <div className="flex items-start gap-2">
            {isCorrect ? (
              <Check className="w-5 h-5 text-success mt-0.5" />
            ) : (
              <HelpCircle className="w-5 h-5 text-destructive mt-0.5" />
            )}
            <div>
              <p className={cn(
                "font-medium",
                isCorrect ? "text-success" : "text-destructive"
              )}>
                {isCorrect 
                  ? t('lesson.quiz.excellent', 'Excelente! 🎉')
                  : t('lesson.quiz.tryAgain', 'Quase lá!')
                }
              </p>
              {!isCorrect && (
                <p className="text-sm text-muted-foreground mt-1">
                  {t('lesson.fillBlanks.correctAnswer', 'Resposta correta')}: {actualAnswers.join(', ')}
                </p>
              )}
              {explanation && isCorrect && (
                <p className="text-sm text-muted-foreground mt-1">{explanation}</p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Actions */}
      <div className="flex gap-2">
        {!showResult ? (
          <Button 
            onClick={handleCheck}
            disabled={!allFilled}
            className="w-full h-12"
          >
            <Check className="w-4 h-4 mr-2" />
            {t('lesson.quiz.checkAnswer', 'Verificar Resposta')}
          </Button>
        ) : isCorrect ? (
          <Button onClick={onComplete} className="w-full h-12">
            <Check className="w-4 h-4 mr-2" />
            {t('common.continue')}
          </Button>
        ) : (
          <Button onClick={handleReset} className="w-full h-12">
            <RotateCcw className="w-4 h-4 mr-2" />
            {t('lesson.quiz.tryAgainButton', 'Tentar Novamente')}
          </Button>
        )}
      </div>
    </div>
  );
};
