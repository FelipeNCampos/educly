import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { registerCacheClear } from "./useContentVersioning";

// Get the build version for cache-busting
declare const __APP_VERSION__: string;
const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : Date.now().toString();

type StepType = "text" | "quiz" | "practical" | "component";

interface LessonStep {
  type: StepType;
  title?: string;
  content?: string;
  image?: string;
  question?: string;
  options?: { text: string; isCorrect: boolean }[];
  explanation?: string;
  initialWords?: string[];
  correctOrder?: string[];
  componentName?: string;
  props?: Record<string, unknown>;
}

// Cache for loaded lesson content
const lessonCache: Record<string, Record<string, { steps: LessonStep[] }>> = {};

// Register cache clear function for version updates
registerCacheClear(() => {
  Object.keys(lessonCache).forEach(key => delete lessonCache[key]);
  console.log('🧹 Lesson content cache cleared');
});

// Normalize language code (pt-BR → pt)
const normalizeLanguage = (lang: string): string => {
  return lang?.split('-')[0] || 'en';
};

// Lazy load lesson content by language using fetch (avoids TS-Go compiler issues)
const loadLessonContent = async (lang: string): Promise<Record<string, { steps: LessonStep[] }> | null> => {
  // Normalize language first (pt-BR → pt)
  const normalizedLang = normalizeLanguage(lang);
  
  // In development, skip cache to allow live reloading of content
  const isDev = import.meta.env.DEV;
  
  if (!isDev && lessonCache[normalizedLang]) {
    console.log(`📦 Using cached content for ${normalizedLang}`);
    return lessonCache[normalizedLang];
  }

  const supportedLanguages = ['pt', 'en', 'es', 'ru', 'fr', 'de', 'it'];
  const targetLang = supportedLanguages.includes(normalizedLang) ? normalizedLang : 'en';

  console.log(`🌍 i18n.language: ${lang} → normalized: ${normalizedLang} → target: ${targetLang}`);

  try {
    // Always add version for cache-busting (dev uses timestamp, prod uses build version)
    const cacheBuster = isDev ? `?t=${Date.now()}` : `?v=${APP_VERSION}`;
    const url = `/i18n/lessonContent/${targetLang}-lessons.json${cacheBuster}`;
    
    console.log(`📂 Carregando: ${targetLang}-lessons.json`);
    console.log(`🔗 URL: ${url}`);
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch lesson content for ${targetLang}`);
    }
    
    // Get raw text first to provide better error messages
    const rawText = await response.text();
    
    try {
      const content = JSON.parse(rawText);
      lessonCache[normalizedLang] = content;
      console.log(`✅ Loaded ${targetLang}-lessons.json successfully with ${Object.keys(content).length} days`);
      return lessonCache[normalizedLang];
    } catch (parseError) {
      // Provide helpful error message with position
      const errorMsg = parseError instanceof Error ? parseError.message : 'Unknown parse error';
      console.error(`❌ JSON SYNTAX ERROR in ${targetLang}-lessons.json:`);
      console.error(`   ${errorMsg}`);
      console.error(`   Fix the JSON file and reload the page.`);
      throw parseError;
    }
  } catch (error) {
    console.warn(`Failed to load lesson content for ${lang}:`, error);
    // Fallback to English if not already
    if (targetLang !== 'en') {
      console.log(`⚠️ Falling back to English lessons...`);
      try {
        const cacheBuster = isDev ? `?t=${Date.now()}` : `?v=${APP_VERSION}`;
        const fallbackResponse = await fetch(`/i18n/lessonContent/en-lessons.json${cacheBuster}`);
        if (fallbackResponse.ok) {
          const fallbackText = await fallbackResponse.text();
          const fallbackContent = JSON.parse(fallbackText);
          lessonCache[normalizedLang] = fallbackContent;
          console.log(`✅ Loaded English fallback successfully`);
          return lessonCache[normalizedLang];
        }
      } catch (fallbackError) {
        console.error('❌ Failed to load English fallback:', fallbackError);
      }
    }
    return null;
  }
};

export const useTranslatedLessonContent = () => {
  const { i18n, ready } = useTranslation();
  const [lessonContent, setLessonContent] = useState<Record<string, { steps: LessonStep[] }> | null>(null);
  const [contentLanguage, setContentLanguage] = useState<string>(''); // Track which language the content belongs to
  const [isLoading, setIsLoading] = useState(true); // Start as true until i18n is ready
  const prevLangRef = useRef<string>('');

  useEffect(() => {
    // DON'T load until i18n is ready (language detection complete)
    if (!ready) {
      console.log('⏳ Aguardando i18n ficar pronto...');
      setIsLoading(true);
      return;
    }

    const currentLang = normalizeLanguage(i18n.language);
    
    // If language changed, clear previous language cache AND reset state
    if (prevLangRef.current && prevLangRef.current !== currentLang) {
      console.log(`🔄 Idioma mudou de ${prevLangRef.current} para ${currentLang}, limpando cache e estado...`);
      delete lessonCache[prevLangRef.current];
      // Clear current content to force re-render with new language
      setLessonContent(null);
      setContentLanguage('');
    }
    
    prevLangRef.current = currentLang;

    const loadContent = async () => {
      const isDev = import.meta.env.DEV;
      
      // In dev mode, always reload; in prod, use cache
      if (!isDev && lessonCache[currentLang]) {
        console.log(`📦 Usando cache para ${currentLang}`);
        setLessonContent(lessonCache[currentLang]);
        setContentLanguage(currentLang);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const content = await loadLessonContent(i18n.language);
      setLessonContent(content);
      setContentLanguage(currentLang);
      console.log(`🌐 Conteúdo carregado e estado atualizado para: ${currentLang}`);
      setIsLoading(false);
    };

    loadContent();
  }, [i18n.language, ready]);

  const getLessonContent = useCallback((dayNumber: number): LessonStep[] => {
    const currentLang = normalizeLanguage(i18n.language);
    
    // Don't return stale content from wrong language
    if (!lessonContent || contentLanguage !== currentLang) {
      console.log(`⏳ Aguardando conteúdo para ${currentLang} (atual: ${contentLanguage || 'nenhum'})`);
      return [];
    }

    const dayKey = `day${dayNumber}`;
    const dayData = lessonContent[dayKey];

    if (!dayData || !dayData.steps || !Array.isArray(dayData.steps)) {
      return [];
    }

    console.log(`📚 Day ${dayNumber} - Retornando ${dayData.steps.length} steps para idioma: ${contentLanguage}`);

    return dayData.steps.map((step) => {
      const baseStep: LessonStep = {
        type: step.type as StepType,
        title: step.title as string | undefined,
        content: step.content as string | undefined,
        image: step.image as string | undefined,
        question: step.question as string | undefined,
        explanation: step.explanation as string | undefined,
        componentName: step.componentName as string | undefined,
        props: step.props as Record<string, unknown> | undefined,
      };

      if (step.options && Array.isArray(step.options)) {
        baseStep.options = step.options as { text: string; isCorrect: boolean }[];
      }

      if (step.initialWords && Array.isArray(step.initialWords)) {
        baseStep.initialWords = step.initialWords as string[];
      }
      if (step.correctOrder && Array.isArray(step.correctOrder)) {
        baseStep.correctOrder = step.correctOrder as string[];
      }

      return baseStep;
    });
  }, [lessonContent, contentLanguage, i18n.language]);

  return {
    getLessonContent,
    currentLanguage: normalizeLanguage(i18n.language),
    contentLanguage, // Expose which language the content is actually for
    isLoading,
  };
};
