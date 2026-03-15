import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, ChevronRight } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { cn, shuffleArray } from "@/lib/utils";
import { useQuizSounds } from "@/hooks/useQuizSounds";

interface QuizOption {
  text: string;
  isCorrect: boolean;
}

interface QuizStepProps {
  question: string;
  options: QuizOption[];
  feedback: string;
  onComplete: () => void;
  currentStep: number;
  totalSteps: number;
}

export const QuizStep = ({
  question,
  options,
  feedback,
  onComplete,
  currentStep,
  totalSteps
}: QuizStepProps) => {
  const { t } = useTranslation();
  const { playCorrect, playIncorrect, playContinue } = useQuizSounds();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Shuffle options once on mount to randomize correct answer position
  const shuffledOptions = useMemo(() => shuffleArray(options), [options]);

  const handleOptionClick = (index: number) => {
    if (showResult) return;
    setSelectedIndex(index);
  };

  const handleCheck = () => {
    if (selectedIndex === null) return;
    
    const correct = shuffledOptions[selectedIndex].isCorrect;
    setIsCorrect(correct);
    setShowResult(true);
    
    if (correct) {
      playCorrect();
    } else {
      playIncorrect();
    }
  };

  const handleContinue = () => {
    if (isCorrect) {
      playContinue();
      onComplete();
    } else {
      // Reset for retry
      setSelectedIndex(null);
      setShowResult(false);
      setIsCorrect(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress bar */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm text-muted-foreground">
            {currentStep} / {totalSteps}
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 px-6 py-8 overflow-y-auto">
        <h1 className="text-2xl font-bold text-foreground mb-8">{question}</h1>

        <div className="space-y-3">
          {shuffledOptions.map((option, index) => (
            <button
              key={index}
              onClick={() => handleOptionClick(index)}
              disabled={showResult}
              className={cn(
                "w-full p-4 text-left rounded-xl border-2 transition-all duration-200",
                 selectedIndex === index
                   ? showResult
                     ? option.isCorrect
                       ? "border-green-500 bg-green-500/15 shadow-sm shadow-green-500/20"
                       : "border-red-500 bg-red-500/15 shadow-sm shadow-red-500/20"
                     : "border-primary bg-primary/10"
                   : "border-border bg-card hover:border-primary/50",
                 showResult && option.isCorrect && "border-green-500 bg-green-500/15"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-foreground font-medium">{option.text}</span>
                {showResult && selectedIndex === index && (
                  option.isCorrect 
                    ? <CheckCircle className="h-5 w-5 text-green-500" />
                    : <XCircle className="h-5 w-5 text-red-500" />
                )}
                {showResult && option.isCorrect && selectedIndex !== index && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Feedback */}
        {showResult && !isCorrect && (
          <div className="mt-6 p-4 rounded-xl bg-red-500/15 border border-red-500/40">
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-red-600 dark:text-red-300 font-medium">{feedback}</p>
            </div>
          </div>
        )}

        {showResult && isCorrect && (
          <div className="mt-6 p-4 rounded-xl bg-green-500/15 border border-green-500/40">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <p className="text-green-700 dark:text-green-300 font-medium">{t('lesson.correctAnswer')}</p>
            </div>
          </div>
        )}
      </div>

      {/* Action button */}
      <div className="p-4 border-t border-border bg-background">
        {!showResult ? (
          <Button 
            onClick={handleCheck}
            disabled={selectedIndex === null}
            className="w-full h-14 text-lg font-semibold rounded-xl"
            size="lg"
          >
            {t('lesson.checkAnswer')}
          </Button>
        ) : (
          <Button 
            onClick={handleContinue}
            className={cn(
              "w-full h-14 text-lg font-semibold rounded-xl",
              isCorrect ? "bg-green-600 hover:bg-green-700" : "bg-orange-600 hover:bg-orange-700"
            )}
            size="lg"
          >
            {isCorrect ? t('common.continue') : t('lesson.tryAgain')}
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
};
