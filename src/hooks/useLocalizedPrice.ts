import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface LocalizedPriceInfo {
  currency: string;
  symbol: string;
  rate: number;
}

const CACHE_KEY = "wed4love_localized_price_v1";

const fetchLocalizedInfo = async (): Promise<LocalizedPriceInfo | null> => {
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) return JSON.parse(cached);
  } catch {}

  try {
    const { data, error } = await supabase.functions.invoke("get-localized-price");
    if (error || !data?.currency) return null;
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch {}
    return data as LocalizedPriceInfo;
  } catch {
    return null;
  }
};

/**
 * Display-only "≈€4.60"-style estimate for a USD amount, derived from the
 * visitor's IP-based location. Returns null while loading, on any failure,
 * or when the visitor is already in USD — callers should render the plain
 * USD price regardless and treat this as a small addition next to it, never
 * a replacement (the actual Whop charge always stays in USD).
 */
export const useLocalizedPrice = (usdAmount: number): string | null => {
  const [estimate, setEstimate] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchLocalizedInfo().then((info) => {
      if (cancelled || !info || info.currency === "USD") return;
      const converted = usdAmount * info.rate;
      const formatted = converted >= 100 ? Math.round(converted).toLocaleString() : converted.toFixed(2);
      setEstimate(`≈${info.symbol}${formatted}`);
    });
    return () => {
      cancelled = true;
    };
  }, [usdAmount]);

  return estimate;
};
