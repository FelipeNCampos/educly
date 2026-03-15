import { useRegisterSW } from 'virtual:pwa-register/react';
import { useCallback } from 'react';

interface UseAppUpdateReturn {
  needRefresh: boolean;
  updateApp: () => void;
  offlineReady: boolean;
}

export const useAppUpdate = (): UseAppUpdateReturn => {
  const {
    needRefresh: [needRefresh],
    offlineReady: [offlineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, registration) {
      console.log('✅ Service Worker registered:', swUrl);
      
      // Check for updates every 60 seconds
      if (registration) {
        setInterval(() => {
          registration.update();
        }, 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.error('❌ Service Worker registration error:', error);
    },
  });

  const updateApp = useCallback(() => {
    // Clear content caches before updating
    clearContentCaches();
    
    // Update service worker and reload
    updateServiceWorker(true);
  }, [updateServiceWorker]);

  return {
    needRefresh,
    updateApp,
    offlineReady,
  };
};

// Clear in-memory and localStorage caches
function clearContentCaches() {
  // Clear localStorage version to force content refresh
  localStorage.removeItem('app_content_version');
  
  // Clear any cached lesson/freelancer data indicators
  localStorage.removeItem('lesson_cache_timestamp');
  localStorage.removeItem('freelancer_cache_timestamp');
  
  console.log('🧹 Content caches cleared for update');
}
