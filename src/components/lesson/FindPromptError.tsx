import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, AlertTriangle, Lightbulb } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn, shuffleArray } from "@/lib/utils";
import { useQuizSounds } from "@/hooks/useQuizSounds";

interface PromptPart {
  text: string;
  hasError: boolean;
  errorExplanation?: string;
}

interface FindPromptErrorProps {
  /** Título do exercício */
  title?: string;
  /** Descrição do que o aluno deve fazer */
  instruction: string;
  /** Partes do prompt - cada parte pode ter ou não um erro */
  promptParts: PromptPart[];
  /** Explicação geral após acertar */
  successExplanation?: string;
  /** Callback quando o exercício é concluído */
  onComplete: () => void;
}

export const FindPromptError = ({
  title,
  instruction,
  promptParts,
  successExplanation,
  onComplete,
}: FindPromptErrorProps) => {
  const { t } = useTranslation();
  const { playCorrect, playIncorrect } = useQuizSounds();
  
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [attempts, setAttempts] = useState(0);

  // Encontra o índice do erro correto
  const correctErrorIndex = useMemo(() => {
    return promptParts.findIndex(part => part.hasError);
  }, [promptParts]);

  const handlePartClick = (index: number) => {
    if (isChecked && isCorrect) return;
    setSelectedIndex(index);
    setIsChecked(false);
  };

  const handleCheck = () => {
    if (selectedIndex === null) return;
    
    const correct = promptParts[selectedIndex].hasError;
    setIsCorrect(correct);
    setIsChecked(true);
    setAttempts(prev => prev + 1);
    
    if (correct) {
      playCorrect();
    } else {
      playIncorrect();
    }
  };

  const handleContinue = () => {
    if (isCorrect) {
      onComplete();
    } else {
      // Reset para tentar novamente
      setSelectedIndex(null);
      setIsChecked(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header com ícone */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-6 h-6 text-orange-600" />
        </div>
        <div>
          {title && (
            <h3 className="text-lg font-bold text-foreground mb-1">{title}</h3>
          )}
          <p className="text-muted-foreground">{instruction}</p>
        </div>
      </div>

      {/* Prompt com partes clicáveis */}
      <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {promptParts.map((part, index) => (
            <button
              key={index}
              onClick={() => handlePartClick(index)}
              disabled={isChecked && isCorrect}
              className={cn(
                "px-4 py-2.5 rounded-xl border-2 transition-all duration-200 text-left font-medium",
                selectedIndex === index
                  ? isChecked
                    ? part.hasError
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-red-500 bg-red-50 text-red-700"
                    : "border-primary bg-primary/10 text-primary"
                  : isChecked && part.hasError && !isCorrect
                    ? "border-orange-400 bg-orange-50 text-orange-700"
                    : "border-border bg-muted/50 text-foreground hover:border-primary/50 hover:bg-primary/5"
              )}
            >
              {part.text}
              {isChecked && selectedIndex === index && (
                <span className="ml-2">
                  {part.hasError ? (
                    <CheckCircle2 className="w-4 h-4 inline text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 inline text-red-500" />
                  )}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Feedback */}
      {isChecked && (
        <div
          className={cn(
            "rounded-2xl p-5 border animate-in fade-in slide-in-from-bottom-2 duration-300",
            isCorrect
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          )}
        >
          <div className="flex items-start gap-3">
            {isCorrect ? (
              <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className={cn("font-semibold", isCorrect ? "text-green-800" : "text-red-800")}>
                {isCorrect
                  ? t("lesson.findError.correct") || "Excelente! Você encontrou o erro!"
                  : t("lesson.findError.incorrect") || "Não é esse o erro. Tente novamente!"}
              </p>
              {isCorrect && promptParts[correctErrorIndex]?.errorExplanation && (
                <p className="text-green-700 mt-2 text-sm">
                  {promptParts[correctErrorIndex].errorExplanation}
                </p>
              )}
              {isCorrect && successExplanation && (
                <p className="text-green-700 mt-2 text-sm">{successExplanation}</p>
              )}
              {!isCorrect && attempts >= 2 && (
                <div className="mt-3 flex items-start gap-2 text-orange-700 bg-orange-50 rounded-xl p-3 border border-orange-200">
                  <Lightbulb className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">
                    {t("lesson.findError.hint") || "Dica: Procure por algo que está vago, ambíguo ou que poderia ser mais específico no prompt."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Botão de ação */}
      {!isChecked ? (
        <Button
          onClick={handleCheck}
          disabled={selectedIndex === null}
          className="w-full h-14 text-lg font-semibold rounded-xl"
          size="lg"
        >
          {t("lesson.checkAnswer") || "Verificar"}
        </Button>
      ) : (
        <Button
          onClick={handleContinue}
          className={cn(
            "w-full h-14 text-lg font-semibold rounded-xl",
            isCorrect
              ? "bg-green-600 hover:bg-green-700"
              : "bg-orange-600 hover:bg-orange-700"
          )}
          size="lg"
        >
          {isCorrect
            ? t("common.continue") || "Continuar"
            : t("lesson.tryAgain") || "Tentar Novamente"}
        </Button>
      )}
    </div>
  );
};
