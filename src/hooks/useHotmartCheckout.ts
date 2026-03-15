import { useEffect } from 'react';

/**
 * Hook to manage the Hotmart Sales Funnel widget lifecycle in a SPA.
 * - Avoids removing the script on cleanup to prevent inconsistent global state.
 * - Retries mounting if the first attempt fails.
 */
export function useHotmartCheckout() {
  useEffect(() => {
    const mountWidget = () => {
      try {
        if ((window as any).checkoutElements) {
          (window as any).checkoutElements.init('salesFunnel').mount('#hotmart-sales-funnel');
        }
      } catch (e) {
        console.warn('Hotmart widget mount error, retrying...', e);
        setTimeout(() => {
          try {
            (window as any).checkoutElements?.init('salesFunnel').mount('#hotmart-sales-funnel');
          } catch {}
        }, 1000);
      }
    };

    // If script already loaded, just mount
    if ((window as any).checkoutElements) {
      mountWidget();
      return;
    }

    // Check if script tag already exists
    const existingScript = document.querySelector(
      'script[src="https://checkout.hotmart.com/lib/hotmart-checkout-elements.js"]'
    );

    if (existingScript) {
      // Script exists but checkoutElements not ready yet — wait for load
      existingScript.addEventListener('load', mountWidget);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.hotmart.com/lib/hotmart-checkout-elements.js';
    script.async = true;
    script.onload = mountWidget;
    document.head.appendChild(script);

    // Do NOT remove the script on cleanup to avoid corrupting global state
  }, []);
}
