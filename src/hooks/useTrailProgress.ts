import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AITool {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon_name: string;
  color_gradient: string;
}

interface TrailPhase {
  id: string;
  ai_tool_id: string;
  phase_number: number;
  title: string;
  description: string;
  video_url: string | null;
  task_description: string;
}

interface UserProgress {
  id: string;
  user_id: string;
  phase_id: string;
  completed: boolean;
  completed_at: string | null;
}

export const useTrailProgress = (aiSlug: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar informações da ferramenta
  const { data: aiTool, isLoading: toolLoading } = useQuery({
    queryKey: ['ai-tool', aiSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_tools')
        .select('*')
        .eq('slug', aiSlug)
        .single();
      
      if (error) throw error;
      return data as AITool;
    }
  });

  // Buscar fases da trilha
  const { data: phases, isLoading: phasesLoading } = useQuery({
    queryKey: ['trail-phases', aiTool?.id],
    queryFn: async () => {
      if (!aiTool?.id) return [];
      
      const { data, error } = await supabase
        .from('trail_phases')
        .select('*')
        .eq('ai_tool_id', aiTool.id)
        .order('phase_number');
      
      if (error) throw error;
      return data as TrailPhase[];
    },
    enabled: !!aiTool?.id
  });

  // Buscar progresso do usuário
  const { data: userProgress, isLoading: progressLoading } = useQuery({
    queryKey: ['user-progress', aiTool?.id],
    queryFn: async () => {
      if (!aiTool?.id) return [];
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const phaseIds = phases?.map(p => p.id) || [];
      if (phaseIds.length === 0) return [];

      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .in('phase_id', phaseIds);
      
      if (error) throw error;
      return data as UserProgress[];
    },
    enabled: !!aiTool?.id && !!phases
  });

  // Mutation para completar fase
  const completePhase = useMutation({
    mutationFn: async (phaseId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          phase_id: phaseId,
          completed: true,
          completed_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,phase_id'
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-progress'] });
      toast({
        title: "Fase concluída! 🎉",
        description: "Parabéns! Continue sua jornada.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao completar fase",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Verificar se fase está desbloqueada
  const isPhaseUnlocked = (phaseNumber: number) => {
    if (phaseNumber === 1) return true;
    
    const previousPhase = phases?.find(p => p.phase_number === phaseNumber - 1);
    if (!previousPhase) return false;
    
    const previousProgress = userProgress?.find(p => p.phase_id === previousPhase.id);
    return previousProgress?.completed === true;
  };

  // Verificar se fase está concluída
  const isPhaseCompleted = (phaseId: string) => {
    return userProgress?.find(p => p.phase_id === phaseId)?.completed === true;
  };

  return {
    aiTool,
    phases,
    userProgress,
    isLoading: toolLoading || phasesLoading || progressLoading,
    completePhase: completePhase.mutate,
    isCompletingPhase: completePhase.isPending,
    isPhaseUnlocked,
    isPhaseCompleted
  };
};
