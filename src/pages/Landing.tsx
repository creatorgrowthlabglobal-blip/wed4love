import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles, QrCode, LayoutDashboard, CheckCircle2,
  Play, ArrowRight, ChevronDown, ChevronUp,
  Clock, Heart, Users, Smartphone, Shield, Music2, LogOut, PlusCircle,
} from "lucide-react";
import gardenRoseThumbnail from "@/assets/garden-rose-thumbnail.png";
import rusticBloomThumbnail from "@/assets/rustic-bloom-thumbnail.png";
import heroBg from "@/assets/hero-couple.jpg";
import { useAuth } from "@/hooks/useAuth";

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
          className="absolute right-0 mt-2 w-52 rounded-2xl shadow-xl border bg-white overflow-hidden z-50"
          style={{ borderColor: "hsl(38 40% 90%)" }}
        >
          <div className="px-4 py-3 border-b" style={{ borderColor: "hsl(38 40% 92%)" }}>
            <p className="font-body text-xs font-semibold truncate" style={{ color: "hsl(30 20% 20%)" }}>
              {user?.user_metadata?.full_name || "My Account"}
            </p>
            <p className="font-body text-xs truncate" style={{ color: "hsl(30 12% 55%)" }}>
              {user?.email}
            </p>
          </div>
          <div className="py-1.5">
            <button
              onClick={() => { setOpen(false); navigate("/choose-template"); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 font-body text-sm hover:bg-amber-50 transition-colors text-left"
              style={{ color: "hsl(30 20% 22%)" }}
            >
              <PlusCircle className="w-4 h-4" style={{ color: GOLD }} /> Get Started
            </button>
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

// ── Smart CTA link — /login when logged out, /create-invite when logged in ───
const GetStartedLink = ({ className, style, children }: { className: string; style: React.CSSProperties; children: React.ReactNode }) => {
  const { user } = useAuth();
  return (
    <Link to={user ? "/choose-template" : "/login"} className={className} style={style}>
      {children}
    </Link>
  );
};

// ── Nav ──────────────────────────────────────────────────────────────────────
const Nav = () => {
  const { user, loading } = useAuth();

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
            Invitely
          </span>
        </Link>

        {/* Center Nav — absolutely centered like wish4love */}
        <nav className="hidden sm:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
          <Link
            to="/pricing"
            className="font-body text-sm transition-colors duration-200 hover:opacity-100"
            style={{ color: "hsl(30 12% 48%)" }}
            onMouseEnter={e => (e.currentTarget.style.color = GOLD)}
            onMouseLeave={e => (e.currentTarget.style.color = "hsl(30 12% 48%)")}
          >
            Pricing
          </Link>
          <Link
            to="/invite/demo-wedding?theme=garden-rose"
            target="_blank"
            className="font-body text-sm transition-colors duration-200"
            style={{ color: "hsl(30 12% 48%)" }}
            onMouseEnter={e => (e.currentTarget.style.color = GOLD)}
            onMouseLeave={e => (e.currentTarget.style.color = "hsl(30 12% 48%)")}
          >
            Demo
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3 z-10">
          {!loading && (
            user ? (
              <UserMenu />
            ) : (
              <>
                <Link
                  to="/login"
                  className="font-body text-sm font-medium px-4 py-2 rounded-xl transition-all hover:opacity-70"
                  style={{ color: "hsl(30 18% 38%)" }}
                >
                  Sign In
                </Link>
                <Link
                  to="/login"
                  className="font-body text-sm font-semibold px-5 py-2.5 rounded-xl transition-all hover:opacity-90 active:scale-95"
                  style={{ background: GOLD_GRAD, color: "white", boxShadow: "0 4px 18px hsl(38 80% 55% / 0.28)" }}
                >
                  Get Started
                </Link>
              </>
            )
          )}
        </div>
      </div>
    </motion.header>
  );
};

// ── Hero ─────────────────────────────────────────────────────────────────────
const slideIn = (dir: "left" | "right", delay = 0) => ({
  initial: { opacity: 0, x: dir === "left" ? -70 : 70 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] },
});

const Hero = () => (
  <section
    className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-28 pb-16 overflow-hidden"
  >
    {/* Full-bleed couple photo */}
    <div
      className="absolute inset-0 bg-cover bg-no-repeat"
      style={{ backgroundImage: `url(${heroBg})`, backgroundPosition: "center 60%" }}
    />
    {/* Overlay */}
    <div
      className="absolute inset-0"
      style={{ background: "linear-gradient(to bottom, rgba(5,10,20,0.55) 0%, rgba(5,10,20,0.28) 45%, rgba(5,10,20,0.60) 100%)" }}
    />

    <div className="relative w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

      {/* ── LEFT — slides in from left ── */}
      <motion.div className="text-left" {...slideIn("left", 0.1)}>
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-body text-xs font-semibold mb-6"
          style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "white", backdropFilter: "blur(8px)" }}
        >
          <Sparkles className="w-3 h-3" style={{ color: GOLD_LIGHT }} /> Digital Wedding Invitations · from $25
        </div>

        <h1 className="font-display font-bold leading-tight mb-6 text-white" style={{ fontSize: "clamp(2.4rem, 5vw, 4rem)", textShadow: "0 2px 24px rgba(0,0,0,0.4)" }}>
          Your wedding invitation,{" "}
          <span className="font-handwritten italic font-normal" style={{ color: GOLD_LIGHT, fontSize: "1.08em" }}>
            reimagined
          </span>
        </h1>

        <p className="font-body text-base leading-relaxed mb-10 max-w-md" style={{ color: "rgba(255,255,255,0.82)", textShadow: "0 1px 8px rgba(0,0,0,0.4)" }}>
          Cinematic invitations that open like a movie. Built-in RSVP tracking,
          QR codes, and a host dashboard — shared in a single link, no app required.
        </p>

        <div className="flex flex-col sm:flex-row items-start gap-3">
          <GetStartedLink
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-body text-sm font-bold transition-all hover:scale-[1.03] active:scale-[0.97]"
            style={{ background: GOLD_GRAD, color: "white", boxShadow: "0 8px 30px rgba(0,0,0,0.35)" }}
          >
            Get Started <ArrowRight className="w-4 h-4" />
          </GetStartedLink>
          <Link
            to="/invite/demo-wedding?theme=garden-rose"
            target="_blank"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-body text-sm font-semibold transition-all hover:opacity-80"
            style={{ background: "rgba(255,255,255,0.15)", color: "white", border: "1.5px solid rgba(255,255,255,0.45)", backdropFilter: "blur(8px)" }}
          >
            <Play className="w-3.5 h-3.5" /> Watch Demo
          </Link>
        </div>
      </motion.div>

      {/* ── RIGHT — slides in from right (invite preview card) ── */}
      <motion.div className="hidden lg:flex justify-center" {...slideIn("right", 0.28)}>
        <div
          className="w-full max-w-sm rounded-3xl p-6 space-y-4"
          style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.22)", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}
        >
          {/* Mini invite header */}
          <div className="text-center pb-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.15)" }}>
            <p className="font-body text-xs uppercase tracking-widest mb-1" style={{ color: GOLD_LIGHT }}>Wedding Invitation</p>
            <p className="font-handwritten text-2xl text-white" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.3)" }}>Emily & James</p>
            <p className="font-body text-xs mt-1" style={{ color: "rgba(255,255,255,0.65)" }}>September 14, 2025 · Napa Valley, CA</p>
          </div>

          {/* Feature rows */}
          {[
            { icon: <QrCode className="w-4 h-4" />, label: "QR code sharing", value: "Instant" },
            { icon: <Users className="w-4 h-4" />, label: "RSVP responses", value: "47 / 120" },
            { icon: <LayoutDashboard className="w-4 h-4" />, label: "Host dashboard", value: "Live" },
            { icon: <Smartphone className="w-4 h-4" />, label: "Mobile ready", value: "All devices" },
          ].map(({ icon, label, value }) => (
            <div key={label} className="flex items-center justify-between">
              <div className="flex items-center gap-2.5" style={{ color: "rgba(255,255,255,0.75)" }}>
                <span style={{ color: GOLD_LIGHT }}>{icon}</span>
                <span className="font-body text-sm">{label}</span>
              </div>
              <span className="font-body text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.12)", color: "white" }}>
                {value}
              </span>
            </div>
          ))}

          {/* CTA */}
          <GetStartedLink
            className="block w-full text-center mt-2 py-3 rounded-2xl font-body text-sm font-bold transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: GOLD_GRAD, color: "white", boxShadow: "0 4px 16px rgba(0,0,0,0.25)" }}
          >
            Create yours in 10 min →
          </GetStartedLink>
        </div>
      </motion.div>
    </div>

    {/* Scroll cue */}
    <motion.div
      className="absolute bottom-8 left-1/2 -translate-x-1/2"
      animate={{ y: [0, 8, 0] }}
      transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
      style={{ color: "rgba(255,255,255,0.6)" }}
    >
      <ChevronDown className="w-5 h-5" />
    </motion.div>
  </section>
);

// ── Stats bar ────────────────────────────────────────────────────────────────
const STATS = [
  { value: "3D", label: "Envelope reveal" },
  { value: "2", label: "Cinematic themes" },
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
  { src: gardenRoseThumbnail, name: "Garden Rose", tag: "Romantic · Floral", theme: "garden-rose", accent: "hsl(340 65% 52%)" },
  { src: rusticBloomThumbnail, name: "Rustic Bloom", tag: "Earthy · Botanical", theme: "rustic-bloom", accent: "hsl(15 42% 48%)" },
];

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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {TEMPLATES.map((t, i) => (
          <motion.div key={t.theme} {...fade(0.1 + i * 0.12)}
            className="relative rounded-3xl overflow-hidden group cursor-pointer"
            style={{ height: 440 }}
          >
            <img src={t.src} alt={t.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0"
              style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.02) 35%, rgba(0,0,0,0.6) 70%, rgba(0,0,0,0.85) 100%)" }} />

            {/* Live badge */}
            <div className="absolute top-4 right-4">
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full font-body text-[10px] font-bold uppercase tracking-wider"
                style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)", color: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.15)" }}>
                <Sparkles className="w-2.5 h-2.5" /> Live
              </span>
            </div>

            <div className="absolute bottom-0 inset-x-0 p-5">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: t.accent }} />
                <p className="font-display font-bold text-white text-lg">{t.name}</p>
              </div>
              <p className="font-body text-xs mb-4 pl-4" style={{ color: "rgba(255,255,255,0.6)" }}>{t.tag}</p>
              <div className="flex gap-2">
                <Link to={`/invite/demo-wedding?theme=${t.theme}`} target="_blank"
                  onClick={e => e.stopPropagation()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-body text-xs font-semibold transition-all hover:scale-105"
                  style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(6px)", color: "white", border: "1px solid rgba(255,255,255,0.22)" }}>
                  <Play className="w-2.5 h-2.5" /> Preview
                </Link>
                <Link to={`/choose-template`}
                  className="flex-1 py-2 rounded-xl font-body text-xs font-semibold text-center transition-all hover:opacity-90"
                  style={{ background: GOLD_GRAD, color: "white" }}>
                  Use This Theme
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.p {...fade(0.3)} className="text-center font-body text-xs text-muted-foreground mt-6">
        More themes coming soon — early supporters get access first
      </motion.p>
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
  <section className="py-24 px-4" style={{ background: "hsl(38 45% 95%)" }}>
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

const FeatureRows = () => (
  <section>
    {FEATURE_ROWS.map((f, i) => (
      <div
        key={f.eyebrow}
        className="py-20 px-4"
        style={{ background: i % 2 === 0 ? "hsl(42 35% 97%)" : "white" }}
      >
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center gap-12"
          style={{ flexDirection: i % 2 === 1 ? "row-reverse" : "row" }}>

          {/* Visual placeholder */}
          <motion.div {...fade(0.05)} className="w-full sm:w-1/2 shrink-0">
            <div className="rounded-3xl overflow-hidden flex items-center justify-center"
              style={{
                height: 280,
                background: "hsl(38 55% 93%)",
                border: "1.5px solid hsl(38 40% 86%)",
              }}>
              <f.icon className="w-20 h-20 opacity-20" style={{ color: GOLD }} />
            </div>
          </motion.div>

          {/* Text */}
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
    ))}
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
const PricingTeaser = () => (
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
            { name: "Starter", price: "$25", note: "1 template · 30 RSVPs · 6 months", highlight: false },
            { name: "Premium", price: "$99", note: "All templates · Unlimited RSVPs · 1 year", highlight: true },
          ].map(p => (
            <div key={p.name}
              className="rounded-3xl p-6 text-center"
              style={{
                background: p.highlight ? GOLD_GRAD : "white",
                border: p.highlight ? "none" : "2px solid hsl(38 55% 80%)",
                boxShadow: p.highlight ? "0 8px 32px hsl(38 80% 55% / 0.25)" : "0 4px 16px hsl(38 40% 60% / 0.08)",
              }}>
              <p className="font-display font-bold text-base mb-1" style={{ color: p.highlight ? "white" : GOLD }}>{p.name}</p>
              <p className="font-display font-bold text-4xl mb-2" style={{ color: p.highlight ? "white" : "hsl(30 20% 14%)" }}>{p.price}</p>
              <p className="font-body text-xs" style={{ color: p.highlight ? "rgba(255,255,255,0.8)" : "hsl(30 12% 48%)" }}>
                {p.note}
              </p>
            </div>
          ))}
        </div>

        <Link
          to="/pricing"
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
          <span className="font-display font-bold text-base text-foreground">Invitely</span>
        </div>
        <p className="font-body text-xs text-muted-foreground leading-relaxed mb-4">
          Beautiful digital wedding invitations with live RSVP tracking — shared in one link.
        </p>
        <a
          href="https://instagram.com/invitely_official"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 font-body text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/>
            <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
          </svg>
          @invitely_official
        </a>
      </div>

      {/* Product */}
      <div>
        <p className="font-body text-xs font-bold uppercase tracking-widest text-foreground mb-4">Product</p>
        <ul className="flex flex-col gap-3">
          {[
            { label: "Create an Invitation", to: "/pricing" },
            { label: "How It Works", to: "/#how-it-works" },
            { label: "Pricing", to: "/pricing" },
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
            <a href="https://instagram.com/invitely_official" target="_blank" rel="noopener noreferrer"
              className="font-body text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
              </svg>
              @invitely_official
            </a>
          </li>
          <li>
            <a href="mailto:hello@invitely.app"
              className="font-body text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/>
              </svg>
              hello@invitely.app
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
        <p className="font-body text-xs text-muted-foreground mt-4">© 2026 Invitely</p>
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

// ── Page ──────────────────────────────────────────────────────────────────────
const Landing = () => (
  <div>
    <Nav />
    <Hero />
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

export default Landing;
