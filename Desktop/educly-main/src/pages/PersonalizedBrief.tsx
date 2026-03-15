import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface BriefQuestion {
  id: string;
  question: string;
  options: { value: string; label: string; icon?: string }[];
}

const PersonalizedBrief = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [freeText, setFreeText] = useState("");
  const [isCheckingExisting, setIsCheckingExisting] = useState(true);

  // Check if user already has a personalized trail or already completed the quiz
  useEffect(() => {
    const checkExistingTrail = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/auth', { replace: true });
          return;
        }

        // Check for existing active personalized plan using maybeSingle (no error if not found)
        const { data: existingPlan, error } = await supabase
          .from('personalized_plans')
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('Error checking existing plan:', error);
          setIsCheckingExisting(false);
          return;
        }

        if (existingPlan) {
          // User already has a trail, redirect directly
          navigate(`/trilha-personalizada/${existingPlan.id}`, { replace: true });
          return;
        }

        // Also check if personalized trail quiz was completed in profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('personalized_trail_quiz_completed')
          .eq('id', user.id)
          .maybeSingle();

        // If quiz completed but no plan exists, allow them to take quiz again
        // (This shouldn't normally happen, but handle edge case)
        
        setIsCheckingExisting(false);
      } catch (error) {
        console.error('Error checking existing trail:', error);
        setIsCheckingExisting(false);
      }
    };

    checkExistingTrail();
  }, [navigate]);

  const questions: BriefQuestion[] = [
    {
      id: "goal",
      question: t('personalizedBrief.questions.goal'),
      options: [
        { value: "work", label: t('personalizedBrief.options.work'), icon: "💼" },
        { value: "extra_income", label: t('personalizedBrief.options.extraIncome'), icon: "💰" },
        { value: "business", label: t('personalizedBrief.options.business'), icon: "🚀" },
        { value: "curiosity", label: t('personalizedBrief.options.curiosity'), icon: "🧠" },
      ]
    },
    {
      id: "level",
      question: t('personalizedBrief.questions.level'),
      options: [
        { value: "never", label: t('personalizedBrief.options.never'), icon: "🌱" },
        { value: "basic", label: t('personalizedBrief.options.basic'), icon: "🌿" },
        { value: "intermediate", label: t('personalizedBrief.options.intermediate'), icon: "🌳" },
      ]
    },
    {
      id: "time",
      question: t('personalizedBrief.questions.time'),
      options: [
        { value: "15min", label: t('personalizedBrief.options.15min'), icon: "⏱️" },
        { value: "30min", label: t('personalizedBrief.options.30min'), icon: "⏰" },
        { value: "1hour", label: t('personalizedBrief.options.1hour'), icon: "🕐" },
      ]
    },
    {
      id: "interest",
      question: t('personalizedBrief.questions.interest'),
      options: [
        { value: "text", label: t('personalizedBrief.options.text'), icon: "✍️" },
        { value: "code", label: t('personalizedBrief.options.code'), icon: "💻" },
        { value: "image", label: t('personalizedBrief.options.image'), icon: "🎨" },
        { value: "video", label: t('personalizedBrief.options.video'), icon: "🎬" },
      ]
    },
    {
      id: "specific_project",
      question: t('personalizedBrief.questions.specificProject'),
      options: [
        { value: "yes", label: t('personalizedBrief.options.yes'), icon: "✅" },
        { value: "no", label: t('personalizedBrief.options.no'), icon: "🔍" },
      ]
    }
  ];

  const handleSelectOption = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    } else {
      navigate(-1);
    }
  };

  const handleGenerateTrail = async () => {
    setIsGenerating(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: t('common.error'),
          description: t('personalizedBrief.loginRequired'),
          variant: "destructive"
        });
        navigate('/auth');
        return;
      }

      const brief = {
        ...answers,
        freeText: answers.specific_project === "yes" ? freeText : null,
        language: navigator.language || 'pt-BR'
      };

      // Call edge function to generate personalized trail
      const { data, error } = await supabase.functions.invoke('generate-personalized-trail', {
        body: { brief }
      });

      if (error) throw error;

      // Save to personalized_plans
      const { data: planData, error: saveError } = await supabase
        .from('personalized_plans')
        .insert({
          user_id: user.id,
          brief: brief,
          generated_plan: data.plan,
          status: 'active'
        })
        .select()
        .single();

      if (saveError) throw saveError;

      // Mark personalized trail quiz as completed in profile
      await supabase
        .from('profiles')
        .update({ personalized_trail_quiz_completed: true })
        .eq('id', user.id);

      toast({
        title: t('personalizedBrief.success'),
        description: t('personalizedBrief.successDescription')
      });

      // Navigate to the personalized challenge
      navigate(`/trilha-personalizada/${planData.id}`, { replace: true });

    } catch (error) {
      console.error('Error generating trail:', error);
      toast({
        title: t('common.error'),
        description: t('personalizedBrief.errorGenerating'),
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const currentQ = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;
  const showFreeText = currentQ.id === "specific_project" && answers.specific_project === "yes";
  const canProceed = answers[currentQ.id] && (!showFreeText || freeText.trim().length > 0);
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  // Show loading while checking for existing trail
  if (isCheckingExisting) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background safe-area-inset">
      {/* Header with Progress */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            
            <div className="flex-1">
              <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            
            <span className="text-sm font-medium text-muted-foreground">
              {currentQuestion + 1}/{questions.length}
            </span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {t('personalizedBrief.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('personalizedBrief.subtitle')}
          </p>
        </div>

        {/* Question */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-foreground text-center">
            {currentQ.question}
          </h2>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelectOption(currentQ.id, option.value)}
                className={cn(
                  "w-full p-4 rounded-xl border-2 text-left transition-all",
                  "hover:border-primary/50 hover:bg-primary/5",
                  answers[currentQ.id] === option.value
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card"
                )}
              >
                <div className="flex items-center gap-3">
                  {option.icon && (
                    <span className="text-2xl">{option.icon}</span>
                  )}
                  <span className="font-medium text-foreground">{option.label}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Free text input for specific project */}
          {showFreeText && (
            <div className="space-y-2 animate-fade-in">
              <label className="text-sm font-medium text-foreground">
                {t('personalizedBrief.describeProject')}
              </label>
              <textarea
                value={freeText}
                onChange={(e) => setFreeText(e.target.value)}
                placeholder={t('personalizedBrief.projectPlaceholder')}
                className="w-full p-4 rounded-xl border-2 border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none min-h-[120px] resize-none"
              />
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-end pt-4">
            {isLastQuestion ? (
              <Button
                onClick={handleGenerateTrail}
                disabled={!canProceed || isGenerating}
                className="gap-2"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('personalizedBrief.generating')}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    {t('personalizedBrief.generateTrail')}
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!canProceed}
                className="gap-2"
                size="lg"
              >
                {t('common.next')}
                <ChevronRight className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalizedBrief;
