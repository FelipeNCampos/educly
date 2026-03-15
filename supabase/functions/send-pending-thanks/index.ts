import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Translations for the unified thank-you email
const TRANSLATIONS: Record<string, Record<string, string>> = {
  pt: {
    subject_single: '🎉 Bem-vindo à Educly!',
    subject_multi: '🎉 Bem-vindo à Educly! Seus pacotes estão prontos!',
    greeting: 'Bem-vindo à Educly',
    body_single: 'Parabéns! Você deu o primeiro passo para dominar a Inteligência Artificial e transformar sua carreira.',
    body_multi: 'Parabéns! Você garantiu acesso completo aos nossos melhores pacotes! Veja o que você desbloqueou:',
    featuresTitle: 'O que você vai aprender:',
    feature1: 'Como usar ChatGPT, Claude e outras IAs',
    feature2: 'Criar imagens incríveis com IA',
    feature3: 'Automatizar tarefas do dia a dia',
    feature4: 'Ganhar dinheiro com suas novas habilidades',
    readyText: 'Para criar sua conta acesse o link abaixo!',
    extra: 'Cadastre usando o seguinte e-mail:',
    cta: 'Acessar Minha Conta',
    helpText: 'Se precisar de ajuda, responda este email ou acesse nosso suporte.',
    closing: 'Bons estudos!',
    team: 'Equipe Educly',
    rights: 'Todos os direitos reservados.',
    privacy: 'Política de Privacidade',
    terms: 'Termos de Uso',
    product_base: '✅ Desafio de IA - 28 Dias',
    product_freelancer: '✅ Hub Freelancer - Carreira com IA',
    product_ai_hub: '✅ Hub de Assistentes IA',
    product_combo_freelancer_ai: '✅ Combo Freelancer + Assistentes IA',
    productsTitle: '📦 Seus pacotes:',
  },
  en: {
    subject_single: '🎉 Welcome to Educly!',
    subject_multi: '🎉 Welcome to Educly! Your packages are ready!',
    greeting: 'Welcome to Educly',
    body_single: 'Congratulations! You have taken the first step to master Artificial Intelligence and transform your career.',
    body_multi: 'Congratulations! You have secured full access to our best packages! See what you unlocked:',
    featuresTitle: 'What you will learn:',
    feature1: 'How to use ChatGPT, Claude and other AIs',
    feature2: 'Create amazing images with AI',
    feature3: 'Automate daily tasks',
    feature4: 'Earn money with your new skills',
    readyText: 'Your account is ready and you can start learning right now!',
    extra: 'Sign up using the following email:',
    cta: 'Access My Account',
    helpText: 'If you need help, reply to this email or contact our support.',
    closing: 'Happy learning!',
    team: 'Educly Team',
    rights: 'All rights reserved.',
    privacy: 'Privacy Policy',
    terms: 'Terms of Use',
    product_base: '✅ AI Challenge - 28 Days',
    product_freelancer: '✅ Freelancer Hub - AI Career',
    product_ai_hub: '✅ AI Assistants Hub',
    product_combo_freelancer_ai: '✅ Freelancer + AI Assistants Combo',
    productsTitle: '📦 Your packages:',
  },
  es: {
    subject_single: '🎉 ¡Bienvenido a Educly!',
    subject_multi: '🎉 ¡Bienvenido a Educly! ¡Tus paquetes están listos!',
    greeting: 'Bienvenido a Educly',
    body_single: '¡Felicitaciones! Has dado el primer paso para dominar la Inteligencia Artificial y transformar tu carrera.',
    body_multi: '¡Felicitaciones! Has asegurado acceso completo a nuestros mejores paquetes. Mira lo que desbloqueaste:',
    featuresTitle: 'Lo que aprenderás:',
    feature1: 'Cómo usar ChatGPT, Claude y otras IAs',
    feature2: 'Crear imágenes increíbles con IA',
    feature3: 'Automatizar tareas diarias',
    feature4: 'Ganar dinero con tus nuevas habilidades',
    readyText: '¡Tu cuenta está lista y ya puedes empezar a aprender ahora mismo!',
    extra: 'Regístrate usando el siguiente correo electrónico:',
    cta: 'Acceder a Mi Cuenta',
    helpText: 'Si necesitas ayuda, responde a este correo o contacta nuestro soporte.',
    closing: '¡Buen aprendizaje!',
    team: 'Equipo Educly',
    rights: 'Todos los derechos reservados.',
    privacy: 'Política de Privacidad',
    terms: 'Términos de Uso',
    product_base: '✅ Desafío de IA - 28 Días',
    product_freelancer: '✅ Hub Freelancer - Carrera con IA',
    product_ai_hub: '✅ Hub de Asistentes IA',
    product_combo_freelancer_ai: '✅ Combo Freelancer + Asistentes IA',
    productsTitle: '📦 Tus paquetes:',
  },
  fr: {
    subject_single: '🎉 Bienvenue chez Educly !',
    subject_multi: '🎉 Bienvenue chez Educly ! Vos forfaits sont prêts !',
    greeting: 'Bienvenue chez Educly',
    body_single: 'Félicitations ! Vous avez fait le premier pas pour maîtriser l\'Intelligence Artificielle et transformer votre carrière.',
    body_multi: 'Félicitations ! Vous avez sécurisé l\'accès complet à nos meilleurs forfaits ! Voyez ce que vous avez débloqué :',
    featuresTitle: 'Ce que vous allez apprendre :',
    feature1: 'Comment utiliser ChatGPT, Claude et d\'autres IAs',
    feature2: 'Créer des images incroyables avec l\'IA',
    feature3: 'Automatiser les tâches quotidiennes',
    feature4: 'Gagner de l\'argent avec vos nouvelles compétences',
    readyText: 'Votre compte est prêt et vous pouvez commencer à apprendre dès maintenant !',
    extra: 'Inscrivez-vous en utilisant l\'adresse e-mail suivante :',
    cta: 'Accéder à Mon Compte',
    helpText: 'Si vous avez besoin d\'aide, répondez à cet email ou contactez notre support.',
    closing: 'Bon apprentissage !',
    team: 'Équipe Educly',
    rights: 'Tous droits réservés.',
    privacy: 'Politique de Confidentialité',
    terms: 'Conditions d\'Utilisation',
    product_base: '✅ Défi IA - 28 Jours',
    product_freelancer: '✅ Hub Freelancer - Carrière IA',
    product_ai_hub: '✅ Hub Assistants IA',
    product_combo_freelancer_ai: '✅ Combo Freelancer + Assistants IA',
    productsTitle: '📦 Vos forfaits :',
  },
  de: {
    subject_single: '🎉 Willkommen bei Educly!',
    subject_multi: '🎉 Willkommen bei Educly! Ihre Pakete sind bereit!',
    greeting: 'Willkommen bei Educly',
    body_single: 'Herzlichen Glückwunsch! Sie haben den ersten Schritt gemacht, um Künstliche Intelligenz zu meistern und Ihre Karriere zu transformieren.',
    body_multi: 'Herzlichen Glückwunsch! Sie haben vollen Zugang zu unseren besten Paketen gesichert! Sehen Sie, was Sie freigeschaltet haben:',
    featuresTitle: 'Was Sie lernen werden:',
    feature1: 'Wie man ChatGPT, Claude und andere KIs verwendet',
    feature2: 'Erstaunliche Bilder mit KI erstellen',
    feature3: 'Tägliche Aufgaben automatisieren',
    feature4: 'Geld mit Ihren neuen Fähigkeiten verdienen',
    readyText: 'Ihr Konto ist bereit und Sie können jetzt sofort mit dem Lernen beginnen!',
    extra: 'Registrieren Sie sich mit der folgenden E-Mail-Adresse:',
    cta: 'Auf Mein Konto Zugreifen',
    helpText: 'Wenn Sie Hilfe benötigen, antworten Sie auf diese E-Mail oder kontaktieren Sie unseren Support.',
    closing: 'Viel Erfolg beim Lernen!',
    team: 'Educly Team',
    rights: 'Alle Rechte vorbehalten.',
    privacy: 'Datenschutzrichtlinie',
    terms: 'Nutzungsbedingungen',
    product_base: '✅ KI-Challenge - 28 Tage',
    product_freelancer: '✅ Freelancer Hub - KI-Karriere',
    product_ai_hub: '✅ KI-Assistenten Hub',
    product_combo_freelancer_ai: '✅ Combo Freelancer + KI-Assistenten',
    productsTitle: '📦 Ihre Pakete:',
  },
  it: {
    subject_single: '🎉 Benvenuto su Educly!',
    subject_multi: '🎉 Benvenuto su Educly! I tuoi pacchetti sono pronti!',
    greeting: 'Benvenuto su Educly',
    body_single: 'Congratulazioni! Hai fatto il primo passo per padroneggiare l\'Intelligenza Artificiale e trasformare la tua carriera.',
    body_multi: 'Congratulazioni! Hai ottenuto l\'accesso completo ai nostri migliori pacchetti! Guarda cosa hai sbloccato:',
    featuresTitle: 'Cosa imparerai:',
    feature1: 'Come usare ChatGPT, Claude e altre IA',
    feature2: 'Creare immagini incredibili con l\'IA',
    feature3: 'Automatizzare le attività quotidiane',
    feature4: 'Guadagnare con le tue nuove competenze',
    readyText: 'Il tuo account è pronto e puoi iniziare a imparare subito!',
    extra: 'Registrati utilizzando la seguente email:',
    cta: 'Accedi al Mio Account',
    helpText: 'Se hai bisogno di aiuto, rispondi a questa email o contatta il nostro supporto.',
    closing: 'Buon apprendimento!',
    team: 'Team Educly',
    rights: 'Tutti i diritti riservati.',
    privacy: 'Politica sulla Privacy',
    terms: 'Termini di Utilizzo',
    product_base: '✅ Sfida IA - 28 Giorni',
    product_freelancer: '✅ Hub Freelancer - Carriera IA',
    product_ai_hub: '✅ Hub Assistenti IA',
    product_combo_freelancer_ai: '✅ Combo Freelancer + Assistenti IA',
    productsTitle: '📦 I tuoi pacchetti:',
  },
  ru: {
    subject_single: '🎉 Добро пожаловать в Educly!',
    subject_multi: '🎉 Добро пожаловать в Educly! Ваши пакеты готовы!',
    greeting: 'Добро пожаловать в Educly',
    body_single: 'Поздравляем! Вы сделали первый шаг к освоению Искусственного Интеллекта и преобразованию своей карьеры.',
    body_multi: 'Поздравляем! Вы получили полный доступ к нашим лучшим пакетам! Посмотрите, что вы разблокировали:',
    featuresTitle: 'Что вы узнаете:',
    feature1: 'Как использовать ChatGPT, Claude и другие ИИ',
    feature2: 'Создавать потрясающие изображения с помощью ИИ',
    feature3: 'Автоматизировать повседневные задачи',
    feature4: 'Зарабатывать деньги с вашими новыми навыками',
    readyText: 'Ваш аккаунт готов, и вы можете начать обучение прямо сейчас!',
    extra: 'Зарегистрируйтесь, используя следующий адрес электронной почты:',
    cta: 'Войти в Мой Аккаунт',
    helpText: 'Если вам нужна помощь, ответьте на это письмо или свяжитесь с нашей поддержкой.',
    closing: 'Успешного обучения!',
    team: 'Команда Educly',
    rights: 'Все права защищены.',
    privacy: 'Политика Конфиденциальности',
    terms: 'Условия Использования',
    product_base: '✅ ИИ-Вызов - 28 Дней',
    product_freelancer: '✅ Хаб Фрилансера - Карьера с ИИ',
    product_ai_hub: '✅ Хаб ИИ-Ассистентов',
    product_combo_freelancer_ai: '✅ Комбо Фрилансер + ИИ-Ассистенты',
    productsTitle: '📦 Ваши пакеты:',
  },
};

function t(lang: string, key: string): string {
  const normalizedLang = lang.toLowerCase().split('-')[0];
  return TRANSLATIONS[normalizedLang]?.[key] || TRANSLATIONS['en']?.[key] || '';
}

function getProductLabel(productType: string, lang: string): string {
  const key = `product_${productType}`;
  const label = t(lang, key);
  return label || `✅ ${productType}`;
}

function getUnifiedEmailHtml(userName: string, userEmail: string, lang: string, products: { product_type: string }[]): string {
  const isMulti = products.length > 1;
  const uniqueTypes = [...new Set(products.map(p => p.product_type))];
  
  const bodyText = isMulti ? t(lang, 'body_multi') : t(lang, 'body_single');
  
  let productsSection = '';
  if (isMulti) {
    const productsList = uniqueTypes.map(pt => `<p style="margin:8px 0;font-size:16px">${getProductLabel(pt, lang)}</p>`).join('');
    productsSection = `<div class="highlight-box" style="background-color:#f0f4ff;border-radius:8px;padding:20px;margin:24px 0;border-left:4px solid #6366f1"><p style="margin:0 0 12px"><strong>🚀 ${t(lang, 'productsTitle')}</strong></p>${productsList}</div>`;
  }

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#f6f9fc;margin:0;padding:40px 20px}.container{background-color:#fff;max-width:600px;margin:0 auto;padding:40px 30px;border-radius:8px}.logo{text-align:center;margin-bottom:32px}h1{color:#1a1a2e;font-size:28px;font-weight:700;text-align:center;margin:0 0 24px}p{color:#4a5568;font-size:16px;line-height:26px;margin:16px 0}.highlight-box{background-color:#f0f4ff;border-radius:8px;padding:20px;margin:24px 0;border-left:4px solid #6366f1}.success-box{background-color:#ecfdf5;border-radius:8px;padding:16px 20px;margin:24px 0;border-left:4px solid #10b981;text-align:center}.button-container{text-align:center;margin:32px 0}.button{background-color:#1e40af;border-radius:8px;color:#fff;font-size:16px;font-weight:600;text-decoration:none;padding:14px 32px;display:inline-block}.footer{border-top:1px solid #e2e8f0;margin-top:32px;padding-top:24px;text-align:center}.footer p{color:#a0aec0;font-size:12px}.footer a{color:#6366f1;text-decoration:underline}</style></head><body><div class="container"><div class="logo"><img src="https://educly.lovable.app/logo-educly.png" width="150" height="50" alt="Educly"/></div><h1>🎉 ${t(lang,'greeting')}, ${userName}!</h1><p>${bodyText}</p>${productsSection}<div class="highlight-box"><p style="margin:0 0 12px"><strong>🚀 ${t(lang,'featuresTitle')}</strong></p><p style="margin:8px 0">✅ ${t(lang,'feature1')}</p><p style="margin:8px 0">✅ ${t(lang,'feature2')}</p><p style="margin:8px 0">✅ ${t(lang,'feature3')}</p><p style="margin:8px 0">✅ ${t(lang,'feature4')}</p></div><div class="success-box"><p style="margin:0;color:#059669;font-weight:600">✓ ${t(lang,'readyText')}</p><p style="margin:8px 0 0;color:#059669;font-weight:500">${t(lang,'extra')} ${userEmail}</p></div><div class="button-container"><a href="https://educly.lovable.app/auth" class="button">${t(lang,'cta')}</a></div><p style="text-align:center;color:#718096;font-size:14px">${t(lang,'helpText')}</p><p style="text-align:center;color:#718096;font-size:14px;margin-top:24px">${t(lang,'closing')}<br><strong>${t(lang,'team')}</strong></p><div class="footer"><p>© 2025 Educly. ${t(lang,'rights')}<br><a href="https://educly.lovable.app/politica-privacidade">${t(lang,'privacy')}</a> | <a href="https://educly.lovable.app/termos-uso">${t(lang,'terms')}</a></p></div></div></body></html>`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  try {
    // Fetch all pending emails where send_after has passed and not yet sent
    const { data: pendingGroups, error: fetchError } = await supabase
      .from('pending_thank_you_emails')
      .select('*')
      .eq('sent', false)
      .lte('send_after', new Date().toISOString())
      .order('created_at', { ascending: true });

    if (fetchError) {
      console.error('[send-pending-thanks] Fetch error:', fetchError);
      throw new Error(fetchError.message);
    }

    if (!pendingGroups || pendingGroups.length === 0) {
      console.log('[send-pending-thanks] No pending emails to process');
      return new Response(JSON.stringify({ processed: 0 }), { headers: corsHeaders });
    }

    // Group by email
    const emailGroups: Record<string, typeof pendingGroups> = {};
    for (const row of pendingGroups) {
      const email = row.email.toLowerCase().trim();
      if (!emailGroups[email]) emailGroups[email] = [];
      emailGroups[email].push(row);
    }

    let processed = 0;
    const results: { email: string; products: number; status: string }[] = [];

    for (const [email, rows] of Object.entries(emailGroups)) {
      try {
        // Check dedup: skip if welcome email already sent
        const { data: existingLog } = await supabase
          .from('email_logs')
          .select('id')
          .eq('recipient_email', email)
          .eq('email_type', 'welcome')
          .maybeSingle();

        if (existingLog) {
          console.log(`[send-pending-thanks] Already sent to ${email}, marking as sent`);
          const ids = rows.map(r => r.id);
          await supabase
            .from('pending_thank_you_emails')
            .update({ sent: true, sent_at: new Date().toISOString() })
            .in('id', ids);
          results.push({ email, products: rows.length, status: 'skipped_already_sent' });
          continue;
        }

        // Determine buyer name and language from the first row
        const buyerName = rows[0].buyer_name || 'Aluno';
        const lang = rows[0].language || 'es';
        const products = rows.map(r => ({ product_type: r.product_type || 'base' }));
        const isMulti = products.length > 1;

        const subject = isMulti ? t(lang, 'subject_multi') : t(lang, 'subject_single');
        const html = getUnifiedEmailHtml(buyerName, email, lang, products);

        // Send via SMTP
        const client = new SMTPClient({
          connection: {
            hostname: Deno.env.get('SMTP_HOST')!,
            port: parseInt(Deno.env.get('SMTP_PORT')!),
            tls: true,
            auth: { username: Deno.env.get('SMTP_EMAIL')!, password: Deno.env.get('SMTP_PASSWORD')! },
          },
        });

        try {
          await client.send({
            from: `Educly <${Deno.env.get('SMTP_EMAIL')}>`,
            to: email,
            subject,
            content: "auto",
            html,
          });
        } finally {
          await client.close();
        }

        // Log in email_logs
        await supabase.from('email_logs').insert({
          recipient_email: email,
          email_type: 'welcome',
          subject,
          status: 'sent',
          sent_at: new Date().toISOString(),
          metadata: { products_count: products.length, product_types: products.map(p => p.product_type) },
        });

        // Mark all pending rows as sent
        const ids = rows.map(r => r.id);
        await supabase
          .from('pending_thank_you_emails')
          .update({ sent: true, sent_at: new Date().toISOString() })
          .in('id', ids);

        processed++;
        results.push({ email, products: products.length, status: 'sent' });
        console.log(`[send-pending-thanks] Sent unified email to ${email} with ${products.length} product(s)`);

        // 5s delay between sends to respect Hostinger rate limits
        if (Object.keys(emailGroups).length > 1) {
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      } catch (emailError) {
        console.error(`[send-pending-thanks] Error sending to ${email}:`, emailError);
        results.push({ email, products: rows.length, status: 'error' });
      }
    }

    console.log(`[send-pending-thanks] Processed ${processed} emails`);
    return new Response(JSON.stringify({ processed, results }), { headers: corsHeaders });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[send-pending-thanks] Error:", error);
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500, headers: corsHeaders });
  }
});
