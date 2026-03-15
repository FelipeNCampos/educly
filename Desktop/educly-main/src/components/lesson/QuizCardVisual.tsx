import { useState, useMemo } from "react";
import { cn, shuffleArray } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Check, X, MessageCircle, Bot } from "lucide-react";
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import { QuizAIHelper } from "./QuizAIHelper";
import { useQuizSounds } from "@/hooks/useQuizSounds";

interface QuizCardVisualProps {
  question: string;
  description?: string;
  cardContent?: string;
  cardSubtext?: string;
  aiToolSlug?: string;
  options: { text: string; isCorrect: boolean }[];
  onComplete: (correct: boolean) => void;
  themeColor?: string;
}

export const QuizCardVisual = ({
  question,
  description,
  options,
  onComplete,
}: QuizCardVisualProps) => {
  const { t } = useTranslation();
  const { playCorrect, playIncorrect } = useQuizSounds();
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showAIHelper, setShowAIHelper] = useState(false);
  const [wrongAttempts, setWrongAttempts] = useState(0);

  // Shuffle options once on mount to randomize correct answer position
  const shuffledOptions = useMemo(() => shuffleArray(options), [options]);
  
  const correctAnswer = shuffledOptions.find(o => o.isCorrect)?.text || "";

  const handleSelect = (index: number) => {
    if (showResult) return;
    setSelected(index);
  };

  const handleCheck = () => {
    if (selected === null) return;
    const correct = shuffledOptions[selected].isCorrect;
    setIsCorrect(correct);
    setShowResult(true);
    if (correct) {
      playCorrect();
    } else {
      playIncorrect();
      setWrongAttempts(prev => prev + 1);
    }
  };

  const handleContinue = () => {
    if (!isCorrect) {
      // Reset para tentar novamente
      setSelected(null);
      setShowResult(false);
      setIsCorrect(false);
      return;
    }
    onComplete(isCorrect);
  };

  return (
    <div className="bg-background">
      {/* Question title - Large and bold */}
      <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">{question}</h2>
      
      {/* Description/context with markdown */}
      {description && (
        <div className="prose prose-base max-w-none mb-6 text-foreground/80 leading-relaxed
          [&_p]:mb-3 [&_strong]:font-bold [&_strong]:text-primary
        ">
          <ReactMarkdown>
            {description.replace(/\\n/g, '\n').replace(/\\"/g, '"')}
          </ReactMarkdown>
        </div>
      )}

      {/* Quiz card container - Clean white card with border */}
      <div className="bg-card border border-border rounded-xl p-4 sm:p-5 mb-6">
        <p className="text-sm text-muted-foreground mb-4">{t('quiz.selectOneOption')}</p>
        
        {/* Options - Radio style single selection */}
        <div className="space-y-3">
          {shuffledOptions.map((option, index) => (
            <button
              key={index}
              onClick={() => handleSelect(index)}
              disabled={showResult}
              className={cn(
                "w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3",
                selected === index
                  ? showResult
                    ? option.isCorrect
                      ? "border-success bg-success/10"
                      : "border-destructive bg-destructive/10"
                    : "border-primary bg-primary/5"
                  : showResult && option.isCorrect
                    ? "border-success bg-success/10"
                    : "border-border bg-background hover:border-muted-foreground/50"
              )}
            >
              {/* Radio circle indicator */}
              <div className={cn(
                "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                selected === index
                  ? showResult
                    ? option.isCorrect
                      ? "border-success bg-success"
                      : "border-destructive bg-destructive"
                    : "border-primary bg-primary"
                  : showResult && option.isCorrect
                    ? "border-success bg-success"
                    : "border-muted-foreground/50"
              )}>
                {showResult && (
                  option.isCorrect 
                    ? <Check className="w-3.5 h-3.5 text-white" />
                    : selected === index 
                      ? <X className="w-3.5 h-3.5 text-white" />
                      : null
                )}
                {!showResult && selected === index && (
                  <div className="w-2.5 h-2.5 rounded-full bg-white" />
                )}
              </div>
              
              <span className="text-foreground flex-1 text-sm sm:text-base">{option.text}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Feedback message - Clean card style */}
      {showResult && (
        <div className={cn(
          "p-4 rounded-xl mb-6 animate-fade-in flex items-start gap-3",
          isCorrect 
            ? "bg-success/10 border border-success/30" 
            : "bg-destructive/10 border border-destructive/30"
        )}>
          <div className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5",
            isCorrect ? "bg-success" : "bg-destructive"
          )}>
            {isCorrect ? <Check className="w-4 h-4 text-white" /> : <X className="w-4 h-4 text-white" />}
          </div>
          <div className="flex-1">
            <p className={cn(
              "font-bold text-base",
              isCorrect ? "text-success" : "text-destructive"
            )}>
              {isCorrect ? t('quiz.correctAnswer') : t('quiz.incorrectAnswer')}
            </p>
            <p className={cn(
              "text-sm mt-1",
              isCorrect ? "text-success/80" : "text-destructive/80"
            )}>
              {isCorrect 
                ? t('quiz.wellDone')
                : `${t('quiz.correctWas')}: ${shuffledOptions.find(o => o.isCorrect)?.text}`
              }
            </p>
            {!isCorrect && (
              <div className="mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <p className="text-amber-600 dark:text-amber-400 text-sm">
                  💡 {t('quiz.hint')}: {t('quiz.readCarefully')}
                </p>
              </div>
            )}
            {!isCorrect && wrongAttempts >= 1 && (
              <button
                onClick={() => setShowAIHelper(true)}
                className="mt-3 w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-colors"
              >
                <Bot size={18} />
                <span className="font-medium text-sm">{t('quiz.askAIHelp')}</span>
              </button>
            )}
            {!isCorrect && (
              <p className="mt-2 text-sm font-medium text-destructive">
                ⚠️ {t('quiz.mustAnswerCorrectly')}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Action Button - Full width */}
      {!showResult ? (
        <Button 
          onClick={handleCheck}
          disabled={selected === null}
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
            isCorrect ? "bg-success hover:bg-success/90" : "bg-orange-500 hover:bg-orange-600"
          )}
          size="lg"
        >
          {isCorrect ? t('common.continue') : t('quiz.tryAgain')}
        </Button>
      )}

      {/* AI Helper Modal */}
      <QuizAIHelper
        question={question}
        correctAnswer={correctAnswer}
        topic="quiz_help"
        isOpen={showAIHelper}
        onClose={() => setShowAIHelper(false)}
      />
    </div>
  );
};
