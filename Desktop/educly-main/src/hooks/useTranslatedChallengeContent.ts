import { useTranslation } from "react-i18next";

export const useTranslatedChallengeContent = () => {
  const { t, i18n } = useTranslation();

  // Helper: try translation, fallback to English, then fallback value
  const tryTranslation = (key: string, fallback: string): string => {
    // 1. Try current language
    let translated = t(key, { defaultValue: "" });
    if (translated && translated !== key && translated.trim() !== "") return translated;

    // 2. Try English as universal fallback
    if (i18n.language !== "en") {
      translated = t(key, { lng: "en", defaultValue: "" });
      if (translated && translated !== key && translated.trim() !== "") return translated;
    }

    // 3. Use fallback (from database)
    return fallback;
  };

  // --- NOVA FUNÇÃO: Normaliza slugs para chaves de tradução ---
  const normalizeSlugForTranslation = (slug: string): string => {
    const slugMap: Record<string, string> = {
      "captions-ai": "captions",
      // Adicione outros mapeamentos aqui se necessário
    };
    return slugMap[slug] || slug;
  };
  // -----------------------------------------------------------

  // --- NOVA FUNÇÃO: Mapeia dia global (1-28) para dia relativo da ferramenta (1-4) ---
  const getRelativeDayNumber = (aiSlug: string, globalDay: number): number => {
    // Se o dia for menor que 5, assume que é ChatGPT ou já é relativo
    if (globalDay <= 0) return 1;

    // Normaliza o slug antes de verificar os intervalos
    const normalizedSlug = normalizeSlugForTranslation(aiSlug);

    // Definição dos intervalos de dias para cada IA no desafio de 28 dias
    const aiDayRanges: Record<string, { start: number; end: number }> = {
      chatgpt: { start: 1, end: 4 },
      claude: { start: 5, end: 7 },
      deepseek: { start: 8, end: 10 },
      gemini: { start: 11, end: 13 },
      nanobanana: { start: 14, end: 17 },
      lovable: { start: 18, end: 21 },
      captions: { start: 22, end: 24 },
      elevenlabs: { start: 25, end: 28 },
    };

    const range = aiDayRanges[normalizedSlug];

    // Se o dia global estiver dentro do intervalo da IA, calcula o relativo
    if (range && globalDay >= range.start && globalDay <= range.end) {
      return globalDay - range.start + 1;
    }

    // Se não encontrar intervalo (ex: acessando a ferramenta direto fora do challenge), retorna o dia original
    return globalDay;
  };
  // -----------------------------------------------------------------------------------

  // Traduz nome do desafio
  const getChallengeName = (slug: string, fallback: string) => {
    const key = `challenges.${slug}.name`;
    return tryTranslation(key, fallback);
  };

  // Traduz descrição do desafio
  const getChallengeDescription = (slug: string, fallback: string) => {
    const key = `challenges.${slug}.description`;
    return tryTranslation(key, fallback);
  };

  // Traduz título do dia - com suporte a challenge-specific translations
  const getDayTitle = (challengeSlug: string, dayNumber: number, aiSlug: string, fallback: string) => {
    // 1. Tenta tradução específica do desafio primeiro (Usa dia Global)
    const challengeKey = `challenges.${challengeSlug}.days.${dayNumber}.title`;
    let translated = t(challengeKey, { defaultValue: "" });
    if (translated && translated !== challengeKey && translated.trim() !== "") return translated;

    // 2. Fallback para tradução genérica por AI tool (Usa dia Relativo)
    const relativeDay = getRelativeDayNumber(aiSlug, dayNumber);
    const normalizedSlug = normalizeSlugForTranslation(aiSlug);
    const genericKey = `challengeDays.${normalizedSlug}.${relativeDay}.title`;

    translated = t(genericKey, { defaultValue: "" });
    if (translated && translated !== genericKey && translated.trim() !== "") return translated;

    // 3. Try English
    if (i18n.language !== "en") {
      translated = t(genericKey, { lng: "en", defaultValue: "" });
      if (translated && translated !== genericKey && translated.trim() !== "") return translated;
    }

    return fallback;
  };

  // Traduz descrição do dia - com suporte a challenge-specific translations
  const getDayDescription = (challengeSlug: string, dayNumber: number, aiSlug: string, fallback: string) => {
    // 1. Tenta tradução específica do desafio primeiro (Usa dia Global)
    const challengeKey = `challenges.${challengeSlug}.days.${dayNumber}.description`;
    let translated = t(challengeKey, { defaultValue: "" });
    if (translated && translated !== challengeKey && translated.trim() !== "") return translated;

    // 2. Fallback para tradução genérica por AI tool (Usa dia Relativo)
    const relativeDay = getRelativeDayNumber(aiSlug, dayNumber);
    const normalizedSlug = normalizeSlugForTranslation(aiSlug);
    const genericKey = `challengeDays.${normalizedSlug}.${relativeDay}.description`;

    translated = t(genericKey, { defaultValue: "" });
    if (translated && translated !== genericKey && translated.trim() !== "") return translated;

    // 3. Try English
    if (i18n.language !== "en") {
      translated = t(genericKey, { lng: "en", defaultValue: "" });
      if (translated && translated !== genericKey && translated.trim() !== "") return translated;
    }

    return fallback;
  };

  // Traduz título do passo
  const getStepTitle = (aiSlug: string, dayNumber: number, stepNumber: number, fallback: string) => {
    // Converte para dia relativo antes de buscar a chave e normaliza o slug
    const relativeDay = getRelativeDayNumber(aiSlug, dayNumber);
    const normalizedSlug = normalizeSlugForTranslation(aiSlug);
    const key = `lessonSteps.${normalizedSlug}.${relativeDay}.${stepNumber}.title`;
    return tryTranslation(key, fallback);
  };

  // Traduz conteúdo do passo
  const getStepContent = (aiSlug: string, dayNumber: number, stepNumber: number, fallback: string) => {
    // Converte para dia relativo antes de buscar a chave e normaliza o slug
    const relativeDay = getRelativeDayNumber(aiSlug, dayNumber);
    const normalizedSlug = normalizeSlugForTranslation(aiSlug);
    const key = `lessonSteps.${normalizedSlug}.${relativeDay}.${stepNumber}.content`;
    return tryTranslation(key, fallback);
  };

  // Traduz pergunta do quiz
  const getQuizQuestion = (aiSlug: string, dayNumber: number, stepNumber: number, fallback: string) => {
    // Converte para dia relativo antes de buscar a chave e normaliza o slug
    const relativeDay = getRelativeDayNumber(aiSlug, dayNumber);
    const normalizedSlug = normalizeSlugForTranslation(aiSlug);
    const key = `lessonSteps.${normalizedSlug}.${relativeDay}.${stepNumber}.question`;
    return tryTranslation(key, fallback);
  };

  // Traduz opções do quiz
  const getQuizOptions = (
    aiSlug: string,
    dayNumber: number,
    stepNumber: number,
    fallback: { text: string; isCorrect: boolean }[],
  ) => {
    // Converte para dia relativo antes de buscar a chave e normaliza o slug
    const relativeDay = getRelativeDayNumber(aiSlug, dayNumber);
    const normalizedSlug = normalizeSlugForTranslation(aiSlug);
    const key = `lessonSteps.${normalizedSlug}.${relativeDay}.${stepNumber}.options`;

    // Try current language
    let translated = t(key, { returnObjects: true, defaultValue: null });

    if (Array.isArray(translated) && translated.length > 0) {
      return translated.map((opt: any, i: number) => ({
        text: opt.text || fallback[i]?.text || "",
        isCorrect: typeof opt.isCorrect === "boolean" ? opt.isCorrect : fallback[i]?.isCorrect || false,
      }));
    }

    // Try English
    if (i18n.language !== "en") {
      translated = t(key, { lng: "en", returnObjects: true, defaultValue: null });
      if (Array.isArray(translated) && translated.length > 0) {
        return translated.map((opt: any, i: number) => ({
          text: opt.text || fallback[i]?.text || "",
          isCorrect: typeof opt.isCorrect === "boolean" ? opt.isCorrect : fallback[i]?.isCorrect || false,
        }));
      }
    }

    return fallback;
  };

  return {
    getChallengeName,
    getChallengeDescription,
    getDayTitle,
    getDayDescription,
    getStepTitle,
    getStepContent,
    getQuizQuestion,
    getQuizOptions,
  };
};
