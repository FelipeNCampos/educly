import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Lock, CheckCircle2, PlayCircle, Sparkles, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
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

const PersonalizedTrail = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const getLabel = (key: string, fallback: string) => {
    const translated = t(key);
    return translated === key ? fallback : translated;
  };

  const weekLabel = getLabel("challenge.week", "Semana");
  const dayLabel = getLabel("challenge.day", "Dia");

  // Fetch personalized plan
  const { data: plan, isLoading } = useQuery({
    queryKey: ["personalized-plan", planId],
    queryFn: async () => {
      const { data, error } = await supabase.from("personalized_plans").select("*").eq("id", planId).single();

      if (error) throw error;
      return data;
    },
    enabled: !!planId,
  });

  const generatedPlan = (plan?.generated_plan as unknown as GeneratedDay[]) || [];
  const planBrief = (plan?.brief as Record<string, unknown>) || {};
  const completedDaysArray = (planBrief.completedDays as number[]) || [];
  const originalLanguage = (planBrief.language as string) || 'pt';

  // Use translated content hook
  const { translatedPlan, isTranslating } = useTranslatedTrailContent(
    generatedPlan,
    originalLanguage,
    planId
  );

  const completedDays = completedDaysArray.length;
  const currentDay = completedDays + 1;

  const toolLogos: Record<string, string> = {
    chatgpt: chatgptLogo,
    claude: claudeLogo,
    deepseek: deepseekLogo,
    gemini: geminiLogo,
    nanobanana: nanobananLogo,
    lovable: lovableLogo,
    captions: captionsLogo,
    elevenlabs: claudeLogo,
  };

  const toolColors: Record<string, string> = {
    chatgpt: "#10A37F",
    claude: "#D97757",
    deepseek: "#4F46E5",
    gemini: "#4285F4",
    nanobanana: "#F59E0B",
    lovable: "#9333EA",
    captions: "#EC4899",
    elevenlabs: "#000000",
  };

  const toolDisplayNames: Record<string, string> = {
    chatgpt: "ChatGPT",
    claude: "Claude",
    deepseek: "DeepSeek",
    gemini: "Gemini",
    nanobanana: "NanoBanana",
    lovable: "Lovable",
    captions: "Captions",
    elevenlabs: "ElevenLabs",
  };

  const handleDayClick = (day: GeneratedDay) => {
    if (day.day > currentDay) return;
    navigate(`/aula-personalizada/${planId}/${day.day}`);
  };

  if (isLoading || isTranslating) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <div className="text-muted-foreground">
            {isTranslating ? t("common.translating") : t("common.loading")}
          </div>
        </div>
      </div>
    );
  }

  if (!plan || generatedPlan.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">{t("personalizedTrail.notFound")}</p>
        <Button onClick={() => navigate("/trilha-personalizada")}>{t("personalizedTrail.createNew")}</Button>
      </div>
    );
  }

  // Use translated plan for display
  const displayPlan = translatedPlan.length > 0 ? translatedPlan : generatedPlan;
  
  const weeks = [
    { label: `${weekLabel} 1`, days: displayPlan.slice(0, 7) },
    { label: `${weekLabel} 2`, days: displayPlan.slice(7, 14) },
    { label: `${weekLabel} 3`, days: displayPlan.slice(14, 21) },
    { label: `${weekLabel} 4`, days: displayPlan.slice(21, 28) },
  ];

  return (
    <div className="min-h-screen bg-background safe-area-inset">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-muted-foreground" />
            </button>

            <div className="flex-1">
              <h1 className="font-bold text-foreground flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                {t("personalizedTrail.title")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t("personalizedTrail.progress", { completed: completedDays, total: 28 })}
              </p>
            </div>
          </div>

          <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-500"
              style={{ width: `${(completedDays / 28) * 100}%` }}
            />
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="space-y-8">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex}>
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                  {weekIndex + 1}
                </span>
                {week.label}
              </h2>

              <div className="grid gap-3">
                {week.days.map((day) => {
                  const isCompleted = completedDaysArray.includes(day.day);
                  const isActive = day.day === currentDay;
                  const isLocked = day.day > currentDay && !isCompleted;
                  const toolColor = toolColors[day.tool.toLowerCase()] || "#6366F1";
                  const toolLogo = toolLogos[day.tool.toLowerCase()];
                  const toolName = toolDisplayNames[day.tool.toLowerCase()] || day.tool;

                  // Usar diretamente os dados gerados pela IA no idioma correto
                  const translatedTitle = day.focus;
                  const translatedExercise = day.exercise;

                  return (
                    <button
                      key={day.day}
                      onClick={() => handleDayClick(day)}
                      disabled={isLocked}
                      className={cn(
                        "w-full p-4 rounded-xl border-2 text-left transition-all",
                        isCompleted && "border-green-500/30 bg-green-500/5",
                        isActive && "border-primary bg-primary/5 ring-2 ring-primary/20",
                        isLocked && "border-border bg-muted/30 opacity-60 cursor-not-allowed",
                        !isLocked && !isCompleted && !isActive && "border-border bg-card hover:border-primary/50",
                      )}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center font-bold flex-shrink-0",
                            isCompleted && "bg-green-500 text-white",
                            isActive && "bg-primary text-white",
                            isLocked && "bg-muted text-muted-foreground",
                            !isCompleted && !isActive && !isLocked && "text-white",
                          )}
                          style={{ backgroundColor: !isCompleted && !isLocked && !isActive ? toolColor : undefined }}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-6 h-6" />
                          ) : isLocked ? (
                            <Lock className="w-5 h-5" />
                          ) : isActive ? (
                            <PlayCircle className="w-6 h-6" />
                          ) : (
                            day.day
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {toolLogo && !isLocked && (
                              <img src={toolLogo} alt={toolName} className="w-5 h-5 rounded object-contain" />
                            )}
                            <span className="text-sm font-medium" style={{ color: isLocked ? undefined : toolColor }}>
                              {toolName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              • {dayLabel} {day.day}
                            </span>
                          </div>

                          {/* TÍTULO TRADUZIDO AQUI */}
                          <p
                            className={cn(
                              "font-medium line-clamp-2",
                              isLocked ? "text-muted-foreground" : "text-foreground",
                            )}
                          >
                            {translatedTitle}
                          </p>

                          {/* EXERCÍCIO TRADUZIDO AQUI */}
                          {!isLocked && (
                            <p className="text-sm text-muted-foreground line-clamp-1 mt-1">📝 {translatedExercise}</p>
                          )}
                        </div>

                        {isActive && (
                          <div className="text-primary flex-shrink-0">
                            <PlayCircle className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PersonalizedTrail;
