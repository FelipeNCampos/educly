import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, ff-webhook-signature, x-hotmart-hottok',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  try {
    const payload = await req.json();
    const email = (
      payload.data?.buyer?.email ||
      payload.data?.subscriber?.email ||
      payload.customer?.email ||
      payload.email
    )?.toLowerCase().trim().replace(/\.+$/, '');

    if (!email) {
      return new Response(JSON.stringify({ error: 'No email found in payload' }), { status: 400, headers: corsHeaders });
    }

    const buyerName = (
      payload.data?.buyer?.name ||
      payload.data?.subscriber?.name ||
      payload.customer?.name ||
      payload.name ||
      'Aluno'
    );

    const productId = (
      payload.data?.product?.id ||
      payload.oneoff?.product_id ||
      payload.product_id ||
      ''
    )?.toString();

    // Look up language and product_type from product_definitions
    let language = 'es';
    let productType = 'base';
    if (productId) {
      const { data: productDef } = await supabase
        .from('product_definitions')
        .select('language, product_type')
        .eq('product_id', productId)
        .maybeSingle();

      if (productDef?.language) language = productDef.language;
      if (productDef?.product_type) productType = productDef.product_type;
    }

    console.log(`[primer-webhook] Queuing: email=${email}, name=${buyerName}, product=${productId}, lang=${language}`);

    // Extract event_type from payload
    const eventType = (
      payload.data?.event_type ||
      payload.event_type ||
      payload.event ||
      'PURCHASE_COMPLETE'
    )?.toString().toUpperCase();

    // ALWAYS insert billing_event_logs FIRST (before email dedup)
    const { error: billingError } = await supabase
      .from('billing_event_logs')
      .insert({
        email,
        event_type: eventType,
        payload,
        status: 'pending',
        processed: false,
      });

    if (billingError) {
      console.error(`[primer-webhook] Error inserting billing event:`, billingError);
    } else {
      console.log(`[primer-webhook] Billing event logged for ${email}, type=${eventType}`);
    }

    // NEW: Try to find existing user and grant access in real-time
    const GRANT_EVENT_TYPES = [
      'SETTLED', 'STARTING_TRIAL', 'SUBSCRIPTION_SETTLED',
      'SUBSCRIPTION_TRIAL_STARTED', 'GRANTED',
      'CONVERTION', 'RENEWING', 'RESUMING',
      'RECOVERING', 'RECOVERING_AUTORENEW',
      'PURCHASE_COMPLETE', 'PURCHASE_APPROVED',
      'PURCHASE_PROTEST', 'PURCHASE_DELAYED',
    ];

    if (GRANT_EVENT_TYPES.includes(eventType)) {
      try {
        // Search for user by email using paginated admin API
        let foundUserId: string | null = null;
        let page = 1;
        const perPage = 1000;

        while (!foundUserId) {
          const { data: listData, error: listError } = await supabase.auth.admin.listUsers({
            page,
            perPage,
          });

          if (listError || !listData?.users?.length) break;

          const match = listData.users.find(
            (u: { email?: string }) => u.email?.toLowerCase().trim().replace(/\.+$/, '') === email
          );

          if (match) {
            foundUserId = match.id;
            break;
          }

          if (listData.users.length < perPage) break;
          page++;
          if (page > 10) break; // safety limit: 10k users max
        }

        if (foundUserId) {
          console.log(`[primer-webhook] User found: ${foundUserId}, calling process_pending_billing_events`);
          const { error: rpcError } = await supabase.rpc('process_pending_billing_events', {
            p_user_id: foundUserId,
            p_email: email,
          });

          if (rpcError) {
            console.error(`[primer-webhook] RPC error:`, rpcError);
          } else {
            console.log(`[primer-webhook] Access granted in real-time for ${email}`);
          }
        } else {
          console.log(`[primer-webhook] User not found for ${email}, will reconcile on signup`);
        }
      } catch (lookupErr) {
        console.error(`[primer-webhook] User lookup error:`, lookupErr);
      }
    }

    // Check if welcome email was already sent (dedup against email_logs)
    const { data: existingLog } = await supabase
      .from('email_logs')
      .select('id')
      .eq('recipient_email', email)
      .eq('email_type', 'welcome')
      .maybeSingle();

    if (existingLog) {
      console.log(`[primer-webhook] Welcome email already sent to ${email}, skipping queue`);
      return new Response(JSON.stringify({ success: true, skipped: true, billing_logged: !billingError }), { headers: corsHeaders });
    }

    // Insert into pending queue (send_after = now + 5 min, fixed timer)
    const { error: insertError } = await supabase
      .from('pending_thank_you_emails')
      .insert({
        email,
        buyer_name: buyerName,
        product_id: productId || null,
        product_type: productType,
        language,
      });

    if (insertError) {
      console.error(`[primer-webhook] Error queuing email:`, insertError);
      throw new Error(insertError.message);
    }

    console.log(`[primer-webhook] Queued thank-you email for ${email}, will send after 5 min`);

    return new Response(JSON.stringify({ success: true, queued: true }), { headers: corsHeaders });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[primer-webhook] Error:", error);
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500, headers: corsHeaders });
  }
});
