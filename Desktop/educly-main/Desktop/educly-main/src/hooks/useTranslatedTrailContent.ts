import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';

interface GeneratedDay {
  day: number;
  tool: string;
  focus: string;
  exercise: string;
}

interface TranslatedContent {
  [key: string]: GeneratedDay[];
}

// Cache translations in memory to avoid repeated API calls
const translationCache: TranslatedContent = {};

export const useTranslatedTrailContent = (
  plan: GeneratedDay[] | undefined,
  originalLanguage: string | undefined,
  planId: string | undefined
) => {
  const { i18n } = useTranslation();
  const [translatedPlan, setTranslatedPlan] = useState<GeneratedDay[]>([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentLang = i18n.language?.split('-')[0] || 'pt';
  const sourceLang = originalLanguage?.split('-')[0] || 'pt';
  const cacheKey = planId ? `${planId}_${currentLang}` : '';

  const translateContent = useCallback(async () => {
    if (!plan || plan.length === 0 || !planId) {
      return;
    }

    // If same language, use original
    if (currentLang === sourceLang) {
      setTranslatedPlan(plan);
      return;
    }

    // Check cache first
    if (translationCache[cacheKey]) {
      setTranslatedPlan(translationCache[cacheKey]);
      return;
    }

    setIsTranslating(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('translate-trail-content', {
        body: {
          plan,
          targetLanguage: currentLang,
          sourceLanguage: sourceLang
        }
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data?.translatedPlan) {
        translationCache[cacheKey] = data.translatedPlan;
        setTranslatedPlan(data.translatedPlan);
      } else {
        // Fallback to original if translation failed
        setTranslatedPlan(plan);
      }
    } catch (err) {
      console.error('Translation error:', err);
      setError(err instanceof Error ? err.message : 'Translation failed');
      // Fallback to original
      setTranslatedPlan(plan);
    } finally {
      setIsTranslating(false);
    }
  }, [plan, planId, currentLang, sourceLang, cacheKey]);

  useEffect(() => {
    translateContent();
  }, [translateContent]);

  return {
    translatedPlan,
    isTranslating,
    error,
    isTranslated: currentLang !== sourceLang && translatedPlan.length > 0
  };
};
