import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Seo } from "@/components/Seo";
import gardenRoseThumbnail   from "@/assets/garden-rose-thumbnail.png";
import rusticBloomThumbnail  from "@/assets/rustic-bloom-thumbnail.png";
import goldenHourThumbnail   from "@/assets/golden-hour-thumbnail.png";
import midnightLuxeThumbnail from "@/assets/midnight-luxe-thumbnail.png";
import softLoveThumbnail     from "@/assets/soft-love-thumbnail.jpg";

const GOLD = "hsl(38 72% 44%)";

const DEMO_THEMES = [
  { src: goldenHourThumbnail,   name: "Golden Hour",   tag: "Warm · Sunset",      theme: "golden-hour",   accent: "hsl(32 90% 55%)"  },
  { src: gardenRoseThumbnail,   name: "Garden Rose",   tag: "Romantic · Floral",  theme: "garden-rose",   accent: "hsl(340 65% 52%)" },
  { src: rusticBloomThumbnail,  name: "Rustic Bloom",  tag: "Earthy · Botanical", theme: "rustic-bloom",  accent: "hsl(95 35% 48%)"  },
  { src: midnightLuxeThumbnail, name: "Midnight Luxe", tag: "Dark · Opulent",     theme: "midnight-luxe", accent: "hsl(45 72% 54%)"  },
  { src: softLoveThumbnail,     name: "Soft Love",     tag: "Intimate · Pastel",  theme: "soft-love",     accent: "hsl(355 58% 58%)" },
];

export default function Demo() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen px-5 py-10"
      style={{ background: "linear-gradient(155deg, hsl(42 80% 97%) 0%, hsl(350 50% 96%) 50%, hsl(38 60% 95%) 100%)" }}
    >
      <Seo
        title="See a Live Demo — Wed4Love Wedding Invitation Templates"
        description="Preview real Wed4Love wedding invitations across five signature aesthetics: Golden Hour, Garden Rose, Midnight Luxe, Rustic Bloom, and Soft Love."
        path="/demo"
      />
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 mb-8 font-body text-sm font-semibold transition-opacity hover:opacity-60"
        style={{ color: "hsl(30 12% 48%)" }}
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <p
            className="font-body text-[10px] tracking-[0.32em] uppercase font-semibold mb-3"
            style={{ color: GOLD }}
          >
            Live Previews
          </p>
          <h1
            className="font-display font-bold mb-3"
            style={{ fontSize: "clamp(1.6rem, 5vw, 2.4rem)", color: "hsl(30 20% 14%)" }}
          >
            Choose a template to preview
          </h1>
          <p className="font-body text-sm" style={{ color: "hsl(30 12% 48%)" }}>
            See exactly how your wedding invitation will look and feel.
          </p>
        </div>

        {/* Template grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {DEMO_THEMES.map((t, i) => (
            <motion.div
              key={t.theme}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                to={`/invite/demo-wedding?theme=${t.theme}`}
                className="relative rounded-2xl overflow-hidden group cursor-pointer block"
                style={{
                  aspectRatio: "9/13",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.10)",
                  border: "1.5px solid hsl(38 40% 88%)",
                }}
              >
                <img
                  src={t.src}
                  alt={t.name}
                  className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.78) 100%)" }}
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
              </Link>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="font-body text-sm mb-4" style={{ color: "hsl(30 12% 48%)" }}>
            Ready to create yours?
          </p>
          <a
            href="/choose-template"
            className="inline-block px-8 py-3.5 rounded-2xl font-body text-sm font-bold text-white transition-opacity hover:opacity-90"
            style={{
              background: `linear-gradient(135deg, ${GOLD}, hsl(38 80% 52%))`,
              boxShadow: "0 6px 24px hsl(38 72% 44% / 0.28)",
            }}
          >
            Create Your Invitation
          </a>
        </div>
      </div>
    </div>
  );
}
