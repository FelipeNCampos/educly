import { useEffect, useRef } from 'react';

// Declare the global constant injected by Vite at build time
declare const __APP_VERSION__: string;

// App version - frozen at build time, same for all users with this build
// This ensures version changes only when a new deploy happens
const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : Date.now().toString();

const VERSION_KEY = 'app_content_version';

interface ContentVersioningResult {
  shouldRefreshContent: boolean;
  currentVersion: string;
}

// Module-level caches to clear
const cacheRegistries: Array<() => void> = [];

export const registerCacheClear = (clearFn: () => void) => {
  cacheRegistries.push(clearFn);
};

export const clearAllContentCaches = () => {
  cacheRegistries.forEach(fn => fn());
  console.log(`🧹 Cleared ${cacheRegistries.length} content caches`);
};

export const useContentVersioning = (): ContentVersioningResult => {
  const hasCheckedRef = useRef(false);
  
  useEffect(() => {
    if (hasCheckedRef.current) return;
    hasCheckedRef.current = true;
    
    const storedVersion = localStorage.getItem(VERSION_KEY);
    
    if (storedVersion !== APP_VERSION) {
      console.log(`📦 App version changed: ${storedVersion} → ${APP_VERSION}`);
      
      // Clear all registered content caches
      clearAllContentCaches();
      
      // Update stored version
      localStorage.setItem(VERSION_KEY, APP_VERSION);
    } else {
      console.log(`✅ App version unchanged: ${APP_VERSION}`);
    }
  }, []);

  const storedVersion = localStorage.getItem(VERSION_KEY);
  const shouldRefreshContent = storedVersion !== APP_VERSION;

  return {
    shouldRefreshContent,
    currentVersion: APP_VERSION,
  };
};

// Export utility to force refresh
export const forceContentRefresh = () => {
  localStorage.removeItem(VERSION_KEY);
  clearAllContentCaches();
  window.location.reload();
};
