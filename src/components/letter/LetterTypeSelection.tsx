import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Play, Sparkles as SparklesIcon, Cake, ArrowLeft, ArrowRight } from "lucide-react";
import RealisticMailbox from "@/components/viewer/RealisticMailbox";
import PurpleMailbox from "@/components/viewer/PurpleMailbox";
import BirthdayMailbox from "@/components/viewer/BirthdayMailbox";
import BirthdayBalloons from "@/components/viewer/BirthdayBalloons";
import EnvelopeReveal from "@/components/viewer/EnvelopeReveal";
import RealisticPaperLetter3D from "@/components/viewer/RealisticPaperLetter3D";
import FramedScene from "@/components/viewer/FramedScene";
import mailboxClosed from "@/assets/mailbox-closed.jpg";
import birthdayMailboxClosed from "@/assets/birthday-mailbox-closed.png";
import type { LetterTemplate } from "@/lib/letterStorage";

type Category = "love" | "birthday" | null;
type PreviewStage = "mailbox" | "birthday-balloons" | "envelope";

interface LetterTypeSelectionProps {
  onSelect: (type: "love" | "birthday", template: LetterTemplate) => void;
}

const LetterTypeSelection = ({ onSelect }: LetterTypeSelectionProps) => {
  const [category, setCategory] = useState<Category>(null);
  const [previewTemplate, setPreviewTemplate] = useState<LetterTemplate | null>(null);
  const [previewStage, setPreviewStage] = useState<PreviewStage>("mailbox");

  // Hide the navbar while a preview is open
  useEffect(() => {
    const header = document.querySelector("header") as HTMLElement | null;
    if (!header) return;
    header.style.display = previewTemplate ? "none" : "";
    return () => { header.style.display = ""; };
  }, [previewTemplate]);

  const openPreview = (template: LetterTemplate) => {
    setPreviewTemplate(template);
    setPreviewStage(template === "purple" || template === "paper3d" ? "envelope" : "mailbox");
  };

  const closePreview = () => setPreviewTemplate(null);

  const advancePreview = () => {
    if (previewStage === "mailbox" && previewTemplate === "birthday") {
      setPreviewStage("birthday-balloons");
    } else if (previewStage === "mailbox") {
      setPreviewStage("envelope");
    } else if (previewStage === "birthday-balloons") {
      return;
    } else {
      closePreview();
    }
  };

  return (
    <>
      <div className="text-center pt-8 sm:pt-12">
        <AnimatePresence mode="wait">

          {/* ── Step 1: Category Selection ── */}
          {category === null && (
            <motion.div
              key="category"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.35 }}
            >
              <p className="font-display text-base sm:text-lg text-primary mb-1">What are you creating?</p>
              <h2 className="font-display text-xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">
                Choose a Letter Type
              </h2>
              <p className="font-body text-sm text-muted-foreground mb-6">
                Pick the occasion and we'll show you the perfect templates
              </p>

              <div className="flex flex-col gap-3 max-w-sm mx-auto w-full">
                {/* Love Letter box */}
                <motion.button
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.07, duration: 0.35 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setCategory("love")}
                  className="group w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 border-primary/25 hover:border-primary/60 text-left transition-all duration-200"
                  style={{ background: "hsl(var(--primary) / 0.06)" }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                    style={{ background: "hsl(var(--primary) / 0.14)" }}
                  >
                    <span className="text-xl">💌</span>
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="font-display text-base font-bold text-foreground">Love Letter</p>
                    <p className="font-body text-xs text-muted-foreground mt-0.5">3D Mailbox · Realistic Paper · Premium Envelope</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-primary opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0" />
                </motion.button>

                {/* Birthday Letter box */}
                <motion.button
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.14, duration: 0.35 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setCategory("birthday")}
                  className="group w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 text-left transition-all duration-200"
                  style={{
                    borderColor: "#D4802A30",
                    background: "#FEF9EE",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#D4802A80")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#D4802A30")}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                    style={{ background: "#FEF3C7" }}
                  >
                    <span className="text-xl">🎂</span>
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="font-display text-base font-bold text-foreground">Birthday Letter</p>
                    <p className="font-body text-xs text-muted-foreground mt-0.5">Balloon pop · Festive reveal · Birthday Exclusive</p>
                  </div>
                  <ArrowRight className="w-4 h-4 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0" style={{ color: "#D4802A" }} />
                </motion.button>
              </div>

            </motion.div>
          )}

          {/* ── Step 2a: Love Letter Templates ── */}
          {category === "love" && (
            <motion.div
              key="love-templates"
              initial={{ opacity: 0, x: 28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -28 }}
              transition={{ duration: 0.35 }}
            >
              {/* Back + heading */}
              <div className="max-w-3xl mx-auto mb-3">
                <button
                  onClick={() => setCategory(null)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-body text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                  style={{ background: "hsl(var(--secondary))" }}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back
                </button>
              </div>
              <div className="flex items-center justify-center gap-2 mb-5 sm:mb-6">
                <Heart className="w-4 h-4 text-primary fill-primary/30" />
                <span className="font-display text-base sm:text-lg font-bold text-foreground">Love Letter</span>
              </div>

              <p className="font-body text-sm text-muted-foreground mb-5 sm:mb-6">
                Choose how your letter will appear when they open it
              </p>

              {/* Template cards — single column on mobile, 3 cols on desktop */}
              <div className="flex flex-col sm:grid sm:grid-cols-3 gap-3 sm:gap-4 max-w-3xl mx-auto">

                {/* 3D Mailbox */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="rounded-2xl overflow-hidden border-2 border-border/50 hover:border-primary/40 bg-background transition-all duration-300 sm:flex-col flex"
                >
                  <div
                    className="w-28 sm:w-auto sm:aspect-[4/3] flex-shrink-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${mailboxClosed})` }}
                  />
                  <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between text-left">
                    <div>
                      <p className="font-display text-sm sm:text-base font-bold text-foreground">3D Mailbox</p>
                      <p className="font-display text-xs font-semibold text-primary mb-2 sm:mb-3">Lavender Garden</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openPreview("photo")}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl font-body text-xs font-semibold transition-colors"
                        style={{ background: "hsl(var(--primary) / 0.10)", color: "hsl(var(--primary))" }}
                      >
                        <Play className="w-3 h-3 shrink-0" /> Preview
                      </button>
                      <button
                        onClick={() => onSelect("love", "photo")}
                        className="flex-1 py-2 rounded-xl font-body text-xs font-semibold text-white hover:opacity-90 transition-opacity"
                        style={{ background: "hsl(var(--primary))" }}
                      >
                        Select
                      </button>
                    </div>
                  </div>
                </motion.div>

                {/* Realistic Paper */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.11 }}
                  className="rounded-2xl overflow-hidden border-2 border-elegant-gold/50 bg-background transition-all duration-300 sm:flex-col flex relative"
                >
                  <div className="absolute top-2 right-2 z-10 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-elegant-gold/90 text-white font-body text-[9px] font-bold uppercase tracking-wide">
                    <SparklesIcon className="w-2.5 h-2.5" />
                    Premium
                  </div>
                  <div
                    className="w-28 sm:w-auto sm:aspect-[4/3] flex-shrink-0 flex items-center justify-center"
                    style={{ background: "radial-gradient(ellipse at 50% 40%, #FDF1F5 0%, #F6DCE5 60%, #EFC9D6 100%)" }}
                  >
                    <span className="text-4xl">📜</span>
                  </div>
                  <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between text-left">
                    <div>
                      <p className="font-display text-sm sm:text-base font-bold text-foreground">Realistic Paper</p>
                      <p className="font-display text-xs font-semibold text-primary mb-2 sm:mb-3">Fold-Open 3D</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openPreview("paper3d")}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl font-body text-xs font-semibold transition-colors"
                        style={{ background: "hsl(var(--primary) / 0.10)", color: "hsl(var(--primary))" }}
                      >
                        <Play className="w-3 h-3 shrink-0" /> Preview
                      </button>
                      <button
                        onClick={() => onSelect("love", "paper3d")}
                        className="flex-1 py-2 rounded-xl font-body text-xs font-semibold text-white hover:opacity-90 transition-opacity"
                        style={{ background: "hsl(var(--primary))" }}
                      >
                        Select
                      </button>
                    </div>
                  </div>
                </motion.div>

                {/* Premium Envelope */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.17 }}
                  className="rounded-2xl overflow-hidden border-2 border-border/50 hover:border-primary/40 bg-background transition-all duration-300 sm:flex-col flex"
                >
                  <img
                    src="/envelope-thumbnail.png"
                    alt="Premium Envelope"
                    className="w-28 sm:w-auto sm:aspect-[4/3] flex-shrink-0 object-cover object-top"
                  />
                  <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between text-left">
                    <div>
                      <p className="font-display text-sm sm:text-base font-bold text-foreground">Premium Envelope</p>
                      <p className="font-display text-xs font-semibold text-primary mb-2 sm:mb-3">Rose Classic</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openPreview("purple")}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl font-body text-xs font-semibold transition-colors"
                        style={{ background: "hsl(var(--primary) / 0.10)", color: "hsl(var(--primary))" }}
                      >
                        <Play className="w-3 h-3 shrink-0" /> Preview
                      </button>
                      <button
                        onClick={() => onSelect("love", "purple")}
                        className="flex-1 py-2 rounded-xl font-body text-xs font-semibold text-white hover:opacity-90 transition-opacity"
                        style={{ background: "hsl(var(--primary))" }}
                      >
                        Select
                      </button>
                    </div>
                  </div>
                </motion.div>

              </div>

            </motion.div>
          )}

          {/* ── Step 2b: Birthday Letter Template ── */}
          {category === "birthday" && (
            <motion.div
              key="birthday-template"
              initial={{ opacity: 0, x: 28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -28 }}
              transition={{ duration: 0.35 }}
            >
              {/* Back + heading */}
              <div className="max-w-lg mx-auto mb-3">
                <button
                  onClick={() => setCategory(null)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-body text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                  style={{ background: "hsl(var(--secondary))" }}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back
                </button>
              </div>
              <div className="flex items-center justify-center gap-2 mb-5 sm:mb-6">
                <Cake className="w-4 h-4" style={{ color: "#D4802A" }} />
                <span className="font-display text-base sm:text-lg font-bold text-foreground">Birthday Letter</span>
              </div>

              <p className="font-body text-sm text-muted-foreground mb-5 sm:mb-6">
                A festive experience made just for birthdays
              </p>

              {/* Birthday card — horizontal on desktop, stacked on mobile */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
                className="max-w-lg mx-auto rounded-2xl overflow-hidden border-2 border-amber-200/60 hover:border-amber-400/60 bg-background transition-all duration-300"
              >
                <div
                  className="w-full aspect-[16/7] bg-cover bg-center"
                  style={{ backgroundImage: `url(${birthdayMailboxClosed})` }}
                />
                <div className="p-4 sm:p-6 text-left">
                  <div className="inline-flex items-center gap-1.5 mb-3 px-2.5 py-1 rounded-full border border-amber-200/70 bg-amber-50">
                    <Cake className="w-3 h-3" style={{ color: "#D4802A" }} />
                    <span className="font-body text-[10px] font-bold uppercase tracking-widest" style={{ color: "#D4802A" }}>
                      Birthday Exclusive
                    </span>
                  </div>
                  <p className="font-display text-lg sm:text-xl font-bold text-foreground mb-1.5">
                    Birthday Mailbox
                  </p>
                  <p className="font-body text-sm text-muted-foreground mb-5 leading-relaxed">
                    A festive mailbox reveal, a balloon pop game, and a heartfelt personal letter — all in one magical birthday experience.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => openPreview("birthday")}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-body text-sm font-semibold transition-colors"
                      style={{ background: "#FEF3C7", color: "#D4802A" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#FDE68A")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "#FEF3C7")}
                    >
                      <Play className="w-3.5 h-3.5" />
                      Preview
                    </button>
                    <button
                      onClick={() => onSelect("birthday", "birthday")}
                      className="flex-1 py-2.5 rounded-xl font-body text-sm font-semibold text-white transition-opacity hover:opacity-90"
                      style={{ background: "#D4802A" }}
                    >
                      Select this Template
                    </button>
                  </div>
                </div>
              </motion.div>

            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ── Full-screen preview overlay ── */}
      <AnimatePresence>
        {previewTemplate && (
          <>
            <motion.button
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              onClick={closePreview}
              className="fixed top-4 left-4 z-[9999] flex items-center gap-2 px-4 py-2.5 rounded-full font-body text-sm font-semibold text-gray-800"
              style={{ background: "#ffffff", boxShadow: "0 2px 12px rgba(0,0,0,0.15)" }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </motion.button>

            {previewStage === "mailbox" && previewTemplate === "purple" && (
              <div
                className="fixed inset-0 z-[200] flex items-center justify-center"
                style={{ background: "#F2EFE8" }}
              >
                <div className="relative w-[min(560px,90vw)] h-[min(560px,80vh)]">
                  <Suspense fallback={null}>
                    <PurpleMailbox className="w-full h-full" onContinue={advancePreview} />
                  </Suspense>
                </div>
              </div>
            )}

            {previewStage === "mailbox" && previewTemplate === "birthday" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                style={{
                  position: "fixed",
                  inset: 0,
                  zIndex: 200,
                  background: "radial-gradient(ellipse at 50% 35%, #FFF9E6 0%, #FFF0B3 55%, #FFE082 100%)",
                }}
              >
                <Suspense fallback={null}>
                  <BirthdayMailbox className="w-full h-full" onContinue={advancePreview} />
                </Suspense>
              </motion.div>
            )}

            {previewStage === "mailbox" && previewTemplate !== "purple" && previewTemplate !== "birthday" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                style={{
                  position: "fixed",
                  inset: 0,
                  zIndex: 200,
                  background: "radial-gradient(ellipse at 50% 35%, #FDF1F5 0%, #F6DCE5 55%, #EFC9D6 100%)",
                }}
              >
                <Suspense fallback={null}>
                  <RealisticMailbox className="w-full h-full" onContinue={advancePreview} />
                </Suspense>
              </motion.div>
            )}

            {previewStage === "birthday-balloons" && (
              <BirthdayBalloons
                onComplete={advancePreview}
                letterText="Wishing you a day filled with joy, laughter, and all the things that make you smile. You deserve every bit of happiness this world has to offer. Here's to you on your special day! 🎂"
                senderName="From the heart"
                receiverName="You"
              />
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
              <FramedScene zIndex={100}>
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
