import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Check, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";

export const WeeklyStreakBar = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [currentDayIndex, setCurrentDayIndex] = useState(0);

  const resetTime = (date: Date) => {
    const d = new Date(date);
    d.setHours(12, 0, 0, 0);
    return d;
  };

  const getWeekDates = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const adjustedDayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    const monday = new Date(now);
    monday.setDate(now.getDate() - adjustedDayIndex);

    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      dates.push(date);
    }

    return { dates, adjustedDayIndex };
  };

  const { dates, adjustedDayIndex } = getWeekDates();

  useEffect(() => {
    setCurrentDayIndex(adjustedDayIndex);
  }, [adjustedDayIndex]);

  const { data: streakData } = useQuery({
    queryKey: ["user-streak"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return { current_streak: 0, longest_streak: 0 };

      const { data } = await supabase.from("user_streaks").select("*").eq("user_id", user.id).maybeSingle();

      return data || { current_streak: 0, longest_streak: 0 };
    },
  });

  const updateStreakMutation = useMutation({
    mutationFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split("T")[0];

      const { data: existingStreak } = await supabase.from("user_streaks").select("*").eq("user_id", user.id).maybeSingle();

      if (!existingStreak) {
        await supabase.from("user_streaks").insert({
          user_id: user.id,
          current_streak: 1,
          longest_streak: 1,
          last_activity_date: today,
        });
        return;
      }

      const lastActivity = existingStreak.last_activity_date;
      if (lastActivity === today) return;

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      let newStreak = 1;
      if (lastActivity === yesterdayStr) {
        newStreak = existingStreak.current_streak + 1;
      }

      const newLongest = Math.max(newStreak, existingStreak.longest_streak);

      await supabase
        .from("user_streaks")
        .update({
          current_streak: newStreak,
          longest_streak: newLongest,
          last_activity_date: today,
        })
        .eq("user_id", user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-streak"] });
    },
  });

  useEffect(() => {
    updateStreakMutation.mutate();
  }, []);

  const { data: weeklyActivity } = useQuery({
    queryKey: ["weekly-activity-v5", dates[0].getDate()],
    refetchOnWindowFocus: true,
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      const searchStart = new Date(dates[0]);
      searchStart.setDate(searchStart.getDate() - 7);
      const searchEnd = new Date(dates[6]);
      searchEnd.setDate(searchEnd.getDate() + 7);

      // 1. Busca progresso de aulas
      const { data: stepProgress } = await supabase
        .from("user_step_progress")
        .select("completed_at, created_at")
        .eq("user_id", user.id)
        .gte("completed_at", searchStart.toISOString())
        .lte("completed_at", searchEnd.toISOString());

      const { data: dayProgress } = await supabase
        .from("user_day_progress")
        .select("completed_at, created_at")
        .eq("user_id", user.id)
        .gte("completed_at", searchStart.toISOString())
        .lte("completed_at", searchEnd.toISOString());

      // 2. NOVA PARTE: Busca o streak para saber quantos dias pintar
      const { data: streak } = await supabase.from("user_streaks").select("*").eq("user_id", user.id).maybeSingle();

      const toLocalDateString = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      const activityDates = new Set<string>();

      // Adiciona datas das aulas
      const allActivity = [...(stepProgress || []), ...(dayProgress || [])];
      allActivity.forEach((item) => {
        const timestamp = item.completed_at || item.created_at;
        if (timestamp) {
          const dbDate = new Date(timestamp);
          activityDates.add(toLocalDateString(dbDate));
        }
      });

      // 3. LÓGICA NOVA: Adiciona datas baseadas no login (Streak)
      // Se você tem 2 dias de streak, ele vai pintar hoje e ontem de verde.
      if (streak && streak.last_activity_date && streak.current_streak > 0) {
        const [y, m, d] = streak.last_activity_date.split("-").map(Number);
        const cursorDate = new Date(y, m - 1, d);

        for (let i = 0; i < streak.current_streak; i++) {
          activityDates.add(toLocalDateString(cursorDate));
          cursorDate.setDate(cursorDate.getDate() - 1); // Volta 1 dia
        }
      }

      const activitySet = new Set<number>();
      dates.forEach((targetDate, index) => {
        const targetDateString = toLocalDateString(targetDate);
        if (activityDates.has(targetDateString)) {
          activitySet.add(index);
        }
      });

      return Array.from(activitySet);
    },
  });

  const weekDays = [
    { key: "mon", label: t("weeklyStreak.days.mon") },
    { key: "tue", label: t("weeklyStreak.days.tue") },
    { key: "wed", label: t("weeklyStreak.days.wed") },
    { key: "thu", label: t("weeklyStreak.days.thu") },
    { key: "fri", label: t("weeklyStreak.days.fri") },
    { key: "sat", label: t("weeklyStreak.days.sat") },
    { key: "sun", label: t("weeklyStreak.days.sun") },
  ];

  const progressPercentage = (currentDayIndex / (weekDays.length - 1)) * 100;
  const currentStreak = streakData?.current_streak || 0;

  return (
    <div className="bg-card border border-border rounded-xl p-4 sm:p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-foreground text-lg">{t("weeklyStreak.title")}</h3>
          <p className="text-muted-foreground text-sm">{t("weeklyStreak.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2 bg-orange-500/10 text-orange-500 px-3 py-1.5 rounded-full">
          <Flame className="w-4 h-4 fill-current" />
          <span className="font-bold text-sm">
            {currentStreak} {t("weeklyStreak.streakDays")}
          </span>
        </div>
      </div>

      <div className="relative mb-8 mt-2 mx-4 h-1.5 bg-muted rounded-full">
        <div
          className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />

        <div
          className="absolute top-1/2 -translate-y-1/2 transition-all duration-1000 ease-out z-10"
          style={{ left: `${progressPercentage}%` }}
        >
          <div className="relative -ml-3 -mt-6">
            <img
              src="https://em-content.zobj.net/source/microsoft-teams/400/person-running_1f3c3.png"
              alt="Corredor"
              className="w-6 h-6 sm:w-8 sm:h-8 transform -scale-x-100 filter drop-shadow-md"
            />
          </div>
        </div>

        {weekDays.map((_, index) => (
          <div
            key={index}
            className={cn(
              "absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full transition-colors duration-300",
              index <= currentDayIndex ? "bg-primary" : "bg-muted-foreground/30",
            )}
            style={{
              left: `${(index / (weekDays.length - 1)) * 100}%`,
              marginLeft: index === 0 ? "0" : index === 6 ? "-8px" : "-4px",
            }}
          />
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center">
        {weekDays.map((day, index) => {
          const isCompleted = weeklyActivity?.includes(index);
          const isToday = index === currentDayIndex;

          return (
            <div key={day.key} className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  "w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-300 relative",
                  isToday
                    ? "bg-primary text-primary-foreground ring-4 ring-primary/20 scale-110 z-10 shadow-lg"
                    : isCompleted
                      ? "bg-green-500 text-white"
                      : "bg-muted/50 text-muted-foreground",
                )}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="uppercase tracking-tighter">{day.label}</span>
                )}

                {isToday && !isCompleted && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-background animate-pulse" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
