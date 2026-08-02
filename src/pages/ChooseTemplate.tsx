import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Play, Sparkles } from "lucide-react";
import gardenRoseThumbnail   from "@/assets/garden-rose-thumbnail.png";
import rusticBloomThumbnail  from "@/assets/rustic-bloom-thumbnail.png";

const GOLD      = "hsl(38 72% 44%)";
const GOLD_GRAD = "linear-gradient(135deg, hsl(38 72% 44%), hsl(38 80% 52%))";

const TEMPLATES = [
  {
    id: "garden-rose",
    name: "Garden Rose",
    subtitle: "Romantic · Floral",
    thumb: gardenRoseThumbnail,
    previewHref: "/invite/demo-wedding?theme=garden-rose",
    tall: true,
    accent: "hsl(340 65% 52%)",
  },
  {
    id: "rustic-bloom",
    name: "Rustic Bloom",
    subtitle: "Earthy · Botanical",
    thumb: rusticBloomThumbnail,
    previewHref: "/invite/demo-wedding?theme=rustic-bloom",
    tall: true,
    accent: "hsl(15 42% 48%)",
  },
];

const Card = ({
  t,
  delay,
  onSelect,
  className = "",
  style = {},
}: {
  t: typeof TEMPLATES[0];
  delay: number;
  onSelect: () => void;
  className?: string;
  style?: React.CSSProperties;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
    className={`relative rounded-2xl overflow-hidden group cursor-pointer ${className}`}
    style={style}
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
        background: "linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.02) 40%, rgba(0,0,0,0.55) 75%, rgba(0,0,0,0.82) 100%)",
      }}
    />

    {/* Top-right badge */}
    <div className="absolute top-3 right-3 z-10">
      <span
        className="flex items-center gap-1 px-2 py-1 rounded-full font-body text-[10px] font-bold uppercase tracking-wider"
        style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)", color: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.15)" }}
      >
        <Sparkles className="w-2.5 h-2.5" />
        Live
      </span>
    </div>

    {/* Bottom content */}
    <div className="absolute bottom-0 inset-x-0 z-10 p-4">
      {/* Accent dot + name */}
      <div className="flex items-center gap-2 mb-0.5">
        <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: t.accent }} />
        <p className="font-display font-bold text-white leading-tight" style={{ fontSize: t.tall ? "1rem" : "0.9rem" }}>
          {t.name}
        </p>
      </div>
      <p className="font-body text-xs mb-3 pl-3.5" style={{ color: "rgba(255,255,255,0.65)" }}>
        {t.subtitle}
      </p>

      {/* Buttons */}
      <div className="flex gap-2">
        <button
          onClick={e => { e.stopPropagation(); window.open(t.previewHref, "_blank"); }}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg font-body text-xs font-semibold transition-all hover:scale-105 active:scale-95"
          style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(6px)", color: "white", border: "1px solid rgba(255,255,255,0.22)" }}
        >
          <Play className="w-2.5 h-2.5" /> Demo
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
  </motion.div>
);

const ChooseTemplate = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const plan     = params.get("plan") ?? "starter";

  const handleSelect = (id: string) =>
    navigate(`/create-invite?plan=${plan}&template=${id}`);


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
            style={{ background: "hsl(38 60% 92%)", color: GOLD, border: `1.5px solid hsl(38 55% 76%)` }}
          >
            2 templates available
          </div>
        </motion.div>

        {/* ── Two equal cards side by side ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ height: "auto" }}>
          {TEMPLATES.map((t, i) => (
            <Card
              key={t.id}
              t={t}
              delay={0.08 + i * 0.1}
              onSelect={() => handleSelect(t.id)}
              style={{ height: 420 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChooseTemplate;
