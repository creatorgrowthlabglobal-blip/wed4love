import { useEffect, useState, useRef } from "react";
import { Globe, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Brand-styled language switcher backed by the Google Website Translate
 * widget (loaded in index.html). Selecting a language sets the `googtrans`
 * cookie and triggers Google's hidden combobox so the entire page —
 * every component, every string — translates instantly without us having
 * to maintain 11 sets of translation JSON.
 *
 * Arabic auto-flips the document to RTL.
 */

type Lang = { code: string; label: string; flag: string; rtl?: boolean };

const LANGUAGES: Lang[] = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
  { code: "nl", label: "Nederlands", flag: "🇳🇱" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "zh-CN", label: "中文", flag: "🇨🇳" },
  { code: "ko", label: "한국어", flag: "🇰🇷" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "tl", label: "Filipino", flag: "🇵🇭" },
  { code: "ar", label: "العربية", flag: "🇸🇦", rtl: true },
];

const COOKIE = "googtrans";

function readCookie(): string {
  const m = document.cookie.match(/(?:^|;\s*)googtrans=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : "";
}

function writeCookie(value: string) {
  // Set on both host and root domain so it survives subdomains
  document.cookie = `${COOKIE}=${value}; path=/`;
  const host = window.location.hostname;
  const parts = host.split(".");
  if (parts.length >= 2) {
    const root = "." + parts.slice(-2).join(".");
    document.cookie = `${COOKIE}=${value}; path=/; domain=${root}`;
  }
}

function clearCookie() {
  document.cookie = `${COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  const host = window.location.hostname;
  const parts = host.split(".");
  if (parts.length >= 2) {
    const root = "." + parts.slice(-2).join(".");
    document.cookie = `${COOKIE}=; path=/; domain=${root}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
}

function currentCode(): string {
  const v = readCookie(); // e.g. "/en/de"
  const parts = v.split("/").filter(Boolean);
  return parts[1] || "en";
}

const LanguageSwitcher = () => {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("en");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActive(currentCode());
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Keep <html dir> in sync with Arabic
  useEffect(() => {
    const lang = LANGUAGES.find((l) => l.code === active);
    document.documentElement.dir = lang?.rtl ? "rtl" : "ltr";
    document.documentElement.lang = active;
  }, [active]);

  const choose = (code: string) => {
    setOpen(false);
    if (code === active) return;
    if (code === "en") {
      clearCookie();
    } else {
      writeCookie(`/en/${code}`);
    }
    setActive(code);
    // Google's widget reads cookie on load — easiest reliable apply is a reload
    window.location.reload();
  };

  const current = LANGUAGES.find((l) => l.code === active) || LANGUAGES[0];

  return (
    <div ref={ref} className="relative notranslate" translate="no">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Change language"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full hover:bg-primary/5 transition-colors"
      >
        <Globe className="w-4 h-4 text-muted-foreground" />
        <span className="text-base leading-none">{current.flag}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 mt-2 w-56 max-h-[70vh] overflow-y-auto bg-white/95 backdrop-blur-xl rounded-2xl border border-primary/10 shadow-xl py-2 z-50"
          >
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => choose(l.code)}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-primary/5 transition-colors text-left"
              >
                <span className="text-lg leading-none">{l.flag}</span>
                <span className="flex-1 font-body text-foreground">{l.label}</span>
                {active === l.code && <Check className="w-4 h-4 text-primary" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSwitcher;
