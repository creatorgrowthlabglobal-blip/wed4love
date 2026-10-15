import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import {
  Sparkles, QrCode, LayoutDashboard, CheckCircle2,
  Play, ArrowRight, ChevronDown, ChevronUp,
  Clock, Heart, Users, Smartphone, Shield, Music2, LogOut, PlusCircle, BookOpen,
  FileText, Printer, Mail, Truck, X, Bell, Send, Check, Menu, Instagram, Facebook,
  Infinity as InfinityIcon, MessageCircle,
} from "lucide-react";
import gardenRoseThumbnail   from "@/assets/garden-rose-thumbnail.png";
import rusticBloomThumbnail  from "@/assets/rustic-bloom-thumbnail.png";
import goldenHourThumbnail   from "@/assets/golden-hour-thumbnail.png";
import midnightLuxeThumbnail from "@/assets/midnight-luxe-thumbnail.png";
import softLoveThumbnail     from "@/assets/soft-love-thumbnail.jpg";
import coupleAvatar1 from "@/assets/gallery-3.jpeg";
import coupleAvatar2 from "@/assets/hero-couple.jpg";
import coupleAvatar3 from "@/assets/photo1.jpg";
import coupleAvatar4 from "@/assets/gallery-1.jpeg";
import coupleAvatar5 from "@/assets/photo3.jpg";
import { useAuth } from "@/hooks/useAuth";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import CurrencySwitcher from "@/components/CurrencySwitcher";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Seo } from "@/components/Seo";
import ScarcityBar from "@/components/ScarcityBar";
import { SOCIAL_LINKS } from "@/lib/socials";

const LANDING_FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How long does it take to create a digital wedding invitation?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Most couples finish their invitation in about 10 minutes. Pick a template, add your details, upload a couple of photos, and share the link."
      }
    },
    {
      "@type": "Question",
      "name": "Can guests RSVP directly through the invitation?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Every Wed4Love invitation includes a live RSVP form. Responses appear instantly in your dashboard — no separate tools required."
      }
    },
    {
      "@type": "Question",
      "name": "Is Wed4Love a one-time payment or a subscription?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Wed4Love is a one-time payment. Pricing starts at $20 for the Essential package with no recurring charges."
      }
    },
    {
      "@type": "Question",
      "name": "Can I share my invitation on WhatsApp?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Absolutely. Every invitation is a single link with an optimised preview card designed for WhatsApp, iMessage, and Instagram."
      }
    },
    {
      "@type": "Question",
      "name": "How many guests can I invite?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Unlimited. You send one link to as many guests as you want — there's no per-guest fee."
      }
    },
    {
      "@type": "Question",
      "name": "Do you offer a money-back guarantee?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Every Wed4Love purchase is backed by a 30-day money-back guarantee. If you're not happy for any reason, email us within 30 days of your purchase for a full refund, no questions asked."
      }
    }
  ]
};

// Deep editorial teal — primary brand color post-2026-10-14 refresh
const GOLD       = "hsl(192 60% 24%)";
const GOLD_LIGHT = "hsl(192 55% 32%)";
// Primary CTA is now a solid flat fill (reference-inspired), kept as a near-flat gradient so hover variations still work.
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
        style={{ background: GOLD_GRAD, boxShadow: "0 1px 4px hsl(220 20% 20% / 0.08)" }}
      >
        {initials}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-56 rounded-2xl shadow-xl border bg-white overflow-hidden z-50"
          style={{ borderColor: "hsl(220 12% 91%)" }}
        >
          <div className="px-4 py-3 border-b" style={{ borderColor: "hsl(220 12% 93%)" }}>
            <p className="font-body text-xs font-semibold truncate" style={{ color: "hsl(220 18% 18%)" }}
              title={user?.user_metadata?.full_name || "My Account"}>
              {user?.user_metadata?.full_name || "My Account"}
            </p>
            <p className="font-body text-xs truncate" style={{ color: "hsl(220 10% 57%)" }}
              title={user?.email}>
              {user?.email}
            </p>
          </div>
          <div className="py-1.5">
            <button
              onClick={() => { setOpen(false); navigate("/choose-template"); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 font-body text-sm hover:bg-amber-50 transition-colors text-left"
              style={{ color: "hsl(220 15% 20%)" }}
            >
              <PlusCircle className="w-4 h-4" style={{ color: GOLD }} /> New Invitation
            </button>
            <button
              onClick={() => { setOpen(false); navigate("/my-invitations"); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 font-body text-sm hover:bg-amber-50 transition-colors text-left"
              style={{ color: "hsl(220 15% 20%)" }}
            >
              <BookOpen className="w-4 h-4" style={{ color: GOLD }} /> My Invitations
            </button>
            <div style={{ height: 1, background: "hsl(220 12% 93%)", margin: "4px 16px" }} />
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

// ── Smart CTA — routes straight into the no-payment order wizard ─────────────
const GetStartedLink = ({ className, style, children }: { className: string; style: React.CSSProperties; children: React.ReactNode }) => (
  <Link to="/order" className={className} style={style}>
    {children}
  </Link>
);

// ── Nav ──────────────────────────────────────────────────────────────────────
const NAV_LINKS: { to: string; label: string; hash?: string }[] = [
  { to: "/#templates", label: "Templates", hash: "templates" },
  { to: "/pricing",    label: "Pricing" },
  { to: "/team",       label: "Team" },
  { to: "/#reviews",   label: "Reviews",   hash: "reviews" },
  { to: "/contact",    label: "Contact" },
];

const Nav = () => {
  const { user, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const NAV_INK = "hsl(220 20% 16%)";
  const navLinkSt: React.CSSProperties = { color: NAV_INK };
  const onEnter = (e: React.MouseEvent<HTMLElement>) => (e.currentTarget.style.color = GOLD);
  const onLeave = (e: React.MouseEvent<HTMLElement>) => (e.currentTarget.style.color = NAV_INK);

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-4 inset-x-0 mx-auto z-50 w-[92%] max-w-5xl"
    >
      <div
        className="bg-white/85 backdrop-blur-xl rounded-2xl shadow-lg px-4 sm:px-6 py-3 flex items-center gap-3 md:gap-5"
        style={{ border: "1px solid hsl(220 15% 90% / 0.7)" }}
      >
        {/* Logo */}
        <Link to="/" className="shrink-0">
          <span className="font-display font-bold text-2xl sm:text-3xl tracking-tight leading-none" style={{ color: GOLD }}>
            Wed4Love
          </span>
        </Link>

        {/* Center Nav — flows naturally, no absolute positioning */}
        <nav className="hidden md:flex flex-1 items-center justify-center gap-5 lg:gap-7 min-w-0">
          {NAV_LINKS.map(l => (
            <Link
              key={l.label}
              to={l.to}
              className="font-body text-sm font-semibold tracking-wide transition-colors duration-200 whitespace-nowrap"
              style={navLinkSt}
              onMouseEnter={onEnter}
              onMouseLeave={onLeave}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 md:gap-2 lg:gap-3 ml-auto md:ml-0 shrink-0">
          {/* Utility switchers — md+ (hidden on narrow md if space is tight is handled via container flex) */}
          <div className="hidden md:flex items-center gap-1.5 lg:gap-2">
            <CurrencySwitcher />
            <LanguageSwitcher />
          </div>

          {/* Desktop auth buttons */}
          {!loading && (
            user ? (
              <UserMenu />
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden lg:inline-block font-body text-sm font-medium px-4 py-2 rounded-xl transition-all hover:opacity-70 whitespace-nowrap"
                  style={{ color: "hsl(220 12% 40%)" }}
                >
                  Sign In
                </Link>
                <Link
                  to="/order"
                  className="hidden md:inline-block font-body text-sm font-semibold px-3.5 lg:px-5 py-2 lg:py-2.5 rounded-xl transition-all hover:opacity-90 active:scale-95 whitespace-nowrap"
                  style={{ background: GOLD_GRAD, color: "white", boxShadow: "0 2px 8px hsl(220 20% 20% / 0.08)" }}
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
            style={{ color: "hsl(220 10% 42%)" }}
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
            style={{ border: "1px solid hsl(220 15% 90% / 0.7)" }}
          >
            {NAV_LINKS.map(l => (
              <Link
                key={l.label}
                to={l.to}
                onClick={() => setMenuOpen(false)}
                className="font-body text-sm font-semibold tracking-wide px-3 py-2.5 rounded-xl hover:bg-amber-50"
                style={{ color: "hsl(220 20% 16%)" }}
              >
                {l.label}
              </Link>
            ))}

            {/* Divider */}
            <div className="my-2 h-px" style={{ background: "hsl(220 12% 91%)" }} />

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
                style={{ color: "hsl(220 12% 40%)" }}
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
const HERO_AVATARS = [
  { src: coupleAvatar1, alt: "Priya & Sameer" },
  { src: coupleAvatar2, alt: "Anika & Kabir" },
  { src: coupleAvatar3, alt: "Meera & Rohan" },
  { src: coupleAvatar4, alt: "Sanya & Jay" },
  { src: coupleAvatar5, alt: "Esha & Mihir" },
];

const Hero = () => {
  const { format } = useCurrency();
  const typedFull = "ready within\n24 hours.";
  const [typed, setTyped] = useState("");
  useEffect(() => {
    let i = 0;
    let phase: "typing" | "holding" | "erasing" = "typing";
    let timeoutId: ReturnType<typeof setTimeout>;
    const tick = () => {
      if (phase === "typing") {
        i += 1;
        setTyped(typedFull.slice(0, i));
        if (i >= typedFull.length) { phase = "holding"; timeoutId = setTimeout(tick, 1400); return; }
        timeoutId = setTimeout(tick, 110);
      } else if (phase === "holding") {
        phase = "erasing";
        timeoutId = setTimeout(tick, 60);
      } else {
        i -= 1;
        setTyped(typedFull.slice(0, Math.max(0, i)));
        if (i <= 0) { phase = "typing"; timeoutId = setTimeout(tick, 400); return; }
        timeoutId = setTimeout(tick, 55);
      }
    };
    timeoutId = setTimeout(tick, 110);
    return () => clearTimeout(timeoutId);
  }, []);
  return (
  <section
    className="relative overflow-hidden pt-28 sm:pt-32 lg:pt-36 pb-20 sm:pb-24 lg:pb-28"
    style={{ background: "linear-gradient(180deg, hsl(0 0% 99.5%) 0%, hsl(190 20% 96%) 100%)" }}
  >
    {/* ── Soft decorative glows ── */}
    <div className="absolute -top-32 -left-32 w-[40rem] h-[40rem] rounded-full pointer-events-none"
      style={{ background: "radial-gradient(circle, hsl(192 35% 82% / 0.42) 0%, transparent 62%)", filter: "blur(60px)" }} />
    <div className="absolute -bottom-40 -right-32 w-[36rem] h-[36rem] rounded-full pointer-events-none"
      style={{ background: "radial-gradient(circle, hsl(190 25% 90% / 0.4) 0%, transparent 65%)", filter: "blur(60px)" }} />

    {/* Hairline paper texture */}
    <div className="absolute inset-0 pointer-events-none opacity-[0.028]"
      style={{ backgroundImage: "radial-gradient(hsl(220 20% 12%) 1px, transparent 1px)", backgroundSize: "3px 3px" }} />

    {/* Fade into next section */}
    <div className="absolute inset-x-0 bottom-0 h-28 pointer-events-none"
      style={{ background: "linear-gradient(to bottom, transparent, hsl(190 22% 97%))" }} />

    <div className="relative max-w-6xl mx-auto px-6">
      <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-14 lg:gap-20 items-center">

        {/* ── LEFT — editorial copy ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="text-center lg:text-left"
        >
          {/* Headline — editorial serif with italic script accent */}
          <h1
            className="font-display leading-[1.03] mb-7 tracking-[-0.01em]"
            style={{ fontSize: "clamp(2rem, 5.6vw, 5.25rem)", color: "hsl(220 25% 10%)", fontWeight: 500 }}
          >
            Invitations as
            <br />
            unforgettable as
            <br />
            the day,{" "}
            <span
              className="font-handwritten font-normal"
              style={{
                color: "hsl(192 55% 32%)",
                fontSize: "1.1em",
                lineHeight: 1.25,
                whiteSpace: "pre-line",
              }}
            >
              {typed}
              <span style={{ opacity: 0 }} aria-hidden="true">
                {typedFull.slice(typed.length)}
              </span>
            </span>
          </h1>

          {/* Eyebrow — subtle gold uppercase */}
          <p
            className="font-body uppercase text-[10px] sm:text-[11px] tracking-[0.16em] sm:tracking-[0.26em] font-bold mb-5"
            style={{ color: GOLD }}
          >
            RSVP Built-In · Effortless Guest Tracking
          </p>

          {/* Short refined paragraph */}
          <p
            className="font-body leading-[1.7] mb-10 mx-auto lg:mx-0"
            style={{ fontSize: "clamp(1rem, 1.3vw, 1.1rem)", color: "hsl(220 12% 38%)", maxWidth: 500 }}
          >
            The best moments don't start on the day — they start with the invitation.
            One elegant link, a cinematic video backdrop, and live guest replies in your pocket.
          </p>

          {/* CTA row + inline price */}
          <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4 sm:gap-5 mb-6">
            <GetStartedLink
              className="group inline-flex items-center justify-center gap-2.5 px-9 py-[18px] rounded-full font-body text-[13px] font-bold uppercase transition-all hover:scale-[1.025] active:scale-[0.98]"
              style={{
                background: GOLD_GRAD,
                color: "white",
                boxShadow: "0 6px 16px hsl(192 60% 24% / 0.14)",
                letterSpacing: "0.14em",
              }}
            >
              Create Yours Now
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </GetStartedLink>

            <a
              href="/invite/demo-wedding?theme=golden-hour"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-2.5 px-8 py-[16px] rounded-full font-body text-[13px] font-bold uppercase transition-all hover:scale-[1.025] active:scale-[0.98] bg-white"
              style={{
                color: GOLD,
                border: "2px solid hsl(192 25% 72%)",
                letterSpacing: "0.14em",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = GOLD; e.currentTarget.style.background = "hsl(190 30% 97%)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "hsl(192 25% 72%)"; e.currentTarget.style.background = "white"; }}
            >
              <Play className="w-3.5 h-3.5" fill="currentColor" />
              View Example
            </a>

          </div>

          {/* Rating with couple avatars — social proof under CTA */}
          <motion.div
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="inline-flex items-center gap-3 mb-8 justify-center lg:justify-start w-full lg:w-auto"
          >
            <div className="flex shrink-0">
              {HERO_AVATARS.map((a, idx) => (
                <img
                  key={a.alt}
                  src={a.src}
                  alt={a.alt}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-white"
                  style={{ marginLeft: idx > 0 ? -11 : 0, zIndex: HERO_AVATARS.length - idx, boxShadow: "0 2px 10px rgba(14,30,45,0.22)" }}
                />
              ))}
            </div>
            <div className="text-left">
              <div className="flex items-center gap-[2px]" aria-hidden>
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} style={{ color: GOLD, fontSize: 14, lineHeight: 1 }}>★</span>
                ))}
                <span className="font-body text-[12px] font-bold ml-1.5" style={{ color: "hsl(220 20% 14%)" }}>4.9</span>
              </div>
              <p className="font-body text-[11px] sm:text-[12px] mt-1 leading-none" style={{ color: "hsl(220 10% 44%)" }}>
                Loved by <span className="font-bold" style={{ color: "hsl(220 20% 14%)" }}>2,847</span> couples this month
              </p>
            </div>
          </motion.div>

          {/* Guarantee strip — highlighted badge */}
          <motion.div
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="inline-flex items-center gap-2.5 sm:gap-3 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full font-body"
            style={{
              background: "linear-gradient(135deg, hsl(45 85% 96%) 0%, hsl(45 70% 92%) 100%)",
              border: `1.5px solid ${GOLD}`,
              boxShadow: `0 8px 24px hsl(45 60% 50% / 0.18), inset 0 0 0 1px hsl(45 90% 98%)`,
            }}
          >
            <span
              className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full shrink-0"
              style={{ background: GOLD_GRAD, boxShadow: "0 4px 10px hsl(45 60% 40% / 0.3)" }}
            >
              <Shield className="w-4 h-4 sm:w-4.5 sm:h-4.5" style={{ color: "white" }} fill="currentColor" />
            </span>
            <span className="flex flex-col leading-tight text-left">
              <span className="text-[13px] sm:text-[14px] font-bold" style={{ color: "hsl(28 60% 22%)" }}>
                30-Day Money-Back Guarantee
              </span>
              <span className="text-[10.5px] sm:text-[11px] font-medium" style={{ color: "hsl(28 25% 38%)" }}>
                Not happy? Full refund, no questions asked.
              </span>
            </span>
          </motion.div>
        </motion.div>

        {/* ── RIGHT — phone mockup ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex justify-center lg:justify-end"
        >
          {/* "Live RSVPs" floating card */}
          <motion.div
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.85 }}
            className="hidden md:flex absolute -left-4 lg:-left-6 top-14 z-20 items-center gap-2.5 px-3.5 py-2.5 rounded-2xl shadow-[0_18px_40px_rgba(14,30,45,0.14)]"
            style={{ background: "rgba(255,255,255,0.95)", border: "1px solid hsl(190 20% 90%)", backdropFilter: "blur(12px)" }}
          >
            <span className="relative flex w-2 h-2">
              <span className="absolute inline-flex w-full h-full rounded-full opacity-70 animate-ping" style={{ background: GOLD }} />
              <span className="relative inline-flex w-2 h-2 rounded-full" style={{ background: GOLD }} />
            </span>
            <div className="text-left">
              <p className="font-body text-[11px] font-bold leading-none" style={{ color: "hsl(220 20% 14%)" }}>12 new RSVPs</p>
              <p className="font-body text-[10px] leading-none mt-1" style={{ color: "hsl(220 10% 48%)" }}>in the last hour</p>
            </div>
          </motion.div>

          {/* Social-proof avatar strip */}
          <motion.div
            initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 1.05 }}
            className="hidden md:flex absolute -right-4 lg:-right-6 bottom-24 z-20 items-center gap-3 px-3.5 py-2.5 rounded-2xl shadow-[0_18px_40px_rgba(14,30,45,0.14)]"
            style={{ background: "rgba(255,255,255,0.95)", border: "1px solid hsl(190 20% 90%)", backdropFilter: "blur(12px)" }}
          >
            <div className="flex">
              {HERO_AVATARS.slice(0, 3).map((a, idx) => (
                <img
                  key={a.alt}
                  src={a.src}
                  alt={a.alt}
                  className="w-7 h-7 rounded-full object-cover border-2 border-white"
                  style={{ marginLeft: idx > 0 ? -9 : 0, zIndex: 3 - idx }}
                />
              ))}
            </div>
            <div className="text-left">
              <p className="font-body text-[11px] font-bold leading-none" style={{ color: "hsl(220 20% 14%)" }}>Joined today</p>
              <p className="font-body text-[10px] leading-none mt-1" style={{ color: "hsl(220 10% 48%)" }}>+128 couples</p>
            </div>
          </motion.div>

          <PhoneMockup />
        </motion.div>
      </div>

      {/* ── Hero footer: contact prompt + social icons ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative mt-20 sm:mt-24 flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-6"
      >
        <Link
          to="/contact"
          className="inline-flex items-center gap-2 font-body text-sm sm:text-base font-semibold transition-colors"
          style={{ color: "hsl(220 20% 14%)" }}
          onMouseEnter={e => (e.currentTarget.style.color = GOLD)}
          onMouseLeave={e => (e.currentTarget.style.color = "hsl(220 20% 14%)")}
        >
          <MessageCircle className="w-5 h-5" style={{ color: GOLD }} />
          Have any questions? <span style={{ color: GOLD }}>Contact us!</span>
        </Link>

        <span className="hidden sm:block w-px h-5" style={{ background: "hsl(192 25% 75%)" }} />

        <div className="flex items-center gap-2">
          {[
            { href: SOCIAL_LINKS.instagram, label: "Instagram", icon: <Instagram className="w-4 h-4" /> },
            { href: SOCIAL_LINKS.pinterest, label: "Pinterest", icon: <PinterestIcon className="w-4 h-4" /> },
            { href: SOCIAL_LINKS.facebook,  label: "Facebook",  icon: <Facebook className="w-4 h-4" /> },
            { href: SOCIAL_LINKS.tiktok,    label: "TikTok",    icon: <TikTokIcon className="w-4 h-4" /> },
          ].map(s => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              style={{
                background: "white",
                color: "hsl(220 15% 20%)",
                border: "1.5px solid hsl(192 20% 82%)",
                boxShadow: "0 2px 8px hsl(220 20% 15% / 0.08)",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = GOLD_GRAD;
                e.currentTarget.style.color = "white";
                e.currentTarget.style.borderColor = "transparent";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "white";
                e.currentTarget.style.color = "hsl(220 15% 20%)";
                e.currentTarget.style.borderColor = "hsl(192 20% 82%)";
              }}
            >
              {s.icon}
            </a>
          ))}
        </div>
      </motion.div>
    </div>
  </section>
  );
};

// ── Live phone preview ───────────────────────────────────────────────────────
const PhoneMockup = () => (
  <div className="relative mx-auto" style={{ width: "min(260px, 62vw)" }}>
    {/* Ambient glow behind phone */}
    <div
      className="absolute pointer-events-none rounded-full"
      style={{
        inset: "-20%",
        background: "radial-gradient(circle, hsl(192 45% 65% / 0.35) 0%, transparent 60%)",
        filter: "blur(30px)",
      }}
    />

    {/* Phone frame */}
    <div
      className="relative rounded-[44px] p-[9px]"
      style={{
        background: "linear-gradient(160deg, #2a2a2a 0%, #0f0f0f 100%)",
        aspectRatio: "9 / 19",
        boxShadow:
          "0 40px 90px rgba(0,0,0,0.35), 0 0 0 1.5px #3a3a3a inset, 0 0 0 1px rgba(0,0,0,0.45)",
      }}
    >
      {/* Screen */}
      <div className="relative w-full h-full rounded-[36px] overflow-hidden bg-black">
        {/* Golden Hour template scene — the moment after the envelope opens */}
        <video
          src="/wedding-bg-golden-hour.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Soft bottom gradient so the couple names read clearly */}
        <div
          className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.55) 100%)" }}
        />

        {/* Invitation overlay */}
        <div className="absolute inset-x-0 bottom-8 z-20 text-center px-4">
          <p className="font-body text-[9px] tracking-[0.32em] uppercase font-semibold mb-2" style={{ color: "rgba(255,255,255,0.85)" }}>
            You're invited
          </p>
          <p className="font-handwritten italic leading-none" style={{ color: "white", fontSize: 34, textShadow: "0 2px 12px rgba(0,0,0,0.4)" }}>
            Ana <span style={{ color: "hsl(192 45% 65%)" }}>&</span> Elias
          </p>
          <p className="font-body text-[10px] tracking-[0.18em] uppercase mt-2" style={{ color: "rgba(255,255,255,0.7)" }}>
            15 June 2026 · Tuscany
          </p>
        </div>

        {/* Dynamic-island notch */}
        <div
          className="absolute top-[10px] left-1/2 -translate-x-1/2 z-30 rounded-full bg-black"
          style={{ width: 78, height: 22 }}
        />
      </div>
    </div>

    {/* Side hardware buttons */}
    <div className="absolute" style={{ left: -2, top: "18%", width: 3, height: 32, background: "#222", borderTopLeftRadius: 2, borderBottomLeftRadius: 2 }} />
    <div className="absolute" style={{ left: -2, top: "26%", width: 3, height: 54, background: "#222", borderTopLeftRadius: 2, borderBottomLeftRadius: 2 }} />
    <div className="absolute" style={{ right: -2, top: "22%", width: 3, height: 72, background: "#222", borderTopRightRadius: 2, borderBottomRightRadius: 2 }} />
  </div>
);

// ── Brand icons for Pinterest & TikTok (not in lucide) ──────────────────────
const PinterestIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M12 .5C5.65.5.5 5.65.5 12c0 4.87 3.04 9.03 7.33 10.7-.1-.91-.19-2.31.04-3.3.21-.9 1.37-5.74 1.37-5.74s-.35-.7-.35-1.74c0-1.63.95-2.85 2.13-2.85 1.01 0 1.49.76 1.49 1.66 0 1.01-.65 2.53-.98 3.93-.28 1.18.59 2.14 1.75 2.14 2.1 0 3.71-2.21 3.71-5.4 0-2.83-2.03-4.8-4.93-4.8-3.36 0-5.33 2.52-5.33 5.12 0 1.01.39 2.1.88 2.69.1.12.11.22.08.34-.09.37-.29 1.18-.33 1.34-.05.22-.17.26-.4.16-1.5-.7-2.44-2.88-2.44-4.64 0-3.78 2.75-7.25 7.92-7.25 4.16 0 7.39 2.96 7.39 6.92 0 4.13-2.6 7.46-6.21 7.46-1.21 0-2.35-.63-2.74-1.37l-.75 2.85c-.27 1.04-1 2.34-1.49 3.14 1.12.35 2.3.54 3.54.54 6.35 0 11.5-5.15 11.5-11.5S18.35.5 12 .5z"/>
  </svg>
);

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.1z"/>
  </svg>
);

// ── "Our Difference" value prop ──────────────────────────────────────────────
const OurDifference = () => (
  <section className="relative py-16 sm:py-20 px-4" style={{ background: "hsl(190 22% 97%)" }}>
    <div className="max-w-5xl mx-auto">
      <motion.div {...fade()} className="text-center mb-10">
        <p className="font-body text-[11px] tracking-[0.28em] uppercase font-semibold mb-3" style={{ color: GOLD }}>
          What You Won't Find Anywhere Else
        </p>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
          Our Difference
        </h2>
      </motion.div>

      <motion.div
        {...fade(0.1)}
        className="relative rounded-[2rem] overflow-hidden p-8 sm:p-12"
        style={{
          background: "linear-gradient(145deg, hsl(190 30% 97%) 0%, hsl(190 22% 94%) 100%)",
          border: "1.5px solid hsl(190 22% 88%)",
          boxShadow: "0 10px 30px hsl(220 20% 15% / 0.06)",
        }}
      >
        <div className="absolute -top-20 -right-16 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, hsl(192 45% 70% / 0.35) 0%, transparent 65%)", filter: "blur(10px)" }} />

        <div className="relative grid md:grid-cols-2 gap-8 sm:gap-10">
          {/* Point 1 */}
          <div className="flex gap-4">
            <div
              className="shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{ background: GOLD_GRAD, boxShadow: "0 2px 8px hsl(220 20% 20% / 0.08)" }}
            >
              <Heart className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <p className="font-display font-bold text-lg text-foreground mb-1.5 flex items-center gap-2">
                <Check className="w-4 h-4" style={{ color: GOLD }} />
                Your designer, by your side
              </p>
              <p className="font-body text-sm leading-relaxed" style={{ color: "hsl(220 12% 38%)" }}>
                From the first message to the morning of your wedding, your personal designer is available for updates, tweaks, and last-minute changes.
                <span className="font-semibold text-foreground"> Real people, real care.</span>
              </p>
            </div>
          </div>

          {/* Point 2 */}
          <div className="flex gap-4">
            <div
              className="shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{ background: GOLD_GRAD, boxShadow: "0 2px 8px hsl(220 20% 20% / 0.08)" }}
            >
              <InfinityIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-display font-bold text-lg text-foreground mb-1.5 flex items-center gap-2">
                <Check className="w-4 h-4" style={{ color: GOLD }} />
                Unlimited revisions
              </p>
              <p className="font-body text-sm leading-relaxed" style={{ color: "hsl(220 12% 38%)" }}>
                Not happy with something? We change it. And again. And again. There's no limit.
                <span className="font-semibold text-foreground"> Your invitation is done when </span>
                <em className="font-semibold" style={{ color: GOLD }}>you</em>
                <span className="font-semibold text-foreground"> say it's done.</span>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

// ── No-Limits transparency banner ────────────────────────────────────────────
const NoLimitsBanner = () => (
  <section className="relative py-16 sm:py-20 px-4" style={{ background: "hsl(0 0% 99%)" }}>
    <div className="max-w-4xl mx-auto">
      <motion.div
        {...fade()}
        className="relative rounded-[2rem] overflow-hidden text-center px-6 sm:px-12 py-12 sm:py-16"
        style={{
          background: `linear-gradient(135deg, hsl(220 28% 8%) 0%, hsl(220 25% 15%) 100%)`,
          boxShadow: "0 24px 70px rgba(0,0,0,0.22)",
        }}
      >
        {/* Gold ambient glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[32rem] h-[32rem] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, hsl(192 55% 32% / 0.22) 0%, transparent 60%)", filter: "blur(60px)" }} />

        <p
          className="font-body text-[11px] tracking-[0.28em] uppercase font-semibold mb-5"
          style={{ color: "hsl(192 50% 70%)" }}
        >
          No limits. Ever.
        </p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="font-display font-bold leading-none mb-3"
          style={{
            fontSize: "clamp(3rem, 10vw, 6.5rem)",
            background: `linear-gradient(135deg, hsl(192 45% 70%) 0%, hsl(192 55% 32%) 50%, hsl(192 45% 70%) 100%)`,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          1,693<span style={{ fontSize: "0.5em" }}>+</span>
        </motion.div>

        <p className="font-body text-sm sm:text-base mb-2" style={{ color: "rgba(255,255,255,0.85)" }}>
          invitations created and counting
        </p>

        <p className="font-display italic text-lg sm:text-xl mb-6" style={{ color: "hsl(192 50% 70%)" }}>
          Send to 10 guests or 10,000. Same price.
        </p>

        <p className="font-body text-sm leading-relaxed max-w-xl mx-auto mb-8" style={{ color: "rgba(255,255,255,0.7)" }}>
          One link, any number of guests. No per-guest pricing, no extra fees. One-time payment only.
        </p>

        {/* Trust pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {["Unlimited Guests", "One Link", "One-Time Payment"].map(label => (
            <span
              key={label}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-body text-xs sm:text-sm font-semibold"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,220,160,0.3)",
                color: "hsl(192 35% 88%)",
                backdropFilter: "blur(6px)",
              }}
            >
              <Check className="w-3.5 h-3.5" />
              {label}
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  </section>
);

// ── Paper vs Digital comparison ──────────────────────────────────────────────
const Comparison = () => {
  const { format, showUsdNote, usdNote } = useCurrency();
  const PAPER = { design: 120, printing: 180, envelopes: 35, shipping: 100 };
  const paperTotal = PAPER.design + PAPER.printing + PAPER.envelopes + PAPER.shipping;
  const digital = 20;
  const savings = paperTotal - digital;

  const PAPER_BG = "hsl(220 15% 96%)";
  const DIGITAL_BG = "linear-gradient(155deg, hsl(220 25% 15%) 0%, hsl(220 25% 10%) 100%)";

  const nowStamp = new Date().toLocaleString("en-US", {
    month: "2-digit", day: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <section className="py-24 px-4" style={{ background: "hsl(0 0% 98.5%)" }}>
      <div className="max-w-5xl mx-auto">
        <motion.div {...fade()} className="text-center mb-14">
          <span
            className="inline-block px-4 py-1.5 rounded-full font-body text-xs font-semibold mb-5"
            style={{ background: "hsl(220 12% 90%)", color: "hsl(220 20% 28%)" }}
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
                boxShadow: "0 12px 40px hsl(220 20% 15% / 0.10)",
                borderTopLeftRadius: "1.5rem",
                borderTopRightRadius: "1.5rem",
              }}
            >
              <div className="p-7 sm:p-8 font-mono" style={{ color: "hsl(220 20% 20%)" }}>
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
                      style={{ borderBottom: "1px dashed hsl(220 12% 78%)" }}
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
                  style={{ borderBottom: "1px solid hsl(220 15% 65% / 0.4)" }}
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
              boxShadow: "0 12px 40px hsl(220 25% 15% / 0.28)",
            }}
          >
            <div className="p-7 sm:p-8">
              {/* Badges */}
              <div className="flex items-start justify-between mb-8 gap-3">
                <span
                  className="inline-block px-4 py-1.5 rounded-full font-body text-xs font-bold"
                  style={{ background: GOLD_GRAD, color: "white", boxShadow: "0 2px 8px hsl(220 20% 20% / 0.08)" }}
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
                      style={{ background: "hsl(220 18% 20%)" }}
                    >
                      <row.icon className="w-4 h-4" style={{ color: GOLD }} />
                    </div>
                    <span
                      className="flex-1 font-body text-sm font-semibold"
                      style={{ color: "hsl(190 20% 96%)" }}
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
                    style={{ color: "hsl(190 20% 86%)" }}
                  >
                    <Check className="w-3.5 h-3.5 shrink-0" style={{ color: "hsl(142 55% 55%)" }} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              {/* Divider */}
              <div className="my-5" style={{ borderTop: "1px solid hsl(220 15% 22%)" }} />

              {/* Price */}
              <div className="flex items-end justify-between">
                <span className="font-body text-sm font-semibold" style={{ color: "hsl(220 10% 82%)" }}>
                  From only
                </span>
                <div className="text-right">
                  <span className="font-display font-bold text-4xl" style={{ color: GOLD }}>
                    {format(digital)}
                  </span>
                  {showUsdNote && (
                    <p className="text-[10px] font-body mt-0.5" style={{ color: "hsl(220 10% 65%)" }}>
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
  { value: "∞", label: "Unlimited guest invites" },
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
    {...fade(0.05 + i * 0.06)}
    className="relative rounded-2xl overflow-hidden group cursor-pointer"
    style={{ height: 230 }}
  >
    <img
      src={t.src} alt={t.name}
      className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
    />
    <div
      className="absolute inset-0"
      style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.58) 68%, rgba(0,0,0,0.88) 100%)" }}
    />

    {/* Accent dot */}
    <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full ring-2 ring-white/20" style={{ background: t.accent }} />

    <div className="absolute bottom-0 inset-x-0 p-3">
      <p className="font-display font-bold text-white text-sm leading-tight mb-0.5">{t.name}</p>
      <p className="font-body text-[10px] leading-snug mb-2 line-clamp-2" style={{ color: "rgba(255,255,255,0.6)" }}>{t.tag}</p>
      <Link
        to={`/invite/demo-wedding?theme=${t.theme}`}
        target="_blank"
        onClick={e => e.stopPropagation()}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-body text-[10px] font-semibold transition-all hover:scale-105 active:scale-95"
        style={{ background: "rgba(255,255,255,0.16)", backdropFilter: "blur(6px)", color: "white", border: "1px solid rgba(255,255,255,0.24)" }}
      >
        <Play className="w-2 h-2" /> Demo
      </Link>
    </div>
  </motion.div>
);

const Templates = () => (
  <section id="templates" className="py-24 px-4 scroll-mt-24" style={{ background: "hsl(0 0% 99%)" }}>
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

      {/* 5 cards in a single row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {TEMPLATES.map((t, i) => <TemplateCard key={t.theme} t={t} i={i} />)}
      </div>
    </div>
  </section>
);

// ── How it works ─────────────────────────────────────────────────────────────
const INVITE_STEPS = [
  { n: "01", title: "Pick a cinematic theme", desc: "Five video-backed templates — from Golden Hour to Midnight Luxe — each with a 3D envelope reveal.",           icon: Sparkles },
  { n: "02", title: "Add your day details",   desc: "Names, wedding date, venue map, timings, dress code, music, and photo gallery in one clean form.",             icon: Mail },
  { n: "03", title: "Share & track RSVPs",    desc: "Send the link or QR code. Watch guest responses land live in your private RSVP dashboard.",                    icon: Users },
];

const StepCard = ({
  s, i, accent, softBg,
}: {
  s: { n: string; title: string; desc: string; icon: typeof Heart };
  i: number;
  accent: string;
  softBg: string;
}) => (
  <motion.div
    {...fade(0.1 + i * 0.08)}
    className="relative rounded-2xl p-5 flex flex-col gap-3"
    style={{ background: "white", border: "1.5px solid hsl(220 12% 91%)", boxShadow: "0 4px 18px hsl(220 15% 60% / 0.06)" }}
  >
    <div className="flex items-center justify-between">
      <span className="font-display font-bold text-3xl" style={{ color: softBg }}>{s.n}</span>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: softBg }}>
        <s.icon className="w-4.5 h-4.5" style={{ color: accent, width: 18, height: 18 }} />
      </div>
    </div>
    <div>
      <p className="font-display font-bold text-foreground text-[15px] mb-1.5">{s.title}</p>
      <p className="font-body text-[13px] leading-relaxed text-muted-foreground">{s.desc}</p>
    </div>
  </motion.div>
);

const TrackHeader = ({
  eyebrow, title, blurb, accent, accentGrad, icon: Icon, price,
}: {
  eyebrow: string; title: string; blurb: string; accent: string; accentGrad: string; icon: typeof Heart; price: string;
}) => (
  <div className="flex items-start gap-4 mb-5">
    <div
      className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
      style={{ background: accentGrad, boxShadow: `0 6px 18px ${accent.replace(")", " / 0.28)")}` }}
    >
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-body text-[10px] tracking-[0.24em] uppercase font-bold mb-1" style={{ color: accent }}>
        {eyebrow}
      </p>
      <div className="flex items-baseline gap-3 flex-wrap">
        <h3 className="font-display font-bold text-xl sm:text-2xl text-foreground">{title}</h3>
        <span
          className="inline-block px-2.5 py-0.5 rounded-full font-body text-[11px] font-bold"
          style={{ background: "white", color: accent, border: `1.5px solid ${accent.replace(")", " / 0.3)")}` }}
        >
          {price}
        </span>
      </div>
      <p className="font-body text-sm text-muted-foreground mt-1.5">{blurb}</p>
    </div>
  </div>
);

const HowItWorks = () => {
  const { format } = useCurrency();
  return (
  <section id="how-it-works" className="py-24 px-4 scroll-mt-24" style={{ background: "hsl(190 20% 96%)" }}>
    <div className="max-w-4xl mx-auto">
      <motion.div {...fade()} className="text-center mb-14">
        <p className="font-body text-[11px] tracking-[0.28em] uppercase font-semibold mb-3" style={{ color: GOLD }}>
          How It Works
        </p>
        <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4 text-foreground">
          Say it{" "}
          <span className="font-handwritten italic font-normal" style={{ color: GOLD, fontSize: "1.06em" }}>
            unforgettably
          </span>
        </h2>
        <p className="font-body text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
          A cinematic wedding invitation for your whole guest list — ready in about 10 minutes.
        </p>
      </motion.div>

      <motion.div
        {...fade(0.05)}
        className="relative rounded-3xl p-6 sm:p-8"
        style={{
          background: "linear-gradient(160deg, hsl(0 0% 99%) 0%, hsl(190 22% 93%) 100%)",
          border: "1.5px solid hsl(192 20% 84%)",
          boxShadow: "0 12px 32px hsl(192 25% 70% / 0.18)",
        }}
      >
        <TrackHeader
          eyebrow="For your whole guest list"
          title="Wedding Invitation"
          blurb="A cinematic, video-backed invitation with live RSVP tracking, guest dashboard, and QR sharing."
          accent={GOLD}
          accentGrad={GOLD_GRAD}
          icon={Mail}
          price={`from ${format(20)}`}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {INVITE_STEPS.map((s, i) => (
            <StepCard key={s.n} s={s} i={i} accent={GOLD} softBg="hsl(190 25% 94%)" />
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-6">
          <Link
            to="/choose-template"
            className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl font-body text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: GOLD_GRAD, boxShadow: "0 2px 8px hsl(220 20% 20% / 0.08)" }}
          >
            Create an Invitation <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/demo"
            className="inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-body text-sm font-semibold transition-opacity hover:opacity-70"
            style={{ background: "white", color: GOLD, border: "1.5px solid hsl(192 20% 82%)" }}
          >
            <Play className="w-3.5 h-3.5" /> See invitation demo
          </Link>
        </div>
      </motion.div>
    </div>
  </section>
  );
};

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
  <div className="rounded-2xl overflow-hidden w-full" style={{ boxShadow: "0 12px 40px rgba(0,0,0,0.10)", border: "1px solid hsl(220 12% 91%)", background: "white" }}>
    <div className="px-5 py-3.5 flex items-center justify-between" style={{ background: GOLD_GRAD }}>
      <div className="flex items-center gap-2">
        <LayoutDashboard className="w-3.5 h-3.5 text-white" />
        <span className="font-body text-sm font-semibold text-white">Guest Dashboard</span>
      </div>
      <span className="font-body text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.22)", color: "white" }}>● Live</span>
    </div>
    <div className="grid grid-cols-3 divide-x" style={{ borderBottom: "1px solid hsl(190 20% 93%)" }}>
      {[["47", "Attending", "hsl(140 50% 40%)"], ["12", "Pending", "hsl(192 60% 28%)"], ["5", "Declined", "hsl(0 58% 52%)"]] .map(([n, l, c]) => (
        <div key={l} className="flex flex-col items-center py-3">
          <span className="font-display font-bold text-lg leading-none" style={{ color: c }}>{n}</span>
          <span className="font-body text-xs mt-0.5" style={{ color: "hsl(220 10% 57%)" }}>{l}</span>
        </div>
      ))}
    </div>
    {[["Priya & Rahul", "Attending", "2 guests"], ["Sarah Johnson", "Attending", "1 guest"], ["Mohammed Ali", "Pending", "—"], ["Emma & Tom", "Attending", "3 guests"]].map(([name, status, count]) => (
      <div key={name} className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: "1px solid hsl(190 15% 96%)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full flex items-center justify-center font-body text-xs font-bold text-white shrink-0" style={{ background: GOLD_GRAD }}>{name[0]}</div>
          <span className="font-body text-sm font-medium" style={{ color: "hsl(220 18% 18%)" }}>{name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-body text-xs" style={{ color: "hsl(220 10% 60%)" }}>{count}</span>
          <span className="font-body text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: status === "Attending" ? "hsl(140 50% 92%)" : "hsl(190 25% 93%)", color: status === "Attending" ? "hsl(140 50% 30%)" : "hsl(192 60% 22%)" }}>{status}</span>
        </div>
      </div>
    ))}
    <div className="px-4 py-3 flex items-center justify-between" style={{ background: "hsl(0 0% 99%)" }}>
      <span className="font-body text-xs" style={{ color: "hsl(220 10% 60%)" }}>64 invites sent</span>
      <span className="font-body text-xs font-semibold cursor-pointer" style={{ color: GOLD }}>Export CSV →</span>
    </div>
  </div>
);

const QrVisual = () => (
  <div className="flex items-center justify-center">
    <div className="rounded-3xl p-7 text-center" style={{ background: "white", border: "1.5px solid hsl(220 12% 90%)", boxShadow: "0 12px 40px rgba(0,0,0,0.10)" }}>
      <p className="font-body text-[10px] tracking-[0.25em] uppercase font-semibold mb-4" style={{ color: GOLD }}>Your Invitation Link</p>
      <div className="rounded-2xl p-4 mb-4 inline-block" style={{ background: "hsl(190 22% 96%)", border: "1px solid hsl(220 12% 90%)" }}>
        <QrCode className="w-32 h-32" style={{ color: "hsl(220 20% 14%)" }} />
      </div>
      <p className="font-body text-xs font-semibold mb-0.5" style={{ color: "hsl(220 15% 20%)" }}>wed4love.com/emily-james</p>
      <p className="font-body text-xs mb-5" style={{ color: "hsl(220 10% 60%)" }}>Tap or scan to open</p>
      <div className="flex gap-2">
        <div className="flex-1 py-2 rounded-xl font-body text-xs font-semibold text-white text-center" style={{ background: GOLD_GRAD }}>Download PNG</div>
        <div className="flex-1 py-2 rounded-xl font-body text-xs font-semibold text-center" style={{ background: "hsl(190 22% 95%)", color: GOLD, border: "1px solid hsl(220 12% 88%)" }}>Copy Link</div>
      </div>
    </div>
  </div>
);

const MusicVisual = () => (
  <div className="rounded-2xl overflow-hidden w-full" style={{ boxShadow: "0 12px 40px rgba(0,0,0,0.12)", border: "1px solid hsl(220 12% 91%)" }}>
    <div className="p-5" style={{ background: "linear-gradient(135deg, hsl(220 22% 20%), hsl(220 25% 15%))" }}>
      <div className="flex items-center gap-4 mb-5">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: GOLD_GRAD, boxShadow: "0 6px 18px rgba(0,0,0,0.3)" }}>
          <Music2 className="w-7 h-7 text-white" />
        </div>
        <div>
          <p className="font-handwritten text-white text-xl leading-tight">Birds of a Feather</p>
          <p className="font-body text-xs mt-0.5" style={{ color: "hsl(220 10% 70%)" }}>Billie Eilish · 3:31</p>
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
          <div key={i} className="rounded-xl overflow-hidden" style={{ aspectRatio: "1", border: "1.5px solid hsl(220 12% 91%)" }}>
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
      <div className="rounded-[2rem] overflow-hidden" style={{ border: "7px solid hsl(220 20% 14%)", boxShadow: "0 0 0 1.5px hsl(220 15% 24%), 0 20px 50px rgba(0,0,0,0.28)", aspectRatio: "9/18" }}>
        <div className="w-full h-full relative" style={{ background: "hsl(220 25% 17%)" }}>
          <img src={goldenHourThumbnail} alt="" style={{ width: "100%", height: "55%", objectFit: "cover", opacity: 0.75 }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 30%, hsl(220 25% 17%) 68%)" }} />
          <div className="absolute bottom-0 inset-x-0 p-3 text-center">
            <p className="font-body uppercase tracking-widest mb-1" style={{ fontSize: "0.45rem", color: "hsl(192 35% 60%)" }}>Wedding Invitation</p>
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
          className="rounded-2xl px-3.5 py-2.5" style={{ background: "white", border: "1px solid hsl(220 12% 91%)", boxShadow: "0 4px 16px rgba(0,0,0,0.08)", minWidth: 130 }}>
          <p className="font-body text-xs font-semibold mb-0.5" style={{ color: "hsl(220 18% 18%)" }}>{e} {t}</p>
          <p className="font-body text-xs" style={{ color: "hsl(220 10% 57%)" }}>{d}</p>
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
          style={{ background: i % 2 === 0 ? "hsl(0 0% 99%)" : "white" }}
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
  { quote: "Our guests couldn't believe it wasn't a physical card. The video background of our venue was absolutely stunning — everyone was asking how we did it.",
    name: "Priya & Rahul",   detail: "December 2025 · Mumbai",       flag: "🇮🇳", country: "India" },
  { quote: "The RSVP dashboard made planning so stress-free. I could see exactly who confirmed in real time, add notes, and export the list for the caterer. Saved us hours.",
    name: "Sarah & James",   detail: "October 2025 · London",        flag: "🇬🇧", country: "United Kingdom" },
  { quote: "We shared it in our family WhatsApp group and within an hour 40 people had RSVP'd. The QR code on our save-the-date was a genius touch.",
    name: "Aisha & David",   detail: "March 2026 · Dubai",           flag: "🇦🇪", country: "UAE" },
  { quote: "Our designer stayed with us right up to the morning of the wedding. We changed the colour palette three days before — no drama, no extra fee. Felt like having a friend on the team.",
    name: "Camila & Mateo",  detail: "February 2026 · Buenos Aires", flag: "🇦🇷", country: "Argentina" },
  { quote: "I'm particular about typography and spacing. They nailed it on the second revision and were patient with my endless tweaks. The final result looked like a luxury studio made it.",
    name: "Elena & Marco",   detail: "May 2026 · Milan",             flag: "🇮🇹", country: "Italy" },
  { quote: "We invited 420 guests across three continents. One link, one price. No per-guest fees. The multilingual version was perfect for our mixed family.",
    name: "Nia & Daniel",    detail: "July 2026 · Lagos",            flag: "🇳🇬", country: "Nigeria" },
  { quote: "We got the express 24-hour turnaround and it still looked incredible. Our save-the-dates went out the next morning. Worth every penny.",
    name: "Jessica & Ryan",  detail: "August 2026 · Austin",         flag: "🇺🇸", country: "USA" },
  { quote: "The unlimited revisions aren't a marketing line — I asked for seven rounds of changes and nobody blinked. Our invitation finally felt like us.",
    name: "Sophie & Lucas",  detail: "September 2026 · Paris",       flag: "🇫🇷", country: "France" },
];

// "Priya & Rahul" → "P&R"
const coupleInitials = (name: string): string => {
  const parts = name.split(/\s*&\s*/);
  const first = parts[0]?.[0]?.toUpperCase() ?? "";
  const second = parts[1]?.[0]?.toUpperCase() ?? "";
  return second ? `${first}&${second}` : first;
};

const Testimonials = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start", dragFree: false });
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIdx(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi]);

  // Auto-advance every 5s, paused on hover/touch
  useEffect(() => {
    if (!emblaApi || isPaused) return;
    const id = window.setInterval(() => emblaApi.scrollNext(), 5000);
    return () => window.clearInterval(id);
  }, [emblaApi, isPaused]);

  const slideCount = TESTIMONIALS.length;

  return (
    <section id="reviews" className="py-24 px-4 scroll-mt-24" style={{ background: "hsl(0 0% 99%)" }}>
      <div className="max-w-6xl mx-auto">
        <motion.div {...fade()} className="text-center mb-12">
          <p className="font-body text-[11px] tracking-[0.28em] uppercase font-semibold mb-3" style={{ color: GOLD }}>
            Couples Love It
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Real stories, from couples around the world
          </h2>
          <p className="font-body text-sm text-muted-foreground max-w-md mx-auto">
            Drag, swipe, or let it roll — these are their words.
          </p>
        </motion.div>

        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          <div ref={emblaRef} className="overflow-hidden">
            <div className="flex -ml-5">
              {TESTIMONIALS.map((t, i) => (
                <div key={t.name} className="pl-5 shrink-0 grow-0 basis-[85%] sm:basis-1/2 lg:basis-1/3">
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.1 }}
                    transition={{ duration: 0.5, delay: Math.min(i * 0.05, 0.3) }}
                    className="h-full rounded-3xl p-6 flex flex-col gap-4"
                    style={{ background: "white", border: "1.5px solid hsl(220 15% 91%)", boxShadow: "0 4px 24px rgba(0,0,0,0.04)" }}
                  >
                    {/* Initials avatar + name + flag */}
                    <div className="flex items-start gap-3">
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 font-display font-bold text-base tracking-tight"
                        style={{
                          background: GOLD_GRAD,
                          color: "white",
                          border: "2px solid white",
                          boxShadow: "0 4px 12px hsl(220 20% 20% / 0.12)",
                        }}
                        aria-hidden
                      >
                        {coupleInitials(t.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-display font-bold text-sm text-foreground truncate">{t.name}</p>
                        <p className="font-body text-xs mt-0.5 flex items-center gap-1.5" style={{ color: "hsl(220 10% 48%)" }}>
                          <span className="text-base leading-none" aria-hidden>{t.flag}</span>
                          <span className="truncate">{t.detail}</span>
                        </p>
                      </div>
                      <div className="flex gap-0.5 shrink-0 mt-1">
                        {Array.from({ length: 5 }).map((_, si) => (
                          <span key={si} className="text-xs" style={{ color: GOLD }}>★</span>
                        ))}
                      </div>
                    </div>
                    <p className="font-body text-sm leading-relaxed text-foreground flex-1">
                      "{t.quote}"
                    </p>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>

          {/* Dots */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {Array.from({ length: slideCount }).map((_, i) => (
              <button
                key={i}
                onClick={() => emblaApi?.scrollTo(i)}
                aria-label={`Go to review ${i + 1}`}
                className="h-2 rounded-full transition-all"
                style={{
                  width: selectedIdx === i ? 22 : 8,
                  background: selectedIdx === i ? GOLD : "hsl(220 10% 84%)",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// ── Pricing teaser ───────────────────────────────────────────────────────────
const PRICING_FEATURES = [
  "All 5 cinematic templates",
  "Unlimited guests & RSVPs",
  "Live dashboard + CSV export",
  "Custom music & photo gallery",
  "Shareable link + QR code",
  "Priority WhatsApp support",
];

const PricingTeaser = () => {
  const { format, showUsdNote, usdNote } = useCurrency();
  return (
  <section className="py-24 px-4" style={{ background: "hsl(190 20% 96%)" }}>
    <div className="max-w-3xl mx-auto text-center">
      <motion.div {...fade()}>
        <p className="font-body text-[11px] tracking-[0.28em] uppercase font-semibold mb-3" style={{ color: GOLD }}>
          Simple Pricing
        </p>
        <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4 text-foreground">
          One plan. Everything included.
        </h2>
        <p className="font-body text-sm mb-10 max-w-md mx-auto text-muted-foreground">
          No tiers, no upsells, no per-RSVP fees. $20 unlocks every template, every feature, unlimited guests — forever.
        </p>

        <div className="max-w-md mx-auto mb-8">
          <div
            className="rounded-3xl p-8 text-left relative overflow-hidden"
            style={{ background: GOLD_GRAD, boxShadow: "0 6px 16px hsl(192 60% 24% / 0.14)" }}
          >
            <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full font-body text-[10px] font-bold uppercase tracking-wider"
              style={{ background: "rgba(255,255,255,0.22)", color: "white", backdropFilter: "blur(6px)" }}>
              Most popular
            </div>

            <p className="font-display font-bold text-lg mb-1" style={{ color: "white" }}>Everything Plan</p>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-body text-base line-through" style={{ color: "rgba(255,255,255,0.7)" }}>{format(99)}</span>
              <span className="font-display font-bold" style={{ color: "white", fontSize: "3.4rem", lineHeight: 1 }}>{format(20)}</span>
              <span className="font-body text-sm" style={{ color: "rgba(255,255,255,0.85)" }}>one-time</span>
            </div>
            {showUsdNote && (
              <p className="font-body text-[11px] mb-4" style={{ color: "rgba(255,255,255,0.75)" }}>
                charged as {usdNote(20)}
              </p>
            )}
            <p className="font-body text-sm mb-5" style={{ color: "rgba(255,255,255,0.9)" }}>
              Every feature. Unlimited everything. No subscriptions.
            </p>

            <ul className="flex flex-col gap-2 mb-6">
              {PRICING_FEATURES.map(f => (
                <li key={f} className="flex items-start gap-2 font-body text-sm" style={{ color: "white" }}>
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "white" }} />
                  {f}
                </li>
              ))}
            </ul>

            <GetStartedLink
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl font-body text-sm font-bold transition-all hover:opacity-95 active:scale-[0.98]"
              style={{ background: "white", color: GOLD, boxShadow: "0 6px 18px hsl(220 20% 12% / 0.12)" }}
            >
              Design Your Invitation <ArrowRight className="w-4 h-4" />
            </GetStartedLink>
          </div>
        </div>

        <div className="max-w-md mx-auto rounded-2xl p-5"
          style={{ background: "white", border: "1.5px solid hsl(220 12% 88%)" }}
        >
          <p className="font-display font-bold text-base mb-1 text-foreground">Want it done for you?</p>
          <p className="font-body text-xs mb-3 text-muted-foreground">
            Our team can design and build the entire invitation on your behalf — pricing is custom per project.
          </p>
          <a
            href="https://wa.me/9779702238084?text=Hi%20Wed4Love!%20I'd%20like%20a%20custom%2C%20done-for-you%20wedding%20invitation.%20Can%20you%20share%20details%3F"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-body text-sm font-bold"
            style={{ color: GOLD }}
          >
            Message us on WhatsApp <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        <p className="font-body text-xs mt-6 text-muted-foreground">
          30-day money-back guarantee · Secure one-time payment
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
  { q: "What exactly do I get for $20?", a: "Everything. All 5 cinematic templates, unlimited guests and RSVPs, live dashboard, custom music, photo gallery, countdown, venue map, QR code — the full product. It's one plan, one payment, no upsells." },
  { q: "Can I use my own music?", a: "Yes. Upload any audio file or pick from the curated library. It's included — no extra charge." },
  { q: "What if I want you to design the whole invitation for me?", a: "We offer a done-for-you custom service — pricing varies by project. Message us on WhatsApp and we'll put together a quote." },
  { q: "Is my data secure?", a: "Yes. All invite data and RSVP responses are stored securely with Supabase (PostgreSQL). We don't sell your data to third parties." },
  { q: "Do you offer a money-back guarantee?", a: "Yes — every purchase is backed by our 30-day money-back guarantee. If you're not happy for any reason, email us within 30 days of your purchase for a full refund, no questions asked." },
];

const FAQ = () => {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-24 px-4" style={{ background: "hsl(0 0% 99%)" }}>
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
              style={{ background: "white", border: "1.5px solid hsl(220 15% 91%)" }}
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
          Send an invitation{" "}
          <span className="font-handwritten italic font-normal" style={{ color: "rgba(255,255,255,0.9)", fontSize: "1.08em" }}>
            they'll never forget
          </span>
        </h2>
        <p className="font-body text-sm mb-10 max-w-md mx-auto" style={{ color: "rgba(255,255,255,0.75)" }}>
          A cinematic digital wedding invitation with a 3D envelope reveal and live RSVP tracking. Takes less than 10 minutes.
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
        <div className="inline-flex items-center gap-2 mt-6 px-4 py-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)" }}>
          <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "white" }} />
          <span className="font-body text-xs font-semibold" style={{ color: "white" }}>30-day money-back guarantee</span>
        </div>
        <div className="flex items-center justify-center gap-6 mt-6 flex-wrap">
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
  <footer className="px-6 pt-16 pb-10 border-t" style={{ background: "white", borderColor: "hsl(220 15% 91%)" }}>
    <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-4 gap-10 mb-12">

      {/* Brand */}
      <div className="sm:col-span-1">
        <div className="flex items-center gap-2 mb-3">
          <Heart className="w-4 h-4 fill-current" style={{ color: GOLD }} />
          <span className="font-display font-bold text-base text-foreground">Wed4Love</span>
        </div>
        <p className="font-body text-xs text-muted-foreground leading-relaxed mb-4">
          Cinematic digital wedding invitations — shared in one link.
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
            { label: "Pricing — $20", to: "/choose-template" },
            { label: "Demo Invite", to: "/invite/demo-wedding?theme=garden-rose" },
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

    <div className="max-w-5xl mx-auto pt-6 border-t" style={{ borderColor: "hsl(220 15% 90%)" }}>
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
          style={{ background: "hsl(0 0% 99%)", border: "1.5px solid hsl(190 20% 91%)", boxShadow: "0 32px 80px rgba(0,0,0,0.22)" }}
        >
          {/* Header */}
          <div className="px-6 pt-6 pb-4 flex items-center justify-between" style={{ borderBottom: "1px solid hsl(220 12% 91%)" }}>
            <div>
              <p className="font-body text-[11px] tracking-[0.26em] uppercase font-semibold mb-0.5" style={{ color: GOLD }}>Live Previews</p>
              <h3 className="font-display font-bold text-xl" style={{ color: "hsl(220 20% 12%)" }}>Choose a template to preview</h3>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:bg-black/8 active:scale-95 font-body text-lg leading-none"
              style={{ color: "hsl(220 10% 50%)" }}
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
    <Seo
      title="Wed4Love — Cinematic Digital Wedding Invitations"
      description="Send a cinematic digital wedding invitation — shared in a single link. 3D envelope reveal, live RSVP tracking, guest dashboard. Set up in 10 minutes."
      path="/"
      structuredData={LANDING_FAQ_SCHEMA}
    />
    <Nav />
    <Hero />
    <OurDifference />
    <Testimonials />
    <NoLimitsBanner />
    <Comparison />
    <StatsBar />
    <Templates />
    <HowItWorks />
    <FeatureRows />
    <PricingTeaser />
    <FAQ />
    <FinalCTA />
    <Footer />
    <ScarcityBar />
  </div>
  );
};

export default Landing;
