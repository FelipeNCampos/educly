import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMedalNotification } from "./useMedalNotification";

interface UnlockCondition {
  type: string;
  count?: number;
  hours?: number;
}

interface FreelancerMedal {
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

export const useFreelancerMedals = () => {
  const { showMedalNotification } = useMedalNotification();
  const queryClient = useQueryClient();

  // Fetch all medals
  const { data: allMedals, isLoading: medalsLoading } = useQuery({
    queryKey: ["freelancer-medals"],
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
    queryKey: ["user-freelancer-medals"],
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
        queryClient.invalidateQueries({ queryKey: ["user-freelancer-medals"] });
        queryClient.invalidateQueries({ queryKey: ["user-all-medals"] });
        const medal = allMedals?.find((m) => m.id === medalId);
        if (medal) {
          showMedalNotification(medal.name, medal.description);
        }
      }
    },
  });

  // Check and award medals based on current progress
  const checkAndAwardMedals = async (
    completedModules: number,
    currentStreak: number
  ) => {
    if (!allMedals) return;

    for (const medal of allMedals) {
      const isEarned = userMedals?.some((um) => um.medal_id === medal.id);
      if (isEarned) continue;

      let shouldAward = false;

      switch (medal.unlock_condition.type) {
        case "modules_completed":
          shouldAward = completedModules >= (medal.unlock_condition.count || 0);
          break;
        case "streak":
          shouldAward = currentStreak >= (medal.unlock_condition.count || 0);
          break;
        // Other conditions can be checked elsewhere
      }

      if (shouldAward) {
        await awardMedal.mutateAsync(medal.id);
      }
    }
  };

  // Get medal with earned status
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

  return {
    allMedals,
    userMedals,
    isLoading: medalsLoading || userMedalsLoading,
    awardMedal: awardMedal.mutate,
    checkAndAwardMedals,
    getMedalsWithStatus,
    earnedCount: userMedals?.length || 0,
    totalCount: allMedals?.length || 0,
  };
};
