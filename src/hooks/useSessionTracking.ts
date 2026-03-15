import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook para rastrear sessões de usuário.
 * Registra quando um usuário inicia uma sessão e mantém um ping periódico
 * para rastrear tempo ativo.
 */
export const useSessionTracking = () => {
  const sessionIdRef = useRef<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const startSession = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from("user_sessions")
          .insert({
            user_id: user.id,
            started_at: new Date().toISOString(),
            last_ping_at: new Date().toISOString(),
          })
          .select("id")
          .single();

        if (error || !data) {
          console.error("Erro ao iniciar sessão:", error);
          return;
        }

        sessionIdRef.current = data.id;

        // Ping a cada 30 segundos para atualizar last_ping_at
        intervalRef.current = setInterval(async () => {
          if (sessionIdRef.current) {
            await supabase
              .from("user_sessions")
              .update({ last_ping_at: new Date().toISOString() })
              .eq("id", sessionIdRef.current);
          }
        }, 30000);
      } catch (error) {
        console.error("Erro no rastreamento de sessão:", error);
      }
    };

    startSession();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
};
