import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, AlertCircle, ArrowLeft, ChevronDown, Check, Search } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { COUNTRIES, type Country } from "@/lib/countries";
import gardenRoseThumbnail   from "@/assets/garden-rose-thumbnail.png";
import rusticBloomThumbnail  from "@/assets/rustic-bloom-thumbnail.png";
import goldenHourThumbnail   from "@/assets/golden-hour-thumbnail.png";
import midnightLuxeThumbnail from "@/assets/midnight-luxe-thumbnail.png";
import softLoveThumbnail     from "@/assets/soft-love-thumbnail.jpg";

const GOLD      = "hsl(38 72% 44%)";
const GOLD_GRAD = "linear-gradient(135deg, hsl(38 72% 44%), hsl(38 80% 52%))";

// ISO-2 → regional-indicator flag emoji
const flagOf = (iso: string) =>
  iso.toUpperCase().replace(/./g, c => String.fromCodePoint(0x1F1A5 + c.charCodeAt(0)));

const DEFAULT_COUNTRY: Country = COUNTRIES.find(c => c.code === "US") ?? COUNTRIES[0];

// ── Floating-label text field ────────────────────────────────────────────────
const FloatingField = ({
  id, label, type = "text", value, onChange, autoComplete, rightSlot,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  rightSlot?: React.ReactNode;
}) => {
  const [focused, setFocused] = useState(false);
  const floated = focused || value.length > 0;
  return (
    <div className="relative">
      <input
        id={id}
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoComplete={autoComplete}
        className="peer w-full pt-6 pb-2 px-4 pr-10 rounded-2xl text-sm font-body outline-none transition-all bg-white/80 backdrop-blur-sm"
        style={{
          border: `1.5px solid ${focused ? GOLD : "hsl(38 40% 86%)"}`,
          color: "hsl(30 20% 18%)",
          boxShadow: focused ? `0 0 0 4px hsl(38 85% 55% / 0.14)` : "0 1px 2px hsl(38 40% 40% / 0.04)",
        }}
      />
      <label
        htmlFor={id}
        className="absolute left-4 pointer-events-none font-body transition-all origin-left"
        style={{
          top: floated ? 8 : "50%",
          transform: floated ? "translateY(0) scale(0.82)" : "translateY(-50%) scale(1)",
          color: floated ? GOLD : "hsl(30 12% 54%)",
          fontSize: 13,
          fontWeight: 500,
          letterSpacing: 0.1,
        }}
      >
        {label}
      </label>
      {rightSlot && (
        <span className="absolute right-3.5 top-1/2 -translate-y-1/2">{rightSlot}</span>
      )}
    </div>
  );
};

// ── International phone field (country select + number) ─────────────────────
const PhoneField = ({
  country, setCountry, number, setNumber,
}: {
  country: Country;
  setCountry: (c: Country) => void;
  number: string;
  setNumber: (v: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const popRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (popRef.current && !popRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(c =>
      c.name.toLowerCase().includes(q) || c.dial.includes(q.replace(/^\+/, "")) || c.code.toLowerCase().includes(q)
    );
  }, [query]);

  const floated = focused || number.length > 0;

  return (
    <div className="relative" ref={popRef}>
      <div
        className="flex items-stretch rounded-2xl bg-white/80 backdrop-blur-sm transition-all"
        style={{
          border: `1.5px solid ${focused ? GOLD : "hsl(38 40% 86%)"}`,
          boxShadow: focused ? `0 0 0 4px hsl(38 85% 55% / 0.14)` : "0 1px 2px hsl(38 40% 40% / 0.04)",
        }}
      >
        {/* Country trigger */}
        <button
          type="button"
          onClick={() => setOpen(v => !v)}
          className="flex items-center gap-1.5 pl-3.5 pr-2 py-3 rounded-l-2xl text-sm font-body font-semibold transition-colors"
          style={{ color: "hsl(30 20% 20%)", borderRight: "1.5px solid hsl(38 40% 90%)" }}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span className="text-base leading-none">{flagOf(country.code)}</span>
          <span className="text-xs">+{country.dial}</span>
          <ChevronDown className="w-3.5 h-3.5" style={{ color: "hsl(30 12% 48%)" }} />
        </button>

        {/* Number input + floating label */}
        <div className="relative flex-1">
          <input
            id="phone-number"
            type="tel"
            value={number}
            onChange={e => setNumber(e.target.value.replace(/[^\d\s-]/g, ""))}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            autoComplete="tel-national"
            inputMode="numeric"
            className="w-full pt-6 pb-2 px-4 rounded-r-2xl text-sm font-body outline-none bg-transparent"
            style={{ color: "hsl(30 20% 18%)" }}
          />
          <label
            htmlFor="phone-number"
            className="absolute left-4 pointer-events-none font-body transition-all origin-left"
            style={{
              top: floated ? 8 : "50%",
              transform: floated ? "translateY(0) scale(0.82)" : "translateY(-50%) scale(1)",
              color: floated ? GOLD : "hsl(30 12% 54%)",
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            Phone number
          </label>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl z-20 overflow-hidden"
            style={{ border: "1px solid hsl(38 40% 88%)" }}
          >
            <div className="relative px-3 py-2.5" style={{ borderBottom: "1px solid hsl(38 28% 93%)" }}>
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "hsl(30 12% 48%)" }} />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search country"
                className="w-full pl-7 pr-2 py-1.5 text-sm font-body outline-none bg-transparent"
                style={{ color: "hsl(30 20% 18%)" }}
                autoFocus
              />
            </div>
            <div className="max-h-60 overflow-y-auto py-1">
              {filtered.length === 0 && (
                <p className="px-4 py-3 text-sm text-muted-foreground font-body">No match.</p>
              )}
              {filtered.map(c => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => { setCountry(c); setOpen(false); setQuery(""); }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-left transition-colors"
                  style={{ color: "hsl(30 20% 22%)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "hsl(38 60% 97%)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <span className="text-lg leading-none">{flagOf(c.code)}</span>
                  <span className="flex-1 font-body truncate">{c.name}</span>
                  <span className="font-body text-xs font-semibold" style={{ color: "hsl(30 12% 48%)" }}>+{c.dial}</span>
                  {country.code === c.code && <Check className="w-4 h-4" style={{ color: GOLD }} />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Left-pane slideshow of templates ────────────────────────────────────────
const SLIDES = [
  { src: goldenHourThumbnail,   name: "Golden Hour",   tag: "Warm · Sunset · Timeless"  },
  { src: gardenRoseThumbnail,   name: "Garden Rose",   tag: "Romantic · Floral · Soft"  },
  { src: midnightLuxeThumbnail, name: "Midnight Luxe", tag: "Dark · Opulent · Grand"    },
  { src: rusticBloomThumbnail,  name: "Rustic Bloom",  tag: "Earthy · Botanical · Warm" },
  { src: softLoveThumbnail,     name: "Soft Love",     tag: "Intimate · Pastel · Pure"  },
];

const Showcase = () => {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setIdx(i => (i + 1) % SLIDES.length), 4800);
    return () => window.clearInterval(id);
  }, []);
  const slide = SLIDES[idx];

  return (
    <div className="relative hidden lg:block w-full h-full overflow-hidden">
      <AnimatePresence mode="sync">
        <motion.img
          key={slide.src}
          src={slide.src}
          alt={slide.name}
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </AnimatePresence>

      {/* gradient overlay */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(to bottom right, hsl(28 30% 10% / 0.5) 0%, hsl(28 30% 10% / 0.15) 40%, hsl(28 30% 10% / 0.75) 100%)" }}
      />

      {/* Top-left logo */}
      <div className="absolute top-8 left-8">
        <Link to="/" className="font-display font-bold text-2xl tracking-tight" style={{ color: "white" }}>
          Wed4Love
        </Link>
      </div>

      {/* Bottom-left copy */}
      <div className="absolute bottom-10 left-10 right-10 max-w-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.45 }}
          >
            <p className="font-body text-[11px] tracking-[0.28em] uppercase font-semibold mb-3" style={{ color: "hsl(38 85% 72%)" }}>
              {slide.tag}
            </p>
            <p className="font-display font-bold text-4xl text-white leading-tight mb-3">{slide.name}</p>
          </motion.div>
        </AnimatePresence>
        <p className="font-body text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.8)" }}>
          Beautiful invitations, built with real care. Your designer, by your side — from first message to the big day.
        </p>

        {/* Slide dots */}
        <div className="flex gap-1.5 mt-6">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              aria-label={`Go to slide ${i + 1}`}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: idx === i ? 24 : 8,
                background: idx === i ? "white" : "rgba(255,255,255,0.4)",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Page ─────────────────────────────────────────────────────────────────────
export default function AuthPage() {
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const { signInWithEmail, signUpWithEmail } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const dest = (location.state as { from?: string })?.from ?? "/order";

  const reset = () => setError(null);

  const friendly = (msg: string) => {
    const m = msg.toLowerCase();
    if (m.includes("pwned") || m.includes("weak") || m.includes("compromised") || m.includes("easy to guess"))
      return "Please choose a password with at least 6 characters.";
    if (m.includes("invalid login credentials")) return "Incorrect email or password.";
    return msg;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    reset();
    setBusy(true);

    if (tab === "signin") {
      const { error } = await signInWithEmail(email, password);
      if (error) { setError(friendly(error)); setBusy(false); return; }
      navigate(dest, { replace: true });
    } else {
      if (!name.trim()) { setError("Please enter your name."); setBusy(false); return; }
      const phoneDigits = phoneNumber.replace(/\D/g, "");
      if (phoneDigits.length < 6) { setError("Please enter a valid phone number."); setBusy(false); return; }
      const fullPhone = `+${country.dial}${phoneDigits}`;

      const { error } = await signUpWithEmail(email, password, name.trim(), fullPhone);
      if (error) { setError(friendly(error)); setBusy(false); return; }
      const { error: signInError } = await signInWithEmail(email, password);
      if (signInError) { setError(friendly(signInError)); setBusy(false); return; }
      navigate(dest, { replace: true });
      return;
    }
    setBusy(false);
  };

  return (
    <div
      className="min-h-screen grid lg:grid-cols-[1.1fr_1fr]"
      style={{ background: "linear-gradient(155deg, hsl(42 80% 97%) 0%, hsl(350 50% 96%) 50%, hsl(38 60% 95%) 100%)" }}
    >
      {/* Left: showcase */}
      <Showcase />

      {/* Right: form */}
      <div className="flex items-center justify-center px-5 sm:px-10 py-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          {/* Back */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 mb-6 font-body text-sm font-semibold transition-opacity hover:opacity-60"
            style={{ color: "hsl(30 12% 48%)" }}
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          {/* Mobile logo (hidden lg+ since Showcase has it) */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-block font-display font-bold text-2xl tracking-tight" style={{ color: GOLD }}>
              Wed4Love
            </Link>
          </div>

          <div
            className="relative rounded-3xl p-7 sm:p-9"
            style={{
              background: "rgba(255,255,255,0.72)",
              backdropFilter: "blur(20px) saturate(140%)",
              border: "1px solid hsl(38 40% 92%)",
              boxShadow: "0 24px 70px hsl(38 50% 30% / 0.08), 0 1px 3px hsl(38 40% 40% / 0.04)",
            }}
          >
            <p className="font-display font-bold text-2xl sm:text-3xl text-foreground mb-1 tracking-tight">
              {tab === "signin" ? "Welcome back" : "Create your account"}
            </p>
            <p className="font-body text-sm mb-7" style={{ color: "hsl(30 12% 52%)" }}>
              {tab === "signin"
                ? "Pick up where you left off."
                : "Start your invitation in minutes. No credit card required."}
            </p>

            {/* Tabs */}
            <div className="flex rounded-xl p-1 mb-5" style={{ background: "hsl(38 60% 96%)" }}>
              {(["signin", "signup"] as const).map(t => (
                <button
                  key={t}
                  onClick={() => { setTab(t); reset(); }}
                  className="flex-1 py-2 rounded-lg text-sm font-body font-semibold transition-all"
                  style={tab === t
                    ? { background: GOLD_GRAD, color: "white", boxShadow: "0 2px 10px hsl(38 80% 55% / 0.25)" }
                    : { color: "hsl(30 12% 48%)" }}
                >
                  {t === "signin" ? "Sign In" : "Sign Up"}
                </button>
              ))}
            </div>

            {error && (
              <div className="flex items-start gap-2.5 mb-4 px-3.5 py-3 rounded-xl text-sm font-body" style={{ background: "hsl(0 80% 96%)", color: "hsl(0 65% 40%)", border: "1px solid hsl(0 70% 88%)" }}>
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
              {tab === "signup" && (
                <FloatingField
                  id="name"
                  label="Full name"
                  value={name}
                  onChange={setName}
                  autoComplete="name"
                />
              )}
              <FloatingField
                id="email"
                label="Email address"
                type="email"
                value={email}
                onChange={setEmail}
                autoComplete="email"
              />
              <FloatingField
                id="password"
                label="Password"
                type={showPw ? "text" : "password"}
                value={password}
                onChange={setPassword}
                autoComplete={tab === "signin" ? "current-password" : "new-password"}
                rightSlot={
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    className="transition-colors"
                    style={{ color: "hsl(38 50% 60%)" }}
                    aria-label={showPw ? "Hide password" : "Show password"}
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />
              {tab === "signup" && (
                <PhoneField
                  country={country}
                  setCountry={setCountry}
                  number={phoneNumber}
                  setNumber={setPhoneNumber}
                />
              )}

              <button
                type="submit"
                disabled={busy}
                className="mt-2 w-full py-3.5 rounded-2xl font-body text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
                style={{ background: GOLD_GRAD, boxShadow: "0 10px 24px hsl(38 80% 55% / 0.28)" }}
              >
                {busy ? "Please wait…" : tab === "signin" ? "Sign In" : "Create Account"}
              </button>
            </form>

            <p className="mt-5 text-center font-body text-xs" style={{ color: "hsl(30 12% 55%)" }}>
              {tab === "signin" ? "Don't have an account? " : "Already have one? "}
              <button
                onClick={() => { setTab(tab === "signin" ? "signup" : "signin"); reset(); }}
                className="font-semibold hover:underline"
                style={{ color: GOLD }}
              >
                {tab === "signin" ? "Sign up free" : "Sign in"}
              </button>
            </p>
          </div>

          <p className="mt-6 text-center font-body text-xs" style={{ color: "hsl(30 12% 58%)" }}>
            By continuing you agree to our{" "}
            <Link to="/terms" className="hover:underline" style={{ color: GOLD }}>Terms</Link>
            {" & "}
            <Link to="/privacy" className="hover:underline" style={{ color: GOLD }}>Privacy Policy</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
