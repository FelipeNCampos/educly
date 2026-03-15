import { useState, useMemo } from "react";
import { cn, shuffleArray } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Check, X, Bot } from "lucide-react";
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import { QuizAIHelper } from "./QuizAIHelper";
import { useQuizSounds } from "@/hooks/useQuizSounds";

interface QuizMultipleChoiceProps {
  question: string;
  instruction?: string;
  description?: string;
  options: { text: string; isCorrect: boolean }[];
  onComplete: (correct: boolean) => void;
}

export const QuizMultipleChoice = ({
  question,
  instruction,
  description,
  options,
  onComplete
}: QuizMultipleChoiceProps) => {
  const { t } = useTranslation();
  const { playCorrect, playIncorrect } = useQuizSounds();
  const [selected, setSelected] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [showAIHelper, setShowAIHelper] = useState(false);
  const [wrongAttempts, setWrongAttempts] = useState(0);

  // Shuffle options once on mount to randomize correct answer positions
  const shuffledOptions = useMemo(() => shuffleArray(options), [options]);
  
  const correctAnswers = shuffledOptions.filter(o => o.isCorrect).map(o => o.text).join(", ");

  const handleToggle = (index: number) => {
    if (showResult) return;
    setSelected(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const handleCheck = () => {
    if (selected.length === 0) return;
    
    const correctOptions = shuffledOptions.filter(o => o.isCorrect);
    const selectedCorrect = selected.filter(i => shuffledOptions[i].isCorrect);
    
    const isFullCorrect = selectedCorrect.length === correctOptions.length && selected.length === correctOptions.length;
    if (isFullCorrect) {
      playCorrect();
    } else {
      playIncorrect();
      setWrongAttempts(prev => prev + 1);
    }
    
    setTotalCorrect(correctOptions.length);
    setCorrectCount(selectedCorrect.length);
    setShowResult(true);
  };

  const handleContinue = () => {
    const isFullyCorrect = correctCount === totalCorrect && selected.length === totalCorrect;
    if (!isFullyCorrect) {
      // Reset para tentar novamente
      setSelected([]);
      setShowResult(false);
      setCorrectCount(0);
      setTotalCorrect(0);
      return;
    }
    onComplete(isFullyCorrect);
  };

  const isFullyCorrect = correctCount === totalCorrect && selected.length === totalCorrect;
  const isPartiallyCorrect = showResult && correctCount > 0 && correctCount < totalCorrect;

  return (
    <div className="bg-background">
      {/* Question title */}
      <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">{question}</h2>
      
      {/* Description/context with markdown */}
      {description && (
        <div className="prose prose-base max-w-none mb-4 text-foreground/80 leading-relaxed
          [&_p]:mb-3 [&_strong]:font-bold [&_strong]:text-primary
        ">
          <ReactMarkdown>
            {description.replace(/\\n/g, '\n').replace(/\\"/g, '"')}
          </ReactMarkdown>
        </div>
      )}

      {/* Quiz container */}
      <div className="bg-card border border-border rounded-xl p-4 sm:p-5 mb-6">
        <p className="text-sm text-muted-foreground mb-4">
          {instruction || t('quiz.selectAllAnswers')}
        </p>
        
        {/* Options - Checkbox style multi-selection */}
        <div className="space-y-3">
          {shuffledOptions.map((option, index) => {
            const isSelected = selected.includes(index);
            const isOptionCorrect = option.isCorrect;
            
            return (
              <button
                key={index}
                onClick={() => handleToggle(index)}
                disabled={showResult}
                className={cn(
                  "w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3",
                  isSelected
                    ? showResult
                      ? isOptionCorrect
                        ? "border-success bg-success/10"
                        : "border-destructive bg-destructive/10"
                      : "border-primary bg-primary/5"
                    : showResult && isOptionCorrect
                      ? "border-success bg-success/10"
                      : "border-border bg-background hover:border-muted-foreground/50"
                )}
              >
                {/* Checkbox indicator */}
                <div className={cn(
                  "w-6 h-6 rounded flex items-center justify-center shrink-0 transition-colors",
                  isSelected
                    ? showResult
                      ? isOptionCorrect
                        ? "bg-success"
                        : "bg-destructive"
                      : "bg-primary"
                    : showResult && isOptionCorrect
                      ? "bg-success"
                      : "border-2 border-muted-foreground/50"
                )}>
                  {(isSelected || (showResult && isOptionCorrect)) && (
                    showResult ? (
                      isOptionCorrect 
                        ? <Check className="w-4 h-4 text-white" />
                        : isSelected 
                          ? <X className="w-4 h-4 text-white" />
                          : null
                    ) : (
                      <Check className="w-4 h-4 text-white" />
                    )
                  )}
                </div>
                
                <span className="text-foreground flex-1 text-sm sm:text-base">{option.text}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Feedback */}
      {showResult && (
        <div className={cn(
          "p-4 rounded-xl mb-6 animate-fade-in flex items-start gap-3",
          isFullyCorrect
            ? "bg-success/10 border border-success/30"
            : isPartiallyCorrect
              ? "bg-warning/10 border border-warning/30"
              : "bg-destructive/10 border border-destructive/30"
        )}>
          <div className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5",
            isFullyCorrect ? "bg-success" : isPartiallyCorrect ? "bg-warning" : "bg-destructive"
          )}>
            {isFullyCorrect ? <Check className="w-4 h-4 text-white" /> : <X className="w-4 h-4 text-white" />}
          </div>
          <div className="flex-1">
            <p className={cn(
              "font-bold text-base",
              isFullyCorrect ? "text-success" : isPartiallyCorrect ? "text-warning" : "text-destructive"
            )}>
              {isFullyCorrect 
                ? t('quiz.correctAnswer')
                : isPartiallyCorrect
                  ? t('quiz.almostRight')
                  : t('quiz.incorrectAnswer')
              }
            </p>
            <p className={cn(
              "text-sm mt-1",
              isFullyCorrect ? "text-success/80" : isPartiallyCorrect ? "text-warning/80" : "text-destructive/80"
            )}>
              {isFullyCorrect 
                ? t('quiz.wellDone')
                : t('quiz.youGotXofY', { correct: correctCount, total: totalCorrect })
              }
            </p>
            {!isFullyCorrect && (
              <div className="mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <p className="text-amber-600 dark:text-amber-400 text-sm">
                  💡 {t('quiz.hint')}: {t('quiz.selectAllCorrect')}
                </p>
              </div>
            )}
            {!isFullyCorrect && wrongAttempts >= 1 && (
              <button
                onClick={() => setShowAIHelper(true)}
                className="mt-3 w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-colors"
              >
                <Bot size={18} />
                <span className="font-medium text-sm">{t('quiz.askAIHelp')}</span>
              </button>
            )}
            {!isFullyCorrect && (
              <p className="mt-2 text-sm font-medium text-destructive">
                ⚠️ {t('quiz.mustAnswerCorrectly')}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Action Button */}
      {!showResult ? (
        <Button 
          onClick={handleCheck}
          disabled={selected.length === 0}
          className="w-full h-14 text-base sm:text-lg font-semibold rounded-xl"
          size="lg"
        >
          {t('quiz.submit')}
        </Button>
      ) : (
        <Button 
          onClick={handleContinue}
          className={cn(
            "w-full h-14 text-base sm:text-lg font-semibold rounded-xl",
            isFullyCorrect ? "bg-success hover:bg-success/90" : "bg-orange-500 hover:bg-orange-600"
          )}
          size="lg"
        >
          {isFullyCorrect ? t('common.continue') : t('quiz.tryAgain')}
        </Button>
      )}

      {/* AI Helper Modal */}
      <QuizAIHelper
        question={question}
        correctAnswer={correctAnswers}
        topic="quiz_help"
        isOpen={showAIHelper}
        onClose={() => setShowAIHelper(false)}
      />
    </div>
  );
};
