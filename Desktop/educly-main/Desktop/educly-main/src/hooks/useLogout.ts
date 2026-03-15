import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

export const useLogout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  const logout = async () => {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();

      // Clear all auth-related localStorage items
      localStorage.removeItem("quizCompleted");
      localStorage.removeItem("quizAnswers");
      localStorage.removeItem("clearSessionOnLogout");
      
      // ALWAYS clear Supabase session tokens to prevent invalid JWT issues
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('sb-') || key.includes('supabase'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Clear session storage too
      sessionStorage.clear();

      toast({
        title: t('common.logout', 'Logout realizado'),
        description: t('auth.logoutSuccess', 'Você foi desconectado com sucesso'),
      });

      // Navigate to landing page
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error during logout:', error);
      // Force navigate even if there's an error
      navigate('/', { replace: true });
    }
  };

  return { logout };
};
