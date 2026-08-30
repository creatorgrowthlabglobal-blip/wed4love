import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, QrCode, LayoutDashboard, CheckCircle2,
  Play, ArrowRight, ChevronDown, ChevronUp,
  Clock, Heart, Users, Smartphone, Shield, Music2, LogOut, PlusCircle, BookOpen,
  FileText, Printer, Mail, Truck, X, Bell, Send, Check, Menu,
} from "lucide-react";
import gardenRoseThumbnail   from "@/assets/garden-rose-thumbnail.png";
import rusticBloomThumbnail  from "@/assets/rustic-bloom-thumbnail.png";
import goldenHourThumbnail   from "@/assets/golden-hour-thumbnail.png";
import midnightLuxeThumbnail from "@/assets/midnight-luxe-thumbnail.png";
import softLoveThumbnail     from "@/assets/soft-love-thumbnail.jpg";
import { useAuth } from "@/hooks/useAuth";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import CurrencySwitcher from "@/components/CurrencySwitcher";
import { useCurrency } from "@/contexts/CurrencyContext";

const GOLD       = "hsl(38 72% 44%)";
const GOLD_LIGHT = "hsl(38 80% 52%)";
const GOLD_GRAD  = `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`;

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.05 },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
});

// ── User avatar dropdown ──────────────────────────────────────────────────────
const UserMenu = () => {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initials = (user?.user_metadata?.full_name as string | undefined)
    ?.split(" ")
    .map(w => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || user?.email?.[0]?.toUpperCase() || "U";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-9 h-9 rounded-full flex items-center justify-center font-body font-bold text-sm text-white transition-all hover:opacity-90 active:scale-95"
        style={{ background: GOLD_GRAD, boxShadow: "0 2px 10px hsl(38 80% 55% / 0.3)" }}
      >
        {initials}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-56 rounded-2xl shadow-xl border bg-white overflow-hidden z-50"
          style={{ borderColor: "hsl(38 40% 90%)" }}
        >
          <div className="px-4 py-3 border-b" style={{ borderColor: "hsl(38 40% 92%)" }}>
            <p className="font-body text-xs font-semibold truncate" style={{ color: "hsl(30 20% 20%)" }}
              title={user?.user_metadata?.full_name || "My Account"}>
              {user?.user_metadata?.full_name || "My Account"}
            </p>
            <p className="font-body text-xs truncate" style={{ color: "hsl(30 12% 55%)" }}
              title={user?.email}>
              {user?.email}
            </p>
          </div>
          <div className="py-1.5">
            <button
              onClick={() => { setOpen(false); navigate("/choose-template"); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 font-body text-sm hover:bg-amber-50 transition-colors text-left"
              style={{ color: "hsl(30 20% 22%)" }}
            >
              <PlusCircle className="w-4 h-4" style={{ color: GOLD }} /> New Invitation
            </button>
            <button
              onClick={() => { setOpen(false); navigate("/my-invitations"); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 font-body text-sm hover:bg-amber-50 transition-colors text-left"
              style={{ color: "hsl(30 20% 22%)" }}
            >
              <BookOpen className="w-4 h-4" style={{ color: GOLD }} /> My Invitations
            </button>
            <div style={{ height: 1, background: "hsl(38 40% 92%)", margin: "4px 16px" }} />
            <button
              onClick={async () => { setOpen(false); await signOut(); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 font-body text-sm hover:bg-red-50 transition-colors text-left"
              style={{ color: "hsl(0 60% 40%)" }}
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Smart CTA link — /login when logged out, /choose-template when logged in ─────────
const GetStartedLink = ({ className, style, children }: { className: string; style: React.CSSProperties; children: React.ReactNode }) => {
  const { user } = useAuth();
  return (
    <Link to={user ? "/choose-template" : "/login"} className={className} style={style}>
      {children}
    </Link>
  );
};

// ── Nav ──────────────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { to: "/#how-it-works", label: "How It Works", hash: "how-it-works" as const },
  { to: "/pricing",       label: "Pricing" },
  { to: "/blog",          label: "Blog" },
  { to: "/demo",          label: "Demo" },
  { to: "/contact",       label: "Contact" },
];

const Nav = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinkSt: React.CSSProperties = { color: "hsl(30 12% 48%)" };
  const onEnter = (e: React.MouseEvent<HTMLElement>) => (e.currentTarget.style.color = GOLD);
  const onLeave = (e: React.MouseEvent<HTMLElement>) => (e.currentTarget.style.color = "hsl(30 12% 48%)");

  const onHowItWorks = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuOpen(false);
    if (location.pathname === "/") {
      document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      navigate("/#how-it-works");
    }
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-4 inset-x-0 mx-auto z-50 w-[92%] max-w-5xl"
    >
      <div
        className="bg-white/85 backdrop-blur-xl rounded-2xl shadow-lg px-4 sm:px-6 py-3 flex items-center justify-between relative"
        style={{ border: "1px solid hsl(38 50% 88% / 0.7)" }}
      >
        {/* Logo */}
        <Link to="/" className="z-10">
          <span className="font-display font-bold text-lg tracking-tight" style={{ color: GOLD }}>
            Wed4Love
          </span>
        </Link>

        {/* Center Nav — desktop only */}
        <nav className="hidden md:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
          {NAV_LINKS.map(l =>
            l.hash ? (
              <a
                key={l.label}
                href={l.to}
                onClick={onHowItWorks}
                className="font-body text-sm transition-colors duration-200"
                style={navLinkSt}
                onMouseEnter={onEnter}
                onMouseLeave={onLeave}
              >
                {l.label}
              </a>
            ) : (
              <Link
                key={l.label}
                to={l.to}
                className="font-body text-sm transition-colors duration-200"
                style={navLinkSt}
                onMouseEnter={onEnter}
                onMouseLeave={onLeave}
              >
                {l.label}
              </Link>
            )
          )}
          {!loading && user && (
            <button
              onClick={() => navigate("/my-invitations")}
              className="font-body text-sm transition-colors duration-200 flex items-center gap-1.5"
              style={navLinkSt}
              onMouseEnter={onEnter}
              onMouseLeave={onLeave}
            >
              <BookOpen className="w-3.5 h-3.5" />
              My Invitations
            </button>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3 z-10">
          {/* Utility switchers — desktop only */}
          <div className="hidden md:flex items-center gap-2 sm:gap-3">
            <CurrencySwitcher />
            <LanguageSwitcher />
          </div>

          {/* Desktop-only auth buttons */}
          {!loading && (
            user ? (
              <UserMenu />
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden md:inline-block font-body text-sm font-medium px-4 py-2 rounded-xl transition-all hover:opacity-70"
                  style={{ color: "hsl(30 18% 38%)" }}
                >
                  Sign In
                </Link>
                <Link
                  to="/login"
                  className="font-body text-sm font-semibold px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl transition-all hover:opacity-90 active:scale-95 whitespace-nowrap"
                  style={{ background: GOLD_GRAD, color: "white", boxShadow: "0 4px 18px hsl(38 80% 55% / 0.28)" }}
                >
                  Get Started
                </Link>
              </>
            )
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            className="md:hidden p-2 rounded-xl transition-colors"
            style={{ color: "hsl(30 12% 40%)" }}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="md:hidden mt-2 bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg p-3 flex flex-col gap-1"
            style={{ border: "1px solid hsl(38 50% 88% / 0.7)" }}
          >
            {NAV_LINKS.map(l =>
              l.hash ? (
                <a
                  key={l.label}
                  href={l.to}
                  onClick={onHowItWorks}
                  className="font-body text-sm px-3 py-2.5 rounded-xl hover:bg-amber-50"
                  style={{ color: "hsl(30 12% 40%)" }}
                >
                  {l.label}
                </a>
              ) : (
                <Link
                  key={l.label}
                  to={l.to}
                  onClick={() => setMenuOpen(false)}
                  className="font-body text-sm px-3 py-2.5 rounded-xl hover:bg-amber-50"
                  style={{ color: "hsl(30 12% 40%)" }}
                >
                  {l.label}
                </Link>
              )
            )}
            {!loading && user && (
              <button
                onClick={() => { setMenuOpen(false); navigate("/my-invitations"); }}
                className="font-body text-sm px-3 py-2.5 rounded-xl hover:bg-amber-50 text-left flex items-center gap-1.5"
                style={{ color: "hsl(30 12% 40%)" }}
              >
                <BookOpen className="w-3.5 h-3.5" />
                My Invitations
              </button>
            )}

            {/* Divider */}
            <div className="my-2 h-px" style={{ background: "hsl(38 30% 90%)" }} />

            {/* Utility switchers */}
            <div className="flex items-center gap-2 px-2 py-1">
              <CurrencySwitcher />
              <LanguageSwitcher />
            </div>

            {/* Auth buttons */}
            {!loading && !user && (
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="mt-1 font-body text-sm font-medium px-3 py-2.5 rounded-xl hover:bg-amber-50"
                style={{ color: "hsl(30 18% 38%)" }}
              >
                Sign In
              </Link>
            )}
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

// ── Hero ─────────────────────────────────────────────────────────────────────
const HERO_CARDS = [
  { src: goldenHourThumbnail,   theme: "golden-hour"   },
  { src: gardenRoseThumbnail,   theme: "garden-rose"   },
  { src: rusticBloomThumbnail,  theme: "rustic-bloom"  },
  { src: midnightLuxeThumbnail, theme: "midnight-luxe" },
  { src: softLoveThumbnail,     theme: "soft-love"     },
];

const HERO_AVATARS = [
  { i: "PS", bg: "hsl(340 60% 55%)" },
  { i: "AK", bg: "hsl(200 65% 48%)" },
  { i: "MR", bg: "hsl(38 72% 44%)" },
  { i: "SJ", bg: "hsl(150 48% 42%)" },
  { i: "EM", bg: "hsl(270 52% 56%)" },
];

const Hero = () => {
  const { format } = useCurrency();
  return (
  <section
    className="relative flex flex-col items-center pt-28 pb-0 overflow-hidden"
    style={{ background: "linear-gradient(175deg, hsl(42 60% 97%) 0%, hsl(38 50% 95%) 100%)", minHeight: "100vh" }}
  >
    {/* Soft decorative blobs */}
    <div className="absolute top-20 left-10 w-72 h-72 rounded-full pointer-events-none"
      style={{ background: "radial-gradient(circle, hsl(38 80% 85% / 0.35) 0%, transparent 70%)" }} />
    <div className="absolute top-32 right-8 w-56 h-56 rounded-full pointer-events-none"
      style={{ background: "radial-gradient(circle, hsl(340 60% 88% / 0.28) 0%, transparent 70%)" }} />

    {/* ── Text block ── */}
    <div className="relative text-center max-w-2xl mx-auto px-6 mb-14">
      <motion.div
        initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full font-body text-xs font-semibold mb-6"
          style={{ background: "hsl(38 60% 92%)", color: GOLD, border: "1.5px solid hsl(38 55% 82%)" }}
        >
          <Sparkles className="w-3 h-3" /> Digital Wedding Invitations · from {format(49)}
        </div>

        <h1
          className="font-display font-bold leading-tight mb-5"
          style={{ fontSize: "clamp(2.2rem, 5.5vw, 3.8rem)", color: "hsl(30 20% 14%)" }}
        >
          Elegant Digital Invitations{" "}
          <br className="hidden sm:block" />
          for Modern{" "}
          <span className="font-handwritten italic font-normal" style={{ color: GOLD, fontSize: "1.06em" }}>
            Weddings
          </span>
        </h1>

        <p className="font-body text-base leading-relaxed mb-8 mx-auto" style={{ color: "hsl(30 12% 42%)", maxWidth: 480 }}>
          Your invitation is the first impression of your big day.
          Make it unforgettable — cinematic, elegant, and shared in a single link.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <GetStartedLink
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl font-body text-sm font-bold transition-all hover:scale-[1.03] active:scale-[0.97]"
            style={{ background: GOLD_GRAD, color: "white", boxShadow: "0 8px 28px hsl(38 80% 50% / 0.35)" }}
          >
            Create Your Invitation <ArrowRight className="w-4 h-4" />
          </GetStartedLink>
          <Link
            to="/demo"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl font-body text-sm font-semibold transition-all hover:opacity-80"
            style={{ background: "white", color: "hsl(30 18% 32%)", border: "1.5px solid hsl(38 40% 86%)", boxShadow: "0 2px 12px hsl(38 30% 70% / 0.18)" }}
          >
            <Play className="w-3.5 h-3.5" style={{ color: GOLD }} /> Watch Demo
          </Link>
        </div>

        {/* ── Social proof trust bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5 mt-6 pt-5"
          style={{ borderTop: "1px solid hsl(38 38% 88%)" }}
        >
          {/* Avatar stack + count */}
          <div className="flex items-center gap-2.5">
            <div className="flex">
              {HERO_AVATARS.map((a, idx) => (
                <div
                  key={a.i}
                  className="w-7 h-7 rounded-full flex items-center justify-center font-body text-[9px] font-bold text-white border-2 border-white"
                  style={{ background: a.bg, marginLeft: idx > 0 ? -9 : 0, zIndex: HERO_AVATARS.length - idx, boxShadow: "0 1px 4px rgba(0,0,0,0.14)" }}
                >
                  {a.i}
                </div>
              ))}
            </div>
            <span className="font-body text-xs" style={{ color: "hsl(30 12% 42%)" }}>
              <span className="font-bold" style={{ color: "hsl(30 20% 16%)" }}>2,847</span> couples this month
            </span>
          </div>

          <div className="hidden sm:block w-px h-4" style={{ background: "hsl(38 28% 82%)" }} />

          {/* Star rating */}
          <div className="flex items-center gap-1.5">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} style={{ color: GOLD, fontSize: 12 }}>★</span>
              ))}
            </div>
            <span className="font-body text-xs font-bold" style={{ color: "hsl(30 20% 16%)" }}>4.9</span>
            <span className="font-body text-xs" style={{ color: "hsl(30 12% 52%)" }}>· 312 reviews</span>
          </div>
        </motion.div>
      </motion.div>
    </div>

    {/* ── Cards marquee ── */}
    <style>{`
      @keyframes marquee-rtl {
        0%   { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      .marquee-track {
        animation: marquee-rtl 32s linear infinite;
        will-change: transform;
      }
      .marquee-wrap:hover .marquee-track {
        animation-play-state: paused;
      }
      .marquee-card {
        transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1),
                    box-shadow 0.45s cubic-bezier(0.22, 1, 0.36, 1),
                    filter 0.45s ease;
      }
      .marquee-card:hover {
        transform: translateY(-18px) scale(1.04);
        filter: brightness(1.06);
      }
    `}</style>
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="marquee-wrap relative w-full overflow-hidden"
      style={{ paddingBottom: 32 }}
    >
      {/* Left fade */}
      <div className="absolute left-0 top-0 bottom-0 w-28 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to right, hsl(42 60% 97%) 0%, transparent 100%)" }} />
      {/* Right fade */}
      <div className="absolute right-0 top-0 bottom-0 w-28 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to left, hsl(38 50% 95%) 0%, transparent 100%)" }} />

      <div className="marquee-track flex items-end gap-5 w-max py-6 px-6">
        {[...HERO_CARDS, ...HERO_CARDS].map((card, i) => {
          const isEven = i % 2 === 0;
          return (
            <Link
              key={`${card.theme}-${i}`}
              to={`/invite/demo-wedding?theme=${card.theme}`}
              target="_blank"
              className="shrink-0"
              style={{ width: 180, marginBottom: isEven ? 0 : 24 }}
            >
              <div
                className="marquee-card overflow-hidden w-full"
                style={{
                  aspectRatio: "9/14",
                  borderRadius: 20,
                  boxShadow: isEven
                    ? "0 28px 60px rgba(0,0,0,0.18), 0 6px 16px rgba(0,0,0,0.10)"
                    : "0 16px 40px rgba(0,0,0,0.13), 0 3px 10px rgba(0,0,0,0.07)",
                  border: "2.5px solid rgba(255,255,255,0.98)",
                }}
              >
                <img
                  src={card.src}
                  alt={card.theme}
                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }}
                />
              </div>
            </Link>
          );
        })}
      </div>
    </motion.div>
  </section>
  );
};

// ── Paper vs Digital comparison ──────────────────────────────────────────────
const Comparison = () => {
  const { format, showUsdNote, usdNote } = useCurrency();
  const PAPER = { design: 120, printing: 180, envelopes: 35, shipping: 100 };
  const paperTotal = PAPER.design + PAPER.printing + PAPER.envelopes + PAPER.shipping;
  const digital = 49;
  const savings = paperTotal - digital;

  const PAPER_BG = "hsl(35 22% 96%)";
  const DIGITAL_BG = "linear-gradient(155deg, hsl(28 32% 15%) 0%, hsl(28 28% 10%) 100%)";

  const nowStamp = new Date().toLocaleString("en-US", {
    month: "2-digit", day: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <section className="py-24 px-4" style={{ background: "hsl(42 45% 96%)" }}>
      <div className="max-w-5xl mx-auto">
        <motion.div {...fade()} className="text-center mb-14">
          <span
            className="inline-block px-4 py-1.5 rounded-full font-body text-xs font-semibold mb-5"
            style={{ background: "hsl(38 40% 88%)", color: "hsl(30 30% 30%)" }}
          >
            Comparison
          </span>
          <h2
            className="font-display font-bold leading-tight text-foreground mb-4"
            style={{ fontSize: "clamp(2rem, 5vw, 3.4rem)" }}
          >
            Paper Invitation vs{" "}
            <span className="font-handwritten italic font-normal" style={{ color: GOLD, fontSize: "1.06em" }}>
              Digital Invitation
            </span>
          </h2>
          <p className="font-body text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            See how much you save with digital — while getting far more features.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
          {/* ─── Paper receipt card ─── */}
          <motion.div {...fade(0.1)} className="relative">
            <div
              style={{
                background: PAPER_BG,
                boxShadow: "0 12px 40px hsl(30 20% 40% / 0.14)",
                borderTopLeftRadius: "1.5rem",
                borderTopRightRadius: "1.5rem",
              }}
            >
              <div className="p-7 sm:p-8 font-mono" style={{ color: "hsl(30 25% 22%)" }}>
                {/* Receipt header */}
                <div className="text-center mb-6">
                  <p className="text-[11px] tracking-widest opacity-60">*** WEDDING COSTS ***</p>
                  <p className="text-base sm:text-lg font-bold tracking-widest mt-1">PAPER INVITATION</p>
                  <p className="text-[11px] opacity-50 mt-1 tracking-wider">─────────────────────</p>
                </div>

                {/* Line items */}
                <ul className="flex flex-col gap-3 mb-6">
                  {[
                    { icon: FileText, label: "DESIGN",         amount: PAPER.design },
                    { icon: Printer,  label: "PRINTING (100)", amount: PAPER.printing },
                    { icon: Mail,     label: "ENVELOPES",      amount: PAPER.envelopes },
                    { icon: Truck,    label: "SHIPPING",       amount: PAPER.shipping },
                  ].map(item => (
                    <li key={item.label} className="flex items-center gap-3 pb-2.5"
                      style={{ borderBottom: "1px dashed hsl(30 20% 78%)" }}
                    >
                      <item.icon className="w-4 h-4 shrink-0 opacity-70" />
                      <span className="flex-1 text-[13px] tracking-wider">{item.label}</span>
                      <span className="text-[13px] font-bold">{format(item.amount)}</span>
                    </li>
                  ))}
                </ul>

                <p className="text-center opacity-40 text-xs mb-3 tracking-widest">══════════════════════</p>

                {/* Total */}
                <div className="flex items-center justify-between pb-4"
                  style={{ borderBottom: "1px solid hsl(30 20% 60% / 0.4)" }}
                >
                  <span className="text-sm font-bold tracking-wider">TOTAL</span>
                  <span
                    className="text-2xl font-bold"
                    style={{ color: "hsl(0 65% 45%)", textDecoration: "line-through" }}
                  >
                    {format(paperTotal)}
                  </span>
                </div>

                {/* Footer */}
                <div className="text-center pt-5">
                  <p className="inline-flex items-center gap-1.5 text-[12px] tracking-wider font-bold"
                    style={{ color: "hsl(0 65% 45%)" }}
                  >
                    <X className="w-3.5 h-3.5" /> NO TRACKING / NO RSVP
                  </p>
                  <p className="text-[11px] opacity-55 mt-3 tracking-wider">THANK YOU FOR YOUR MONEY!</p>
                  <p className="text-[10px] opacity-35 mt-1 tracking-wider">{nowStamp}</p>
                </div>
              </div>
            </div>

            {/* Torn zigzag bottom edge */}
            <svg
              viewBox="0 0 100 3"
              preserveAspectRatio="none"
              style={{ width: "100%", height: 14, display: "block", marginTop: -1 }}
            >
              <polygon
                points="0,0 100,0 100,1 97,3 94,1 91,3 88,1 85,3 82,1 79,3 76,1 73,3 70,1 67,3 64,1 61,3 58,1 55,3 52,1 49,3 46,1 43,3 40,1 37,3 34,1 31,3 28,1 25,3 22,1 19,3 16,1 13,3 10,1 7,3 4,1 1,3"
                fill={PAPER_BG}
              />
            </svg>
          </motion.div>

          {/* ─── Digital card ─── */}
          <motion.div {...fade(0.2)} className="relative rounded-3xl overflow-hidden"
            style={{
              background: DIGITAL_BG,
              boxShadow: "0 12px 40px hsl(28 30% 18% / 0.32)",
            }}
          >
            <div className="p-7 sm:p-8">
              {/* Badges */}
              <div className="flex items-start justify-between mb-8 gap-3">
                <span
                  className="inline-block px-4 py-1.5 rounded-full font-body text-xs font-bold"
                  style={{ background: GOLD_GRAD, color: "white", boxShadow: "0 4px 14px hsl(38 80% 55% / 0.35)" }}
                >
                  Digital Invitation
                </span>
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-body text-xs font-bold"
                  style={{ background: "hsl(142 55% 92%)", color: "hsl(142 55% 26%)" }}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Save {format(savings)}
                </span>
              </div>

              {/* Featured 3 rows */}
              <div className="flex flex-col gap-5 mb-7">
                {[
                  { icon: Users, label: "Private guest dashboard" },
                  { icon: Bell,  label: "Real-time RSVP confirmations" },
                  { icon: Send,  label: "Instant link + WhatsApp delivery" },
                ].map(row => (
                  <div key={row.label} className="flex items-center gap-3.5">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                      style={{ background: "hsl(28 25% 22%)" }}
                    >
                      <row.icon className="w-4 h-4" style={{ color: GOLD }} />
                    </div>
                    <span
                      className="flex-1 font-body text-sm font-semibold"
                      style={{ color: "hsl(38 40% 96%)" }}
                    >
                      {row.label}
                    </span>
                    <Check className="w-4 h-4 shrink-0" style={{ color: "hsl(142 55% 55%)" }} />
                  </div>
                ))}
              </div>

              {/* Extra features */}
              <ul className="flex flex-col gap-2 mb-6">
                {[
                  "Unlimited edits after send",
                  "Export guest list to Excel",
                  "Multi-language & currency support",
                ].map(f => (
                  <li key={f} className="flex items-center gap-2 font-body text-sm"
                    style={{ color: "hsl(38 25% 82%)" }}
                  >
                    <Check className="w-3.5 h-3.5 shrink-0" style={{ color: "hsl(142 55% 55%)" }} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              {/* Divider */}
              <div className="my-5" style={{ borderTop: "1px solid hsl(38 25% 25%)" }} />

              {/* Price */}
              <div className="flex items-end justify-between">
                <span className="font-body text-sm font-semibold" style={{ color: "hsl(38 30% 80%)" }}>
                  From only
                </span>
                <div className="text-right">
                  <span className="font-display font-bold text-4xl" style={{ color: GOLD }}>
                    {format(digital)}
                  </span>
                  {showUsdNote && (
                    <p className="text-[10px] font-body mt-0.5" style={{ color: "hsl(38 20% 62%)" }}>
                      charged as {usdNote(digital)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// ── Stats bar ────────────────────────────────────────────────────────────────
const STATS = [
  { value: "3D", label: "Envelope reveal" },
  { value: "5", label: "Cinematic themes" },
  { value: "∞", label: "Guest invites (Premium)" },
  { value: "1 link", label: "Share anywhere" },
];

const StatsBar = () => (
  <section style={{ background: GOLD_GRAD }}>
    <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4">
      {STATS.map((s, i) => (
        <motion.div key={s.label} {...fade(i * 0.07)} className="flex flex-col items-center py-6 px-4">
          <span className="font-display font-bold text-2xl text-white">{s.value}</span>
          <span className="font-body text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.72)" }}>{s.label}</span>
        </motion.div>
      ))}
    </div>
  </section>
);

// ── Templates ────────────────────────────────────────────────────────────────
const TEMPLATES = [
  { src: goldenHourThumbnail,   name: "Golden Hour",   tag: "Warm · Sunset · Timeless",  theme: "golden-hour",   accent: "hsl(32 90% 55%)"  },
  { src: gardenRoseThumbnail,   name: "Garden Rose",   tag: "Romantic · Floral · Soft",  theme: "garden-rose",   accent: "hsl(340 65% 52%)" },
  { src: rusticBloomThumbnail,  name: "Rustic Bloom",  tag: "Earthy · Botanical · Warm", theme: "rustic-bloom",  accent: "hsl(95 35% 48%)"  },
  { src: midnightLuxeThumbnail, name: "Midnight Luxe", tag: "Dark · Opulent · Grand",    theme: "midnight-luxe", accent: "hsl(45 72% 54%)"  },
  { src: softLoveThumbnail,     name: "Soft Love",     tag: "Intimate · Pastel · Pure",  theme: "soft-love",     accent: "hsl(355 58% 58%)" },
];

const TemplateCard = ({ t, i }: { t: typeof TEMPLATES[0]; i: number }) => (
  <motion.div
    {...fade(0.08 + i * 0.09)}
    className="relative rounded-3xl overflow-hidden group cursor-pointer"
    style={{ height: i < 3 ? 420 : 360 }}
  >
    <img
      src={t.src} alt={t.name}
      className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
    />
    <div
      className="absolute inset-0"
      style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.58) 68%, rgba(0,0,0,0.88) 100%)" }}
    />

    {/* Number + Live badge row */}
    <div className="absolute top-4 inset-x-4 flex items-center justify-between z-10">
      <span
        className="flex items-center justify-center w-7 h-7 rounded-full font-body text-[11px] font-bold"
        style={{ background: "rgba(0,0,0,0.38)", backdropFilter: "blur(8px)", color: "rgba(255,255,255,0.9)", border: "1px solid rgba(255,255,255,0.18)" }}
      >
        {String(i + 1).padStart(2, "0")}
      </span>
      <span
        className="flex items-center gap-1 px-2.5 py-1 rounded-full font-body text-[10px] font-bold uppercase tracking-wider"
        style={{ background: "rgba(0,0,0,0.42)", backdropFilter: "blur(6px)", color: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.15)" }}
      >
        <Sparkles className="w-2.5 h-2.5" /> Live
      </span>
    </div>

    {/* Accent dot */}
    <div className="absolute top-[54px] right-4 w-2 h-2 rounded-full ring-2 ring-white/20" style={{ background: t.accent }} />

    <div className="absolute bottom-0 inset-x-0 p-5">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: t.accent }} />
        <p className="font-display font-bold text-white text-lg">{t.name}</p>
      </div>
      <p className="font-body text-xs mb-4 pl-4" style={{ color: "rgba(255,255,255,0.58)" }}>{t.tag}</p>
      <div className="flex gap-2">
        <Link
          to={`/invite/demo-wedding?theme=${t.theme}`}
          target="_blank"
          onClick={e => e.stopPropagation()}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-body text-xs font-semibold transition-all hover:scale-105 active:scale-95"
          style={{ background: "rgba(255,255,255,0.14)", backdropFilter: "blur(6px)", color: "white", border: "1px solid rgba(255,255,255,0.22)" }}
        >
          <Play className="w-2.5 h-2.5" /> Preview
        </Link>
        <Link
          to="/choose-template"
          className="flex-1 py-2 rounded-xl font-body text-xs font-semibold text-center transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ background: GOLD_GRAD, color: "white" }}
        >
          Use This Theme
        </Link>
      </div>
    </div>
  </motion.div>
);

const Templates = () => (
  <section className="py-24 px-4" style={{ background: "hsl(42 35% 97%)" }}>
    <div className="max-w-5xl mx-auto">
      <motion.div {...fade()} className="text-center mb-14">
        <p className="font-body text-[11px] tracking-[0.28em] uppercase font-semibold mb-3" style={{ color: GOLD }}>
          Live Templates
        </p>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
          Choose your aesthetic
        </h2>
        <p className="font-body text-sm text-muted-foreground max-w-sm mx-auto">
          Every theme features a full-screen video background, 3D envelope reveal, and full RSVP suite.
        </p>
      </motion.div>

      {/* Top row — 3 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        {TEMPLATES.slice(0, 3).map((t, i) => <TemplateCard key={t.theme} t={t} i={i} />)}
      </div>

      {/* Bottom row — 2 cards, centered */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:max-w-[66%] mx-auto">
        {TEMPLATES.slice(3).map((t, i) => <TemplateCard key={t.theme} t={t} i={3 + i} />)}
      </div>
    </div>
  </section>
);

// ── How it works ─────────────────────────────────────────────────────────────
const STEPS = [
  {
    n: "01",
    title: "Pick your theme",
    desc: "Choose from our cinematic templates — each one tells a different love story.",
    icon: Sparkles,
  },
  {
    n: "02",
    title: "Personalise your invite",
    desc: "Add your names, wedding date, venue, photo gallery, music, and day program in minutes.",
    icon: Heart,
  },
  {
    n: "03",
    title: "Share & track RSVPs",
    desc: "Send your invite link or QR code. Watch responses roll in live from your dashboard.",
    icon: Users,
  },
];

const HowItWorks = () => (
  <section id="how-it-works" className="py-24 px-4 scroll-mt-24" style={{ background: "hsl(38 45% 95%)" }}>
    <div className="max-w-5xl mx-auto">
      <motion.div {...fade()} className="text-center mb-16">
        <p className="font-body text-[11px] tracking-[0.28em] uppercase font-semibold mb-3" style={{ color: GOLD }}>
          How It Works
        </p>
        <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4 text-foreground">
          Ready in under 10 minutes
        </h2>
        <p className="font-body text-sm text-muted-foreground max-w-sm mx-auto">
          No design skills needed. No confusing dashboards. Just your love story, beautifully told.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {STEPS.map((s, i) => (
          <motion.div key={s.n} {...fade(0.1 + i * 0.12)}
            className="relative rounded-3xl p-7 flex flex-col gap-4"
            style={{ background: "white", border: "1.5px solid hsl(38 40% 88%)", boxShadow: "0 4px 20px hsl(38 40% 60% / 0.08)" }}
          >
            <div className="flex items-center justify-between">
              <span className="font-display font-bold text-4xl" style={{ color: "hsl(38 60% 88%)" }}>{s.n}</span>
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{ background: "hsl(38 60% 93%)" }}>
                <s.icon className="w-5 h-5" style={{ color: GOLD }} />
              </div>
            </div>
            <div>
              <p className="font-display font-bold text-foreground text-base mb-2">{s.title}</p>
              <p className="font-body text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
            </div>
            {i < STEPS.length - 1 && (
              <div className="hidden sm:block absolute top-1/2 -right-3 w-6 h-px"
                style={{ background: "hsl(38 40% 80%)" }} />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

// ── Feature deep-dives ───────────────────────────────────────────────────────
const FEATURE_ROWS = [
  {
    icon: LayoutDashboard,
    eyebrow: "RSVP Dashboard",
    title: "Know exactly who's coming — in real time",
    desc: "Your personal event command centre. See attendance counts, guest messages, dietary notes, and check-in status all in one place. Export the full guest list to CSV for your venue.",
    bullets: ["Live attendance count", "Per-guest notes & check-ins", "Export to CSV", "Works on any device"],
    dark: false,
  },
  {
    icon: QrCode,
    eyebrow: "QR Code & Link",
    title: "One scan. Your entire invitation.",
    desc: "Every invite gets a downloadable QR code and shareable link. Print it on a save-the-date, post it in a WhatsApp group, or put it in an email — guests just tap or scan.",
    bullets: ["Downloadable PNG QR code", "Short shareable URL", "No app needed", "Works on iOS & Android"],
    dark: true,
  },
  {
    icon: Music2,
    eyebrow: "Music & Media",
    title: "Set the mood before they even arrive",
    desc: "Choose from our curated music library or upload your own song. Add a photo gallery from your engagement shoot. Let guests feel the atmosphere of your day before it begins.",
    bullets: ["Curated music library", "Custom music upload", "Photo gallery", "Video backgrounds"],
    dark: false,
  },
  {
    icon: Smartphone,
    eyebrow: "Mobile First",
    title: "Beautiful on every screen",
    desc: "Designed for the way guests actually open invitations — on their phones, in a WhatsApp message, or a DM. Pixel-perfect on every device, no pinching or zooming.",
    bullets: ["Optimised for mobile", "Fast loading", "Works offline after first visit", "No app install"],
    dark: true,
  },
];

// ── Feature visuals ───────────────────────────────────────────────────────────
const RsvpVisual = () => (
  <div className="rounded-2xl overflow-hidden w-full" style={{ boxShadow: "0 12px 40px rgba(0,0,0,0.10)", border: "1px solid hsl(38 40% 90%)", background: "white" }}>
    <div className="px-5 py-3.5 flex items-center justify-between" style={{ background: GOLD_GRAD }}>
      <div className="flex items-center gap-2">
        <LayoutDashboard className="w-3.5 h-3.5 text-white" />
        <span className="font-body text-sm font-semibold text-white">Guest Dashboard</span>
      </div>
      <span className="font-body text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.22)", color: "white" }}>● Live</span>
    </div>
    <div className="grid grid-cols-3 divide-x" style={{ borderBottom: "1px solid hsl(38 35% 92%)" }}>
      {[["47", "Attending", "hsl(140 50% 40%)"], ["12", "Pending", "hsl(38 72% 48%)"], ["5", "Declined", "hsl(0 58% 52%)"]] .map(([n, l, c]) => (
        <div key={l} className="flex flex-col items-center py-3">
          <span className="font-display font-bold text-lg leading-none" style={{ color: c }}>{n}</span>
          <span className="font-body text-xs mt-0.5" style={{ color: "hsl(30 12% 55%)" }}>{l}</span>
        </div>
      ))}
    </div>
    {[["Priya & Rahul", "Attending", "2 guests"], ["Sarah Johnson", "Attending", "1 guest"], ["Mohammed Ali", "Pending", "—"], ["Emma & Tom", "Attending", "3 guests"]].map(([name, status, count]) => (
      <div key={name} className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: "1px solid hsl(38 30% 95%)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full flex items-center justify-center font-body text-xs font-bold text-white shrink-0" style={{ background: GOLD_GRAD }}>{name[0]}</div>
          <span className="font-body text-sm font-medium" style={{ color: "hsl(30 20% 20%)" }}>{name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-body text-xs" style={{ color: "hsl(30 12% 58%)" }}>{count}</span>
          <span className="font-body text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: status === "Attending" ? "hsl(140 50% 92%)" : "hsl(38 60% 92%)", color: status === "Attending" ? "hsl(140 50% 30%)" : "hsl(38 60% 38%)" }}>{status}</span>
        </div>
      </div>
    ))}
    <div className="px-4 py-3 flex items-center justify-between" style={{ background: "hsl(38 50% 97%)" }}>
      <span className="font-body text-xs" style={{ color: "hsl(30 12% 58%)" }}>64 invites sent</span>
      <span className="font-body text-xs font-semibold cursor-pointer" style={{ color: GOLD }}>Export CSV →</span>
    </div>
  </div>
);

const QrVisual = () => (
  <div className="flex items-center justify-center">
    <div className="rounded-3xl p-7 text-center" style={{ background: "white", border: "1.5px solid hsl(38 40% 88%)", boxShadow: "0 12px 40px rgba(0,0,0,0.10)" }}>
      <p className="font-body text-[10px] tracking-[0.25em] uppercase font-semibold mb-4" style={{ color: GOLD }}>Your Invitation Link</p>
      <div className="rounded-2xl p-4 mb-4 inline-block" style={{ background: "hsl(38 55% 96%)", border: "1px solid hsl(38 40% 88%)" }}>
        <QrCode className="w-32 h-32" style={{ color: "hsl(30 20% 16%)" }} />
      </div>
      <p className="font-body text-xs font-semibold mb-0.5" style={{ color: "hsl(30 20% 22%)" }}>wed4love.com/emily-james</p>
      <p className="font-body text-xs mb-5" style={{ color: "hsl(30 12% 58%)" }}>Tap or scan to open</p>
      <div className="flex gap-2">
        <div className="flex-1 py-2 rounded-xl font-body text-xs font-semibold text-white text-center" style={{ background: GOLD_GRAD }}>Download PNG</div>
        <div className="flex-1 py-2 rounded-xl font-body text-xs font-semibold text-center" style={{ background: "hsl(38 55% 94%)", color: GOLD, border: "1px solid hsl(38 40% 86%)" }}>Copy Link</div>
      </div>
    </div>
  </div>
);

const MusicVisual = () => (
  <div className="rounded-2xl overflow-hidden w-full" style={{ boxShadow: "0 12px 40px rgba(0,0,0,0.12)", border: "1px solid hsl(38 40% 90%)" }}>
    <div className="p-5" style={{ background: "linear-gradient(135deg, hsl(32 52% 22%), hsl(32 50% 16%))" }}>
      <div className="flex items-center gap-4 mb-5">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: GOLD_GRAD, boxShadow: "0 6px 18px rgba(0,0,0,0.3)" }}>
          <Music2 className="w-7 h-7 text-white" />
        </div>
        <div>
          <p className="font-handwritten text-white text-xl leading-tight">Birds of a Feather</p>
          <p className="font-body text-xs mt-0.5" style={{ color: "hsl(42 40% 68%)" }}>Billie Eilish · 3:31</p>
        </div>
      </div>
      <div className="flex items-end gap-0.5 h-8 mb-3">
        {[30,50,70,40,80,60,90,50,70,40,85,95,60,40,75,55,80,65,45,72,52,90,62,42,80].map((h, i) => (
          <div key={i} className="flex-1 rounded-full" style={{ height: `${h}%`, background: i < 10 ? GOLD_LIGHT : "rgba(255,255,255,0.22)" }} />
        ))}
      </div>
      <div className="flex items-center justify-between text-xs font-body" style={{ color: "rgba(255,255,255,0.45)" }}>
        <span>1:24</span>
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: GOLD_GRAD }}>
          <Play className="w-3.5 h-3.5 text-white ml-0.5" fill="white" />
        </div>
        <span>3:31</span>
      </div>
    </div>
    <div className="p-4" style={{ background: "white" }}>
      <p className="font-body text-xs font-semibold mb-2.5" style={{ color: GOLD }}>Photo Gallery</p>
      <div className="grid grid-cols-3 gap-2">
        {[goldenHourThumbnail, rusticBloomThumbnail, softLoveThumbnail].map((src, i) => (
          <div key={i} className="rounded-xl overflow-hidden" style={{ aspectRatio: "1", border: "1.5px solid hsl(38 40% 90%)" }}>
            <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const MobileVisual = () => (
  <div className="flex items-center justify-center gap-6">
    <div className="relative" style={{ width: 148 }}>
      <div className="rounded-[2rem] overflow-hidden" style={{ border: "7px solid hsl(30 20% 16%)", boxShadow: "0 0 0 1.5px hsl(30 20% 26%), 0 20px 50px rgba(0,0,0,0.28)", aspectRatio: "9/18" }}>
        <div className="w-full h-full relative" style={{ background: "hsl(32 52% 18%)" }}>
          <img src={goldenHourThumbnail} alt="" style={{ width: "100%", height: "55%", objectFit: "cover", opacity: 0.75 }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 30%, hsl(32 52% 18%) 68%)" }} />
          <div className="absolute bottom-0 inset-x-0 p-3 text-center">
            <p className="font-body uppercase tracking-widest mb-1" style={{ fontSize: "0.45rem", color: "hsl(38 68% 65%)" }}>Wedding Invitation</p>
            <p className="font-handwritten text-white leading-none mb-1" style={{ fontSize: "1.1rem" }}>Emily & James</p>
            <p className="font-body mb-3" style={{ fontSize: "0.46rem", color: "rgba(255,255,255,0.55)" }}>22 November 2026</p>
            <div className="rounded-full py-1.5 text-white font-body font-bold text-center" style={{ background: GOLD_GRAD, fontSize: "0.48rem" }}>Tap to Open ♡</div>
          </div>
        </div>
      </div>
    </div>
    <div className="flex flex-col gap-3">
      {[["🎉", "New RSVP", "Sarah is attending!"], ["💌", "47 / 120", "Responses so far"], ["📲", "One link", "Share anywhere"]].map(([e, t, d]) => (
        <motion.div key={t} animate={{ x: [3, -3, 3] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: Math.random() * 2 }}
          className="rounded-2xl px-3.5 py-2.5" style={{ background: "white", border: "1px solid hsl(38 40% 90%)", boxShadow: "0 4px 16px rgba(0,0,0,0.08)", minWidth: 130 }}>
          <p className="font-body text-xs font-semibold mb-0.5" style={{ color: "hsl(30 20% 20%)" }}>{e} {t}</p>
          <p className="font-body text-xs" style={{ color: "hsl(30 12% 55%)" }}>{d}</p>
        </motion.div>
      ))}
    </div>
  </div>
);

const FEATURE_VISUALS = [RsvpVisual, QrVisual, MusicVisual, MobileVisual];

const FeatureRows = () => (
  <section>
    {FEATURE_ROWS.map((f, i) => {
      const Visual = FEATURE_VISUALS[i];
      return (
        <div
          key={f.eyebrow}
          className="py-20 px-4"
          style={{ background: i % 2 === 0 ? "hsl(42 35% 97%)" : "white" }}
        >
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center gap-12"
            style={{ flexDirection: i % 2 === 1 ? "row-reverse" : "row" }}>
            <motion.div {...fade(0.05)} className="w-full sm:w-1/2 shrink-0">
              <Visual />
            </motion.div>
            <motion.div {...fade(0.12)} className="w-full sm:w-1/2">
              <p className="font-body text-[11px] tracking-[0.28em] uppercase font-semibold mb-3" style={{ color: GOLD }}>
                {f.eyebrow}
              </p>
              <h3 className="font-display font-bold text-2xl sm:text-3xl mb-4 leading-snug text-foreground">
                {f.title}
              </h3>
              <p className="font-body text-sm leading-relaxed mb-6 text-muted-foreground">
                {f.desc}
              </p>
              <ul className="flex flex-col gap-2.5">
                {f.bullets.map(b => (
                  <li key={b} className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: GOLD }} />
                    <span className="font-body text-sm font-medium text-foreground">{b}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      );
    })}
  </section>
);

// ── Testimonials ─────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    quote: "Our guests couldn't believe it wasn't a physical card. The video background of our venue was absolutely stunning — everyone was asking how we did it.",
    name: "Priya & Rahul",
    detail: "December 2025 · Mumbai",
  },
  {
    quote: "The RSVP dashboard made planning so stress-free. I could see exactly who confirmed in real time, add notes, and export the list for the caterer. Saved us hours.",
    name: "Sarah & James",
    detail: "October 2025 · London",
  },
  {
    quote: "We shared it in our family WhatsApp group and within an hour 40 people had RSVP'd. The QR code on our save-the-date was a genius touch.",
    name: "Aisha & David",
    detail: "March 2026 · Dubai",
  },
];

const Testimonials = () => (
  <section className="py-24 px-4" style={{ background: "hsl(42 35% 97%)" }}>
    <div className="max-w-5xl mx-auto">
      <motion.div {...fade()} className="text-center mb-14">
        <p className="font-body text-[11px] tracking-[0.28em] uppercase font-semibold mb-3" style={{ color: GOLD }}>
          Couples Love It
        </p>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
          Real stories, real celebrations
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {TESTIMONIALS.map((t, i) => (
          <motion.div key={t.name} {...fade(0.08 + i * 0.1)}
            className="rounded-3xl p-6 flex flex-col gap-4"
            style={{ background: "white", border: "1.5px solid hsl(38 28% 91%)", boxShadow: "0 4px 24px rgba(0,0,0,0.04)" }}
          >
            {/* Stars */}
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, si) => (
                <span key={si} className="text-xs" style={{ color: GOLD }}>★</span>
              ))}
            </div>
            <p className="font-body text-sm leading-relaxed text-foreground flex-1">
              "{t.quote}"
            </p>
            <div>
              <p className="font-display font-bold text-sm text-foreground">{t.name}</p>
              <p className="font-body text-xs text-muted-foreground mt-0.5">{t.detail}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

// ── Pricing teaser ───────────────────────────────────────────────────────────
const PricingTeaser = () => {
  const { format, showUsdNote, usdNote } = useCurrency();
  return (
  <section className="py-24 px-4" style={{ background: "hsl(38 45% 95%)" }}>
    <div className="max-w-3xl mx-auto text-center">
      <motion.div {...fade()}>
        <p className="font-body text-[11px] tracking-[0.28em] uppercase font-semibold mb-3" style={{ color: GOLD }}>
          Simple Pricing
        </p>
        <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4 text-foreground">
          One payment. Yours forever.
        </h2>
        <p className="font-body text-sm mb-10 max-w-md mx-auto text-muted-foreground">
          No subscriptions. No per-RSVP fees. Pay once and your invitation stays live for up to a year.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto mb-10">
          {[
            { name: "Starter", usd: 49, note: "2 templates · 30 RSVPs · 6 months", highlight: false },
            { name: "Premium", usd: 99, note: "All templates · Unlimited RSVPs · 1 year", highlight: true },
          ].map(p => (
            <div key={p.name}
              className="rounded-3xl p-6 text-center"
              style={{
                background: p.highlight ? GOLD_GRAD : "white",
                border: p.highlight ? "none" : "2px solid hsl(38 55% 80%)",
                boxShadow: p.highlight ? "0 8px 32px hsl(38 80% 55% / 0.25)" : "0 4px 16px hsl(38 40% 60% / 0.08)",
              }}>
              <p className="font-display font-bold text-base mb-1" style={{ color: p.highlight ? "white" : GOLD }}>{p.name}</p>
              <p className="font-display font-bold text-4xl mb-1" style={{ color: p.highlight ? "white" : "hsl(30 20% 14%)" }}>{format(p.usd)}</p>
              {showUsdNote && (
                <p className="font-body text-[10px] mb-1" style={{ color: p.highlight ? "rgba(255,255,255,0.75)" : "hsl(30 12% 55%)" }}>
                  charged as {usdNote(p.usd)}
                </p>
              )}
              <p className="font-body text-xs mt-1" style={{ color: p.highlight ? "rgba(255,255,255,0.8)" : "hsl(30 12% 48%)" }}>
                {p.note}
              </p>
            </div>
          ))}
        </div>

        <Link
          to="/choose-template"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-body text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.97]"
          style={{ background: GOLD_GRAD, color: "white", boxShadow: "0 8px 30px hsl(38 80% 55% / 0.3)" }}
        >
          See Full Plan Details <ArrowRight className="w-4 h-4" />
        </Link>
        <p className="font-body text-xs mt-4 text-muted-foreground">
          No subscription · Pay once · Shareable link instantly
        </p>
      </motion.div>
    </div>
  </section>
  );
};

// ── FAQ ───────────────────────────────────────────────────────────────────────
const FAQS = [
  { q: "Do my guests need to download an app?", a: "No. The invitation opens directly in any browser — on iOS, Android, or desktop. Just tap the link or scan the QR code." },
  { q: "Can I change details after publishing?", a: "Yes. You can update your invite details (names, date, venue, photos) at any time before your event date." },
  { q: "How does RSVP tracking work?", a: "Guests fill in a simple form inside the invite — name, attendance, guest count, and a message. All responses appear instantly in your host dashboard." },
  { q: "What's the difference between Starter and Premium?", a: "Starter covers one template with up to 30 RSVP responses and is valid for 6 months. Premium unlocks all templates, unlimited RSVPs, music, photo gallery, QR sharing, and 1-year validity." },
  { q: "Can I use my own music?", a: "Premium plan includes a curated music library and the ability to upload your own audio file. Starter uses preset background music." },
  { q: "Is my data secure?", a: "Yes. All invite data and RSVP responses are stored securely with Supabase (PostgreSQL). We don't sell your data to third parties." },
];

const FAQ = () => {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-24 px-4" style={{ background: "hsl(42 35% 97%)" }}>
      <div className="max-w-2xl mx-auto">
        <motion.div {...fade()} className="text-center mb-12">
          <p className="font-body text-[11px] tracking-[0.28em] uppercase font-semibold mb-3" style={{ color: GOLD }}>
            FAQ
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
            Common questions
          </h2>
        </motion.div>

        <div className="flex flex-col gap-3">
          {FAQS.map((faq, i) => (
            <motion.div key={i} {...fade(0.05 + i * 0.05)}
              className="rounded-2xl overflow-hidden"
              style={{ background: "white", border: "1.5px solid hsl(38 28% 91%)" }}
            >
              <button
                className="w-full flex items-center justify-between px-5 py-4 text-left"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="font-display font-semibold text-foreground text-sm pr-4">{faq.q}</span>
                {open === i
                  ? <ChevronUp className="w-4 h-4 shrink-0 text-muted-foreground" />
                  : <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground" />}
              </button>
              {open === i && (
                <div className="px-5 pb-4">
                  <p className="font-body text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ── Final CTA ────────────────────────────────────────────────────────────────
const FinalCTA = () => (
  <section className="py-28 px-4 relative overflow-hidden" style={{ background: GOLD_GRAD }}>
    {/* Subtle texture overlay */}
    <div className="absolute inset-0 opacity-10 pointer-events-none"
      style={{ backgroundImage: "radial-gradient(circle at 20% 80%, white 0%, transparent 50%), radial-gradient(circle at 80% 20%, white 0%, transparent 50%)" }} />
    <div className="relative max-w-2xl mx-auto text-center">
      <motion.div {...fade()}>
        <div className="inline-flex items-center gap-2 mb-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className="text-sm" style={{ color: "rgba(255,255,255,0.8)" }}>★</span>
          ))}
        </div>
        <h2 className="font-display font-bold mb-5 leading-tight" style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", color: "white" }}>
          Your guests deserve a{" "}
          <span className="font-handwritten italic font-normal" style={{ color: "rgba(255,255,255,0.9)", fontSize: "1.08em" }}>
            beautiful
          </span>{" "}
          invitation
        </h2>
        <p className="font-body text-sm mb-10 max-w-md mx-auto" style={{ color: "rgba(255,255,255,0.75)" }}>
          Join couples who chose to make their first impression unforgettable. Takes less than 10 minutes to set up.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <GetStartedLink
            className="inline-flex items-center gap-2 px-9 py-4 rounded-2xl font-body text-sm font-bold transition-all hover:scale-[1.03] active:scale-[0.97]"
            style={{ background: "white", color: GOLD, boxShadow: "0 10px 36px rgba(0,0,0,0.15)" }}
          >
            Get Started <ArrowRight className="w-4 h-4" />
          </GetStartedLink>
          <Link
            to="/invite/demo-wedding?theme=rustic-bloom"
            target="_blank"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-body text-sm font-semibold transition-all hover:opacity-80"
            style={{ background: "rgba(255,255,255,0.18)", color: "white", border: "1px solid rgba(255,255,255,0.35)" }}
          >
            <Play className="w-3.5 h-3.5" /> See Rustic Bloom Demo
          </Link>
        </div>
        <div className="flex items-center justify-center gap-6 mt-8">
          {[
            { icon: Shield, text: "Secure & private" },
            { icon: Clock, text: "Ready in 10 min" },
            { icon: CheckCircle2, text: "No subscription" },
          ].map(b => (
            <div key={b.text} className="flex items-center gap-1.5">
              <b.icon className="w-3 h-3" style={{ color: "rgba(255,255,255,0.7)" }} />
              <span className="font-body text-xs" style={{ color: "rgba(255,255,255,0.65)" }}>{b.text}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  </section>
);

// ── Footer ───────────────────────────────────────────────────────────────────
const Footer = () => (
  <footer className="px-6 pt-16 pb-10 border-t" style={{ background: "white", borderColor: "hsl(38 28% 90%)" }}>
    <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-4 gap-10 mb-12">

      {/* Brand */}
      <div className="sm:col-span-1">
        <div className="flex items-center gap-2 mb-3">
          <Heart className="w-4 h-4 fill-current" style={{ color: GOLD }} />
          <span className="font-display font-bold text-base text-foreground">Wed4Love</span>
        </div>
        <p className="font-body text-xs text-muted-foreground leading-relaxed mb-4">
          Beautiful digital wedding invitations with live RSVP tracking — shared in one link.
        </p>
        <a
          href="https://instagram.com/wed4love_official"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 font-body text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/>
            <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
          </svg>
          @wed4love_official
        </a>
      </div>

      {/* Product */}
      <div>
        <p className="font-body text-xs font-bold uppercase tracking-widest text-foreground mb-4">Product</p>
        <ul className="flex flex-col gap-3">
          {[
            { label: "Create an Invitation", to: "/choose-template" },
            { label: "How It Works", to: "/#how-it-works" },
            { label: "Pricing — $49", to: "/choose-template" },
            { label: "Demo Invite", to: "/invite/demo-wedding?theme=garden-rose" },
            { label: "Choose Template", to: "/choose-template" },
          ].map(l => (
            <li key={l.label}>
              <Link to={l.to} className="font-body text-xs text-muted-foreground hover:text-foreground transition-colors">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Support */}
      <div>
        <p className="font-body text-xs font-bold uppercase tracking-widest text-foreground mb-4">Support & Contact</p>
        <ul className="flex flex-col gap-3">
          {[
            { label: "Help Center", to: "/contact" },
            { label: "Support Email", to: "/contact" },
            { label: "Partnerships", to: "/contact" },
          ].map(l => (
            <li key={l.label}>
              <Link to={l.to} className="font-body text-xs text-muted-foreground hover:text-foreground transition-colors">
                {l.label}
              </Link>
            </li>
          ))}
          <li>
            <a href="https://instagram.com/wed4love_official" target="_blank" rel="noopener noreferrer"
              className="font-body text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
              </svg>
              @wed4love_official
            </a>
          </li>
          <li>
            <a href="mailto:wed4loveglobal@gmail.com"
              className="font-body text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/>
              </svg>
              wed4loveglobal@gmail.com
            </a>
          </li>
          <li>
            <a
              href="https://wa.me/9779702238084"
              target="_blank"
              rel="noopener noreferrer"
              className="font-body text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
              </svg>
              +977 9702238084 (WhatsApp)
            </a>
          </li>
        </ul>
      </div>

      {/* Legal */}
      <div>
        <p className="font-body text-xs font-bold uppercase tracking-widest text-foreground mb-4">Legal</p>
        <ul className="flex flex-col gap-3">
          {[
            { label: "Terms of Use", to: "/terms" },
            { label: "Privacy Policy", to: "/privacy" },
            { label: "Refund Policy", to: "/refund" },
          ].map(l => (
            <li key={l.label}>
              <Link to={l.to} className="font-body text-xs text-muted-foreground hover:text-foreground transition-colors">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <p className="font-body text-xs text-muted-foreground mt-4">© 2026 Wed4Love</p>
        <div className="flex items-center gap-1.5 mt-3">
          <Shield className="w-3 h-3 text-muted-foreground" />
          <span className="font-body text-[10px] text-muted-foreground">DMCA Protected</span>
        </div>
        <p className="font-body text-[10px] text-muted-foreground mt-3 leading-relaxed">
          Your privacy is our priority. See how we care for your data in the{" "}
          <Link to="/privacy" className="underline hover:opacity-70">Privacy Policy.</Link>
        </p>
      </div>
    </div>

    <div className="max-w-5xl mx-auto pt-6 border-t" style={{ borderColor: "hsl(38 28% 88%)" }}>
      <p className="font-body text-[10px] text-muted-foreground text-center">
        All plans include a shareable link · No subscription · Pay once · Instant delivery
      </p>
    </div>
  </footer>
);

// ── Demo picker modal ─────────────────────────────────────────────────────────
const DEMO_THEMES = [
  { src: goldenHourThumbnail,   name: "Golden Hour",   tag: "Warm · Sunset",     theme: "golden-hour",   accent: "hsl(32 90% 55%)"  },
  { src: gardenRoseThumbnail,   name: "Garden Rose",   tag: "Romantic · Floral", theme: "garden-rose",   accent: "hsl(340 65% 52%)" },
  { src: rusticBloomThumbnail,  name: "Rustic Bloom",  tag: "Earthy · Botanical",theme: "rustic-bloom",  accent: "hsl(95 35% 48%)"  },
  { src: midnightLuxeThumbnail, name: "Midnight Luxe", tag: "Dark · Opulent",    theme: "midnight-luxe", accent: "hsl(45 72% 54%)"  },
  { src: softLoveThumbnail,     name: "Soft Love",     tag: "Intimate · Pastel", theme: "soft-love",     accent: "hsl(355 58% 58%)" },
];

const DemoPickerModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => (
  <AnimatePresence>
    {open && (
      <>
        {/* Backdrop */}
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Panel */}
        <motion.div
          key="panel"
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-[61] max-w-2xl mx-auto rounded-3xl overflow-hidden"
          style={{ background: "hsl(42 60% 97%)", border: "1.5px solid hsl(38 45% 88%)", boxShadow: "0 32px 80px rgba(0,0,0,0.22)" }}
        >
          {/* Header */}
          <div className="px-6 pt-6 pb-4 flex items-center justify-between" style={{ borderBottom: "1px solid hsl(38 40% 90%)" }}>
            <div>
              <p className="font-body text-[11px] tracking-[0.26em] uppercase font-semibold mb-0.5" style={{ color: GOLD }}>Live Previews</p>
              <h3 className="font-display font-bold text-xl" style={{ color: "hsl(30 20% 14%)" }}>Choose a template to preview</h3>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:bg-black/8 active:scale-95 font-body text-lg leading-none"
              style={{ color: "hsl(30 12% 48%)" }}
            >
              ×
            </button>
          </div>

          {/* Grid */}
          <div className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto">
            {DEMO_THEMES.map(t => (
              <a
                key={t.theme}
                href={`/invite/demo-wedding?theme=${t.theme}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className="relative rounded-2xl overflow-hidden group cursor-pointer"
                style={{ aspectRatio: "9/13" }}
              >
                <img
                  src={t.src}
                  alt={t.name}
                  className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.75) 100%)" }}
                />
                <div className="absolute bottom-0 inset-x-0 p-3">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: t.accent }} />
                    <p className="font-display font-bold text-white text-sm leading-tight">{t.name}</p>
                  </div>
                  <p className="font-body text-[10px] pl-3.5" style={{ color: "rgba(255,255,255,0.6)" }}>{t.tag}</p>
                  <div
                    className="mt-2.5 py-1.5 rounded-xl font-body text-[11px] font-semibold text-white text-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    style={{ background: t.accent }}
                  >
                    Open Preview →
                  </div>
                </div>
              </a>
            ))}
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

// ── Page ──────────────────────────────────────────────────────────────────────
const Landing = () => {
  const location = useLocation();
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    }
  }, [location.hash]);

  return (
  <div>
    <Nav />
    <Hero />
    <Comparison />
    <StatsBar />
    <Templates />
    <HowItWorks />
    <FeatureRows />
    <Testimonials />
    <PricingTeaser />
    <FAQ />
    <FinalCTA />
    <Footer />
  </div>
  );
};

export default Landing;
