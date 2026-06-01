// Whop checkout links
export const WHOP_LETTER_CHECKOUT = "https://whop.com/checkout/plan_5Krc5hUT3FZGa";
export const WHOP_EXTRA_CALL_CHECKOUT = "https://whop.com/checkout/plan_cVyzHy6DwWOtK";

/**
 * Build a Whop checkout URL with the buyer's email prefilled and an optional
 * redirect target after purchase. We also forward a metadata blob so the
 * webhook can resolve which letter / context triggered the payment.
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

import { supabase } from "@/integrations/supabase/client";

export interface Entitlement {
  email: string;
  has_letter_access: boolean;
  paid_calls: number;
  used_calls: number;
}

export async function fetchEntitlement(email: string): Promise<Entitlement | null> {
  const { data } = await supabase
    .from("entitlements")
    .select("*")
    .eq("email", email.toLowerCase().trim())
    .maybeSingle();
  return (data as Entitlement) || null;
}
