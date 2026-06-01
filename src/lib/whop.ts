import { supabase } from "@/integrations/supabase/client";

// Legacy direct checkout links (kept as last-resort fallback). Prefer
// `createWhopCheckout()` below which creates an API checkout configuration
// with metadata baked in so the webhook can match by order_id.
export const WHOP_LETTER_CHECKOUT = "https://whop.com/checkout/plan_5Krc5hUT3FZGa";
export const WHOP_EXTRA_CALL_CHECKOUT = "https://whop.com/checkout/plan_cVyzHy6DwWOtK";

/**
 * Build a Whop checkout URL with the buyer's email prefilled and an optional
 * redirect target after purchase. We also forward a metadata blob — note that
 * URL-style `metadata[key]=...` is often stripped by Whop, so this is only a
 * fallback. The reliable path is `createWhopCheckout()`.
 */
export function buildWhopCheckoutUrl(
  base: string,
  opts: { email?: string | null; redirectTo?: string; metadata?: Record<string, string> } = {},
) {
  const url = new URL(base);
  if (opts.email) url.searchParams.set("email", opts.email);
  if (opts.redirectTo) url.searchParams.set("redirect_url", opts.redirectTo);
  if (opts.metadata) {
    for (const [k, v] of Object.entries(opts.metadata)) {
      url.searchParams.set(`metadata[${k}]`, v);
    }
  }
  return url.toString();
}

/**
 * Open a blank tab SYNCHRONOUSLY inside a click handler. iOS Safari and many
 * in-app browsers drop the user-gesture token after the first `await`, which
 * silently blocks a later `window.location.href = ...`. Pre-opening a tab
 * gives us a destination we can safely redirect once the checkout URL is
 * ready. Returns null if popups are blocked — callers should fall back.
 */
export function openBlankCheckoutTab(): Window | null {
  try {
    const w = window.open("about:blank", "_blank");
    if (w) {
      try {
        w.document.write(
          "<title>Opening secure checkout…</title><meta name=viewport content='width=device-width,initial-scale=1'><style>body{font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#fff6f8;color:#333}</style><div>Opening secure checkout…</div>",
        );
      } catch { /* cross-origin write may fail — fine */ }
    }
    return w;
  } catch {
    return null;
  }
}

/** Navigate `tab` to `url` if pre-opened; otherwise redirect current page. */
export function redirectToCheckout(tab: Window | null, url: string) {
  if (tab && !tab.closed) {
    try {
      tab.location.href = url;
      return;
    } catch { /* fall through */ }
  }
  window.location.href = url;
}



/**
 * Create a Whop checkout via our edge function. This server-side call uses
 * Whop's `checkout_configurations` API with metadata embedded, so the webhook
 * can reliably resolve the payment back to `app_email` even when the user
 * uses a different email at Whop checkout. Returns `{ purchase_url, order_id }`.
 */
export async function createWhopCheckout(opts: {
  product: "letter" | "call";
  app_email: string;
  letter_id?: string;
  redirect_url?: string;
}): Promise<{ purchase_url: string; order_id: string }> {
  const { data, error } = await supabase.functions.invoke("create-checkout", {
    body: opts,
  });
  if (error) throw error;
  if (!data?.purchase_url) throw new Error("missing purchase_url");
  return data as { purchase_url: string; order_id: string };
}

export interface Entitlement {
  email: string;
  has_letter_access: boolean;
  paid_calls: number;
  used_calls: number;
  letter_access_expires_at?: string | null;
}

export async function fetchEntitlement(email: string): Promise<Entitlement | null> {
  const { data } = await supabase
    .from("entitlements")
    .select("*")
    .eq("email", email.toLowerCase().trim())
    .maybeSingle();
  return (data as Entitlement) || null;
}

/** Letter access is active if flagged AND (no expiry yet OR expiry in the future). */
export function hasActiveLetterAccess(ent: Entitlement | null | undefined): boolean {
  if (!ent || !ent.has_letter_access) return false;
  if (!ent.letter_access_expires_at) return true; // legacy rows
  return new Date(ent.letter_access_expires_at).getTime() > Date.now();
}

/** Atomically consume one paid call credit. Returns true if a credit was deducted. */
export async function consumeCallCredit(email: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("consume_call_credit", {
    _email: email.toLowerCase().trim(),
  });
  if (error) {
    console.error("[consumeCallCredit] error", error);
    return false;
  }
  return Boolean(data);
}

