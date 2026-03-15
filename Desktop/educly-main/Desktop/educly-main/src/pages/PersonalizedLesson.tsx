import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, ChevronRight, CheckCircle2, Sparkles, Target, Lightbulb, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";
import ReactMarkdown from 'react-markdown';
import { useTranslatedTrailContent } from "@/hooks/useTranslatedTrailContent";

// Import AI tool logos
import chatgptLogo from "@/assets/ai-logos/chatgpt.png";
import claudeLogo from "@/assets/ai-logos/claude.png";
import deepseekLogo from "@/assets/ai-logos/deepseek.png";
import geminiLogo from "@/assets/ai-logos/gemini.png";
import nanobananLogo from "@/assets/ai-logos/nanobanana.png";
import lovableLogo from "@/assets/ai-logos/lovable.png";
import captionsLogo from "@/assets/ai-logos/captions.png";

interface GeneratedDay {
  day: number;
  tool: string;
  focus: string;
  exercise: string;
}

const PersonalizedLesson = () => {
  const { planId, day } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const dayNumber = parseInt(day || "1");

  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Tool logos mapping
  const toolLogos: Record<string, string> = {
    chatgpt: chatgptLogo,
    claude: claudeLogo,
    deepseek: deepseekLogo,
    gemini: geminiLogo,
    nanobanana: nanobananLogo,
    lovable: lovableLogo,
    captions: captionsLogo,
    elevenlabs: claudeLogo
  };

  const toolDisplayNames: Record<string, string> = {
    chatgpt: "ChatGPT",
    claude: "Claude",
    deepseek: "DeepSeek",
    gemini: "Gemini",
    nanobanana: "NanoBanana",
    lovable: "Lovable",
    captions: "Captions",
    elevenlabs: "ElevenLabs"
  };

  // Fetch plan data
  const { data: plan, isLoading } = useQuery({
    queryKey: ['personalized-plan', planId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('personalized_plans')
        .select('*')
        .eq('id', planId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!planId
  });

  const generatedPlan = (plan?.generated_plan as unknown as GeneratedDay[]) || [];
  const planBrief = (plan?.brief as Record<string, unknown>) || {};
  const originalLanguage = (planBrief.language as string) || 'pt';

  // Use translated content hook
  const { translatedPlan, isTranslating } = useTranslatedTrailContent(
    generatedPlan,
    originalLanguage,
    planId
  );

  // Get current day data from translated plan
  const displayPlan = translatedPlan.length > 0 ? translatedPlan : generatedPlan;
  const currentDayData = displayPlan.find(d => d.day === dayNumber);
  const toolLogo = currentDayData ? toolLogos[currentDayData.tool.toLowerCase()] : null;
  const toolName = currentDayData ? (toolDisplayNames[currentDayData.tool.toLowerCase()] || currentDayData.tool) : "";

  // Generate lesson steps from the day's personalized data
  const lessonSteps = currentDayData ? [
    {
      type: 'intro',
      icon: <Sparkles className="w-6 h-6" />,
      title: `${t('challenge.day')} ${dayNumber}: ${currentDayData.focus}`,
      content: `${t('personalizedLesson.taskIntro', { tool: toolName, focus: currentDayData.focus })}\n\n${t('personalizedLesson.taskDescription')}`
    },
    {
      type: 'task',
      icon: <Target className="w-6 h-6" />,
      title: t('personalizedLesson.todayTask'),
      content: `📝 **${t('personalizedLesson.exerciseTitle')}**\n\n${currentDayData.exercise}\n\n💡 **${t('personalizedLesson.exerciseNote')}**`
    },
    {
      type: 'complete',
      icon: <Lightbulb className="w-6 h-6" />,
      title: t('personalizedLesson.markComplete'),
      content: t('personalizedLesson.completeNote')
    }
  ] : [];

  // Mark day as complete - update the personalized_plans table with progress
  const completeDayMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get current plan to update its progress
      const { data: currentPlan, error: fetchError } = await supabase
        .from('personalized_plans')
        .select('brief')
        .eq('id', planId)
        .single();

      if (fetchError) throw fetchError;

      // Store completed days in the brief object
      const currentBrief = (currentPlan?.brief as Record<string, unknown>) || {};
      const completedDays = (currentBrief.completedDays as number[]) || [];
      
      if (!completedDays.includes(dayNumber)) {
        completedDays.push(dayNumber);
      }

      const { error } = await supabase
        .from('personalized_plans')
        .update({
          brief: { ...currentBrief, completedDays },
          updated_at: new Date().toISOString()
        })
        .eq('id', planId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personalized-plan', planId] });
      queryClient.invalidateQueries({ queryKey: ['personalized-day-progress', planId] });
      setCompleted(true);
      
      // Celebration confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    },
    onError: (error) => {
      console.error('Error completing day:', error);
    }
  });

  // Scroll to current step
  useEffect(() => {
    if (stepRefs.current[currentStep]) {
      stepRefs.current[currentStep]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentStep]);

  const handleContinue = () => {
    if (currentStep < lessonSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeDayMutation.mutate();
    }
  };

  const handleNextDay = () => {
    if (dayNumber < 28) {
      navigate(`/aula-personalizada/${planId}/${dayNumber + 1}`);
      setCurrentStep(0);
      setCompleted(false);
    } else {
      navigate(`/trilha-personalizada/${planId}`);
    }
  };

  if (isLoading || isTranslating) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <div className="text-muted-foreground">
            {isTranslating ? t('common.translating') : t('common.loading')}
          </div>
        </div>
      </div>
    );
  }

  if (!currentDayData) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">
          {t('dayLesson.notFound')}
        </p>
        <Button onClick={() => navigate(`/trilha-personalizada/${planId}`)}>
          {t('common.back')}
        </Button>
      </div>
    );
  }

  // Completed screen
  if (completed) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/10 to-background flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {t('personalizedLesson.dayComplete')} 🎉
          </h1>
          <p className="text-muted-foreground mb-6">
            {t('personalizedLesson.greatWork')}
          </p>
          
          <div className="space-y-3">
            {dayNumber < 28 && (
              <Button onClick={handleNextDay} className="w-full">
                {t('personalizedLesson.nextDay')}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={() => navigate(`/trilha-personalizada/${planId}`)}
              className="w-full"
            >
              {t('personalizedLesson.viewTrail')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const toolColors: Record<string, string> = {
    chatgpt: "#10A37F",
    claude: "#D97757",
    deepseek: "#4F46E5",
    gemini: "#4285F4",
    nanobanana: "#F59E0B",
    lovable: "#9333EA",
    captions: "#EC4899",
    elevenlabs: "#000000"
  };

  const toolColor = toolColors[currentDayData.tool.toLowerCase()] || "#6366F1";

  return (
    <div className="min-h-screen bg-background safe-area-inset">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Tool Logo */}
              {toolLogo && (
                <img 
                  src={toolLogo} 
                  alt={toolName}
                  className="w-8 h-8 rounded-lg object-contain"
                />
              )}
              <div>
                <span className="text-sm font-medium" style={{ color: toolColor }}>
                  {toolName}
                </span>
                <span className="text-muted-foreground text-sm"> • {t('challenge.day')} {dayNumber}</span>
              </div>
            </div>
            <button
              onClick={() => navigate(`/trilha-personalizada/${planId}`)}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{ 
                width: `${((currentStep + 1) / lessonSteps.length) * 100}%`,
                backgroundColor: toolColor
              }}
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="space-y-6">
          {lessonSteps.map((step, index) => {
            const isVisible = index <= currentStep;
            const isCurrent = index === currentStep;

            if (!isVisible) return null;

            return (
              <div
                key={index}
                ref={el => stepRefs.current[index] = el}
                className={cn(
                  "p-6 rounded-xl border-2 transition-all",
                  isCurrent 
                    ? "border-primary bg-card shadow-lg" 
                    : "border-border bg-card/50 opacity-70"
                )}
              >
                {/* Step header with icon */}
                <div className="flex items-center gap-3 mb-4">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: step.type === 'complete' ? '#10B981' : toolColor }}
                  >
                    {step.icon}
                  </div>
                  <h2 className="text-xl font-bold text-foreground flex-1">
                    {step.title}
                  </h2>
                </div>

                <div className="prose prose-sm max-w-none text-foreground [&_p]:mb-3 [&_strong]:font-bold [&_strong]:text-primary [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5">
                  <ReactMarkdown>
                    {step.content.replace(/\\n/g, '\n').replace(/\\"/g, '"')}
                  </ReactMarkdown>
                </div>

                {isCurrent && (
                  <Button
                    onClick={handleContinue}
                    className="mt-6 w-full h-12 text-base font-semibold"
                    style={{ 
                      backgroundColor: step.type === 'complete' ? '#10B981' : toolColor 
                    }}
                  >
                    {step.type === 'complete' 
                      ? t('personalizedLesson.complete')
                      : t('personalizedLesson.continue')
                    }
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PersonalizedLesson;
