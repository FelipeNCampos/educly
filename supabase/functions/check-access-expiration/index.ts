import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExpirationResult {
  expired_premium_count: number;
  expired_product_count: number;
  expired_events_count: number;
  details: {
    expired_users: Array<{
      user_id: string;
      email: string;
      expired_at: string;
    }>;
    expired_events: Array<{
      event_id: string;
      email: string;
      event_type: string;
      created_at: string;
    }>;
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔄 Starting access expiration check...');
    
    // Optional: Verify authorization for manual triggers
    // For cron jobs, we skip this check
    const authHeader = req.headers.get('Authorization');
    const isCronJob = req.headers.get('x-cron-job') === 'true';
    
    if (!isCronJob && !authHeader) {
      // Allow unauthenticated access for cron, but log it
      console.log('⚠️ No authorization header, assuming cron job trigger');
    }

    // Initialize Supabase with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Call the database function to check and expire access
    const { data, error } = await supabase.rpc('check_and_expire_access');

    if (error) {
      console.error('❌ Error calling check_and_expire_access:', error);
      return new Response(JSON.stringify({ 
        success: false, 
        error: error.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const result = data?.[0] as ExpirationResult | undefined;
    
    if (!result) {
      console.log('✅ No expirations found');
      return new Response(JSON.stringify({ 
        success: true,
        message: 'No expirations found',
        expired_premium_count: 0,
        expired_product_count: 0,
        expired_events_count: 0
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`📊 Expiration check results:`);
    console.log(`   - Premium users expired: ${result.expired_premium_count}`);
    console.log(`   - Product accesses expired: ${result.expired_product_count}`);
    console.log(`   - Pending events expired: ${result.expired_events_count}`);

    // Log details for auditing
    if (result.details?.expired_users?.length > 0) {
      console.log('👥 Expired users:');
      result.details.expired_users.forEach((u: any) => {
        console.log(`   - ${u.email} (${u.user_id})`);
      });
    }

    if (result.details?.expired_events?.length > 0) {
      console.log('📋 Expired pending events:');
      result.details.expired_events.forEach((e: any) => {
        console.log(`   - ${e.email}: ${e.event_type} (created: ${e.created_at})`);
      });
    }

    // Log this execution for monitoring
    const totalExpired = result.expired_premium_count + 
                         result.expired_product_count + 
                         result.expired_events_count;

    if (totalExpired > 0) {
      console.log(`🔔 Total expirations processed: ${totalExpired}`);
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Access expiration check completed',
      expired_premium_count: result.expired_premium_count,
      expired_product_count: result.expired_product_count,
      expired_events_count: result.expired_events_count,
      details: result.details,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Error in check-access-expiration:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
