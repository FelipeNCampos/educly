import { Flame } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const StreakBadge = () => {
  const { data: streak } = useQuery({
    queryKey: ['user-streak'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_streaks')
        .select('current_streak, longest_streak')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    }
  });

  const currentStreak = streak?.current_streak || 0;

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-streak/10 rounded-full">
      <Flame 
        className={`w-4 h-4 text-streak ${currentStreak > 0 ? 'animate-streak-glow' : ''}`} 
        fill={currentStreak > 0 ? "hsl(var(--streak))" : "none"}
      />
      <span className="text-sm font-semibold text-streak">
        {currentStreak}
      </span>
    </div>
  );
};
