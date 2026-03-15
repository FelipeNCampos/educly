import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type ProductType = 'base' | 'freelancer' | 'ai_hub';

interface ProductAccessState {
  base: boolean;
  freelancer: boolean;
  ai_hub: boolean;
  isLoading: boolean;
}

export const useProductAccess = () => {
  const [access, setAccess] = useState<ProductAccessState>({
    base: false,
    freelancer: false,
    ai_hub: false,
    isLoading: true
  });

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setAccess({
            base: false,
            freelancer: false,
            ai_hub: false,
            isLoading: false
          });
          return;
        }

        // Get all active products for user
        const { data, error } = await supabase.rpc('get_user_products');

        if (error) {
          console.error('Error checking product access:', error);
          setAccess(prev => ({ ...prev, isLoading: false }));
          return;
        }

        const products = data || [];
        
        setAccess({
          base: products.some((p: { product_type: string }) => p.product_type === 'base'),
          freelancer: products.some((p: { product_type: string }) => p.product_type === 'freelancer'),
          ai_hub: false, // TRAVADO até segunda ordem - não liberamos AI Hub ainda
          isLoading: false
        });
      } catch (error) {
        console.error('Error in useProductAccess:', error);
        setAccess(prev => ({ ...prev, isLoading: false }));
      }
    };

    checkAccess();
  }, []);

  const hasAccess = (productType: ProductType): boolean => {
    return access[productType];
  };

  return { ...access, hasAccess };
};
