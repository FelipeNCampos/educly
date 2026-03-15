import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, XCircle, RotateCcw, Sparkles, ChevronDown } from "lucide-react";
import { SoundControl } from "@/components/SoundControl";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { useFreelancerContent } from "@/hooks/useFreelancerContent";
import { useQuizSounds } from "@/hooks/useQuizSounds";

const MatchWords = lazy(() => import("@/components/lesson/MatchWords").then((m) => ({ default: m.MatchWords })));
const FillBlanks = lazy(() => import("@/components/lesson/FillBlanks").then((m) => ({ default: m.FillBlanks })));
const PromptTrainer = lazy(() =>
  import("@/components/lesson/PromptTrainer").then((m) => ({ default: m.PromptTrainer })),
);

const getComponent = (componentName: string): React.LazyExoticComponent<React.ComponentType<any>> | null => {
  switch (componentName) {
    case "PromptTrainer":
      return PromptTrainer;
    case "MatchWords":
      return MatchWords;
    case "FillBlanks":
      return FillBlanks;
    default:
      return null;
  }
};

const FreelancerLesson = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation("challenge");
  const { getModuleContent, getModuleInfo, isLoading: contentLoading } = useFreelancerContent();
  const { playCorrect, playIncorrect } = useQuizSounds();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizResults, setQuizResults] = useState<Record<number, boolean>>({});
  const [showExplanation, setShowExplanation] = useState<Record<number, boolean>>({});

  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  const moduleNumber = parseInt(moduleId || "1");
  const steps = getModuleContent(moduleNumber);
  const moduleInfo = getModuleInfo(moduleNumber);

  // Função para processar negrito (**)
  const renderFormattedText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-[900] text-[#0f172a]">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) navigate("/auth");
    };
    checkAuth();
  }, [navigate]);

  // SCROLL CORRIGIDO: Com timeout e compensação de Header Fixo
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentStepElement = stepRefs.current[currentStepIndex];
      if (currentStepElement) {
        const headerOffset = 100; // Altura do seu header fixo
        const elementPosition = currentStepElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    }, 150); // Delay para o React montar o novo elemento

    return () => clearTimeout(timer);
  }, [currentStepIndex]);

  const handleStepComplete = (stepIndex: number) => {
    setCompletedSteps((prev) => new Set([...prev, stepIndex]));
    if (stepIndex < steps.length - 1) {
      setCurrentStepIndex(stepIndex + 1);
    }
  };

  const handleQuizAnswer = (stepIndex: number, optionIndex: number, isCorrect: boolean) => {
    setQuizAnswers((prev) => ({ ...prev, [stepIndex]: optionIndex }));
    setQuizResults((prev) => ({ ...prev, [stepIndex]: isCorrect }));
    setShowExplanation((prev) => ({ ...prev, [stepIndex]: true }));

    if (isCorrect) {
      playCorrect();
      handleStepComplete(stepIndex);
    } else {
      playIncorrect();
    }
  };

  const handleRetryQuiz = (stepIndex: number) => {
    setQuizAnswers((prev) => {
      const n = { ...prev };
      delete n[stepIndex];
      return n;
    });
    setQuizResults((prev) => {
      const n = { ...prev };
      delete n[stepIndex];
      return n;
    });
    setShowExplanation((prev) => {
      const n = { ...prev };
      delete n[stepIndex];
      return n;
    });
  };

  if (contentLoading || !moduleInfo) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Sparkles className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white antialiased font-sans">
      {/* Header Fixo */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md px-4 py-6 border-b border-slate-50">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/freelancer")}
            className="text-slate-400 hover:bg-slate-50 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <p className="text-[10px] text-slate-400 font-[900] uppercase tracking-[0.2em]">{moduleInfo.title}</p>
          </div>
          <SoundControl />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-4 space-y-16 pb-40">
        {steps.map((step, index) => {
          if (index > currentStepIndex) return null;
          const isCompleted = completedSteps.size > index;

          return (
            <div
              key={index}
              ref={(el) => {
                stepRefs.current[index] = el;
              }}
              className="animate-in fade-in slide-in-from-bottom-6 duration-700"
            >
              {/* Layout de Texto conforme Print Laranja */}
              {step.type === "text" && (
                <div className="space-y-8">
                  <div className="space-y-6">
                    <span className="bg-[#fff7ed] text-[#c2410c] px-3 py-1.5 rounded-lg text-[11px] font-[900] tracking-widest flex items-center gap-2 w-fit uppercase">
                      <span className="text-sm">📚</span> APRENDER
                    </span>

                    {step.title && (
                      <h2 className="text-[32px] font-[900] text-[#0f172a] leading-[1.15] tracking-tight">
                        {step.title}
                      </h2>
                    )}
                  </div>

                  <div className="space-y-6">
                    {step.content?.split("\n").map((paragraph, pIndex) => (
                      <p key={pIndex} className="text-[18px] text-[#475569]/80 leading-relaxed font-normal">
                        {renderFormattedText(paragraph)}
                      </p>
                    ))}
                  </div>

                  {index === currentStepIndex && !completedSteps.has(index) && (
                    <Button
                      onClick={() => handleStepComplete(index)}
                      className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white font-[900] py-8 rounded-2xl text-[17px] uppercase tracking-[0.15em] shadow-xl shadow-orange-100 transition-all active:scale-[0.98] mt-4"
                    >
                      CONTINUAR
                    </Button>
                  )}
                </div>
              )}

              {/* Quiz Step */}
              {step.type === "quiz" && (
                <div className="space-y-8">
                  <span className="bg-[#fff7ed] text-[#c2410c] px-3 py-1.5 rounded-lg text-[11px] font-[900] tracking-widest flex items-center gap-2 w-fit uppercase">
                    <span className="text-sm">❓</span> DESAFIO
                  </span>

                  <h3 className="text-[26px] font-[900] text-[#0f172a] leading-tight tracking-tight">
                    {step.question}
                  </h3>

                  <div className="space-y-3">
                    {step.options?.map((option, optIndex) => {
                      const isSelected = quizAnswers[index] === optIndex;
                      const hasAnswered = quizAnswers[index] !== undefined;
                      const isCorrect = option.isCorrect;

                      return (
                        <button
                          key={optIndex}
                          onClick={() => !hasAnswered && handleQuizAnswer(index, optIndex, option.isCorrect)}
                          disabled={hasAnswered}
                          className={cn(
                            "w-full text-left p-6 rounded-2xl border-2 transition-all font-bold text-[17px] flex items-center justify-between",
                            !hasAnswered &&
                              "bg-white border-slate-100 hover:border-[#f97316] hover:bg-orange-50/30 text-[#475569]",
                            hasAnswered &&
                              isSelected &&
                              isCorrect &&
                              "bg-emerald-50 border-emerald-500 text-emerald-900",
                            hasAnswered && isSelected && !isCorrect && "bg-red-50 border-red-500 text-red-900",
                            hasAnswered &&
                              !isSelected &&
                              isCorrect &&
                              "bg-emerald-50 border-emerald-200 text-emerald-700",
                            hasAnswered && !isSelected && !isCorrect && "opacity-40 border-slate-50",
                          )}
                        >
                          {option.text}
                          {hasAnswered &&
                            isSelected &&
                            (isCorrect ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-600" />
                            ))}
                        </button>
                      );
                    })}
                  </div>

                  {showExplanation[index] && step.explanation && (
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-[16px] text-[#475569] leading-relaxed italic">
                      {renderFormattedText(step.explanation)}
                    </div>
                  )}

                  {!quizResults[index] && quizAnswers[index] !== undefined && (
                    <Button
                      onClick={() => handleRetryQuiz(index)}
                      variant="outline"
                      className="w-full border-slate-200 text-slate-500 font-bold rounded-2xl py-6"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" /> Tentar de novo
                    </Button>
                  )}
                </div>
              )}

              {/* Component Step */}
              {step.type === "component" && step.componentName && (
                <div className="bg-white rounded-3xl border border-slate-100 p-1 overflow-hidden">
                  <Suspense
                    fallback={
                      <div className="p-12 flex justify-center">
                        <Sparkles className="animate-spin text-orange-400" />
                      </div>
                    }
                  >
                    {(() => {
                      const Component = getComponent(step.componentName!);
                      return Component ? (
                        <Component {...(step.props || {})} onComplete={() => handleStepComplete(index)} />
                      ) : null;
                    })()}
                  </Suspense>
                </div>
              )}
            </div>
          );
        })}

        {/* Card Final */}
        {completedSteps.size === steps.length && (
          <div className="animate-in zoom-in duration-700 bg-[#0f172a] rounded-[40px] p-12 text-white text-center shadow-2xl shadow-slate-200">
            <div className="w-20 h-20 bg-[#f97316] rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-orange-500/30">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-[34px] font-[900] mb-4 tracking-tight leading-tight">Módulo Concluído!</h3>
            <Button
              onClick={() => navigate("/freelancer")}
              className="w-full bg-white text-[#0f172a] hover:bg-slate-100 font-[900] py-8 rounded-2xl text-[17px] uppercase tracking-widest transition-all"
            >
              VOLTAR A MÓDULOS
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FreelancerLesson;
