// Returns the entitlement row for a given email.
// Replaces direct client SELECT on the entitlements table (which is now locked down).
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
      return new Response(JSON.stringify({ entitlement: null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data, error } = await supabase
      .from("entitlements")
      .select("email, invite_plan")
      .eq("email", normalized)
      .maybeSingle();

    if (error) {
      console.error("[get-entitlement] db error", error);
      return new Response(JSON.stringify({ entitlement: null }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let entitlement = data ?? null;

    // Bypass account: full custom-plan access without going through Whop.
    if (normalized === "lala@gmail.com" && !(entitlement?.invite_plan)) {
      entitlement = {
        ...(entitlement ?? {}),
        email: normalized,
        invite_plan: "custom",
      } as typeof entitlement;
    }

    return new Response(JSON.stringify({ entitlement }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[get-entitlement] error", e);
    return new Response(JSON.stringify({ entitlement: null }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
