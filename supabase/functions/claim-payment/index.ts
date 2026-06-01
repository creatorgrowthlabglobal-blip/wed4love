import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LETTER_PLAN = "plan_5Krc5hUT3FZGa";
const EXTRA_CALL_PLAN = "plan_cVyzHy6DwWOtK";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

/**
 * Claim a recent Whop payment for the signed-in app user, even when they
 * paid with a different email on Whop's checkout. We find the most recent
 * unclaimed payment event since `since_ms` and assign its entitlement to
 * `app_email`.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { app_email, since_ms, product } = await req.json();
    const email = String(app_email || "").trim().toLowerCase();
    if (!email || !since_ms) {
      return new Response(JSON.stringify({ error: "missing app_email or since_ms" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Look up entitlement already granted directly to this email by webhook.
    const { data: direct } = await supabase
      .from("entitlements").select("*").eq("email", email).maybeSingle();
    const hasDirect =
      product === "letter"
        ? !!direct?.has_letter_access
        : product === "call"
          ? (direct?.paid_calls ?? 0) > (direct?.used_calls ?? 0)
          : false;
    if (hasDirect) {
      return new Response(JSON.stringify({ ok: true, source: "direct" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sinceIso = new Date(Number(since_ms) - 60_000).toISOString(); // small skew buffer

    // Most recent unclaimed paid event since `since_ms`.
    const { data: events } = await supabase
      .from("whop_events")
      .select("event_id, payload, created_at")
      .gte("created_at", sinceIso)
      .order("created_at", { ascending: false })
      .limit(20);

    if (!events || events.length === 0) {
      return new Response(JSON.stringify({ ok: false, reason: "no_recent_events" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Filter unclaimed
    const ids = events.map((e) => e.event_id);
    const { data: alreadyClaimed } = await supabase
      .from("claimed_whop_events").select("event_id").in("event_id", ids);
    const claimedSet = new Set((alreadyClaimed || []).map((c) => c.event_id));

    const candidate = events.find((e) => {
      if (claimedSet.has(e.event_id)) return false;
      const planId = e.payload?.data?.plan?.id;
      if (product === "letter") return planId === LETTER_PLAN;
      if (product === "call") return planId === EXTRA_CALL_PLAN || planId === LETTER_PLAN;
      return true;
    });

    if (!candidate) {
      return new Response(JSON.stringify({ ok: false, reason: "no_unclaimed_match" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const planId = candidate.payload?.data?.plan?.id;
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

    const { data: cur } = await supabase
      .from("entitlements").select("*").eq("email", email).maybeSingle();
    const row: any = cur || {
      email,
      has_letter_access: false,
      paid_calls: 0,
      used_calls: 0,
      letter_access_expires_at: null,
    };

    if (planId === LETTER_PLAN) {
      row.has_letter_access = true;
      row.paid_calls = (row.paid_calls || 0) + 2;
      const current = row.letter_access_expires_at ? new Date(row.letter_access_expires_at).getTime() : 0;
      const base = Math.max(current, Date.now());
      row.letter_access_expires_at = new Date(base + THIRTY_DAYS_MS).toISOString();
    } else if (planId === EXTRA_CALL_PLAN) {
      row.paid_calls = (row.paid_calls || 0) + 1;
    }

    const { error: upErr } = await supabase.from("entitlements").upsert({
      email: row.email,
      has_letter_access: row.has_letter_access,
      paid_calls: row.paid_calls,
      used_calls: row.used_calls,
      letter_access_expires_at: row.letter_access_expires_at,
      updated_at: new Date().toISOString(),
    }, { onConflict: "email" });
    if (upErr) throw upErr;

    await supabase.from("claimed_whop_events").insert({
      event_id: candidate.event_id,
      app_email: email,
    });

    return new Response(JSON.stringify({ ok: true, source: "claimed", event_id: candidate.event_id, planId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[claim-payment] error", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
