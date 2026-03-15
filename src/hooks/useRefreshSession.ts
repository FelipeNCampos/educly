import { supabase } from "@/integrations/supabase/client";

/**
 * Refreshes the Supabase auth session token.
 * Returns the fresh access_token or null if session is invalid.
 */
export const refreshSession = async (): Promise<string | null> => {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    if (error || !data.session) {
      console.warn("⚠️ Token refresh failed:", error?.message);
      return null;
    }
    return data.session.access_token;
  } catch (err) {
    console.error("❌ Token refresh error:", err);
    return null;
  }
};
