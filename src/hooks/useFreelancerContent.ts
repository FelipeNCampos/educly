import { useState, useEffect, useCallback } from "react";
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

interface ModuleInfo {
  id: string;
  title: string;
  description: string;
  icon: string;
  steps: LessonStep[];
}

interface FreelancerContent {
  [key: string]: ModuleInfo;
}

// Cache for loaded freelancer content
const freelancerCache: Record<string, FreelancerContent> = {};

// Register cache clear function for version updates
registerCacheClear(() => {
  Object.keys(freelancerCache).forEach(key => delete freelancerCache[key]);
  console.log('🧹 Freelancer content cache cleared');
});

// Lazy load freelancer content by language using fetch
const loadFreelancerContent = async (lang: string): Promise<FreelancerContent | null> => {
  const isDev = import.meta.env.DEV;
  
  if (!isDev && freelancerCache[lang]) {
    return freelancerCache[lang];
  }

  // Supported languages for freelancer content - ES is primary
  const supportedLanguages = ['es', 'pt', 'en', 'fr'];
  const targetLang = supportedLanguages.includes(lang) ? lang : 'es'; // Default to Spanish

  try {
    // Always add version for cache-busting (dev uses timestamp, prod uses build version)
    const cacheBuster = isDev ? `?t=${Date.now()}` : `?v=${APP_VERSION}`;
    const response = await fetch(`/i18n/lessonContent/${targetLang}-freelancer.json${cacheBuster}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch freelancer content for ${targetLang}`);
    }
    
    const rawText = await response.text();
    
    try {
      const content = JSON.parse(rawText);
      freelancerCache[lang] = content;
      console.log(`✅ Loaded ${targetLang}-freelancer.json successfully with ${Object.keys(content).length} modules`);
      return freelancerCache[lang];
    } catch (parseError) {
      const errorMsg = parseError instanceof Error ? parseError.message : 'Unknown parse error';
      console.error(`❌ JSON SYNTAX ERROR in ${targetLang}-freelancer.json:`);
      console.error(`   ${errorMsg}`);
      throw parseError;
    }
  } catch (error) {
    console.warn(`Failed to load freelancer content for ${lang}:`, error);
    
    // Fallback to Spanish if not already
    if (targetLang !== 'es') {
      console.log(`⚠️ Falling back to Spanish freelancer content...`);
      try {
        const cacheBuster = isDev ? `?t=${Date.now()}` : `?v=${APP_VERSION}`;
        const fallbackResponse = await fetch(`/i18n/lessonContent/es-freelancer.json${cacheBuster}`);
        if (fallbackResponse.ok) {
          const fallbackText = await fallbackResponse.text();
          const fallbackContent = JSON.parse(fallbackText);
          freelancerCache[lang] = fallbackContent;
          console.log(`✅ Loaded Spanish fallback successfully`);
          return freelancerCache[lang];
        }
      } catch (fallbackError) {
        console.error('❌ Failed to load Spanish fallback:', fallbackError);
      }
    }
    return null;
  }
};

export const useFreelancerContent = () => {
  const { i18n } = useTranslation();
  const [freelancerContent, setFreelancerContent] = useState<FreelancerContent | null>(
    freelancerCache[i18n.language] || null
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadContent = async () => {
      const isDev = import.meta.env.DEV;
      
      if (!isDev && freelancerCache[i18n.language]) {
        setFreelancerContent(freelancerCache[i18n.language]);
        return;
      }

      setIsLoading(true);
      const content = await loadFreelancerContent(i18n.language);
      setFreelancerContent(content);
      setIsLoading(false);
    };

    loadContent();
  }, [i18n.language]);

  const getModuleContent = useCallback((moduleNumber: number): LessonStep[] => {
    if (!freelancerContent) {
      return [];
    }

    const moduleKey = `module${moduleNumber}`;
    const moduleData = freelancerContent[moduleKey];

    if (!moduleData || !moduleData.steps || !Array.isArray(moduleData.steps)) {
      return [];
    }

    return moduleData.steps.map((step) => {
      const baseStep: LessonStep = {
        type: step.type as StepType,
        title: step.title,
        content: step.content,
        image: step.image,
        question: step.question,
        explanation: step.explanation,
        componentName: step.componentName,
        props: step.props,
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
  }, [freelancerContent]);

  const getModuleInfo = useCallback((moduleNumber: number): { title: string; description: string; icon: string } | null => {
    if (!freelancerContent) {
      return null;
    }

    const moduleKey = `module${moduleNumber}`;
    const moduleData = freelancerContent[moduleKey];

    if (!moduleData) {
      return null;
    }

    return {
      title: moduleData.title,
      description: moduleData.description,
      icon: moduleData.icon,
    };
  }, [freelancerContent]);

  const getAllModules = useCallback((): Array<{ 
    id: string; 
    moduleNumber: number; 
    title: string; 
    description: string; 
    icon: string;
    totalSteps: number;
    hasContent: boolean;
  }> => {
    if (!freelancerContent) {
      return [];
    }

    return Object.entries(freelancerContent)
      .filter(([key]) => key.startsWith('module'))
      .map(([key, module]) => ({
        id: key,
        moduleNumber: parseInt(key.replace('module', '')),
        title: module.title,
        description: module.description,
        icon: module.icon,
        totalSteps: module.steps?.length || 0,
        hasContent: (module.steps?.length || 0) > 0,
      }))
      .sort((a, b) => a.moduleNumber - b.moduleNumber);
  }, [freelancerContent]);

  return {
    getModuleContent,
    getModuleInfo,
    getAllModules,
    currentLanguage: i18n.language,
    isLoading,
  };
};
