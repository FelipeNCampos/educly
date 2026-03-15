import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { X, CheckCircle2, XCircle, Bot, RotateCcw, Send, Sparkles, User, HelpCircle } from "lucide-react";
import { GradualTextDisplay, GradualTextDisplayRef } from "@/components/lesson/GradualTextDisplay";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { QuizAIHelper } from "@/components/lesson/QuizAIHelper";
import { useTranslation } from "react-i18next";
import mascoteEdi from "@/assets/mascote-educy.png";
import { useTranslatedLessonContent } from "@/hooks/useTranslatedLessonContent";
import { useQuizSounds } from "@/hooks/useQuizSounds";

// Interactive lesson components - lazy loaded for performance
const PromptTrainer = lazy(() =>
  import("@/components/lesson/PromptTrainer").then((m) => ({ default: m.PromptTrainer })),
);
const WordSearch = lazy(() => import("@/components/lesson/WordSearch").then((m) => ({ default: m.WordSearch })));
const MatchWords = lazy(() => import("@/components/lesson/MatchWords").then((m) => ({ default: m.MatchWords })));
const FillBlanks = lazy(() => import("@/components/lesson/FillBlanks").then((m) => ({ default: m.FillBlanks })));
const FindPromptError = lazy(() => import("@/components/lesson/FindPromptError").then((m) => ({ default: m.FindPromptError })));
const SelectIncorrect = lazy(() => import("@/components/lesson/SelectIncorrect").then((m) => ({ default: m.SelectIncorrect })));
// REGISTRO DO LAZY LOAD ADICIONADO ABAIXO
const AppPromo = lazy(() => import("@/components/AppPromo").then((m) => ({ default: m.AppPromo })));

// Import Edi Motivation components
import { EdiMotivation, useEdiMotivation } from "@/components/lesson/EdiMotivation";

// Component registry for dynamic rendering - using any to allow flexible prop passing from JSON
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getComponent = (componentName: string): React.LazyExoticComponent<React.ComponentType<any>> | null => {
  switch (componentName) {
    case "PromptTrainer":
      return PromptTrainer;
    case "WordSearch":
      return WordSearch;
    case "MatchWords":
      return MatchWords;
    case "FillBlanks":
      return FillBlanks;
    case "FindPromptError":
      return FindPromptError;
    case "SelectIncorrect":
      return SelectIncorrect;
    case "AppPromo": // CASO ADICIONADO PARA RECONHECER O COMPONENTE
      return AppPromo;
    default:
      return null;
  }
};

// --- DEFINIÇÃO DOS TIPOS ---
type StepType = "text" | "quiz" | "practical" | "component";

interface LessonStep {
  type: StepType;
  title?: string;
  content?: string;
  image?: string;
  question?: string;
  options?: { text: string; isCorrect: boolean }[];
  explanation?: string;
  initialWords?: string[];
  correctOrder?: string[];
  componentName?: string;
  props?: Record<string, unknown>;
}

// Clean white theme colors (Dashboard style)
const THEME = {
  // Primary (purple from design system)
  primary: "bg-primary",
  primaryHover: "hover:bg-primary/90",
  primaryRing: "ring-primary",
  text: "text-primary",
  border: "border-primary",
  lightBg: "bg-primary/10",
  // Success colors
  correct: "bg-success",
  incorrect: "bg-destructive",
  // UI colors - Clean white theme
  cardBg: "bg-card",
  cardBorder: "border-border",
  mutedText: "text-muted-foreground",
};

// Interface para as mensagens do chat
interface ChatMessage {
  role: "ai" | "user";
  text: string;
}

const DayLesson = () => {
  const { t, i18n } = useTranslation();
  const { dayId } = useParams();
  const navigate = useNavigate();
  const { playCorrect, playIncorrect, playContinue } = useQuizSounds();

  // Estados da Lição
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [lessonSteps, setLessonSteps] = useState<LessonStep[]>([]);
  const [dayInfo, setDayInfo] = useState<{ dayNumber: number; title: string; challengeId: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Estados de Quiz/Prática - armazena respostas por step para permitir scroll
  const [stepAnswers, setStepAnswers] = useState<Record<number, {
    selectedOption: number | null;
    isAnswerChecked: boolean;
    isCorrect: boolean;
    userWords: string[];
    componentCompleted: boolean;
  }>>({});
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [showEdiHelper, setShowEdiHelper] = useState(false);

  // Edi Motivation system - shows motivational messages at progress milestones
  const { activeMotivation, closeMotivation } = useEdiMotivation(
    currentStepIndex + 1, 
    lessonSteps.length,
    dayInfo?.dayNumber || 1
  );

  // Refs para scroll suave
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Ref para controlar texto gradual
  const gradualTextRef = useRef<GradualTextDisplayRef>(null);

  // Getters para o step atual (compatibilidade com lógica existente)
  const currentStepAnswer = stepAnswers[currentStepIndex] || { 
    selectedOption: null, 
    isAnswerChecked: false, 
    isCorrect: false,
    userWords: [],
    componentCompleted: false
  };
  const selectedOption = currentStepAnswer.selectedOption;
  const isAnswerChecked = currentStepAnswer.isAnswerChecked;
  const isCorrect = currentStepAnswer.isCorrect;
  const userWords = currentStepAnswer.userWords;
  const componentCompleted = currentStepAnswer.componentCompleted;
  
  // AvailableWords precisa ser gerenciado separadamente
  const [availableWords, setAvailableWords] = useState<string[]>([]);

  // Funções helper para atualizar stepAnswers de forma compatível
  const setSelectedOption = (value: number | null) => {
    setStepAnswers(prev => ({
      ...prev,
      [currentStepIndex]: {
        ...prev[currentStepIndex],
        selectedOption: value,
        isAnswerChecked: prev[currentStepIndex]?.isAnswerChecked ?? false,
        isCorrect: prev[currentStepIndex]?.isCorrect ?? false,
        userWords: prev[currentStepIndex]?.userWords ?? []
      }
    }));
  };

  const setIsAnswerChecked = (value: boolean) => {
    setStepAnswers(prev => ({
      ...prev,
      [currentStepIndex]: {
        ...prev[currentStepIndex],
        selectedOption: prev[currentStepIndex]?.selectedOption ?? null,
        isAnswerChecked: value,
        isCorrect: prev[currentStepIndex]?.isCorrect ?? false,
        userWords: prev[currentStepIndex]?.userWords ?? []
      }
    }));
  };

  const setIsCorrect = (value: boolean) => {
    setStepAnswers(prev => ({
      ...prev,
      [currentStepIndex]: {
        ...prev[currentStepIndex],
        selectedOption: prev[currentStepIndex]?.selectedOption ?? null,
        isAnswerChecked: prev[currentStepIndex]?.isAnswerChecked ?? false,
        isCorrect: value,
        userWords: prev[currentStepIndex]?.userWords ?? []
      }
    }));
  };

  const setUserWords = (value: string[] | ((prev: string[]) => string[])) => {
    setStepAnswers(prev => {
      const current = prev[currentStepIndex];
      const currentWords = current?.userWords ?? [];
      const newWords = typeof value === 'function' ? value(currentWords) : value;
      return {
        ...prev,
        [currentStepIndex]: {
          ...current,
          selectedOption: current?.selectedOption ?? null,
          isAnswerChecked: current?.isAnswerChecked ?? false,
          isCorrect: current?.isCorrect ?? false,
          userWords: newWords
        }
      };
    });
  };

  // --- NOVOS ESTADOS PARA O CHAT INTERATIVO ---
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Hook for translated lesson content
  const { getLessonContent, currentLanguage, contentLanguage, isLoading: isTranslationLoading } = useTranslatedLessonContent();

  // Carregar Conteúdo - wait for translations to be ready AND content language to match
  useEffect(() => {
    // Don't load content until translations are ready and content language matches
    if (isTranslationLoading) return;
    if (contentLanguage && contentLanguage !== currentLanguage) {
      console.log(`⏳ Aguardando conteúdo: atual=${contentLanguage}, esperado=${currentLanguage}`);
      return;
    }

    const fetchDayContent = async () => {
      setIsLoading(true);
      if (!dayId) return;
      try {
        // Refresh token on lesson entry for 4h validity
        const { refreshSession } = await import("@/hooks/useRefreshSession");
        await refreshSession();
        const { data: dayData } = await supabase
          .from("challenge_days")
          .select("day_number, title, challenge_id")
          .eq("id", dayId)
          .single();
        if (dayData) {
          setDayInfo({ dayNumber: dayData.day_number, title: dayData.title, challengeId: dayData.challenge_id });
          // Always use translated content from JSON files - no hardcoded fallback
          const translatedSteps = getLessonContent(dayData.day_number);
          console.log(`📚 Day ${dayData.day_number} - Carregando ${translatedSteps.length} steps para idioma: ${contentLanguage}`);
          setLessonSteps(translatedSteps);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDayContent();
  }, [dayId, currentLanguage, contentLanguage, getLessonContent, isTranslationLoading]);

  // Inicializar estados do step atual (não resetar - apenas inicializar se não existir)
  useEffect(() => {
    const step = lessonSteps[currentStepIndex];
    if (step) {
      // Apenas reseta wrongAttempts e showEdiHelper para o step atual
      setWrongAttempts(0);
      setShowEdiHelper(false);

      // Inicializa availableWords para prática se for um novo step
      if (step.type === "practical" && !stepAnswers[currentStepIndex]?.userWords?.length) {
        setAvailableWords(step.initialWords || []);
      }

      // Reset Chat para o step atual
      if (step.type === "component") {
        setChatMessages([
          {
            role: "ai",
            text: (step.props?.initialMessage as string) || "Olá! Estou pronto.",
          },
        ]);
        setChatInput("");
        setIsAiTyping(false);
      }
    }
  }, [currentStepIndex, lessonSteps, stepAnswers]);

  // Scroll para o fim do chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isAiTyping]);

  // Scroll suave para o step atual quando muda
  useEffect(() => {
    if (stepRefs.current[currentStepIndex]) {
      // Delay para animação suave após renderização
      setTimeout(() => {
        stepRefs.current[currentStepIndex]?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center'
        });
      }, 150);
    }
  }, [currentStepIndex]);

  // --- LÓGICA DO CHAT COM IA REAL ---
  const handleSendMessage = async () => {
    if (!chatInput.trim() || isAiTyping) return;

    const userMessage = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user" as const, text: userMessage }]);
    setIsAiTyping(true);

    try {
      // Use refreshSession as fallback for long sessions
      const { refreshSession } = await import("@/hooks/useRefreshSession");
      const accessToken = await refreshSession();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !accessToken) {
        setChatMessages((prev) => [...prev, { role: "ai", text: t("lesson.ediChat.loginRequired") || "Faça login para conversar com o EDI." }]);
        setIsAiTyping(false);
        return;
      }

      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/iacademy-chat`;
      
      // Build message history
      const apiMessages = chatMessages.map((m) => ({
        role: m.role === "ai" ? "assistant" : "user",
        content: m.text,
      }));
      apiMessages.push({ role: "user", content: userMessage });

      // Build context from current lesson
      const lessonContext = dayInfo 
        ? `Dia ${dayInfo.dayNumber}: ${currentStep?.title || "Prática com IA"}`
        : currentStep?.title || "Prática com IA";

      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          messages: apiMessages,
          aiToolContext: lessonContext,
          language: i18n.language,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          setChatMessages((prev) => [...prev, { role: "ai", text: t("lesson.ediChat.rateLimited") || "Muitas mensagens! Aguarde um momento..." }]);
        } else if (response.status === 402) {
          setChatMessages((prev) => [...prev, { role: "ai", text: t("lesson.ediChat.creditsExhausted") || "Créditos esgotados. Entre em contato." }]);
        } else if (response.status === 403) {
          setChatMessages((prev) => [...prev, { role: "ai", text: t("lesson.ediChat.premiumRequired") || "Desbloqueie o acesso premium para conversar com o EDI!" }]);
        } else {
          setChatMessages((prev) => [...prev, { role: "ai", text: t("lesson.ediChat.error") || "Erro ao conectar. Tente novamente." }]);
        }
        setIsAiTyping(false);
        return;
      }

      // Stream the response
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let textBuffer = "";
      let fullResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullResponse += content;
              setChatMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "ai" && prev.length > 1) {
                  return prev.map((m, i) => (i === prev.length - 1 ? { ...m, text: fullResponse } : m));
                }
                return [...prev, { role: "ai", text: fullResponse }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // If no response was streamed, show error
      if (!fullResponse) {
        setChatMessages((prev) => [...prev, { role: "ai", text: t("lesson.ediChat.error") || "Erro ao conectar. Tente novamente." }]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setChatMessages((prev) => [...prev, { role: "ai", text: t("lesson.ediChat.error") || "Erro ao conectar. Tente novamente." }]);
    } finally {
      setIsAiTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  // --- CALLBACK PARA COMPONENTES INTERATIVOS ---
  const handleComponentComplete = () => {
    // Marca o componente como completo
    setStepAnswers(prev => ({
      ...prev,
      [currentStepIndex]: {
        ...prev[currentStepIndex],
        selectedOption: prev[currentStepIndex]?.selectedOption ?? null,
        isAnswerChecked: true,
        isCorrect: true,
        userWords: prev[currentStepIndex]?.userWords ?? [],
        componentCompleted: true
      }
    }));
    // Avança para próximo step (bypass do check assíncrono)
    handleNext(true);
  };

  // --- LÓGICA DE NAVEGAÇÃO ---
  const handleNext = async (fromComponentComplete?: boolean) => {
    const step = lessonSteps[currentStepIndex];

    // BLOQUEIO: Não permite avançar se errou em quiz ou prática - deve tentar de novo
    if ((step.type === "quiz" || step.type === "practical") && isAnswerChecked && !isCorrect) {
      // Reseta para tentar novamente
      setIsAnswerChecked(false);
      setSelectedOption(null);
      if (step.type === "practical") {
        setUserWords([]);
        setAvailableWords(step.initialWords || []);
      }
      return;
    }

    // BLOQUEIO: Componentes interativos devem ser completados via callback (AppPromo ignorado para permitir avanço pelo botão principal)
    if (step.type === "component" && step.componentName !== "AppPromo" && step.componentName && getComponent(step.componentName) && !componentCompleted && !fromComponentComplete) {
      // Não permite pular componentes interativos
      return;
    }

    // Para steps de texto: primeiro mostra próxima parte, só avança quando acabar
    if (step.type === "text" && gradualTextRef.current) {
      const hadMoreParts = gradualTextRef.current.goToNextPart();
      if (hadMoreParts) {
        // Ainda tem partes - não avança para próximo step
        return;
      }
    }

    if (currentStepIndex >= lessonSteps.length - 1) {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user && dayId && dayInfo) {
          // Save day progress
          await supabase.from("user_day_progress").upsert({
            user_id: user.id,
            challenge_day_id: dayId,
            completed: true,
            completed_at: new Date().toISOString(),
          }, { onConflict: 'user_id,challenge_day_id' });

          // Ensure challenge progress record exists (upsert), then update current_day
          const nextDayNumber = dayInfo.dayNumber + 1;
          await supabase.from("user_challenge_progress").upsert({
            user_id: user.id,
            challenge_id: dayInfo.challengeId,
            current_day: nextDayNumber,
            is_active: true,
          }, { onConflict: 'user_id,challenge_id' });
        }
        navigate("/dashboard");
      } catch (error) {
        console.error("Error saving progress:", error);
        navigate("/dashboard");
      }
      return;
    }
    
    // Toca som de continuar ao avançar
    playContinue();
    
    // Avança para próximo step e faz scroll suave
    setCurrentStepIndex((prev) => prev + 1);
  };

  const handleVerify = () => {
    const step = lessonSteps[currentStepIndex];
    let correct = false;

    if (step.type === "quiz") {
      correct = step.options![selectedOption!].isCorrect;
    } else if (step.type === "practical") {
      correct = userWords.join(" ") === step.correctOrder?.join(" ");
    }

    setIsCorrect(correct);
    setIsAnswerChecked(true);

    // Tocar som de acerto ou erro
    if (correct) {
      playCorrect();
    } else {
      playIncorrect();
      setWrongAttempts((prev) => prev + 1);
    }
  };

  // Previne context menu (botão direito) para evitar pular questões
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  const toggleWord = (word: string, fromUser: boolean) => {
    if (isAnswerChecked) return;
    if (fromUser) {
      setUserWords((prev) => prev.filter((w) => w !== word));
      setAvailableWords((prev) => [...prev, word]);
    } else {
      setAvailableWords((prev) => prev.filter((w) => w !== word));
      setUserWords((prev) => [...prev, word]);
    }
  };

  if (isLoading || isTranslationLoading)
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );

  const currentStep = lessonSteps[currentStepIndex];
  if (!currentStep)
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );

  const progress = ((currentStepIndex + 1) / (lessonSteps.length || 1)) * 100;

  // Só pede verificação se for Quiz ou Prática. Chat avança direto.
  const needsVerification = (currentStep.type === "quiz" || currentStep.type === "practical") && !isAnswerChecked;

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col" onContextMenu={handleContextMenu}>
      {/* HEADER - Clean white style */}
      <div className="px-4 py-3 flex items-center gap-3 bg-background border-b border-border">
        <button
          onClick={() => navigate("/dashboard")}
          className="p-2 hover:bg-muted rounded-xl transition-all duration-200 group"
          type="button"
          aria-label="Fechar"
        >
          <X className="w-6 h-6 text-muted-foreground group-hover:text-foreground transition-colors" />
        </button>
        {/* Progress bar - clean style */}
        <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-700 ease-out rounded-full bg-primary relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent h-1/2" />
          </div>
        </div>
        {/* Step counter */}
        <span className="text-muted-foreground text-sm font-semibold min-w-[50px] text-right">
          {currentStepIndex + 1}/{lessonSteps.length}
        </span>
      </div>

      {/* MAIN CONTENT AREA - Scroll contínuo suave */}
      <div ref={containerRef} className="flex-1 overflow-y-auto flex justify-center bg-background scroll-smooth">
        <div className="w-full max-w-2xl px-6 py-8 pb-32 space-y-12">
          {/* Renderiza todos os steps até o atual */}
          {lessonSteps.map((step, stepIndex) => {
            // Só renderiza steps até o atual
            if (stepIndex > currentStepIndex) return null;
            
            const isCurrent = stepIndex === currentStepIndex;
            const stepAnswer = stepAnswers[stepIndex] || { 
              selectedOption: null, 
              isAnswerChecked: false, 
              isCorrect: false,
              userWords: []
            };
            
              return (
                <div
                  key={stepIndex}
                  ref={el => { stepRefs.current[stepIndex] = el; }}
                  className={cn(
                    "transition-all duration-700 ease-out",
                    isCurrent 
                      ? "opacity-100" 
                      : "opacity-40 pointer-events-none"
                  )}
                >
                {/* Step type badge */}
                <div className={cn(
                  "flex items-center gap-3 mb-6",
                  isCurrent && "animate-fade-in"
                )}>
                  <div
                    className={cn(
                      "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider",
                      step.type === "quiz"
                        ? "bg-blue-100 text-blue-600"
                        : step.type === "practical"
                          ? "bg-orange-100 text-orange-600"
                          : step.type === "component"
                            ? "bg-purple-100 text-purple-600"
                            : "bg-primary/10 text-primary",
                    )}
                  >
                    {step.type === "practical"
                      ? t("lesson.stepTypes.practical")
                      : step.type === "component"
                        ? t("lesson.stepTypes.simulator")
                        : step.type === "quiz"
                          ? t("lesson.stepTypes.quiz")
                          : t("lesson.stepTypes.learn")}
                  </div>
                  {/* Indicador de completo para steps anteriores */}
                  {!isCurrent && stepAnswer.isCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-success" />
                  )}
                </div>

                {/* TITLE */}
                {step.title && (
                  <h1 className={cn(
                    "text-2xl md:text-3xl font-bold text-foreground mb-8 leading-tight",
                    isCurrent && "animate-fade-in"
                  )}>
                    {step.title}
                  </h1>
                )}

                {/* === TYPE: TEXT CONTENT (GRADUAL DISPLAY) === */}
                {step.type === "text" && (
                  <div className={cn(
                    "transition-all duration-700 ease-out",
                    isCurrent && "animate-fade-in"
                  )}>
                    <GradualTextDisplay
                      ref={isCurrent ? gradualTextRef : undefined}
                      content={step.content || ""}
                      isActive={isCurrent}
                    />
                  </div>
                )}

                {/* === TYPE: COMPONENT (DYNAMIC OR CHAT) === */}
                {step.type === "component" && isCurrent && (
                  <div className="animate-fade-in">
                    {step.componentName && getComponent(step.componentName) ? (
                      <Suspense
                        fallback={
                          <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          </div>
                        }
                      >
                        {(() => {
                          const DynamicComponent = getComponent(step.componentName!);
                          if (!DynamicComponent) return null;
                          const componentProps = step.props || {};
                          return <DynamicComponent {...componentProps} onComplete={handleComponentComplete} />;
                        })()}
                      </Suspense>
                    ) : (
                      /* SimulatedAIChat */
                      <div className="w-full bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col h-[450px]">
                        <div className="bg-primary p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/30">
                              <img src={mascoteEdi} alt="EDI" className="w-full h-full object-contain bg-white/20" />
                            </div>
                            <div>
                              <h3 className="font-bold text-white text-base">{t("lesson.ediChat.title") || "EDI"}</h3>
                              <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                <span className="text-xs text-white/90 font-medium">{t("lesson.ediChat.online") || "Pronto para te ajudar"}</span>
                              </div>
                            </div>
                          </div>
                          <div className="bg-white/20 p-2 rounded-xl text-white">
                            <Sparkles size={18} />
                          </div>
                        </div>
                        <div className="flex-1 bg-muted/30 p-4 space-y-4 overflow-y-auto">
                          {chatMessages.map((msg, idx) => (
                            <div
                              key={idx}
                              className={cn(
                                "flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300",
                                msg.role === "user" ? "flex-row-reverse" : "",
                              )}
                            >
                              <div
                                className={cn(
                                  "w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm overflow-hidden",
                                  msg.role === "user" && "bg-primary text-white",
                                )}
                              >
                                {msg.role === "ai" ? (
                                  <img src={mascoteEdi} alt="EDI" className="w-10 h-10 object-contain" />
                                ) : (
                                  <User size={18} />
                                )}
                              </div>
                              <div
                                className={cn(
                                  "p-4 rounded-2xl shadow-sm text-sm max-w-[80%] leading-relaxed whitespace-pre-wrap",
                                  msg.role === "ai"
                                    ? "bg-card border border-border text-foreground rounded-tl-md"
                                    : "bg-primary text-white rounded-tr-md",
                                )}
                              >
                                {msg.text}
                              </div>
                            </div>
                          ))}
                          {isAiTyping && (
                            <div className="flex gap-3 animate-in fade-in duration-200">
                              <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden">
                                <img src={mascoteEdi} alt="EDI" className="w-10 h-10 object-contain" />
                              </div>
                              <div className="bg-card border border-border p-4 rounded-2xl rounded-tl-md flex items-center gap-2">
                                <span className="w-2 h-2 bg-primary rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.15s]"></span>
                                <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.3s]"></span>
                              </div>
                            </div>
                          )}
                          <div ref={messagesEndRef} />
                        </div>
                        <div className="p-3 bg-card border-t border-border">
                          <div className="relative flex items-center gap-2">
                            <input
                              type="text"
                              value={chatInput}
                              onChange={(e) => setChatInput(e.target.value)}
                              onKeyDown={handleKeyDown}
                              placeholder="Digite sua mensagem..."
                              className="w-full bg-muted border border-border rounded-xl py-3 pl-4 pr-14 text-sm focus:outline-none focus:border-primary transition-all text-foreground placeholder:text-muted-foreground"
                            />
                            <button
                              onClick={handleSendMessage}
                              disabled={!chatInput.trim()}
                              className={cn(
                                "absolute right-2 p-2 rounded-lg text-white transition-all",
                                chatInput.trim() ? "bg-primary hover:bg-primary/90 shadow-sm" : "bg-muted cursor-not-allowed",
                              )}
                            >
                              <Send size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Component não-atual (já completo) - mostra resumo */}
                {step.type === "component" && !isCurrent && (
                  <div className="bg-card rounded-2xl p-4 border border-border/50 shadow-sm">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <CheckCircle2 className="w-5 h-5 text-success" />
                      <span className="text-sm">{t("lesson.chatCompleted") || "Chat concluído"}</span>
                    </div>
                  </div>
                )}

                {/* === TYPE: PRACTICAL EXERCISE === */}
                {step.type === "practical" && (
                  <div className={cn("space-y-6", isCurrent && "animate-fade-in")}>
                    <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
                      <p className="text-lg font-semibold text-foreground leading-relaxed">{step.question}</p>
                    </div>
                    <div
                      className={cn(
                        "min-h-[140px] p-5 rounded-2xl border-2 border-dashed flex flex-wrap gap-3 items-center transition-all duration-300",
                        stepAnswer.isAnswerChecked
                          ? stepAnswer.isCorrect
                            ? "border-success bg-success/10"
                            : "border-destructive bg-destructive/10"
                          : "border-border bg-muted/30",
                      )}
                    >
                      {(isCurrent ? userWords : stepAnswer.userWords).length === 0 && (
                        <span className="text-muted-foreground italic w-full text-center text-sm">
                          👆 Toque nas palavras abaixo para montar a frase
                        </span>
                      )}
                      {(isCurrent ? userWords : stepAnswer.userWords).map((word, i) => (
                        <button
                          key={i}
                          onClick={() => isCurrent && toggleWord(word, true)}
                          disabled={!isCurrent || stepAnswer.isAnswerChecked}
                          className="px-4 py-3 bg-primary text-primary-foreground shadow-sm rounded-xl font-semibold animate-in zoom-in-95 duration-200 hover:scale-105 transition-transform"
                        >
                          {word}
                        </button>
                      ))}
                    </div>
                    {isCurrent && (
                      <div className="flex flex-wrap gap-3 justify-center">
                        {availableWords.map((word, i) => (
                          <button
                            key={i}
                            onClick={() => toggleWord(word, false)}
                            disabled={stepAnswer.isAnswerChecked}
                            className="px-4 py-3 rounded-xl font-semibold transition-all active:scale-95 bg-muted text-foreground hover:bg-muted/80 border border-border shadow-sm"
                          >
                            {word}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* === TYPE: QUIZ === */}
                {step.type === "quiz" && (
                  <div className={cn("space-y-3", isCurrent && "animate-fade-in")}>
                    {/* Quiz question text */}
                    {step.question && (
                      <p className="text-lg font-semibold text-foreground mb-4 leading-relaxed">{step.question}</p>
                    )}
                    {step.options?.map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => isCurrent && !stepAnswer.isAnswerChecked && setSelectedOption(idx)}
                        disabled={!isCurrent || stepAnswer.isAnswerChecked}
                        style={isCurrent ? { animationDelay: `${idx * 100}ms` } : undefined}
                        className={cn(
                          "w-full p-5 rounded-2xl border text-left font-medium transition-all duration-200",
                          isCurrent && "animate-in fade-in slide-in-from-bottom-2",
                          "bg-card border-border text-foreground",
                          isCurrent && !stepAnswer.isAnswerChecked && "hover:border-primary/50 hover:bg-muted/50",
                          stepAnswer.selectedOption === idx && !stepAnswer.isAnswerChecked && "border-primary bg-primary/10 ring-2 ring-primary/20",
                          stepAnswer.isAnswerChecked && option.isCorrect && "border-success bg-success/10 text-success",
                          stepAnswer.isAnswerChecked &&
                            stepAnswer.selectedOption === idx &&
                            !option.isCorrect &&
                            "border-destructive bg-destructive/10 text-destructive",
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center font-semibold text-sm border transition-all",
                              stepAnswer.selectedOption === idx && !stepAnswer.isAnswerChecked
                                ? "border-primary bg-primary text-white"
                                : stepAnswer.isAnswerChecked && option.isCorrect
                                  ? "border-success bg-success text-white"
                                  : stepAnswer.isAnswerChecked && stepAnswer.selectedOption === idx && !option.isCorrect
                                    ? "border-destructive bg-destructive text-white"
                                    : "border-border text-muted-foreground",
                            )}
                          >
                            {String.fromCharCode(65 + idx)}
                          </div>
                          <span className="flex-1">{option.text}</span>
                          {stepAnswer.isAnswerChecked && option.isCorrect && <CheckCircle2 className="w-6 h-6 text-success" />}
                          {stepAnswer.isAnswerChecked && stepAnswer.selectedOption === idx && !option.isCorrect && (
                            <XCircle className="w-6 h-6 text-destructive" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* FEEDBACK PANEL - apenas para step atual */}
                {isCurrent && stepAnswer.isAnswerChecked && (step.type === "quiz" || step.type === "practical") && (
                  <div
                    className={cn(
                      "p-6 rounded-2xl border mt-8 animate-fade-in",
                      stepAnswer.isCorrect
                        ? "bg-success/10 border-success text-success"
                        : "bg-destructive/10 border-destructive text-destructive",
                    )}
                  >
                    <div className="font-bold text-xl mb-3 flex items-center gap-3">
                      {stepAnswer.isCorrect ? (
                        <>
                          <div className="w-10 h-10 rounded-full bg-success flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6 text-white" />
                          </div>
                          <span>{t("lesson.quiz.excellent")} 🎉</span>
                        </>
                      ) : (
                        <>
                          <div className="w-10 h-10 rounded-full bg-destructive flex items-center justify-center">
                            <XCircle className="w-6 h-6 text-white" />
                          </div>
                          <span>{t("lesson.quiz.almostThere")}</span>
                        </>
                      )}
                    </div>
                    <p className="text-foreground/70 leading-relaxed text-base">
                      {stepAnswer.isCorrect ? t("lesson.quiz.masteredConcept") : step.explanation}
                    </p>
                    {!stepAnswer.isCorrect && (
                      <>
                        <div className="mt-4 p-4 rounded-xl bg-orange-100 border border-orange-200">
                          <p className="text-orange-600 text-sm font-semibold mb-1">
                            {t("lesson.quiz.hint")} {wrongAttempts}:
                          </p>
                          <p className="text-foreground/70 text-sm">
                            {wrongAttempts === 1
                              ? step.type === "quiz"
                                ? t("lesson.quiz.hintReread")
                                : t("lesson.quiz.hintOrder")
                              : wrongAttempts === 2
                                ? t("lesson.quiz.hintReview")
                                : t("lesson.quiz.hintAskEdi")}
                          </p>
                        </div>
                        <div className="mt-4 flex flex-col gap-3">
                          <div className="flex items-center gap-2 text-destructive">
                            <RotateCcw className="w-4 h-4" />
                            <span className="text-sm font-semibold">{t("lesson.quiz.getCorrectToContinue")}</span>
                          </div>
                          <button
                            onClick={() => setShowEdiHelper(true)}
                            className="flex items-center gap-2 px-4 py-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl transition-colors font-semibold text-sm"
                          >
                            <HelpCircle className="w-5 h-5" />
                            {t("lesson.quiz.askEdi")} 🤖
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Espaçamento sutil entre blocos */}
              </div>
            );
          })}

        </div>
      </div>
      {/* BOTTOM ACTION BAR - BOTÃO PRINCIPAL ATUALIZADO PARA PERMITIR APPPROMO */}
      {(!(currentStep.type === "component" && currentStep.componentName !== "AppPromo" && currentStep.componentName && getComponent(currentStep.componentName) && !componentCompleted)) && (
        <div className="p-4 bg-card border-t border-border z-20 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
          <div className="max-w-2xl mx-auto">
            <Button
              onClick={needsVerification ? handleVerify : () => handleNext()}
              disabled={
                // Quiz: must select an option before verifying
                (currentStep.type === "quiz" && !isAnswerChecked && selectedOption === null) ||
                // Practical: must have words arranged before verifying  
                (currentStep.type === "practical" && !isAnswerChecked && userWords.length === 0)
              }
              className={cn(
                "w-full h-14 text-base font-bold shadow-sm transition-all uppercase tracking-wide rounded-xl",
                isAnswerChecked
                  ? isCorrect
                    ? "bg-success hover:bg-success/90 text-success-foreground"
                    : "bg-orange-500 hover:bg-orange-600 text-white"
                  : "bg-primary hover:bg-primary/90 text-primary-foreground disabled:bg-muted-foreground/30 disabled:text-muted-foreground disabled:border disabled:border-border",
              )}
            >
              {isAnswerChecked
                ? isCorrect
                  ? currentStepIndex === lessonSteps.length - 1
                    ? `🎓 ${t("lesson.continue")}`
                    : `${t("lesson.continue")} →`
                  : `↺ ${t("lesson.tryAgain")}`
                : needsVerification
                  ? t("lesson.verify")
                  : t("lesson.continue")}
            </Button>
          </div>
        </div>
      )}

      {/* EDI Helper Modal */}
      <QuizAIHelper
        question={currentStep.question || currentStep.title || ""}
        correctAnswer={
          currentStep.type === "quiz"
            ? currentStep.options?.find((o) => o.isCorrect)?.text || ""
            : currentStep.correctOrder?.join(" ") || ""
        }
        topic="lesson_help"
        isOpen={showEdiHelper}
        onClose={() => setShowEdiHelper(false)}
        wrongAttempts={wrongAttempts}
      />

      {/* Edi Motivation Popup - Shows motivational messages at progress milestones */}
      {activeMotivation?.show && (
        <EdiMotivation
          type={activeMotivation.type}
          message={activeMotivation.customMessage}
          onClose={closeMotivation}
          autoCloseSeconds={5}
          position="center"
        />
      )}
    </div>
  );
};

export default DayLesson;