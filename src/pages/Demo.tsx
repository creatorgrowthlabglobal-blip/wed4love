import { useEffect, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Heart, Mail, Play, Sparkles } from "lucide-react";
import { Seo } from "@/components/Seo";
import gardenRoseThumbnail   from "@/assets/garden-rose-thumbnail.png";
import rusticBloomThumbnail  from "@/assets/rustic-bloom-thumbnail.png";
import goldenHourThumbnail   from "@/assets/golden-hour-thumbnail.png";
import midnightLuxeThumbnail from "@/assets/midnight-luxe-thumbnail.png";
import softLoveThumbnail     from "@/assets/soft-love-thumbnail.jpg";
import mailboxClosed         from "@/assets/mailbox-closed.jpg";
import eleganceMailboxClosed from "@/assets/elegance-mailbox-closed.jpeg";
import seasideMailboxClosed  from "@/assets/seaside-mailbox-closed.jpeg";
import letterFrame           from "@/assets/letter-frame.webp";
import { seedDemoLetter } from "@/lib/demoLetters";
import type { LetterTemplate } from "@/lib/letterStorage";

const GOLD = "hsl(38 72% 44%)";
const GOLD_GRAD = "linear-gradient(135deg, hsl(38 72% 44%), hsl(38 80% 52%))";
const ROSE = "hsl(340 65% 52%)";
const ROSE_GRAD = "linear-gradient(135deg, hsl(340 65% 52%), hsl(340 60% 62%))";

const INVITE_THEMES = [
  { src: goldenHourThumbnail,   name: "Golden Hour",   tag: "Warm · Sunset",      theme: "golden-hour",   accent: "hsl(32 90% 55%)"  },
  { src: gardenRoseThumbnail,   name: "Garden Rose",   tag: "Romantic · Floral",  theme: "garden-rose",   accent: "hsl(340 65% 52%)" },
  { src: rusticBloomThumbnail,  name: "Rustic Bloom",  tag: "Earthy · Botanical", theme: "rustic-bloom",  accent: "hsl(95 35% 48%)"  },
  { src: midnightLuxeThumbnail, name: "Midnight Luxe", tag: "Dark · Opulent",     theme: "midnight-luxe", accent: "hsl(45 72% 54%)"  },
  { src: softLoveThumbnail,     name: "Soft Love",     tag: "Intimate · Pastel",  theme: "soft-love",     accent: "hsl(355 58% 58%)" },
];

const LETTER_TEMPLATES: {
  template: LetterTemplate; name: string; tag: string; src: string; accent: string;
}[] = [
  { template: "photo",    name: "3D Mailbox",       tag: "Lavender Garden",  src: mailboxClosed,         accent: "hsl(280 50% 55%)" },
  { template: "elegance", name: "Elegance Arrives", tag: "Rose Garden",      src: eleganceMailboxClosed, accent: "hsl(340 60% 55%)" },
  { template: "seaside",  name: "Seaside Whispers", tag: "Coastal Bronze",   src: seasideMailboxClosed,  accent: "hsl(28 60% 48%)"  },
  { template: "purple",   name: "Premium Envelope", tag: "Rose Classic",     src: letterFrame,           accent: "hsl(340 65% 52%)" },
];

export default function Demo() {
  const navigate = useNavigate();
  const location = useLocation();
  const letterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (location.hash === "#love-letter") {
      letterRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [location.hash]);

  const openLetterDemo = (template: LetterTemplate) => {
    const id = seedDemoLetter(template);
    window.open(`/view/${id}`, "_blank", "noopener");
  };

  return (
    <div
      className="min-h-screen px-5 py-10"
      style={{ background: "linear-gradient(155deg, hsl(42 80% 97%) 0%, hsl(350 50% 96%) 50%, hsl(38 60% 95%) 100%)" }}
    >
      <Seo
        title="See a Live Demo — Wed4Love Love Letters & Wedding Invitations"
        description="Preview real Wed4Love love letters and cinematic wedding invitation templates — no signup needed."
        path="/demo"
      />

      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/"))}
          className="flex items-center gap-1.5 mb-8 font-body text-sm font-semibold transition-opacity hover:opacity-60"
          style={{ color: "hsl(30 12% 48%)" }}
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Page header */}
        <div className="text-center mb-10">
          <p className="font-body text-[10px] tracking-[0.32em] uppercase font-semibold mb-3" style={{ color: GOLD }}>
            Live Previews
          </p>
          <h1 className="font-display font-bold mb-3" style={{ fontSize: "clamp(1.8rem, 5vw, 2.6rem)", color: "hsl(30 20% 14%)" }}>
            See both products in action
          </h1>
          <p className="font-body text-sm sm:text-base max-w-lg mx-auto" style={{ color: "hsl(30 12% 48%)" }}>
            Wed4Love makes two things — a personal <b>love letter</b> and a full <b>wedding invitation</b>.
            Preview each one below.
          </p>

          {/* Anchor jumps so users can scan quickly */}
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <a
              href="#love-letter"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-body text-xs font-bold transition-all hover:scale-[1.03]"
              style={{ background: "white", color: ROSE, border: "1.5px solid hsl(340 45% 84%)" }}
            >
              <Heart className="w-3 h-3" /> Love Letter demos
            </a>
            <a
              href="#wedding-invite"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-body text-xs font-bold transition-all hover:scale-[1.03]"
              style={{ background: "white", color: GOLD, border: "1.5px solid hsl(38 50% 82%)" }}
            >
              <Mail className="w-3 h-3" /> Wedding Invitation demos
            </a>
          </div>
        </div>

        {/* ─── LOVE LETTER SECTION ─── */}
        <section id="love-letter" ref={letterRef} className="scroll-mt-16 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55 }}
            className="rounded-3xl p-6 sm:p-8"
            style={{
              background: "linear-gradient(160deg, hsl(340 60% 97%) 0%, hsl(345 55% 93%) 100%)",
              border: "1.5px solid hsl(340 45% 86%)",
              boxShadow: "0 12px 32px hsl(340 40% 70% / 0.18)",
            }}
          >
            <div className="flex items-start gap-3 mb-6">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: ROSE_GRAD, boxShadow: "0 6px 18px hsl(340 60% 55% / 0.28)" }}
              >
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-body text-[10px] tracking-[0.24em] uppercase font-bold mb-1" style={{ color: "hsl(340 55% 45%)" }}>
                  For one person you love
                </p>
                <h2 className="font-display font-bold text-2xl sm:text-3xl text-foreground">Love Letter demos</h2>
                <p className="font-body text-sm mt-1.5" style={{ color: "hsl(30 12% 48%)" }}>
                  Tap any template to open a sample letter (with fictional names) in a new tab —
                  exactly how yours will look when it arrives.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {LETTER_TEMPLATES.map((t, i) => (
                <motion.button
                  key={t.template}
                  onClick={() => openLetterDemo(t.template)}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  className="relative rounded-2xl overflow-hidden group text-left"
                  style={{
                    background: "white",
                    boxShadow: "0 4px 18px hsl(340 40% 70% / 0.14)",
                    border: "1.5px solid hsl(340 40% 88%)",
                  }}
                >
                  <div className="relative" style={{ aspectRatio: "4/3", overflow: "hidden" }}>
                    <img
                      src={t.src}
                      alt={t.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div
                      className="absolute inset-0"
                      style={{ background: "linear-gradient(to bottom, transparent 55%, rgba(0,0,0,0.55) 100%)" }}
                    />
                  </div>
                  <div className="p-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: t.accent }} />
                      <p className="font-display font-bold text-sm text-foreground leading-tight">{t.name}</p>
                    </div>
                    <p className="font-body text-[10px] pl-3.5" style={{ color: "hsl(30 12% 52%)" }}>{t.tag}</p>
                    <div
                      className="mt-2 py-1.5 rounded-lg font-body text-[11px] font-semibold text-white text-center transition-opacity"
                      style={{ background: ROSE_GRAD }}
                    >
                      <Play className="w-2.5 h-2.5 inline mr-1" /> Open Preview
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            <div className="mt-6 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3"
              style={{ borderTop: "1px solid hsl(340 40% 88%)" }}
            >
              <p className="font-body text-sm text-center sm:text-left" style={{ color: "hsl(30 12% 48%)" }}>
                Love Letters are <b>$7.99</b> per letter — one-time.
              </p>
              <Link
                to="/create-letter"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-body text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: ROSE_GRAD, boxShadow: "0 6px 20px hsl(340 60% 55% / 0.28)" }}
              >
                Write your own <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </section>

        {/* ─── WEDDING INVITATION SECTION ─── */}
        <section id="wedding-invite" className="scroll-mt-16 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55 }}
            className="rounded-3xl p-6 sm:p-8"
            style={{
              background: "linear-gradient(160deg, hsl(42 60% 97%) 0%, hsl(38 55% 91%) 100%)",
              border: "1.5px solid hsl(38 50% 82%)",
              boxShadow: "0 12px 32px hsl(38 45% 65% / 0.18)",
            }}
          >
            <div className="flex items-start gap-3 mb-6">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: GOLD_GRAD, boxShadow: "0 6px 18px hsl(38 80% 55% / 0.28)" }}
              >
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-body text-[10px] tracking-[0.24em] uppercase font-bold mb-1" style={{ color: GOLD }}>
                  For your whole guest list
                </p>
                <h2 className="font-display font-bold text-2xl sm:text-3xl text-foreground">Wedding Invitation demos</h2>
                <p className="font-body text-sm mt-1.5" style={{ color: "hsl(30 12% 48%)" }}>
                  Choose a theme to preview a full wedding invitation — including the 3D envelope reveal and RSVP flow.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {INVITE_THEMES.map((t, i) => (
                <motion.div
                  key={t.theme}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                >
                  <Link
                    to={`/invite/demo-wedding?theme=${t.theme}`}
                    target="_blank"
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

            <div className="mt-6 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3"
              style={{ borderTop: "1px solid hsl(38 40% 86%)" }}
            >
              <p className="font-body text-sm text-center sm:text-left" style={{ color: "hsl(30 12% 48%)" }}>
                Wedding invitations start at <b>$49</b> — one-time.
              </p>
              <Link
                to="/choose-template"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-body text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: GOLD_GRAD, boxShadow: "0 6px 20px hsl(38 80% 55% / 0.28)" }}
              >
                Create yours <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </section>

        <p className="text-center font-body text-xs mt-8" style={{ color: "hsl(30 12% 52%)" }}>
          <Sparkles className="w-3 h-3 inline mr-1" style={{ color: GOLD }} />
          Demos use fictional names and skip payment — the real flow is identical.
        </p>
      </div>
    </div>
  );
}
