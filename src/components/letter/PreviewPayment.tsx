import { useState, useEffect, Suspense, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Heart, Lock, Play, X, CreditCard, QrCode } from "lucide-react";
import { filesToBase64 } from "@/lib/letterStorage";
import { supabase } from "@/integrations/supabase/client";
import { getPresetById, getRandomPresetUrl } from "@/lib/musicPresets";

import EnvelopeReveal from "@/components/viewer/EnvelopeReveal";
import FramedScene from "@/components/viewer/FramedScene";
import RealisticMailbox from "@/components/viewer/RealisticMailbox";

interface PreviewPaymentProps {
  letterData: {
    senderName: string;
    receiverName: string;
    letterText: string;
    images: File[];
    selectedMusic: string | null;
    letterType: "love" | "birthday" | null;
  };
  template: "photo" | "purple";
  onTemplateChange: (t: "photo" | "purple") => void;
  onPay: () => void;
  onGCashPay: () => Promise<void>;
  onBack: () => void;
}

type PreviewStage = "mailbox" | "envelope";

const PreviewPayment = ({ letterData, template, onTemplateChange, onPay, onGCashPay, onBack }: PreviewPaymentProps) => {
  const [showPreview, setShowPreview] = useState(false);
  const [showPaymentChoice, setShowPaymentChoice] = useState(false);
  const [previewStage, setPreviewStage] = useState<PreviewStage>("mailbox");
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleGCash = async () => {
    setShowPaymentChoice(false);
    await onGCashPay();
  };

  const handleWhop = () => {
    setShowPaymentChoice(false);
    supabase.functions.invoke("telegram-notify", {
      body: {
        event: "checkout_started",
        data: {
          method: "whop",
          sender: letterData.senderName,
          receiver: letterData.receiverName,
        },
      },
    }).catch(() => {});
    onPay();
  };

  useEffect(() => {
    if (showPreview) {
      filesToBase64(letterData.images).then((images) => {
        setPreviewImages(images);
      });
    }
  }, [showPreview, letterData.images]);

  const randomMusicRef = useRef<string | null>(null);
  const startMusic = () => {
    const preset = getPresetById(letterData.selectedMusic);
    let src = preset?.url;
    if (!src) {
      if (!randomMusicRef.current) randomMusicRef.current = getRandomPresetUrl();
      src = randomMusicRef.current;
    }

    if (!audioRef.current) {
      const audio = new Audio(src);
      audio.loop = true;
      audio.volume = 0.3;
      audioRef.current = audio;
    }

    const audio = audioRef.current;
    if (!audio.paused) return;

    audio.play().catch(() => {
      // Will retry on the next user interaction.
    });
  };

  useEffect(() => {
    if (!showPreview) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
      return;
    }

    const handler = () => {
      startMusic();

      if (audioRef.current && !audioRef.current.paused) {
        window.removeEventListener("pointerdown", handler, true);
        window.removeEventListener("touchstart", handler, true);
        window.removeEventListener("click", handler, true);
        window.removeEventListener("keydown", handler, true);
      }
    };

    window.addEventListener("pointerdown", handler, true);
    window.addEventListener("touchstart", handler, true);
    window.addEventListener("click", handler, true);
    window.addEventListener("keydown", handler, true);

    return () => {
      window.removeEventListener("pointerdown", handler, true);
      window.removeEventListener("touchstart", handler, true);
      window.removeEventListener("click", handler, true);
      window.removeEventListener("keydown", handler, true);
    };
  }, [showPreview, letterData.selectedMusic]);

  const openPreview = () => {
    // Photo template starts at the mailbox; purple skips straight to the envelope
    setPreviewStage(template === "purple" ? "envelope" : "mailbox");
    setShowPreview(true);
  };
  const closePreview = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setShowPreview(false);
  };
  const advancePreview = () => {
    if (previewStage === "mailbox") setPreviewStage("envelope");
    else closePreview();
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto mt-20 sm:mt-24"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4"
          >
            <Eye className="w-3.5 h-3.5 text-primary" />
            <span className="font-body text-sm text-primary tracking-wide">Preview & Pay</span>
          </motion.div>
          <p className="font-display text-xl text-primary mb-1">Behold your creation</p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Your Letter Awaits
          </h2>
          <p className="font-body text-base text-muted-foreground">
            Preview the experience, then send it with love
          </p>
        </div>

        {/* Preview Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="mb-8"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openPreview}
            className="w-full flex items-center justify-center gap-3 px-8 py-5 rounded-2xl font-heading text-lg font-bold transition-all duration-400"
            style={{
              background: "linear-gradient(135deg, hsl(280 50% 90%), hsl(340 80% 85%), hsl(40 90% 80%))",
              color: "#4B2E2E",
              boxShadow: "0 8px 32px rgba(200,80,120,0.15), 0 0 0 1px rgba(212,175,55,0.2)",
            }}
          >
            <Play className="w-5 h-5" />
            Preview Full Experience
          </motion.button>
        </motion.div>

        {/* Payment Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="relative letter-paper rounded-3xl p-6 sm:p-8 text-center shadow-card border border-primary/10 overflow-hidden"
        >
          <div className="absolute inset-0 gradient-romantic opacity-20" />
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-gentle-glow">
              <Heart className="w-6 h-6 text-primary fill-primary/30" />
            </div>
            <p className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-1">$3.99</p>
            <p className="font-body text-base text-muted-foreground mb-6">
              One-time payment · Your letter lives forever
            </p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowPaymentChoice(true)}
              className="btn-glow w-full sm:w-auto px-14 py-4 bg-primary text-primary-foreground font-heading text-lg font-bold rounded-2xl shadow-romantic transition-all duration-400 hover:shadow-glow"
            >
              💳 Pay and Create
            </motion.button>
            <p className="mt-3 font-body text-sm text-muted-foreground flex items-center justify-center gap-1.5">
              <Lock className="w-3 h-3" />
              Secure payment · Instant delivery
            </p>
          </div>
        </motion.div>



        <div className="mt-6 flex justify-start">
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onBack}
            className="px-6 py-3.5 bg-secondary text-secondary-foreground font-heading text-base font-semibold rounded-xl border border-border/50 transition-all duration-300 hover:shadow-card">
            ← Go Back
          </motion.button>
        </div>
      </motion.div>

      {/* Full-screen cinematic preview overlay */}
      <AnimatePresence>
        {showPreview && (
          <div style={{ position: "fixed", inset: 0, zIndex: 100 }}>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closePreview}
              className="fixed top-4 left-4 z-[110] inline-flex items-center gap-1.5 px-4 py-2 rounded-full font-body text-sm font-semibold text-white"
              style={{ background: "rgba(37, 31, 40, 0.78)", boxShadow: "0 8px 24px rgba(37, 31, 40, 0.2)" }}
            >
              ← Go back
            </motion.button>

            {/* Template 1 — full-screen mailbox, no decorative frame */}
            {previewStage === "mailbox" && (
              <motion.div
                key="prev-mailbox"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "radial-gradient(ellipse at 50% 35%, #FDF1F5 0%, #F6DCE5 55%, #EFC9D6 100%)",
                }}
              >
                <Suspense fallback={null}>
                  <RealisticMailbox className="w-full h-full" onContinue={advancePreview} />
                </Suspense>
              </motion.div>
            )}

            {/* Envelope stage — both templates use FramedScene here */}
            {previewStage === "envelope" && (
              <FramedScene key="prev-envelope">
                <EnvelopeReveal
                  receiverName={letterData.receiverName}
                  senderName={letterData.senderName}
                  letterText={letterData.letterText}
                  images={previewImages}
                  onLetterOpen={startMusic}
                  onContinue={closePreview}
                />
              </FramedScene>
            )}
          </div>
        )}
      </AnimatePresence>

      {/* Payment method choice modal */}
      <AnimatePresence>
        {showPaymentChoice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[120] flex items-center justify-center px-4 bg-background/70 backdrop-blur-md"
            onClick={() => setShowPaymentChoice(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md letter-paper rounded-3xl p-6 sm:p-8 shadow-romantic border border-primary/15"
            >
              <button
                onClick={() => setShowPaymentChoice(false)}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-secondary/70 hover:bg-secondary flex items-center justify-center text-foreground/70"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Heart className="w-5 h-5 text-primary fill-primary/30" />
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground mb-1">Choose payment method</h3>
                <p className="font-body text-sm text-muted-foreground">$3.99 · one-time payment</p>
              </div>

              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleWhop}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-primary text-primary-foreground shadow-card text-left transition-all"
                >
                  <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-heading text-base font-bold">Card / Cash App</p>
                    <p className="font-body text-xs opacity-90">Secure checkout via Whop · Instant delivery</p>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGCash}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-secondary border border-border/60 text-foreground text-left transition-all hover:shadow-card"
                >
                  <div className="w-11 h-11 rounded-xl bg-green-500/15 flex items-center justify-center shrink-0">
                    <QrCode className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-heading text-base font-bold">GCash / Bank Transfer 🇵🇭</p>
                    <p className="font-body text-xs text-muted-foreground">For Philippines clients · GCash, bank, or any QR app · ₱248</p>
                  </div>
                </motion.button>
              </div>

              <p className="mt-5 font-body text-xs text-center text-muted-foreground flex items-center justify-center gap-1.5">
                <Lock className="w-3 h-3" />
                Your details are kept private
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </>
  );
};

export default PreviewPayment;
