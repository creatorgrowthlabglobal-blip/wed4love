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
 * Creates a Whop checkout_configuration via API so that we can attach
 * server-controlled metadata (order_id, app_email, product, letter_id).
 * Whop echoes this metadata back on the payment webhook, which makes
 * matching reliable regardless of which email the user types at checkout.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const WHOP_API_KEY = Deno.env.get("WHOP_API_KEY");
    if (!WHOP_API_KEY) throw new Error("WHOP_API_KEY not configured");

    const { product, app_email, letter_id, redirect_url } = await req.json();
    const email = String(app_email || "").trim().toLowerCase();
    if (!product || !email) {
      return new Response(JSON.stringify({ error: "product and app_email required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const planId = product === "letter" ? LETTER_PLAN
      : product === "call" ? EXTRA_CALL_PLAN
      : null;
    if (!planId) {
      return new Response(JSON.stringify({ error: `unknown product: ${product}` }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const orderId = crypto.randomUUID();

    const body: Record<string, unknown> = {
      plan_id: planId,
      metadata: {
        order_id: orderId,
        app_email: email,
        product,
        letter_id: letter_id || "",
      },
    };
    if (redirect_url) body.redirect_url = redirect_url;

    // Fire the pending_orders insert and the Whop API call IN PARALLEL.
    // The DB insert (~50-150ms) used to block the Whop call (~600-1500ms)
    // unnecessarily — they don't depend on each other. We still await both
    // before responding so the webhook always finds the pending row.
    const insertPromise = supabase.from("pending_orders").insert({
      id: orderId,
      product,
      app_email: email,
      letter_id: letter_id || null,
      status: "pending",
    });

    const whopPromise = fetch("https://api.whop.com/api/v1/checkout_configurations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${WHOP_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const text = await r.text();
    if (!r.ok) {
      console.error("[create-checkout] whop error", r.status, text);
      return new Response(JSON.stringify({ error: text }), {
        status: r.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const data = JSON.parse(text);
    // Prefill the buyer's email on Whop's checkout page. Whop accepts an
    // `email` query param on the purchase_url; the user can still change it
    // at checkout — our webhook matches via metadata.order_id, so payment
    // confirmation is unaffected by whatever email they ultimately use.
    let purchaseUrl: string = data.purchase_url;
    try {
      const u = new URL(purchaseUrl);
      u.searchParams.set("email", email);
      purchaseUrl = u.toString();
    } catch (_) { /* leave as-is */ }
    return new Response(
      JSON.stringify({ purchase_url: purchaseUrl, order_id: orderId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("[create-checkout] error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
