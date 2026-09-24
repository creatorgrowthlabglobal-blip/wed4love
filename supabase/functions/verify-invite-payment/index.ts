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


/**
 * Look up a valid Wed4Love invite membership for `email` on Whop and grant
 * the corresponding entitlement. This exists so the app can unlock the
 * builder even when the webhook is late, mis-fired, or was skipped for a
 * $0 promo checkout — the source of truth becomes Whop's API, not the
 * event delivery.
 */
interface RawMembership {
  id: string;
  plan: string;
  email: string | null;
  valid: boolean;
  status: string;
  created_at: number;
  metadata?: Record<string, unknown> | null;
}

async function fetchRecentMemberships(
  whopKey: string,
  maxPages = 5,
): Promise<RawMembership[]> {
  const all: RawMembership[] = [];
  for (let page = 1; page <= maxPages; page++) {
    const url = `https://api.whop.com/api/v2/memberships?per=100&page=${page}`;
    const r = await fetch(url, {
      headers: { Authorization: `Bearer ${whopKey}`, Accept: "application/json" },
    });
    if (!r.ok) {
      const text = await r.text();
      throw new Error(`whop api ${r.status}: ${text.slice(0, 200)}`);
    }
    const body = await r.json();
    const rows: RawMembership[] = body?.data ?? [];
    all.push(...rows);
    if (rows.length === 0 || rows.length < 100) break;
  }
  return all;
}

/**
 * Find the best invite plan for `email`. Matches in two ways:
 *  1) by Whop account email (m.email), and
 *  2) by metadata.order_id, cross-referenced against the user's
 *     pending_orders rows — the reliable path when the buyer's Whop
 *     account email differs from their Wed4Love signup email.
 */
async function findBestInvitePlan(
  whopKey: string,
  email: string,
  orderIds: string[],
): Promise<{ tier: number; plan: string; membershipId: string } | null> {
  const target = email.trim().toLowerCase();
  if (!target) return null;

  const memberships = await fetchRecentMemberships(whopKey);

  let best: { tier: number; plan: string; membershipId: string } | null = null;
  const orderSet = new Set(orderIds.map(o => o.toLowerCase()));

  for (const m of memberships) {
    if (!m.valid) continue;

    // Match by email...
    const byEmail = (m.email || "").trim().toLowerCase() === target;
    // ...or by metadata.order_id belonging to this user's pending orders.
    const metaOrderId = typeof m.metadata?.order_id === "string"
      ? String(m.metadata.order_id).toLowerCase()
      : null;
    const byOrder = metaOrderId && orderSet.has(metaOrderId);

    if (!byEmail && !byOrder) continue;

    const slug = INVITE_PLANS[m.plan];
    if (!slug) continue;
    const tier = INVITE_TIER[slug] ?? 0;
    if (!best || tier > best.tier) {
      best = { tier, plan: slug, membershipId: m.id };
    }
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

    // Collect this user's pending order ids — the reliable match key when
    // the buyer's Whop account email differs from their Wed4Love signup email.
    const { data: pendingRows } = await supabase
      .from("pending_orders").select("id").eq("app_email", email);
    const orderIds = (pendingRows ?? []).map((r: any) => String(r.id));

    // Ask Whop directly.
    const best = await findBestInvitePlan(whopKey, email, orderIds);
    if (!best) {
      return new Response(JSON.stringify({ ok: false, reason: "no_valid_membership" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Upsert entitlement. Only upgrade the invite_plan tier — never downgrade,
    // matching the webhook's behavior.
    const { data: cur } = await supabase
      .from("entitlements").select("*").eq("email", email).maybeSingle();
    const row: Record<string, unknown> = cur ?? { email };

    const existingSlug = (cur?.invite_plan as string | null) ?? null;
    const existingTier = existingSlug ? (INVITE_TIER[existingSlug] ?? 0) : 0;
    if (best.tier > existingTier) row.invite_plan = best.plan;

    const { error: upErr } = await supabase.from("entitlements").upsert({
      email: row.email,
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
