import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  flag: string;
  rate: number;
}

// Approximate USD-based reference rates. These are display estimates only —
// Whop always charges in USD at checkout, so precision here doesn't affect
// what the customer actually pays.
export const CURRENCIES: Currency[] = [
  { code: "USD", symbol: "$",   name: "US Dollar",         flag: "🇺🇸", rate: 1     },
  { code: "EUR", symbol: "€",   name: "Euro",              flag: "🇪🇺", rate: 0.92  },
  { code: "GBP", symbol: "£",   name: "British Pound",     flag: "🇬🇧", rate: 0.79  },
  { code: "INR", symbol: "₹",   name: "Indian Rupee",      flag: "🇮🇳", rate: 83    },
  { code: "NPR", symbol: "Rs",  name: "Nepalese Rupee",    flag: "🇳🇵", rate: 133   },
  { code: "AUD", symbol: "A$",  name: "Australian Dollar", flag: "🇦🇺", rate: 1.52  },
  { code: "CAD", symbol: "C$",  name: "Canadian Dollar",   flag: "🇨🇦", rate: 1.37  },
  { code: "SGD", symbol: "S$",  name: "Singapore Dollar",  flag: "🇸🇬", rate: 1.35  },
  { code: "PHP", symbol: "₱",   name: "Philippine Peso",   flag: "🇵🇭", rate: 57    },
  { code: "AED", symbol: "AED", name: "UAE Dirham",        flag: "🇦🇪", rate: 3.67  },
];

const STORAGE_KEY = "wed4love_currency_v1";

interface CurrencyContextValue {
  currency: Currency;
  setCurrencyCode: (code: string) => void;
  currencies: Currency[];
  /** Formats a USD amount into the active currency's display string. */
  format: (usdAmount: number) => string;
  /** Always returns "$XX USD" — for showing the checkout amount underneath. */
  usdNote: (usdAmount: number) => string;
  /** True when the active currency is not USD (i.e. we should show the note). */
  showUsdNote: boolean;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

function formatAmount(currency: Currency, usdAmount: number): string {
  if (currency.code === "USD") return `${currency.symbol}${usdAmount}`;
  const converted = usdAmount * currency.rate;
  const formatted =
    converted >= 100
      ? Math.round(converted).toLocaleString()
      : converted.toFixed(2);
  return `${currency.symbol}${formatted}`;
}

async function detectCurrencyCode(): Promise<string | null> {
  try {
    const { data, error } = await supabase.functions.invoke("get-localized-price");
    if (error || !data?.currency) return null;
    const match = CURRENCIES.find(c => c.code === data.currency);
    return match ? match.code : null;
  } catch {
    return null;
  }
}

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [code, setCode] = useState<string>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && CURRENCIES.some(c => c.code === stored)) return stored;
    } catch {}
    return "USD";
  });

  // First-visit auto-detect from IP. Skipped once the user has explicitly
  // chosen a currency (persisted).
  useEffect(() => {
    let cancelled = false;
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
    } catch {}
    detectCurrencyCode().then(detected => {
      if (cancelled || !detected) return;
      setCode(detected);
    });
    return () => { cancelled = true; };
  }, []);

  const setCurrencyCode = (next: string) => {
    if (!CURRENCIES.some(c => c.code === next)) return;
    setCode(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch {}
  };

  const value = useMemo<CurrencyContextValue>(() => {
    const currency = CURRENCIES.find(c => c.code === code) || CURRENCIES[0];
    return {
      currency,
      setCurrencyCode,
      currencies: CURRENCIES,
      format: (usd) => formatAmount(currency, usd),
      usdNote: (usd) => `$${usd} USD`,
      showUsdNote: currency.code !== "USD",
    };
  }, [code]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used inside CurrencyProvider");
  return ctx;
}
