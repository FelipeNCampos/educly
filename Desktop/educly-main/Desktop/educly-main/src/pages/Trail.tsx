import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Play, Trophy } from "lucide-react";
import { DayCard } from "@/components/DayCard";
import { ProgressBar28Days } from "@/components/ProgressBar28Days";
import { useTrailProgress } from "@/hooks/useTrailProgress";
import { useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { useTranslatedContent } from "@/hooks/useTranslatedContent";

const Trail = () => {
  const { aiSlug } = useParams<{ aiSlug: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { getToolDescription, getTranslatedPhases } = useTranslatedContent();

  const { aiTool, phases, isLoading, isPhaseUnlocked, isPhaseCompleted } = useTrailProgress(aiSlug || "");

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
      }
    };
    checkAuth();
  }, [navigate]);

  const completedDays = useMemo(() => {
    if (!phases) return [];
    return phases.filter((p) => isPhaseCompleted(p.id)).map((p) => p.phase_number);
  }, [phases, isPhaseCompleted]);

  const currentDay = useMemo(() => {
    if (!phases) return 1;
    for (const phase of phases) {
      if (!isPhaseCompleted(phase.id) && isPhaseUnlocked(phase.phase_number)) {
        return phase.phase_number;
      }
    }
    return phases.length;
  }, [phases, isPhaseCompleted, isPhaseUnlocked]);

  const handleDayClick = (dayNumber: number) => {
    const phase = phases?.find((p) => p.phase_number === dayNumber);
    if (phase && isPhaseUnlocked(dayNumber)) {
      navigate(`/licao/${phase.id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">{t("trail.loading")}</p>
        </div>
      </div>
    );
  }

  if (!aiTool || !phases || phases.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{t("trail.notFound")}</h2>
          <Button onClick={() => navigate("/dashboard")}>{t("trail.backButton")}</Button>
        </div>
      </div>
    );
  }

  const translatedPhases = getTranslatedPhases(aiSlug || "", phases);
  const completedCount = completedDays.length;
  const totalDays = phases.length;
  const isCompleted = completedCount === totalDays;

  const getPhaseStatus = (phase: (typeof phases)[0]): "locked" | "available" | "completed" => {
    if (isPhaseCompleted(phase.id)) return "completed";
    if (isPhaseUnlocked(phase.phase_number)) return "available";
    return "locked";
  };

  const currentPhase = phases.find((p) => p.phase_number === currentDay);

  const getWeekNumber = (day: number) => Math.ceil(day / 7);
  const getWeekLabel = (weekNum: number) => {
    switch (weekNum) {
      case 1:
        return t("trail.week1", "w: Fundamentos");
      case 2:
        return t("trail.week2", "Semana 2: Técnicas Básicas");
      case 3:
        return t("trail.week3", "Semana 3: Técnicas Intermediárias");
      case 4:
        return t("trail.week4", "Semana 4: Aplicação Profissional");
      default:
        return `Semana ${weekNum}`;
    }
  };

  const phasesByWeek = phases.reduce(
    (acc, phase, idx) => {
      const weekNum = getWeekNumber(phase.phase_number);
      if (!acc[weekNum]) acc[weekNum] = [];
      acc[weekNum].push({ phase, translated: translatedPhases[idx] });
      return acc;
    },
    {} as Record<number, { phase: (typeof phases)[0]; translated: (typeof translatedPhases)[0] }[]>,
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} className="flex-shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="font-semibold text-foreground truncate">{aiTool.name}</h1>
              <p className="text-xs text-muted-foreground">{t("trail.challenge")}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-semibold text-primary">
                {completedCount}/{totalDays}
              </p>
              <p className="text-xs text-muted-foreground">{t("trail.days")}</p>
            </div>
          </div>
        </div>

        <ProgressBar28Days
          totalDays={totalDays}
          completedDays={completedDays}
          currentDay={currentDay}
          onDayClick={handleDayClick}
          isUnlocked={isPhaseUnlocked}
        />
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Current day highlight */}
        {!isCompleted && currentPhase && (
          <div className="mb-6 p-4 rounded-2xl bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Play className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-primary font-medium uppercase tracking-wide">{t("trail.nextUp")}</p>
                <h3 className="font-semibold text-foreground">
                  {t("trail.dayLabel")} {currentDay}:{" "}
                  {translatedPhases.find((p) => p.phase_number === currentDay)?.title || currentPhase.title}
                </h3>
              </div>
            </div>
            <Button className="w-full" onClick={() => handleDayClick(currentDay)}>
              {t("lesson.startNow")}
            </Button>
          </div>
        )}

        {/* Completion message */}
        {isCompleted && (
          <div className="mb-6 p-6 rounded-2xl bg-success/10 border border-success/20 text-center">
            <Trophy className="w-12 h-12 text-success mx-auto mb-3" />
            <h2 className="text-xl font-bold text-foreground mb-2">🎉 {t("trail.congratulations")}</h2>
            <p className="text-muted-foreground mb-4 text-sm">{t("trail.congratsMessage", { name: aiTool.name })}</p>
            <Button onClick={() => navigate("/dashboard")}>{t("trail.exploreButton")}</Button>
          </div>
        )}

        {/* Day list grouped by week */}
        {Object.entries(phasesByWeek).map(([weekNum, weekPhases]) => (
          <div key={weekNum} className="mb-6">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-1">
              {getWeekLabel(Number(weekNum))}
            </h2>
            <div className="space-y-2">
              {weekPhases.map(({ phase, translated }) => (
                <DayCard
                  key={phase.id}
                  dayNumber={phase.phase_number}
                  title={translated.title}
                  description={translated.description}
                  status={getPhaseStatus(phase)}
                  onClick={() => handleDayClick(phase.phase_number)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Trail;
