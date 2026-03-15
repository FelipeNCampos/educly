import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, ThumbsDown, Lightbulb } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn, shuffleArray } from "@/lib/utils";
import { useQuizSounds } from "@/hooks/useQuizSounds";

interface SelectIncorrectOption {
  text: string;
  isIncorrect: boolean; // true se esta opção está ERRADA (que é o que queremos selecionar)
  explanation?: string;
}

interface SelectIncorrectProps {
  /** Pergunta/contexto do exercício */
  question: string;
  /** Opções - o aluno deve selecionar as que estão INCORRETAS */
  options: SelectIncorrectOption[];
  /** Quantas opções incorretas o aluno deve selecionar (default: todas) */
  requiredSelections?: number;
  /** Explicação geral após acertar */
  successExplanation?: string;
  /** Callback quando o exercício é concluído */
  onComplete: () => void;
}

export const SelectIncorrect = ({
  question,
  options,
  requiredSelections,
  successExplanation,
  onComplete,
}: SelectIncorrectProps) => {
  const { t } = useTranslation();
  const { playCorrect, playIncorrect } = useQuizSounds();
  
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [attempts, setAttempts] = useState(0);

  // Shuffle options once on mount
  const shuffledOptions = useMemo(() => shuffleArray(options), [options]);

  // Índices das opções incorretas (que devem ser selecionadas)
  const incorrectIndices = useMemo(() => {
    return shuffledOptions
      .map((opt, idx) => (opt.isIncorrect ? idx : -1))
      .filter(idx => idx !== -1);
  }, [shuffledOptions]);

  const totalIncorrect = incorrectIndices.length;
  const required = requiredSelections || totalIncorrect;

  const handleOptionClick = (index: number) => {
    if (isChecked && isCorrect) return;
    
    setSelectedIndices(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      }
      return [...prev, index];
    });
    setIsChecked(false);
  };

  const handleCheck = () => {
    if (selectedIndices.length === 0) return;
    
    // Verifica se todas as selecionadas são incorretas E se selecionou a quantidade certa
    const allSelectionsAreIncorrect = selectedIndices.every(idx => shuffledOptions[idx].isIncorrect);
    const hasEnoughSelections = selectedIndices.length >= required;
    const noExtraSelections = selectedIndices.length <= totalIncorrect;
    
    const correct = allSelectionsAreIncorrect && hasEnoughSelections && noExtraSelections;
    
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
      setSelectedIndices([]);
      setIsChecked(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center flex-shrink-0">
          <ThumbsDown className="w-6 h-6 text-red-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground mb-1">
            {t("lesson.selectIncorrect.title") || "Encontre os Erros"}
          </h3>
          <p className="text-muted-foreground">
            {t("lesson.selectIncorrect.instruction") || `Selecione ${required > 1 ? 'as' : 'a'} opç${required > 1 ? 'ões' : 'ão'} que ${required > 1 ? 'estão' : 'está'} INCORRETA${required > 1 ? 'S' : ''}.`}
          </p>
        </div>
      </div>

      {/* Pergunta */}
      <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
        <p className="text-lg font-semibold text-foreground">{question}</p>
      </div>

      {/* Opções */}
      <div className="space-y-3">
        {shuffledOptions.map((option, index) => {
          const isSelected = selectedIndices.includes(index);
          const showCorrectHighlight = isChecked && option.isIncorrect;
          const showWrongHighlight = isChecked && isSelected && !option.isIncorrect;
          
          return (
            <button
              key={index}
              onClick={() => handleOptionClick(index)}
              disabled={isChecked && isCorrect}
              className={cn(
                "w-full p-4 text-left rounded-xl border-2 transition-all duration-200",
                isSelected
                  ? isChecked
                    ? option.isIncorrect
                      ? "border-green-500 bg-green-50"
                      : "border-red-500 bg-red-50"
                    : "border-primary bg-primary/10"
                  : showCorrectHighlight && !isCorrect
                    ? "border-orange-400 bg-orange-50"
                    : "border-border bg-card hover:border-primary/50"
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <span
                  className={cn(
                    "font-medium",
                    isSelected
                      ? isChecked
                        ? option.isIncorrect
                          ? "text-green-700"
                          : "text-red-700"
                        : "text-primary"
                      : "text-foreground"
                  )}
                >
                  {option.text}
                </span>
                
                {/* Checkbox visual */}
                <div
                  className={cn(
                    "w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all",
                    isSelected
                      ? isChecked
                        ? option.isIncorrect
                          ? "border-green-500 bg-green-500"
                          : "border-red-500 bg-red-500"
                        : "border-primary bg-primary"
                      : "border-border"
                  )}
                >
                  {isSelected && (
                    isChecked ? (
                      option.isIncorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      ) : (
                        <XCircle className="w-4 h-4 text-white" />
                      )
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    )
                  )}
                </div>
              </div>
              
              {/* Explicação individual */}
              {isChecked && isCorrect && option.isIncorrect && option.explanation && (
                <p className="text-sm text-green-700 mt-2 pl-2 border-l-2 border-green-300">
                  {option.explanation}
                </p>
              )}
            </button>
          );
        })}
      </div>

      {/* Contador de seleções */}
      {!isChecked && (
        <div className="text-center text-sm text-muted-foreground">
          {t("lesson.selectIncorrect.selected") || "Selecionadas:"} {selectedIndices.length}/{required}
        </div>
      )}

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
                  ? t("lesson.selectIncorrect.correct") || "Perfeito! Você identificou corretamente as opções erradas!"
                  : t("lesson.selectIncorrect.incorrect") || "Ainda não... Revise sua seleção!"}
              </p>
              {isCorrect && successExplanation && (
                <p className="text-green-700 mt-2 text-sm">{successExplanation}</p>
              )}
              {!isCorrect && (
                <p className="text-red-700 mt-2 text-sm">
                  {selectedIndices.some(idx => !shuffledOptions[idx].isIncorrect)
                    ? t("lesson.selectIncorrect.hasCorrect") || "Você selecionou algo que está CERTO. Lembre-se: queremos as opções ERRADAS."
                    : selectedIndices.length < required
                      ? t("lesson.selectIncorrect.needMore") || `Selecione mais opções incorretas. Faltam ${required - selectedIndices.length}.`
                      : t("lesson.selectIncorrect.tooMany") || "Você selecionou opções demais."}
                </p>
              )}
              {!isCorrect && attempts >= 2 && (
                <div className="mt-3 flex items-start gap-2 text-orange-700 bg-orange-50 rounded-xl p-3 border border-orange-200">
                  <Lightbulb className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">
                    {t("lesson.selectIncorrect.hint") || "Dica: Pense no que você aprendeu sobre boas práticas. O que vai CONTRA esses princípios?"}
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
          disabled={selectedIndices.length === 0}
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
