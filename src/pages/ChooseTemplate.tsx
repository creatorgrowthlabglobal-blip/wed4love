import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Play, Lock } from "lucide-react";
import gardenRoseThumbnail  from "@/assets/garden-rose-thumbnail.png";
import rusticBloomThumbnail from "@/assets/rustic-bloom-thumbnail.png";
import midnightLuxeThumbnail from "@/assets/midnight-luxe-thumbnail.png";
import goldenHourThumbnail  from "@/assets/golden-hour-thumbnail.png";
import softLoveThumbnail    from "@/assets/soft-love-thumbnail.jpg";
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
            to="/choose-template"
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



const ChooseTemplate = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSelect = (id: string) => {
    if (!user) { navigate(`/login`, { state: { from: `/create-invite?template=${id}` } }); return; }
    navigate(`/create-invite?template=${id}`);
  };

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
            All templates unlocked · Build free, pay $49 only when you publish
          </motion.div>
        </motion.div>

        {/* Top row — 3 cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          {top3.map((t, i) => (
            <Card key={t.id} t={t} index={i} delay={0.08 + i * 0.09} height={400} locked={false} onSelect={() => handleSelect(t.id)} />
          ))}
        </div>

        {/* Bottom row — 2 cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:max-w-[66%] mx-auto">
          {bot2.map((t, i) => (
            <Card key={t.id} t={t} index={3 + i} delay={0.35 + i * 0.09} height={340} locked={false} onSelect={() => handleSelect(t.id)} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChooseTemplate;
