import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// NOTE: Client-side premium checks are for UX only, not security.
// All premium features MUST be gated by server-side validation in edge functions.
// The whitelist is managed server-side in the check_premium_access database function.

interface PremiumAccessState {
  isPremium: boolean;
  isLoading: boolean;
  checkoutUrl: string;
}

export const usePremiumAccess = () => {
  const [state, setState] = useState<PremiumAccessState>({
    isPremium: false,
    isLoading: true,
    checkoutUrl: 'https://hotmart.com/checkout/placeholder' // Placeholder for Hotmart
  });

  useEffect(() => {
    const checkPremiumAccess = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setState(prev => ({ ...prev, isLoading: false, isPremium: false }));
          return;
        }

        // Use server-side function to check premium access (includes whitelist logic)
        const { data, error } = await supabase.rpc('check_premium_access');

        if (error) {
          console.error('Error checking premium access:', error);
          setState(prev => ({ ...prev, isLoading: false, isPremium: false }));
          return;
        }

        setState(prev => ({
          ...prev,
          isLoading: false,
          isPremium: data ?? false
        }));
      } catch (error) {
        console.error('Error in usePremiumAccess:', error);
        setState(prev => ({ ...prev, isLoading: false, isPremium: false }));
      }
    };

    checkPremiumAccess();
  }, []);

  return state;
};
