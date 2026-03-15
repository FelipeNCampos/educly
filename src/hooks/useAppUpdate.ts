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
      
      // Check for updates every 30 seconds
      if (registration) {
        setInterval(() => {
          registration.update();
        }, 30 * 1000);
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
    updateServiceWorker(true).catch(() => {
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    });
  }, [updateServiceWorker]);

  return {
    needRefresh,
    updateApp,
    offlineReady,
  };
};

// Clear in-memory and localStorage caches
function clearContentCaches() {
  const preservedTutorialKeys = [
    'has_seen_dashboard_tutorial_v12',
    'tutorial_dashboard',
  ];
  const dashboardScopedKeys = Object.keys(localStorage).filter((key) =>
    key.startsWith('tutorial_dashboard_')
  );
  const preservedTutorialState = new Map<string, string>();

  [...preservedTutorialKeys, ...dashboardScopedKeys].forEach((key) => {
    const value = localStorage.getItem(key);
    if (value !== null) {
      preservedTutorialState.set(key, value);
    }
  });

  // Clear localStorage version to force content refresh
  localStorage.removeItem('app_content_version');

  // Clear any cached lesson/freelancer data indicators
  localStorage.removeItem('lesson_cache_timestamp');
  localStorage.removeItem('freelancer_cache_timestamp');

  if (typeof window !== 'undefined' && 'caches' in window) {
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
      .then(() => {
        console.log('🧹 Cache Storage cleared for update');
      })
      .catch((error) => {
        console.warn('⚠️ Cache Storage clear failed:', error);
      });
  }

  preservedTutorialState.forEach((value, key) => {
    localStorage.setItem(key, value);
  });

  console.log('🧹 Content caches cleared for update');
}
