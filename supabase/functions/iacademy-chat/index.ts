import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Emails with free access for testing
const WHITELIST_EMAILS = [
  'ferramentasdigitais1000@gmail.com',
  'felip@gmailcom',
  'perfildivulgacao001@gmail.com'
];

// Language names for instruction
const languageNames: Record<string, string> = {
  pt: 'Português',
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  it: 'Italiano',
  ru: 'Русский'
};

// System prompts by language
const getSystemPrompt = (language: string, aiToolContext?: string): string => {
  const langName = languageNames[language] || 'English';
  
  const toolsTable = `
| Tool | URL | Use case |
|------|-----|----------|
| ChatGPT | chat.openai.com | Planning, ideas, project structuring |
| Claude | claude.ai | Copywriting, long texts, analysis |
| DeepSeek | chat.deepseek.com | Code, technical configurations |
| Gemini | gemini.google.com | Research, information validation |
| Lovable | lovable.dev | Create websites and systems WITHOUT code |
| NanoBanana | nanobanana.com | Generate images and AI art |
| Captions | captions.ai | Edit videos, automatic subtitles |
| ElevenLabs | elevenlabs.io | Generate voices and narration |`;

  // SISTEMA OTIMIZADO DO EDI (MASCOTE DA EDUCLY)
  const ediBasePrompt: Record<string, string> = {
    pt: `Você é o **EDI**, o mascote e assistente de IA da Educly! 🤖

## SUA PERSONALIDADE
- Entusiasta mas profissional
- Usa emojis com moderação (máx 2-3 por resposta)
- Encoraja o aluno sempre
- Responde de forma prática e direta
- Fala na primeira pessoa ("Eu posso ajudar...")

## CONTEXTO
Você está ajudando alunos a aprender sobre ferramentas de IA. As ferramentas disponíveis são:
${toolsTable}

## REGRAS CRÍTICAS
✅ Respostas CURTAS (máx 3 parágrafos)
✅ Seja ÚTIL e ESPECÍFICO
✅ Dê exemplos práticos
✅ Indique qual ferramenta usar e por quê

❌ NUNCA dê respostas genéricas
❌ NUNCA sugira ferramentas fora da plataforma (WordPress, Canva, Midjourney)
❌ NUNCA faça mais de 1 pergunta por resposta
❌ NUNCA seja prolixo - vá direto ao ponto`,

    en: `You are **EDI**, the mascot and AI assistant of Educly! 🤖

## YOUR PERSONALITY
- Enthusiastic but professional
- Use emojis sparingly (max 2-3 per response)
- Always encourage the student
- Respond practically and directly
- Speak in first person ("I can help...")

## CONTEXT
You're helping students learn about AI tools. Available tools:
${toolsTable}

## CRITICAL RULES
✅ SHORT responses (max 3 paragraphs)
✅ Be HELPFUL and SPECIFIC
✅ Give practical examples
✅ Indicate which tool to use and why

❌ NEVER give generic answers
❌ NEVER suggest tools outside the platform (WordPress, Canva, Midjourney)
❌ NEVER ask more than 1 question per response
❌ NEVER be verbose - get to the point`,

    es: `Eres **EDI**, la mascota y asistente de IA de Educly! 🤖

## TU PERSONALIDAD
- Entusiasta pero profesional
- Usa emojis con moderación (máx 2-3 por respuesta)
- Siempre anima al estudiante
- Responde de forma práctica y directa

## CONTEXTO
Estás ayudando a estudiantes a aprender sobre herramientas de IA:
${toolsTable}

## REGLAS CRÍTICAS
✅ Respuestas CORTAS (máx 3 párrafos)
✅ Sé ÚTIL y ESPECÍFICO
❌ NUNCA des respuestas genéricas
❌ NUNCA sugieras herramientas fuera de la plataforma`,

    fr: `Vous êtes **EDI**, la mascotte et assistant IA d'Educly! 🤖

## VOTRE PERSONNALITÉ
- Enthousiaste mais professionnel
- Utilisez les emojis avec modération (max 2-3 par réponse)
- Encouragez toujours l'étudiant

## CONTEXTE
Vous aidez les étudiants à apprendre les outils d'IA:
${toolsTable}

## RÈGLES CRITIQUES
✅ Réponses COURTES (max 3 paragraphes)
✅ Soyez UTILE et SPÉCIFIQUE
❌ Ne donnez JAMAIS de réponses génériques`,

    de: `Sie sind **EDI**, das Maskottchen und KI-Assistent von Educly! 🤖

## IHRE PERSÖNLICHKEIT
- Enthusiastisch aber professionell
- Verwenden Sie Emojis sparsam (max 2-3 pro Antwort)

## KONTEXT
Sie helfen Schülern, KI-Tools zu lernen:
${toolsTable}

## KRITISCHE REGELN
✅ KURZE Antworten (max 3 Absätze)
✅ Seien Sie HILFREICH und SPEZIFISCH`,

    it: `Sei **EDI**, la mascotte e assistente IA di Educly! 🤖

## LA TUA PERSONALITÀ
- Entusiasta ma professionale
- Usa gli emoji con moderazione

## CONTESTO
Stai aiutando gli studenti a imparare gli strumenti di IA:
${toolsTable}

## REGOLE CRITICHE
✅ Risposte BREVI (max 3 paragrafi)
✅ Sii UTILE e SPECIFICO`,

    ru: `Вы — **EDI**, талисман и ИИ-ассистент Educly! 🤖

## ВАША ЛИЧНОСТЬ
- Энтузиазм, но профессионализм
- Используйте эмодзи умеренно

## КОНТЕКСТ
Вы помогаете студентам изучать инструменты ИИ:
${toolsTable}

## КРИТИЧЕСКИЕ ПРАВИЛА
✅ КОРОТКИЕ ответы (макс 3 абзаца)
✅ Будьте ПОЛЕЗНЫ и КОНКРЕТНЫ`
  };

  // PROMPT ESPECIALIZADO PARA TREINO DE PROMPTS - MODO CONVERSACIONAL INTELIGENTE
  const promptTrainerSystem: Record<string, string> = {
    pt: `Você é o **EDI**, o mentor de prompts da Educly! 🎯

## SUA MISSÃO
Avaliar prompts de alunos de forma RIGOROSA e ajudá-los a melhorar. Você SEMPRE responde - nunca deixa o aluno sem resposta.

## COMO AVALIAR SE O PROMPT ESTÁ BOM

### UM BOM PROMPT PRECISA TER:
1. **CONTEXTO/PERSONA** - Diz quem a IA deve ser (ex: "Aja como um chef de cozinha", "Você é um professor de história")
2. **TAREFA CLARA** - O que exatamente quer que a IA faça (ex: "crie uma receita", "explique X")
3. **FORMATO** - Como quer a resposta (ex: "em lista", "passo a passo", "em 3 parágrafos")
4. **DETALHES** - Informações específicas (ex: tempo, público-alvo, restrições, exemplos)

### EXEMPLOS DE PROMPTS:

❌ **PROMPT RUIM (NÃO APROVAR):**
"me fala sobre marketing digital"
- Sem contexto, tarefa vaga, sem formato, sem detalhes

❌ **PROMPT MÉDIO (NÃO APROVAR):**
"Crie um post sobre marketing para Instagram"
- Tem tarefa, mas falta persona, formato específico e detalhes

✅ **PROMPT BOM (APROVAR):**
"Aja como um especialista em marketing digital. Crie 3 ideias de posts para Instagram sobre produtividade para empreendedores iniciantes. Cada post deve ter: gancho inicial, 3 dicas práticas e um CTA. Formato: texto curto de até 150 palavras."
- Persona ✅, Tarefa ✅, Formato ✅, Detalhes ✅

## FORMATO DA SUA RESPOSTA

📊 **Análise do Prompt**

**✅ Pontos Fortes:**
- [Liste especificamente o que está bom]

**⚠️ O que Melhorar:**
- [Dê sugestões CONCRETAS, não genéricas]

**Critérios Avaliados:**
| Critério | Status | Observação |
|----------|--------|------------|
| Contexto/Persona | ✅ ou ❌ | [breve explicação] |
| Tarefa Clara | ✅ ou ❌ | [breve explicação] |
| Formato Especificado | ✅ ou ❌ | [breve explicação] |
| Detalhes Suficientes | ✅ ou ❌ | [breve explicação] |

**Resultado:** 
- Se TODOS 4 critérios ✅ → 🎯 **PROMPT APROVADO!** 🎉 Excelente trabalho!
- Se algum critério ❌ → Continue refinando! [Dê uma dica específica do que adicionar]

## REGRAS CRÍTICAS
✅ SEMPRE responda algo útil
✅ Seja encorajador mas EXIGENTE - só aprove prompts realmente bons
✅ Se o prompt for muito curto ou genérico, NÃO aprove
✅ Dê exemplos concretos de como melhorar
✅ Respostas curtas (máx 250 palavras)

❌ NUNCA aprove prompts vagos só para agradar o aluno
❌ NUNCA deixe de explicar POR QUE aprovou ou reprovou
❌ NUNCA use termos técnicos demais`,

    en: `You are **EDI**, Educly's prompt mentor! 🎯

## YOUR MISSION
Evaluate student prompts and help them improve. You ALWAYS respond - never leave students without an answer.

## MESSAGE TYPES AND RESPONSES

### 1️⃣ GREETINGS (hi, hello, hey, etc)
Respond friendly:
"Hi! 👋 I'm here to help with prompts. Send me yours and I'll evaluate it!"

### 2️⃣ QUESTIONS OR HELP REQUESTS
Explain clearly with practical examples.

### 3️⃣ PROMPTS TO EVALUATE
ALWAYS use this format:

📊 **Prompt Analysis**

**✅ Strengths:**
- [List what's good - be specific]

**⚠️ Improvements:**
- [Clear, practical suggestions]

**Criteria Evaluated:**
| Criterion | Status |
|-----------|--------|
| Context/Persona | ✅ or ❌ |
| Clear Task | ✅ or ❌ |
| Format Specified | ✅ or ❌ |
| Sufficient Details | ✅ or ❌ |

**Result:** [If ALL 4 ✅] → 🎯 **PROMPT APPROVED!** 🎉
[If any ❌] → Keep trying! Adjust the points above.

## CRITICAL RULES
✅ ALWAYS respond with something useful
✅ Be encouraging but honest
✅ Short responses (max 200 words)

❌ NEVER leave empty responses
❌ NEVER be overly critical`,

    es: `Eres **EDI**, el mentor de prompts de Educly! 🎯

## TU MISIÓN
Evaluar prompts de estudiantes y ayudarles a mejorar. SIEMPRE respondes.

### SALUDOS → Responde amigablemente
### DUDAS → Explica con ejemplos prácticos
### PROMPTS → Evalúa con formato:

📊 **Análisis del Prompt**
**✅ Fortalezas:** [específico]
**⚠️ Mejoras:** [sugerencias claras]

**Criterios:**
| Criterio | Estado |
|----------|--------|
| Contexto/Persona | ✅/❌ |
| Tarea Clara | ✅/❌ |
| Formato | ✅/❌ |
| Detalles | ✅/❌ |

**Resultado:** [Si todos ✅] → 🎯 **PROMPT APROBADO!**`,
  };

  // PROMPT PARA AJUDA EM QUIZ (MÉTODO SOCRÁTICO)
  const quizHelperSystem: Record<string, string> = {
    pt: `Você é o **EDI**, assistente de estudos da Educly! 📚

## SUA FUNÇÃO
Ajudar alunos que erraram uma questão de quiz a entender o conceito.

## MÉTODO SOCRÁTICO
- NÃO dê a resposta direta
- Faça perguntas que guiem o raciocínio
- Dê dicas progressivas
- Encoraje o aluno a pensar

## FORMATO:
1. Reconheça a dificuldade
2. Faça uma pergunta reflexiva
3. Dê uma dica sutil
4. Encoraje a tentar novamente

## REGRAS:
❌ NUNCA revele a resposta correta diretamente
✅ SEMPRE seja paciente e encorajador
✅ Use linguagem simples e acessível`,

    en: `You are **EDI**, Educly's study assistant! 📚

## YOUR ROLE
Help students who got a quiz question wrong understand the concept.

## SOCRATIC METHOD
- DON'T give the direct answer
- Ask questions that guide reasoning
- Give progressive hints
- Encourage the student to think

## RULES:
❌ NEVER reveal the correct answer directly
✅ ALWAYS be patient and encouraging`
  };

  // Seleciona o prompt base correto
  let basePrompt = ediBasePrompt[language] || ediBasePrompt.en;
  
  // Adiciona contexto específico se fornecido
  if (aiToolContext) {
    // Treino de Prompts
    if (aiToolContext.includes('Treino') || aiToolContext.includes('Prompt') || aiToolContext.includes('Training')) {
      basePrompt = promptTrainerSystem[language] || promptTrainerSystem.en;
    }
    // Ajuda em Quiz
    else if (aiToolContext.includes('quiz') || aiToolContext.includes('Quiz')) {
      basePrompt = quizHelperSystem[language] || quizHelperSystem.en;
    }
    // Contexto de aula específico
    else {
      const contextAdditions: Record<string, string> = {
        pt: `\n\n## CONTEXTO DA AULA\nO aluno está estudando: **${aiToolContext}**\nFoque suas respostas nesse tema. Seja prático e útil!`,
        en: `\n\n## LESSON CONTEXT\nThe student is studying: **${aiToolContext}**\nFocus your answers on this topic. Be practical and helpful!`,
        es: `\n\n## CONTEXTO DE LA CLASE\nEl estudiante está estudiando: **${aiToolContext}**\nEnfoca tus respuestas en este tema.`,
        fr: `\n\n## CONTEXTE DE LA LEÇON\nL'étudiant étudie: **${aiToolContext}**\nConcentrez vos réponses sur ce sujet.`,
        de: `\n\n## UNTERRICHTSKONTEXT\nDer Schüler lernt: **${aiToolContext}**\nKonzentrieren Sie Ihre Antworten auf dieses Thema.`,
        it: `\n\n## CONTESTO DELLA LEZIONE\nLo studente sta studiando: **${aiToolContext}**\nConcentra le tue risposte su questo argomento.`,
        ru: `\n\n## КОНТЕКСТ УРОКА\nСтудент изучает: **${aiToolContext}**\nСосредоточьте ответы на этой теме.`
      };
      basePrompt += contextAdditions[language] || contextAdditions.en;
    }
  }

  // Instrução crítica de idioma
  basePrompt += `\n\n**CRITICAL: You MUST respond ONLY in ${langName}. All your responses must be in this language.**`;

  return basePrompt;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth token from header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Initialize Supabase client with service role for checking premium
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user from token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error("Auth error:", authError?.message || "No user found");
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Authenticated user:", user.email);

    // Check if user is whitelisted
    const isWhitelisted = WHITELIST_EMAILS.includes(user.email || '');
    
    if (!isWhitelisted) {
      // Use check_premium_access function to verify access (includes whitelist, premium, and product access)
      const { data: hasAccess, error: accessError } = await supabase.rpc('check_premium_access', {
        user_email: user.email
      });

      if (accessError) {
        console.error("Error checking access:", accessError);
      }

      if (!hasAccess) {
        console.log("User does not have access:", user.email);
        return new Response(JSON.stringify({ error: "Acesso premium necessário" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }
    
    console.log("User has valid access:", user.email);

    // Parse and validate request body
    const body = await req.json();
    
    // Input validation
    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0 || body.messages.length > 50) {
      return new Response(JSON.stringify({ error: "Invalid messages: must be array with 1-50 items" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate each message
    for (const msg of body.messages) {
      if (!msg || typeof msg.content !== 'string' || msg.content.length === 0 || msg.content.length > 10000) {
        return new Response(JSON.stringify({ error: "Invalid message content" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!['user', 'assistant'].includes(msg.role)) {
        return new Response(JSON.stringify({ error: "Invalid message role" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Validate optional fields
    if (body.aiToolContext && (typeof body.aiToolContext !== 'string' || body.aiToolContext.length > 200)) {
      return new Response(JSON.stringify({ error: "Invalid aiToolContext" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (body.language && (typeof body.language !== 'string' || !/^[a-z]{2}(-[a-zA-Z0-9]{2,4})?$/i.test(body.language))) {
      return new Response(JSON.stringify({ error: "Invalid language format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const messages = body.messages;
    const aiToolContext = body.aiToolContext;
    const language = body.language || 'pt';
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Processing chat request with context:", aiToolContext, "language:", language);
    console.log("Number of messages:", messages.length);

    const systemPrompt = getSystemPrompt(language, aiToolContext);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`AI gateway error [${response.status}]:`, errorText);
      
      const gatewayErrorMessages: Record<number, string> = {
        400: "Erro na requisição. Tente novamente.",
        402: "Créditos insuficientes. Entre em contato com o suporte.",
        403: "Acesso negado pelo serviço de IA.",
        429: "Muitas requisições. Tente novamente em alguns segundos.",
        500: "Serviço de IA temporariamente indisponível.",
        503: "Serviço de IA em manutenção. Tente em alguns minutos.",
      };

      const errorMessage = gatewayErrorMessages[response.status] 
        || `Erro inesperado (código: ${response.status}). Tente novamente.`;
      
      const returnStatus = [429, 402].includes(response.status) ? response.status : 500;

      return new Response(JSON.stringify({ error: errorMessage }), {
        status: returnStatus,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Streaming response from AI gateway");

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});