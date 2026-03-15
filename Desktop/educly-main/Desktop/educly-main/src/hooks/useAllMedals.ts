import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMedalNotification } from "./useMedalNotification";

interface UnlockCondition {
  type: string;
  count?: number;
  hours?: number;
  tool?: string;
}

interface Medal {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon_name: string;
  color: string;
  tier: "bronze" | "silver" | "gold" | "platinum";
  unlock_condition: UnlockCondition;
  order_index: number;
}

interface UserMedal {
  id: string;
  user_id: string;
  medal_id: string;
  earned_at: string;
}

export const useAllMedals = () => {
  const queryClient = useQueryClient();
  const { showMedalNotification } = useMedalNotification();

  // Fetch all medals
  const { data: allMedals, isLoading: medalsLoading } = useQuery({
    queryKey: ["all-medals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("freelancer_medals")
        .select("*")
        .order("order_index");

      if (error) throw error;
      return (data || []).map((item) => ({
        ...item,
        tier: item.tier as "bronze" | "silver" | "gold" | "platinum",
        unlock_condition: item.unlock_condition as unknown as UnlockCondition,
      }));
    },
  });

  // Fetch user's earned medals
  const { data: userMedals, isLoading: userMedalsLoading } = useQuery({
    queryKey: ["user-all-medals"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("user_freelancer_medals")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      return data as UserMedal[];
    },
  });

  // Award a medal to the user
  const awardMedal = useMutation({
    mutationFn: async (medalId: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Check if already earned
      const { data: existing } = await supabase
        .from("user_freelancer_medals")
        .select("id")
        .eq("user_id", user.id)
        .eq("medal_id", medalId)
        .single();

      if (existing) return null; // Already earned

      const { error } = await supabase.from("user_freelancer_medals").insert({
        user_id: user.id,
        medal_id: medalId,
      });

      if (error) throw error;
      return medalId;
    },
    onSuccess: (medalId) => {
      if (medalId) {
        queryClient.invalidateQueries({ queryKey: ["user-all-medals"] });
        queryClient.invalidateQueries({ queryKey: ["user-freelancer-medals"] });
        const medal = allMedals?.find((m) => m.id === medalId);
        if (medal) {
          showMedalNotification(medal.name, medal.description);
        }
      }
    },
  });

  // Check and award medals based on trail progress
  const checkTrailMedals = async (completedDays: number) => {
    if (!allMedals) return;

    const trailMedals = allMedals.filter(
      (m) => m.unlock_condition.type === "trail_days_completed"
    );

    for (const medal of trailMedals) {
      const isEarned = userMedals?.some((um) => um.medal_id === medal.id);
      if (isEarned) continue;

      if (completedDays >= (medal.unlock_condition.count || 0)) {
        await awardMedal.mutateAsync(medal.id);
      }
    }
  };

  // Check and award time-based medals
  const checkTimeMedals = async () => {
    if (!allMedals) return;

    const hour = new Date().getHours();

    // Early bird - before 8am
    const earlyBirdMedal = allMedals.find((m) => m.slug === "early_bird");
    if (earlyBirdMedal && hour < 8) {
      const isEarned = userMedals?.some((um) => um.medal_id === earlyBirdMedal.id);
      if (!isEarned) {
        await awardMedal.mutateAsync(earlyBirdMedal.id);
      }
    }

    // Night owl - after 22h
    const nightOwlMedal = allMedals.find((m) => m.slug === "night_owl");
    if (nightOwlMedal && hour >= 22) {
      const isEarned = userMedals?.some((um) => um.medal_id === nightOwlMedal.id);
      if (!isEarned) {
        await awardMedal.mutateAsync(nightOwlMedal.id);
      }
    }
  };

  // Get medals with earned status
  const getMedalsWithStatus = () => {
    if (!allMedals) return [];

    return allMedals.map((medal) => {
      const earned = userMedals?.find((um) => um.medal_id === medal.id);
      return {
        ...medal,
        isEarned: !!earned,
        earnedAt: earned?.earned_at,
      };
    });
  };

  // Get medals grouped by category
  const getMedalsByCategory = () => {
    const medals = getMedalsWithStatus();
    
    const freelancerMedals = medals.filter((m) =>
      ["first_step", "explorer", "specialist", "master", "streak_3", "streak_7", "streak_14", "fast_learner", "perfect_quiz"].includes(m.slug)
    );
    
    const trailMedals = medals.filter((m) =>
      ["trail_week1", "trail_week2", "trail_week3", "trail_complete", "chatgpt_master", "claude_master", "gemini_master", "early_bird", "night_owl"].includes(m.slug)
    );

    return { freelancerMedals, trailMedals };
  };

  return {
    allMedals,
    userMedals,
    isLoading: medalsLoading || userMedalsLoading,
    awardMedal: awardMedal.mutate,
    checkTrailMedals,
    checkTimeMedals,
    getMedalsWithStatus,
    getMedalsByCategory,
    earnedCount: userMedals?.length || 0,
    totalCount: allMedals?.length || 0,
  };
};
