import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GeneratedDay {
  day: number;
  tool: string;
  focus: string;
  exercise: string;
}

const languageNames: Record<string, string> = {
  pt: 'Portuguese',
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  ru: 'Russian',
  ar: 'Arabic',
  hi: 'Hindi',
  ja: 'Japanese',
  ko: 'Korean',
  nl: 'Dutch',
  pl: 'Polish',
  tr: 'Turkish',
  zh: 'Chinese'
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("Missing LOVABLE_API_KEY");
    }

    const { plan, targetLanguage, sourceLanguage } = await req.json();

    if (!plan || !Array.isArray(plan) || plan.length === 0) {
      throw new Error("Invalid plan data");
    }

    if (!targetLanguage) {
      throw new Error("Missing target language");
    }

    // If same language, return as is
    if (sourceLanguage === targetLanguage) {
      return new Response(JSON.stringify({ translatedPlan: plan }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const targetLangName = languageNames[targetLanguage] || 'English';

    console.log(`Translating trail from ${sourceLanguage || 'unknown'} to ${targetLanguage}`);

    // Create a simplified object for translation
    const contentToTranslate = plan.map((day: GeneratedDay) => ({
      day: day.day,
      focus: day.focus,
      exercise: day.exercise
    }));

    const systemPrompt = `You are a professional translator. Translate the following AI learning trail content to ${targetLangName}.

IMPORTANT RULES:
1. Maintain the same JSON structure
2. Only translate the "focus" and "exercise" fields
3. Keep the "day" field as a number
4. Preserve any tool names like ChatGPT, Claude, Gemini, etc. without translating them
5. Return ONLY valid JSON, no markdown, no explanations`;

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
          { role: "user", content: JSON.stringify(contentToTranslate) },
        ],
        temperature: 0.3,
        max_tokens: 6000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`Translation failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the translated content
    let translatedContent;
    try {
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      translatedContent = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse translation:", parseError);
      throw new Error("Failed to parse translated content");
    }

    // Merge translated content back with original plan (keeping tool info)
    const translatedPlan: GeneratedDay[] = plan.map((day: GeneratedDay) => {
      const translated = translatedContent.find((t: any) => t.day === day.day);
      return {
        day: day.day,
        tool: day.tool,
        focus: translated?.focus || day.focus,
        exercise: translated?.exercise || day.exercise
      };
    });

    console.log("Translation completed successfully");

    return new Response(JSON.stringify({ translatedPlan }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in translate-trail-content:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Translation failed" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

