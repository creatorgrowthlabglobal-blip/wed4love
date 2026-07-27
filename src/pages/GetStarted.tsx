import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, ArrowLeft, Check } from "lucide-react";

const PRODUCTS = [
  {
    emoji: "💌",
    type: "Digital Letter",
    subtitle: "Love · Anniversary · Birthday",
    desc: "A keepsake letter with a 3D mailbox reveal, your music, photos, a voice note, and a personal quiz — sent as one link.",
    features: ["3D Mailbox & Paper Reveals", "Custom Music & Voice Notes", "Photos & Video Reactions", "Birthday Edition Included"],
    cta: "Create a Digital Letter",
    href: "/create-letter",
    available: true,
    bg: "linear-gradient(135deg, hsl(350 80% 97%) 0%, hsl(330 60% 95%) 100%)",
    border: "hsl(340 60% 88%)",
    accent: "hsl(340 78% 56%)",
    accentMuted: "hsl(340 50% 72%)",
    iconBg: "hsl(340 80% 92%)",
    btnStyle: {
      background: "linear-gradient(135deg, hsl(340 78% 56%), hsl(340 90% 64%))",
      boxShadow: "0 8px 24px hsl(340 100% 76% / 0.35)",
    },
  },
  {
    emoji: "💍",
    type: "Digital Wedding Invitation",
    subtitle: "Wedding · Engagement · Events",
    desc: "Cinematic wedding & event invites with live RSVP tracking, a countdown timer, 3D animations, and auto-play music.",
    features: ["3D Cinematic Opening Reveal", "Live RSVP + Headcount", "Auto-Play Music & Gallery", "Live Countdown Timer"],
    cta: "Create an Invitation",
    href: "/invite-templates",
    available: true,
    bg: "linear-gradient(135deg, hsl(42 80% 97%) 0%, hsl(35 60% 94%) 100%)",
    border: "hsl(42 55% 82%)",
    accent: "hsl(38 72% 44%)",
    accentMuted: "hsl(38 60% 62%)",
    iconBg: "hsl(42 80% 90%)",
    btnStyle: {
      background: "linear-gradient(135deg, hsl(38 72% 44%), hsl(38 80% 52%))",
      boxShadow: "0 8px 24px hsl(38 80% 60% / 0.30)",
    },
  },
];

const GetStarted = () => {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-16 sm:py-24"
      style={{ background: "linear-gradient(155deg, hsl(30 70% 98%), hsl(350 60% 97%) 60%, hsl(280 40% 97%))" }}
    >
      {/* Back */}
      <Link
        to="/"
        className="fixed top-6 left-6 inline-flex items-center gap-1.5 font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <div className="w-full max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-12"
        >
          <p className="font-body text-[11px] tracking-[0.28em] uppercase text-primary font-semibold mb-5">
            What are you creating today?
          </p>

          {/* Big dual-product headline */}
          <div className="flex items-center justify-center gap-3 sm:gap-5 mb-6 flex-wrap">
            <span className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-foreground leading-none">
              Digital Letter
            </span>
            <span className="font-body text-xl sm:text-2xl text-muted-foreground/40 font-light leading-none">or</span>
            <span className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-foreground leading-none">
              Digital{" "}
              <span className="font-handwritten text-primary italic font-normal">
                Invitation
              </span>
            </span>
          </div>

          <p className="font-body text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
            Pick the one that fits this moment. Each is crafted to leave a lasting impression.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {PRODUCTS.map((p, i) => (
            <motion.div
              key={p.type}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.15 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-3xl p-7 flex flex-col relative"
              style={{
                background: p.bg,
                border: `1.5px solid ${p.border}`,
                boxShadow: "0 6px 28px hsl(0 0% 0% / 0.05)",
                opacity: 1,
              }}
            >

              {/* Icon */}
              <div
                className="rounded-2xl flex items-center justify-center text-2xl mb-5 shrink-0"
                style={{ background: p.iconBg, width: 52, height: 52 }}
              >
                {p.emoji}
              </div>

              {/* Product type — big and clear */}
              <h2 className="font-display text-2xl font-bold text-foreground mb-1 leading-tight">
                {p.type}
              </h2>
              <p className="font-body text-[11px] font-semibold uppercase tracking-[0.18em] mb-4" style={{ color: p.accentMuted }}>
                {p.subtitle}
              </p>

              <p className="font-body text-sm text-muted-foreground leading-relaxed mb-6 flex-1">
                {p.desc}
              </p>

              <ul className="space-y-2 mb-7">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 font-body text-sm text-foreground/70">
                    <Check className="w-3.5 h-3.5 shrink-0" style={{ color: p.accent }} />
                    {f}
                  </li>
                ))}
              </ul>

              {p.available ? (
                <Link
                  to={p.href}
                  className="inline-flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-2xl font-body text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.97]"
                  style={p.btnStyle}
                >
                  {p.cta}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <div
                  className="inline-flex items-center justify-center w-full px-6 py-3.5 rounded-2xl font-body text-sm font-semibold cursor-not-allowed select-none"
                  style={{ background: "hsl(0 0% 90%)", color: "hsl(0 0% 58%)" }}
                >
                  Coming Soon
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GetStarted;
