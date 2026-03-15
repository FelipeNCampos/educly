import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, ff-webhook-signature, x-hotmart-hottok',
};

// ==================== INTERFACES ====================

interface SubscriptionWebhookPayload {
  event_id?: string;
  event_type?: string;
  subtype?: string;
  user?: {
    email?: string;
  };
  order?: {
    status?: string;
    initial_order_metadata?: {
      email?: string;
    };
  };
  subscription?: {
    customer?: {
      email?: string;
    };
    initial_order_metadata?: {
      email?: string;
    };
    price_point?: {
      ident?: string;
      features?: Array<{
        ident?: string;
      }>;
    };
  };
  oneoff?: {
    customer?: {
      email?: string;
    };
    price_point?: {
      ident?: string;
      features?: Array<{
        ident?: string;
      }>;
    };
  };
  customer?: {
    email?: string;
  };
  email?: string;
}

interface HotmartWebhookPayload {
  event?: string;
  id?: string;
  creation_date?: number;
  data?: {
    buyer?: {
      email?: string;
      name?: string;
    };
    subscriber?: {
      email?: string;
      name?: string;
    };
    product?: {
      id?: string | number;
      name?: string;
      has_co_production?: boolean;
    };
    purchase?: {
      status?: string;
      transaction?: string;
      order_date?: number;
      approved_date?: number;
      price?: {
        value?: number;
        currency_value?: string;
      };
    };
    subscription?: {
      status?: string;
      subscriber?: {
        code?: string;
      };
    };
  };
}

// ==================== FUNNELFOX EVENTS ====================

const GRANT_PREMIUM_SUBTYPES = [
  'SETTLED',
  'STARTING_TRIAL',
  'CONVERTION',
  'RENEWING',
  'RESUMING',
  'RECOVERING',
  'RECOVERING_AUTORENEW'
];

const REVOKE_PREMIUM_SUBTYPES = [
  'UNSUBSCRIPTION',
  'EXPIRATION',
  'PAUSING',
  'FINISH_GRACE',
  'DECLINED',
  'REVOKED'
];

const IGNORED_SUBTYPES = [
  'START_GRACE',
  'START_RETRY',
  'DEFERRING',
  'PLANNING_POSTPONED_SUBSCRIPTION',
  'UNKNOWN'
];

// ==================== HOTMART EVENTS ====================

const HOTMART_GRANT_EVENTS = [
  'PURCHASE_COMPLETE',
  'PURCHASE_APPROVED',
  'PURCHASE_PROTEST',
  'PURCHASE_DELAYED'
];

const HOTMART_REVOKE_EVENTS = [
  'PURCHASE_REFUNDED',
  'PURCHASE_CHARGEBACK',
  'PURCHASE_CANCELED',
  'SUBSCRIPTION_CANCELLATION'
];

const HOTMART_IGNORED_EVENTS = [
  'PURCHASE_BILLET_PRINTED',
  'PURCHASE_OUT_OF_SHOPPING_CART',
  'SWITCH_PLAN'
];

const EMAIL_TYPE_MAP: Record<string, string> = {
  'SETTLED': 'welcome',
  'STARTING_TRIAL': 'welcome',
  'CONVERTION': 'welcome',
  'GRANTED': 'welcome',
  'RENEWING': 'renewal',
  'PURCHASE_COMPLETE': 'welcome',
  'PURCHASE_APPROVED': 'welcome',
};

type EmailType = 'welcome' | 'renewal';
type WebhookSource = 'funnelfox' | 'hotmart' | 'unknown';

// ==================== TRANSLATIONS - CORRIGIDO: Educly ====================

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
    renewal: {
      subject: '✅ Assinatura renovada com sucesso!',
      greeting: 'Assinatura Renovada!',
      body: 'sua assinatura da Educly foi renovada com sucesso. Obrigado por continuar aprendendo conosco!',
      accessActive: 'Seu acesso premium continua ativo!',
      continueEnjoying: 'Continue aproveitando:',
      feature1: 'Todas as aulas de IA disponíveis',
      feature2: 'Chat ilimitado com assistentes inteligentes',
      feature3: 'Novos cursos e conteúdos exclusivos',
      feature4: 'Certificados de conclusão',
      cta: 'Continuar Meus Estudos',
      helpText: 'Tem alguma dúvida ou sugestão? Estamos sempre à disposição para ajudar!',
      closing: 'Obrigado pela confiança!',
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
    renewal: {
      subject: '✅ Subscription renewed successfully!',
      greeting: 'Subscription Renewed!',
      body: 'your Educly subscription has been successfully renewed. Thank you for continuing to learn with us!',
      accessActive: 'Your premium access is still active!',
      continueEnjoying: 'Keep enjoying:',
      feature1: 'All available AI lessons',
      feature2: 'Unlimited chat with intelligent assistants',
      feature3: 'New courses and exclusive content',
      feature4: 'Completion certificates',
      cta: 'Continue My Studies',
      helpText: 'Have any questions or suggestions? We are always here to help!',
      closing: 'Thank you for your trust!',
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
    renewal: {
      subject: '✅ ¡Suscripción renovada con éxito!',
      greeting: '¡Suscripción Renovada!',
      body: 'tu suscripción de Educly ha sido renovada con éxito. ¡Gracias por seguir aprendiendo con nosotros!',
      accessActive: '¡Tu acceso premium sigue activo!',
      continueEnjoying: 'Sigue disfrutando:',
      feature1: 'Todas las lecciones de IA disponibles',
      feature2: 'Chat ilimitado con asistentes inteligentes',
      feature3: 'Nuevos cursos y contenido exclusivo',
      feature4: 'Certificados de finalización',
      cta: 'Continuar Mis Estudios',
      helpText: '¿Tienes alguna pregunta o sugerencia? ¡Siempre estamos aquí para ayudar!',
      closing: '¡Gracias por tu confianza!',
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
    renewal: {
      subject: '✅ Abonnement renouvelé avec succès !',
      greeting: 'Abonnement Renouvelé !',
      body: 'votre abonnement Educly a été renouvelé avec succès. Merci de continuer à apprendre avec nous !',
      accessActive: 'Votre accès premium est toujours actif !',
      continueEnjoying: 'Continuez à profiter de :',
      feature1: 'Toutes les leçons d\'IA disponibles',
      feature2: 'Chat illimité avec des assistants intelligents',
      feature3: 'Nouveaux cours et contenu exclusif',
      feature4: 'Certificats de fin de formation',
      cta: 'Continuer Mes Études',
      helpText: 'Avez-vous des questions ou des suggestions ? Nous sommes toujours là pour vous aider !',
      closing: 'Merci pour votre confiance !',
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
    renewal: {
      subject: '✅ Abonnement erfolgreich verlängert!',
      greeting: 'Abonnement Verlängert!',
      body: 'Ihr Educly-Abonnement wurde erfolgreich verlängert. Vielen Dank, dass Sie weiterhin mit uns lernen!',
      accessActive: 'Ihr Premium-Zugang ist weiterhin aktiv!',
      continueEnjoying: 'Genießen Sie weiterhin:',
      feature1: 'Alle verfügbaren KI-Lektionen',
      feature2: 'Unbegrenzter Chat mit intelligenten Assistenten',
      feature3: 'Neue Kurse und exklusive Inhalte',
      feature4: 'Abschlusszertifikate',
      cta: 'Meine Studien Fortsetzen',
      helpText: 'Haben Sie Fragen oder Vorschläge? Wir sind immer da, um zu helfen!',
      closing: 'Danke für Ihr Vertrauen!',
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
    renewal: {
      subject: '✅ Abbonamento rinnovato con successo!',
      greeting: 'Abbonamento Rinnovato!',
      body: 'il tuo abbonamento Educly è stato rinnovato con successo. Grazie per continuare a imparare con noi!',
      accessActive: 'Il tuo accesso premium è ancora attivo!',
      continueEnjoying: 'Continua a goderti:',
      feature1: 'Tutte le lezioni di IA disponibili',
      feature2: 'Chat illimitata con assistenti intelligenti',
      feature3: 'Nuovi corsi e contenuti esclusivi',
      feature4: 'Certificati di completamento',
      cta: 'Continua i Miei Studi',
      helpText: 'Hai domande o suggerimenti? Siamo sempre qui per aiutarti!',
      closing: 'Grazie per la tua fiducia!',
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
    renewal: {
      subject: '✅ Подписка успешно продлена!',
      greeting: 'Подписка Продлена!',
      body: 'ваша подписка Educly была успешно продлена. Спасибо, что продолжаете учиться с нами!',
      accessActive: 'Ваш премиум-доступ все еще активен!',
      continueEnjoying: 'Продолжайте наслаждаться:',
      feature1: 'Все доступные уроки ИИ',
      feature2: 'Неограниченный чат с интеллектуальными ассистентами',
      feature3: 'Новые курсы и эксклюзивный контент',
      feature4: 'Сертификаты о прохождении',
      cta: 'Продолжить Мое Обучение',
      helpText: 'Есть вопросы или предложения? Мы всегда готовы помочь!',
      closing: 'Спасибо за ваше доверие!',
      team: 'Команда Educly',
    },
    common: {
      rights: 'Все права защищены.',
      privacy: 'Политика Конфиденциальности',
      terms: 'Условия Использования',
    },
  },
};

// ==================== UTILITY FUNCTIONS ====================

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
function getEmailHtml(type: EmailType, userName: string, language: string): string {
  const t = (key: string) => getTranslation(language, type, key);
  const tc = (key: string) => getCommonTranslation(language, key);

  if (type === 'welcome') {
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#f6f9fc;margin:0;padding:40px 20px}.container{background-color:#fff;max-width:600px;margin:0 auto;padding:40px 30px;border-radius:8px}.logo{text-align:center;margin-bottom:32px}h1{color:#1a1a2e;font-size:28px;font-weight:700;text-align:center;margin:0 0 24px}p{color:#4a5568;font-size:16px;line-height:26px;margin:16px 0}.highlight-box{background-color:#f0f4ff;border-radius:8px;padding:20px;margin:24px 0;border-left:4px solid #6366f1}.success-box{background-color:#ecfdf5;border-radius:8px;padding:16px 20px;margin:24px 0;border-left:4px solid #10b981;text-align:center}.button-container{text-align:center;margin:32px 0}.button{background-color:#6366f1;border-radius:8px;color:#fff;font-size:16px;font-weight:600;text-decoration:none;padding:14px 32px;display:inline-block}.footer{border-top:1px solid #e2e8f0;margin-top:32px;padding-top:24px;text-align:center}.footer p{color:#a0aec0;font-size:12px}.footer a{color:#6366f1;text-decoration:underline}</style></head><body><div class="container"><div class="logo"><img src="https://educly.lovable.app/logo-educly.png" width="150" height="50" alt="Educly"/></div><h1>🎉 ${t('greeting')}, ${userName}!</h1><p>${t('body')}</p><div class="highlight-box"><p style="margin:0 0 12px"><strong>🚀 ${t('featuresTitle')}</strong></p><p style="margin:8px 0">✅ ${t('feature1')}</p><p style="margin:8px 0">✅ ${t('feature2')}</p><p style="margin:8px 0">✅ ${t('feature3')}</p><p style="margin:8px 0">✅ ${t('feature4')}</p></div><p>${t('readyText')}</p><div class="button-container"><a href="https://educly.lovable.app/auth" class="button">${t('cta')}</a></div><p>${t('helpText')}</p><p>${t('closing')} 🎓<br>${t('team')}</p><div class="footer"><p>© 2025 Educly. ${tc('rights')}<br><a href="https://educly.lovable.app/politica-privacidade">${tc('privacy')}</a> | <a href="https://educly.lovable.app/termos-uso">${tc('terms')}</a></p></div></div></body></html>`;
  }

  if (type === 'renewal') {
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#f6f9fc;margin:0;padding:40px 20px}.container{background-color:#fff;max-width:600px;margin:0 auto;padding:40px 30px;border-radius:8px}.logo{text-align:center;margin-bottom:32px}h1{color:#1a1a2e;font-size:28px;font-weight:700;text-align:center;margin:0 0 24px}p{color:#4a5568;font-size:16px;line-height:26px;margin:16px 0}.highlight-box{background-color:#f0f4ff;border-radius:8px;padding:20px;margin:24px 0;border-left:4px solid #6366f1}.success-box{background-color:#ecfdf5;border-radius:8px;padding:16px 20px;margin:24px 0;border-left:4px solid #10b981;text-align:center}.button-container{text-align:center;margin:32px 0}.button{background-color:#6366f1;border-radius:8px;color:#fff;font-size:16px;font-weight:600;text-decoration:none;padding:14px 32px;display:inline-block}.footer{border-top:1px solid #e2e8f0;margin-top:32px;padding-top:24px;text-align:center}.footer p{color:#a0aec0;font-size:12px}.footer a{color:#6366f1;text-decoration:underline}</style></head><body><div class="container"><div class="logo"><img src="https://educly.lovable.app/logo-educly.png" width="150" height="50" alt="Educly"/></div><h1>✅ ${t('greeting')}</h1><p>${userName}, ${t('body')}</p><div class="success-box"><p style="margin:0;color:#065f46">🎉 <strong>${t('accessActive')}</strong></p></div><div class="highlight-box"><p style="margin:0 0 12px"><strong>${t('continueEnjoying')}</strong></p><p style="margin:8px 0">✅ ${t('feature1')}</p><p style="margin:8px 0">✅ ${t('feature2')}</p><p style="margin:8px 0">✅ ${t('feature3')}</p><p style="margin:8px 0">✅ ${t('feature4')}</p></div><div class="button-container"><a href="https://educly.lovable.app/dashboard" class="button">${t('cta')}</a></div><p>${t('helpText')}</p><p>${t('closing')} 💜<br>${t('team')}</p><div class="footer"><p>© 2025 Educly. ${tc('rights')}<br><a href="https://educly.lovable.app/politica-privacidade">${tc('privacy')}</a> | <a href="https://educly.lovable.app/termos-uso">${tc('terms')}</a></p></div></div></body></html>`;
  }

  return '';
}

async function sendEmailViaSMTP(
  to: string,
  type: EmailType,
  userName: string,
  language: string
): Promise<boolean> {
  try {
    const smtpHost = Deno.env.get('SMTP_HOST');
    const smtpPort = Deno.env.get('SMTP_PORT');
    const smtpEmail = Deno.env.get('SMTP_EMAIL');
    const smtpPassword = Deno.env.get('SMTP_PASSWORD');

    if (!smtpHost || !smtpPort || !smtpEmail || !smtpPassword) {
      console.error('SMTP configuration missing');
      return false;
    }

    console.log(`Connecting to SMTP: ${smtpHost}:${smtpPort}`);

    const client = new SMTPClient({
      connection: {
        hostname: smtpHost,
        port: parseInt(smtpPort),
        tls: true,
        auth: {
          username: smtpEmail,
          password: smtpPassword,
        },
      },
    });

    const subject = getTranslation(language, type, 'subject');
    const html = getEmailHtml(type, userName, language);

    console.log(`Sending ${type} email to ${to} in language ${language}`);

    await client.send({
      from: `Educly <${smtpEmail}>`,
      to: to,
      subject: subject,
      content: "auto",
      html: html,
    });

    await client.close();

    console.log(`Email ${type} sent successfully to ${to}`);
    return true;
  } catch (error) {
    console.error(`Error sending email via SMTP:`, error);
    return false;
  }
}

// Verificar assinatura HMAC SHA-256 (Funnelfox)
async function verifyWebhookSignature(
  payload: string,
  secret: string,
  receivedSignature: string
): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
    const expectedSignature = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    console.log("Expected signature:", expectedSignature);
    console.log("Received signature:", receivedSignature);

    return expectedSignature === receivedSignature;
  } catch (error) {
    console.error("Error verifying signature:", error);
    return false;
  }
}

// Get language from product_id in product_definitions table
async function getLanguageFromProductId(
  supabaseClient: any,
  productId: string | null
): Promise<string> {
  if (!productId) return 'es'; // fallback Spanish
  
  try {
    const { data } = await supabaseClient
      .from('product_definitions')
      .select('language')
      .or(`product_id.eq.${productId},product_id.eq.product_${productId}`)
      .limit(1)
      .maybeSingle();
    
    return data?.language || 'es';
  } catch (error) {
    console.warn('⚠️ Error getting language from product:', error);
    return 'es';
  }
}

// Extrair product_id do payload Funnelfox (subscription ou oneoff/upsell)
function extractFunnelfoxProductId(payload: SubscriptionWebhookPayload): string | null {
  let features = payload.subscription?.price_point?.features;
  
  if (!features || features.length === 0) {
    features = payload.oneoff?.price_point?.features;
    if (features && features.length > 0) {
      console.log('📦 Product ID encontrado em oneoff (upsell)');
    }
  }
  
  if (features && features.length > 0 && features[0].ident) {
    let productId = features[0].ident;
    if (productId.startsWith('product_')) {
      productId = productId.replace('product_', '');
    }
    console.log(`📦 Extracted product ID: ${productId}`);
    return productId;
  }
  return null;
}

// Extrair product_id do payload Hotmart
function extractHotmartProductId(payload: HotmartWebhookPayload): string {
  const productId = payload.data?.product?.id;
  return productId ? String(productId) : '7018201';
}

// Calcular data de expiração baseado no tipo de evento
function calculateExpiresAt(subtype: string | null): string {
  const now = new Date();
  
  // Trial: 7 dias
  if (subtype && ['STARTING_TRIAL', 'SUBSCRIPTION_TRIAL_STARTED'].includes(subtype.toUpperCase())) {
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return expiresAt.toISOString();
  }
  
  // Subscription/Oneoff: 35 dias (mensal + 5 dias de tolerância)
  const expiresAt = new Date(now.getTime() + 35 * 24 * 60 * 60 * 1000);
  return expiresAt.toISOString();
}

// Gerenciar acesso a produto
async function manageProductAccess(
  supabaseClient: any,
  userId: string,
  productId: string,
  isGranting: boolean,
  subtype: string | null = null
): Promise<void> {
  try {
    const { data: productDef } = await supabaseClient
      .from('product_definitions')
      .select('product_type')
      .or(`product_id.eq.${productId},product_id.eq.product_${productId}`)
      .limit(1)
      .maybeSingle();

    const productType = productDef?.product_type || 'base';

    if (!productDef) {
      console.warn(`⚠️ Product ID desconhecido: ${productId} - usando fallback 'base'`);
    }

    console.log(`Managing product access: userId=${userId}, productId=${productId}, productType=${productType}, isGranting=${isGranting}`);

    if (isGranting) {
      const expiresAt = calculateExpiresAt(subtype);
      console.log(`📅 Setting expires_at: ${expiresAt}`);
      
      // First, get current expires_at to compare
      const { data: currentAccess } = await supabaseClient
        .from('user_product_access')
        .select('expires_at')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .maybeSingle();
      
      // Use the later expiration date if exists
      let finalExpiresAt = expiresAt;
      if (currentAccess?.expires_at) {
        const currentExpiry = new Date(currentAccess.expires_at);
        const newExpiry = new Date(expiresAt);
        if (currentExpiry > newExpiry) {
          finalExpiresAt = currentAccess.expires_at;
          console.log(`📅 Keeping existing later expires_at: ${finalExpiresAt}`);
        }
      }
      
      const { error } = await supabaseClient
        .from('user_product_access')
        .upsert({
          user_id: userId,
          product_id: productId,
          product_type: productType,
          is_active: true,
          granted_at: new Date().toISOString(),
          revoked_at: null,
          expires_at: finalExpiresAt
        }, {
          onConflict: 'user_id,product_id'
        });

      if (error) {
        console.error('Error granting product access:', error);
      } else {
        console.log(`Product access granted: ${productType} for user ${userId}, expires: ${finalExpiresAt}`);
      }
    } else {
      // Revoke: set expires_at to now (immediate expiration)
      const { error } = await supabaseClient
        .from('user_product_access')
        .update({
          is_active: false,
          revoked_at: new Date().toISOString(),
          expires_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('product_id', productId);

      if (error) {
        console.error('Error revoking product access:', error);
      } else {
        console.log(`Product access revoked: ${productType} for user ${userId}`);
      }
    }
  } catch (error) {
    console.error('Error in manageProductAccess:', error);
  }
}

// ==================== MAIN HANDLER ====================

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Handle Hotmart verification GET request
  if (req.method === 'GET') {
    const url = new URL(req.url);
    const hottok = url.searchParams.get('hottok');
    const expectedHottok = Deno.env.get('HOTMART_HOTTOK');
    
    if (hottok && expectedHottok && hottok === expectedHottok) {
      console.log('✅ Hotmart verification successful');
      return new Response('OK', { status: 200, headers: corsHeaders });
    }
    
    return new Response('Webhook endpoint active', { status: 200, headers: corsHeaders });
  }

  try {
    const rawBody = await req.text();
    console.log('📥 Webhook received');
    console.log('Raw body length:', rawBody.length);

    // Detect webhook source
    const ffSignature = req.headers.get('ff-webhook-signature');
    const hotmartToken = req.headers.get('x-hotmart-hottok');
    
    let source: WebhookSource = 'unknown';
    if (ffSignature) {
      source = 'funnelfox';
    } else if (hotmartToken) {
      source = 'hotmart';
    }

    console.log(`🔍 Detected source: ${source}`);

    // Validate webhook
    if (source === 'funnelfox') {
      const webhookSecret = Deno.env.get('FUNNELFOX_WEBHOOK_TOKEN');
      if (!webhookSecret) {
        console.error('❌ FUNNELFOX_WEBHOOK_TOKEN not configured');
        return new Response(JSON.stringify({ error: 'Webhook secret not configured' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const isValid = await verifyWebhookSignature(rawBody, webhookSecret, ffSignature!);
      if (!isValid) {
        console.error('❌ Invalid Funnelfox signature');
        return new Response(JSON.stringify({ error: 'Invalid signature' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      console.log('✅ Funnelfox signature verified');
    } else if (source === 'hotmart') {
      const expectedHottok = Deno.env.get('HOTMART_HOTTOK');
      if (!expectedHottok || hotmartToken !== expectedHottok) {
        console.error('❌ Invalid Hotmart token');
        return new Response(JSON.stringify({ error: 'Invalid token' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      console.log('✅ Hotmart token verified');
    } else {
      console.warn('⚠️ Unknown webhook source, proceeding anyway');
    }

    // Parse payload
    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch (e) {
      console.error('❌ Failed to parse JSON:', e);
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Extract data based on source
    let email: string | null = null;
    let subtype: string | null = null;
    let productId: string | null = null;
    let userName: string = 'Usuário';

    if (source === 'funnelfox' || source === 'unknown') {
      const ffPayload = payload as SubscriptionWebhookPayload;
      subtype = ffPayload.subtype || ffPayload.event_type || null;
      
      email = ffPayload.subscription?.customer?.email ||
              ffPayload.oneoff?.customer?.email ||
              ffPayload.customer?.email ||
              ffPayload.user?.email ||
              ffPayload.order?.initial_order_metadata?.email ||
              ffPayload.subscription?.initial_order_metadata?.email ||
              ffPayload.email ||
              null;

      productId = extractFunnelfoxProductId(ffPayload);
      
      const customer = ffPayload.subscription?.customer || ffPayload.oneoff?.customer || ffPayload.customer;
      if (customer && 'firstName' in customer) {
        userName = (customer as any).firstName || userName;
      }
    }

    if (source === 'hotmart') {
      const htPayload = payload as HotmartWebhookPayload;
      subtype = htPayload.event || null;
      
      email = htPayload.data?.buyer?.email ||
              htPayload.data?.subscriber?.email ||
              null;

      productId = extractHotmartProductId(htPayload);
      userName = htPayload.data?.buyer?.name?.split(' ')[0] ||
                 htPayload.data?.subscriber?.name?.split(' ')[0] ||
                 userName;
    }

    console.log(`📧 Email: ${email}`);
    console.log(`📦 Subtype: ${subtype}`);
    console.log(`🏷️ Product ID: ${productId}`);
    console.log(`👤 User name: ${userName}`);

    if (!email) {
      console.error('❌ No email found in payload');
      return new Response(JSON.stringify({ error: 'No email in payload' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Normalize email: lowercase, trim whitespace, remove trailing dots
    email = email.toLowerCase().trim().replace(/\.+$/, '');

    // Check if event should be ignored
    const isIgnored = (source === 'hotmart' && HOTMART_IGNORED_EVENTS.includes(subtype || '')) ||
                      (source !== 'hotmart' && IGNORED_SUBTYPES.includes(subtype || ''));
    
    if (isIgnored) {
      console.log(`⏭️ Ignoring event: ${subtype}`);
      return new Response(JSON.stringify({ message: 'Event ignored', subtype }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Determine if granting or revoking
    const isGranting = (source === 'hotmart' && HOTMART_GRANT_EVENTS.includes(subtype || '')) ||
                       (source !== 'hotmart' && GRANT_PREMIUM_SUBTYPES.includes(subtype || ''));
    
    const isRevoking = (source === 'hotmart' && HOTMART_REVOKE_EVENTS.includes(subtype || '')) ||
                       (source !== 'hotmart' && REVOKE_PREMIUM_SUBTYPES.includes(subtype || ''));

    console.log(`🔑 Action: ${isGranting ? 'GRANT' : isRevoking ? 'REVOKE' : 'UNKNOWN'}`);

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find user by email
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error listing users:', authError);
    }

    const user = authData?.users?.find(u => u.email?.toLowerCase() === email);

    if (!user) {
      console.log(`⚠️ User not found for email: ${email}`);
      
      // Calculate expires_at for pending events (7 days from now for trial window)
      const pendingExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      
      // Log the event for later processing with expiration
      await supabase.from('billing_event_logs').insert({
        email: email,
        event_type: subtype || 'UNKNOWN',
        status: 'USER_NOT_FOUND',
        payload: payload,
        processed: false,
        error_message: 'User not registered yet',
        expires_at: isGranting ? pendingExpiresAt : null
      });
      
      console.log(`📅 Pending event will expire at: ${pendingExpiresAt}`);

      // Send welcome email anyway (user will register later)
      if (isGranting) {
        const emailType = EMAIL_TYPE_MAP[subtype || ''] as EmailType || 'welcome';
        const detectedLanguage = await getLanguageFromProductId(supabase, productId);
        console.log(`🌍 Detected language from product: ${detectedLanguage}`);
        await sendEmailViaSMTP(email, emailType, userName, detectedLanguage);
      }

      return new Response(JSON.stringify({ 
        message: 'User not found, event logged for later processing',
        email,
        subtype,
        expires_at: pendingExpiresAt
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`✅ User found: ${user.id}`);

    // Update premium access
    if (isGranting) {
      const expiresAt = calculateExpiresAt(subtype);
      console.log(`📅 Calculating expires_at for premium access: ${expiresAt}`);
      
      // Get current expires_at to keep the later one
      const { data: currentPremium } = await supabase
        .from('user_premium_access')
        .select('expires_at')
        .eq('user_id', user.id)
        .maybeSingle();
      
      let finalExpiresAt = expiresAt;
      if (currentPremium?.expires_at) {
        const currentExpiry = new Date(currentPremium.expires_at);
        const newExpiry = new Date(expiresAt);
        if (currentExpiry > newExpiry) {
          finalExpiresAt = currentPremium.expires_at;
          console.log(`📅 Keeping existing later expires_at: ${finalExpiresAt}`);
        }
      }
      
      const { error: upsertError } = await supabase
        .from('user_premium_access')
        .upsert({
          user_id: user.id,
          is_premium: true,
          plan_type: 'premium',
          purchased_at: new Date().toISOString(),
          plan_updated_at: new Date().toISOString(),
          expires_at: finalExpiresAt
        }, {
          onConflict: 'user_id'
        });

      if (upsertError) {
        console.error('❌ Error upserting premium access:', upsertError);
      } else {
        console.log(`✅ Premium access granted, expires: ${finalExpiresAt}`);
      }

      // Grant product access
      if (productId) {
        await manageProductAccess(supabase, user.id, productId, true, subtype);
      }
    } else if (isRevoking) {
      // Set expires_at to now for immediate revocation
      const { error: updateError } = await supabase
        .from('user_premium_access')
        .update({
          is_premium: false,
          plan_updated_at: new Date().toISOString(),
          expires_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('❌ Error revoking premium access:', updateError);
      } else {
        console.log('✅ Premium access revoked with immediate expiration');
      }

      // Revoke product access
      if (productId) {
        await manageProductAccess(supabase, user.id, productId, false, subtype);
      }
    }

    // Log the event
    await supabase.from('billing_event_logs').insert({
      email: email,
      user_id: user.id,
      event_type: subtype || 'UNKNOWN',
      status: 'success',
      payload: payload,
      processed: true,
      processed_at: new Date().toISOString(),
      is_premium_set: isGranting
    });

    // Send email
    if (isGranting) {
      const emailType = EMAIL_TYPE_MAP[subtype || ''] as EmailType || 'welcome';
      
      // Get user's preferred language from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('preferred_language')
        .eq('id', user.id)
        .single();
      
      const language = profile?.preferred_language || 'pt';
      
      await sendEmailViaSMTP(email, emailType, userName, language);
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Webhook processed successfully',
      email,
      subtype,
      action: isGranting ? 'granted' : isRevoking ? 'revoked' : 'none'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Webhook error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
