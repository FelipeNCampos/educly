import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 3600000; // 1 hour in milliseconds
const MAX_REQUESTS_PER_WINDOW = 15; // Max requests per IP per hour

// Language names for instruction
const languageNames: Record<string, string> = {
  pt: 'Português',
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  it: 'Italiano',
  ru: 'Русский',
  zh: '中文',
  ja: '日本語',
  ko: '한국어',
  ar: 'العربية',
  hi: 'हिन्दी',
  tr: 'Türkçe',
  pl: 'Polski',
  nl: 'Nederlands'
};

const getSystemPrompt = (language: string): string => {
  const langName = languageNames[language] || 'English';
  
  return `You are EDI, the support assistant for Educly, a practical AI tools learning platform.

## YOUR MISSION
Help visitors understand Educly and guide them to become students.

## WHAT IS EDUCLY
- Practical teaching platform for 8 AI tools
- 28-day challenge with 10-15 minute daily lessons
- Tools: ChatGPT, Claude, DeepSeek, Gemini, NanoBanana, Lovable, Captions, ElevenLabs
- Over 50,000 students in 150+ countries
- 4.9/5 star rating
- We teach how to use AI and also show where to find AI jobs

## SPECIAL INFO
- We're a gamified platform, instead of teaching languages, we teach AI
- Besides learning AI, we teach how to work with AI to earn money
- We always prioritize student development and encourage evolution

## RULES
✅ Be friendly, helpful and human-like
✅ Answer clearly and concisely
✅ Highlight Educly benefits
✅ If asked about pricing, tell them to check the bottom of the landing page for plans
✅ Encourage starting the challenge
✅ CRITICAL: Always detect the user's language from their message OR from the browser detection
✅ CRITICAL: Always respond in the SAME LANGUAGE the user writes to you - if they write in English, respond in English; if they write in Spanish, respond in Spanish; etc.
✅ Avoid being pushy - make it clear you're support for questions. Sell as a last resort!
✅ Talk about our AI hub and premium area with AI jobs

## HUMAN CONTACT
⚠️ If the user wants to talk to a human, personalized service, or more detailed support, direct them to email: contact@educly.app
- Say something like: "To speak with our human support team, send an email to contact@educly.app and we'll respond within 24-48 hours."

❌ NEVER make up information
❌ NEVER talk about tools outside Educly
❌ NEVER be aggressive in selling
❌ NEVER mention competitors or similar apps

**CRITICAL LANGUAGE RULE: The user's browser language is ${langName}, but MORE IMPORTANTLY, you MUST respond in whatever language the user actually writes their message in. If they write in Portuguese, respond in Portuguese. If they write in French, respond in French. Always match the user's message language.**`;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role for rate limiting
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Extract client IP for rate limiting
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('x-real-ip') || 
                     'unknown';

    // Check rate limit
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
    
    const { data: rateLimitData, error: rateLimitError } = await supabase
      .from('landing_chat_rate_limits')
      .select('request_count, window_start')
      .eq('ip_address', clientIP)
      .gte('window_start', windowStart)
      .maybeSingle();

    if (rateLimitError) {
      console.error("Rate limit check error:", rateLimitError);
      // Continue without rate limiting if there's an error checking
    } else if (rateLimitData && rateLimitData.request_count >= MAX_REQUESTS_PER_WINDOW) {
      console.log(`Rate limit exceeded for IP: ${clientIP}`);
      return new Response(JSON.stringify({ 
        error: "Too many requests. Please try again later." 
      }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse and validate request body
    const body = await req.json();

    // Input validation for messages
    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0 || body.messages.length > 30) {
      return new Response(JSON.stringify({ error: "Invalid messages: must be array with 1-30 items" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate each message
    for (const msg of body.messages) {
      if (!msg || typeof msg.content !== 'string' || msg.content.length === 0 || msg.content.length > 5000) {
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

    // Validate locale
    if (body.locale && (typeof body.locale !== 'string' || !/^[a-z]{2}(-[A-Z]{2})?$/.test(body.locale))) {
      return new Response(JSON.stringify({ error: "Invalid locale format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const messages = body.messages;
    const locale = body.locale || 'en';
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Update rate limit counter (upsert)
    if (rateLimitData) {
      // Update existing record
      await supabase
        .from('landing_chat_rate_limits')
        .update({ 
          request_count: rateLimitData.request_count + 1 
        })
        .eq('ip_address', clientIP);
    } else {
      // Insert new record or update if exists (handles race conditions)
      await supabase
        .from('landing_chat_rate_limits')
        .upsert({ 
          ip_address: clientIP,
          request_count: 1,
          window_start: new Date().toISOString()
        }, {
          onConflict: 'ip_address'
        });
    }

    console.log("Processing support chat request with locale:", locale, "from IP:", clientIP);
    console.log("Number of messages:", messages.length);

    const systemPrompt = getSystemPrompt(locale);

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
        max_tokens: 400,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "AI connection error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Streaming response from AI gateway");

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Support chat error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
