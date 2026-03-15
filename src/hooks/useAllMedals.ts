import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

interface Medal {
  id: string;
  name: string;
  description: string;
  icon_name: string;
  color: string;
  tier: string;
  slug: string;
  order_index: number;
  unlock_condition: Record<string, unknown>;
  created_at: string;
}

interface UserMedal {
  medal_id: string;
  earned_at: string;
}

interface MedalWithStatus extends Medal {
  isEarned: boolean;
  earnedAt: string | null;
}

export const useAllMedals = () => {
  const queryClient = useQueryClient();

  // 1. Busca todas as definições de medalhas da tabela freelancer_medals
  const { data: medals = [], isLoading: loadingMedals } = useQuery({
    queryKey: ["all-medals-definitions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("freelancer_medals")
        .select("*")
        .order("order_index", { ascending: true });
      if (error) throw error;
      return data as Medal[];
    },
  });

  // 2. Busca as medalhas que o usuário logado JÁ CONQUISTOU
  const { data: userMedals = [], isLoading: loadingUserMedals, refetch } = useQuery({
    queryKey: ["user-all-medals"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("user_freelancer_medals")
        .select("medal_id, earned_at")
        .eq("user_id", user.id);
        
      if (error) throw error;
      return data as UserMedal[];
    },
  });

  // 3. LOGICA REALTIME: Escuta o banco e atualiza o cache na hora
  useEffect(() => {
    const channel = supabase
      .channel('medals-updates')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'user_freelancer_medals' 
      }, () => {
        // Invalida o cache e força o React Query a buscar de novo
        queryClient.invalidateQueries({ queryKey: ["user-all-medals"] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  // 4. FUNÇÃO QUE CRUZA OS DADOS
  const getMedalsWithStatus = (): MedalWithStatus[] => {
    return medals.map((medal) => {
      const earnedRecord = userMedals.find((um) => um.medal_id === medal.id);
      return {
        ...medal,
        isEarned: !!earnedRecord,
        earnedAt: earnedRecord?.earned_at || null,
      };
    });
  };

  // 5. FUNÇÃO QUE SEPARA POR CATEGORIA (freelancer vs trail)
  const getMedalsByCategory = () => {
    const allMedalsWithStatus = getMedalsWithStatus();
    
    // Medalhas da trilha freelancer (baseado no slug ou unlock_condition)
    const freelancerMedals = allMedalsWithStatus.filter((medal) => {
      const condition = medal.unlock_condition as Record<string, unknown>;
      // Se tem modules_completed ou é relacionado a freelancer
      return condition?.modules_completed !== undefined || 
             medal.slug?.includes('freelancer') ||
             medal.slug?.includes('module') ||
             medal.slug?.includes('primeiro') ||
             medal.slug?.includes('explorer') ||
             medal.slug?.includes('specialist') ||
             medal.slug?.includes('master');
    });
    
    // Medalhas da trilha de 28 dias (streak, days, etc)
    const trailMedals = allMedalsWithStatus.filter((medal) => {
      const condition = medal.unlock_condition as Record<string, unknown>;
      return condition?.streak !== undefined || 
             condition?.days_completed !== undefined ||
             medal.slug?.includes('streak') ||
             medal.slug?.includes('days') ||
             medal.slug?.includes('week');
    });

    // Se a medalha não se encaixa em nenhuma categoria específica, coloca em freelancer
    const categorizedIds = new Set([
      ...freelancerMedals.map(m => m.id),
      ...trailMedals.map(m => m.id)
    ]);
    
    const uncategorized = allMedalsWithStatus.filter(m => !categorizedIds.has(m.id));
    
    return {
      freelancerMedals: [...freelancerMedals, ...uncategorized],
      trailMedals,
    };
  };

  const earnedCount = userMedals.length;
  const totalCount = medals.length;

  return {
    getMedalsWithStatus,
    getMedalsByCategory,
    earnedCount,
    totalCount,
    isLoading: loadingMedals || loadingUserMedals,
    refetchMedals: refetch,
  };
};
