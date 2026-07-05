import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-whop-signature",
};

function notifyTelegram(event: string, data: Record<string, unknown> = {}) {
  const token = Deno.env.get('TELEGRAM_BOT_TOKEN');
  const chatId = Deno.env.get('TELEGRAM_CHAT_ID');
  if (!token || !chatId) return;
  const lines = [`🔔 <b>${event}</b>`];
  for (const [k, v] of Object.entries(data)) {
    if (v == null || v === '') continue;
    lines.push(`<b>${k}:</b> ${String(v).slice(0, 400)}`);
  }
  fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: lines.join('\n'), parse_mode: 'HTML', disable_web_page_preview: true }),
  }).catch(() => {});
}


const LETTER_PLAN = "plan_5Krc5hUT3FZGa";
const EXTRA_CALL_PLAN = "plan_cVyzHy6DwWOtK";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

function pick(obj: any, ...paths: string[][]): any {
  for (const p of paths) {
    let cur = obj;
    let ok = true;
    for (const k of p) {
      if (cur && typeof cur === "object" && k in cur) cur = cur[k];
      else { ok = false; break; }
    }
    if (ok && cur) return cur;
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json();
    console.log("[whop-webhook] event:", JSON.stringify(body).slice(0, 500));

    const eventId: string =
      body.id || body.event_id || body.data?.id || crypto.randomUUID();
    const data = body.data || body;

    const action: string = body.action || body.event || body.type || "";
    // Only credit on successful payment / valid membership events
    const isSuccess =
      /success|valid|paid|completed/i.test(action) ||
      data?.status === "completed" ||
      data?.status === "paid" ||
      data?.valid === true;

    if (!isSuccess) {
      notifyTelegram('payment_failed', { action, status: data?.status, plan: data?.plan_id, email: data?.user_email });
      return new Response(JSON.stringify({ ignored: true, action }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // RESOLUTION ORDER for the entitlement email:
    // 1) metadata.order_id → pending_orders.app_email  (most reliable — we
    //    created the checkout via Whop's API with this metadata baked in)
    // 2) metadata.app_email (URL-style fallback, often stripped by Whop)
    // 3) Whop account email (user_email / user.email)
    let email: string | null = null;
    let pendingOrder: any = null;

    const orderId: string | null =
      (pick(data, ["metadata", "order_id"]) as string | null) || null;
    if (orderId) {
      const { data: po } = await supabase
        .from("pending_orders").select("*").eq("id", orderId).maybeSingle();
      if (po) {
        pendingOrder = po;
        email = (po.app_email || "").toLowerCase().trim() || null;
      }
    }

    if (!email) {
      email = (
        pick(data, ["metadata", "app_email"], ["user_email"], ["email"], ["user", "email"], ["member", "email"], ["metadata", "email"])
      )?.toString().trim().toLowerCase() || null;
    }

    const planId: string | null = (
      pick(data, ["plan_id"], ["plan", "id"], ["product_id"], ["metadata", "plan_id"])
    )?.toString() || null;

    if (!email || !planId) {
      console.warn("[whop-webhook] missing email or plan", { email, planId });
      return new Response(JSON.stringify({ error: "missing email or plan_id" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Idempotency: dedupe by the underlying resource (payment or membership),
    // NOT just the webhook event_id. Whop sends multiple events per purchase
    // (payment.succeeded + membership.went_valid + membership.completed), each
    // with a different event_id — crediting on every one would multiply calls.
    const resourceId: string =
      (pick(data, ["id"]) as string | null) || eventId;
    const dedupeKey = `${resourceId}:${planId}:${email}`;

    const { data: existing } = await supabase
      .from("whop_events").select("event_id").eq("event_id", dedupeKey).maybeSingle();
    if (existing) {
      return new Response(JSON.stringify({ duplicate: true, dedupeKey }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch current entitlement
    const { data: cur } = await supabase
      .from("entitlements").select("*").eq("email", email).maybeSingle();

    let row: any = cur || {
      email,
      has_letter_access: false,
      paid_calls: 0,
      used_calls: 0,
      letter_access_expires_at: null as string | null,
    };

    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

    if (planId === LETTER_PLAN) {
      row.has_letter_access = true;
      row.paid_calls = (row.paid_calls || 0) + 1; // 1 free call included with each letter
      // Extend access by 30 days from the later of (now, current expiry)
      const current = row.letter_access_expires_at ? new Date(row.letter_access_expires_at).getTime() : 0;
      const base = Math.max(current, Date.now());
      row.letter_access_expires_at = new Date(base + THIRTY_DAYS_MS).toISOString();
    } else if (planId === EXTRA_CALL_PLAN) {
      row.paid_calls = (row.paid_calls || 0) + 1;
    } else {
      console.warn("[whop-webhook] unknown plan_id:", planId);
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

    await supabase.from("whop_events").insert({ event_id: dedupeKey, payload: body });

    if (pendingOrder) {
      await supabase.from("pending_orders").update({
        status: "paid",
        whop_event_id: eventId,
        updated_at: new Date().toISOString(),
      }).eq("id", pendingOrder.id);
    }

    notifyTelegram('payment_success', { email, plan: planId, product: pendingOrder?.product, amount: pendingOrder?.amount });

    return new Response(JSON.stringify({ ok: true, email, planId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[whop-webhook] error:", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
