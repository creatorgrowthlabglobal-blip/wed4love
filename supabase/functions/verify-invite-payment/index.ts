import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Kept in sync with whop-webhook. If you add an invite plan, add it here too.
const INVITE_PLANS: Record<string, string> = {
  "plan_FsfUSAeOIoKZt": "starter",
  "plan_OizfizAnMNsVO": "premium",
  "plan_tLQmC1O2O9DmN": "custom",
};
const INVITE_TIER: Record<string, number> = { starter: 1, premium: 2, custom: 3 };

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

interface WhopMembership {
  id: string;
  plan: string;
  email: string | null;
  valid: boolean;
  status: string;
  created_at: number;
}

/**
 * Look up a valid Wed4Love invite membership for `email` on Whop and grant
 * the corresponding entitlement. This exists so the app can unlock the
 * builder even when the webhook is late, mis-fired, or was skipped for a
 * $0 promo checkout — the source of truth becomes Whop's API, not the
 * event delivery.
 */
async function findBestInvitePlan(
  whopKey: string,
  email: string,
): Promise<{ tier: number; plan: string; membershipId: string } | null> {
  const target = email.trim().toLowerCase();
  if (!target) return null;

  let best: { tier: number; plan: string; membershipId: string } | null = null;

  // Whop's ?user_email= filter is not reliable — paginate a small number of
  // recent memberships and filter client-side. 500 rows is plenty for any
  // realistic post-payment lookup window.
  for (let page = 1; page <= 5; page++) {
    const url = `https://api.whop.com/api/v2/memberships?per=100&page=${page}`;
    const r = await fetch(url, {
      headers: { Authorization: `Bearer ${whopKey}`, Accept: "application/json" },
    });
    if (!r.ok) {
      const text = await r.text();
      throw new Error(`whop api ${r.status}: ${text.slice(0, 200)}`);
    }
    const body = await r.json();
    const rows: WhopMembership[] = body?.data ?? [];
    if (rows.length === 0) break;

    for (const m of rows) {
      if (!m.valid) continue;
      if ((m.email || "").trim().toLowerCase() !== target) continue;
      const slug = INVITE_PLANS[m.plan];
      if (!slug) continue;
      const tier = INVITE_TIER[slug] ?? 0;
      if (!best || tier > best.tier) {
        best = { tier, plan: slug, membershipId: m.id };
      }
    }

    if (rows.length < 100) break;
  }

  return best;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const whopKey = Deno.env.get("WHOP_API_KEY");
    if (!whopKey) throw new Error("WHOP_API_KEY not configured");

    const { app_email } = await req.json();
    const email = String(app_email || "").trim().toLowerCase();
    if (!email) {
      return new Response(JSON.stringify({ error: "app_email required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fast path: if the DB already has an invite_plan, echo it back so the
    // caller doesn't need a follow-up round-trip.
    const { data: existing } = await supabase
      .from("entitlements").select("invite_plan").eq("email", email).maybeSingle();
    if (existing?.invite_plan) {
      return new Response(JSON.stringify({
        ok: true, source: "db", invite_plan: existing.invite_plan,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Ask Whop directly.
    const best = await findBestInvitePlan(whopKey, email);
    if (!best) {
      return new Response(JSON.stringify({ ok: false, reason: "no_valid_membership" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Upsert entitlement. Only upgrade the invite_plan tier — never downgrade,
    // matching the webhook's behavior.
    const { data: cur } = await supabase
      .from("entitlements").select("*").eq("email", email).maybeSingle();
    const row: Record<string, unknown> = cur ?? {
      email,
      has_letter_access: false,
      paid_calls: 0,
      used_calls: 0,
      letter_access_expires_at: null,
    };

    const existingSlug = (cur?.invite_plan as string | null) ?? null;
    const existingTier = existingSlug ? (INVITE_TIER[existingSlug] ?? 0) : 0;
    if (best.tier > existingTier) row.invite_plan = best.plan;

    const { error: upErr } = await supabase.from("entitlements").upsert({
      email: row.email,
      has_letter_access: row.has_letter_access ?? false,
      paid_calls: row.paid_calls ?? 0,
      used_calls: row.used_calls ?? 0,
      letter_access_expires_at: row.letter_access_expires_at ?? null,
      invite_plan: row.invite_plan ?? existingSlug ?? null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "email" });
    if (upErr) throw upErr;

    return new Response(JSON.stringify({
      ok: true,
      source: "whop_api",
      invite_plan: row.invite_plan ?? existingSlug,
      membership_id: best.membershipId,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("[verify-invite-payment] error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
