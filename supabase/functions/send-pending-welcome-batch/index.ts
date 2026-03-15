import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BATCH_SIZE = 15;
const DELAY_BETWEEN_EMAILS_MS = 5000;

type EmailType = 'welcome' | 'renewal';

const TRANSLATIONS: Record<string, Record<string, Record<string, string>>> = {
  pt: {
    welcome: {
      subject: '🎉 Bem-vindo à Educly! Sua jornada na IA começa agora',
      greeting: 'Bem-vindo à Educly',
      body: 'Parabéns! Você deu o primeiro passo para dominar a Inteligência Artificial e transformar sua carreira.',
      featuresTitle: 'O que você vai aprender:',
      feature1: 'Como usar ChatGPT, Claude e outras IAs',
      feature2: 'Criar imagens incríveis com IA',
      feature3: 'Automatizar tarefas do dia a dia',
      feature4: 'Ganhar dinheiro com suas novas habilidades',
      readyText: 'Sua conta está pronta e você já pode começar a aprender agora mesmo!',
      cta: 'Acessar Minha Conta',
      helpText: 'Se precisar de ajuda, responda este email ou acesse nosso suporte.',
      closing: 'Bons estudos!',
      team: 'Equipe Educly',
    },
    common: { rights: 'Todos os direitos reservados.', privacy: 'Política de Privacidade', terms: 'Termos de Uso' },
  },
  en: {
    welcome: {
      subject: '🎉 Welcome to Educly! Your AI journey starts now',
      greeting: 'Welcome to Educly',
      body: 'Congratulations! You have taken the first step to master Artificial Intelligence and transform your career.',
      featuresTitle: 'What you will learn:',
      feature1: 'How to use ChatGPT, Claude and other AIs',
      feature2: 'Create amazing images with AI',
      feature3: 'Automate daily tasks',
      feature4: 'Earn money with your new skills',
      readyText: 'Your account is ready and you can start learning right now!',
      cta: 'Access My Account',
      helpText: 'If you need help, reply to this email or contact our support.',
      closing: 'Happy learning!',
      team: 'Educly Team',
    },
    common: { rights: 'All rights reserved.', privacy: 'Privacy Policy', terms: 'Terms of Use' },
  },
  es: {
    welcome: {
      subject: '🎉 ¡Bienvenido a Educly! Tu viaje en IA comienza ahora',
      greeting: 'Bienvenido a Educly',
      body: '¡Felicitaciones! Has dado el primer paso para dominar la Inteligencia Artificial y transformar tu carrera.',
      featuresTitle: 'Lo que aprenderás:',
      feature1: 'Cómo usar ChatGPT, Claude y otras IAs',
      feature2: 'Crear imágenes increíbles con IA',
      feature3: 'Automatizar tareas diarias',
      feature4: 'Ganar dinero con tus nuevas habilidades',
      readyText: '¡Tu cuenta está lista y ya puedes empezar a aprender ahora mismo!',
      cta: 'Acceder a Mi Cuenta',
      helpText: 'Si necesitas ayuda, responde a este correo o contacta nuestro soporte.',
      closing: '¡Buen aprendizaje!',
      team: 'Equipo Educly',
    },
    common: { rights: 'Todos los derechos reservados.', privacy: 'Política de Privacidad', terms: 'Términos de Uso' },
  },
  fr: {
    welcome: {
      subject: '🎉 Bienvenue chez Educly !',
      greeting: 'Bienvenue chez Educly',
      body: 'Félicitations ! Vous avez fait le premier pas pour maîtriser l\'Intelligence Artificielle.',
      featuresTitle: 'Ce que vous allez apprendre :',
      feature1: 'Comment utiliser ChatGPT, Claude et d\'autres IAs',
      feature2: 'Créer des images incroyables avec l\'IA',
      feature3: 'Automatiser les tâches quotidiennes',
      feature4: 'Gagner de l\'argent avec vos nouvelles compétences',
      readyText: 'Votre compte est prêt !',
      cta: 'Accéder à Mon Compte',
      helpText: 'Si vous avez besoin d\'aide, répondez à cet email.',
      closing: 'Bon apprentissage !',
      team: 'Équipe Educly',
    },
    common: { rights: 'Tous droits réservés.', privacy: 'Politique de Confidentialité', terms: 'Conditions d\'Utilisation' },
  },
  de: {
    welcome: {
      subject: '🎉 Willkommen bei Educly!',
      greeting: 'Willkommen bei Educly',
      body: 'Herzlichen Glückwunsch! Sie haben den ersten Schritt gemacht, um KI zu meistern.',
      featuresTitle: 'Was Sie lernen werden:',
      feature1: 'Wie man ChatGPT, Claude und andere KIs verwendet',
      feature2: 'Erstaunliche Bilder mit KI erstellen',
      feature3: 'Tägliche Aufgaben automatisieren',
      feature4: 'Geld mit Ihren neuen Fähigkeiten verdienen',
      readyText: 'Ihr Konto ist bereit!',
      cta: 'Auf Mein Konto Zugreifen',
      helpText: 'Wenn Sie Hilfe benötigen, antworten Sie auf diese E-Mail.',
      closing: 'Viel Erfolg beim Lernen!',
      team: 'Educly Team',
    },
    common: { rights: 'Alle Rechte vorbehalten.', privacy: 'Datenschutzrichtlinie', terms: 'Nutzungsbedingungen' },
  },
  it: {
    welcome: {
      subject: '🎉 Benvenuto su Educly!',
      greeting: 'Benvenuto su Educly',
      body: 'Congratulazioni! Hai fatto il primo passo per padroneggiare l\'IA.',
      featuresTitle: 'Cosa imparerai:',
      feature1: 'Come usare ChatGPT, Claude e altre IA',
      feature2: 'Creare immagini incredibili con l\'IA',
      feature3: 'Automatizzare le attività quotidiane',
      feature4: 'Guadagnare con le tue nuove competenze',
      readyText: 'Il tuo account è pronto!',
      cta: 'Accedi al Mio Account',
      helpText: 'Se hai bisogno di aiuto, rispondi a questa email.',
      closing: 'Buon apprendimento!',
      team: 'Team Educly',
    },
    common: { rights: 'Tutti i diritti riservati.', privacy: 'Politica sulla Privacy', terms: 'Termini di Utilizzo' },
  },
  ru: {
    welcome: {
      subject: '🎉 Добро пожаловать в Educly!',
      greeting: 'Добро пожаловать в Educly',
      body: 'Поздравляем! Вы сделали первый шаг к освоению ИИ.',
      featuresTitle: 'Что вы узнаете:',
      feature1: 'Как использовать ChatGPT, Claude и другие ИИ',
      feature2: 'Создавать потрясающие изображения с помощью ИИ',
      feature3: 'Автоматизировать повседневные задачи',
      feature4: 'Зарабатывать деньги с вашими новыми навыками',
      readyText: 'Ваш аккаунт готов!',
      cta: 'Войти в Мой Аккаунт',
      helpText: 'Если вам нужна помощь, ответьте на это письмо.',
      closing: 'Успешного обучения!',
      team: 'Команда Educly',
    },
    common: { rights: 'Все права защищены.', privacy: 'Политика Конфиденциальности', terms: 'Условия Использования' },
  },
};

function getTranslation(lang: string, type: EmailType, key: string): string {
  const n = lang.toLowerCase().split('-')[0];
  return TRANSLATIONS[n]?.[type]?.[key] || TRANSLATIONS['en']?.[type]?.[key] || '';
}

function getCommonTranslation(lang: string, key: string): string {
  const n = lang.toLowerCase().split('-')[0];
  return TRANSLATIONS[n]?.common?.[key] || TRANSLATIONS['en']?.common?.[key] || '';
}

function getEmailHtml(userName: string, language: string, trackingPixelUrl: string): string {
  const t = (key: string) => getTranslation(language, 'welcome', key);
  const tc = (key: string) => getCommonTranslation(language, key);
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#f6f9fc;margin:0;padding:40px 20px}.container{background-color:#fff;max-width:600px;margin:0 auto;padding:40px 30px;border-radius:8px}.logo{text-align:center;margin-bottom:32px}h1{color:#1a1a2e;font-size:28px;font-weight:700;text-align:center;margin:0 0 24px}p{color:#4a5568;font-size:16px;line-height:26px;margin:16px 0}.highlight-box{background-color:#f0f4ff;border-radius:8px;padding:20px;margin:24px 0;border-left:4px solid #6366f1}.success-box{background-color:#ecfdf5;border-radius:8px;padding:16px 20px;margin:24px 0;border-left:4px solid #10b981;text-align:center}.button-container{text-align:center;margin:32px 0}.button{background-color:#6366f1;border-radius:8px;color:#fff;font-size:16px;font-weight:600;text-decoration:none;padding:14px 32px;display:inline-block}.footer{border-top:1px solid #e2e8f0;margin-top:32px;padding-top:24px;text-align:center}.footer p{color:#a0aec0;font-size:12px}.footer a{color:#6366f1;text-decoration:underline}</style></head><body><div class="container"><div class="logo"><img src="https://educly.lovable.app/logo-educly.png" width="150" height="50" alt="Educly"/></div><h1>🎉 ${t('greeting')}, ${userName}!</h1><p>${t('body')}</p><div class="highlight-box"><p style="margin:0 0 12px"><strong>🚀 ${t('featuresTitle')}</strong></p><p style="margin:8px 0">✅ ${t('feature1')}</p><p style="margin:8px 0">✅ ${t('feature2')}</p><p style="margin:8px 0">✅ ${t('feature3')}</p><p style="margin:8px 0">✅ ${t('feature4')}</p></div><div class="success-box"><p style="margin:0;color:#059669;font-weight:600">✓ ${t('readyText')}</p></div><div class="button-container"><a href="https://educly.lovable.app/auth" class="button">${t('cta')}</a></div><p style="text-align:center;color:#718096;font-size:14px">${t('helpText')}</p><p style="text-align:center;color:#718096;font-size:14px;margin-top:24px">${t('closing')}<br><strong>${t('team')}</strong></p><div class="footer"><p>© 2025 Educly. ${tc('rights')}<br><a href="https://educly.lovable.app/politica-privacidade">${tc('privacy')}</a> | <a href="https://educly.lovable.app/termos-uso">${tc('terms')}</a></p></div></div><img src="${trackingPixelUrl}" width="1" height="1" style="display:none" alt=""/></body></html>`;
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Validate admin JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const token = authHeader.replace('Bearer ', '');

    // Verify user with anon client
    const anonClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claims, error: claimsError } = await anonClient.auth.getClaims(token);
    if (claimsError || !claims?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Invalid token" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Check admin role
    const { data: isAdmin } = await anonClient.rpc('is_admin');
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Admin access required" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabase = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    console.log("[send-pending-welcome-batch] Starting batch...");

    // ===== FLOW 1: Registered users who haven't received welcome email =====
    const { data: billingEvents, error: billingError } = await supabase
      .from('billing_event_logs')
      .select('email, user_id, payload')
      .eq('processed', true)
      .eq('status', 'success')
      .not('user_id', 'is', null);

    if (billingError) throw new Error(`Failed to fetch billing events: ${billingError.message}`);

    // ===== FLOW 2: Unregistered buyers (USER_NOT_FOUND) =====
    const purchaseEventTypes = [
      'SETTLED', 'STARTING_TRIAL', 'SUBSCRIPTION_SETTLED',
      'SUBSCRIPTION_TRIAL_STARTED', 'GRANTED', 'CONVERTION',
      'RENEWING', 'RESUMING', 'RECOVERING', 'RECOVERING_AUTORENEW',
      'PURCHASE_COMPLETE', 'PURCHASE_APPROVED', 'PURCHASE_PROTEST', 'PURCHASE_DELAYED'
    ];

    const { data: unregisteredEvents, error: unregError } = await supabase
      .from('billing_event_logs')
      .select('id, email, payload, event_type')
      .eq('status', 'USER_NOT_FOUND')
      .eq('processed', false)
      .in('event_type', purchaseEventTypes);

    if (unregError) throw new Error(`Failed to fetch unregistered events: ${unregError.message}`);

    // Also try lowercase event types
    const { data: unregisteredEventsLower } = await supabase
      .from('billing_event_logs')
      .select('id, email, payload, event_type')
      .eq('status', 'USER_NOT_FOUND')
      .eq('processed', false)
      .in('event_type', purchaseEventTypes.map(e => e.toLowerCase()));

    const allUnregistered = [...(unregisteredEvents || []), ...(unregisteredEventsLower || [])];

    // Deduplicate by id
    const unregMap = new Map(allUnregistered.map(e => [e.id, e]));
    const uniqueUnregistered = Array.from(unregMap.values());

    console.log(`[batch] Flow 1: ${billingEvents?.length || 0} registered events, Flow 2: ${uniqueUnregistered.length} unregistered events`);

    // Get all welcome emails already sent (for deduplication)
    const { data: sentEmails, error: sentError } = await supabase
      .from('email_logs')
      .select('recipient_email')
      .eq('email_type', 'welcome');

    if (sentError) throw new Error(`Failed to fetch email logs: ${sentError.message}`);

    const sentEmailSet = new Set((sentEmails || []).map(e => e.recipient_email.toLowerCase()));

    // Build unified pending list
    // Type: 'registered' = has user_id, 'recovery' = USER_NOT_FOUND
    type PendingEmail = { email: string; userId: string | null; payload: any; type: 'registered' | 'recovery'; billingEventId?: string };
    const pendingMap = new Map<string, PendingEmail>();

    // Flow 1: registered users
    for (const event of billingEvents || []) {
      const email = event.email?.toLowerCase().trim().replace(/\.+$/, '');
      if (!email || sentEmailSet.has(email) || pendingMap.has(email)) continue;
      pendingMap.set(email, { email, userId: event.user_id, payload: event.payload, type: 'registered' });
    }

    // Flow 2: unregistered buyers
    for (const event of uniqueUnregistered) {
      const email = event.email?.toLowerCase().trim().replace(/\.+$/, '');
      if (!email || sentEmailSet.has(email) || pendingMap.has(email)) continue;
      pendingMap.set(email, { email, userId: null, payload: event.payload, type: 'recovery', billingEventId: event.id });
    }

    const pendingList = Array.from(pendingMap.values()).slice(0, BATCH_SIZE);
    const totalRemaining = pendingMap.size;

    const registeredCount = pendingList.filter(p => p.type === 'registered').length;
    const recoveryCount = pendingList.filter(p => p.type === 'recovery').length;
    console.log(`[batch] Total pending: ${totalRemaining}, sending: ${pendingList.length} (${registeredCount} registered, ${recoveryCount} recovery)`);

    if (pendingList.length === 0) {
      return new Response(JSON.stringify({ sent: 0, remaining: 0, message: "No pending emails" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Get profiles for registered users
    const registeredUserIds = pendingList.filter(p => p.userId).map(p => p.userId!);
    const { data: profiles } = registeredUserIds.length > 0
      ? await supabase.from('profiles').select('id, full_name, preferred_language').in('id', registeredUserIds)
      : { data: [] };

    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

    // Get product language from product_definitions
    const productIds = pendingList
      .map(p => p.payload?.product_id || p.payload?.data?.product?.id || p.payload?.oneoff?.product_id)
      .filter(Boolean);
    
    const { data: productDefs } = productIds.length > 0
      ? await supabase.from('product_definitions').select('product_id, language').in('product_id', productIds)
      : { data: [] };

    const productLangMap = new Map(productDefs?.map(p => [p.product_id, p.language]) || []);

    const results: Array<{ email: string; success: boolean; type: string; error?: string }> = [];
    let successCount = 0;

    for (const pending of pendingList) {
      try {
        // Extract buyer name: profile > payload > email prefix
        let userName: string;
        if (pending.userId && profileMap.has(pending.userId)) {
          userName = profileMap.get(pending.userId)!.full_name || pending.email.split('@')[0];
        } else {
          // Extract from payload for unregistered buyers
          userName = pending.payload?.buyer_name
            || pending.payload?.data?.buyer?.name
            || pending.payload?.buyer?.name
            || pending.payload?.subscriber?.name
            || pending.email.split('@')[0];
        }

        // Language priority: product_definitions > profile > payload > fallback
        const productId = pending.payload?.product_id || pending.payload?.data?.product?.id || pending.payload?.oneoff?.product_id;
        const productLang = productId ? productLangMap.get(productId) : null;
        const profileLang = pending.userId ? profileMap.get(pending.userId)?.preferred_language : null;
        const language = (productLang || profileLang || 'es').toLowerCase().split('-')[0];

        const subject = getTranslation(language, 'welcome', 'subject');

        // Insert email_log (user_id is null for recovery emails)
        const { data: logEntry, error: logError } = await supabase
          .from('email_logs')
          .insert({
            recipient_email: pending.email,
            email_type: 'welcome',
            subject,
            status: 'pending',
            user_id: pending.userId,
            metadata: { source: pending.type === 'recovery' ? 'batch_recovery_unregistered' : 'batch_recovery_registered' },
          })
          .select('id')
          .single();

        if (logError) throw new Error(`Failed to create email log: ${logError.message}`);

        const trackingUrl = `${supabaseUrl}/functions/v1/track-email-open?id=${logEntry.id}`;
        const html = getEmailHtml(userName, language, trackingUrl);

        // Send via SMTP
        const client = new SMTPClient({
          connection: {
            hostname: Deno.env.get("SMTP_HOST")!,
            port: parseInt(Deno.env.get("SMTP_PORT") || "465"),
            tls: true,
            auth: { username: Deno.env.get("SMTP_EMAIL")!, password: Deno.env.get("SMTP_PASSWORD")! },
          },
        });

        try {
          await client.send({
            from: `Educly <${Deno.env.get("SMTP_EMAIL")}>`,
            to: pending.email,
            subject,
            content: "auto",
            html,
          });
        } finally {
          await client.close();
        }

        // Update log to sent
        await supabase
          .from('email_logs')
          .update({ status: 'sent', sent_at: new Date().toISOString() })
          .eq('id', logEntry.id);

        results.push({ email: pending.email, success: true, type: pending.type });
        successCount++;
        console.log(`[batch] ✓ ${pending.email} (${language}) [${pending.type}]`);

      } catch (error) {
        const msg = error instanceof Error ? error.message : "Unknown";
        results.push({ email: pending.email, success: false, type: pending.type, error: msg });
        console.error(`[batch] ✗ ${pending.email}:`, msg);
      }

      // Rate limit delay
      await delay(DELAY_BETWEEN_EMAILS_MS);
    }

    const remaining = totalRemaining - successCount;

    return new Response(JSON.stringify({
      sent: successCount,
      failed: pendingList.length - successCount,
      remaining,
      results,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown";
    console.error("[send-pending-welcome-batch] Error:", msg);
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
