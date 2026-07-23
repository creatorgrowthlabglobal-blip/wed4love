import { Suspense, useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { PenLine, Heart, Sparkles, Music, Bell, Link as LinkIcon, Check, Mail, Mailbox, X, Mic, Video, Lock, Eye, Gem, BookOpen, ArrowRight, Play, Cake, ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import TestimonialsMarquee from "@/components/TestimonialsMarquee";
import FloatingHearts from "@/components/FloatingHearts";
import EnvelopeReveal from "@/components/viewer/EnvelopeReveal";
import RealisticMailbox from "@/components/viewer/RealisticMailbox";
import PurpleMailbox from "@/components/viewer/PurpleMailbox";
import RealisticPaperLetter3D from "@/components/viewer/RealisticPaperLetter3D";
import BirthdayMailbox from "@/components/viewer/BirthdayMailbox";
import BirthdayBalloons from "@/components/viewer/BirthdayBalloons";
import ReactionCapture from "@/components/viewer/ReactionCapture";
import FramedScene from "@/components/viewer/FramedScene";
import Footer from "@/components/Footer";


import mailboxClosed from "@/assets/mailbox-closed.jpg";
import mailboxOpen from "@/assets/mailbox-open.jpg";
import birthdayMailboxClosed from "@/assets/birthday-mailbox-closed.png";
import heroBg from "@/assets/hero-bg.jpg";
import heroPolaroid from "@/assets/photo1.jpg";
import howItWorksPhoto from "@/assets/photo2.jpg";
import { useLocalizedPrice } from "@/hooks/useLocalizedPrice";
import { MUSIC_PRESETS } from "@/lib/musicPresets";

type Template = "photo" | "purple" | "paper3d" | "birthday";
type PreviewStage = "mailbox" | "envelope" | "features" | "birthday-balloons";
type PickerCategory = "love" | "birthday" | null;

const SAMPLE_LETTER_TEXT =
  "Every time your name lights up my phone, I still feel that same flutter I did on our very first date. This is just a small, unfinished proof of something big — that I love the life we're building, one ordinary Tuesday at a time.";
const SAMPLE_MUSIC_URL = MUSIC_PRESETS.find((m) => m.id === "honeymoon-avenue")?.url ?? MUSIC_PRESETS[0].url;

const FEATURE_HIGHLIGHTS = [
  { icon: BookOpen, title: "3D Fold-Open Letter", desc: "A realistic paper letter that unfolds in full 3D — not just a flat card.", premium: true },
  { icon: Mic, title: "Voice Messages", desc: "Attach a short voice note they can play right inside the letter.", premium: true },
  { icon: Music, title: "Any Song, Instantly", desc: "Search YouTube for any track, or pick from our curated collection.", premium: false },
  { icon: Video, title: "Reactions", desc: "They can film a reaction the moment they finish reading — try it below.", premium: false },
  { icon: Lock, title: "Locked & Scheduled", desc: "Lock it until midnight, a birthday, or an anniversary with a countdown reveal.", premium: true },
  { icon: Eye, title: "Read Receipts", desc: "Get a quiet notification the moment they open your letter.", premium: true },
];

const Index = () => {
  const [showPreview, setShowPreview] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [pickerCategory, setPickerCategory] = useState<PickerCategory>(null);
  const [template, setTemplate] = useState<Template>("photo");
  const [previewStage, setPreviewStage] = useState<PreviewStage>("mailbox");
  const localizedPrice = useLocalizedPrice(4.99);
  const sampleAudioRef = useRef<HTMLAudioElement | null>(null);

  const playSampleMusic = () => {
    if (!sampleAudioRef.current) {
      const audio = new Audio(SAMPLE_MUSIC_URL);
      audio.loop = true;
      audio.volume = 0.3;
      sampleAudioRef.current = audio;
    }
    sampleAudioRef.current.play().catch(() => {});
  };
  const stopSampleMusic = () => {
    sampleAudioRef.current?.pause();
    if (sampleAudioRef.current) sampleAudioRef.current.currentTime = 0;
  };

  // Warm both mailbox frames into cache the moment the landing page mounts,
  // so the preview opens with zero network wait.
  useEffect(() => {
    [mailboxClosed, mailboxOpen].forEach((src) => {
      const img = new Image();
      img.decoding = "async";
      img.src = src;
    });
  }, []);


  const openPreview = () => {
    setPickerCategory(null);
    setShowTemplatePicker(true);
  };
  const startPreviewWith = (t: Template) => {
    setTemplate(t);
    setShowTemplatePicker(false);
    setPickerCategory(null);
    if (t === "birthday") {
      setPreviewStage("mailbox");
    } else {
      setPreviewStage(t === "photo" ? "mailbox" : "envelope");
    }
    setShowPreview(true);
  };
  const advanceToFeatures = () => setPreviewStage("features");
  const closePreview = () => {
    setShowPreview(false);
    stopSampleMusic();
  };
  const backToTemplatePicker = () => {
    setShowPreview(false);
    stopSampleMusic();
    setPickerCategory(template === "birthday" ? "birthday" : "love");
    setShowTemplatePicker(true);
  };
  const closePicker = () => {
    setShowTemplatePicker(false);
    setPickerCategory(null);
  };
  return (
    <div className="min-h-screen bg-background">
      {!showPreview && !showTemplatePicker && <Header />}
      <FloatingHearts count={6} />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-40 sm:pt-40 pb-20 sm:pb-28">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-[hsl(350_100%_96%)] to-background" />

        {/* Floating sparkle decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[
            { left: "8%", top: "18%", size: 12, delay: 0 },
            { left: "44%", top: "8%", size: 10, delay: 1.2 },
            { left: "5%", top: "70%", size: 14, delay: 2 },
          ].map((s, i) => (
            <motion.div
              key={i}
              className="absolute text-primary/20"
              style={{ left: s.left, top: s.top }}
              animate={{ opacity: [0.15, 0.5, 0.15], scale: [0.8, 1.2, 0.8], rotate: [0, 180, 360] }}
              transition={{ duration: 5, repeat: Infinity, delay: s.delay }}
            >
              <Sparkles style={{ width: s.size, height: s.size }} />
            </motion.div>
          ))}
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="grid lg:grid-cols-[1.05fr_1fr] gap-16 lg:gap-12 items-center">
            {/* Copy column */}
            <div className="text-center lg:text-left">
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="font-body text-xs tracking-[0.2em] uppercase text-primary font-semibold mb-5"
              >
                For the ones who matter — and the things left unsaid
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-[1.05] mb-6"
              >
                Memories they'll keep.{" "}
                <span className="font-handwritten text-primary italic font-normal text-[1.1em]">
                  Confessions you finally make.
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="font-body text-base sm:text-lg text-muted-foreground mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed"
              >
                Send a keepsake letter with photos & music,
                or drop an anonymous confession — they'll never know it was you.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.45 }}
                className="flex flex-col items-center lg:items-start gap-3"
              >
                <Link
                  to="/create-letter"
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-primary to-[hsl(340_90%_65%)] text-primary-foreground font-display text-base sm:text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-400 hover:scale-[1.04] active:scale-[0.97]"
                  style={{
                    boxShadow: "0 8px 30px hsl(340 100% 76% / 0.35), 0 4px 12px hsl(340 80% 60% / 0.2)",
                  }}
                >
                  <Heart className="w-5 h-5 fill-current" />
                  Create a Letter
                </Link>

                <div className="flex flex-col items-center lg:items-start gap-2 mt-2">
                  <p className="font-body text-sm text-muted-foreground">
                    Letter <strong className="text-foreground">$4.99</strong>
                    {" "}· one-time payment
                  </p>
                  <button
                    onClick={openPreview}
                    className="group relative inline-flex items-center gap-2 px-4 py-2 rounded-full font-body text-sm font-semibold transition-all duration-300 hover:scale-[1.04] active:scale-[0.97]"
                    style={{
                      background: "linear-gradient(135deg, hsl(340 80% 96%), hsl(280 60% 95%), hsl(40 80% 94%))",
                      border: "1px solid hsl(340 60% 85%)",
                      color: "hsl(340 60% 45%)",
                      boxShadow: "0 2px 12px hsl(340 80% 70% / 0.18), inset 0 1px 0 hsl(0 0% 100% / 0.8)",
                    }}
                  >
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/15 group-hover:bg-primary/25 transition-colors">
                      <Play className="w-2.5 h-2.5 text-primary fill-primary" />
                    </span>
                    Preview the experience
                    <span className="text-primary/50 group-hover:translate-x-0.5 transition-transform duration-300">→</span>
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Image column */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.25 }}
              className="relative mx-auto max-w-sm lg:max-w-none"
            >
              <div
                className="rounded-3xl overflow-hidden border border-primary/10"
                style={{ boxShadow: "0 20px 60px hsl(340 60% 70% / 0.25), 0 4px 16px hsl(0 0% 0% / 0.06)" }}
              >
                <img
                  src={heroBg}
                  alt="Handwritten love letters with roses on a writing desk"
                  className="w-full h-[340px] sm:h-[420px] lg:h-[480px] object-cover"
                />
              </div>

              {/* Floating polaroid accent */}
              <motion.div
                initial={{ opacity: 0, y: 20, rotate: -6 }}
                animate={{ opacity: 1, y: 0, rotate: -6 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="hidden sm:block absolute -bottom-8 -left-8 w-32 lg:w-40 bg-white p-2 pb-4 rounded-sm"
                style={{ boxShadow: "0 12px 30px hsl(0 0% 0% / 0.18)" }}
              >
                <img src={heroPolaroid} alt="" className="w-full aspect-[3/4] object-cover rounded-[2px]" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Scrolling testimonials */}
      <div className="text-center pt-4 pb-2">
        <p className="font-body text-xs tracking-[0.2em] uppercase text-primary/70 font-semibold">
          Loved by hopeless romantics everywhere
        </p>
      </div>
      <TestimonialsMarquee className="pb-16 sm:pb-20" />

      {/* How It Works */}
      <section className="py-24 sm:py-32 lg:py-40 px-4 sm:px-6 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            {/* Steps column */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="mb-12"
              >
                <p className="font-body text-xs tracking-[0.2em] uppercase text-primary font-semibold mb-2">
                  How It Works
                </p>
                <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight">
                  Three Steps to{" "}
                  <span className="text-primary italic">Create Your Letter</span>
                </h2>
              </motion.div>

              <div className="space-y-10">
                {[
                  {
                    step: "01",
                    icon: PenLine,
                    title: "Write Your Letter",
                    desc: "Pour your heart into a beautiful letter — add photos, a voice message, and choose from three designs, including a fully 3D fold-open paper letter.",
                  },
                  {
                    step: "02",
                    icon: Music,
                    title: "Add Your Song",
                    desc: "Search any song on YouTube or pick from our curated collection — it plays the moment they open your letter.",
                  },
                  {
                    step: "03",
                    icon: Bell,
                    title: "Share the Magic",
                    desc: "Get a unique link, or lock it until a special date with a countdown reveal. Know the moment they open it, and watch them send a reaction back.",
                  },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15, duration: 0.6 }}
                    className="flex items-start gap-5"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                      <item.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-body text-xs text-primary font-bold tracking-wider mb-1">
                        Step {item.step}
                      </p>
                      <h3 className="font-display text-xl font-bold text-foreground mb-1.5">
                        {item.title}
                      </h3>
                      <p className="font-body text-sm text-muted-foreground leading-relaxed max-w-sm">
                        {item.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Fun fact callout */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="mt-12"
              >
                <div className="inline-flex items-start gap-2 px-5 py-3 rounded-xl bg-primary/5 border border-primary/10">
                  <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <p className="font-body text-sm text-muted-foreground text-left">
                    <strong className="text-foreground">Fun fact:</strong> Every letter arrives in a beautiful vintage mailbox, opens into a handwritten note with your photos, and plays your chosen song — and premium letters can add a real 3D unfold, a voice message, and a locked countdown reveal.
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Image column */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="rounded-3xl overflow-hidden border border-primary/10 order-first lg:order-last"
              style={{ boxShadow: "0 20px 60px hsl(340 60% 70% / 0.2), 0 4px 16px hsl(0 0% 0% / 0.06)" }}
            >
              <img
                src={howItWorksPhoto}
                alt="A handwritten letter with rose petals and a gold locket"
                className="w-full h-[320px] sm:h-[420px] lg:h-[540px] object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 bg-gradient-to-b from-background to-[hsl(350_60%_98%)]">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <p className="font-body text-xs tracking-[0.2em] uppercase text-primary font-semibold mb-2">
              What's Inside
            </p>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight">
              Every letter, made to feel{" "}
              <span className="text-primary italic">unforgettable</span>
            </h2>
            <p className="font-body text-sm text-muted-foreground mt-3 max-w-md mx-auto">
              A few taps away from real 3D paper, your own voice, and a reaction they'll send right back.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURE_HIGHLIGHTS.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="rounded-2xl p-5 sm:p-6 bg-white/70 border border-primary/10 relative"
                style={{ boxShadow: "0 8px 24px hsl(340 40% 70% / 0.1)" }}
              >
                {f.premium && (
                  <span className="absolute top-4 right-4 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-elegant-gold/15 text-elegant-gold font-body text-[9px] font-bold uppercase tracking-wide">
                    <Sparkles className="w-2.5 h-2.5" />
                    Premium
                  </span>
                )}
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display text-base font-bold text-foreground mb-1.5 pr-16">{f.title}</h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-center mt-10"
          >
            <button
              onClick={openPreview}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-primary/20 shadow-md text-sm font-body font-semibold text-foreground hover:bg-primary hover:text-primary-foreground hover:shadow-lg hover:scale-[1.03] active:scale-[0.97] transition-all duration-300"
            >
              <Mail className="w-4 h-4" />
              See it all in the live preview
            </button>
          </motion.div>
        </div>
      </section>


      {/* Pricing Section */}
      <section id="pricing" className="py-24 sm:py-32 lg:py-40 px-4 sm:px-6 bg-gradient-to-b from-background to-[hsl(350_100%_97%)]">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <p className="font-body text-xs tracking-[0.2em] uppercase text-primary font-semibold mb-2">
              Simple Pricing
            </p>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight">
              A keepsake that says it best —{" "}
              <span className="text-primary italic">unforgettable</span>
            </h2>
            <p className="font-body text-sm text-muted-foreground mt-3 max-w-md mx-auto">
              A keepsake letter built to be unforgettable.
            </p>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-primary/20 shadow-md text-sm font-body font-semibold text-foreground hover:bg-primary hover:text-primary-foreground hover:shadow-lg hover:scale-[1.03] active:scale-[0.97] transition-all duration-300"
            >
              ← Back to top
            </button>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 max-w-md mx-auto">
            {/* Letter card */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="letter-paper rounded-3xl p-8 text-center relative overflow-hidden flex flex-col"
            >
              <div className="absolute top-4 right-4">
                <span className="font-body text-xs font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full">
                  Keepsake
                </span>
              </div>
              <p className="font-display text-lg font-bold text-foreground mb-1">The Grand Gesture</p>
              <p className="font-body text-sm text-muted-foreground mb-3">One-time payment</p>
              <p className="font-display text-5xl font-bold text-foreground mb-1">
                $4.99
              </p>
              <p className="font-body text-xs text-muted-foreground mb-6">Yours forever — no subscriptions</p>

              <ul className="space-y-3 text-left max-w-xs mx-auto mb-8 flex-1">
                {[
                  { icon: LinkIcon, text: "Shareable unique link" },
                  { icon: BookOpen, text: "3D fold-open paper letter, or vintage mailbox reveal" },
                  { icon: Heart, text: "Handwritten letter with your photos" },
                  { icon: Music, text: "Any song, searched or curated" },
                  { icon: Video, text: "Recipient can send a reaction back" },
                  { icon: Heart, text: "Lifetime keepsake link" },
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 font-body text-sm text-foreground">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    {f.text}
                  </li>
                ))}
              </ul>

              <Link
                to="/create-letter"
                className="inline-flex items-center justify-center gap-2 w-full px-8 py-4 rounded-full bg-gradient-to-r from-primary to-[hsl(340_90%_65%)] text-primary-foreground font-display text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.97]"
                style={{ boxShadow: "0 8px 24px hsl(340 100% 76% / 0.3)" }}
              >
                Create Your Letter
              </Link>

              {/* Trust signals */}
              <div className="mt-6 flex flex-col items-center gap-2.5">
                <div className="flex items-center gap-2 font-body text-xs text-muted-foreground">
                  <span>🛡️</span>
                  <span>If they never open it, we'll refund you — no questions asked.</span>
                </div>
                <div className="flex items-center gap-2 font-body text-xs text-muted-foreground">
                  <span>💌</span>
                  <span>Over <strong className="text-foreground">1,200 letters</strong> sent this month</span>
                </div>
                <div className="flex items-center gap-2 font-body text-xs text-muted-foreground">
                  <span>🔒</span>
                  <span>Visa · Mastercard · Apple Pay · Google Pay · GCash</span>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* Envelope preview overlay */}
      <AnimatePresence>
        {showPreview && (
          <>
            <motion.button
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              onClick={backToTemplatePicker}
              className="fixed top-4 left-4 z-[9999] flex items-center gap-2 px-4 py-2.5 rounded-full font-body text-sm font-semibold text-gray-800"
              style={{ background: "#ffffff", boxShadow: "0 2px 12px rgba(0,0,0,0.15)" }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </motion.button>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closePreview}
              className="fixed top-4 right-4 z-[9999] w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(37, 31, 40, 0.72)",
                boxShadow: "0 8px 24px rgba(37, 31, 40, 0.16)",
              }}
              aria-label="Close preview"
            >
              <X className="w-5 h-5 text-white" />
            </motion.button>
            {previewStage === "mailbox" && template === "purple" && (
              <FramedScene key="p-mailbox-purple">
                <Suspense fallback={null}>
                  <PurpleMailbox
                    className="w-full h-full"
                    onContinue={() => setPreviewStage("envelope")}
                  />
                </Suspense>
              </FramedScene>
            )}
            {previewStage === "mailbox" && template === "birthday" && (
              <motion.div
                key="p-mailbox-birthday"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                style={{
                  position: "fixed",
                  inset: 0,
                  zIndex: 60,
                  background: "radial-gradient(ellipse at 50% 35%, #FFF9E6 0%, #FFF0B3 55%, #FFE082 100%)",
                }}
              >
                <Suspense fallback={null}>
                  <BirthdayMailbox
                    className="w-full h-full"
                    onContinue={() => setPreviewStage("birthday-balloons")}
                  />
                </Suspense>
              </motion.div>
            )}
            {previewStage === "birthday-balloons" && (
              <BirthdayBalloons
                key="p-birthday-balloons"
                onComplete={advanceToFeatures}
                letterText="Wishing you a day filled with joy, laughter, and all the things that make you smile. You deserve every bit of happiness this world has to offer. Here's to you on your special day! 🎂"
                senderName="From the heart"
                receiverName="You"
              />
            )}
            {previewStage === "mailbox" && template !== "purple" && template !== "birthday" && (
              <motion.div
                key="p-mailbox-photo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                style={{
                  position: "fixed",
                  inset: 0,
                  zIndex: 60,
                  background: "radial-gradient(ellipse at 50% 35%, #FDF1F5 0%, #F6DCE5 55%, #EFC9D6 100%)",
                }}
              >
                <Suspense fallback={null}>
                  <RealisticMailbox
                    className="w-full h-full"
                    onContinue={() => setPreviewStage("envelope")}
                  />
                </Suspense>
              </motion.div>
            )}
            {previewStage === "envelope" && template === "paper3d" && (
              <RealisticPaperLetter3D
                key="p-envelope-paper3d"
                receiverName="Someone Special"
                senderName="You"
                letterText={SAMPLE_LETTER_TEXT}
                images={[heroPolaroid, howItWorksPhoto]}
                onLetterOpen={playSampleMusic}
                onContinue={advanceToFeatures}
              />
            )}
            {previewStage === "envelope" && template !== "paper3d" && (
              <FramedScene key="p-envelope">
                <EnvelopeReveal
                  receiverName="Someone Special"
                  senderName="You"
                  letterText={SAMPLE_LETTER_TEXT}
                  images={[heroPolaroid, howItWorksPhoto]}
                  onLetterOpen={playSampleMusic}
                  onContinue={advanceToFeatures}
                />
              </FramedScene>
            )}
            {previewStage === "features" && (
              <motion.div
                key="p-features"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                style={{
                  position: "fixed",
                  inset: 0,
                  zIndex: 50,
                  overflowY: "auto",
                  background: "radial-gradient(ellipse at 50% 0%, #FBF3E6 0%, #F4E8D2 60%, #ECDCC0 100%)",
                }}
              >
                <div className="max-w-lg mx-auto px-5 sm:px-6 py-20 sm:py-24">
                  <p className="font-body text-xs tracking-[0.2em] uppercase text-primary font-semibold mb-2 text-center">
                    And That's Just The Start
                  </p>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-8 text-center">
                    Everything your letter can do
                  </h2>

                  <div className="space-y-3 mb-10">
                    {FEATURE_HIGHLIGHTS.map((f) => (
                      <div
                        key={f.title}
                        className="flex items-start gap-3.5 p-4 rounded-2xl bg-white/70 border border-primary/10"
                      >
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <f.icon className="w-4.5 h-4.5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-display text-sm font-bold text-foreground">{f.title}</h3>
                            {f.premium && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-elegant-gold/15 text-elegant-gold font-body text-[9px] font-bold uppercase tracking-wide">
                                <Sparkles className="w-2.5 h-2.5" />
                                Premium
                              </span>
                            )}
                          </div>
                          <p className="font-body text-xs text-muted-foreground mt-0.5 leading-relaxed">{f.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-2xl bg-white/70 border border-primary/10 p-5 sm:p-6">
                    <p className="font-display text-base font-bold text-foreground text-center mb-1">
                      Try the reaction camera 🎥
                    </p>
                    <p className="font-body text-xs text-muted-foreground text-center mb-2">
                      Nothing you record here is saved or sent — it's just a taste of what they'll get to do.
                    </p>
                    <ReactionCapture letterId="landing-preview-demo" demoMode />
                  </div>

                  <Link
                    to="/create-letter"
                    onClick={closePreview}
                    className="mt-8 inline-flex items-center justify-center gap-2 w-full px-8 py-4 rounded-full bg-gradient-to-r from-primary to-[hsl(340_90%_65%)] text-primary-foreground font-display text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.97]"
                  >
                    Start My Letter
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>

      {/* Template picker */}
      <AnimatePresence>
        {showTemplatePicker && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4"
            style={{ background: "rgba(40,28,55,0.55)", backdropFilter: "blur(6px)" }}
            onClick={closePicker}
          >
            <motion.div
              initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
              transition={{ type: "spring", stiffness: 220, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl rounded-3xl p-4 sm:p-8 max-h-[90vh] overflow-y-auto"
              style={{ background: "linear-gradient(180deg,#FBF4E4,#F4E9D0)", boxShadow: "0 20px 60px rgba(90,70,120,0.25)" }}
            >
              <AnimatePresence mode="wait">

                {/* Step 1: Category */}
                {pickerCategory === null && (
                  <motion.div key="picker-category" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                    <div className="text-center mb-5 sm:mb-6">
                      <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-1">Preview the experience</h3>
                      <p className="font-body text-xs sm:text-sm text-muted-foreground">What kind of letter do you want to preview?</p>
                    </div>
                    <div className="flex flex-col gap-3 max-w-sm mx-auto">
                      <motion.button
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        onClick={() => setPickerCategory("love")}
                        className="group w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 text-left transition-all duration-200"
                        style={{ borderColor: "hsl(var(--primary) / 0.25)", background: "hsl(var(--primary) / 0.06)" }}
                      >
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                          style={{ background: "hsl(var(--primary) / 0.14)" }}>
                          <span className="text-xl">💌</span>
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-display text-base font-bold text-foreground">Love Letter</p>
                          <p className="font-body text-xs text-muted-foreground mt-0.5">3D Mailbox · Realistic Paper · Premium Envelope</p>
                        </div>
                        <ArrowLeft className="w-4 h-4 text-primary opacity-60 group-hover:opacity-100 rotate-180 transition-all duration-200 flex-shrink-0" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        onClick={() => setPickerCategory("birthday")}
                        className="group w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 text-left transition-all duration-200"
                        style={{ borderColor: "#D4802A30", background: "#FEF9EE" }}
                        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#D4802A80")}
                        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#D4802A30")}
                      >
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                          style={{ background: "#FEF3C7" }}>
                          <span className="text-xl">🎂</span>
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-display text-base font-bold text-foreground">Birthday Letter</p>
                          <p className="font-body text-xs text-muted-foreground mt-0.5">Balloon pop · Festive reveal · Birthday Exclusive</p>
                        </div>
                        <ArrowLeft className="w-4 h-4 opacity-60 group-hover:opacity-100 rotate-180 transition-all duration-200 flex-shrink-0" style={{ color: "#D4802A" }} />
                      </motion.button>
                    </div>
                    <div className="mt-5 flex justify-end">
                      <button onClick={closePicker} className="px-5 py-2 rounded-xl font-body text-sm text-muted-foreground hover:text-foreground transition">
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Step 2a: Love templates */}
                {pickerCategory === "love" && (
                  <motion.div key="picker-love" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                    <div className="mb-4 sm:mb-5">
                      <button onClick={() => setPickerCategory(null)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-body text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors mb-3"
                        style={{ background: "rgba(0,0,0,0.07)" }}>
                        <ArrowLeft className="w-3.5 h-3.5" /> Back
                      </button>
                      <div className="text-center">
                        <h3 className="font-display text-lg sm:text-2xl font-bold text-foreground mb-1">💌 Love Letter</h3>
                        <p className="font-body text-xs sm:text-sm text-muted-foreground">Pick a template to preview</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <motion.button whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}
                        onClick={() => startPreviewWith("paper3d")}
                        className="rounded-2xl overflow-hidden text-left border-2 transition-all relative"
                        style={{ borderColor: "rgba(212,175,55,0.5)", background: "#fff" }}>
                        <div className="absolute top-1.5 right-1.5 z-10 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-elegant-gold/90 text-white font-body text-[8px] font-bold uppercase tracking-wide">
                          <Sparkles className="w-2 h-2" /> Premium
                        </div>
                        <div className="aspect-[4/3] flex items-center justify-center"
                          style={{ background: "radial-gradient(ellipse at 50% 40%, #FDF1F5 0%, #F6DCE5 60%, #EFC9D6 100%)" }}>
                          <span className="text-3xl">📜</span>
                        </div>
                        <div className="p-2">
                          <p className="font-display text-xs font-bold text-foreground leading-tight">Realistic Paper</p>
                          <p className="font-display text-[10px] font-semibold text-primary">Fold-Open 3D</p>
                        </div>
                      </motion.button>
                      <motion.button whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}
                        onClick={() => startPreviewWith("photo")}
                        className="rounded-2xl overflow-hidden text-left border-2 transition-all"
                        style={{ borderColor: "rgba(0,0,0,0.08)", background: "#fff" }}>
                        <div className="aspect-[4/3] bg-cover bg-center" style={{ backgroundImage: `url(${mailboxClosed})` }} />
                        <div className="p-2">
                          <p className="font-display text-xs font-bold text-foreground leading-tight">3D Mailbox</p>
                          <p className="font-display text-[10px] font-semibold text-primary">Lavender Garden</p>
                        </div>
                      </motion.button>
                      <motion.button whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}
                        onClick={() => startPreviewWith("purple")}
                        className="rounded-2xl overflow-hidden text-left border-2 transition-all"
                        style={{ borderColor: "rgba(0,0,0,0.08)", background: "#fff" }}>
                        <div className="aspect-[4/3] relative overflow-hidden bg-[hsl(350_100%_96%)]">
                          <img src="/envelope-preview.png" alt="Envelope preview"
                            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center center" }} />
                        </div>
                        <div className="p-2">
                          <p className="font-display text-xs font-bold text-foreground leading-tight">Premium Envelope</p>
                          <p className="font-display text-[10px] font-semibold text-primary">Rose Classic</p>
                        </div>
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {/* Step 2b: Birthday template */}
                {pickerCategory === "birthday" && (
                  <motion.div key="picker-birthday" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                    <div className="mb-4 sm:mb-5">
                      <button onClick={() => setPickerCategory(null)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-body text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors mb-3"
                        style={{ background: "rgba(0,0,0,0.07)" }}>
                        <ArrowLeft className="w-3.5 h-3.5" /> Back
                      </button>
                      <div className="text-center">
                        <h3 className="font-display text-lg sm:text-2xl font-bold text-foreground mb-1">🎂 Birthday Letter</h3>
                        <p className="font-body text-xs sm:text-sm text-muted-foreground">Preview the birthday experience</p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}
                      onClick={() => startPreviewWith("birthday")}
                      className="w-full rounded-2xl overflow-hidden text-left border-2 transition-all"
                      style={{ borderColor: "#D4802A40", background: "#fff" }}
                    >
                      <div className="w-full aspect-[16/7] bg-cover bg-center" style={{ backgroundImage: `url(${birthdayMailboxClosed})` }} />
                      <div className="p-4 sm:p-5">
                        <div className="inline-flex items-center gap-1.5 mb-2 px-2.5 py-1 rounded-full border border-amber-200/70 bg-amber-50">
                          <Cake className="w-3 h-3" style={{ color: "#D4802A" }} />
                          <span className="font-body text-[10px] font-bold uppercase tracking-widest" style={{ color: "#D4802A" }}>Birthday Exclusive</span>
                        </div>
                        <p className="font-display text-base sm:text-lg font-bold text-foreground mb-1">Birthday Mailbox</p>
                        <p className="font-body text-sm text-muted-foreground leading-relaxed">
                          A festive mailbox reveal, a balloon pop game, and a heartfelt personal letter — all in one magical birthday experience.
                        </p>
                        <div className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-body text-sm font-semibold text-white"
                          style={{ background: "#D4802A" }}>
                          <Play className="w-3.5 h-3.5 fill-current" /> Preview Now
                        </div>
                      </div>
                    </motion.button>
                  </motion.div>
                )}

              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <Footer />
    </div>
  );
};

export default Index;
