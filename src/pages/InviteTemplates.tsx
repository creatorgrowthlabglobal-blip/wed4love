import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Star, Zap, Flame, Clock } from "lucide-react";

// ── Colours ───────────────────────────────────────────────────────────────────
const GOLD = "hsl(38 72% 44%)";
const GOLD_GRAD = "linear-gradient(135deg, hsl(38 72% 44%), hsl(38 80% 52%))";

// Sale ends 18 h from first visit; persisted in sessionStorage so refresh keeps the same deadline
function getSaleDeadline(): number {
  const key = "w4l_sale_deadline";
  const stored = sessionStorage.getItem(key);
  if (stored) return parseInt(stored, 10);
  const end = Date.now() + 18 * 60 * 60 * 1000;
  sessionStorage.setItem(key, String(end));
  return end;
}

function formatCountdown(ms: number) {
  if (ms <= 0) return { h: "00", m: "00", s: "00" };
  const totalSec = Math.floor(ms / 1000);
  const h = String(Math.floor(totalSec / 3600)).padStart(2, "0");
  const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, "0");
  const s = String(totalSec % 60).padStart(2, "0");
  return { h, m, s };
}

// ── Plans ─────────────────────────────────────────────────────────────────────
const PLANS = [
  {
    id: "starter",
    name: "Starter",
    Icon: Star,
    price: 25,
    originalPrice: null,
    tagline: "Perfect for a single event",
    highlight: false,
    badge: null,
    features: [
      "1 digital invite",
      "Up to 30 guest invites",
      "RSVP tracking (30 responses)",
      "1 template (Garden Rose)",
      "Countdown timer",
      "Venue map",
      "Day program / schedule",
      "Valid for 6 months",
    ],
    disabled: [
      "Photo gallery",
      "Auto-play music",
      "QR code share link",
      "Custom URL slug",
      "Our Story timeline",
    ],
    cta: "Start with Starter",
    href: "/choose-template?plan=starter",
    ctaStyle: {
      background: "white",
      color: GOLD,
      border: `2px solid ${GOLD}`,
    },
  },
  {
    id: "premium",
    name: "Premium",
    Icon: Zap,
    price: 99,
    originalPrice: 149,
    tagline: "Most loved by couples",
    highlight: true,
    badge: "Most Popular",
    features: [
      "1 digital invite",
      "Unlimited guest invites",
      "Unlimited RSVP tracking",
      "All available templates",
      "Countdown timer",
      "Venue map",
      "Day program / schedule",
      "Photo gallery",
      "Auto-play music",
      "QR code share link",
      "Custom URL slug",
      "Our Story timeline",
      "Valid for 1 year",
    ],
    disabled: [],
    cta: "Claim $50 Off →",
    href: "/choose-template?plan=premium",
    ctaStyle: {
      background: GOLD_GRAD,
      color: "white",
      border: "none",
    },
  },
];

// ── Countdown block ───────────────────────────────────────────────────────────
const CountdownBanner = ({ deadline }: { deadline: number }) => {
  const [remaining, setRemaining] = useState(deadline - Date.now());

  useEffect(() => {
    const id = setInterval(() => setRemaining(deadline - Date.now()), 1000);
    return () => clearInterval(id);
  }, [deadline]);

  const { h, m, s } = formatCountdown(remaining);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="flex items-center justify-center gap-2.5 px-5 py-3 rounded-2xl mb-8 max-w-2xl mx-auto w-full"
      style={{ background: "hsl(0 72% 51% / 0.08)", border: "1.5px solid hsl(0 72% 51% / 0.22)" }}
    >
      <Flame className="w-4 h-4 shrink-0" style={{ color: "hsl(0 72% 51%)" }} />
      <p className="font-body text-xs font-semibold" style={{ color: "hsl(0 60% 38%)" }}>
        Launch discount ends in
      </p>
      <div className="flex items-center gap-1">
        {[h, m, s].map((unit, i) => (
          <span key={i} className="flex items-center gap-1">
            <span
              className="font-display text-sm font-bold px-1.5 py-0.5 rounded-lg tabular-nums"
              style={{ background: "hsl(0 72% 51%)", color: "white", minWidth: "2rem", textAlign: "center" }}
            >
              {unit}
            </span>
            {i < 2 && <span className="font-bold text-xs" style={{ color: "hsl(0 60% 38%)" }}>:</span>}
          </span>
        ))}
      </div>
      <Clock className="w-3.5 h-3.5 shrink-0" style={{ color: "hsl(0 60% 48%)" }} />
    </motion.div>
  );
};

// ── Component ─────────────────────────────────────────────────────────────────
const InviteTemplates = () => {
  const [deadline] = useState(getSaleDeadline);

  return (
    <div
      className="min-h-screen flex flex-col px-4 py-16 sm:py-20"
      style={{ background: "linear-gradient(155deg, hsl(42 60% 98%), hsl(350 40% 97%) 60%, hsl(225 30% 97%))" }}
    >
      {/* Back */}
      <Link
        to="/get-started"
        className="fixed top-6 left-6 inline-flex items-center gap-1.5 font-body text-sm text-muted-foreground hover:text-foreground transition-colors z-10"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <div className="w-full max-w-5xl mx-auto">

        {/* ── Header ────────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-8"
        >
          <p className="font-body text-[11px] tracking-[0.28em] uppercase font-semibold mb-4" style={{ color: "hsl(38 65% 42%)" }}>
            Digital Invitation
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground leading-tight mb-4">
            Pick your{" "}
            <span className="font-handwritten italic font-normal text-[1.08em]" style={{ color: "hsl(38 72% 44%)" }}>
              plan
            </span>
          </h1>
          <p className="font-body text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
            Every plan includes a 3D opening reveal, RSVP tracking, countdown timer, and venue map.
          </p>
        </motion.div>

        {/* ── Sale countdown ────────────────────────────────────────────────── */}
        <CountdownBanner deadline={deadline} />

        {/* ── Pricing cards ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-stretch max-w-2xl mx-auto w-full">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.2 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="relative rounded-3xl overflow-hidden flex flex-col h-full"
              style={{
                background: plan.highlight ? "hsl(38 60% 98%)" : "white",
                border: plan.highlight ? `2px solid ${GOLD}` : "1.5px solid hsl(38 28% 90%)",
                boxShadow: plan.highlight
                  ? "0 8px 40px hsl(38 80% 60% / 0.18)"
                  : "0 4px 20px hsl(0 0% 0% / 0.05)",
              }}
            >
              {/* Badge */}
              {plan.badge && (
                <div
                  className="absolute top-0 left-0 right-0 py-1.5 text-center font-body text-[10px] font-bold uppercase tracking-widest"
                  style={{ background: GOLD_GRAD, color: "white" }}
                >
                  {plan.badge}
                </div>
              )}

              <div className="px-6 pb-6 flex flex-col gap-5 flex-1"
                style={{ paddingTop: plan.badge ? "2.75rem" : "1.5rem" }}>

                {/* Plan name */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ background: plan.highlight ? GOLD_GRAD : "hsl(38 30% 94%)" }}
                    >
                      <plan.Icon className="w-4 h-4" style={{ color: plan.highlight ? "white" : GOLD }} />
                    </div>
                    <p className="font-display text-base font-bold text-foreground">{plan.name}</p>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-2 mb-1">
                    {plan.originalPrice && (
                      <span className="font-body text-sm line-through text-muted-foreground">${plan.originalPrice}</span>
                    )}
                    <span className="font-body text-xs text-muted-foreground">$</span>
                    <span
                      className="font-display text-4xl font-bold"
                      style={{ color: plan.highlight ? "hsl(0 60% 44%)" : "hsl(30 20% 18%)" }}
                    >
                      {plan.price}
                    </span>
                    <span className="font-body text-xs text-muted-foreground">one-time</span>
                  </div>

                  {/* Savings pill */}
                  {plan.originalPrice && (
                    <div className="flex items-center gap-2 mt-1.5">
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-body text-[10px] font-bold"
                        style={{ background: "hsl(0 72% 51% / 0.1)", color: "hsl(0 60% 40%)" }}
                      >
                        <Flame className="w-2.5 h-2.5" /> Save $50 — launch price
                      </span>
                    </div>
                  )}

                  <p className="font-body text-[11px] text-muted-foreground mt-2">{plan.tagline}</p>
                </div>

                {/* Features */}
                <ul className="flex flex-col gap-2 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2">
                      <Check
                        className="w-3.5 h-3.5 mt-0.5 shrink-0"
                        style={{ color: plan.highlight ? GOLD : "hsl(142 55% 42%)" }}
                      />
                      <span className="font-body text-xs text-foreground leading-snug">{f}</span>
                    </li>
                  ))}
                  {plan.disabled.map(f => (
                    <li key={f} className="flex items-start gap-2 opacity-35">
                      <div className="w-3.5 h-3.5 mt-0.5 shrink-0 rounded-full border border-muted-foreground/40" />
                      <span className="font-body text-xs text-muted-foreground leading-snug line-through">{f}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  to={plan.href}
                  className="mt-2 w-full py-3 rounded-2xl font-body text-sm font-semibold text-center transition-all duration-200 hover:scale-[1.02] active:scale-[0.97] inline-block"
                  style={{
                    ...plan.ctaStyle,
                    boxShadow: plan.highlight ? "0 6px 20px hsl(38 80% 60% / 0.28)" : "none",
                  }}
                >
                  {plan.cta}
                </Link>

                {/* Upgrade hint under Starter CTA */}
                {!plan.highlight && (
                  <p className="text-center font-body text-[10px] leading-relaxed" style={{ color: "hsl(30 12% 48%)", marginTop: "-0.75rem" }}>
                    Want more later? Upgrade to Premium anytime — just pay the $74 difference.
                  </p>
                )}

                {/* Urgency nudge under Premium CTA */}
                {plan.highlight && (
                  <p className="text-center font-body text-[10px]" style={{ color: "hsl(0 55% 48%)", marginTop: "-0.75rem" }}>
                    ⚡ Price goes back to $149 when timer hits zero
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Footer note ───────────────────────────────────────────────────── */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center font-body text-[11px] text-muted-foreground mt-8"
        >
          All plans include a shareable link · No subscription · Pay once
        </motion.p>

      </div>
    </div>
  );
};

export default InviteTemplates;
