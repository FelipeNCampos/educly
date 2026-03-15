import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate admin via JWT
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: isAdmin } = await supabaseAuth.rpc("is_admin");
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden: admin only" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse request
    const { email, products, duration_days, send_welcome_email, language } =
      await req.json();

    if (!email || !products || !Array.isArray(products) || products.length === 0) {
      return new Response(
        JSON.stringify({ error: "email and products are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role for writes
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Find user by email
    const { data: usersData, error: userError } = await supabase.auth.admin.listUsers();
    if (userError) throw userError;

    const user = usersData.users.find(
      (u: any) => u.email?.toLowerCase() === email.toLowerCase()
    );

    if (!user) {
      return new Response(
        JSON.stringify({ error: "User not found with this email" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = user.id;
    const now = new Date();
    const expiresAt = duration_days
      ? new Date(now.getTime() + duration_days * 24 * 60 * 60 * 1000).toISOString()
      : null;

    const grantedProducts: string[] = [];
    const timestamp = now.getTime();

    // Grant each product
    for (const productType of products) {
      const productId = `manual_admin_grant_${productType}_${timestamp}`;

      const { error: productError } = await supabase
        .from("user_product_access")
        .upsert(
          {
            user_id: userId,
            product_id: productId,
            product_type: productType,
            is_active: true,
            granted_at: now.toISOString(),
            expires_at: expiresAt,
            revoked_at: null,
          },
          { onConflict: "user_id,product_id" }
        );

      if (productError) {
        console.error(`Error granting ${productType}:`, productError);
        continue;
      }
      grantedProducts.push(productType);
    }

    // Update premium access
    const { error: premiumError } = await supabase
      .from("user_premium_access")
      .upsert(
        {
          user_id: userId,
          is_premium: true,
          plan_type: "premium",
          purchased_at: now.toISOString(),
          plan_updated_at: now.toISOString(),
          expires_at: expiresAt,
        },
        { onConflict: "user_id" }
      );

    if (premiumError) {
      console.error("Error updating premium:", premiumError);
    }

    // Schedule welcome email if requested
    if (send_welcome_email && grantedProducts.length > 0) {
      const buyerName = user.user_metadata?.full_name || "Aluno";
      const emailLang = language || "es";

      for (const pt of grantedProducts) {
        await supabase.from("pending_thank_you_emails").insert({
          email: email.toLowerCase(),
          buyer_name: buyerName,
          product_type: pt,
          product_id: `manual_admin_grant_${pt}_${timestamp}`,
          language: emailLang,
          send_after: new Date(now.getTime() + 1 * 60 * 1000).toISOString(),
          sent: false,
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        user_id: userId,
        granted_products: grantedProducts,
        expires_at: expiresAt,
        welcome_email_scheduled: send_welcome_email && grantedProducts.length > 0,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in admin-grant-access:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
