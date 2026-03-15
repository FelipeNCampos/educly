import { supabase } from "@/integrations/supabase/client";

export const reportBug = async (message: string, stack?: string) => {
  try {
    // Tenta pegar o usuário para você saber quem teve o erro
    const { data: { user } } = await supabase.auth.getUser();
    const platformInfo = `${navigator.platform} | ${navigator.userAgent.split(' ')[0]}`;
    const currentUrl = window.location.href;

    await supabase.from('user_bugs').insert({
      platform: platformInfo,
      error_message: `[PROD] ${message}`,
      component_stack: `URL: ${currentUrl} | User: ${user?.id || 'Anon'} | Stack: ${stack || 'N/A'}`,
    });
  } catch (e) {
    // Falha silenciosa total
  }
};