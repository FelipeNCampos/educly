import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserLevel, XP_REWARDS } from "./useUserLevel";

export const useDailyLoginXP = () => {
  const { addXP, levelData } = useUserLevel();
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    if (hasCheckedRef.current || !levelData) return;
    hasCheckedRef.current = true;

    const checkDailyLogin = async () => {
      const today = new Date().toISOString().split("T")[0];
      const lastLoginKey = "last_xp_login_date";
      const lastLogin = localStorage.getItem(lastLoginKey);

      if (lastLogin !== today) {
        localStorage.setItem(lastLoginKey, today);
        
        // Dar XP de login diário
        addXP(XP_REWARDS.DAILY_LOGIN, "Login diário! 🌟");
      }
    };

    checkDailyLogin();
  }, [levelData, addXP]);
};
