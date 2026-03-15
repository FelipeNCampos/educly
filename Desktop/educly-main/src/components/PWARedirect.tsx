import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

/**
 * Component that handles PWA-specific redirects.
 * When the app is running as a PWA (standalone mode) and user is on landing page,
 * it redirects to dashboard (if authenticated) or auth page (if not).
 */
export const PWARedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAndRedirect = async () => {
      // Check if running as PWA (standalone mode)
      const isStandalone = 
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://');

      // Only redirect if in PWA mode and on landing page
      if (isStandalone && location.pathname === '/') {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user) {
            navigate('/dashboard', { replace: true });
          } else {
            navigate('/auth', { replace: true });
          }
        } catch (error) {
          // If error checking auth, redirect to auth page
          navigate('/auth', { replace: true });
        }
      }
    };

    checkAndRedirect();
  }, [location.pathname, navigate]);

  return null;
};
