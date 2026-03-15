import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useMemo, useEffect, useRef } from "react";
import { ArrowLeft, Mic, Check, Star, Trophy, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AIToolSelector, aiToolsConfig } from "@/components/lesson/AIToolSelector";
import { DaysProgressBar } from "@/components/lesson/DaysProgressBar";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useTranslatedChallengeContent } from "@/hooks/useTranslatedChallengeContent";
import confetti from "canvas-confetti";
import { ChallengeTutorial } from "@/components/onboarding";

const GoldenTrophyCard = ({ challengeName, completedCount, totalDays, t }: any) => {
  const progress = totalDays > 0 ? Math.round((completedCount / totalDays) * 100) : 0;

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-md transition-all hover:shadow-lg mb-6">
      {/* Soft decorative blurs */}
      <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-success/5 blur-3xl" />

      <div className="relative flex flex-col items-center text-center">
        <div className="relative mb-4">
          <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-b from-primary/80 to-primary shadow-lg ring-4 ring-primary/10">
            <Trophy className="h-8 w-8 text-primary-foreground" />
          </div>
          {progress === 100 && <Sparkles className="absolute -right-1 -top-1 h-5 w-5 text-primary animate-pulse" />}
        </div>

        <div className="space-y-1">
          <span className="inline-block rounded-full bg-primary/10 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary">
            {progress === 100 ? t("certificate.eliteCertificate") : t("certificate.masterCertificate")}
          </span>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            {progress === 100 ? t("certificate.conquered") : t("certificate.inProgress")}
          </h2>
          <p className="text-xs font-medium text-muted-foreground">{challengeName}</p>
        </div>

        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {t("certificate.daysCompleted", { completed: completedCount, total: totalDays, percent: progress })}
        </p>
      </div>
    </div>
  );
};

const Challenge = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { getChallengeName, getChallengeDescription, getDayTitle } = useTranslatedChallengeContent();

  const [activeTab, setActiveTab] = useState<string>("28days");
  const [selectedAITool, setSelectedAITool] = useState<string | null>(null);

  // REF para o Auto-Scroll
  const currentDayRef = useRef<HTMLDivElement>(null);

  const { data: challenge, isLoading: loadingChallenge } = useQuery({
    queryKey: ["challenge", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("challenges").select("*").eq("slug", slug).single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  const { data: challengeDays, isLoading: loadingDays } = useQuery({
    queryKey: ["challenge-days", challenge?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("challenge_days")
        .select("*, ai_tools(*)")
        .eq("challenge_id", challenge!.id)
        .order("day_number");
      if (error) throw error;
      return data;
    },
    enabled: !!challenge?.id,
  });

  const { data: userProgress } = useQuery({
    queryKey: ["user-challenge-progress", challenge?.id],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || !challenge) return null;
      const { data } = await supabase
        .from("user_challenge_progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("challenge_id", challenge.id)
        .maybeSingle();
      return data;
    },
    enabled: !!challenge?.id,
  });

  const { data: completedDaysData } = useQuery({
    queryKey: ["user-day-progress-full", challenge?.id],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || !challengeDays) return [];
      const dayIds = challengeDays.map((d) => d.id);

      const { data } = await supabase
        .from("user_day_progress")
        .select("challenge_day_id")
        .eq("user_id", user.id)
        .in("challenge_day_id", dayIds)
        .eq("completed", true);

      return data || [];
    },
    enabled: !!challengeDays?.length,
  });

  const completedDayIds = useMemo(() => completedDaysData?.map((d) => d.challenge_day_id) || [], [completedDaysData]);

  const calculatedCurrentDay = useMemo(() => {
    if (!challengeDays || !completedDayIds.length) return userProgress?.current_day || 1;

    const maxCompletedNumber = challengeDays.reduce((max, day) => {
      if (completedDayIds.includes(day.id)) {
        return Math.max(max, day.day_number);
      }
      return max;
    }, 0);

    return Math.max(maxCompletedNumber + 1, userProgress?.current_day || 1);
  }, [challengeDays, completedDayIds, userProgress]);

  const handleDayClick = (dayId: string) => navigate(`/aula/${dayId}`);
  const completedCount = completedDayIds.length;
  const totalDays = challengeDays?.length || 28;

  const ROW_HEIGHT = 160;
  const START_Y_OFFSET = 60;
  const VIEWBOX_WIDTH = 400;
  const CENTER_X = VIEWBOX_WIDTH / 2;
  const OFFSET_X = 80;

  const prevCompletedCount = useRef(completedCount);
  const [recentlyCompleted, setRecentlyCompleted] = useState<string | null>(null);

  // Confetti effect
  useEffect(() => {
    if (completedCount > prevCompletedCount.current && completedDayIds.length > 0) {
      const lastCompletedId = completedDayIds[completedDayIds.length - 1];
      setRecentlyCompleted(lastCompletedId);

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.4 },
        colors: ["hsl(252, 60%, 58%)", "hsl(152, 60%, 45%)", "#fbbf24"],
      });

      setTimeout(() => setRecentlyCompleted(null), 2000);
    }
    prevCompletedCount.current = completedCount;
  }, [completedCount, completedDayIds]);

  // EFEITO DE AUTO-SCROLL: Rola para o dia atual quando a página carrega
  useEffect(() => {
    if (!loadingDays && challengeDays && currentDayRef.current) {
      // Pequeno timeout para garantir que o layout renderizou
      setTimeout(() => {
        currentDayRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 500);
    }
  }, [loadingDays, calculatedCurrentDay, activeTab]);

  if (loadingChallenge || loadingDays)
    return (
      <div className="p-8">
        <Skeleton className="h-64 w-full" />
      </div>
    );
  if (!challenge) return <div className="text-center p-8">{t("challenge.notFound")}</div>;

  const svgHeight = (challengeDays?.length || 0) * ROW_HEIGHT + START_Y_OFFSET + 100;

  return (
    <div className="min-h-screen bg-background safe-area-inset relative">
      <ChallengeTutorial />
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} className="hover:bg-primary/10">
              <ArrowLeft className="text-foreground" />
            </Button>
            <div>
              <h1 className="font-semibold text-sm sm:text-base truncate text-foreground">
                {getChallengeName(challenge.slug, challenge.name)}
              </h1>
              <p className="text-xs text-muted-foreground">
                {completedCount}/{totalDays} {t("challenge.days")}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="relative max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="hidden lg:block">
            <div id="trophy-card" className="sticky top-20">
              <GoldenTrophyCard
                challengeName={getChallengeName(challenge.slug, challenge.name)}
                completedCount={completedCount}
                totalDays={totalDays}
                t={t}
              />
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="lg:hidden">
              <GoldenTrophyCard
                challengeName={getChallengeName(challenge.slug, challenge.name)}
                completedCount={completedCount}
                totalDays={totalDays}
                t={t}
              />
            </div>

            <Tabs id="challenge-tabs" value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="trails">{t("challenge.aiTrails")}</TabsTrigger>
                <TabsTrigger value="28days">{t("challenge.challenge28Days")}</TabsTrigger>
              </TabsList>

              <TabsContent value="trails" className="mt-4">
                <AIToolSelector
                  tools={Object.entries(aiToolsConfig).map(([slug, config]) => {
                    const toolDays = challengeDays?.filter((d) => d.ai_tools?.slug === slug) || [];
                    const completedToolDays = toolDays.filter((d) => completedDayIds.includes(d.id)).length;
                    const progress = toolDays.length > 0 ? Math.round((completedToolDays / toolDays.length) * 100) : 0;
                    return {
                      slug,
                      name: config.name,
                      progress,
                    };
                  })}
                  selectedSlug={selectedAITool}
                  onSelect={setSelectedAITool}
                />

                <div className="mt-6 space-y-3">
                  {Object.entries(aiToolsConfig).map(([toolSlug, config]) => {
                    const toolDays = challengeDays?.filter((d) => d.ai_tools?.slug === toolSlug) || [];
                    if (toolDays.length === 0) return null;

                    const completedToolDays = toolDays.filter((d) => completedDayIds.includes(d.id)).length;
                    const progress = Math.round((completedToolDays / toolDays.length) * 100);

                    return (
                      <div key={toolSlug} className="bg-card border rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-3">
                          {config.logo && <img src={config.logo} alt={config.name} className="w-10 h-10 rounded-lg" />}
                          <div className="flex-1">
                            <h3 className="font-semibold">{config.name}</h3>
                            <p className="text-xs text-muted-foreground">
                              {toolDays.length} {t("challenge.days")} • {progress}%
                            </p>
                          </div>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {toolDays.map((day) => {
                            const isCompleted = completedDayIds.includes(day.id);
                            const isCurrent = day.day_number === calculatedCurrentDay;
                            const isLocked = day.day_number > calculatedCurrentDay;

                            return (
                              <button
                                key={day.id}
                                onClick={() => !isLocked && handleDayClick(day.id)}
                                disabled={isLocked}
                                className={cn(
                                  "w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                                  isLocked
                                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                                    : isCompleted
                                      ? "bg-green-500 text-white"
                                      : isCurrent
                                        ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                                        : "bg-muted hover:bg-muted/80",
                                )}
                              >
                                {isCompleted ? <Check className="w-4 h-4" /> : day.day_number}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="28days" className="mt-4">
                <div id="days-progress-bar" className="mb-4">
                  <DaysProgressBar
                    days={
                      challengeDays?.map((d) => {
                        const isCompleted = completedDayIds.includes(d.id);
                        const isCurrent = d.day_number === calculatedCurrentDay;
                        let status: "completed" | "current" | "locked" | "unlocked" = "locked";

                        if (isCompleted) {
                          status = "completed";
                        } else if (isCurrent) {
                          status = "current";
                        } else if (d.day_number < calculatedCurrentDay) {
                          status = "completed";
                        }

                        return {
                          dayNumber: d.day_number,
                          status: status,
                        };
                      }) || []
                    }
                    currentDay={calculatedCurrentDay}
                    onDayClick={(dayNum) => {
                      const day = challengeDays?.find((d) => d.day_number === dayNum);
                      if (day) handleDayClick(day.id);
                    }}
                  />
                </div>

                <div className="relative flex justify-center w-full overflow-hidden">
                  {/* AJUSTE MOBILE: min-w-[400px] e w-[400px] fixo para não distorcer a linha no mobile */}
                  <div className="relative w-[400px] min-w-[400px]" style={{ height: `${svgHeight}px` }}>
                    <svg
                      className="absolute top-0 left-0 w-full h-full pointer-events-none"
                      viewBox={`0 0 ${VIEWBOX_WIDTH} ${svgHeight}`}
                    >
                      {/* Base trail - muted gray */}
                      <path
                        d={challengeDays
                          ?.map((_, i) => {
                            if (i === challengeDays.length - 1) return "";
                            const startY = START_Y_OFFSET + i * ROW_HEIGHT + 40;
                            const endY = START_Y_OFFSET + (i + 1) * ROW_HEIGHT + 40;
                            const isEven = i % 2 === 0;
                            const startX = isEven ? CENTER_X - OFFSET_X : CENTER_X + OFFSET_X;
                            const endX = isEven ? CENTER_X + OFFSET_X : CENTER_X - OFFSET_X;
                            return `M ${startX} ${startY} C ${startX} ${startY + 80}, ${endX} ${endY - 80}, ${endX} ${endY}`;
                          })
                          .join(" ")}
                        fill="none"
                        stroke="hsl(var(--muted))"
                        strokeWidth="6"
                        strokeLinecap="round"
                        opacity="0.3"
                      />

                      {/* Completed trail - green solid */}
                      {completedDayIds.length > 0 && (
                        <path
                          d={challengeDays
                            ?.slice(0, calculatedCurrentDay)
                            .map((_, i) => {
                              if (i === (challengeDays?.slice(0, calculatedCurrentDay).length || 0) - 1) return "";
                              const startY = START_Y_OFFSET + i * ROW_HEIGHT + 40;
                              const endY = START_Y_OFFSET + (i + 1) * ROW_HEIGHT + 40;
                              const isEven = i % 2 === 0;
                              const startX = isEven ? CENTER_X - OFFSET_X : CENTER_X + OFFSET_X;
                              const endX = isEven ? CENTER_X + OFFSET_X : CENTER_X - OFFSET_X;
                              return `M ${startX} ${startY} C ${startX} ${startY + 80}, ${endX} ${endY - 80}, ${endX} ${endY}`;
                            })
                            .join(" ")}
                          fill="none"
                          stroke="#22c55e"
                          strokeWidth="6"
                          strokeLinecap="round"
                        />
                      )}

                      {/* LED animation overlay on completed trail */}
                      {completedDayIds.length > 0 && (
                        <path
                          d={challengeDays
                            ?.slice(0, calculatedCurrentDay)
                            .map((_, i) => {
                              if (i === (challengeDays?.slice(0, calculatedCurrentDay).length || 0) - 1) return "";
                              const startY = START_Y_OFFSET + i * ROW_HEIGHT + 40;
                              const endY = START_Y_OFFSET + (i + 1) * ROW_HEIGHT + 40;
                              const isEven = i % 2 === 0;
                              const startX = isEven ? CENTER_X - OFFSET_X : CENTER_X + OFFSET_X;
                              const endX = isEven ? CENTER_X + OFFSET_X : CENTER_X - OFFSET_X;
                              return `M ${startX} ${startY} C ${startX} ${startY + 80}, ${endX} ${endY - 80}, ${endX} ${endY}`;
                            })
                            .join(" ")}
                          fill="none"
                          stroke="#4ade80"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeDasharray="8 24"
                          className="animate-led-flow"
                        />
                      )}
                    </svg>

                    {challengeDays?.map((day, index) => {
                      const toolSlug = day.ai_tools?.slug || "chatgpt";
                      const config = aiToolsConfig[toolSlug] || aiToolsConfig["chatgpt"];
                      const isCompleted = completedDayIds.includes(day.id);
                      const isCurrent = day.day_number === calculatedCurrentDay;
                      const isLocked = day.day_number > calculatedCurrentDay;
                      const isLeft = index % 2 === 0;
                      const isRecentlyCompleted = recentlyCompleted === day.id;

                      return (
                        <div
                          key={day.id}
                          id={isCurrent ? "current-day-card" : undefined}
                          ref={isCurrent ? currentDayRef : null}
                          className={cn(
                            "absolute w-28 flex flex-col items-center z-10",
                            isRecentlyCompleted && "animate-completion-burst",
                          )}
                          style={{
                            top: `${START_Y_OFFSET + index * ROW_HEIGHT}px`,
                            left: "50%",
                            marginLeft: isLeft ? `-${OFFSET_X + 56}px` : `${OFFSET_X - 56}px`,
                            animationDelay: `${index * 50}ms`,
                          }}
                        >
                          {isCompleted && (
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex gap-0.5 z-20">
                              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                              <Star className="w-4 h-4 text-amber-400 fill-amber-400 -mt-0.5" />
                              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                            </div>
                          )}

                          <button
                            onClick={() => !isLocked && handleDayClick(day.id)}
                            disabled={isLocked}
                            className={cn(
                              "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 relative",
                              "border-2",
                              isLocked
                                ? "bg-muted border-border cursor-not-allowed opacity-50"
                                : isCompleted
                                  ? "bg-success border-success text-white shadow-sm"
                                  : isCurrent
                                    ? "bg-primary border-primary text-white shadow-md ring-4 ring-primary/20"
                                    : "bg-card border-border hover:border-primary/50 text-foreground",
                            )}
                          >
                            <div className="w-8 h-8 flex items-center justify-center">
                              {isCompleted ? (
                                <Check className="w-5 h-5 stroke-[3]" />
                              ) : config.logo ? (
                                <img src={config.logo} className={cn("w-7 h-7 rounded-md", isLocked && "opacity-40")} alt="" />
                              ) : (
                                <Mic className="w-5 h-5" />
                              )}
                            </div>
                          </button>

                          <div
                            className={cn(
                              "mt-2 w-32 text-center bg-card/80 backdrop-blur-sm border border-border/50 px-2 py-1.5 rounded-lg shadow-sm transition-all duration-200",
                              isCurrent || isCompleted
                                ? "opacity-100 translate-y-0"
                                : "opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0",
                            )}
                          >
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                              {t("challenge.day")} {day.day_number}
                            </p>
                            <p className="text-xs font-medium text-foreground leading-tight line-clamp-2">
                              {getDayTitle(slug!, day.day_number, toolSlug, day.title)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Challenge;
