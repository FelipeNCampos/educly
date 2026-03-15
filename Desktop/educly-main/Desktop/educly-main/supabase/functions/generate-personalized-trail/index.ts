import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Brief {
  goal: string;
  level: string;
  time: string;
  interest: string;
  specific_project: string;
  freeText?: string;
  language?: string;
}

interface GeneratedDay {
  day: number;
  tool: string;
  focus: string;
  exercise: string;
}

// Language-specific prompts and content
const languageConfig: Record<string, {
  systemPrompt: string;
  goalMap: Record<string, string>;
  levelMap: Record<string, string>;
  interestMap: Record<string, string>;
  timeMap: Record<string, string>;
  fallbackContent: {
    week1Focus: string;
    week2Focus: string;
    week3Focus: string;
    week4Focus: string;
    week1Exercise: string;
    week2Exercise: string;
    week3Exercise: string;
    week4Exercise: string;
  };
  errorMessages: {
    rateLimit: string;
    paymentRequired: string;
    generic: string;
  };
}> = {
  pt: {
    systemPrompt: `Você é um especialista em educação de Inteligência Artificial. Sua tarefa é criar trilhas de aprendizado personalizadas de 28 dias.

FERRAMENTAS DISPONÍVEIS (use apenas estas):
1. chatgpt - Para planejamento, ideias, consultoria, escrita geral
2. claude - Para copywriting, textos persuasivos, análise de conteúdo
3. deepseek - Para geração e revisão de código
4. gemini - Para pesquisa, análise de dados, comparações
5. nanobanana - Para geração de arte e imagens
6. lovable - Para criar websites e aplicativos sem código
7. captions - Para edição de vídeo com IA
8. elevenlabs - Para geração de voz e áudio

REGRAS OBRIGATÓRIAS:
1. Criar EXATAMENTE 28 dias
2. Progressão clara: Semana 1 (fundamentos) → Semana 2 (prática) → Semana 3 (projetos) → Semana 4 (aplicação real)
3. Adaptar ao objetivo e nível do usuário
4. Cada dia deve ter um foco específico e um exercício prático
5. Distribuir as ferramentas de forma inteligente baseada no interesse do usuário
6. NUNCA repetir o mesmo conteúdo
7. Os exercícios devem ser realizáveis no tempo disponível

FORMATO DE RESPOSTA (JSON válido, sem markdown):
[
  {"day": 1, "tool": "chatgpt", "focus": "Introdução ao ChatGPT", "exercise": "Criar 3 prompts para seu contexto profissional"},
  {"day": 2, "tool": "chatgpt", "focus": "...", "exercise": "..."},
  ...até o dia 28
]`,
    goalMap: {
      work: "melhorar entregas no trabalho",
      extra_income: "gerar renda extra como freelancer",
      business: "criar um negócio próprio",
      curiosity: "aprender e explorar IAs"
    },
    levelMap: {
      never: "iniciante absoluto",
      basic: "uso básico de IA",
      intermediate: "uso intermediário de IAs"
    },
    interestMap: {
      text: "texto e escrita",
      code: "programação e desenvolvimento",
      image: "imagens e arte visual",
      video: "vídeo e áudio"
    },
    timeMap: {
      "15min": "15 minutos por dia",
      "30min": "30 minutos por dia",
      "1hour": "1 hora ou mais por dia"
    },
    fallbackContent: {
      week1Focus: "Fundamentos de",
      week2Focus: "Técnicas intermediárias com",
      week3Focus: "Projeto prático com",
      week4Focus: "Aplicação avançada de",
      week1Exercise: "Explore a interface e faça 3 prompts básicos",
      week2Exercise: "Aplique o que aprendeu em um caso real do seu dia a dia",
      week3Exercise: "Crie algo concreto usando as técnicas aprendidas",
      week4Exercise: "Integre no seu fluxo de trabalho diário"
    },
    errorMessages: {
      rateLimit: "Muitas requisições. Tente novamente em alguns segundos.",
      paymentRequired: "Créditos insuficientes. Entre em contato com o suporte.",
      generic: "Erro ao gerar trilha"
    }
  },
  en: {
    systemPrompt: `You are an AI education expert. Your task is to create personalized 28-day learning trails.

AVAILABLE TOOLS (use only these):
1. chatgpt - For planning, ideas, consulting, general writing
2. claude - For copywriting, persuasive texts, content analysis
3. deepseek - For code generation and review
4. gemini - For research, data analysis, comparisons
5. nanobanana - For AI art and image generation
6. lovable - For creating websites and apps without code
7. captions - For AI video editing
8. elevenlabs - For voice and audio generation

MANDATORY RULES:
1. Create EXACTLY 28 days
2. Clear progression: Week 1 (fundamentals) → Week 2 (practice) → Week 3 (projects) → Week 4 (real application)
3. Adapt to user's goal and level
4. Each day must have a specific focus and practical exercise
5. Distribute tools intelligently based on user interest
6. NEVER repeat the same content
7. Exercises must be doable in the available time

RESPONSE FORMAT (valid JSON, no markdown):
[
  {"day": 1, "tool": "chatgpt", "focus": "Introduction to ChatGPT", "exercise": "Create 3 prompts for your professional context"},
  {"day": 2, "tool": "chatgpt", "focus": "...", "exercise": "..."},
  ...until day 28
]`,
    goalMap: {
      work: "improve work deliverables",
      extra_income: "generate extra income as freelancer",
      business: "create your own business",
      curiosity: "learn and explore AIs"
    },
    levelMap: {
      never: "absolute beginner",
      basic: "basic AI usage",
      intermediate: "intermediate AI usage"
    },
    interestMap: {
      text: "text and writing",
      code: "programming and development",
      image: "images and visual art",
      video: "video and audio"
    },
    timeMap: {
      "15min": "15 minutes per day",
      "30min": "30 minutes per day",
      "1hour": "1 hour or more per day"
    },
    fallbackContent: {
      week1Focus: "Fundamentals of",
      week2Focus: "Intermediate techniques with",
      week3Focus: "Practical project with",
      week4Focus: "Advanced application of",
      week1Exercise: "Explore the interface and create 3 basic prompts",
      week2Exercise: "Apply what you learned to a real case from your daily life",
      week3Exercise: "Create something concrete using the techniques learned",
      week4Exercise: "Integrate into your daily workflow"
    },
    errorMessages: {
      rateLimit: "Too many requests. Try again in a few seconds.",
      paymentRequired: "Insufficient credits. Contact support.",
      generic: "Error generating trail"
    }
  },
  fr: {
    systemPrompt: `Vous êtes un expert en éducation IA. Votre tâche est de créer des parcours d'apprentissage personnalisés de 28 jours.

OUTILS DISPONIBLES (utilisez uniquement ceux-ci):
1. chatgpt - Pour la planification, les idées, le conseil, l'écriture générale
2. claude - Pour le copywriting, les textes persuasifs, l'analyse de contenu
3. deepseek - Pour la génération et la révision de code
4. gemini - Pour la recherche, l'analyse de données, les comparaisons
5. nanobanana - Pour la génération d'art et d'images IA
6. lovable - Pour créer des sites web et des applications sans code
7. captions - Pour l'édition vidéo IA
8. elevenlabs - Pour la génération de voix et d'audio

RÈGLES OBLIGATOIRES:
1. Créer EXACTEMENT 28 jours
2. Progression claire: Semaine 1 (fondamentaux) → Semaine 2 (pratique) → Semaine 3 (projets) → Semaine 4 (application réelle)
3. Adapter à l'objectif et au niveau de l'utilisateur
4. Chaque jour doit avoir un focus spécifique et un exercice pratique
5. Distribuer les outils intelligemment selon l'intérêt de l'utilisateur
6. NE JAMAIS répéter le même contenu
7. Les exercices doivent être réalisables dans le temps disponible

FORMAT DE RÉPONSE (JSON valide, sans markdown):
[
  {"day": 1, "tool": "chatgpt", "focus": "Introduction à ChatGPT", "exercise": "Créer 3 prompts pour votre contexte professionnel"},
  {"day": 2, "tool": "chatgpt", "focus": "...", "exercise": "..."},
  ...jusqu'au jour 28
]`,
    goalMap: {
      work: "améliorer les livrables au travail",
      extra_income: "générer un revenu supplémentaire en freelance",
      business: "créer votre propre entreprise",
      curiosity: "apprendre et explorer les IAs"
    },
    levelMap: {
      never: "débutant absolu",
      basic: "utilisation basique de l'IA",
      intermediate: "utilisation intermédiaire des IAs"
    },
    interestMap: {
      text: "texte et écriture",
      code: "programmation et développement",
      image: "images et art visuel",
      video: "vidéo et audio"
    },
    timeMap: {
      "15min": "15 minutes par jour",
      "30min": "30 minutes par jour",
      "1hour": "1 heure ou plus par jour"
    },
    fallbackContent: {
      week1Focus: "Fondamentaux de",
      week2Focus: "Techniques intermédiaires avec",
      week3Focus: "Projet pratique avec",
      week4Focus: "Application avancée de",
      week1Exercise: "Explorez l'interface et créez 3 prompts de base",
      week2Exercise: "Appliquez ce que vous avez appris à un cas réel de votre quotidien",
      week3Exercise: "Créez quelque chose de concret avec les techniques apprises",
      week4Exercise: "Intégrez dans votre flux de travail quotidien"
    },
    errorMessages: {
      rateLimit: "Trop de requêtes. Réessayez dans quelques secondes.",
      paymentRequired: "Crédits insuffisants. Contactez le support.",
      generic: "Erreur lors de la génération du parcours"
    }
  },
  es: {
    systemPrompt: `Eres un experto en educación de IA. Tu tarea es crear rutas de aprendizaje personalizadas de 28 días.

HERRAMIENTAS DISPONIBLES (usa solo estas):
1. chatgpt - Para planificación, ideas, consultoría, escritura general
2. claude - Para copywriting, textos persuasivos, análisis de contenido
3. deepseek - Para generación y revisión de código
4. gemini - Para investigación, análisis de datos, comparaciones
5. nanobanana - Para generación de arte e imágenes con IA
6. lovable - Para crear sitios web y aplicaciones sin código
7. captions - Para edición de video con IA
8. elevenlabs - Para generación de voz y audio

REGLAS OBLIGATORIAS:
1. Crear EXACTAMENTE 28 días
2. Progresión clara: Semana 1 (fundamentos) → Semana 2 (práctica) → Semana 3 (proyectos) → Semana 4 (aplicación real)
3. Adaptar al objetivo y nivel del usuario
4. Cada día debe tener un enfoque específico y un ejercicio práctico
5. Distribuir las herramientas inteligentemente según el interés del usuario
6. NUNCA repetir el mismo contenido
7. Los ejercicios deben ser realizables en el tiempo disponible

FORMATO DE RESPUESTA (JSON válido, sin markdown):
[
  {"day": 1, "tool": "chatgpt", "focus": "Introducción a ChatGPT", "exercise": "Crear 3 prompts para tu contexto profesional"},
  {"day": 2, "tool": "chatgpt", "focus": "...", "exercise": "..."},
  ...hasta el día 28
]`,
    goalMap: {
      work: "mejorar entregas en el trabajo",
      extra_income: "generar ingresos extra como freelancer",
      business: "crear tu propio negocio",
      curiosity: "aprender y explorar IAs"
    },
    levelMap: {
      never: "principiante absoluto",
      basic: "uso básico de IA",
      intermediate: "uso intermedio de IAs"
    },
    interestMap: {
      text: "texto y escritura",
      code: "programación y desarrollo",
      image: "imágenes y arte visual",
      video: "video y audio"
    },
    timeMap: {
      "15min": "15 minutos por día",
      "30min": "30 minutos por día",
      "1hour": "1 hora o más por día"
    },
    fallbackContent: {
      week1Focus: "Fundamentos de",
      week2Focus: "Técnicas intermedias con",
      week3Focus: "Proyecto práctico con",
      week4Focus: "Aplicación avanzada de",
      week1Exercise: "Explora la interfaz y crea 3 prompts básicos",
      week2Exercise: "Aplica lo aprendido a un caso real de tu día a día",
      week3Exercise: "Crea algo concreto usando las técnicas aprendidas",
      week4Exercise: "Integra en tu flujo de trabajo diario"
    },
    errorMessages: {
      rateLimit: "Demasiadas solicitudes. Intenta de nuevo en unos segundos.",
      paymentRequired: "Créditos insuficientes. Contacta al soporte.",
      generic: "Error al generar la ruta"
    }
  },
  de: {
    systemPrompt: `Sie sind ein KI-Bildungsexperte. Ihre Aufgabe ist es, personalisierte 28-Tage-Lernpfade zu erstellen.

VERFÜGBARE TOOLS (nur diese verwenden):
1. chatgpt - Für Planung, Ideen, Beratung, allgemeines Schreiben
2. claude - Für Copywriting, überzeugende Texte, Content-Analyse
3. deepseek - Für Code-Generierung und -Review
4. gemini - Für Recherche, Datenanalyse, Vergleiche
5. nanobanana - Für KI-Kunst und Bildgenerierung
6. lovable - Für die Erstellung von Websites und Apps ohne Code
7. captions - Für KI-Videobearbeitung
8. elevenlabs - Für Sprach- und Audiogenerierung

OBLIGATORISCHE REGELN:
1. GENAU 28 Tage erstellen
2. Klare Progression: Woche 1 (Grundlagen) → Woche 2 (Praxis) → Woche 3 (Projekte) → Woche 4 (echte Anwendung)
3. An Ziel und Niveau des Benutzers anpassen
4. Jeder Tag muss einen spezifischen Fokus und eine praktische Übung haben
5. Tools intelligent nach Benutzerinteresse verteilen
6. NIEMALS den gleichen Inhalt wiederholen
7. Übungen müssen in der verfügbaren Zeit machbar sein

ANTWORTFORMAT (gültiges JSON, kein Markdown):
[
  {"day": 1, "tool": "chatgpt", "focus": "Einführung in ChatGPT", "exercise": "3 Prompts für Ihren beruflichen Kontext erstellen"},
  {"day": 2, "tool": "chatgpt", "focus": "...", "exercise": "..."},
  ...bis Tag 28
]`,
    goalMap: {
      work: "Arbeitsergebnisse verbessern",
      extra_income: "Zusatzeinkommen als Freelancer generieren",
      business: "eigenes Unternehmen gründen",
      curiosity: "KIs lernen und erkunden"
    },
    levelMap: {
      never: "absoluter Anfänger",
      basic: "grundlegende KI-Nutzung",
      intermediate: "fortgeschrittene KI-Nutzung"
    },
    interestMap: {
      text: "Text und Schreiben",
      code: "Programmierung und Entwicklung",
      image: "Bilder und visuelle Kunst",
      video: "Video und Audio"
    },
    timeMap: {
      "15min": "15 Minuten pro Tag",
      "30min": "30 Minuten pro Tag",
      "1hour": "1 Stunde oder mehr pro Tag"
    },
    fallbackContent: {
      week1Focus: "Grundlagen von",
      week2Focus: "Fortgeschrittene Techniken mit",
      week3Focus: "Praktisches Projekt mit",
      week4Focus: "Fortgeschrittene Anwendung von",
      week1Exercise: "Erkunden Sie die Oberfläche und erstellen Sie 3 einfache Prompts",
      week2Exercise: "Wenden Sie das Gelernte auf einen echten Fall aus Ihrem Alltag an",
      week3Exercise: "Erstellen Sie etwas Konkretes mit den erlernten Techniken",
      week4Exercise: "Integrieren Sie es in Ihren täglichen Arbeitsablauf"
    },
    errorMessages: {
      rateLimit: "Zu viele Anfragen. Versuchen Sie es in einigen Sekunden erneut.",
      paymentRequired: "Unzureichendes Guthaben. Kontaktieren Sie den Support.",
      generic: "Fehler beim Generieren des Lernpfads"
    }
  },
  it: {
    systemPrompt: `Sei un esperto di educazione IA. Il tuo compito è creare percorsi di apprendimento personalizzati di 28 giorni.

STRUMENTI DISPONIBILI (usa solo questi):
1. chatgpt - Per pianificazione, idee, consulenza, scrittura generale
2. claude - Per copywriting, testi persuasivi, analisi dei contenuti
3. deepseek - Per generazione e revisione del codice
4. gemini - Per ricerca, analisi dei dati, confronti
5. nanobanana - Per generazione di arte e immagini IA
6. lovable - Per creare siti web e app senza codice
7. captions - Per editing video IA
8. elevenlabs - Per generazione di voce e audio

REGOLE OBBLIGATORIE:
1. Creare ESATTAMENTE 28 giorni
2. Progressione chiara: Settimana 1 (fondamenti) → Settimana 2 (pratica) → Settimana 3 (progetti) → Settimana 4 (applicazione reale)
3. Adattare all'obiettivo e al livello dell'utente
4. Ogni giorno deve avere un focus specifico e un esercizio pratico
5. Distribuire gli strumenti intelligentemente in base all'interesse dell'utente
6. MAI ripetere lo stesso contenuto
7. Gli esercizi devono essere realizzabili nel tempo disponibile

FORMATO RISPOSTA (JSON valido, senza markdown):
[
  {"day": 1, "tool": "chatgpt", "focus": "Introduzione a ChatGPT", "exercise": "Creare 3 prompt per il tuo contesto professionale"},
  {"day": 2, "tool": "chatgpt", "focus": "...", "exercise": "..."},
  ...fino al giorno 28
]`,
    goalMap: {
      work: "migliorare i risultati lavorativi",
      extra_income: "generare entrate extra come freelancer",
      business: "creare la propria attività",
      curiosity: "imparare ed esplorare le IA"
    },
    levelMap: {
      never: "principiante assoluto",
      basic: "uso base dell'IA",
      intermediate: "uso intermedio delle IA"
    },
    interestMap: {
      text: "testo e scrittura",
      code: "programmazione e sviluppo",
      image: "immagini e arte visiva",
      video: "video e audio"
    },
    timeMap: {
      "15min": "15 minuti al giorno",
      "30min": "30 minuti al giorno",
      "1hour": "1 ora o più al giorno"
    },
    fallbackContent: {
      week1Focus: "Fondamenti di",
      week2Focus: "Tecniche intermedie con",
      week3Focus: "Progetto pratico con",
      week4Focus: "Applicazione avanzata di",
      week1Exercise: "Esplora l'interfaccia e crea 3 prompt di base",
      week2Exercise: "Applica quanto appreso a un caso reale della tua quotidianità",
      week3Exercise: "Crea qualcosa di concreto usando le tecniche apprese",
      week4Exercise: "Integra nel tuo flusso di lavoro quotidiano"
    },
    errorMessages: {
      rateLimit: "Troppe richieste. Riprova tra qualche secondo.",
      paymentRequired: "Crediti insufficienti. Contatta il supporto.",
      generic: "Errore nella generazione del percorso"
    }
  },
  ru: {
    systemPrompt: `Вы эксперт по обучению ИИ. Ваша задача - создать персонализированные 28-дневные учебные маршруты.

ДОСТУПНЫЕ ИНСТРУМЕНТЫ (используйте только эти):
1. chatgpt - Для планирования, идей, консультаций, общего написания
2. claude - Для копирайтинга, убедительных текстов, анализа контента
3. deepseek - Для генерации и ревью кода
4. gemini - Для исследований, анализа данных, сравнений
5. nanobanana - Для генерации ИИ-арта и изображений
6. lovable - Для создания сайтов и приложений без кода
7. captions - Для ИИ-видеомонтажа
8. elevenlabs - Для генерации голоса и аудио

ОБЯЗАТЕЛЬНЫЕ ПРАВИЛА:
1. Создать РОВНО 28 дней
2. Чёткая прогрессия: Неделя 1 (основы) → Неделя 2 (практика) → Неделя 3 (проекты) → Неделя 4 (реальное применение)
3. Адаптировать под цель и уровень пользователя
4. Каждый день должен иметь конкретный фокус и практическое упражнение
5. Распределять инструменты разумно на основе интересов пользователя
6. НИКОГДА не повторять один и тот же контент
7. Упражнения должны быть выполнимы в доступное время

ФОРМАТ ОТВЕТА (валидный JSON, без markdown):
[
  {"day": 1, "tool": "chatgpt", "focus": "Введение в ChatGPT", "exercise": "Создайте 3 промпта для вашего профессионального контекста"},
  {"day": 2, "tool": "chatgpt", "focus": "...", "exercise": "..."},
  ...до дня 28
]`,
    goalMap: {
      work: "улучшить рабочие результаты",
      extra_income: "генерировать дополнительный доход как фрилансер",
      business: "создать собственный бизнес",
      curiosity: "изучать и исследовать ИИ"
    },
    levelMap: {
      never: "абсолютный новичок",
      basic: "базовое использование ИИ",
      intermediate: "среднее использование ИИ"
    },
    interestMap: {
      text: "текст и написание",
      code: "программирование и разработка",
      image: "изображения и визуальное искусство",
      video: "видео и аудио"
    },
    timeMap: {
      "15min": "15 минут в день",
      "30min": "30 минут в день",
      "1hour": "1 час или больше в день"
    },
    fallbackContent: {
      week1Focus: "Основы",
      week2Focus: "Продвинутые техники с",
      week3Focus: "Практический проект с",
      week4Focus: "Продвинутое применение",
      week1Exercise: "Изучите интерфейс и создайте 3 базовых промпта",
      week2Exercise: "Примените изученное к реальному случаю из вашей жизни",
      week3Exercise: "Создайте что-то конкретное с помощью изученных техник",
      week4Exercise: "Интегрируйте в ваш ежедневный рабочий процесс"
    },
    errorMessages: {
      rateLimit: "Слишком много запросов. Попробуйте через несколько секунд.",
      paymentRequired: "Недостаточно кредитов. Свяжитесь с поддержкой.",
      generic: "Ошибка при генерации маршрута"
    }
  },
  ar: {
    systemPrompt: `أنت خبير في تعليم الذكاء الاصطناعي. مهمتك هي إنشاء مسارات تعلم مخصصة لمدة 28 يومًا.

الأدوات المتاحة (استخدم هذه فقط):
1. chatgpt - للتخطيط والأفكار والاستشارات والكتابة العامة
2. claude - لكتابة الإعلانات والنصوص المقنعة وتحليل المحتوى
3. deepseek - لإنشاء ومراجعة الكود
4. gemini - للبحث وتحليل البيانات والمقارنات
5. nanobanana - لإنشاء الفن والصور بالذكاء الاصطناعي
6. lovable - لإنشاء مواقع وتطبيقات بدون كود
7. captions - لتحرير الفيديو بالذكاء الاصطناعي
8. elevenlabs - لإنشاء الصوت والأوديو

القواعد الإلزامية:
1. إنشاء 28 يومًا بالضبط
2. تقدم واضح: الأسبوع 1 (الأساسيات) ← الأسبوع 2 (التطبيق) ← الأسبوع 3 (المشاريع) ← الأسبوع 4 (التطبيق الحقيقي)
3. التكيف مع هدف ومستوى المستخدم
4. كل يوم يجب أن يكون له تركيز محدد وتمرين عملي
5. توزيع الأدوات بذكاء بناءً على اهتمام المستخدم
6. عدم تكرار نفس المحتوى أبدًا
7. التمارين يجب أن تكون قابلة للتنفيذ في الوقت المتاح

تنسيق الاستجابة (JSON صالح، بدون markdown):
[
  {"day": 1, "tool": "chatgpt", "focus": "مقدمة في ChatGPT", "exercise": "إنشاء 3 موجهات لسياقك المهني"},
  {"day": 2, "tool": "chatgpt", "focus": "...", "exercise": "..."},
  ...حتى اليوم 28
]`,
    goalMap: {
      work: "تحسين الإنجازات في العمل",
      extra_income: "توليد دخل إضافي كمستقل",
      business: "إنشاء عملك الخاص",
      curiosity: "تعلم واستكشاف الذكاء الاصطناعي"
    },
    levelMap: {
      never: "مبتدئ تمامًا",
      basic: "استخدام أساسي للذكاء الاصطناعي",
      intermediate: "استخدام متوسط للذكاء الاصطناعي"
    },
    interestMap: {
      text: "النص والكتابة",
      code: "البرمجة والتطوير",
      image: "الصور والفن البصري",
      video: "الفيديو والصوت"
    },
    timeMap: {
      "15min": "15 دقيقة يوميًا",
      "30min": "30 دقيقة يوميًا",
      "1hour": "ساعة أو أكثر يوميًا"
    },
    fallbackContent: {
      week1Focus: "أساسيات",
      week2Focus: "تقنيات متقدمة مع",
      week3Focus: "مشروع عملي مع",
      week4Focus: "تطبيق متقدم لـ",
      week1Exercise: "استكشف الواجهة وأنشئ 3 موجهات أساسية",
      week2Exercise: "طبق ما تعلمته على حالة حقيقية من حياتك اليومية",
      week3Exercise: "أنشئ شيئًا ملموسًا باستخدام التقنيات المكتسبة",
      week4Exercise: "ادمجه في سير عملك اليومي"
    },
    errorMessages: {
      rateLimit: "طلبات كثيرة جدًا. حاول مرة أخرى بعد بضع ثوانٍ.",
      paymentRequired: "رصيد غير كافٍ. اتصل بالدعم.",
      generic: "خطأ في إنشاء المسار"
    }
  },
  hi: {
    systemPrompt: `आप AI शिक्षा के विशेषज्ञ हैं। आपका कार्य 28-दिवसीय व्यक्तिगत सीखने के पथ बनाना है।

उपलब्ध उपकरण (केवल इनका उपयोग करें):
1. chatgpt - योजना, विचार, परामर्श, सामान्य लेखन के लिए
2. claude - कॉपीराइटिंग, प्रेरक पाठ, सामग्री विश्लेषण के लिए
3. deepseek - कोड जनरेशन और समीक्षा के लिए
4. gemini - अनुसंधान, डेटा विश्लेषण, तुलना के लिए
5. nanobanana - AI कला और छवि जनरेशन के लिए
6. lovable - बिना कोड के वेबसाइट और ऐप बनाने के लिए
7. captions - AI वीडियो संपादन के लिए
8. elevenlabs - आवाज और ऑडियो जनरेशन के लिए

अनिवार्य नियम:
1. ठीक 28 दिन बनाएं
2. स्पष्ट प्रगति: सप्ताह 1 (मूल बातें) → सप्ताह 2 (अभ्यास) → सप्ताह 3 (परियोजनाएं) → सप्ताह 4 (वास्तविक अनुप्रयोग)
3. उपयोगकर्ता के लक्ष्य और स्तर के अनुसार अनुकूलित करें
4. प्रत्येक दिन एक विशिष्ट फोकस और व्यावहारिक अभ्यास होना चाहिए
5. उपयोगकर्ता की रुचि के आधार पर उपकरणों को बुद्धिमानी से वितरित करें
6. कभी भी एक ही सामग्री न दोहराएं
7. अभ्यास उपलब्ध समय में करने योग्य होने चाहिए

प्रतिक्रिया प्रारूप (वैध JSON, बिना markdown):
[
  {"day": 1, "tool": "chatgpt", "focus": "ChatGPT का परिचय", "exercise": "अपने पेशेवर संदर्भ के लिए 3 प्रॉम्प्ट बनाएं"},
  {"day": 2, "tool": "chatgpt", "focus": "...", "exercise": "..."},
  ...दिन 28 तक
]`,
    goalMap: {
      work: "कार्य परिणामों में सुधार",
      extra_income: "फ्रीलांसर के रूप में अतिरिक्त आय उत्पन्न करें",
      business: "अपना खुद का व्यवसाय बनाएं",
      curiosity: "AI सीखें और खोजें"
    },
    levelMap: {
      never: "पूर्ण शुरुआती",
      basic: "AI का बुनियादी उपयोग",
      intermediate: "AI का मध्यवर्ती उपयोग"
    },
    interestMap: {
      text: "पाठ और लेखन",
      code: "प्रोग्रामिंग और विकास",
      image: "छवियां और दृश्य कला",
      video: "वीडियो और ऑडियो"
    },
    timeMap: {
      "15min": "प्रतिदिन 15 मिनट",
      "30min": "प्रतिदिन 30 मिनट",
      "1hour": "प्रतिदिन 1 घंटा या अधिक"
    },
    fallbackContent: {
      week1Focus: "की मूल बातें",
      week2Focus: "के साथ उन्नत तकनीकें",
      week3Focus: "के साथ व्यावहारिक परियोजना",
      week4Focus: "का उन्नत अनुप्रयोग",
      week1Exercise: "इंटरफ़ेस का अन्वेषण करें और 3 बुनियादी प्रॉम्प्ट बनाएं",
      week2Exercise: "जो सीखा उसे अपने दैनिक जीवन के वास्तविक मामले पर लागू करें",
      week3Exercise: "सीखी गई तकनीकों का उपयोग करके कुछ ठोस बनाएं",
      week4Exercise: "अपने दैनिक कार्यप्रवाह में एकीकृत करें"
    },
    errorMessages: {
      rateLimit: "बहुत सारे अनुरोध। कुछ सेकंड में पुनः प्रयास करें।",
      paymentRequired: "अपर्याप्त क्रेडिट। सहायता से संपर्क करें।",
      generic: "पथ उत्पन्न करने में त्रुटि"
    }
  },
  ja: {
    systemPrompt: `あなたはAI教育の専門家です。28日間のパーソナライズされた学習パスを作成することがあなたの任務です。

利用可能なツール（これらのみ使用してください）：
1. chatgpt - 計画、アイデア、コンサルティング、一般的な文章作成用
2. claude - コピーライティング、説得力のあるテキスト、コンテンツ分析用
3. deepseek - コード生成とレビュー用
4. gemini - 研究、データ分析、比較用
5. nanobanana - AI アートと画像生成用
6. lovable - コードなしでウェブサイトとアプリを作成用
7. captions - AI ビデオ編集用
8. elevenlabs - 音声とオーディオ生成用

必須ルール：
1. 正確に28日間を作成
2. 明確な進行：週1（基礎）→ 週2（練習）→ 週3（プロジェクト）→ 週4（実践）
3. ユーザーの目標とレベルに適応
4. 各日には特定のフォーカスと実践的な演習が必要
5. ユーザーの興味に基づいてツールをインテリジェントに配布
6. 同じコンテンツを繰り返さない
7. 演習は利用可能な時間内で実行可能である必要がある

レスポンス形式（有効なJSON、markdownなし）：
[
  {"day": 1, "tool": "chatgpt", "focus": "ChatGPT入門", "exercise": "あなたの専門的な文脈に合わせた3つのプロンプトを作成"},
  {"day": 2, "tool": "chatgpt", "focus": "...", "exercise": "..."},
  ...28日目まで
]`,
    goalMap: {
      work: "仕事の成果を改善",
      extra_income: "フリーランサーとして追加収入を得る",
      business: "自分のビジネスを作る",
      curiosity: "AIを学び探求する"
    },
    levelMap: {
      never: "完全な初心者",
      basic: "AIの基本的な使用",
      intermediate: "AIの中級的な使用"
    },
    interestMap: {
      text: "テキストとライティング",
      code: "プログラミングと開発",
      image: "画像とビジュアルアート",
      video: "動画とオーディオ"
    },
    timeMap: {
      "15min": "1日15分",
      "30min": "1日30分",
      "1hour": "1日1時間以上"
    },
    fallbackContent: {
      week1Focus: "の基礎",
      week2Focus: "を使った中級テクニック",
      week3Focus: "を使った実践プロジェクト",
      week4Focus: "の高度な応用",
      week1Exercise: "インターフェースを探索し、3つの基本的なプロンプトを作成",
      week2Exercise: "学んだことを日常の実際のケースに適用",
      week3Exercise: "学んだテクニックを使って具体的なものを作成",
      week4Exercise: "日常のワークフローに統合"
    },
    errorMessages: {
      rateLimit: "リクエストが多すぎます。数秒後に再試行してください。",
      paymentRequired: "クレジットが不足しています。サポートにお問い合わせください。",
      generic: "パス生成中にエラーが発生しました"
    }
  },
  ko: {
    systemPrompt: `당신은 AI 교육 전문가입니다. 28일간의 맞춤형 학습 경로를 만드는 것이 당신의 임무입니다.

사용 가능한 도구 (이것만 사용하세요):
1. chatgpt - 계획, 아이디어, 컨설팅, 일반 글쓰기용
2. claude - 카피라이팅, 설득력 있는 텍스트, 콘텐츠 분석용
3. deepseek - 코드 생성 및 검토용
4. gemini - 연구, 데이터 분석, 비교용
5. nanobanana - AI 아트 및 이미지 생성용
6. lovable - 코드 없이 웹사이트와 앱 만들기용
7. captions - AI 비디오 편집용
8. elevenlabs - 음성 및 오디오 생성용

필수 규칙:
1. 정확히 28일 생성
2. 명확한 진행: 1주차(기초) → 2주차(연습) → 3주차(프로젝트) → 4주차(실제 적용)
3. 사용자의 목표와 수준에 맞게 조정
4. 각 날에는 특정 초점과 실습 연습이 있어야 함
5. 사용자 관심에 따라 도구를 지능적으로 배포
6. 동일한 콘텐츠를 반복하지 않음
7. 연습은 사용 가능한 시간 내에 수행 가능해야 함

응답 형식 (유효한 JSON, markdown 없이):
[
  {"day": 1, "tool": "chatgpt", "focus": "ChatGPT 소개", "exercise": "전문적인 맥락에 맞는 3개의 프롬프트 생성"},
  {"day": 2, "tool": "chatgpt", "focus": "...", "exercise": "..."},
  ...28일까지
]`,
    goalMap: {
      work: "업무 성과 개선",
      extra_income: "프리랜서로 추가 수입 창출",
      business: "자신만의 사업 만들기",
      curiosity: "AI 학습 및 탐구"
    },
    levelMap: {
      never: "완전 초보자",
      basic: "AI 기본 사용",
      intermediate: "AI 중급 사용"
    },
    interestMap: {
      text: "텍스트와 글쓰기",
      code: "프로그래밍과 개발",
      image: "이미지와 시각 예술",
      video: "비디오와 오디오"
    },
    timeMap: {
      "15min": "하루 15분",
      "30min": "하루 30분",
      "1hour": "하루 1시간 이상"
    },
    fallbackContent: {
      week1Focus: "기초",
      week2Focus: "중급 기술",
      week3Focus: "실습 프로젝트",
      week4Focus: "고급 응용",
      week1Exercise: "인터페이스를 탐색하고 3개의 기본 프롬프트 만들기",
      week2Exercise: "배운 것을 일상의 실제 사례에 적용",
      week3Exercise: "배운 기술을 사용하여 구체적인 것을 만들기",
      week4Exercise: "일상 워크플로우에 통합"
    },
    errorMessages: {
      rateLimit: "요청이 너무 많습니다. 몇 초 후에 다시 시도하세요.",
      paymentRequired: "크레딧이 부족합니다. 지원팀에 문의하세요.",
      generic: "경로 생성 중 오류 발생"
    }
  },
  nl: {
    systemPrompt: `Je bent een expert in AI-onderwijs. Je taak is om gepersonaliseerde 28-daagse leerpaden te maken.

BESCHIKBARE TOOLS (gebruik alleen deze):
1. chatgpt - Voor planning, ideeën, advies, algemeen schrijven
2. claude - Voor copywriting, overtuigende teksten, contentanalyse
3. deepseek - Voor codegeneratie en review
4. gemini - Voor onderzoek, data-analyse, vergelijkingen
5. nanobanana - Voor AI-kunst en beeldgeneratie
6. lovable - Voor het maken van websites en apps zonder code
7. captions - Voor AI-videobewerking
8. elevenlabs - Voor stem- en audiogeneratie

VERPLICHTE REGELS:
1. Maak PRECIES 28 dagen
2. Duidelijke progressie: Week 1 (basis) → Week 2 (oefening) → Week 3 (projecten) → Week 4 (echte toepassing)
3. Pas aan aan het doel en niveau van de gebruiker
4. Elke dag moet een specifieke focus en praktische oefening hebben
5. Verdeel tools intelligent op basis van gebruikersinteresse
6. NOOIT dezelfde inhoud herhalen
7. Oefeningen moeten uitvoerbaar zijn in de beschikbare tijd

RESPONSFORMAAT (geldige JSON, geen markdown):
[
  {"day": 1, "tool": "chatgpt", "focus": "Introductie tot ChatGPT", "exercise": "Maak 3 prompts voor je professionele context"},
  {"day": 2, "tool": "chatgpt", "focus": "...", "exercise": "..."},
  ...tot dag 28
]`,
    goalMap: {
      work: "werkresultaten verbeteren",
      extra_income: "extra inkomen genereren als freelancer",
      business: "eigen bedrijf starten",
      curiosity: "AI leren en verkennen"
    },
    levelMap: {
      never: "absolute beginner",
      basic: "basis AI-gebruik",
      intermediate: "gemiddeld AI-gebruik"
    },
    interestMap: {
      text: "tekst en schrijven",
      code: "programmeren en ontwikkeling",
      image: "afbeeldingen en visuele kunst",
      video: "video en audio"
    },
    timeMap: {
      "15min": "15 minuten per dag",
      "30min": "30 minuten per dag",
      "1hour": "1 uur of meer per dag"
    },
    fallbackContent: {
      week1Focus: "Basisprincipes van",
      week2Focus: "Gevorderde technieken met",
      week3Focus: "Praktisch project met",
      week4Focus: "Geavanceerde toepassing van",
      week1Exercise: "Verken de interface en maak 3 basisprompts",
      week2Exercise: "Pas wat je hebt geleerd toe op een echte case uit je dagelijks leven",
      week3Exercise: "Maak iets concreets met de geleerde technieken",
      week4Exercise: "Integreer in je dagelijkse workflow"
    },
    errorMessages: {
      rateLimit: "Te veel verzoeken. Probeer het over een paar seconden opnieuw.",
      paymentRequired: "Onvoldoende tegoed. Neem contact op met support.",
      generic: "Fout bij het genereren van het pad"
    }
  },
  pl: {
    systemPrompt: `Jesteś ekspertem od edukacji AI. Twoim zadaniem jest tworzenie spersonalizowanych 28-dniowych ścieżek nauki.

DOSTĘPNE NARZĘDZIA (używaj tylko tych):
1. chatgpt - Do planowania, pomysłów, konsultacji, ogólnego pisania
2. claude - Do copywritingu, przekonujących tekstów, analizy treści
3. deepseek - Do generowania i przeglądania kodu
4. gemini - Do badań, analizy danych, porównań
5. nanobanana - Do sztuki AI i generowania obrazów
6. lovable - Do tworzenia stron i aplikacji bez kodu
7. captions - Do edycji wideo AI
8. elevenlabs - Do generowania głosu i dźwięku

OBOWIĄZKOWE ZASADY:
1. Utwórz DOKŁADNIE 28 dni
2. Jasna progresja: Tydzień 1 (podstawy) → Tydzień 2 (praktyka) → Tydzień 3 (projekty) → Tydzień 4 (rzeczywiste zastosowanie)
3. Dostosuj do celu i poziomu użytkownika
4. Każdy dzień musi mieć określony fokus i praktyczne ćwiczenie
5. Rozdzielaj narzędzia inteligentnie w oparciu o zainteresowanie użytkownika
6. NIGDY nie powtarzaj tej samej treści
7. Ćwiczenia muszą być wykonalne w dostępnym czasie

FORMAT ODPOWIEDZI (prawidłowy JSON, bez markdown):
[
  {"day": 1, "tool": "chatgpt", "focus": "Wprowadzenie do ChatGPT", "exercise": "Utwórz 3 prompty dla swojego kontekstu zawodowego"},
  {"day": 2, "tool": "chatgpt", "focus": "...", "exercise": "..."},
  ...do dnia 28
]`,
    goalMap: {
      work: "poprawić wyniki w pracy",
      extra_income: "generować dodatkowy dochód jako freelancer",
      business: "stworzyć własny biznes",
      curiosity: "uczyć się i odkrywać AI"
    },
    levelMap: {
      never: "absolutny początkujący",
      basic: "podstawowe użycie AI",
      intermediate: "średniozaawansowane użycie AI"
    },
    interestMap: {
      text: "tekst i pisanie",
      code: "programowanie i rozwój",
      image: "obrazy i sztuka wizualna",
      video: "wideo i audio"
    },
    timeMap: {
      "15min": "15 minut dziennie",
      "30min": "30 minut dziennie",
      "1hour": "1 godzina lub więcej dziennie"
    },
    fallbackContent: {
      week1Focus: "Podstawy",
      week2Focus: "Zaawansowane techniki z",
      week3Focus: "Projekt praktyczny z",
      week4Focus: "Zaawansowane zastosowanie",
      week1Exercise: "Poznaj interfejs i utwórz 3 podstawowe prompty",
      week2Exercise: "Zastosuj to, czego się nauczyłeś, do rzeczywistego przypadku z codziennego życia",
      week3Exercise: "Stwórz coś konkretnego, używając poznanych technik",
      week4Exercise: "Zintegruj z codziennym przepływem pracy"
    },
    errorMessages: {
      rateLimit: "Zbyt wiele żądań. Spróbuj ponownie za kilka sekund.",
      paymentRequired: "Niewystarczające środki. Skontaktuj się z pomocą techniczną.",
      generic: "Błąd podczas generowania ścieżki"
    }
  },
  tr: {
    systemPrompt: `AI eğitim uzmanısınız. Göreviniz kişiselleştirilmiş 28 günlük öğrenme yolları oluşturmaktır.

MEVCUT ARAÇLAR (yalnızca bunları kullanın):
1. chatgpt - Planlama, fikirler, danışmanlık, genel yazı için
2. claude - Metin yazarlığı, ikna edici metinler, içerik analizi için
3. deepseek - Kod oluşturma ve inceleme için
4. gemini - Araştırma, veri analizi, karşılaştırmalar için
5. nanobanana - AI sanatı ve görüntü oluşturma için
6. lovable - Kodsuz web sitesi ve uygulama oluşturma için
7. captions - AI video düzenleme için
8. elevenlabs - Ses ve audio oluşturma için

ZORUNLU KURALLAR:
1. TAM OLARAK 28 gün oluşturun
2. Net ilerleme: Hafta 1 (temeller) → Hafta 2 (uygulama) → Hafta 3 (projeler) → Hafta 4 (gerçek uygulama)
3. Kullanıcının hedefine ve seviyesine uyum sağlayın
4. Her günün belirli bir odağı ve pratik alıştırması olmalı
5. Araçları kullanıcı ilgisine göre akıllıca dağıtın
6. Aynı içeriği ASLA tekrarlamayın
7. Alıştırmalar mevcut sürede yapılabilir olmalı

YANIT FORMATI (geçerli JSON, markdown yok):
[
  {"day": 1, "tool": "chatgpt", "focus": "ChatGPT'ye Giriş", "exercise": "Profesyonel bağlamınız için 3 prompt oluşturun"},
  {"day": 2, "tool": "chatgpt", "focus": "...", "exercise": "..."},
  ...28. güne kadar
]`,
    goalMap: {
      work: "iş sonuçlarını iyileştirmek",
      extra_income: "freelancer olarak ekstra gelir elde etmek",
      business: "kendi işinizi kurmak",
      curiosity: "AI öğrenmek ve keşfetmek"
    },
    levelMap: {
      never: "mutlak başlangıç",
      basic: "temel AI kullanımı",
      intermediate: "orta düzey AI kullanımı"
    },
    interestMap: {
      text: "metin ve yazı",
      code: "programlama ve geliştirme",
      image: "görüntüler ve görsel sanat",
      video: "video ve ses"
    },
    timeMap: {
      "15min": "günde 15 dakika",
      "30min": "günde 30 dakika",
      "1hour": "günde 1 saat veya daha fazla"
    },
    fallbackContent: {
      week1Focus: "Temel bilgiler",
      week2Focus: "İleri teknikler",
      week3Focus: "Pratik proje",
      week4Focus: "İleri uygulama",
      week1Exercise: "Arayüzü keşfedin ve 3 temel prompt oluşturun",
      week2Exercise: "Öğrendiklerinizi günlük hayatınızdaki gerçek bir vakaya uygulayın",
      week3Exercise: "Öğrenilen teknikleri kullanarak somut bir şey oluşturun",
      week4Exercise: "Günlük iş akışınıza entegre edin"
    },
    errorMessages: {
      rateLimit: "Çok fazla istek. Birkaç saniye sonra tekrar deneyin.",
      paymentRequired: "Yetersiz kredi. Destekle iletişime geçin.",
      generic: "Yol oluşturulurken hata oluştu"
    }
  },
  zh: {
    systemPrompt: `您是AI教育专家。您的任务是创建个性化的28天学习路径。

可用工具（仅使用这些）：
1. chatgpt - 用于规划、创意、咨询、一般写作
2. claude - 用于文案写作、说服性文本、内容分析
3. deepseek - 用于代码生成和审查
4. gemini - 用于研究、数据分析、比较
5. nanobanana - 用于AI艺术和图像生成
6. lovable - 用于无代码创建网站和应用
7. captions - 用于AI视频编辑
8. elevenlabs - 用于语音和音频生成

强制规则：
1. 创建恰好28天
2. 清晰进展：第1周（基础）→ 第2周（实践）→ 第3周（项目）→ 第4周（实际应用）
3. 根据用户目标和水平进行调整
4. 每天必须有特定的重点和实践练习
5. 根据用户兴趣智能分配工具
6. 永远不要重复相同的内容
7. 练习必须在可用时间内完成

响应格式（有效JSON，无markdown）：
[
  {"day": 1, "tool": "chatgpt", "focus": "ChatGPT入门", "exercise": "为您的专业背景创建3个提示"},
  {"day": 2, "tool": "chatgpt", "focus": "...", "exercise": "..."},
  ...直到第28天
]`,
    goalMap: {
      work: "改善工作成果",
      extra_income: "作为自由职业者创造额外收入",
      business: "创建自己的业务",
      curiosity: "学习和探索AI"
    },
    levelMap: {
      never: "完全初学者",
      basic: "AI基本使用",
      intermediate: "AI中级使用"
    },
    interestMap: {
      text: "文本和写作",
      code: "编程和开发",
      image: "图像和视觉艺术",
      video: "视频和音频"
    },
    timeMap: {
      "15min": "每天15分钟",
      "30min": "每天30分钟",
      "1hour": "每天1小时或更多"
    },
    fallbackContent: {
      week1Focus: "基础知识",
      week2Focus: "进阶技术",
      week3Focus: "实践项目",
      week4Focus: "高级应用",
      week1Exercise: "探索界面并创建3个基本提示",
      week2Exercise: "将所学应用到日常生活中的实际案例",
      week3Exercise: "使用所学技术创建具体内容",
      week4Exercise: "集成到日常工作流程中"
    },
    errorMessages: {
      rateLimit: "请求过多。请稍后重试。",
      paymentRequired: "余额不足。请联系支持。",
      generic: "生成路径时出错"
    }
  }
};

function getLanguageCode(language?: string): string {
  if (!language) return 'pt';
  const code = language.split('-')[0].toLowerCase();
  return languageConfig[code] ? code : 'pt';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Not authorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Not authorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { brief } = await req.json() as { brief: Brief };
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const langCode = getLanguageCode(brief.language);
    const config = languageConfig[langCode];

    console.log("Generating personalized trail for brief:", JSON.stringify(brief), "Language:", langCode);

    const systemPrompt = config.systemPrompt;

    const userPromptTemplate = langCode === 'pt' 
      ? `Crie uma trilha personalizada de 28 dias para:

PERFIL DO USUÁRIO:
- Objetivo: ${config.goalMap[brief.goal] || brief.goal}
- Nível atual: ${config.levelMap[brief.level] || brief.level}
- Interesse principal: ${config.interestMap[brief.interest] || brief.interest}
- Tempo disponível: ${config.timeMap[brief.time] || brief.time}
${brief.freeText ? `- Projeto específico: ${brief.freeText}` : ''}

IMPORTANTE:
- Adapte a trilha para ${brief.interest === 'code' ? 'focando mais em DeepSeek e Lovable' : brief.interest === 'image' ? 'focando mais em NanoBanana' : brief.interest === 'video' ? 'focando mais em Captions e ElevenLabs' : 'balanceando todas as ferramentas de texto'}
- O objetivo ${config.goalMap[brief.goal]} deve guiar os exercícios práticos
- Considere o nível ${config.levelMap[brief.level]} para ajustar a complexidade

Retorne APENAS o JSON válido, sem explicações adicionais.`
      : langCode === 'en'
      ? `Create a personalized 28-day trail for:

USER PROFILE:
- Goal: ${config.goalMap[brief.goal] || brief.goal}
- Current level: ${config.levelMap[brief.level] || brief.level}
- Main interest: ${config.interestMap[brief.interest] || brief.interest}
- Available time: ${config.timeMap[brief.time] || brief.time}
${brief.freeText ? `- Specific project: ${brief.freeText}` : ''}

IMPORTANT:
- Adapt the trail to ${brief.interest === 'code' ? 'focus more on DeepSeek and Lovable' : brief.interest === 'image' ? 'focus more on NanoBanana' : brief.interest === 'video' ? 'focus more on Captions and ElevenLabs' : 'balance all text tools'}
- The goal ${config.goalMap[brief.goal]} should guide the practical exercises
- Consider the level ${config.levelMap[brief.level]} to adjust complexity

Return ONLY valid JSON, no additional explanations.`
      : langCode === 'fr'
      ? `Créez un parcours personnalisé de 28 jours pour:

PROFIL UTILISATEUR:
- Objectif: ${config.goalMap[brief.goal] || brief.goal}
- Niveau actuel: ${config.levelMap[brief.level] || brief.level}
- Intérêt principal: ${config.interestMap[brief.interest] || brief.interest}
- Temps disponible: ${config.timeMap[brief.time] || brief.time}
${brief.freeText ? `- Projet spécifique: ${brief.freeText}` : ''}

IMPORTANT:
- Adaptez le parcours pour ${brief.interest === 'code' ? 'se concentrer sur DeepSeek et Lovable' : brief.interest === 'image' ? 'se concentrer sur NanoBanana' : brief.interest === 'video' ? 'se concentrer sur Captions et ElevenLabs' : 'équilibrer tous les outils de texte'}
- L'objectif ${config.goalMap[brief.goal]} doit guider les exercices pratiques
- Considérez le niveau ${config.levelMap[brief.level]} pour ajuster la complexité

Retournez UNIQUEMENT du JSON valide, sans explications supplémentaires.`
      : langCode === 'es'
      ? `Crea una ruta personalizada de 28 días para:

PERFIL DEL USUARIO:
- Objetivo: ${config.goalMap[brief.goal] || brief.goal}
- Nivel actual: ${config.levelMap[brief.level] || brief.level}
- Interés principal: ${config.interestMap[brief.interest] || brief.interest}
- Tiempo disponible: ${config.timeMap[brief.time] || brief.time}
${brief.freeText ? `- Proyecto específico: ${brief.freeText}` : ''}

IMPORTANTE:
- Adapta la ruta para ${brief.interest === 'code' ? 'enfocarse más en DeepSeek y Lovable' : brief.interest === 'image' ? 'enfocarse más en NanoBanana' : brief.interest === 'video' ? 'enfocarse más en Captions y ElevenLabs' : 'balancear todas las herramientas de texto'}
- El objetivo ${config.goalMap[brief.goal]} debe guiar los ejercicios prácticos
- Considera el nivel ${config.levelMap[brief.level]} para ajustar la complejidad

Devuelve SOLO JSON válido, sin explicaciones adicionales.`
      : langCode === 'de'
      ? `Erstellen Sie einen personalisierten 28-Tage-Lernpfad für:

BENUTZERPROFIL:
- Ziel: ${config.goalMap[brief.goal] || brief.goal}
- Aktuelles Niveau: ${config.levelMap[brief.level] || brief.level}
- Hauptinteresse: ${config.interestMap[brief.interest] || brief.interest}
- Verfügbare Zeit: ${config.timeMap[brief.time] || brief.time}
${brief.freeText ? `- Spezifisches Projekt: ${brief.freeText}` : ''}

WICHTIG:
- Passen Sie den Pfad an ${brief.interest === 'code' ? 'mit Fokus auf DeepSeek und Lovable' : brief.interest === 'image' ? 'mit Fokus auf NanoBanana' : brief.interest === 'video' ? 'mit Fokus auf Captions und ElevenLabs' : 'alle Text-Tools ausbalancieren'}
- Das Ziel ${config.goalMap[brief.goal]} soll die praktischen Übungen leiten
- Berücksichtigen Sie das Niveau ${config.levelMap[brief.level]} zur Anpassung der Komplexität

Geben Sie NUR gültiges JSON zurück, keine zusätzlichen Erklärungen.`
      : langCode === 'it'
      ? `Crea un percorso personalizzato di 28 giorni per:

PROFILO UTENTE:
- Obiettivo: ${config.goalMap[brief.goal] || brief.goal}
- Livello attuale: ${config.levelMap[brief.level] || brief.level}
- Interesse principale: ${config.interestMap[brief.interest] || brief.interest}
- Tempo disponibile: ${config.timeMap[brief.time] || brief.time}
${brief.freeText ? `- Progetto specifico: ${brief.freeText}` : ''}

IMPORTANTE:
- Adatta il percorso per ${brief.interest === 'code' ? 'concentrarsi su DeepSeek e Lovable' : brief.interest === 'image' ? 'concentrarsi su NanoBanana' : brief.interest === 'video' ? 'concentrarsi su Captions ed ElevenLabs' : 'bilanciare tutti gli strumenti di testo'}
- L'obiettivo ${config.goalMap[brief.goal]} deve guidare gli esercizi pratici
- Considera il livello ${config.levelMap[brief.level]} per regolare la complessità

Restituisci SOLO JSON valido, senza spiegazioni aggiuntive.`
      : `Создайте персонализированный 28-дневный маршрут для:

ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ:
- Цель: ${config.goalMap[brief.goal] || brief.goal}
- Текущий уровень: ${config.levelMap[brief.level] || brief.level}
- Основной интерес: ${config.interestMap[brief.interest] || brief.interest}
- Доступное время: ${config.timeMap[brief.time] || brief.time}
${brief.freeText ? `- Конкретный проект: ${brief.freeText}` : ''}

ВАЖНО:
- Адаптируйте маршрут ${brief.interest === 'code' ? 'с фокусом на DeepSeek и Lovable' : brief.interest === 'image' ? 'с фокусом на NanoBanana' : brief.interest === 'video' ? 'с фокусом на Captions и ElevenLabs' : 'сбалансировать все текстовые инструменты'}
- Цель ${config.goalMap[brief.goal]} должна направлять практические упражнения
- Учитывайте уровень ${config.levelMap[brief.level]} для регулировки сложности

Верните ТОЛЬКО валидный JSON, без дополнительных объяснений.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPromptTemplate },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error("Rate limit exceeded");
        return new Response(JSON.stringify({ error: config.errorMessages.rateLimit }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        console.error("Payment required");
        return new Response(JSON.stringify({ error: config.errorMessages.paymentRequired }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    console.log("AI response content:", content);

    // Parse JSON from response (handle potential markdown wrapping)
    let plan: GeneratedDay[];
    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      plan = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Generate fallback plan
      plan = generateFallbackPlan(brief, config);
    }

    // Validate plan has 28 days
    if (!Array.isArray(plan) || plan.length !== 28) {
      console.warn("Plan doesn't have 28 days, generating fallback");
      plan = generateFallbackPlan(brief, config);
    }

    console.log("Generated plan with", plan.length, "days");

    return new Response(JSON.stringify({ plan }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in generate-personalized-trail:", error);
    const langCode = 'pt'; // Default to Portuguese for error messages
    const config = languageConfig[langCode];
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : config.errorMessages.generic 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function generateFallbackPlan(brief: Brief, config: typeof languageConfig['pt']): GeneratedDay[] {
  const tools = ["chatgpt", "claude", "gemini", "deepseek", "nanobanana", "lovable", "captions", "elevenlabs"];
  
  // Prioritize based on interest
  const priorityTools = brief.interest === 'code' 
    ? ["chatgpt", "deepseek", "lovable", "gemini"]
    : brief.interest === 'image'
    ? ["chatgpt", "nanobanana", "claude", "gemini"]
    : brief.interest === 'video'
    ? ["chatgpt", "captions", "elevenlabs", "claude"]
    : ["chatgpt", "claude", "gemini", "lovable"];

  const plan: GeneratedDay[] = [];
  
  for (let day = 1; day <= 28; day++) {
    const week = Math.ceil(day / 7);
    const toolIndex = (day - 1) % priorityTools.length;
    const tool = priorityTools[toolIndex];
    
    let focus = "";
    let exercise = "";
    
    if (week === 1) {
      focus = `${config.fallbackContent.week1Focus} ${tool}`;
      exercise = config.fallbackContent.week1Exercise;
    } else if (week === 2) {
      focus = `${config.fallbackContent.week2Focus} ${tool}`;
      exercise = config.fallbackContent.week2Exercise;
    } else if (week === 3) {
      focus = `${config.fallbackContent.week3Focus} ${tool}`;
      exercise = config.fallbackContent.week3Exercise;
    } else {
      focus = `${config.fallbackContent.week4Focus} ${tool}`;
      exercise = config.fallbackContent.week4Exercise;
    }
    
    plan.push({ day, tool, focus, exercise });
  }
  
  return plan;
}
