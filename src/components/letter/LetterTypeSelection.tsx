import { useState, Suspense } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Play, X, ArrowRight } from "lucide-react";
import RealisticMailbox from "@/components/viewer/RealisticMailbox";
import PurpleMailbox from "@/components/viewer/PurpleMailbox";
import EnvelopeReveal from "@/components/viewer/EnvelopeReveal";
import FramedScene from "@/components/viewer/FramedScene";
import mailboxClosed from "@/assets/mailbox-closed.jpg";

type SubPhase = "type" | "template";
type PreviewStage = "mailbox" | "envelope";

interface LetterTypeSelectionProps {
  onSelect: (type: "love" | "birthday", template: "photo" | "purple") => void;
}

const LetterTypeSelection = ({ onSelect }: LetterTypeSelectionProps) => {
  const [subPhase, setSubPhase] = useState<SubPhase>("type");
  const [previewTemplate, setPreviewTemplate] = useState<"photo" | "purple" | null>(null);
  const [previewStage, setPreviewStage] = useState<PreviewStage>("mailbox");

  const openPreview = (template: "photo" | "purple") => {
    setPreviewTemplate(template);
    setPreviewStage("mailbox");
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

              <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
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
                  <div className="p-3 sm:p-4">
                    <p className="font-display text-sm sm:text-base font-bold text-foreground">Template 1</p>
                    <p className="font-display text-xs sm:text-sm font-semibold text-primary mb-3">Lavender Garden</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openPreview("photo")}
                        className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl bg-primary/10 text-primary font-body text-xs font-semibold hover:bg-primary/20 transition-colors"
                      >
                        <Play className="w-3 h-3" />
                        Preview
                      </button>
                      <button
                        onClick={() => onSelect("love", "photo")}
                        className="flex-1 px-2 py-2 rounded-xl bg-primary text-primary-foreground font-body text-xs font-semibold hover:opacity-90 transition-opacity"
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
                  <div
                    className="aspect-[4/3] relative overflow-hidden"
                    style={{ background: "linear-gradient(180deg,#F2EFE8,#E8DEFF)" }}
                  >
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{ transform: "scale(0.78) translateY(12%)", transformOrigin: "center top" }}
                    >
                      <Suspense fallback={null}>
                        <PurpleMailbox className="w-full h-full" hideCaption />
                      </Suspense>
                    </div>
                  </div>
                  <div className="p-3 sm:p-4">
                    <p className="font-display text-sm sm:text-base font-bold text-foreground">Template 2</p>
                    <p className="font-display text-xs sm:text-sm font-semibold text-primary mb-3">Purple Classic</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openPreview("purple")}
                        className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl bg-primary/10 text-primary font-body text-xs font-semibold hover:bg-primary/20 transition-colors"
                      >
                        <Play className="w-3 h-3" />
                        Preview
                      </button>
                      <button
                        onClick={() => onSelect("love", "purple")}
                        className="flex-1 px-2 py-2 rounded-xl bg-primary text-primary-foreground font-body text-xs font-semibold hover:opacity-90 transition-opacity"
                      >
                        Select
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                onClick={() => setSubPhase("type")}
                className="mt-6 px-4 py-2 font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Go back
              </motion.button>
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

            {previewStage === "envelope" && (
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
