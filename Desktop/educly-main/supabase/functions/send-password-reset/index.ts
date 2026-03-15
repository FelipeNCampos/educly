import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  email: string;
  language?: string;
}

const TRANSLATIONS: Record<string, {
  subject: string;
  title: string;
  greeting: string;
  intro: string;
  warning: string;
  buttonText: string;
  ignore: string;
  footer: string;
  privacyPolicy: string;
  termsOfUse: string;
}> = {
  pt: {
    subject: "🔐 Redefinir sua senha - Educly",
    title: "Redefinir Senha",
    greeting: "Olá",
    intro: "Recebemos uma solicitação para redefinir a senha da sua conta Educly. Clique no botão abaixo para criar uma nova senha:",
    warning: "⚠️ Este link expira em 24 horas",
    buttonText: "Redefinir Minha Senha",
    ignore: "Se você não solicitou a redefinição de senha, ignore este email. Sua senha permanecerá inalterada.",
    footer: "© 2025 Educly. Todos os direitos reservados.",
    privacyPolicy: "Política de Privacidade",
    termsOfUse: "Termos de Uso",
  },
  en: {
    subject: "🔐 Reset Your Password - Educly",
    title: "Reset Password",
    greeting: "Hello",
    intro: "We received a request to reset your Educly account password. Click the button below to create a new password:",
    warning: "⚠️ This link expires in 24 hours",
    buttonText: "Reset My Password",
    ignore: "If you didn't request a password reset, please ignore this email. Your password will remain unchanged.",
    footer: "© 2025 Educly. All rights reserved.",
    privacyPolicy: "Privacy Policy",
    termsOfUse: "Terms of Use",
  },
  es: {
    subject: "🔐 Restablecer tu contraseña - Educly",
    title: "Restablecer Contraseña",
    greeting: "Hola",
    intro: "Recibimos una solicitud para restablecer la contraseña de tu cuenta Educly. Haz clic en el botón de abajo para crear una nueva contraseña:",
    warning: "⚠️ Este enlace expira en 24 horas",
    buttonText: "Restablecer Mi Contraseña",
    ignore: "Si no solicitaste el restablecimiento de contraseña, ignora este correo. Tu contraseña permanecerá sin cambios.",
    footer: "© 2025 Educly. Todos los derechos reservados.",
    privacyPolicy: "Política de Privacidad",
    termsOfUse: "Términos de Uso",
  },
  fr: {
    subject: "🔐 Réinitialiser votre mot de passe - Educly",
    title: "Réinitialiser le Mot de Passe",
    greeting: "Bonjour",
    intro: "Nous avons reçu une demande de réinitialisation du mot de passe de votre compte Educly. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe:",
    warning: "⚠️ Ce lien expire dans 24 heures",
    buttonText: "Réinitialiser Mon Mot de Passe",
    ignore: "Si vous n'avez pas demandé de réinitialisation de mot de passe, veuillez ignorer cet email. Votre mot de passe restera inchangé.",
    footer: "© 2025 Educly. Tous droits réservés.",
    privacyPolicy: "Politique de Confidentialité",
    termsOfUse: "Conditions d'Utilisation",
  },
  de: {
    subject: "🔐 Passwort zurücksetzen - Educly",
    title: "Passwort Zurücksetzen",
    greeting: "Hallo",
    intro: "Wir haben eine Anfrage erhalten, das Passwort für Ihr Educly-Konto zurückzusetzen. Klicken Sie auf die Schaltfläche unten, um ein neues Passwort zu erstellen:",
    warning: "⚠️ Dieser Link läuft in 24 Stunden ab",
    buttonText: "Mein Passwort Zurücksetzen",
    ignore: "Wenn Sie keine Passwortzurücksetzung angefordert haben, ignorieren Sie diese E-Mail. Ihr Passwort bleibt unverändert.",
    footer: "© 2025 Educly. Alle Rechte vorbehalten.",
    privacyPolicy: "Datenschutzrichtlinie",
    termsOfUse: "Nutzungsbedingungen",
  },
  it: {
    subject: "🔐 Reimposta la tua password - Educly",
    title: "Reimposta Password",
    greeting: "Ciao",
    intro: "Abbiamo ricevuto una richiesta per reimpostare la password del tuo account Educly. Clicca sul pulsante qui sotto per creare una nuova password:",
    warning: "⚠️ Questo link scade tra 24 ore",
    buttonText: "Reimposta La Mia Password",
    ignore: "Se non hai richiesto la reimpostazione della password, ignora questa email. La tua password rimarrà invariata.",
    footer: "© 2025 Educly. Tutti i diritti riservati.",
    privacyPolicy: "Informativa sulla Privacy",
    termsOfUse: "Termini di Utilizzo",
  },
  ru: {
    subject: "🔐 Сбросить пароль - Educly",
    title: "Сброс Пароля",
    greeting: "Здравствуйте",
    intro: "Мы получили запрос на сброс пароля вашей учетной записи Educly. Нажмите кнопку ниже, чтобы создать новый пароль:",
    warning: "⚠️ Эта ссылка действительна 24 часа",
    buttonText: "Сбросить Мой Пароль",
    ignore: "Если вы не запрашивали сброс пароля, проигнорируйте это письмо. Ваш пароль останется без изменений.",
    footer: "© 2025 Educly. Все права защищены.",
    privacyPolicy: "Политика Конфиденциальности",
    termsOfUse: "Условия Использования",
  },
};

function getTranslation(lang: string): typeof TRANSLATIONS["en"] {
  const normalizedLang = lang?.substring(0, 2).toLowerCase() || "en";
  return TRANSLATIONS[normalizedLang] || TRANSLATIONS["en"];
}

function getEmailTemplate(resetLink: string, language: string, userName?: string): string {
  const t = getTranslation(language);
  const displayName = userName || "";
  const greetingText = displayName ? `${t.greeting}, ${displayName}!` : `${t.greeting}!`;

  return `
<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t.title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f6f9fc;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f6f9fc;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header with Logo -->
          <tr>
            <td style="padding: 32px 40px 24px; text-align: center; border-bottom: 1px solid #e5e7eb;">
              <img src="https://educly.lovable.app/logo-educly.png" alt="Educly" style="height: 48px; width: auto;">
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <!-- Title -->
              <h1 style="margin: 0 0 24px; font-size: 24px; font-weight: 700; color: #0D2837; text-align: center;">
                🔐 ${t.title}
              </h1>

              <!-- Greeting -->
              <p style="margin: 0 0 16px; font-size: 16px; color: #1a1a2e; font-weight: 600;">
                ${greetingText}
              </p>

              <!-- Intro Text -->
              <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #4a5568;">
                ${t.intro}
              </p>

              <!-- Warning Box -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 24px;">
                <tr>
                  <td style="background-color: #FFF7ED; border: 1px solid #F7931E; border-radius: 8px; padding: 12px 16px; text-align: center;">
                    <p style="margin: 0; font-size: 14px; color: #D96A2B; font-weight: 500;">
                      ${t.warning}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 24px;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${resetLink}" target="_blank" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #D96A2B 0%, #F7931E 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 12px rgba(217, 106, 43, 0.3);">
                      ${t.buttonText}
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Ignore Notice -->
              <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #6b7280; text-align: center;">
                ${t.ignore}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; border-radius: 0 0 12px 12px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center;">
                    <p style="margin: 0 0 12px; font-size: 13px; color: #9ca3af;">
                      ${t.footer}
                    </p>
                    <p style="margin: 0; font-size: 13px;">
                      <a href="https://educly.lovable.app/privacy-policy" style="color: #D96A2B; text-decoration: none;">${t.privacyPolicy}</a>
                      <span style="color: #d1d5db; margin: 0 8px;">|</span>
                      <a href="https://educly.lovable.app/terms-of-use" style="color: #D96A2B; text-decoration: none;">${t.termsOfUse}</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

async function sendEmailViaSMTP(to: string, subject: string, html: string): Promise<void> {
  const { SMTPClient } = await import("https://deno.land/x/denomailer@1.6.0/mod.ts");
  
  const smtpHost = Deno.env.get("SMTP_HOST");
  const smtpPort = parseInt(Deno.env.get("SMTP_PORT") || "465");
  const smtpEmail = Deno.env.get("SMTP_EMAIL");
  const smtpPassword = Deno.env.get("SMTP_PASSWORD");

  if (!smtpHost || !smtpEmail || !smtpPassword) {
    throw new Error("SMTP credentials not configured");
  }

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
      html: html,
    });
    console.log(`Password reset email sent to ${to}`);
  } finally {
    await client.close();
  }
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: PasswordResetRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing password reset request for: ${email}`);

    // Create Supabase admin client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Find user by email
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.error("Error listing users:", userError);
      // Don't reveal user existence - always return success
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const user = userData.users.find(u => u.email?.toLowerCase() === email.toLowerCase());

    if (!user) {
      console.log(`No user found with email: ${email}`);
      // Don't reveal user existence - always return success
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user's preferred language from profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("preferred_language, full_name")
      .eq("id", user.id)
      .single();

    const language = profile?.preferred_language || "en";
    const userName = profile?.full_name || user.user_metadata?.full_name || "";

    // Generate magic link (does NOT trigger automatic email like "recovery" does)
    const redirectUrl = "https://educly.lovable.app/update-password";
    
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email: email,
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (linkError) {
      console.error("Error generating reset link:", linkError);
      // Don't reveal error - always return success
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // The generated link contains the token
    const resetLink = linkData.properties?.action_link || "";
    
    if (!resetLink) {
      console.error("No action link generated");
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Generated reset link for user: ${user.id}`);

    // Get translation for subject
    const t = getTranslation(language);

    // Generate email HTML with new design
    const emailHtml = getEmailTemplate(resetLink, language, userName);

    // Send email via SMTP
    await sendEmailViaSMTP(email, t.subject, emailHtml);

    console.log(`Password reset email sent successfully to: ${email}`);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in send-password-reset:", error);
    
    // Don't reveal internal errors - always return success for security
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

Deno.serve(handler);
