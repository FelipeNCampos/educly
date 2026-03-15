import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, Mic, Check, Star, Trophy, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { AIToolPopup } from "@/components/challenge/AIToolPopup";
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

  const [selectedAITool, setSelectedAITool] = useState<string | null>(null);
  const [popupToolSlug, setPopupToolSlug] = useState<string | null>(null);
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
      const { data: { user } } = await supabase.auth.getUser();
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
      const { data: { user } } = await supabase.auth.getUser();
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
      if (completedDayIds.includes(day.id)) return Math.max(max, day.day_number);
      return max;
    }, 0);
    return Math.max(maxCompletedNumber + 1, userProgress?.current_day || 1);
  }, [challengeDays, completedDayIds, userProgress]);

  const handleDayClick = async (dayId: string) => {
    // Refresh token before starting lesson to ensure 4h validity
    const { refreshSession } = await import("@/hooks/useRefreshSession");
    await refreshSession();
    navigate(`/aula/${dayId}`);
  };
  const completedCount = completedDayIds.length;
  const totalDays = challengeDays?.length || 28;

  const ROW_HEIGHT = 160;
  const START_Y_OFFSET = 60;
  const VIEWBOX_WIDTH = 400;
  const CENTER_X = VIEWBOX_WIDTH / 2;
  const OFFSET_X = 80;

  const prevCompletedCount = useRef(completedCount);
  const [recentlyCompleted, setRecentlyCompleted] = useState<string | null>(null);

  useEffect(() => {
    if (completedCount > prevCompletedCount.current && completedDayIds.length > 0) {
      const lastCompletedId = completedDayIds[completedDayIds.length - 1];
      setRecentlyCompleted(lastCompletedId);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.4 },
        colors: ["#22c55e", "#6366f1", "#fbbf24"],
      });
      setTimeout(() => setRecentlyCompleted(null), 2000);
    }
    prevCompletedCount.current = completedCount;
  }, [completedCount, completedDayIds]);

  useEffect(() => {
    if (!loadingDays && challengeDays && currentDayRef.current) {
      setTimeout(() => {
        currentDayRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 500);
    }
  }, [loadingDays, calculatedCurrentDay]);

  if (loadingChallenge || loadingDays) return <div className="p-8"><Skeleton className="h-64 w-full" /></div>;
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

            {/* AI Tool Progress Cards */}
            <div id="challenge-tabs" className="mb-6">
              <AIToolSelector
                tools={Object.entries(aiToolsConfig).map(([slug, config]) => {
                  const toolDays = challengeDays?.filter((d) => d.ai_tools?.slug === slug) || [];
                  const completedToolDays = toolDays.filter((d) => completedDayIds.includes(d.id)).length;
                  const progress = toolDays.length > 0 ? Math.round((completedToolDays / toolDays.length) * 100) : 0;
                  return { slug, name: config.name, progress };
                })}
                selectedSlug={selectedAITool}
                onSelect={(slug) => {
                  setSelectedAITool(slug);
                  setPopupToolSlug(slug);
                }}
              />
            </div>

            {/* Days Progress Bar */}
            <div id="days-progress-bar" className="mb-4">
              <DaysProgressBar
                days={challengeDays?.map((d) => {
                  const isCompleted = completedDayIds.includes(d.id);
                  const isCurrent = d.day_number === calculatedCurrentDay;
                  let status: "completed" | "current" | "locked" | "unlocked" = isCompleted ? "completed" : isCurrent ? "current" : d.day_number < calculatedCurrentDay ? "completed" : "locked";
                  return { dayNumber: d.day_number, status };
                }) || []}
                currentDay={calculatedCurrentDay}
                onDayClick={(dayNum) => {
                  const day = challengeDays?.find((d) => d.day_number === dayNum);
                  if (day) handleDayClick(day.id);
                }}
              />
            </div>

            {/* Zig-zag path */}
            <div className="relative flex justify-center w-full overflow-hidden">
              <div className="relative w-[400px] min-w-[400px]" style={{ height: `${svgHeight}px` }}>
                <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" viewBox={`0 0 ${VIEWBOX_WIDTH} ${svgHeight}`}>
                  <path
                    d={challengeDays?.map((_, i) => {
                      if (i === challengeDays.length - 1) return "";
                      const startY = START_Y_OFFSET + i * ROW_HEIGHT + 40;
                      const endY = START_Y_OFFSET + (i + 1) * ROW_HEIGHT + 40;
                      const isEven = i % 2 === 0;
                      const startX = isEven ? CENTER_X - OFFSET_X : CENTER_X + OFFSET_X;
                      const endX = isEven ? CENTER_X + OFFSET_X : CENTER_X - OFFSET_X;
                      return `M ${startX} ${startY} C ${startX} ${startY + 80}, ${endX} ${endY - 80}, ${endX} ${endY}`;
                    }).join(" ")}
                    fill="none"
                    stroke="hsl(var(--muted))"
                    strokeWidth="6"
                    strokeLinecap="round"
                    opacity="0.3"
                  />

                  {completedDayIds.length > 0 && (
                    <path
                      d={challengeDays?.slice(0, calculatedCurrentDay).map((_, i) => {
                        if (i === (challengeDays?.slice(0, calculatedCurrentDay).length || 0) - 1) return "";
                        const startY = START_Y_OFFSET + i * ROW_HEIGHT + 40;
                        const endY = START_Y_OFFSET + (i + 1) * ROW_HEIGHT + 40;
                        const isEven = i % 2 === 0;
                        const startX = isEven ? CENTER_X - OFFSET_X : CENTER_X + OFFSET_X;
                        const endX = isEven ? CENTER_X + OFFSET_X : CENTER_X - OFFSET_X;
                        return `M ${startX} ${startY} C ${startX} ${startY + 80}, ${endX} ${endY - 80}, ${endX} ${endY}`;
                      }).join(" ")}
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="6"
                      strokeLinecap="round"
                      opacity="1"
                    />
                  )}

                  {completedDayIds.length > 0 && (
                    <path
                      d={challengeDays?.slice(0, calculatedCurrentDay).map((_, i) => {
                        if (i === (challengeDays?.slice(0, calculatedCurrentDay).length || 0) - 1) return "";
                        const startY = START_Y_OFFSET + i * ROW_HEIGHT + 40;
                        const endY = START_Y_OFFSET + (i + 1) * ROW_HEIGHT + 40;
                        const isEven = i % 2 === 0;
                        const startX = isEven ? CENTER_X - OFFSET_X : CENTER_X + OFFSET_X;
                        const endX = isEven ? CENTER_X + OFFSET_X : CENTER_X - OFFSET_X;
                        return `M ${startX} ${startY} C ${startX} ${startY + 80}, ${endX} ${endY - 80}, ${endX} ${endY}`;
                      }).join(" ")}
                      fill="none"
                      stroke="#4ade80"
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeDasharray="10 20"
                      className="animate-led-flow drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]"
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

                  return (
                    <div
                      key={day.id}
                      ref={isCurrent ? currentDayRef : null}
                      className={cn("absolute w-28 flex flex-col items-center z-10", recentlyCompleted === day.id && "animate-completion-burst")}
                      style={{
                        top: `${START_Y_OFFSET + index * ROW_HEIGHT}px`,
                        left: "50%",
                        marginLeft: isLeft ? `-${OFFSET_X + 56}px` : `${OFFSET_X - 56}px`,
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
                          "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 relative border-4",
                          isLocked
                            ? "bg-muted border-border cursor-not-allowed opacity-50"
                            : isCompleted
                              ? "bg-[#22c55e] border-[#16a34a] text-white shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                              : isCurrent
                                ? "bg-primary border-primary/80 text-primary-foreground shadow-lg ring-4 ring-primary/20"
                                : "bg-card border-border hover:border-primary/50"
                        )}
                      >
                        <div className="w-8 h-8 flex items-center justify-center">
                          {isCompleted ? <Check className="w-6 h-6 stroke-[4]" /> : <span className="font-black text-lg">{day.day_number}</span>}
                        </div>
                      </button>

                      <div className={cn(
                        "mt-3 w-32 text-center bg-card border border-border px-2 py-2 rounded-xl shadow-md transition-all",
                        (isCurrent || isCompleted) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                      )}>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t("challenge.day")} {day.day_number}</p>
                        <p className="text-xs font-bold text-foreground leading-tight line-clamp-2">{getDayTitle(slug!, day.day_number, toolSlug, day.title)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Tool Popup */}
            <AIToolPopup
              toolSlug={popupToolSlug}
              challengeId={challenge?.id || null}
              overallProgress={totalDays > 0 ? Math.round((completedCount / totalDays) * 100) : 0}
              progress={(() => {
                if (!popupToolSlug) return 0;
                const toolDays = challengeDays?.filter((d) => d.ai_tools?.slug === popupToolSlug) || [];
                const completedToolDays = toolDays.filter((d) => completedDayIds.includes(d.id)).length;
                return toolDays.length > 0 ? Math.round((completedToolDays / toolDays.length) * 100) : 0;
              })()}
              completedDays={(() => {
                if (!popupToolSlug) return 0;
                const toolDays = challengeDays?.filter((d) => d.ai_tools?.slug === popupToolSlug) || [];
                return toolDays.filter((d) => completedDayIds.includes(d.id)).length;
              })()}
              totalDays={(() => {
                if (!popupToolSlug) return 0;
                return challengeDays?.filter((d) => d.ai_tools?.slug === popupToolSlug).length || 0;
              })()}
              isOpen={!!popupToolSlug}
              onClose={() => setPopupToolSlug(null)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Challenge;
