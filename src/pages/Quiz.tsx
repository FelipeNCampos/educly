import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ChevronRight, ChevronLeft, Sparkles, CheckCircle2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "@/components/LanguageSelector";
import { supabase } from "@/integrations/supabase/client";

interface Question {
  id: string;
  questionKey: string;
  options: { value: string; optKey: string; icon: string }[];
}

const questionsData: Question[] = [
  {
    id: "objetivo",
    questionKey: "onboardingQuiz.q1.question",
    options: [
      { value: "renda", optKey: "onboardingQuiz.q1.opt1", icon: "💰" },
      { value: "produtividade", optKey: "onboardingQuiz.q1.opt2", icon: "⚡" },
      { value: "negocios", optKey: "onboardingQuiz.q1.opt3", icon: "🚀" },
      { value: "automacao", optKey: "onboardingQuiz.q1.opt4", icon: "🤖" },
    ],
  },
  {
    id: "experiencia",
    questionKey: "onboardingQuiz.q2.question",
    options: [
      { value: "nenhuma", optKey: "onboardingQuiz.q2.opt1", icon: "🌱" },
      { value: "basica", optKey: "onboardingQuiz.q2.opt2", icon: "📱" },
      { value: "intermediaria", optKey: "onboardingQuiz.q2.opt3", icon: "💻" },
      { value: "avancada", optKey: "onboardingQuiz.q2.opt4", icon: "⚙️" },
    ],
  },
  {
    id: "tempo",
    questionKey: "onboardingQuiz.q3.question",
    options: [
      { value: "15min", optKey: "onboardingQuiz.q3.opt1", icon: "⏱️" },
      { value: "1h", optKey: "onboardingQuiz.q3.opt2", icon: "⏰" },
      { value: "2h", optKey: "onboardingQuiz.q3.opt3", icon: "🕐" },
      { value: "flexivel", optKey: "onboardingQuiz.q3.opt4", icon: "🔄" },
    ],
  },
  {
    id: "area",
    questionKey: "onboardingQuiz.q4.question",
    options: [
      { value: "marketing", optKey: "onboardingQuiz.q4.opt1", icon: "📈" },
      { value: "conteudo", optKey: "onboardingQuiz.q4.opt2", icon: "✍️" },
      { value: "desenvolvimento", optKey: "onboardingQuiz.q4.opt3", icon: "💻" },
      { value: "geral", optKey: "onboardingQuiz.q4.opt4", icon: "🌐" },
    ],
  },
];

const Quiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  // Check if quiz is already completed (from database or localStorage)
  useEffect(() => {
    const checkQuizStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          // Not logged in, redirect to auth
          navigate('/auth', { replace: true });
          return;
        }

        // Check database first for quiz completion
        let { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_quiz_completed')
          .eq('id', user.id)
          .maybeSingle();

        // Se perfil não existe, criar automaticamente
        if (!profile) {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({ 
              id: user.id, 
              full_name: user.user_metadata?.full_name || null,
              onboarding_quiz_completed: false 
            });
          
          if (insertError) {
            console.error('Error creating profile:', insertError);
          }
          
          // Continuar para quiz já que perfil foi criado agora
          setIsCheckingStatus(false);
          return;
        }

        if (profile?.onboarding_quiz_completed) {
          // Already completed in database
          localStorage.setItem("quizCompleted", "true");
          navigate("/dashboard", { replace: true });
          return;
        }

        // Also check localStorage as fallback
        const quizCompleted = localStorage.getItem("quizCompleted");
        const savedAnswers = localStorage.getItem("quizAnswers");

        if (quizCompleted === "true" || savedAnswers) {
          // Sync to database
          await supabase
            .from('profiles')
            .update({ onboarding_quiz_completed: true })
            .eq('id', user.id);
            
          navigate("/dashboard", { replace: true });
          return;
        }
      } catch (error) {
        console.error('Error checking quiz status:', error);
      } finally {
        setIsCheckingStatus(false);
      }
    };

    checkQuizStatus();
  }, [navigate]);

  const skipQuiz = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({ onboarding_quiz_completed: true })
          .eq('id', user.id);
      }
    } catch (error) {
      console.error('Error skipping quiz:', error);
    }
    
    localStorage.setItem("quizCompleted", "true");
    navigate("/dashboard", { replace: true });
  };

  const handleAnswer = (value: string) => {
    setAnswers({ ...answers, [questionsData[currentQuestion].id]: value });
  };

  const handleNext = async () => {
    if (!answers[questionsData[currentQuestion].id]) {
      toast({
        title: t("onboardingQuiz.selectOption"),
        description: t("onboardingQuiz.selectOptionDesc"),
        variant: "destructive",
      });
      return;
    }

    if (currentQuestion < questionsData.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Save to localStorage
      localStorage.setItem("quizAnswers", JSON.stringify(answers));
      localStorage.setItem("quizCompleted", "true");
      
      // Save to database
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('profiles')
            .update({ onboarding_quiz_completed: true })
            .eq('id', user.id);
        }
      } catch (error) {
        console.error('Error saving quiz completion:', error);
      }
      
      toast({
        title: t("onboardingQuiz.quizComplete"),
        description: t("onboardingQuiz.generatingPlan"),
      });
      
      setTimeout(() => navigate("/dashboard", { replace: true }), 1500);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const progress = ((currentQuestion + 1) / questionsData.length) * 100;

  // Show loading while checking status
  if (isCheckingStatus) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-6 right-6 z-50">
        <LanguageSelector />
      </div>
      {/* Background effects */}
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />

      <div className="w-full max-w-3xl space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/30">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">{t("onboardingQuiz.diagnosticBadge")}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold">
            {t("onboardingQuiz.personalizeTitle")}
            <span className="block text-primary neon-glow mt-2">{t("onboardingQuiz.personalizeSubtitle")}</span>
          </h1>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{t("onboardingQuiz.progress", { current: currentQuestion + 1, total: questionsData.length })}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-card rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500 neon-box-glow"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <Card className="glass p-8 space-y-6 animate-fade-in-up">
          <h2 className="text-2xl font-semibold text-center">{t(questionsData[currentQuestion].questionKey)}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {questionsData[currentQuestion].options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleAnswer(option.value)}
                className={`p-6 rounded-lg border-2 transition-all hover-lift text-left ${
                  answers[questionsData[currentQuestion].id] === option.value
                    ? "border-primary bg-primary/10 neon-border"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{option.icon}</span>
                  <span className="font-medium">{t(option.optKey)}</span>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex flex-col gap-4">
            <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => currentQuestion === 0 ? navigate("/dashboard") : handleBack()} 
              className="border-primary/30"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              {t("onboardingQuiz.backButton")}
            </Button>
            <Button onClick={handleNext} className="neon-border bg-primary text-primary-foreground hover:bg-primary/90">
              {currentQuestion === questionsData.length - 1
              ? t("onboardingQuiz.finishButton")
              : t("onboardingQuiz.nextButton")}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* BOTÃO DE PULAR (Para quem já fez) */}
          <div className="text-center mt-4">
            <Button 
              variant="ghost" 
              onClick={skipQuiz}
              className="text-xs text-muted-foreground hover:text-primary"
            >
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Já fiz o quiz antes? Pular para minha trilha
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quiz;