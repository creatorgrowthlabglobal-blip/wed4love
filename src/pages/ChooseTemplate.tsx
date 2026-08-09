import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Play, Lock, Zap, Crown, Palette, Video, Sparkles, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import gardenRoseThumbnail  from "@/assets/garden-rose-thumbnail.png";
import rusticBloomThumbnail from "@/assets/rustic-bloom-thumbnail.png";
import midnightLuxeThumbnail from "@/assets/midnight-luxe-thumbnail.png";
import goldenHourThumbnail  from "@/assets/golden-hour-thumbnail.png";
import softLoveThumbnail    from "@/assets/soft-love-thumbnail.jpg";
import { useInviteEntitlement, hasInviteAccess } from "@/hooks/useInviteEntitlement";
import { useAuth } from "@/hooks/useAuth";

const GOLD      = "hsl(38 72% 44%)";
const GOLD_GRAD = "linear-gradient(135deg, hsl(38 72% 44%), hsl(38 80% 52%))";

const TEMPLATES = [
  {
    id: "golden-hour",
    name: "Golden Hour",
    description: "Warm sunset hues that capture a forever kind of love.",
    thumb: goldenHourThumbnail,
    previewHref: "/invite/demo-wedding?theme=golden-hour",
    accent: "hsl(32 90% 55%)",
  },
  {
    id: "garden-rose",
    name: "Garden Rose",
    description: "Romantic florals, soft blush tones, and timeless elegance.",
    thumb: gardenRoseThumbnail,
    previewHref: "/invite/demo-wedding?theme=garden-rose",
    accent: "hsl(340 65% 52%)",
  },
  {
    id: "rustic-bloom",
    name: "Rustic Bloom",
    description: "Earthy botanicals and warm textures for a natural celebration.",
    thumb: rusticBloomThumbnail,
    previewHref: "/invite/demo-wedding?theme=rustic-bloom",
    accent: "hsl(95 35% 48%)",
  },
  {
    id: "midnight-luxe",
    name: "Midnight Luxe",
    description: "Dark opulence, crystal chandeliers, and candlelit grandeur.",
    thumb: midnightLuxeThumbnail,
    previewHref: "/invite/demo-wedding?theme=midnight-luxe",
    accent: "hsl(45 72% 54%)",
  },
  {
    id: "soft-love",
    name: "Soft Love",
    description: "Intimate moments, handwritten notes, and petal-soft warmth.",
    thumb: softLoveThumbnail,
    previewHref: "/invite/demo-wedding?theme=soft-love",
    accent: "hsl(355 58% 58%)",
  },
];

interface CardProps {
  t: (typeof TEMPLATES)[0];
  index: number;
  delay: number;
  height: number;
  locked: boolean;
  onSelect: () => void;
}

const Card = ({ t, index, delay, height, locked, onSelect }: CardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    className="relative rounded-2xl overflow-hidden group"
    style={{ height, cursor: locked ? "default" : "pointer" }}
    onClick={locked ? undefined : onSelect}
  >
    <img
      src={t.thumb}
      alt={t.name}
      className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
      style={{ filter: locked ? "brightness(0.45)" : undefined }}
    />

    <div
      className="absolute inset-0"
      style={{
        background: locked
          ? "rgba(0,0,0,0.35)"
          : "linear-gradient(to bottom, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0.5) 70%, rgba(0,0,0,0.82) 100%)",
      }}
    />

    {/* Number badge */}
    <div className="absolute top-3 left-3 z-10">
      <span
        className="flex items-center justify-center w-7 h-7 rounded-full font-body text-[11px] font-bold"
        style={{
          background: "rgba(0,0,0,0.38)",
          backdropFilter: "blur(8px)",
          color: "rgba(255,255,255,0.9)",
          border: "1px solid rgba(255,255,255,0.18)",
        }}
      >
        {String(index + 1).padStart(2, "0")}
      </span>
    </div>

    {/* Accent dot or lock icon — top right */}
    <div className="absolute top-3 right-3 z-10">
      {locked ? (
        <div
          className="flex items-center gap-1 px-2 py-1 rounded-full font-body text-[10px] font-bold"
          style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)", color: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.15)" }}
        >
          <Lock className="w-2.5 h-2.5" /> Premium
        </div>
      ) : (
        <div className="w-2 h-2 rounded-full ring-2 ring-white/20" style={{ background: t.accent }} />
      )}
    </div>

    {/* Bottom content */}
    {locked ? (
      <div className="absolute bottom-0 inset-x-0 z-10 p-4">
        <p className="font-display font-bold text-white text-base leading-tight mb-1">{t.name}</p>
        <p className="font-body text-xs leading-snug mb-3" style={{ color: "rgba(255,255,255,0.62)" }}>
          {t.description}
        </p>
        <div className="flex gap-2">
          <button
            onClick={e => { e.stopPropagation(); window.open(t.previewHref, "_blank"); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-body text-xs font-semibold transition-all hover:scale-105 active:scale-95"
            style={{ background: "rgba(255,255,255,0.14)", backdropFilter: "blur(6px)", color: "white", border: "1px solid rgba(255,255,255,0.22)" }}
          >
            <Play className="w-2.5 h-2.5" /> View demo
          </button>
          <Link
            to="/pricing"
            onClick={e => e.stopPropagation()}
            className="flex-1 py-1.5 rounded-lg font-body text-xs font-semibold text-center transition-all hover:opacity-90 active:scale-95"
            style={{ background: GOLD_GRAD, color: "white" }}
          >
            Unlock →
          </Link>
        </div>
      </div>
    ) : (
      <div className="absolute bottom-0 inset-x-0 z-10 p-4">
        <p className="font-display font-bold text-white text-base leading-tight mb-1">{t.name}</p>
        <p className="font-body text-xs leading-snug mb-3" style={{ color: "rgba(255,255,255,0.62)" }}>
          {t.description}
        </p>
        <div className="flex gap-2">
          <button
            onClick={e => { e.stopPropagation(); window.open(t.previewHref, "_blank"); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-body text-xs font-semibold transition-all hover:scale-105 active:scale-95"
            style={{ background: "rgba(255,255,255,0.14)", backdropFilter: "blur(6px)", color: "white", border: "1px solid rgba(255,255,255,0.22)" }}
          >
            <Play className="w-2.5 h-2.5" /> View demo
          </button>
          <button
            onClick={e => { e.stopPropagation(); onSelect(); }}
            className="flex-1 py-1.5 rounded-lg font-body text-xs font-semibold transition-all hover:opacity-90 hover:scale-[1.02] active:scale-95"
            style={{ background: GOLD_GRAD, color: "white" }}
          >
            Select
          </button>
        </div>
      </div>
    )}
  </motion.div>
);

const CustomTemplateCard = ({ plan, onSelect }: { plan: string; onSelect: () => void }) => {
  const isCustomPlan = plan === "custom";

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative rounded-2xl overflow-hidden mt-4"
      style={{ height: 220, cursor: isCustomPlan ? "pointer" : "default" }}
      onClick={isCustomPlan ? onSelect : undefined}
    >
      {/* Gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: isCustomPlan
            ? "linear-gradient(135deg, hsl(32 52% 18%) 0%, hsl(38 60% 22%) 40%, hsl(28 48% 16%) 100%)"
            : "linear-gradient(135deg, hsl(30 15% 20%) 0%, hsl(30 12% 16%) 100%)",
        }}
      />

      {/* Decorative shimmer blobs */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, hsl(38 72% 44% / 0.18) 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
      <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, hsl(38 80% 52% / 0.12) 0%, transparent 70%)", transform: "translate(-20%, 30%)" }} />

      {/* Top-left badge */}
      <div className="absolute top-4 left-4 z-10">
        <span
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-body text-[10px] font-bold uppercase tracking-wider"
          style={{ background: GOLD_GRAD, color: "white", boxShadow: "0 2px 10px hsl(38 80% 50% / 0.4)" }}
        >
          <Crown className="w-3 h-3" /> Custom Plan Only
        </span>
      </div>

      {/* Top-right lock */}
      {!isCustomPlan && (
        <div className="absolute top-4 right-4 z-10">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full font-body text-[10px] font-bold"
            style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.15)" }}>
            <Lock className="w-2.5 h-2.5" /> Locked
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="absolute inset-0 z-10 flex items-center px-8 gap-10">

        {/* Left: text */}
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-white text-xl mb-2">Your Invitation, Your Way</p>
          <p className="font-body text-sm mb-4" style={{ color: "rgba(255,255,255,0.58)" }}>
            Bring your own video, choose every color, customize every line of text. Built exclusively for you by our design team.
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { icon: Video, label: "Own background video" },
              { icon: Palette, label: "Custom colors & fonts" },
              { icon: Sparkles, label: "Fully custom layout" },
            ].map(({ icon: Icon, label }) => (
              <span key={label} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-body text-[10px] font-semibold"
                style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.12)" }}>
                <Icon className="w-2.5 h-2.5" /> {label}
              </span>
            ))}
          </div>
        </div>

        {/* Right: CTA */}
        <div className="shrink-0">
          {isCustomPlan ? (
            <button
              onClick={e => { e.stopPropagation(); onSelect(); }}
              className="px-7 py-3 rounded-xl font-body text-sm font-bold transition-all hover:scale-105 active:scale-95"
              style={{ background: GOLD_GRAD, color: "white", boxShadow: "0 6px 20px hsl(38 80% 50% / 0.45)" }}
            >
              Start Building →
            </button>
          ) : (
            <div className="text-center">
              <p className="font-body text-xs mb-3" style={{ color: "rgba(255,255,255,0.45)" }}>
                Custom plan · $399
              </p>
              <Link
                to="/pricing"
                onClick={e => e.stopPropagation()}
                className="px-6 py-2.5 rounded-xl font-body text-xs font-bold transition-all hover:scale-105 active:scale-95 inline-block"
                style={{ background: GOLD_GRAD, color: "white", boxShadow: "0 4px 14px hsl(38 80% 50% / 0.4)" }}
              >
                Upgrade to Custom →
              </Link>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const ChooseTemplate = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const plan = params.get("plan") ?? "starter";
  const justPaid = params.get("paid") === "true";
  const isStarterOnly = plan === "starter";
  const isBypassUser = user?.email?.toLowerCase() === "lala@gmail.com";

  // Poll when coming straight from Whop (webhook may not have fired yet)
  const { plan: userPlan, loading, timeout } = useInviteEntitlement(justPaid);
  const hasAccess = isBypassUser || hasInviteAccess(userPlan, plan);

  const handleSelect = (id: string) => {
    if (!user) { navigate(`/login?next=/create-invite?plan=${plan}%26template=${id}`); return; }
    navigate(`/create-invite?plan=${plan}&template=${id}`);
  };

  // ── Verifying payment (polling state) ────────────────────────────────────
  if (justPaid && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6"
        style={{ background: "linear-gradient(155deg, hsl(42 60% 98%), hsl(350 40% 97%) 60%, hsl(225 30% 97%))" }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-sm"
        >
          <Loader2 className="w-12 h-12 mx-auto mb-5 animate-spin" style={{ color: GOLD }} />
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">Confirming your payment…</h2>
          <p className="font-body text-sm text-muted-foreground">
            This only takes a moment. Please don't close this tab.
          </p>
        </motion.div>
      </div>
    );
  }

  // ── Payment timeout ───────────────────────────────────────────────────────
  if (justPaid && timeout) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6"
        style={{ background: "linear-gradient(155deg, hsl(42 60% 98%), hsl(350 40% 97%) 60%, hsl(225 30% 97%))" }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-sm"
        >
          <AlertCircle className="w-12 h-12 mx-auto mb-5 text-amber-500" />
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">Taking longer than expected</h2>
          <p className="font-body text-sm text-muted-foreground mb-6">
            Your payment was received but verification is delayed. Please wait a minute then refresh — or contact us and we'll sort it immediately.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 rounded-2xl font-body text-sm font-bold text-white transition-all hover:opacity-90"
              style={{ background: GOLD_GRAD }}
            >
              Try again
            </button>
            <a
              href="mailto:hello@wed4love.com"
              className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
            >
              Contact support
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── No access (direct URL without payment) ───────────────────────────────
  if (!loading && !hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6"
        style={{ background: "linear-gradient(155deg, hsl(42 60% 98%), hsl(350 40% 97%) 60%, hsl(225 30% 97%))" }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-sm"
        >
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: GOLD_GRAD }}>
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">Access required</h2>
          <p className="font-body text-sm text-muted-foreground mb-6">
            Choose a plan to start building your wedding invitation.
          </p>
          <Link
            to="/pricing"
            className="inline-block w-full py-3 rounded-2xl font-body text-sm font-bold text-white text-center transition-all hover:opacity-90"
            style={{ background: GOLD_GRAD }}
          >
            View Plans →
          </Link>
        </motion.div>
      </div>
    );
  }

  const top3 = TEMPLATES.slice(0, 3);
  const bot2 = TEMPLATES.slice(3);

  return (
    <div className="min-h-screen relative px-4 py-16 sm:py-20"
      style={{ background: "linear-gradient(155deg, hsl(42 60% 98%), hsl(350 40% 97%) 60%, hsl(225 30% 97%))" }}
    >
      <button
        onClick={() => navigate(-1)}
        className="fixed top-6 left-6 inline-flex items-center gap-1.5 font-body text-sm text-muted-foreground hover:text-foreground transition-colors z-10"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="text-center pt-8 sm:pt-12 mb-10"
        >
          {justPaid && hasAccess && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-body text-xs font-semibold mb-6"
              style={{ background: "hsl(142 50% 94%)", color: "hsl(142 50% 30%)", border: "1.5px solid hsl(142 50% 78%)" }}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Payment confirmed — you're all set!
            </motion.div>
          )}
          <p className="font-body text-[11px] tracking-[0.28em] uppercase font-semibold mb-3" style={{ color: GOLD }}>
            Digital Wedding Invitation
          </p>
          <h2 className="font-display text-xl sm:text-3xl font-bold text-foreground mb-2">
            Choose a Template
          </h2>
          <p className="font-body text-sm text-muted-foreground mb-5">
            Each theme is designed to tell your love story
          </p>

          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-body text-xs font-semibold"
            style={{ background: "hsl(38 60% 92%)", color: GOLD, border: "1.5px solid hsl(38 55% 78%)" }}
          >
            {isStarterOnly ? (
              <>
                <Lock className="w-3 h-3" />
                Starter — 2 of 5 unlocked ·{" "}
                <Link to="/pricing" className="underline underline-offset-2 hover:opacity-70">Upgrade</Link>
              </>
            ) : plan === "premium" ? (
              <>
                <Zap className="w-3 h-3" />
                Premium — 5 of 5 unlocked · Custom template requires Custom plan
              </>
            ) : (
              <>
                <Crown className="w-3 h-3" />
                Custom plan — all 6 templates unlocked
              </>
            )}
          </motion.div>
        </motion.div>

        {/* Top row — 3 cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          {top3.map((t, i) => (
            <Card
              key={t.id}
              t={t}
              index={i}
              delay={0.08 + i * 0.09}
              height={400}
              locked={isStarterOnly && i >= 2}
              onSelect={() => handleSelect(t.id)}
            />
          ))}
        </div>

        {/* Bottom row — 2 cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:max-w-[66%] mx-auto">
          {bot2.map((t, i) => (
            <Card
              key={t.id}
              t={t}
              index={3 + i}
              delay={0.35 + i * 0.09}
              height={340}
              locked={isStarterOnly}
              onSelect={() => handleSelect(t.id)}
            />
          ))}
        </div>

        {/* Custom template card */}
        <CustomTemplateCard
          plan={plan}
          onSelect={() => handleSelect("custom")}
        />
      </div>
    </div>
  );
};

export default ChooseTemplate;
