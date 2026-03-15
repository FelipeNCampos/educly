import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type EmailType = 'welcome' | 'renewal';

// Traduções para emails - CORRIGIDO: Educly (não Educy)
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
    common: {
      rights: 'Todos os direitos reservados.',
      privacy: 'Política de Privacidade',
      terms: 'Termos de Uso',
    },
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
    common: {
      rights: 'All rights reserved.',
      privacy: 'Privacy Policy',
      terms: 'Terms of Use',
    },
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
    common: {
      rights: 'Todos los derechos reservados.',
      privacy: 'Política de Privacidad',
      terms: 'Términos de Uso',
    },
  },
  fr: {
    welcome: {
      subject: '🎉 Bienvenue chez Educly ! Votre voyage dans l\'IA commence maintenant',
      greeting: 'Bienvenue chez Educly',
      body: 'Félicitations ! Vous avez fait le premier pas pour maîtriser l\'Intelligence Artificielle et transformer votre carrière.',
      featuresTitle: 'Ce que vous allez apprendre :',
      feature1: 'Comment utiliser ChatGPT, Claude et d\'autres IAs',
      feature2: 'Créer des images incroyables avec l\'IA',
      feature3: 'Automatiser les tâches quotidiennes',
      feature4: 'Gagner de l\'argent avec vos nouvelles compétences',
      readyText: 'Votre compte est prêt et vous pouvez commencer à apprendre dès maintenant !',
      cta: 'Accéder à Mon Compte',
      helpText: 'Si vous avez besoin d\'aide, répondez à cet email ou contactez notre support.',
      closing: 'Bon apprentissage !',
      team: 'Équipe Educly',
    },
    common: {
      rights: 'Tous droits réservés.',
      privacy: 'Politique de Confidentialité',
      terms: 'Conditions d\'Utilisation',
    },
  },
  de: {
    welcome: {
      subject: '🎉 Willkommen bei Educly! Ihre KI-Reise beginnt jetzt',
      greeting: 'Willkommen bei Educly',
      body: 'Herzlichen Glückwunsch! Sie haben den ersten Schritt gemacht, um Künstliche Intelligenz zu meistern und Ihre Karriere zu transformieren.',
      featuresTitle: 'Was Sie lernen werden:',
      feature1: 'Wie man ChatGPT, Claude und andere KIs verwendet',
      feature2: 'Erstaunliche Bilder mit KI erstellen',
      feature3: 'Tägliche Aufgaben automatisieren',
      feature4: 'Geld mit Ihren neuen Fähigkeiten verdienen',
      readyText: 'Ihr Konto ist bereit und Sie können jetzt sofort mit dem Lernen beginnen!',
      cta: 'Auf Mein Konto Zugreifen',
      helpText: 'Wenn Sie Hilfe benötigen, antworten Sie auf diese E-Mail oder kontaktieren Sie unseren Support.',
      closing: 'Viel Erfolg beim Lernen!',
      team: 'Educly Team',
    },
    common: {
      rights: 'Alle Rechte vorbehalten.',
      privacy: 'Datenschutzrichtlinie',
      terms: 'Nutzungsbedingungen',
    },
  },
  it: {
    welcome: {
      subject: '🎉 Benvenuto su Educly! Il tuo viaggio nell\'IA inizia ora',
      greeting: 'Benvenuto su Educly',
      body: 'Congratulazioni! Hai fatto il primo passo per padroneggiare l\'Intelligenza Artificiale e trasformare la tua carriera.',
      featuresTitle: 'Cosa imparerai:',
      feature1: 'Come usare ChatGPT, Claude e altre IA',
      feature2: 'Creare immagini incredibili con l\'IA',
      feature3: 'Automatizzare le attività quotidiane',
      feature4: 'Guadagnare con le tue nuove competenze',
      readyText: 'Il tuo account è pronto e puoi iniziare a imparare subito!',
      cta: 'Accedi al Mio Account',
      helpText: 'Se hai bisogno di aiuto, rispondi a questa email o contatta il nostro supporto.',
      closing: 'Buon apprendimento!',
      team: 'Team Educly',
    },
    common: {
      rights: 'Tutti i diritti riservati.',
      privacy: 'Politica sulla Privacy',
      terms: 'Termini di Utilizzo',
    },
  },
  ru: {
    welcome: {
      subject: '🎉 Добро пожаловать в Educly! Ваше путешествие в ИИ начинается сейчас',
      greeting: 'Добро пожаловать в Educly',
      body: 'Поздравляем! Вы сделали первый шаг к освоению Искусственного Интеллекта и преобразованию своей карьеры.',
      featuresTitle: 'Что вы узнаете:',
      feature1: 'Как использовать ChatGPT, Claude и другие ИИ',
      feature2: 'Создавать потрясающие изображения с помощью ИИ',
      feature3: 'Автоматизировать повседневные задачи',
      feature4: 'Зарабатывать деньги с вашими новыми навыками',
      readyText: 'Ваш аккаунт готов, и вы можете начать обучение прямо сейчас!',
      cta: 'Войти в Мой Аккаунт',
      helpText: 'Если вам нужна помощь, ответьте на это письмо или свяжитесь с нашей поддержкой.',
      closing: 'Успешного обучения!',
      team: 'Команда Educly',
    },
    common: {
      rights: 'Все права защищены.',
      privacy: 'Политика Конфиденциальности',
      terms: 'Условия Использования',
    },
  },
};

const SUPPORTED_LANGS = ['pt', 'en', 'es', 'fr', 'de', 'it', 'ru'];

function getTranslation(lang: string, type: EmailType, key: string): string {
  const normalizedLang = lang.toLowerCase().split('-')[0];
  if (TRANSLATIONS[normalizedLang]?.[type]?.[key]) {
    return TRANSLATIONS[normalizedLang][type][key];
  }
  return TRANSLATIONS['en'][type][key] || '';
}

function getCommonTranslation(lang: string, key: string): string {
  const normalizedLang = lang.toLowerCase().split('-')[0];
  if (TRANSLATIONS[normalizedLang]?.common?.[key]) {
    return TRANSLATIONS[normalizedLang].common[key];
  }
  return TRANSLATIONS['en'].common[key] || '';
}

// HTML MINIFICADO para evitar artefatos =20 (Quoted-Printable)
function getEmailHtml(userName: string, language: string): string {
  const t = (key: string) => getTranslation(language, 'welcome', key);
  const tc = (key: string) => getCommonTranslation(language, key);

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#f6f9fc;margin:0;padding:40px 20px}.container{background-color:#fff;max-width:600px;margin:0 auto;padding:40px 30px;border-radius:8px}.logo{text-align:center;margin-bottom:32px}h1{color:#1a1a2e;font-size:28px;font-weight:700;text-align:center;margin:0 0 24px}p{color:#4a5568;font-size:16px;line-height:26px;margin:16px 0}.highlight-box{background-color:#f0f4ff;border-radius:8px;padding:20px;margin:24px 0;border-left:4px solid #6366f1}.success-box{background-color:#ecfdf5;border-radius:8px;padding:16px 20px;margin:24px 0;border-left:4px solid #10b981;text-align:center}.button-container{text-align:center;margin:32px 0}.button{background-color:#6366f1;border-radius:8px;color:#fff;font-size:16px;font-weight:600;text-decoration:none;padding:14px 32px;display:inline-block}.footer{border-top:1px solid #e2e8f0;margin-top:32px;padding-top:24px;text-align:center}.footer p{color:#a0aec0;font-size:12px}.footer a{color:#6366f1;text-decoration:underline}</style></head><body><div class="container"><div class="logo"><img src="https://educly.lovable.app/logo-educly.png" width="150" height="50" alt="Educly"/></div><h1>🎉 ${t('greeting')}, ${userName}!</h1><p>${t('body')}</p><div class="highlight-box"><p style="margin:0 0 12px"><strong>🚀 ${t('featuresTitle')}</strong></p><p style="margin:8px 0">✅ ${t('feature1')}</p><p style="margin:8px 0">✅ ${t('feature2')}</p><p style="margin:8px 0">✅ ${t('feature3')}</p><p style="margin:8px 0">✅ ${t('feature4')}</p></div><div class="success-box"><p style="margin:0;color:#059669;font-weight:600">✓ ${t('readyText')}</p></div><div class="button-container"><a href="https://educly.lovable.app/auth" class="button">${t('cta')}</a></div><p style="text-align:center;color:#718096;font-size:14px">${t('helpText')}</p><p style="text-align:center;color:#718096;font-size:14px;margin-top:24px">${t('closing')}<br><strong>${t('team')}</strong></p><div class="footer"><p>© 2025 Educly. ${tc('rights')}<br><a href="https://educly.lovable.app/politica-privacidade">${tc('privacy')}</a> | <a href="https://educly.lovable.app/termos-uso">${tc('terms')}</a></p></div></div></body></html>`;
}

// Detectar idioma do payload do webhook
function detectLanguageFromPayload(payload: any): string {
  // Funnelfox: customer.language
  if (payload?.customer?.language) {
    const lang = payload.customer.language.toLowerCase().split('-')[0];
    if (SUPPORTED_LANGS.includes(lang)) return lang;
  }
  
  // Hotmart: data.buyer.locale
  if (payload?.data?.buyer?.locale) {
    const lang = payload.data.buyer.locale.toLowerCase().split('-')[0];
    if (SUPPORTED_LANGS.includes(lang)) return lang;
  }
  
  // Funnelfox: subscription.customer.language
  if (payload?.subscription?.customer?.language) {
    const lang = payload.subscription.customer.language.toLowerCase().split('-')[0];
    if (SUPPORTED_LANGS.includes(lang)) return lang;
  }
  
  // Fallback para espanhol (maioria dos usuários são hispanofalantes)
  return 'es';
}

async function sendEmailViaSMTP(to: string, userName: string, language: string): Promise<void> {
  const smtpHost = Deno.env.get("SMTP_HOST");
  const smtpPort = parseInt(Deno.env.get("SMTP_PORT") || "465");
  const smtpEmail = Deno.env.get("SMTP_EMAIL");
  const smtpPassword = Deno.env.get("SMTP_PASSWORD");

  if (!smtpHost || !smtpEmail || !smtpPassword) {
    throw new Error("SMTP credentials not configured");
  }

  const subject = getTranslation(language, 'welcome', 'subject');
  const html = getEmailHtml(userName, language);

  const client = new SMTPClient({
    connection: {
      hostname: smtpHost,
      port: smtpPort,
      tls: true,
      auth: {
        username: smtpEmail,
        password: smtpPassword,
      },
    },
  });

  try {
    await client.send({
      from: `Educly <${smtpEmail}>`,
      to: to,
      subject: subject,
      content: "auto",
      html: html,
    });
    console.log(`✅ Email sent to ${to} in language: ${language}`);
  } finally {
    await client.close();
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

interface EmailResult {
  email: string;
  success: boolean;
  language: string;
  error?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { secret, targetEmails } = body;

    const expectedSecret = Deno.env.get("BULK_EMAIL_SECRET");
    if (!expectedSecret || secret !== expectedSecret) {
      console.error("[resend-pending-emails] Invalid or missing secret");
      return new Response(
        JSON.stringify({ error: "Unauthorized - Invalid secret" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[resend-pending-emails] Starting to resend pending emails...");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get pending billing events (USER_NOT_FOUND) from last 48 hours
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const { data: pendingEvents, error: queryError } = await supabase
      .from('billing_event_logs')
      .select('email, payload, created_at')
      .eq('status', 'USER_NOT_FOUND')
      .gte('created_at', twoDaysAgo.toISOString())
      .order('created_at', { ascending: false });

    if (queryError) {
      console.error("[resend-pending-emails] Error fetching pending events:", queryError);
      throw new Error(`Failed to fetch pending events: ${queryError.message}`);
    }

    console.log(`[resend-pending-emails] Found ${pendingEvents?.length || 0} pending events`);

    // Get unique emails from pending events with language detection
    const pendingEmails = new Map<string, { email: string; userName: string; language: string }>();
    
    for (const event of pendingEvents || []) {
      const email = event.email?.toLowerCase();
      if (!email || pendingEmails.has(email)) continue;

      // Extract name from payload
      let userName = email.split('@')[0];
      const payload = event.payload as any;
      
      if (payload?.customer?.firstName) {
        userName = payload.customer.firstName;
      } else if (payload?.data?.buyer?.name) {
        userName = payload.data.buyer.name.split(' ')[0];
      } else if (payload?.buyer?.first_name) {
        userName = payload.buyer.first_name;
      }

      // Detect language from payload
      const language = detectLanguageFromPayload(payload);

      pendingEmails.set(email, { email, userName, language });
    }

    // Add target emails if provided (for testing/manual override)
    if (targetEmails && Array.isArray(targetEmails)) {
      for (const email of targetEmails) {
        const lowerEmail = email.toLowerCase();
        if (!pendingEmails.has(lowerEmail)) {
          // Para emails de teste, usar português
          pendingEmails.set(lowerEmail, { 
            email: lowerEmail, 
            userName: lowerEmail.split('@')[0],
            language: 'pt'
          });
        }
      }
    }

    console.log(`[resend-pending-emails] Will send to ${pendingEmails.size} unique emails`);

    const results: EmailResult[] = [];
    let successCount = 0;
    let errorCount = 0;

    for (const [, { email, userName, language }] of pendingEmails) {
      console.log(`[resend-pending-emails] Sending to ${email} (${userName}, lang: ${language})`);

      try {
        await sendEmailViaSMTP(email, userName, language);
        results.push({ email, success: true, language });
        successCount++;
        console.log(`[resend-pending-emails] ✓ Sent to ${email}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        results.push({ email, success: false, language, error: errorMessage });
        errorCount++;
        console.error(`[resend-pending-emails] ✗ Failed to send to ${email}:`, errorMessage);
      }

      // Rate limiting - wait 5s between emails to avoid Hostinger rate limit
      await delay(5000);
    }

    const summary = {
      totalEmails: pendingEmails.size,
      emailsSent: successCount,
      emailsFailed: errorCount,
      results,
    };

    console.log(`[resend-pending-emails] Complete! Sent: ${successCount}, Failed: ${errorCount}`);

    return new Response(
      JSON.stringify(summary),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[resend-pending-emails] Error:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
