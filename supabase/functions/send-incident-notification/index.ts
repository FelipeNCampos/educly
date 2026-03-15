import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  try {
    // Find all users who registered since Friday (2026-02-13) and have premium access
    const { data: premiumUsers, error: queryError } = await supabase
      .from('user_premium_access')
      .select('user_id, is_premium, plan_updated_at')
      .eq('is_premium', true);

    if (queryError) throw queryError;

    if (!premiumUsers || premiumUsers.length === 0) {
      return new Response(JSON.stringify({ success: true, sent: 0, message: 'No users to notify' }), { headers: corsHeaders });
    }

    // Get user details from profiles + auth
    const userIds = premiumUsers.map(u => u.user_id);
    
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', userIds);

    if (profileError) throw profileError;

    // Get emails from auth.users via admin API
    const results: any[] = [];
    const errors: any[] = [];
    let sentCount = 0;

    const smtpHost = Deno.env.get('SMTP_HOST')!;
    const smtpPort = parseInt(Deno.env.get('SMTP_PORT') || '465');
    const smtpEmail = Deno.env.get('SMTP_EMAIL')!;
    const smtpPassword = Deno.env.get('SMTP_PASSWORD')!;

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

    // Get all auth users to match emails
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    if (authError) throw authError;

    const authUsers = authData?.users || [];
    
    // Filter: only users created since Friday 2026-02-13
    const cutoffDate = new Date('2026-02-13T00:00:00Z');
    const maxDate = new Date('2026-02-16T12:00:00Z'); // hoje 12:00 UTC
    
    const eligibleUsers = authUsers.filter(au => {
      const createdAt = new Date(au.created_at);
      const hasPremium = premiumUsers.some(pu => pu.user_id === au.id);
      return hasPremium && createdAt >= cutoffDate && createdAt <= maxDate;
    });

    console.log(`[incident-notification] Found ${eligibleUsers.length} eligible users to notify`);

    // Check which users already received this notification (dedup)
    const { data: alreadySent } = await supabase
      .from('email_logs')
      .select('recipient_email')
      .eq('email_type', 'incident_notification');

    const alreadySentEmails = new Set((alreadySent || []).map(e => e.recipient_email.toLowerCase()));

    for (const user of eligibleUsers) {
      if (alreadySentEmails.has(user.email!.toLowerCase())) {
        console.log(`[incident-notification] Already sent to ${user.email}, skipping`);
        continue;
      }

      const profile = profiles?.find(p => p.id === user.id);
      const userName = profile?.full_name || user.user_metadata?.full_name || 'Estudiante';

      const subject = '✅ Tu acceso a Educly ya está listo';
      
      const htmlContent = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #7c3aed; margin: 0;">Educly</h1>
  </div>
  
  <p style="font-size: 16px;">¡Hola <strong>${userName}</strong>! 👋</p>
  
  <p style="font-size: 15px; line-height: 1.6;">
    Te escribimos para informarte que experimentamos un <strong>problema técnico temporal</strong> 
    que afectó la liberación de acceso de algunos usuarios durante este fin de semana.
  </p>
  
  <p style="font-size: 15px; line-height: 1.6;">
    <strong>¡La buena noticia es que ya está todo solucionado!</strong> 🎉
  </p>
  
  <p style="font-size: 15px; line-height: 1.6;">
    Tu acceso premium está <strong>completamente liberado</strong> y puedes disfrutar de todo 
    el contenido disponible en la plataforma.
  </p>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="https://educly.lovable.app/auth" 
       style="display: inline-block; background-color: #7c3aed; color: white; padding: 14px 32px; 
              text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold;">
      Acceder a Mi Cuenta →
    </a>
  </div>
  
  <p style="font-size: 15px; line-height: 1.6;">
    Si tienes cualquier duda o problema, no dudes en contactarnos. 
    Estamos aquí para ayudarte. 💜
  </p>
  
  <p style="font-size: 14px; color: #666; margin-top: 30px;">
    Con cariño,<br>
    <strong>El equipo de Educly</strong>
  </p>
  
  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
  <p style="font-size: 12px; color: #999; text-align: center;">
    Este es un mensaje automático. Si no compraste ningún producto de Educly, puedes ignorar este correo.
  </p>
</body>
</html>`;

      const textContent = `¡Hola ${userName}!\n\nTe escribimos para informarte que experimentamos un problema técnico temporal que afectó la liberación de acceso de algunos usuarios durante este fin de semana.\n\n¡La buena noticia es que ya está todo solucionado!\n\nTu acceso premium está completamente liberado y puedes disfrutar de todo el contenido disponible en la plataforma.\n\nAccede a tu cuenta: https://educly.lovable.app/auth\n\nCon cariño,\nEl equipo de Educly`;

      try {
        await client.send({
          from: smtpEmail,
          to: user.email!,
          subject,
          content: textContent,
          html: htmlContent,
        });

        // Log the email
        await supabase.from('email_logs').insert({
          recipient_email: user.email!,
          user_id: user.id,
          email_type: 'incident_notification',
          subject,
          status: 'sent',
          sent_at: new Date().toISOString(),
        });

        sentCount++;
        results.push({ email: user.email, status: 'sent' });
        console.log(`[incident-notification] Sent to ${user.email} (${sentCount}/${eligibleUsers.length})`);

        // Rate limit: 5 second delay between sends
        await new Promise(resolve => setTimeout(resolve, 5000));
      } catch (sendErr: any) {
        console.error(`[incident-notification] Error sending to ${user.email}:`, sendErr);
        errors.push({ email: user.email, error: sendErr.message });

        await supabase.from('email_logs').insert({
          recipient_email: user.email!,
          user_id: user.id,
          email_type: 'incident_notification',
          subject,
          status: 'error',
          error_message: sendErr.message,
        });
      }
    }

    await client.close();

    return new Response(JSON.stringify({
      success: true,
      sent: sentCount,
      total_eligible: eligibleUsers.length,
      errors: errors.length > 0 ? errors : undefined,
      results,
    }), { headers: corsHeaders });
  } catch (error: any) {
    console.error('[incident-notification] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
});
