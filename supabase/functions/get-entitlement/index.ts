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
      .select("email, has_letter_access, paid_calls, used_calls, letter_access_expires_at")
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

    // Trial account: 3 free letters, no call credits, no payment required.
    // If a database entitlement already exists (e.g. bonus access granted), respect it.
    if (normalized === "trial@gmail.com" && !(entitlement && entitlement.has_letter_access)) {
      const { count } = await supabase
        .from("letters")
        .select("id", { count: "exact", head: true })
        .eq("data->>email", "trial@gmail.com");
      const used = count ?? 0;
      const allowed = used < 3;
      entitlement = {
        email: normalized,
        has_letter_access: allowed,
        paid_calls: 0,
        used_calls: 0,
        letter_access_expires_at: allowed ? new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString() : null,
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
