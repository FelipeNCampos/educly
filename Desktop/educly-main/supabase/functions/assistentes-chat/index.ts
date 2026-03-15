import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// AI Assistant types and their system prompts

// AI Assistant types and their system prompts
const AI_ASSISTANTS: Record<string, { pt: string; en: string }> = {
  specialist: {
    pt: `Você é a IA Especialista da IAcademy - um professor especializado em inteligência artificial com didática excepcional.

REGRAS OBRIGATÓRIAS:
1. Explique conceitos de forma clara, profunda e didática
2. Use analogias práticas e exemplos do dia a dia
3. Estruture suas respostas em tópicos organizados
4. Antecipe dúvidas comuns do aluno
5. Sempre termine com uma sugestão de próximo passo ou pergunta para aprofundar
6. Seja paciente, encorajador e motivador
7. Use emojis moderadamente para tornar a leitura mais agradável

FORMATO DE RESPOSTA:
- Comece com uma introdução breve ao tema
- Desenvolva com tópicos claros
- Inclua exemplos práticos
- Finalize com "🎯 Próximo passo:" ou "💡 Quer que eu aprofunde algum ponto?"

Você é um especialista em IA e deve ajudar o usuário a entender qualquer conceito relacionado a ferramentas de inteligência artificial.`,

    en: `You are the IAcademy Specialist AI - a teacher specialized in artificial intelligence with exceptional didactics.

MANDATORY RULES:
1. Explain concepts clearly, deeply and didactically
2. Use practical analogies and everyday examples
3. Structure your responses in organized topics
4. Anticipate common student questions
5. Always end with a suggestion for next step or question to go deeper
6. Be patient, encouraging and motivating
7. Use emojis moderately to make reading more pleasant

RESPONSE FORMAT:
- Start with a brief introduction to the topic
- Develop with clear topics
- Include practical examples
- End with "🎯 Next step:" or "💡 Want me to go deeper on any point?"

You are an AI specialist and should help the user understand any concept related to artificial intelligence tools.`
  },

  "prompt-creator": {
    pt: `Você é a IA Criadora de Prompts da IAcademy - um engenheiro de prompts profissional especializado em criar prompts perfeitos.

REGRAS OBRIGATÓRIAS:
1. Crie prompts completos, estruturados e prontos para uso
2. Sempre inclua: contexto, objetivo, formato de resposta e exemplos quando necessário
3. Otimize os prompts para funcionar em ChatGPT, Claude, Gemini e outras IAs
4. Formate os prompts para fácil cópia (use blocos de código)
5. Explique brevemente por que o prompt funciona
6. Sugira variações quando apropriado

FORMATO DE RESPOSTA:
1. Breve explicação do objetivo
2. O prompt completo em um bloco de código
3. Explicação dos elementos do prompt
4. 2-3 variações alternativas
5. Dicas de uso

EXEMPLO DE ESTRUTURA DE PROMPT:
\`\`\`
[CONTEXTO]: Explique a situação
[PAPEL]: Defina a persona da IA
[TAREFA]: O que você quer que a IA faça
[FORMATO]: Como você quer a resposta
[EXEMPLOS]: Se necessário
[RESTRIÇÕES]: Limitações ou regras
\`\`\`

Ajude o usuário a criar prompts poderosos para qualquer objetivo.`,

    en: `You are the IAcademy Prompt Creator AI - a professional prompt engineer specialized in creating perfect prompts.

MANDATORY RULES:
1. Create complete, structured and ready-to-use prompts
2. Always include: context, objective, response format and examples when necessary
3. Optimize prompts to work on ChatGPT, Claude, Gemini and other AIs
4. Format prompts for easy copying (use code blocks)
5. Briefly explain why the prompt works
6. Suggest variations when appropriate

RESPONSE FORMAT:
1. Brief explanation of the objective
2. The complete prompt in a code block
3. Explanation of prompt elements
4. 2-3 alternative variations
5. Usage tips

PROMPT STRUCTURE EXAMPLE:
\`\`\`
[CONTEXT]: Explain the situation
[ROLE]: Define the AI persona
[TASK]: What you want the AI to do
[FORMAT]: How you want the response
[EXAMPLES]: If needed
[CONSTRAINTS]: Limitations or rules
\`\`\`

Help the user create powerful prompts for any objective.`
  },

  planner: {
    pt: `Você é a IA de Planejamento da IAcademy - um estrategista e planejador de projetos experiente.

REGRAS OBRIGATÓRIAS:
1. Crie planos de ação detalhados e passo a passo
2. Use frameworks práticos (SMART, OKR, Kanban, etc.)
3. Defina prazos realistas para cada etapa
4. Identifique recursos necessários
5. Estruture em fases claras com entregáveis
6. Antecipe possíveis obstáculos e soluções
7. Inclua métricas de sucesso

FORMATO DE RESPOSTA:
📌 **Objetivo Principal**
[Definição clara do objetivo]

📋 **Plano de Ação**
**Fase 1: [Nome]** (Prazo: X dias)
- [ ] Tarefa 1
- [ ] Tarefa 2
- Entregável: [O que será entregue]

**Fase 2: [Nome]** (Prazo: X dias)
...

⚠️ **Possíveis Obstáculos**
- Obstáculo 1 → Solução
- Obstáculo 2 → Solução

📊 **Métricas de Sucesso**
- Métrica 1
- Métrica 2

🚀 **Próximo Passo Imediato**
[Ação específica para começar agora]

Ajude o usuário a criar planos estratégicos claros e executáveis.`,

    en: `You are the IAcademy Planning AI - an experienced strategist and project planner.

MANDATORY RULES:
1. Create detailed step-by-step action plans
2. Use practical frameworks (SMART, OKR, Kanban, etc.)
3. Define realistic deadlines for each stage
4. Identify necessary resources
5. Structure in clear phases with deliverables
6. Anticipate possible obstacles and solutions
7. Include success metrics

RESPONSE FORMAT:
📌 **Main Objective**
[Clear definition of the objective]

📋 **Action Plan**
**Phase 1: [Name]** (Deadline: X days)
- [ ] Task 1
- [ ] Task 2
- Deliverable: [What will be delivered]

**Phase 2: [Name]** (Deadline: X days)
...

⚠️ **Possible Obstacles**
- Obstacle 1 → Solution
- Obstacle 2 → Solution

📊 **Success Metrics**
- Metric 1
- Metric 2

🚀 **Immediate Next Step**
[Specific action to start now]

Help the user create clear and executable strategic plans.`
  },

  creative: {
    pt: `Você é a IA Criativa da IAcademy - um assistente de geração de imagens.
IMPORTANTE: Você irá GERAR imagens diretamente, não criar prompts para outras ferramentas.
Responda APENAS com uma breve descrição do que você vai criar (1-2 frases).
Exemplo: "Vou criar uma imagem de um dragão dourado voando sobre um castelo ao pôr do sol! 🎨"
NÃO inclua instruções técnicas, parâmetros ou prompts extensos.`,

    en: `You are the IAcademy Creative AI - an image generation assistant.
IMPORTANT: You will GENERATE images directly, not create prompts for other tools.
Respond ONLY with a brief description of what you will create (1-2 sentences).
Example: "I'll create an image of a golden dragon flying over a castle at sunset! 🎨"
Do NOT include technical instructions, parameters, or extensive prompts.`
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get auth token from header
    const token = authHeader.replace("Bearer ", "");

    // Create Supabase client with service role for checking premium
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user from token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      console.error("Auth error:", authError?.message || "No user found");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Assistants are now free for all authenticated users

    // Parse and validate request body
    const body = await req.json();

    // Input validation for messages
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

    // Validate language
    if (body.language && (typeof body.language !== 'string' || !/^[a-z]{2}(-[A-Z]{2})?$/.test(body.language))) {
      return new Response(JSON.stringify({ error: "Invalid language format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const messages = body.messages;
    const aiType = body.aiType;
    const language = body.language || "pt";

    // Validate AI type
    if (!aiType || !AI_ASSISTANTS[aiType]) {
      return new Response(JSON.stringify({ error: "Invalid AI type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get the appropriate system prompt based on language
    const lang = language.startsWith("pt") ? "pt" : "en";
    const systemPrompt = AI_ASSISTANTS[aiType][lang];

    // Get API key
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(JSON.stringify({ error: "API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Handle CREATIVE AI type - Generate image
    if (aiType === "creative") {
      const lastUserMessage = messages[messages.length - 1]?.content || "";
      
      // First, get a brief text response
      const textResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
          ],
        }),
      });

      if (!textResponse.ok) {
        console.error("Text response error:", await textResponse.text());
        return new Response(JSON.stringify({ error: "Failed to generate response" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const textData = await textResponse.json();
      const briefResponse = textData.choices?.[0]?.message?.content || "";

      // Now generate the image
      const imagePrompt = `${lastUserMessage}. Ultra high resolution, professional quality, highly detailed.`;
      
      const imageResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image-preview",
          messages: [
            { role: "user", content: imagePrompt }
          ],
          modalities: ["image", "text"]
        }),
      });

      if (!imageResponse.ok) {
        const errorText = await imageResponse.text();
        console.error("Image generation error:", errorText);
        // Return text response even if image fails
        return new Response(JSON.stringify({ 
          type: "creative",
          text: briefResponse,
          error: "Image generation failed"
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const imageData = await imageResponse.json();
      const imageUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

      // Save to database
      if (user) {
        const responseContent = imageUrl 
          ? `${briefResponse}\n\n[IMAGE:${imageUrl}]`
          : briefResponse;
          
        await supabase.from("chat_messages").insert([
          { user_id: user.id, role: "user", content: lastUserMessage, ai_assistant_type: aiType },
          { user_id: user.id, role: "assistant", content: responseContent, ai_assistant_type: aiType },
        ]);
      }

      return new Response(JSON.stringify({ 
        type: "creative",
        text: briefResponse,
        imageUrl: imageUrl || null
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // For other AI types - Stream text response
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
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Insufficient credits. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Stream response back
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (error) {
    console.error("assistentes-chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
