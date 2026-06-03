// Atomically consumes one paid call credit for the given email.
// Replaces direct client RPC to consume_call_credit (which is now service-role only).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { email } = await req.json().catch(() => ({}));
    const normalized = typeof email === "string" ? email.toLowerCase().trim() : "";
    if (!normalized) {
      return new Response(JSON.stringify({ consumed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data, error } = await supabase.rpc("consume_call_credit", { _email: normalized });
    if (error) {
      console.error("[consume-call-credit] error", error);
      return new Response(JSON.stringify({ consumed: false }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ consumed: Boolean(data) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[consume-call-credit] error", e);
    return new Response(JSON.stringify({ consumed: false }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
