import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Play } from "lucide-react";
import gardenRoseThumbnail  from "@/assets/garden-rose-thumbnail.png";
import rusticBloomThumbnail from "@/assets/rustic-bloom-thumbnail.png";
import heritageThumbnail    from "@/assets/taj-mahal-thumbnail.jpg";
import goldenHourThumbnail  from "@/assets/photo1.jpg";
import softLoveThumbnail    from "@/assets/photo2.jpg";

const GOLD_GRAD = "linear-gradient(135deg, hsl(38 72% 44%), hsl(38 80% 52%))";

const TEMPLATES = [
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
    id: "golden-hour",
    name: "Golden Hour",
    description: "Warm sunset hues that capture a forever kind of love.",
    thumb: goldenHourThumbnail,
    previewHref: "/invite/demo-wedding?theme=golden-hour",
    accent: "hsl(32 90% 55%)",
  },
  {
    id: "heritage",
    name: "Heritage",
    description: "Grand architecture, rich tones, and regal sophistication.",
    thumb: heritageThumbnail,
    previewHref: "/invite/demo-wedding?theme=heritage",
    accent: "hsl(20 55% 52%)",
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
  onSelect: () => void;
}

const Card = ({ t, index, delay, height, onSelect }: CardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    className="relative rounded-2xl overflow-hidden group cursor-pointer"
    style={{ height }}
    onClick={onSelect}
  >
    {/* Full-bleed image */}
    <img
      src={t.thumb}
      alt={t.name}
      className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
    />

    {/* Gradient overlay */}
    <div
      className="absolute inset-0"
      style={{
        background:
          "linear-gradient(to bottom, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0.5) 70%, rgba(0,0,0,0.82) 100%)",
      }}
    />

    {/* Number badge — top left */}
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

    {/* Accent dot — top right */}
    <div className="absolute top-3.5 right-3.5 z-10">
      <div
        className="w-2 h-2 rounded-full ring-2 ring-white/20"
        style={{ background: t.accent }}
      />
    </div>

    {/* Bottom content */}
    <div className="absolute bottom-0 inset-x-0 z-10 p-4">
      <p className="font-display font-bold text-white text-base leading-tight mb-1">
        {t.name}
      </p>
      <p
        className="font-body text-xs leading-snug mb-3"
        style={{ color: "rgba(255,255,255,0.62)" }}
      >
        {t.description}
      </p>

      <div className="flex gap-2">
        <button
          onClick={e => {
            e.stopPropagation();
            window.open(t.previewHref, "_blank");
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-body text-xs font-semibold transition-all hover:scale-105 active:scale-95"
          style={{
            background: "rgba(255,255,255,0.14)",
            backdropFilter: "blur(6px)",
            color: "white",
            border: "1px solid rgba(255,255,255,0.22)",
          }}
        >
          <Play className="w-2.5 h-2.5" />
          View demo
        </button>
        <button
          onClick={e => {
            e.stopPropagation();
            onSelect();
          }}
          className="flex-1 py-1.5 rounded-lg font-body text-xs font-semibold transition-all hover:opacity-90 hover:scale-[1.02] active:scale-95"
          style={{ background: GOLD_GRAD, color: "white" }}
        >
          Select
        </button>
      </div>
    </div>
  </motion.div>
);

const ChooseTemplate = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const plan = params.get("plan") ?? "starter";

  const handleSelect = (id: string) =>
    navigate(`/create-invite?plan=${plan}&template=${id}`);

  const top3 = TEMPLATES.slice(0, 3);
  const bot2 = TEMPLATES.slice(3);

  return (
    <div className="min-h-screen gradient-blush relative px-4 py-16 sm:py-20">
      <button
        onClick={() => navigate(-1)}
        className="fixed top-6 left-6 inline-flex items-center gap-1.5 font-body text-sm text-muted-foreground hover:text-foreground transition-colors z-10"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="text-center pt-8 sm:pt-12 mb-10"
        >
          <p className="font-display text-base sm:text-lg text-primary mb-1">
            Digital Wedding Invitation
          </p>
          <h2 className="font-display text-xl sm:text-3xl font-bold text-foreground mb-2">
            Choose a Template
          </h2>
          <p className="font-body text-sm text-muted-foreground mb-5">
            Each theme is designed to tell your love story
          </p>
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-body text-xs font-semibold"
            style={{
              background: "hsl(38 60% 92%)",
              color: "hsl(38 72% 44%)",
              border: "1.5px solid hsl(38 55% 76%)",
            }}
          >
            5 templates available
          </div>
        </motion.div>

        {/* Top row — 3 taller cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          {top3.map((t, i) => (
            <Card
              key={t.id}
              t={t}
              index={i}
              delay={0.08 + i * 0.09}
              height={400}
              onSelect={() => handleSelect(t.id)}
            />
          ))}
        </div>

        {/* Bottom row — 2 slightly shorter cards, centered */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:max-w-[66%] mx-auto">
          {bot2.map((t, i) => (
            <Card
              key={t.id}
              t={t}
              index={3 + i}
              delay={0.35 + i * 0.09}
              height={340}
              onSelect={() => handleSelect(t.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChooseTemplate;
