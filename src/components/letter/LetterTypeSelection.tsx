import { useState, Suspense } from "react";

import { motion, AnimatePresence } from "framer-motion";
import { Heart, Play, X, ArrowRight, Sparkles as SparklesIcon } from "lucide-react";
import TestimonialsMarquee from "@/components/TestimonialsMarquee";
import RealisticMailbox from "@/components/viewer/RealisticMailbox";
import PurpleMailbox from "@/components/viewer/PurpleMailbox";
import EnvelopeReveal from "@/components/viewer/EnvelopeReveal";
import RealisticPaperLetter3D from "@/components/viewer/RealisticPaperLetter3D";
import FramedScene from "@/components/viewer/FramedScene";
import mailboxClosed from "@/assets/mailbox-closed.jpg";
import type { LetterTemplate } from "@/lib/letterStorage";

type SubPhase = "type" | "template";
type PreviewStage = "mailbox" | "envelope";

interface LetterTypeSelectionProps {
  onSelect: (type: "love" | "birthday", template: LetterTemplate) => void;
}

const LetterTypeSelection = ({ onSelect }: LetterTypeSelectionProps) => {
  const [subPhase, setSubPhase] = useState<SubPhase>("template");
  const [previewTemplate, setPreviewTemplate] = useState<LetterTemplate | null>(null);
  const [previewStage, setPreviewStage] = useState<PreviewStage>("mailbox");

  const openPreview = (template: LetterTemplate) => {
    setPreviewTemplate(template);
    // Purple and the 3D paper template each have their own self-contained
    // reveal — they skip the separate "mailbox" stage entirely.
    setPreviewStage(template === "photo" ? "mailbox" : "envelope");
  };

  const closePreview = () => setPreviewTemplate(null);

  const advancePreview = () => {
    if (previewStage === "mailbox") setPreviewStage("envelope");
    else closePreview();
  };

  return (
    <>
      <div className="text-center">
        <AnimatePresence mode="wait">
          {subPhase === "type" && (
            <motion.div
              key="type"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.4 }}
            >
              <p className="font-display text-lg text-primary mb-1">What story will you tell?</p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">
                Create a Love Letter
              </h2>
              <p className="font-body text-sm text-muted-foreground mb-8">
                Every great love story begins with the first word...
              </p>

              <div className="max-w-lg mx-auto">
                <motion.button
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  whileHover={{ x: 6, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSubPhase("template")}
                  className="group relative overflow-hidden rounded-2xl cursor-pointer text-left w-full"
                >
                  <div className="p-5 sm:p-6 rounded-2xl transition-all duration-300 group-hover:shadow-glow" style={{ background: "#ffffff", border: "1px solid hsl(var(--border))", boxShadow: "0 4px 24px -4px hsl(0 20% 20% / 0.06), 0 1px 3px hsl(0 20% 20% / 0.04)" }}>
                    <div className="flex items-center gap-4">
                      <span className="text-3xl sm:text-4xl flex-shrink-0">💌</span>
                      <motion.div
                        className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/15 transition-all duration-300 flex-shrink-0"
                        whileHover={{ rotate: 10 }}
                      >
                        <Heart className="w-5 h-5 text-primary" />
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display text-lg sm:text-xl font-bold text-foreground mb-0.5">
                          Love Letter
                        </h3>
                        <p className="font-body text-xs text-primary/70">Pour your heart out</p>
                        <p className="font-body text-xs text-muted-foreground mt-1 hidden sm:block">
                          Express your deepest feelings to someone who makes your heart skip a beat
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                    </div>
                  </div>
                </motion.button>

              </div>
            </motion.div>
          )}

          {subPhase === "template" && (
            <motion.div
              key="template"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.4 }}
            >
              <p className="font-display text-lg text-primary mb-1">Pick your style</p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">
                Choose a Template
              </h2>
              <p className="font-body text-sm text-muted-foreground mb-8">
                This is how your letter will look when they open it
              </p>

              <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-3xl mx-auto">
                {/* Template 3 — Realistic Paper (Premium), shown first to lead with the flagship design */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0 }}
                  className="rounded-2xl overflow-hidden border-2 border-elegant-gold/50 bg-background relative"
                >
                  <div className="absolute top-2 right-2 z-10 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-elegant-gold/90 text-white font-body text-[9px] font-bold uppercase tracking-wide">
                    <SparklesIcon className="w-2.5 h-2.5" />
                    Premium
                  </div>
                  <div
                    className="aspect-[4/3] flex items-center justify-center"
                    style={{ background: "radial-gradient(ellipse at 50% 40%, #FDF1F5 0%, #F6DCE5 60%, #EFC9D6 100%)" }}
                  >
                    <span className="text-4xl">📜</span>
                  </div>
                  <div className="p-1.5 sm:p-4">
                    <p className="font-display text-sm sm:text-base font-bold text-foreground">Realistic Paper</p>
                    <p className="font-display text-xs sm:text-sm font-semibold text-primary mb-3">Fold-Open 3D</p>
                    <div className="flex flex-col gap-1 sm:flex-row sm:gap-2">
                      <button
                        onClick={() => openPreview("paper3d")}
                        className="w-full sm:flex-1 flex items-center justify-center gap-1 sm:gap-1.5 px-1 sm:px-2 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-primary/10 text-primary font-body text-[10px] sm:text-xs font-semibold hover:bg-primary/20 transition-colors"
                      >
                        <Play className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
                        Preview
                      </button>
                      <button
                        onClick={() => onSelect("love", "paper3d")}
                        className="w-full sm:flex-1 px-1 sm:px-2 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-primary text-primary-foreground font-body text-[10px] sm:text-xs font-semibold hover:opacity-90 transition-opacity"
                      >
                        Select
                      </button>
                    </div>
                  </div>
                </motion.div>

                {/* Template 1 — Lavender Garden */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="rounded-2xl overflow-hidden border-2 border-border/50 bg-background hover:border-primary/40 transition-all duration-300"
                >
                  <div
                    className="aspect-[4/3] bg-cover bg-center"
                    style={{ backgroundImage: `url(${mailboxClosed})` }}
                  />
                  <div className="p-1.5 sm:p-4">
                    <p className="font-display text-sm sm:text-base font-bold text-foreground">3D Mailbox</p>
                    <p className="font-display text-xs sm:text-sm font-semibold text-primary mb-3">Lavender Garden</p>
                    <div className="flex flex-col gap-1 sm:flex-row sm:gap-2">
                      <button
                        onClick={() => openPreview("photo")}
                        className="w-full sm:flex-1 flex items-center justify-center gap-1 sm:gap-1.5 px-1 sm:px-2 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-primary/10 text-primary font-body text-[10px] sm:text-xs font-semibold hover:bg-primary/20 transition-colors"
                      >
                        <Play className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
                        Preview
                      </button>
                      <button
                        onClick={() => onSelect("love", "photo")}
                        className="w-full sm:flex-1 px-1 sm:px-2 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-primary text-primary-foreground font-body text-[10px] sm:text-xs font-semibold hover:opacity-90 transition-opacity"
                      >
                        Select
                      </button>
                    </div>
                  </div>
                </motion.div>

                {/* Template 2 — Purple Classic */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="rounded-2xl overflow-hidden border-2 border-border/50 bg-background hover:border-primary/40 transition-all duration-300"
                >
                  <div className="aspect-[4/3] relative overflow-hidden">
                    <img
                      src="/envelope-thumbnail.png"
                      alt="Premium Envelope preview"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div className="p-1.5 sm:p-4">
                    <p className="font-display text-sm sm:text-base font-bold text-foreground">Premium Envelope</p>
                    <p className="font-display text-xs sm:text-sm font-semibold text-primary mb-3">Rose Classic</p>
                    <div className="flex flex-col gap-1 sm:flex-row sm:gap-2">
                      <button
                        onClick={() => openPreview("purple")}
                        className="w-full sm:flex-1 flex items-center justify-center gap-1 sm:gap-1.5 px-1 sm:px-2 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-primary/10 text-primary font-body text-[10px] sm:text-xs font-semibold hover:bg-primary/20 transition-colors"
                      >
                        <Play className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
                        Preview
                      </button>
                      <button
                        onClick={() => onSelect("love", "purple")}
                        className="w-full sm:flex-1 px-1 sm:px-2 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-primary text-primary-foreground font-body text-[10px] sm:text-xs font-semibold hover:opacity-90 transition-opacity"
                      >
                        Select
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>

              <TestimonialsMarquee className="mt-8" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Full-screen template preview overlay */}
      <AnimatePresence>
        {previewTemplate && (
          <>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closePreview}
              className="fixed top-4 right-4 z-[60] w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: "rgba(37, 31, 40, 0.72)", boxShadow: "0 8px 24px rgba(37, 31, 40, 0.16)" }}
              aria-label="Close preview"
            >
              <X className="w-5 h-5 text-white" />
            </motion.button>

            {previewStage === "mailbox" && previewTemplate === "purple" && (
              <div
                key="prev-mailbox-purple"
                className="fixed inset-0 z-50 flex items-center justify-center"
                style={{ background: "#F2EFE8" }}
              >
                <div className="relative w-[min(560px,90vw)] h-[min(560px,80vh)]">
                  <Suspense fallback={null}>
                    <PurpleMailbox className="w-full h-full" onContinue={advancePreview} />
                  </Suspense>
                </div>
              </div>
            )}
            {previewStage === "mailbox" && previewTemplate !== "purple" && (
              <motion.div
                key="prev-mailbox-photo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                style={{
                  position: "fixed",
                  inset: 0,
                  zIndex: 50,
                  background: "radial-gradient(ellipse at 50% 35%, #FDF1F5 0%, #F6DCE5 55%, #EFC9D6 100%)",
                }}
              >
                <Suspense fallback={null}>
                  <RealisticMailbox className="w-full h-full" onContinue={advancePreview} />
                </Suspense>
              </motion.div>
            )}

            {previewStage === "envelope" && previewTemplate === "paper3d" && (
              <RealisticPaperLetter3D
                receiverName="Someone Special"
                senderName="You"
                letterText="This is how your paper letter will unfold and reveal itself in full 3D."
                onContinue={closePreview}
              />
            )}

            {previewStage === "envelope" && previewTemplate !== "paper3d" && (
              <FramedScene>
                <EnvelopeReveal receiverName="Someone Special" onContinue={closePreview} />
              </FramedScene>
            )}
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default LetterTypeSelection;
