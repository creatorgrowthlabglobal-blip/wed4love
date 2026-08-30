import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";

const CurrencySwitcher = () => {
  const { currency, currencies, setCurrencyCode } = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const choose = (code: string) => {
    setOpen(false);
    setCurrencyCode(code);
  };

  return (
    <div ref={ref} className="relative notranslate" translate="no">
      <button
        onClick={() => setOpen(v => !v)}
        aria-label="Change currency"
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-body text-xs font-semibold transition-all hover:scale-[1.03] active:scale-[0.97]"
        style={{
          background: "white",
          color: "hsl(30 20% 22%)",
          border: "1.5px solid hsl(38 40% 82%)",
          boxShadow: "0 1px 2px hsl(38 40% 40% / 0.06)",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = "hsl(38 60% 97%)";
          e.currentTarget.style.borderColor = "hsl(38 55% 68%)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = "white";
          e.currentTarget.style.borderColor = "hsl(38 40% 82%)";
        }}
      >
        <span className="text-sm leading-none">{currency.flag}</span>
        <span className="leading-none">{currency.code}</span>
        <ChevronDown
          className="w-3 h-3 transition-transform"
          style={{ color: "hsl(30 12% 48%)", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 mt-2 w-64 max-h-[70vh] overflow-y-auto bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl py-2 z-50"
            style={{ border: "1px solid hsl(38 40% 88%)" }}
          >
            <p
              className="px-4 pt-1 pb-2 font-body text-[10px] tracking-widest uppercase font-bold"
              style={{ color: "hsl(30 12% 52%)" }}
            >
              Display currency
            </p>
            {currencies.map(c => (
              <button
                key={c.code}
                onClick={() => choose(c.code)}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors text-left"
                style={{ color: "hsl(30 20% 25%)" }}
                onMouseEnter={e => (e.currentTarget.style.background = "hsl(38 60% 96%)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <span className="text-lg leading-none">{c.flag}</span>
                <span className="flex-1 font-body">
                  <span className="font-semibold">{c.code}</span>
                  <span className="text-xs text-muted-foreground ml-2">{c.name}</span>
                </span>
                <span
                  className="font-body text-xs font-semibold"
                  style={{ color: "hsl(30 12% 52%)" }}
                >
                  {c.symbol}
                </span>
                {currency.code === c.code && (
                  <Check className="w-4 h-4" style={{ color: "hsl(38 72% 44%)" }} />
                )}
              </button>
            ))}
            <div className="px-4 pt-2 pb-1 mt-1" style={{ borderTop: "1px solid hsl(38 28% 92%)" }}>
              <p className="font-body text-[10px] text-muted-foreground leading-snug">
                Prices are estimates. Checkout is always processed in USD.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CurrencySwitcher;
