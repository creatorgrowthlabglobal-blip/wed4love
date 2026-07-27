import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Play } from "lucide-react";
import gardenRoseThumbnail from "@/assets/garden-rose-thumbnail.png";
import rusticBloomThumbnail from "@/assets/rustic-bloom-thumbnail.png";
import midnightLuxeThumbnail from "@/assets/midnight-luxe-thumbnail.png";
import goldenHourThumbnail from "@/assets/golden-hour-thumbnail.png";
import blushRomanceThumbnail from "@/assets/blush-romance-thumbnail.png";

const GOLD      = "hsl(38 72% 44%)";
const GOLD_BG   = "hsl(38 72% 44% / 0.10)";
const GOLD_GRAD = "linear-gradient(135deg, hsl(38 72% 44%), hsl(38 80% 52%))";

// ── Template definitions ──────────────────────────────────────────────────────
const TEMPLATES = [
  {
    id: "garden-rose",
    name: "Garden Rose",
    subtitle: "Romantic · Floral",
    emoji: "🌸",
    bg: "linear-gradient(135deg, hsl(350 70% 95%) 0%, hsl(340 60% 92%) 100%)",
    dot: "hsl(340 65% 52%)",
    line1: "hsl(340 40% 76%)",
    line2: "hsl(340 30% 84%)",
    border: "hsl(340 50% 82%)",
    hoverBorder: "hsl(340 55% 62%)",
    available: true,
    premium: false,
    previewHref: "/invite/demo-wedding?theme=garden-rose",
  },
  {
    id: "rustic-bloom",
    name: "Rustic Bloom",
    subtitle: "Earthy · Botanical",
    emoji: "🌿",
    bg: "linear-gradient(135deg, hsl(36 38% 94%) 0%, hsl(34 32% 90%) 100%)",
    dot: "hsl(15 42% 38%)",
    line1: "hsl(20 35% 62%)",
    line2: "hsl(18 28% 72%)",
    border: "hsl(20 30% 76%)",
    hoverBorder: "hsl(15 40% 50%)",
    available: true,
    premium: true,
    previewHref: "/invite/demo-wedding?theme=rustic-bloom",
  },
  {
    id: "midnight-luxe",
    name: "Midnight Luxe",
    subtitle: "Elegant · Navy",
    emoji: "✨",
    bg: "linear-gradient(135deg, hsl(210 25% 96%) 0%, hsl(210 22% 92%) 100%)",
    dot: "hsl(45 72% 54%)",
    line1: "hsl(220 30% 52%)",
    line2: "hsl(220 22% 66%)",
    border: "hsl(220 28% 76%)",
    hoverBorder: "hsl(220 35% 56%)",
    available: true,
    premium: true,
    previewHref: "/invite/demo-wedding?theme=midnight-luxe",
  },
  {
    id: "golden-hour",
    name: "Golden Hour",
    subtitle: "Warm · Luxurious",
    emoji: "🌅",
    bg: "linear-gradient(135deg, hsl(38 55% 95%) 0%, hsl(36 42% 91%) 100%)",
    dot: "hsl(38 82% 50%)",
    line1: "hsl(32 55% 60%)",
    line2: "hsl(28 42% 72%)",
    border: "hsl(32 45% 76%)",
    hoverBorder: "hsl(38 60% 50%)",
    available: true,
    premium: true,
    previewHref: "/invite/demo-wedding?theme=golden-hour",
  },
  {
    id: "blush-romance",
    name: "Blush Romance",
    subtitle: "Soft · Romantic",
    emoji: "🌹",
    bg: "linear-gradient(135deg, hsl(340 35% 96%) 0%, hsl(340 28% 92%) 100%)",
    dot: "hsl(335 58% 52%)",
    line1: "hsl(330 35% 65%)",
    line2: "hsl(330 25% 76%)",
    border: "hsl(330 30% 80%)",
    hoverBorder: "hsl(335 45% 58%)",
    available: true,
    premium: true,
    previewHref: "/invite/demo-wedding?theme=blush-romance",
  },
];

// ── Thumbnail visual ──────────────────────────────────────────────────────────
const REAL_THUMBS: Record<string, string> = {
  "garden-rose":    gardenRoseThumbnail,
  "rustic-bloom":   rusticBloomThumbnail,
  "midnight-luxe":  midnightLuxeThumbnail,
  "golden-hour":    goldenHourThumbnail,
  "blush-romance":  blushRomanceThumbnail,
};

const Thumbnail = ({ t }: { t: typeof TEMPLATES[0] }) => {
  const realSrc = REAL_THUMBS[t.id];

  if (realSrc) {
    return <img src={realSrc} alt={t.name} className="w-full h-full object-cover object-center" />;
  }

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center gap-2.5 px-6"
      style={{ background: t.bg }}
    >
      <span className="text-3xl select-none">{t.emoji}</span>
      <div className="flex flex-col items-center gap-1.5 w-full">
        <div className="h-1.5 rounded-full w-20 opacity-60" style={{ background: t.dot }} />
        <div className="h-2   rounded-full w-28 opacity-40" style={{ background: t.line1 }} />
        <div className="h-1   rounded-full w-16 opacity-30" style={{ background: t.line2 }} />
        <div className="h-1   rounded-full w-24 opacity-20 mt-0.5" style={{ background: t.line2 }} />
      </div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const ChooseTemplate = () => {
  const [params] = useSearchParams();
  const navigate  = useNavigate();
  const plan      = params.get("plan") ?? "starter";
  const isPremium = plan === "premium";

  const handleSelect = (templateId: string) =>
    navigate(`/create-invite?plan=${plan}&template=${templateId}`);

  return (
    <div
      className="min-h-screen gradient-blush relative px-4 py-16 sm:py-20"
    >
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-6 left-6 inline-flex items-center gap-1.5 font-body text-sm text-muted-foreground hover:text-foreground transition-colors z-10"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="max-w-3xl mx-auto">

        {/* ── Header ────────────────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key="header"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="text-center pt-8 sm:pt-12 mb-8"
          >
            <p className="font-display text-base sm:text-lg text-primary mb-1">
              Digital Wedding Invitation
            </p>
            <h2 className="font-display text-xl sm:text-3xl font-bold text-foreground mb-2">
              Choose a Template
            </h2>
            <p className="font-body text-sm text-muted-foreground mb-5">
              Pick the design and we'll build your invitation together
            </p>

            <div
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-body text-xs font-semibold"
              style={{
                background: "hsl(38 60% 92%)",
                color: GOLD,
                border: `1.5px solid hsl(38 55% 76%)`,
              }}
            >
              5 templates included
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ── Template cards ────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:grid sm:grid-cols-2 gap-3 sm:gap-4">
          {TEMPLATES.map((t, i) => {
            const locked     = false;
            const selectable = true;

            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.07 + i * 0.07, duration: 0.35 }}
                className="rounded-2xl overflow-hidden border-2 bg-background transition-all duration-300 flex flex-col relative"
                style={{
                  borderColor: selectable ? t.border : "hsl(var(--border) / 0.5)",
                }}
                onMouseEnter={e => selectable && (e.currentTarget.style.borderColor = t.hoverBorder)}
                onMouseLeave={e => selectable && (e.currentTarget.style.borderColor = t.border)}
              >
                {/* Full-width thumbnail */}
                <div className="relative w-full aspect-[16/9]">
                  <Thumbnail t={t} />

                </div>

                {/* Card body */}
                <div className="p-4 flex flex-col gap-3 text-left">
                  <div>
                    <p className="font-display text-base font-bold text-foreground">{t.name}</p>
                    <p className="font-display text-xs font-semibold" style={{ color: GOLD }}>
                      {t.subtitle}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {/* Preview button */}
                    <button
                      onClick={() => window.open(t.previewHref, "_blank")}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl font-body text-xs font-semibold transition-colors"
                      style={{ background: GOLD_BG, color: GOLD }}
                    >
                      <Play className="w-3 h-3 shrink-0" /> Preview
                    </button>

                    {/* Select button */}
                    <button
                      disabled={locked}
                      onClick={() => selectable && handleSelect(t.id)}
                      className="flex-1 py-2 rounded-xl font-body text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-35 disabled:cursor-not-allowed"
                      style={{ background: GOLD_GRAD }}
                    >
                      Select
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>


      </div>
    </div>
  );
};

export default ChooseTemplate;
