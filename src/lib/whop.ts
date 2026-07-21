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
 * Detect mobile / in-app browsers where pre-opened popup tabs are unreliable.
 * iOS Safari, Chrome iOS, Instagram/Facebook/TikTok in-app webviews all either
 * block `window.open` after an `await` OR open a tab that can't be navigated
 * later. On these we MUST use same-tab navigation.
 */
function isMobileOrInApp(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return /Android|iPhone|iPad|iPod|Mobile|Instagram|FBAN|FBAV|FB_IAB|Line|TikTok|Snapchat/i.test(ua);
}

/**
 * Open a blank tab SYNCHRONOUSLY inside a click handler — DESKTOP ONLY.
 * On mobile we return null so the caller falls back to same-tab navigation,
 * which is reliably allowed after `await` (unlike `window.open`).
 */
export function openBlankCheckoutTab(): Window | null {
  if (isMobileOrInApp()) return null;
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
      tab.location.replace(url);
      return;
    } catch { /* fall through */ }
  }
  // Same-tab navigation — works reliably on mobile even after async work.
  window.location.assign(url);
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
  has_premium_features?: boolean;
}

export async function fetchEntitlement(email: string): Promise<Entitlement | null> {
  const { data, error } = await supabase.functions.invoke("get-entitlement", {
    body: { email: email.toLowerCase().trim() },
  });
  if (error) {
    console.error("[fetchEntitlement] error", error);
    return null;
  }
  return (data?.entitlement as Entitlement) || null;
}

/** Letter access is active if flagged AND (no expiry yet OR expiry in the future). */
export function hasActiveLetterAccess(ent: Entitlement | null | undefined): boolean {
  if (!ent || !ent.has_letter_access) return false;
  if (!ent.letter_access_expires_at) return true; // legacy rows
  return new Date(ent.letter_access_expires_at).getTime() > Date.now();
}

/** Premium letter features (voice message, locked unlock, read receipts, no watermark). */
export function hasPremiumFeatures(ent: Entitlement | null | undefined): boolean {
  return Boolean(ent?.has_premium_features);
}

/** Atomically consume one paid call credit. Returns true if a credit was deducted. */
export async function consumeCallCredit(email: string): Promise<boolean> {
  const { data, error } = await supabase.functions.invoke("consume-call-credit", {
    body: { email: email.toLowerCase().trim() },
  });
  if (error) {
    console.error("[consumeCallCredit] error", error);
    return false;
  }
  return Boolean(data?.consumed);
}

