import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// 1x1 transparent GIF pixel
const TRANSPARENT_GIF = new Uint8Array([
  0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00,
  0x01, 0x00, 0x80, 0x00, 0x00, 0xff, 0xff, 0xff,
  0x00, 0x00, 0x00, 0x21, 0xf9, 0x04, 0x01, 0x00,
  0x00, 0x00, 0x00, 0x2c, 0x00, 0x00, 0x00, 0x00,
  0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x44,
  0x01, 0x00, 0x3b
]);

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const emailLogId = url.searchParams.get("id");

    if (emailLogId) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      // Only update if not already opened
      await supabase
        .from("email_logs")
        .update({
          opened_at: new Date().toISOString(),
          status: "opened",
        })
        .eq("id", emailLogId)
        .is("opened_at", null);

      console.log(`[track-email-open] Tracked open for email_log: ${emailLogId}`);
    }

    return new Response(TRANSPARENT_GIF, {
      headers: {
        "Content-Type": "image/gif",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (error) {
    console.error("[track-email-open] Error:", error);
    // Always return the pixel even on error
    return new Response(TRANSPARENT_GIF, {
      headers: { "Content-Type": "image/gif" },
    });
  }
});
