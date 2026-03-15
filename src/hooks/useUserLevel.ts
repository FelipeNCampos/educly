import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useRef } from "react";

// XP necessário para cada nível (progressão exponencial suave)
const XP_PER_LEVEL = [
  0,      // Level 1: 0 XP
  100,    // Level 2: 100 XP
  250,    // Level 3: 250 XP
  500,    // Level 4: 500 XP
  800,    // Level 5: 800 XP
  1200,   // Level 6: 1200 XP
  1700,   // Level 7: 1700 XP
  2300,   // Level 8: 2300 XP
  3000,   // Level 9: 3000 XP
  4000,   // Level 10: 4000 XP
  5500,   // Level 11
  7500,   // Level 12
  10000,  // Level 13
  13000,  // Level 14
  17000,  // Level 15
  22000,  // Level 16
  28000,  // Level 17
  35000,  // Level 18
  45000,  // Level 19
  60000,  // Level 20 (máximo)
];

// Títulos para cada nível
export const LEVEL_TITLES: Record<number, string> = {
  1: "Novato",
  2: "Aprendiz",
  3: "Estudante",
  4: "Praticante",
  5: "Conhecedor",
  6: "Habilidoso",
  7: "Competente",
  8: "Proficiente",
  9: "Especialista",
  10: "Veterano",
  11: "Mestre",
  12: "Grão-Mestre",
  13: "Sábio",
  14: "Iluminado",
  15: "Visionário",
  16: "Lendário",
  17: "Mítico",
  18: "Transcendente",
  19: "Supremo",
  20: "Ascendido",
};

// XP rewards for different actions
export const XP_REWARDS = {
  LESSON_COMPLETE: 25,
  DAY_COMPLETE: 50,
  QUIZ_CORRECT: 10,
  STREAK_BONUS: 5, // Per day of streak
  MODULE_COMPLETE: 100,
  MEDAL_EARNED: 75,
  DAILY_LOGIN: 15,
};

export const calculateLevelFromXP = (totalXP: number) => {
  let level = 1;
  for (let i = 1; i < XP_PER_LEVEL.length; i++) {
    if (totalXP >= XP_PER_LEVEL[i]) {
      level = i + 1;
    } else {
      break;
    }
  }
  return Math.min(level, 20);
};

export const getXPForLevel = (level: number) => {
  return XP_PER_LEVEL[level - 1] || 0;
};

export const getXPForNextLevel = (level: number) => {
  if (level >= 20) return XP_PER_LEVEL[19];
  return XP_PER_LEVEL[level] || XP_PER_LEVEL[XP_PER_LEVEL.length - 1];
};

export const useUserLevel = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const previousLevelRef = useRef<number | null>(null);

  const { data: levelData, isLoading } = useQuery({
    queryKey: ["user-level"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("user_levels")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      // Se não existe, criar registro inicial
      if (!data) {
        const { data: newData, error: insertError } = await supabase
          .from("user_levels")
          .insert({ user_id: user.id })
          .select()
          .single();

        if (insertError) throw insertError;
        return newData;
      }

      return data;
    },
  });

  const addXPMutation = useMutation({
    mutationFn: async ({ amount, reason }: { amount: number; reason: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Buscar dados atuais
      const { data: currentData, error: fetchError } = await supabase
        .from("user_levels")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (fetchError || !currentData) throw new Error("User level not found");

      const newTotalXP = (currentData?.total_xp_earned || 0) + amount;
      const newLevel = calculateLevelFromXP(newTotalXP);
      const xpForCurrentLevel = getXPForLevel(newLevel);
      const currentXPInLevel = newTotalXP - xpForCurrentLevel;

      const { data, error } = await supabase
        .from("user_levels")
        .update({
          current_xp: currentXPInLevel,
          current_level: newLevel,
          total_xp_earned: newTotalXP,
        })
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        previousLevel: currentData?.current_level || 1,
        newLevel,
        xpGained: amount,
        reason,
      };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["user-level"] });

      // Notificação de XP ganho
      toast({
        title: `+${result.xpGained} XP! 🎯`,
        description: result.reason,
        duration: 3000,
      });

      // Notificação de level up
      if (result.newLevel > result.previousLevel) {
        setTimeout(() => {
          toast({
            title: `🎉 LEVEL UP! Nível ${result.newLevel}`,
            description: `Parabéns! Você agora é ${LEVEL_TITLES[result.newLevel]}!`,
            duration: 5000,
          });
          
          // Play level up sound
          try {
            const audio = new Audio("/assets/sounds/medal-earned.mp3");
            audio.volume = 0.5;
            audio.play().catch(() => {});
          } catch {}
        }, 500);
      }
    },
    onError: (error) => {
      console.error("Error adding XP:", error);
    },
  });

  // Calcular progresso para o próximo nível
  const currentLevel = levelData?.current_level || 1;
  const totalXP = levelData?.total_xp_earned || 0;
  const xpForCurrentLevel = getXPForLevel(currentLevel);
  const xpForNextLevel = getXPForNextLevel(currentLevel);
  const xpNeededForNext = xpForNextLevel - xpForCurrentLevel;
  const currentXPInLevel = totalXP - xpForCurrentLevel;
  const progressPercent = currentLevel >= 20 
    ? 100 
    : Math.min((currentXPInLevel / xpNeededForNext) * 100, 100);

  return {
    levelData,
    isLoading,
    currentLevel,
    totalXP,
    currentXPInLevel,
    xpNeededForNext,
    progressPercent,
    levelTitle: LEVEL_TITLES[currentLevel] || "Novato",
    addXP: (amount: number, reason: string) => addXPMutation.mutate({ amount, reason }),
    isAddingXP: addXPMutation.isPending,
  };
};
