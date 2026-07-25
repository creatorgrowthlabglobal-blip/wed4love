import { useState, useEffect, Suspense, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Heart, Lock, Play, X, CreditCard, QrCode } from "lucide-react";
import { filesToBase64 } from "@/lib/letterStorage";
import { supabase } from "@/integrations/supabase/client";
import { getPresetById, getRandomPresetUrl } from "@/lib/musicPresets";
import { getCurrentUser } from "@/lib/auth";
import { useYouTubeAudio } from "@/hooks/useYouTubeAudio";
import { useLocalizedPrice } from "@/hooks/useLocalizedPrice";

import EnvelopeReveal from "@/components/viewer/EnvelopeReveal";
import FramedScene from "@/components/viewer/FramedScene";
import RealisticMailbox from "@/components/viewer/RealisticMailbox";
import RealisticPaperLetter3D from "@/components/viewer/RealisticPaperLetter3D";
import SignupGate from "@/components/letter/SignupGate";
import VoiceRecorder from "@/components/letter/VoiceRecorder";
import UnlockDatePicker from "@/components/letter/UnlockDatePicker";
import type { LetterTemplate } from "@/lib/letterStorage";
import BirthdayMailbox from "@/components/viewer/BirthdayMailbox";
import BirthdayBalloons from "@/components/viewer/BirthdayBalloons";

interface PreviewPaymentProps {
  letterData: {
    senderName: string;
    receiverName: string;
    letterText: string;
    images: File[];
    selectedMusic: string | null;
    youtubeVideoId?: string | null;
    letterType: "love" | "birthday" | null;
  };
  template: LetterTemplate;
  onTemplateChange: (t: LetterTemplate) => void;
  voiceBlob: Blob | null;
  onVoiceChange: (blob: Blob | null) => void;
  unlockAt: string | null;
  onUnlockAtChange: (iso: string | null) => void;
  onPay: () => void;
  onGCashPay: () => void;
  onBack: () => void;
}

type PreviewStage = "mailbox" | "birthday-balloons" | "envelope";

const PreviewPayment = ({ letterData, template, onTemplateChange, voiceBlob, onVoiceChange, unlockAt, onUnlockAtChange, onPay, onGCashPay, onBack }: PreviewPaymentProps) => {
  const [showPreview, setShowPreview] = useState(false);
  const [showPaymentChoice, setShowPaymentChoice] = useState(false);
  const [showSignupGate, setShowSignupGate] = useState(false);
  const [showExitIntent, setShowExitIntent] = useState(false);
  const [saleTimeLeft, setSaleTimeLeft] = useState("");
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const localizedPrice = useLocalizedPrice(9.99);

  const TESTIMONIALS = [
    { initial: "S", name: "Sofia R.", quote: "She cried opening it. Best $5 I ever spent." },
    { initial: "M", name: "Marco T.", quote: "He played the song on repeat for a week. 😭" },
    { initial: "A", name: "Aisha K.", quote: "The mailbox reveal made my girlfriend scream!" },
    { initial: "J", name: "James L.", quote: "Never thought a link could make someone cry this hard." },
    { initial: "P", name: "Priya D.", quote: "He proposed right after opening it. No joke." },
    { initial: "L", name: "Lena W.", quote: "She called me immediately. First time I've heard her cry happy tears." },
    { initial: "C", name: "Carlos M.", quote: "My wife said it's the most romantic thing I've ever done. I agree." },
    { initial: "N", name: "Nina K.", quote: "Opened it at work. Had to hide in the bathroom to ugly cry. 10/10." },
    { initial: "D", name: "Daniel F.", quote: "Worth every penny. She still sends the link to her friends." },
    { initial: "R", name: "Rhea S.", quote: "The music started and he just froze. I'll never forget that moment." },
    { initial: "T", name: "Theo B.", quote: "She said it was better than any gift I've given in 6 years together." },
    { initial: "Y", name: "Yuki O.", quote: "Long distance relationship — this made her feel like I was right there." },
    { initial: "G", name: "Grace A.", quote: "My boyfriend isn't emotional at all. He cried. That's all I needed." },
    { initial: "K", name: "Kevin H.", quote: "Sent it for our anniversary. She printed a screenshot and framed it." },
    { initial: "Z", name: "Zara N.", quote: "The mailbox opening nearly gave me a heart attack — in the best way." },
    { initial: "E", name: "Ethan C.", quote: "I've sent three now. One for my mom too. She called me crying." },
    { initial: "I", name: "Isabel V.", quote: "He asked if I hired someone to write it. I said no and he cried harder." },
    { initial: "O", name: "Omar J.", quote: "She screenshotted every line. Said she reads it when she misses me." },
    { initial: "F", name: "Faith T.", quote: "My partner said 'this is the most you' thing ever. I was so happy." },
    { initial: "B", name: "Ben Y.", quote: "Sent it at midnight on her birthday. She woke up and just called sobbing." },
  ];

  useEffect(() => {
    const id = setInterval(() => {
      setTestimonialIdx((i) => (i + 1) % TESTIMONIALS.length);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  // Live countdown — 2-day rolling urgency window
  useEffect(() => {
    const endDate = new Date(Date.now() + 2 * 86_400_000);
    const tick = () => {
      const diff = endDate.getTime() - Date.now();
      if (diff <= 0) { setSaleTimeLeft(""); return; }
      const d = Math.floor(diff / 86_400_000);
      const h = Math.floor((diff % 86_400_000) / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1_000);
      const mm = String(m).padStart(2, "0");
      const ss = String(s).padStart(2, "0");
      if (d > 0) setSaleTimeLeft(`${d}d ${h}:${mm}:${ss}`);
      else setSaleTimeLeft(`${h}:${mm}:${ss}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const handleSendClick = () => {
    if (getCurrentUser()) {
      setShowPaymentChoice(true);
    } else {
      setShowSignupGate(true);
    }
  };
  const [previewStage, setPreviewStage] = useState<PreviewStage>("mailbox");
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ytAudio = useYouTubeAudio(letterData.youtubeVideoId ?? null, 0.3);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  const handleBack = () => setShowExitIntent(true);

  const handleGCash = () => {
    setShowPaymentChoice(false);
    onGCashPay();
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
    if (template === "birthday") return;
    if (letterData.youtubeVideoId) {
      ytAudio.play();
      return;
    }

    const preset = getPresetById(letterData.selectedMusic);
    let src = preset?.url;
    if (!src) {
      if (!randomMusicRef.current) randomMusicRef.current = getRandomPresetUrl();
      src = randomMusicRef.current;
    }

    const resolvedSrc = new URL(src, window.location.href).href;
    if (audioRef.current && audioRef.current.src !== resolvedSrc) {
      audioRef.current.pause();
      audioRef.current = null;
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
      ytAudio.pause();
      return;
    }

    const handler = () => {
      startMusic();

      // YouTube's playVideo() is async (postMessage into the iframe), so we
      // can't check "did it actually start" synchronously like <audio> —
      // just stop retrying after the first genuine gesture triggers it once.
      const started = letterData.youtubeVideoId
        ? true
        : audioRef.current && !audioRef.current.paused;
      if (started) {
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
    setPreviewStage(template === "photo" || template === "birthday" ? "mailbox" : "envelope");
    setShowPreview(true);
  };
  const closePreview = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    ytAudio.pause();
    setShowPreview(false);
  };
  const advancePreview = () => {
    if (previewStage === "mailbox" && template === "birthday") {
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
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto mt-0 sm:mt-6"
      >
        <div className="text-center mb-1.5 sm:mb-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-2"
          >
            <Eye className="w-3 h-3 text-primary" />
            <span className="font-body text-xs text-primary tracking-wide">Preview & Pay</span>
          </motion.div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-0.5 sm:mb-1">
            Your Letter Awaits
          </h2>
          <p className="font-body text-xs sm:text-sm text-muted-foreground">
            Preview the experience, then send it with love
          </p>
        </div>

        {/* Preview Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="mb-2.5 sm:mb-4"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openPreview}
            className="w-full flex items-center justify-center gap-3 px-8 py-3 sm:py-4 rounded-2xl font-heading text-base sm:text-lg font-bold transition-all duration-400"
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

        {/* BACKUP — voice message (hidden, re-enable when ready)
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mb-2.5 sm:mb-8"
        >
          <VoiceRecorder audioBlob={voiceBlob} onChange={onVoiceChange} />
        </motion.div>
        */}

        {/* BACKUP — unlock date (hidden, re-enable when ready)
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32, duration: 0.5 }}
          className="mb-2.5 sm:mb-8"
        >
          <UnlockDatePicker unlockAt={unlockAt} onChange={onUnlockAtChange} />
        </motion.div>
        */}

        {/* Divider */}
        <div className="flex items-center gap-3 mb-2.5 sm:mb-4">
          <div className="flex-1 h-px bg-border/50" />
          <span className="font-body text-xs text-muted-foreground">and</span>
          <div className="flex-1 h-px bg-border/50" />
        </div>

        {/* Payment Section — premium light card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="relative rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(170deg, #ffffff 0%, hsl(30 60% 97%) 100%)",
            border: "1px solid hsl(40 60% 78% / 0.5)",
            boxShadow: "0 20px 60px hsl(340 60% 70% / 0.15), 0 4px 20px hsl(40 60% 60% / 0.1), inset 0 1px 0 hsl(0 0% 100%)",
          }}
        >
          <div className="px-6 sm:px-8 py-6 sm:py-7">

            {/* Sale pill */}
            <div className="flex justify-center mb-5">
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-body text-xs font-semibold tracking-wide"
                style={{
                  background: "hsl(40 90% 71% / 0.14)",
                  border: "1px solid hsl(40 80% 65% / 0.4)",
                  color: "hsl(35 70% 38%)",
                }}
              >
                <span>✦</span>
                <span>Limited Offer · 30% Off{saleTimeLeft ? ` · ${saleTimeLeft}` : ""}</span>
              </div>
            </div>

            {/* Price */}
            <div className="text-center mb-5">
              <div className="flex items-end justify-center gap-2 mb-1">
                <span
                  className="font-display text-5xl sm:text-6xl font-bold leading-none"
                  style={{ color: "hsl(340 40% 22%)" }}
                >
                  $9.99
                </span>
                <span className="font-body text-sm mb-2 text-muted-foreground">
                  USD{localizedPrice ? ` · ${localizedPrice}` : ""}
                </span>
              </div>
              <p className="font-body text-xs text-muted-foreground">
                <span className="line-through mr-1">$14.27</span>
                · One-time · Yours forever
              </p>
            </div>

            {/* Thin gold divider */}
            <div
              className="mb-5"
              style={{ height: 1, background: "linear-gradient(90deg, transparent, hsl(40 70% 70% / 0.6), transparent)" }}
            />

            {/* Features */}
            <div className="space-y-2.5 mb-5">
              {[
                "All templates included — love & birthday",
                "Custom music — upload or search any song",
                "Photos, voice notes & video reactions",
                "Vintage mailbox or 3D paper letter reveal",
                "Lifetime keepsake link, never expires",
                "Full refund if you're not satisfied",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      background: "hsl(40 90% 71% / 0.18)",
                      border: "1px solid hsl(40 80% 65% / 0.4)",
                    }}
                  >
                    <span style={{ color: "hsl(35 70% 40%)", fontSize: 8, lineHeight: 1 }}>✓</span>
                  </div>
                  <p className="font-body text-sm text-foreground">{item}</p>
                </div>
              ))}
            </div>

            {/* Thin gold divider */}
            <div
              className="mb-4"
              style={{ height: 1, background: "linear-gradient(90deg, transparent, hsl(40 70% 70% / 0.6), transparent)" }}
            />

            {/* Social proof — auto-rotating */}
            <div className="flex items-center gap-3 mb-5 px-1 min-h-[40px]">
              <div className="flex -space-x-1.5 shrink-0">
                {["S", "M", "A"].map((l, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-[9px]"
                    style={{
                      background: "hsl(340 60% 90%)",
                      border: "2px solid #fff",
                      color: "hsl(340 60% 45%)",
                    }}
                  >
                    {l}
                  </div>
                ))}
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="flex gap-px mb-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} style={{ color: "hsl(40 85% 55%)", fontSize: 10 }}>★</span>
                  ))}
                </div>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={testimonialIdx}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.35 }}
                    className="font-body text-xs text-muted-foreground leading-snug"
                  >
                    "{TESTIMONIALS[testimonialIdx].quote}"
                    {" "}<span className="text-foreground/70">— {TESTIMONIALS[testimonialIdx].name}</span>
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>

            {/* CTA */}
            <motion.button
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSendClick}
              className="w-full py-4 rounded-xl font-heading text-base font-bold text-primary-foreground transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, hsl(var(--primary)), hsl(340 90% 58%))",
                boxShadow: "0 8px 24px hsl(340 80% 60% / 0.32), inset 0 1px 0 hsl(0 0% 100% / 0.2)",
              }}
            >
              Send This Letter — $9.99
            </motion.button>

            <p className="mt-3 font-body text-xs text-muted-foreground text-center flex items-center justify-center gap-1.5">
              <Lock className="w-3 h-3" />
              Secure checkout · Instant access after payment
            </p>
          </div>
        </motion.div>



        <div className="mt-6 flex justify-start">
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleBack}
            className="px-6 py-3.5 bg-secondary text-secondary-foreground font-heading text-base font-semibold rounded-xl border border-border/50 transition-all duration-300 hover:shadow-card">
            ← Go Back
          </motion.button>
        </div>
      </motion.div>

      {/* Full-screen cinematic preview overlay */}
      <AnimatePresence>
        {showPreview && (
          <div style={{ position: "fixed", inset: 0, zIndex: 200 }}>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closePreview}
              className="fixed top-4 left-4 z-[210] inline-flex items-center gap-1.5 px-4 py-2 rounded-full font-body text-sm font-semibold text-white"
              style={{ background: "rgba(37, 31, 40, 0.78)", boxShadow: "0 8px 24px rgba(37, 31, 40, 0.2)" }}
            >
              ← Go back
            </motion.button>

            {/* Birthday mailbox */}
            {previewStage === "mailbox" && template === "birthday" && (
              <motion.div
                key="prev-mailbox-birthday"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "radial-gradient(ellipse at 50% 35%, #FFF9E6 0%, #FFF0B3 55%, #FFE082 100%)",
                }}
              >
                <Suspense fallback={null}>
                  <BirthdayMailbox className="w-full h-full" onContinue={advancePreview} />
                </Suspense>
              </motion.div>
            )}

            {/* Template 1 — full-screen mailbox, no decorative frame */}
            {previewStage === "mailbox" && template !== "birthday" && (
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

            {/* Birthday balloon stage */}
            {previewStage === "birthday-balloons" && (
              <BirthdayBalloons
                onComplete={advancePreview}
                letterText={letterData.letterText}
                images={previewImages}
                senderName={letterData.senderName}
                receiverName={letterData.receiverName}
              />
            )}

            {/* Envelope stage — purple/photo template */}
            {previewStage === "envelope" && template !== "paper3d" && (
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

            {/* Envelope stage — realistic 3D paper template */}
            {previewStage === "envelope" && template === "paper3d" && (
              <RealisticPaperLetter3D
                key="prev-paper3d"
                receiverName={letterData.receiverName}
                senderName={letterData.senderName}
                letterText={letterData.letterText}
                images={previewImages}
                onLetterOpen={startMusic}
                onContinue={closePreview}
              />
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
                <div className="flex items-center justify-center gap-2">
                  <span className="font-body text-sm text-muted-foreground line-through">$14.27</span>
                  <span className="font-display text-xl font-bold text-foreground">$9.99</span>
                  <span className="px-2 py-0.5 rounded-full bg-red-500 text-white font-body text-xs font-bold">30% OFF</span>
                </div>
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
                    <p className="font-heading text-base font-bold">Credit / Debit Card</p>
                    <p className="font-body text-xs opacity-90">Visa · Mastercard · Amex · Apple Pay · Google Pay</p>
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
                    <p className="font-body text-xs text-muted-foreground">For Philippines clients · GCash, bank, or any QR app · ₱149</p>
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

      {/* Exit intent overlay */}
      <AnimatePresence>
        {showExitIntent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[300] flex items-center justify-center px-4 bg-background/80 backdrop-blur-md"
            onClick={() => setShowExitIntent(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm letter-paper rounded-3xl p-7 text-center shadow-romantic border border-primary/15"
            >
              <p className="text-4xl mb-3">💌</p>
              <h3 className="font-display text-xl font-bold text-foreground mb-2">
                Your letter is ready
              </h3>
              <p className="font-body text-sm text-muted-foreground mb-6 leading-relaxed">
                {letterData.receiverName
                  ? `${letterData.receiverName} is waiting. Don't leave them hanging.`
                  : "Your letter is ready. Complete it now or it'll be saved as a draft."}
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setShowExitIntent(false);
                  handleSendClick();
                }}
                className="w-full py-3.5 rounded-xl font-heading text-base font-bold text-primary-foreground mb-3 transition-all"
                style={{
                  background: "linear-gradient(135deg, hsl(var(--primary)), hsl(340 90% 58%))",
                  boxShadow: "0 8px 24px hsl(340 80% 60% / 0.3)",
                }}
              >
                Complete My Letter — $9.99
              </motion.button>
              <button
                onClick={() => { setShowExitIntent(false); onBack(); }}
                className="w-full py-2.5 text-sm font-body text-muted-foreground hover:text-foreground transition-colors"
              >
                Go back and make changes
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <SignupGate
        isOpen={showSignupGate}
        onClose={() => setShowSignupGate(false)}
        onSuccess={() => {
          setShowSignupGate(false);
          setShowPaymentChoice(true);
        }}
      />
    </>
  );
};

export default PreviewPayment;
