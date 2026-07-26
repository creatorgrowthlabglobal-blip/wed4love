import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Lock, Eye } from "lucide-react";

const TEMPLATES = [
  {
    id: "garden-rose",
    name: "Garden Rose",
    vibe: "Romantic · Floral",
    preview: {
      bg: "linear-gradient(135deg, hsl(350 70% 95%) 0%, hsl(340 60% 92%) 100%)",
      accent: "hsl(340 65% 52%)",
      line1: "hsl(340 40% 76%)",
      line2: "hsl(340 30% 84%)",
      border: "hsl(340 50% 82%)",
      dot: "hsl(340 65% 52%)",
      floral: "🌸",
    },
    tag: "Available Now",
  },
];

const InviteTemplates = () => {
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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-14"
        >
          <p className="font-body text-[11px] tracking-[0.28em] uppercase font-semibold mb-4" style={{ color: "hsl(38 65% 42%)" }}>
            Digital Invitation
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground leading-tight mb-4">
            Pick your{" "}
            <span className="font-handwritten italic font-normal text-[1.08em]" style={{ color: "hsl(38 72% 44%)" }}>
              template
            </span>
          </h1>
          <p className="font-body text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
            Each template includes a 3D opening reveal, RSVP tracking, countdown timer, and auto-play music.
          </p>
        </motion.div>

        {/* Templates grid */}
        <div className="flex justify-center">
          {TEMPLATES.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
              className="group rounded-3xl overflow-hidden cursor-pointer relative w-full max-w-sm"
              style={{
                border: `1.5px solid ${t.preview.border}`,
                boxShadow: "0 4px 24px hsl(0 0% 0% / 0.06)",
              }}
            >
              {/* Template visual preview */}
              <div
                className="relative h-52 flex flex-col items-center justify-center gap-3 px-8 transition-transform duration-500 group-hover:scale-[1.02]"
                style={{ background: t.preview.bg }}
              >
                {/* Floral / icon */}
                <span className="text-3xl mb-1 select-none">{t.preview.floral}</span>

                {/* Simulated invite content */}
                <div className="flex flex-col items-center gap-2 w-full">
                  <div className="h-1.5 rounded-full w-24 opacity-60" style={{ background: t.preview.dot }} />
                  <div className="h-2 rounded-full w-32 opacity-40" style={{ background: t.preview.line1 }} />
                  <div className="h-1 rounded-full w-20 opacity-30" style={{ background: t.preview.line2 }} />
                  <div className="mt-2 h-1 rounded-full w-28 opacity-25" style={{ background: t.preview.line2 }} />
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "rgba(0,0,0,0.18)", backdropFilter: "blur(2px)" }}>
                  {t.id === "garden-rose" ? (
                    <Link
                      to="/invite/demo-wedding"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-body text-sm font-semibold text-white"
                      style={{ background: "rgba(0,0,0,0.55)" }}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Preview Demo
                    </Link>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-body text-sm font-semibold text-white" style={{ background: "rgba(0,0,0,0.45)" }}>
                      <Lock className="w-3.5 h-3.5" />
                      Coming Soon
                    </div>
                  )}
                </div>

                {/* Tag badge */}
                {t.tag && (
                  <span
                    className="absolute top-3.5 right-3.5 inline-flex items-center px-2.5 py-1 rounded-full font-body text-[10px] font-bold uppercase tracking-wide"
                    style={{ background: "hsl(142 60% 42%)", color: "white" }}
                  >
                    {t.tag}
                  </span>
                )}
              </div>

              {/* Card footer */}
              <div
                className="px-5 py-4 flex items-center justify-between"
                style={{ background: "white", borderTop: `1px solid ${t.preview.border}` }}
              >
                <div>
                  <p className="font-display text-sm font-bold text-foreground">{t.name}</p>
                  <p className="font-body text-[11px] text-muted-foreground mt-0.5">{t.vibe}</p>
                </div>
                <Link
                  to="/invite/demo-wedding"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-body text-[10px] font-bold uppercase tracking-wide border transition-colors hover:bg-primary/10"
                  style={{ color: "hsl(340 70% 52%)", borderColor: "hsl(340 50% 80%)", background: "hsl(350 80% 97%)" }}
                >
                  <Eye className="w-2.5 h-2.5" /> Preview
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default InviteTemplates;
