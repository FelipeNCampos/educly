import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface PremiumGuardProps {
  children: ReactNode;
}

// Helper to clear invalid session tokens
const clearInvalidSession = () => {
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith('sb-') || key.includes('supabase'))) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
  sessionStorage.clear();
};

export const PremiumGuard = ({ children }: PremiumGuardProps) => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkAccess = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        // Handle invalid JWT / 403 errors - clear tokens and redirect
        if (userError) {
          console.error('Auth error in PremiumGuard:', userError);
          clearInvalidSession();
          if (isMounted) navigate('/auth', { replace: true });
          return;
        }
        
        if (!user) {
          if (isMounted) navigate('/auth', { replace: true });
          return;
        }

        // Check premium access with retry logic (3 attempts, 1s interval)
        let isPremium = false;
        for (let attempt = 0; attempt < 3; attempt++) {
          const { data, error } = await supabase.rpc('check_premium_access');
          if (!error && data === true) {
            isPremium = true;
            break;
          }
          if (error) console.error(`Premium check attempt ${attempt + 1} failed:`, error);
          if (attempt < 2) await new Promise(r => setTimeout(r, 1000));
        }

        if (!isPremium) {
          // Check if user did NOT select "keep me logged in"
          const shouldClearSession = localStorage.getItem("clearSessionOnLogout") === "true";
          
          if (shouldClearSession) {
            // Clear session completely before redirecting to auth
            const keysToRemove: string[] = [];
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && (key.startsWith('sb-') || key.includes('supabase'))) {
                keysToRemove.push(key);
              }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));
            sessionStorage.clear();
            localStorage.removeItem("clearSessionOnLogout");
            
            // Sign out and redirect to auth for fresh login
            await supabase.auth.signOut();
            if (isMounted) navigate('/auth', { replace: true });
          } else {
            // User selected "keep me logged in" - go to upgrade page
            if (isMounted) navigate('/upgrade', { replace: true });
          }
          return;
        }

        if (isMounted) setHasAccess(true);
      } catch (error) {
        console.error('Error in PremiumGuard:', error);
        clearInvalidSession();
        if (isMounted) navigate('/auth', { replace: true });
      } finally {
        if (isMounted) setIsChecking(false);
      }
    };

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        if (isMounted) {
          setHasAccess(false);
          navigate('/auth', { replace: true });
        }
      }
    });

    checkAccess();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasAccess) {
    return null;
  }

  return <>{children}</>;
};
