import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TutorialStatus {
  dashboard: boolean;
  challenge: boolean;
  freelancer: boolean;
  assistants: boolean;
  chat: boolean;
}

export const useTutorialStatus = (tutorialKey: keyof TutorialStatus) => {
  const [isCompleted, setIsCompleted] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkStatus = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        setIsCompleted(true); // Don't show tutorial if not logged in
        return;
      }

      // Check database for onboarding status
      const { data, error } = await supabase
        .from("user_onboarding")
        .select("tutorial_completed")
        .eq("user_id", user.id)
        .maybeSingle();

      console.log("[Tutorial] Checking status for", tutorialKey, "- DB result:", data, error);

      // If no record exists, create one and show tutorial
      if (!data && !error) {
        console.log("[Tutorial] No record found - creating new onboarding record");
        // New user - create onboarding record
        await supabase
          .from("user_onboarding")
          .insert({ user_id: user.id, tutorial_completed: false });
        
        if (tutorialKey === "dashboard") {
          setIsCompleted(false); // Show tutorial for new users
        } else {
          setIsCompleted(true); // Other tutorials wait for dashboard completion
        }
      } else if (data?.tutorial_completed) {
        console.log("[Tutorial] Tutorial already completed in DB");
        // Main tutorial already completed - check localStorage for sub-tutorials
        const localKey = `tutorial_${tutorialKey}`;
        const localCompleted = localStorage.getItem(localKey);
        setIsCompleted(localCompleted === "true");
      } else if (tutorialKey === "dashboard") {
        console.log("[Tutorial] Dashboard tutorial not completed - showing tutorial");
        // Dashboard tutorial not completed yet
        setIsCompleted(false);
      } else {
        // Sub-tutorials only show after main tutorial is done
        setIsCompleted(true);
      }
    } catch (error) {
      console.error("Error checking tutorial status:", error);
      setIsCompleted(true);
    } finally {
      setIsLoading(false);
    }
  }, [tutorialKey]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const completeTutorial = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (tutorialKey === "dashboard") {
        // Mark main tutorial as complete in database
        await supabase
          .from("user_onboarding")
          .upsert({
            user_id: user.id,
            tutorial_completed: true,
            completed_at: new Date().toISOString(),
          }, { onConflict: "user_id" });
      }

      // Also save to localStorage
      localStorage.setItem(`tutorial_${tutorialKey}`, "true");
      setIsCompleted(true);
    } catch (error) {
      console.error("Error completing tutorial:", error);
    }
  }, [tutorialKey]);

  const shouldShowTutorial = !isLoading && isCompleted === false;

  return {
    shouldShowTutorial,
    isLoading,
    completeTutorial,
  };
};
